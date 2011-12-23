Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.LayerStore = Ext.extend(Ext.data.GroupingStore, {
	gpxMap: undefined
	, constructor: function(config) {
		config = config || {};

		this.LOCALES = GPXEditor1_1.data.LayerStore.LOCALES;

		if (! (this.gpxMap instanceof GPXEditor1_1.GPXMap))
			this.gpxMap = new GPXEditor1_1.GPXMap();

		Ext.apply(config, {
			reader: new Ext.data.JsonReader(
				{
					idProperty: 'id'
					, root: 'layers'
					, totalProperty: 'totalCount'
				}, GPXEditor1_1.data.LayerRecord
			)
			, sortInfo: {field: 'zone', direction: 'ASC'}
			, groupField: 'provider'
		});

		GPXEditor1_1.data.LayerStore.superclass.constructor.call(this, config);

		this.loadByLayerById(config.layerId);
		delete config.layerId
	}
	, loadByLayerById: function(identifier) {
		var ret = [];
		var search = {
			provider: '*'
			, zone: '*'
			, type: '*'
		};

		/* modify search by given identifier */
		var parts = identifier ? identifier.split('-') : [];
		if (parts.length > 0)
			search.provider = parts[0];
		if (parts.length > 1)
			search.zone = parts[1];
		if (parts.length > 2)
			search.type = parts[2];

		/* do selection */
		for (var i = 0, len = GPXEditor1_1.data.LayerStore.LAYERS_ID.length; i < len; i++) {
			var lIdParts = GPXEditor1_1.data.LayerStore.LAYERS_ID[i].split('-');
			var add = true;
			if (search.provider != '*' && search.provider != lIdParts[0])
				add = false;
			else if (search.zone != '*' && search.zone != lIdParts[1])
				add = false;
			else if (search.type != '*' && search.type != lIdParts[2])
				add = false;
			if (add) {
				var id = GPXEditor1_1.data.LayerStore.LAYERS_ID[i];
				var record = this.getById(id);
				if (! record) {
					var layer = null;
					switch (lIdParts[0]) {
						case GPXEditor1_1.data.LayerStore.PROVIDERS.OSM:
							layer = this._createOSMLayer(id, lIdParts[0], lIdParts[1], lIdParts[2]);
							break;
						case GPXEditor1_1.data.LayerStore.PROVIDERS.GOOGLEMAP:
							layer = this._createGoogleMapLayer(id, lIdParts[0], lIdParts[1], lIdParts[2]);
							break;
						case GPXEditor1_1.data.LayerStore.PROVIDERS.IGNF:
							layer = this._createIgnfLayer(id, lIdParts[0], lIdParts[1], lIdParts[2]);
							break;
					}
					if (layer) {
						record = new this.recordType(
							{
								layer: layer
								, title: layer.title
								, id: id
								, provider: lIdParts[0]
								, zone: lIdParts[1]
								, type: lIdParts[2]
								, orderNum: i
								, active: false
							}
							, id
						);
					}
				}
				if (record) {
					this.add([record]);
					ret.push(record);
					this.gpxMap.getMap().addLayer(record.layer);
				}
			}
		}

		return ret;
	}
	, _getLayerName: function(provider, zone, type) {
		return provider + ' ' + zone + ' ' + type;
	}
	, _createOSMLayer: function(id, provider, zone, type) {
		return new OpenLayers.Layer.OSM(
			this._getLayerName(
				this.LOCALES['LAYER_PROVIDER_OSM']
				, this.LOCALES['LAYER_ZONE_WORLD']
				, this.LOCALES['LAYER_TYPE_' + type]
			)
			, 'http://tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png'
			, {
				isBaseLayer: true
				, projection: new OpenLayers.Projection('EPSG:900913')
				, sphericalMercator: true
				, maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508)
				, numZoomLevels: 18
				, maxResolution: 156543.0339
			}
		);
	}
	, _createGoogleMapLayer: function(id, provider, zone, type) {
		if (! window.GScript) {
			console.warn('Can\'t add google layers whithout google api loaded');
			return null;
		}
		var options = {
			isBaseLayer: true
			, projection: new OpenLayers.Projection('EPSG:900913')
			, sphericalMercator: true
			, maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508)
		};
		switch (type) {
			case GPXEditor1_1.data.LayerStore.LAYER_TYPE.TOPO:
				options.type = G_PHYSICAL_MAP;
				break;
			case GPXEditor1_1.data.LayerStore.LAYER_TYPE.SAT:
				options.type = G_SATELLITE_MAP;
				break;
		}
		return new OpenLayers.Layer.Google(
			this._getLayerName(
				this.LOCALES['LAYER_PROVIDER_OSM']
				, this.LOCALES['LAYER_ZONE_WORLD']
				, this.LOCALES['LAYER_TYPE_' + type]
			)
			, options
		);
	}
	, _createIgnfLayer: function(id, provider, zone, type) {
		var cat = this.gpxMap ? this.gpxMap.getMap().getIGNFCatalogue() : null;
		if (! window.gGEOPORTALRIGHTSMANAGEMENT || ! this.gpxMap || ! cat) {
			console.warn('Can\'t add ignf layers whithout ign api loaded with valid key');
			return null;
		}
		var t = cat.getTerritory(zone);
		if (! t)
			return null;
		var ignlid = null;
		if (type == GPXEditor1_1.data.LayerStore.LAYER_TYPE.TOPO)
			ignlid = 'GEOGRAPHICALGRIDSYSTEMS.MAPS';
		else if (type = GPXEditor1_1.data.LayerStore.LAYER_TYPE.SAT)
			ignlid = 'ORTHOIMAGERY.ORTHOPHOTOS';
		var lp = cat.getLayerParameters(t, ignlid);
		if (! lp)
			return null;
		lp.options.isBaseLayer = true;
		lp.options.opacity = 1.0;
		lp.options.alwaysInRange = true;
		//if (lc.maxZoomLevel) /* WARN */
		//	lp.options.maxZoomLevel = lc.maxZoomLevel;
		if ('originators' in lp.options) {
			for (var i = 0; i <  lp.options.originators.length; i++) {
				var o = lp.options.originators[i];
				if (o.minZoomLevel)
					o.minZoomLevel -= 5;
				if (o.maxZoomLevel)
					o.maxZoomLevel -= 5;
			}
		}
		lp.options.resolutions = Geoportal.Catalogue.RESOLUTIONS.slice(
			lp.options.minZoomLevel
			, lp.options.maxZoomLevel// + (ids[2] == 'TOPO' ? 1 : 0)
		); 
		lp.options['GeoRM'] = Geoportal.GeoRMHandler.addKey(
			gGEOPORTALRIGHTSMANAGEMENT.apiKey
			, gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.url
			, gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.ttl
			, this.gpxMap.getMap()
		);
		//if (lc.maxExtent) /* WARN */
		//	lp.options.maxExtent = lc.maxExtent.transform(new OpenLayers.Projection('EPSG:4326'), lp.options.projection);
		lp.options.onLoadError = function(src)  {
			if (src.match(/^http:\/\/[a-z0-9-]+\.ign\.fr\//)) {
				if (src.match(/TRANSPARENT=true/i)) 
					return Geoportal.Util.getImagesLocation()+'nodata.gif';
				else
					return Geoportal.Util.getImagesLocation()+'nodata.jpg';
			}
		};
		var l = new lp.classLayer(
			this._getLayerName(
				this.LOCALES['LAYER_PROVIDER_OSM']
				, this.LOCALES['LAYER_ZONE_WORLD']
				, this.LOCALES['LAYER_TYPE_' + type]
			)
			, lp.url
			, lp.params
			, lp.options
		);
		return l;
	}
});

