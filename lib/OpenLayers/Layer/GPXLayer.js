OpenLayers.Layer.GPXLayer = OpenLayers.Class(OpenLayers.Layer.Vector, {
	EVENT_ELEVATIONNEEDED: 'elevationneeded'
	, initialize: function(name, options) { 
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
		this.events.addEventType(OpenLayers.Layer.GPXLayer.prototype.EVENT_ELEVATIONNEEDED);
	}
	, unselectAllFeatures: function() {
		for (var i = this.selectedFeatures.length - 1; i > -1; i--) {
			var f = this.selectedFeatures[i];
			this.events.triggerEvent('featureunselected', {feature: f});
			this.drawFeature(f);
		}
		this.selectedFeatures = []; /* TODO: not clean method why removing don't work ? */
	},
	CLASS_NAME: 'OpenLayers.Layer.GPXLayer'
});
