OpenLayers.Control.PasteAndInverseFeature = OpenLayers.Class(OpenLayers.Control, {
	geometryTypes: null
	, layer: null
	, highlightedFeature: null
	, highlightedPoint: null
	, selectedFeature: null
	, selectedPoint: null
	, selectControl: null
	, handlers: null
	, inverseCodes: [73]
	, highlightedPointStyle: { fillColor: '#00ff00', pointRadius: 6, fillOpacity: .7 }
	, initialize: function(layer, options) {
		this.layer = layer;
		OpenLayers.Control.prototype.initialize.apply(this, [options]);

		var selectOptions = {
			selectStyle: options.selectStyle
			, geometryTypes: this.geometryTypes
			, highlightOnly: true
			, clickout: true
			, multiple: true
			, onSelect: this.selectFeature
			, onUnselect: this.unselectFeature
			, scope: this
		};
		this.selectControl = new OpenLayers.Control.SelectFeature(layer, selectOptions);
		this.selectControl.events.register('featurehighlighted', this, this.highlightFeature);
		this.selectControl.events.register('featureunhighlighted', this, this.unhighlightFeature);
		this.handlers = {
			keyboard: new OpenLayers.Handler.Keyboard(this, {keydown: this.handleKeypress})
		};
	}
	, destroy: function() {
		this.layer = null;
		this.cleanLayer();
		this.selectControl.events.unregister('featurehighlighted', this, this.highlightFeature);
		this.selectControl.events.unregister('featureunhighlighted', this, this.unhighlightFeature);
		this.selectControl.destroy();
		OpenLayers.Control.prototype.destroy.apply(this, []);
	}
	, activate: function() {
		return (this.selectControl.activate() &&
			this.handlers.keyboard.activate() &&
			OpenLayers.Control.prototype.activate.apply(this, arguments));
	}
	, deactivate: function() {
		var deactivated = false;
		if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
			this.cleanLayer();
			this.selectControl.deactivate();
			this.handlers.keyboard.deactivate();
			deactivated = true;
		}
		return deactivated;
	}
	, handleKeypress: function(evt) {
		var code = evt.keyCode;
		if (this.highlightedFeature != null && OpenLayers.Util.indexOf(this.inverseCodes, code) != -1) {
			var feature = this.highlightedFeature;
			this.layer.events.triggerEvent('beforefeaturemodified', {feature: feature});
			feature.geometry.components.reverse();
			if (feature.geometry instanceof OpenLayers.Geometry.MultiLineString) 
				for (var i = 0; i < feature.geometry.components.length; i++)
					feature.geometry.components[i].components.reverse();
			this.layer.events.triggerEvent('sketchmodified', {feature: feature});
			this.layer.events.triggerEvent('featuremodified', {feature: feature, modified: true});
			this.layer.events.triggerEvent('afterfeaturemodified', {feature: feature}); /* need to be choped on unhighlight */
			this.cleanLayer(true);
			this.highlightFeature({feature: feature});
		}
	}
	, highlightFeature: function(evt) {
		if (this.highlightedFeature)
			return;
		var feature = evt.feature;
		if (feature == this.selectedFeature)
			return;
		this.highlightedFeature = feature;
		var geometry = null;
		var pt = null;
		if (! feature || this.startFeature) 
			return;
		geometry = feature.geometry;
		if (! geometry)
			return;
		if (geometry instanceof OpenLayers.Geometry.MultiLineString)
			pt = geometry.components[0].components[0];
		else if (geometry instanceof OpenLayers.Geometry.LineString)
			pt = geometry.components[0];
		if (! pt)
			return;
		var startPt = pt.clone();
		this.highlightedPoint = new OpenLayers.Feature.Vector(startPt);
		this.highlightedPoint.style = this.highlightedPointStyle;
		this.layer.addFeatures(this.highlightedPoint, {silent: true});
	}
	, unhighlightFeature: function(evt) {
		this.cleanLayer(true);
	}
	, selectFeature: function(feature) {
		if (! feature)
			return;
		if (! this.selectedFeature) {
			this.cleanLayer(true);
			this.selectedFeature = feature;
			var geometry = feature.geometry;
			var pt = null;
			if (geometry instanceof OpenLayers.Geometry.MultiLineString)
				pt = geometry.components[0].components[0];
			else if (geometry instanceof OpenLayers.Geometry.LineString)
				pt = geometry.components[0];
			var startPt = pt.clone();
			this.selectedPoint = new OpenLayers.Feature.Vector(startPt);
			this.selectedPoint.style = this.highlightedPointStyle;
			this.layer.addFeatures(this.selectedPoint, {silent: true});
		}
		else if (this.selectedFeature != feature) {
			this.layer.removeFeatures(feature);
			this.layer.events.triggerEvent('beforefeaturemodified', {feature: this.selectedFeature});
			this.layer.events.triggerEvent('sketchmodified', {feature: this.selectedFeature});
			var geometry = feature.geometry;
			var sGeometry = this.selectedFeature.geometry;
			if (geometry instanceof OpenLayers.Geometry.MultiLineString) {
				var ls = sGeometry.components[sGeometry.components.length - 1];
				for (var i = 0; i < geometry.components.length; i++) {
					var tls = geometry.components[i];
					ls.addComponents(tls.components);
				}
			}
			else if (geometry instanceof OpenLayers.Geometry.LineString) {
				var ls = sGeometry;
				ls.addComponents(geometry.components);
			}
			this.layer.events.triggerEvent('featuremodified', {feature: this.selectedFeature, modified: true});
			this.layer.events.triggerEvent('afterfeaturemodified', {feature: this.selectedFeature});
			feature.destroy();
			this.layer.drawFeature(this.selectedFeature);
			this.cleanLayer();
		}
	}
	, unselectFeature: function(feature) {
		this.cleanLayer();
	}
	, cleanLayer: function(dontUnselect) {
		if (this.highlightedPoint) {
			this.layer.removeFeatures(this.highlightedPoint, {silent: true});
			this.highlightedPoint.destroy();
			this.highlightedPoint = null;
		}
		if (this.highlightedFeature)
			this.highlightedFeature = null;
		if (! dontUnselect) {
			this.selectControl.unselectAll();
			this.selectedFeature = null;
			if (this.selectedPoint) {
				this.layer.removeFeatures(this.selectedPoint, {silent: true});
				this.selectedPoint.destroy();
				this.selectedPoint = null;
			}
		}
	}
	, setMap: function(map) {
		this.selectControl.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	}
	, CLASS_NAME: 'OpenLayers.Control.PasteAndInverseFeature'
});