GPXEditor1_1.data.LayerStore.LAYER_TYPE = {
	ROAD: 'ROAD'
	, TOPO: 'TOPO'
	, SAT: 'SAT'
};

GPXEditor1_1.data.LayerStore.PROVIDERS = {
	OSM: 'OSM'
	, GOOGLEMAP: 'GOOGLEMAP'
	, IGNF: 'IGNF'
};

GPXEditor1_1.data.LayerStore.ZONE = {
	WORLD: 'WORLD'
};

GPXEditor1_1.data.LayerStore.LAYERS_ID = [
	/* OSM provider */
	'OSM-WORLD-ROAD'
	/* GOOGLEMAP provider */
	, 'GOOGLEMAP-WORLD-ROAD'
	, 'GOOGLEMAP-WORLD-TOPO'
	, 'GOOGLEMAP-WORLD-SAT'
	/* IGNF provider */
	, 'IGNF-FXX-TOPO'
	, 'IGNF-FXX-SAT'
	, 'IGNF-ATF-TOPO'
	, 'IGNF-GLP-TOPO'
	, 'IGNF-GLP-SAT'
	, 'IGNF-MTQ-TOPO'
	, 'IGNF-MTQ-SAT'
	, 'IGNF-GUG-TOPO'
	, 'IGNF-GUG-SAT'
	, 'IGNF-REU-TOPO'
	, 'IGNF-REU-SAT'
	, 'IGNF-MYT-TOPO'
	, 'IGNF-MYT-SAT'
	, 'IGNF-SPM-TOPO'
	, 'IGNF-SPM-SAT'
	, 'IGNF-CRZ-TOPO'
	, 'IGNF-KER-TOPO'
	, 'IGNF-NCL-TOP'
	, 'IGNF-NCL-SAT'
	, 'IGNF-PYF-TOPO'
	, 'IGNF-PYF-SAT'
	, 'IGNF-SBA-TOPO'
	, 'IGNF-SBA-SAT'
	, 'IGNF-WLF-TOPO'
	, 'IGNF-WLF-SAT'
];

GPXEditor1_1.data.LayerStore.ACTIVE_LAYERS_BY_DEFAULT = [
	'OSM-WORLD-ROAD'
	, 'GOOGLEMAP-WORLD-ROAD'
	, 'GOOGLEMAP-WORLD-TOPO'
	, 'IGNF-FXX-TOPO'
	, 'IGNF-FXX-SAT'
];

GPXEditor1_1.data.LayerStore.LOCALES = {
	LAYER_TYPE_ROAD: 'LAYER_TYPE_ROAD'
	, LAYER_TYPE_TOPO: 'LAYER_TYPE_TOPO'
	, LAYER_TYPE_SAT: 'LAYER_TYPE_SAT'
	, LAYER_PROVIDER_OSM: 'LAYER_PROVIDER_OSM'
	, LAYER_PROVIDER_GOOGLEMAP: 'LAYER_PROVIDER_GOOGLEMAP'
	, LAYER_PROVIDER_IGNF: 'LAYER_PROVIDER_IGNF'
	, LAYER_ZONE_WORLD: 'LAYER_ZONE_WORLD'
};
