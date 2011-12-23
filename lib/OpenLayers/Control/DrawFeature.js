/* Change override to real class */
OpenLayers.Control.DrawFeature.prototype.initialize = function(layer, handler, options) {
	this.EVENT_TYPES =
		OpenLayers.Control.DrawFeature.prototype.EVENT_TYPES.concat(
			OpenLayers.Control.prototype.EVENT_TYPES
		);

	OpenLayers.Control.prototype.initialize.apply(this, [options]);
	this.callbacks = OpenLayers.Util.extend({
		done: this.drawFeature
		, modify: function(vertex, feature) {
			this.layer.events.triggerEvent("sketchmodified", {vertex: vertex, feature: feature});
		}
		, create: function(vertex, feature) {
			/*
			if (this.selectControl != null)
				this.selectControl.deactivate();
			*/
			this.layer.events.triggerEvent("sketchstarted", {vertex: vertex, feature: feature});
		}
	}, this.callbacks);
	this.layer = layer;
	this.handlerOptions = this.handlerOptions || {};
	if (! ("multi" in this.handlerOptions))
		this.handlerOptions.multi = this.multi;
	var sketchStyle = this.layer.styleMap && this.layer.styleMap.styles.temporary;
	if (sketchStyle) {
		this.handlerOptions.layerOptions = OpenLayers.Util.applyDefaults(
			this.handlerOptions.layerOptions
			, {
				styleMap: new OpenLayers.StyleMap({'default': sketchStyle})
			}
		);
	}
	this.handler = new handler(this, this.callbacks, this.handlerOptions);
	if (this.handler instanceof OpenLayers.Handler.Path) {
		this.geometryTypes = 
			(options && options.multi) 
				? 'OpenLayers.Geometry.MultiLineString' 
				: 'OpenLayers.Geometry.LineString';
		this.selectControl = new OpenLayers.Control.SelectFeature(layer, {
			selectStyle: options.selectStyle
			, hover: true
			, geometryTypes: this.geometryTypes
      , onSelect: this.selectFeature
			, onUnselect: this.unselectFeature
			, scope: this
		});
	}
};

OpenLayers.Control.DrawFeature.prototype.destroy = function() {
	if (this.selectControl != null) {
		this.selectControl.unselectAll();
		this.selectControl.destroy();
	}
	OpenLayers.Control.prototype.destroy.apply(this, arguments);
};

OpenLayers.Control.DrawFeature.prototype.activate = function() {
	if (this.selectControl != null)
		return (this.selectControl.activate() && OpenLayers.Control.prototype.activate.apply(this, arguments));
	else
		return OpenLayers.Control.prototype.activate.apply(this, arguments);
};

OpenLayers.Control.DrawFeature.prototype.deactivate = function() {
	var deactivated = false;
	if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
		if (this.selectControl != null) {
			this.selectFeature = null;
			this.selectControl.unselectAll();
			this.selectControl.deactivate();
		}
		deactivated = true;
	}
	return deactivated;
};

OpenLayers.Control.DrawFeature.prototype.setMap = function(map) {
	if (this.selectControl) 
		this.selectControl.setMap(map);
	OpenLayers.Control.prototype.setMap.apply(this, arguments);
};

OpenLayers.Control.DrawFeature.prototype.selectFeature = function(feature) {
	this.selectedFeature = feature;
};

OpenLayers.Control.DrawFeature.prototype.unselectFeature = function(feature) {
	this.selectedFeature = null;
};

OpenLayers.Control.DrawFeature.prototype.drawFeature = function(geometry) {
	if (this.handler.editedFeature) {
		var feature = this.handler.editedFeature;
		//feature.state = OpenLayers.State.UPDATE;
		//this.layer.events.triggerEvent('beforefeaturemodified', {feature: feature});
		var lineString = null;
		if (geometry instanceof OpenLayers.Geometry.MultiLineString) {
			geometry = geometry.components[0];
			var cmps = feature.geometry.components;
			lineString = cmps[cmps.length - 1];
		}
		else if (geometry instanceof OpenLayers.Geometry.LineString) 
			lineString = feature.geometry;

		for (var i = 1; i < geometry.components.length; i++) 
			lineString.addPoint(geometry.components[i]);

		this.layer.events.triggerEvent('featuremodified', {
			feature: feature
			, modified: true
		});
		this.layer.events.triggerEvent('afterfeaturemodified', {feature: feature});
		this.layer.drawFeature(feature);
	}
	else {
		var feature = new OpenLayers.Feature.Vector(geometry);
		var proceed = this.layer.events.triggerEvent("sketchcomplete", {feature: feature});
		if (proceed !== false) {
			feature.state = OpenLayers.State.INSERT;
			this.layer.addFeatures([feature]);
			this.featureAdded(feature);
			this.events.triggerEvent("featureadded",{feature : feature});
		}
	}
	/*
	if (this.selectControl != null) 
		this.selectControl.activate();
	*/
};
