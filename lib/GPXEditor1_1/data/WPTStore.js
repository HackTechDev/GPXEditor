Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.WPTStore = Ext.extend(GPXEditor1_1.data.GPXElementStore, {
	constructor: function(config) {
		config = config || {};
		Ext.applyIf(config, {
			reader: new GeoExt.data.FeatureReader({}, GPXEditor1_1.data.WPTRecord)
			, addRecordFilter: function(record) {
				return (record instanceof GPXEditor1_1.data.WPTRecord);
			}
			, addFeatureFilter: function(feature) {
				if (! feature)
					return false;
				return (feature.geometry instanceof OpenLayers.Geometry.Point);
			}
		});

		GPXEditor1_1.data.WPTStore.superclass.constructor.call(this, config);
	}
	, onUpdate: function(store, record, operation) {
		if (! this._updating) {
			var feature = record.get('feature');
			if (! feature.geometryModified) {
				var changes = record.getChanges();
				if ('type' in changes)
					record.updateFeatureStyle();
				if ('lon' in changes || 'lat' in changes) 
					record.updatePositionByLonLat();
			}
		}
		GPXEditor1_1.data.WPTStore.superclass.onUpdate.call(this, store, record, operation);
	}
});
