Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.RTEStore = Ext.extend(GPXEditor1_1.data.GPXPathStore, {
	constructor: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			reader: new GeoExt.data.FeatureReader({}, GPXEditor1_1.data.RTERecord)
			, addRecordFilter: function(record) {
				return (record instanceof GPXEditor1_1.data.RTERecord);
			}
			, addFeatureFilter: function(feature) {
				if (! feature)
					return false;
				return (feature.geometry instanceof OpenLayers.Geometry.LineString);
			}
		});

		GPXEditor1_1.data.RTEStore.superclass.constructor.call(this, config);
	}
});
