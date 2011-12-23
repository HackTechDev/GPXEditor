Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.MapProvidersStore = Ext.extend(Ext.data.GroupingStore, {
	map: null,
	constructor: function(config) {
		this.LOCALES = GPXEditor1_1.data.MapProvidersStore.LOCALES;
		config = config || {};
		/*
		if (! 'map' in config || ! (config.map instanceof OpenLayers.Map))
			config.map = GPXEditor1_1.Util.getDefaultMap();
		*/
		this.map = config.map;

		Ext.apply(config, {
			reader: new Ext.data.JsonReader({
				root: 'providers',
				fields: [
					{name: 'id', type: 'string', id: 'id'},
					{name: 'orderNum', type: 'int'},
					{name: 'provider', type: 'string'},
					{name: 'zone', type: 'string'},
					{name: 'type', type: 'int'},
					{name: 'isActive', type: 'bool'},
					{name: 'layer', type: 'object'},
					{name: 'layerConfig', type: 'object'}
				]
			}),
			sortInfo: {field: 'zone', direction: "ASC"},
    	groupField: 'provider'
		});
		GPXEditor1_1.data.MapProvidersStore.superclass.constructor.call(this, config);
		this.on('load', function (store, records, options) {
			for (var i = 0; i < records.length; i++) {
				var r = records[i];
				var l = this._getLayerFromRecord(r);
				r.data.layer = l;
				this.map.addLayer(l);
			}
		}, this);
		this.loadByLayerId(config.layersId);
	},
	getMap: function() {
		return this.map;
	},
	loadByLayerId: function(id) {
		var layers = GPXEditor1_1.Util.getLayersDefsById(id);
		var newLayers = [];
		for (var i = 0; i < layers.length; i++) {
			var l = layers[i];
			if (! this.getById(l.id)) {
				l.orderNum = GPXEditor1_1.Util.PROVIDERS.indexOf(l);
				newLayers.push(l);
			}
		}
		if (newLayers.length > 0)
			this.loadData({providers: newLayers});
	},
	_getLayerFromRecord: function(r) {
		if (! r)
			return;
		if (r.data.layer)
			return r.data.layer;
		var lc = r.data.layerConfig;
		var map = this.map;
		var ids = r.data.id.split('-');
		var pid = ids[0] == 'WORLDMAP' ? ids[1] : ids[0];
		if (! lc)
			return null;
		var name = r.data.provider + ' ' + r.data.zone + ' ';
		if (r.data.type == GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.MAP)
			name += this.LOCALES.LAYER_TYPE_MAP;
		else if (r.data.type == GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT)
			name += this.LOCALES.LAYER_TYPE_SAT;
		else if (r.data.type == GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO)
			name += this.LOCALES.LAYER_TYPE_TOPO
		var layer = null;
		switch (pid) {
			case 'OSM':
				layer = new OpenLayers.Layer.OSM(name, lc.url, lc.options);
				break;
			case 'GOOGLE':
				if (window.GScript != null) {
					switch (lc.options.type) {
						case 'G_PHYSICAL_MAP':
							lc.options.type = G_PHYSICAL_MAP;
							break;
						case 'G_SATELLITE_MAP':
							lc.options.type = G_SATELLITE_MAP;
							break;
					}
					layer = new OpenLayers.Layer.Google(name, lc.options);
				}
				break;
			case 'IGNF':
				var cat = map ? map.getIGNFCatalogue() : null;
				if (window.gGEOPORTALRIGHTSMANAGEMENT && map && cat) {
					var t = cat.getTerritory(lc.territory);
					if (! t)
						return null;
					var lp = cat.getLayerParameters(t, lc.layerId);
					if (! lp)
						return null;
					lp.options.isBaseLayer = true;
					lp.options.opacity = 1.0;
					lp.options.alwaysInRange = true;
					if ('originators' in lp.options) {
						for (var i = 0; i <  lp.options.originators.length; i++) {
							var o = lp.options.originators[i];
							if (o.minZoomLevel)
								o.minZoomLevel -= 5;
							if (o.maxZoomLevel)
								o.maxZoomLevel -= 5;
						}
					}
					if (lc.maxZoomLevel)
						lp.options.maxZoomLevel = lc.maxZoomLevel;
					lp.options.resolutions = Geoportal.Catalogue.RESOLUTIONS.slice(
						lp.options.minZoomLevel, 
						lp.options.maxZoomLevel + (ids[2] == 'TOPO' ? 1 : 0)
					); 
					lp.options['GeoRM'] = Geoportal.GeoRMHandler.addKey(
						gGEOPORTALRIGHTSMANAGEMENT.apiKey,
						gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.url,
						gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.ttl,
						map
					);
					if (lc.maxExtent) 
						lp.options.maxExtent = lc.maxExtent.transform(new OpenLayers.Projection('EPSG:4326'), lp.options.projection);
					lp.options.onLoadError = function(src)  {
						if (src.match(/^http:\/\/[a-z0-9-]+\.ign\.fr\//)) {
							if (src.match(/TRANSPARENT=true/i)) 
								return Geoportal.Util.getImagesLocation()+'nodata.gif';
							else
								return Geoportal.Util.getImagesLocation()+'nodata.jpg';
						}
					};
					layer = new lp.classLayer(
						name,
						lp.url,
						lp.params,
						lp.options
					);
				}
				break;
		}
		layer.record = r;
		return layer;
	}
});

GPXEditor1_1.data.MapProvidersStore.LOCALES = {
	PROVIDER_OSM: 'PROVIDER_OSM',
	PROVIDER_GOOGLE: 'PROVIDER_GOOGLE',
	PROVIDER_IGN: 'PROVIDER_IGN',
	ZONE_WORLD: 'ZONE_WORLD',
	ZONE_IGNF_FXX: 'ZONE_IGNF_FXX',
	ZONE_IGNF_GLP: 'ZONE_IGNF_GLP',
	ZONE_IGNF_MTQ: 'ZONE_IGNF_MTQ',
	ZONE_IGNF_GUF: 'ZONE_IGNF_GUF',
	ZONE_IGNF_REU: 'ZONE_IGNF_REU',
	ZONE_IGNF_MYT: 'ZONE_IGNF_MYT',
	ZONE_IGNF_SPM: 'ZONE_IGNF_SPM',
	ZONE_IGNF_CRZ: 'ZONE_IGNF_CRZ',
	ZONE_IGNF_KER: 'ZONE_IGNF_KER',
	ZONE_IGNF_NCL: 'ZONE_IGNF_NCL',
	ZONE_IGNF_PYF: 'ZONE_IGNF_PYF',
	ZONE_IGNF_SBA: 'ZONE_IGNF_SBA', 
	ZONE_IGNF_SMA: 'ZONE_IGNF_SMA', 
	ZONE_IGNF_WLF: 'ZONE_IGNF_WLF',
	LAYER_TYPE_MAP: 'LAYER_TYPE_MAP',
	LAYER_TYPE_SAT: 'LAYER_TYPE_SAT',
	LAYER_TYPE_TOPO: 'LAYER_TYPE_TOPO'
};

GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE = {
	TOPO: 1,
	MAP: 2,
	SAT: 3
};
