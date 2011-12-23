Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.GPXPathStore = Ext.extend(GPXEditor1_1.data.GPXElementStore, {
	constructor: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			reader: new GeoExt.data.FeatureReader({}, GPXEditor1_1.data.GPXPathRecord)
			, addRecordFilter: function(record) {
				return (record instanceof GPXEditor1_1.data.GPXPathRecord);
			}
			, addFeatureFilter: function(feature) {
				if (! feature)
					return false;
				return (feature.geometry instanceof OpenLayers.Geometry.LineString)
					|| (feature.geometry instanceof OpenLayers.Geometry.MultiLineString);
			}
		});

		GPXEditor1_1.data.GPXPathStore.superclass.constructor.call(this, config);
	}
});
