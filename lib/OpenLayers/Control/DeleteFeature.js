OpenLayers.Control.DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
	geometryTypes: null
	, layer: null
	, selectControl: null
	, initialize: function(layer, options) {
		this.layer = layer;
		OpenLayers.Control.prototype.initialize.apply(this, [options]);

		var selectOptions = {
			selectStyle: options.selectStyle
			, geometryTypes: this.geometryTypes
			, highlightOnly: true
			, onSelect: this.selectFeature
			, scope: this
		};
		this.selectControl = new OpenLayers.Control.SelectFeature(layer, selectOptions);
	}
	, destroy: function() {
		this.layer = null;
		this.selectControl.destroy();
		OpenLayers.Control.prototype.destroy.apply(this, []);
	}
	, activate: function() {
		return (this.selectControl.activate() &&
			OpenLayers.Control.prototype.activate.apply(this, arguments));
	}
	, deactivate: function() {
		var deactivated = false;
		if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
			var feature = this.feature;
			var valid = feature && feature.geometry && feature.layer;
			if (valid) 
				this.selectControl.unselect.apply(this.selectControl, [feature]);
			this.selectControl.deactivate();
			deactivated = true;
		}
		return deactivated;
	}
	, selectFeature: function(feature) {
		this.layer.removeFeatures([feature]);
		this.layer.events.triggerEvent('featureremoved', {feature: feature});
	}
	, setMap: function(map) {
		this.selectControl.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	}
	, CLASS_NAME: 'OpenLayers.Control.DeleteFeature'
});
