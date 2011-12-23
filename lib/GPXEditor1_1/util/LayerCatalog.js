Ext.namespace('GPXEditor1_1');

GPXEditor1_1.LayerCatalog = Ext.extend(Ext.util.Observable, {
	layers: undefined
	, constructor: function(config) {
		config = config || {};

		this.layers = [];

		GPXEditor1_1.LayerCatalog.superclass.constructor.call(this, config);
	}
	, getLayers: function(identifier) {
		var ret = [];
		var search = {
			provider: '*'
			, region: '*'
			, type: '*'
		};

		/* modify search by given identifier */
		var parts = identifier ? identifier.split('-') : [];
		if (parts.length > 0)
			search.provider = parts[0];
		if (parts.length > 1)
			search.region = parts[1];
		if (parts.length > 2)
			search.type = parts[2];

		/* do selection */
		for (var i = 0, len = GPXEditor1_1.LayerCatalog.LAYERS_ID.length; i < len; i++) {
			var lIdParts = GPXEditor1_1.LayerCatalog.LAYERS_ID[i].split('-');
			var add = true;
			if (search.provider != '*' && search.provider != lIdParts[0])
				add = false;
			else if (search.region != '*' && search.region != lIdParts[1])
				add = false;
			else if (search.type != '*' && search.type != lIdParts[2])
				add = false;
			if (add)
				ret.push(GPXEditor1_1.LayerCatalog.LAYERS_ID[i]);
		}

		return ret;
	}
});

GPXEditor1_1.LayerCatalog.LAYER_TYPE = {
	ROAD: 'ROAD'
	, TOPO: 'TOPO'
	, SAT: 'SAT'
};

GPXEditor1_1.LayerCatalog.PROVIDERS = {
	OSM: 'OSM'
	, GOOGLEMAP: 'GOOGLEMAP'
	, IGNF: 'IGNF'
};

GPXEditor1_1.LayerCatalog.WORLDMAP = 'WORLDMAP';

GPXEditor1_1.LayerCatalog.LAYERS_ID = [
	/* OSM provider */
	'OSM-WORLDMAP-ROAD'
	/* GOOGLEMAP provider */
	, 'GOOGLEMAP-WORLDMAP-ROAD'
	, 'GOOGLEMAP-WORLDMAP-TOPO'
	, 'GOOGLEMAP-WORLDMAP-SAT'
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

GPXEditor1_1.LayerCatalog.LOCALES = {
	LAYER_TYPE_ROAD: 'LAYER_TYPE_ROAD'
	, LAYER_TYPE_TOPO: 'LAYER_TYPE_TOPO'
	, LAYER_TYPE_SAT: 'LAYER_TYPE_SAT'
	, LAYER_PROVIDER_OSM: 'LAYER_PROVIDER_OSM'
	, LAYER_PROVIDER_GOOGLEMAP: 'LAYER_PROVIDER_GOOGLEMAP'
	, LAYER_PROVIDER_IGNF: 'LAYER_PROVIDER_IGNF'
	, WORLDMAP: 'WORLDMAP'
};
