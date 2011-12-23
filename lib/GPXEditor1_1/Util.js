Ext.namespace('GPXEditor1_1');

GPXEditor1_1.Util = {};

/*
GPXEditor1_1.Util.getDefaultMap = function() {
	return new OpenLayers.GPXEditorMap(Ext.id(null, 'map_'), {
		displayProjection: new OpenLayers.Projection('EPSG:4326'),
		controls: [
			new OpenLayers.Control.MouseDefaults(),
			//new OpenLayers.Control.MousePosition(),
			new Geoportal.Control.TermsOfService(),
			new Geoportal.Control.PermanentLogo(),
			new Geoportal.Control.Logo()
		]
	});
};
*/

/* MapProviders (must be initialized by GPXEditor.Util.initProviders) */
GPXEditor1_1.Util.IS_PROVIDERS_INITIALIZED = false;
GPXEditor1_1.Util.PROVIDERS = [];

GPXEditor1_1.Util.getLayersDefsById = function(id) {
	if (! GPXEditor1_1.Util.IS_PROVIDERS_INITIALIZED)
		GPXEditor1_1.Util.initProviders();
	var ret = [];
	var ids = id ? id : '*';
	if (! Ext.isArray(ids))
		ids = [ids];
	for (var i = 0; i < ids.length; i++) {
		var idp = ids[i].split('-');
		if (idp.length == 0)
			idp.push('*');
		if (idp.length == 1)
			idp.push('*');
		if (idp.length == 2)
			idp.push('*');
		ids[i] = idp.join('-');
	}
	for (var i = 0; i < GPXEditor1_1.Util.PROVIDERS.length; i++) {
		var l = GPXEditor1_1.Util.PROVIDERS[i];
		var lIdp = l.id.split('-');
		for (var j = 0; j < ids.length; j++) {
			var idp = ids[j].split('-');
			if ((idp[0] == '*' || idp[0] == lIdp[0])
				&& (idp[1] == '*' || idp[1] == lIdp[1])
				&& (idp[2] == '*' || idp[2] == lIdp[2])
			) {
				ret.push(l);
			}
		}
	}
	return ret;
};

GPXEditor1_1.Util.initProviders = function() {
	/* OSM */
	GPXEditor1_1.Util.PROVIDERS.push({
		id: 'WORLDMAP-OSM-TILEATHOME',
		provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_OSM, 
		zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_WORLD, 
		type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.MAP, 
		isActive: true,
		layerConfig: {
			url: 'http://tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png',
			options: Ext.apply({
			}, GPXEditor1_1.Util.L_WORLDMAP_OSM_CONFIG)
		}
	});

	/* GOOGLE */
	if (window.GScript != null) {
		GPXEditor1_1.Util.PROVIDERS.push({
			id: 'WORLDMAP-GOOGLE-PHYSICAL',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_GOOGLE, 
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_WORLD, 
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO, 
			isActive: true,
			layerConfig: {
				options: Ext.apply({
					type: 'G_PHYSICAL_MAP'
				}, GPXEditor1_1.Util.L_WORLDMAP_GOOGLE_CONFIG)
			}
		}, {
			id: 'WORLDMAP-GOOGLE-MAP',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_GOOGLE, 
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_WORLD, 
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.MAP, 
			isActive: false,
			layerConfig: {
				options: Ext.apply({
				}, GPXEditor1_1.Util.L_WORLDMAP_GOOGLE_CONFIG)
			}
		}, {
			id: 'WORLDMAP-GOOGLE-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_GOOGLE, 
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_WORLD, 
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT, 
			isActive: true,
			layerConfig: {
				options: Ext.apply({
					type: 'G_SATELLITE_MAP'
				}, GPXEditor1_1.Util.L_WORLDMAP_GOOGLE_CONFIG)
			}
		});
	}

	/* IGN */
	if (window.gGEOPORTALRIGHTSMANAGEMENT != null) {
		GPXEditor1_1.Util.PROVIDERS.push({
			id: 'IGNF-FXX-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_FXX,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: true,
			layerConfig: {
				territory: 'FXX',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-FXX-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_FXX,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: true,
			layerConfig: {
				territory: 'FXX',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-ATF-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_ATF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'ATF',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
			}
		}, {
			id: 'IGNF-GLP-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_GLP,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'GLP',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-GLP-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_GLP,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'GLP',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-MTQ-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_MTQ,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'MTQ',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-MTQ-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_MTQ,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'MTQ',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-GUF-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_GUF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'GUF',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-GUF-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_GUF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'GUF',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-REU-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_REU,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'REU',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-REU-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_REU,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'REU',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-MYT-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_MYT,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'MYT',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-MYT-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_MYT,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'MYT',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-SPM-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_SPM,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'SPM',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-SPM-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_SPM,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'SPM',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-CRZ-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_CRZ,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'CRZ',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
			}
		}, {
			id: 'IGNF-KER-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_KER,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'KER',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
			}
		}, {
			id: 'IGNF-NCL-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_NCL,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'NCL',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
			}
		}, {
			id: 'IGNF-NCL-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_NCL,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'NCL',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-PYF-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_PYF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'PYF',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxExtent: new OpenLayers.Bounds(-151.8608464126424, -16.21081454795193, -149.09434367584083, -17.95857676473487)
			}
		}, {
			id: 'IGNF-PYF-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_PYF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'PYF',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS',
				maxExtent: new OpenLayers.Bounds(-151.8608464126424, -16.21081454795193, -149.09434367584083, -17.95857676473487)
			}
		}, {
			id: 'IGNF-SBA-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_SBA,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'SBA',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
				maxZoomLevel: 15
			}
		}, {
			id: 'IGNF-SBA-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_SBA,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'SBA',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		}, {
			id: 'IGNF-WLF-TOPO',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_WLF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO,
			isActive: false,
			layerConfig: {
				territory: 'WLF',
				layerId: 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
			}
		}, {
			id: 'IGNF-WLF-SAT',
			provider: GPXEditor1_1.data.MapProvidersStore.LOCALES.PROVIDER_IGN,
			zone: GPXEditor1_1.data.MapProvidersStore.LOCALES.ZONE_IGNF_WLF,
			type: GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT,
			isActive: false,
			layerConfig: {
				territory: 'WLF',
				layerId: 'ORTHOIMAGERY.ORTHOPHOTOS'
			}
		})
	}

	GPXEditor1_1.Util.IS_PROVIDERS_INITIALIZED = true;
};

GPXEditor1_1.Util.L_ALL_CONFIG = {
	isBaseLayer: true
};

GPXEditor1_1.Util.L_WORLDMAP_CONFIG = Ext.applyIf({
	projection: new OpenLayers.Projection('EPSG:900913'),
	sphericalMercator: true,
	maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508)
}, GPXEditor1_1.Util.L_ALL_CONFIG);

GPXEditor1_1.Util.L_WORLDMAP_OSM_CONFIG = Ext.apply({
	numZoomLevels: 18,
	maxResolution: 156543.0339
}, GPXEditor1_1.Util.L_WORLDMAP_CONFIG);

GPXEditor1_1.Util.L_WORLDMAP_GOOGLE_CONFIG = Ext.apply({
}, GPXEditor1_1.Util.L_WORLDMAP_CONFIG);
