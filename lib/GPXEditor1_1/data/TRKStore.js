Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.TRKStore = Ext.extend(GPXEditor1_1.data.GPXPathStore, {
	constructor: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			reader: new GeoExt.data.FeatureReader({}, GPXEditor1_1.data.TRKRecord)
			, addRecordFilter: function(record) {
				return (record instanceof GPXEditor1_1.data.TRKRecord);
			}
			, addFeatureFilter: function(feature) {
				if (! feature)
					return false;
				return (feature.geometry instanceof OpenLayers.Geometry.MultiLineString);
			}
		});

		GPXEditor1_1.data.TRKStore.superclass.constructor.call(this, config);
	}
});
