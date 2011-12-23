Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.GPXElementStore = Ext.extend(GeoExt.data.FeatureStore, {
	gpxLayer: undefined
	, constructor: function(config) {
		config = config || {};

		if (! 'gpxLayer' in config || ! (config.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();
		else
			this.gpxLayer = config.gpxLayer;
		delete config.gpxLayer;

		Ext.applyIf(config, {
			layer: this.gpxLayer.gpxLayer
			, reader: new GeoExt.data.FeatureReader({}, GPXEditor1_1.data.GPXElementRecord)
			, addRecordFilter: function(record) {
				return (record instanceof GPXEditor1_1.data.GPXElementRecord);
			}
			, addFeatureFilter: function(feature) {
				if (! feature)
					return false;
				return (feature.geometry instanceof OpenLayers.Geometry.Point)
					|| (feature.geometry instanceof OpenLayers.Geometry.LineString)
					|| (feature.geometry instanceof OpenLayers.Geometry.MultiLineString);
			}
		});

		GPXEditor1_1.data.GPXElementStore.superclass.constructor.call(this, config);
		this.on('remove', function(store, record, index ) {
			record.cleanBeforeDestroy();
		}, this);
	}
	, getGPXLayer: function() {
		return this.gpxLayer;
	}
	, add: function(records) {
		for (var i = 0, len = records.length; i < len; i++) {
			if (records[i] instanceof this.recordType) {
				records[i].updateFeatureStyle();
				records[i].updateRecordByGeometryChange();
			}
		}
		GPXEditor1_1.data.GPXElementStore.superclass.add.call(this, records);
	}
	, getRecordFromFeature: function(feature) { /* Bug in GeoExt */
		var record = GPXEditor1_1.data.GPXElementStore.superclass.getRecordFromFeature.call(this, feature);
		return record ? record : undefined;
	}
	, bind: function(layer, options) {
		GPXEditor1_1.data.GPXElementStore.superclass.bind.call(this, layer, options);
		layer.events.on({
			'vertexmodified': this.onVertexModified
			, 'sketchmodified': this.onSketchModified
			, 'afterfeaturemodified': this.onAfterFeatureModified
			, scope: this
		});
	}
	, unbind: function() {
		if (this.layer) {
			this.layer.events.un({
				'vertexmodified': this.onVertexModified
				, 'sketchmodified': this.onSketchModified
				, 'afterfeaturemodified': this.onAfterFeatureModified
				, scope: this
			})
		}
		GPXEditor1_1.data.GPXElementStore.superclass.bind.call(this);
	}
	, onVertexModified: function(evt) {
		this._markGeometryChangedInRecord(evt.feature);
	}
	, onSketchModified: function(evt) {
		this._markGeometryChangedInRecord(evt.feature);
	}
	, _markGeometryChangedInRecord: function(feature) {
		if (! feature.geometryModified) {
			if ((typeof this.addFeatureFilter != "function") || (this.addFeatureFilter(feature) !== false)) {
				feature.geometryModified = true;
				var record = this.getRecordFromFeature(feature);
				if (record)
					record.updateRecordByGeometryChange();
			}
		}
	}
	, onFeatureModified: function(evt) {
		//GPXEditor1_1.data.GPXElementStore.superclass.onFeatureModified.call(this, evt.feature);
		/* Not very clean and no time yet to perform the good stuf */
	}
	, onAfterFeatureModified: function(evt) {
		var feature = evt.feature;
		if (feature.geometryModified) {
			if ((typeof this.addFeatureFilter != "function") || (this.addFeatureFilter(feature) !== false)) {
				feature.geometryModified = false;
				var record = this.getRecordFromFeature(feature);
				if (record)
					record.updateRecordByGeometryChange();
			}
		}
	}
});
