OpenLayers.Control.SelectFeature.prototype.initialize = function(layers, options) {
	this.EVENT_TYPES =
		OpenLayers.Control.SelectFeature.prototype.EVENT_TYPES.concat(
			OpenLayers.Control.prototype.EVENT_TYPES
		);
	OpenLayers.Control.prototype.initialize.apply(this, [options]);
	if(this.scope === null)
		this.scope = this;
	this.initLayer(layers);
	var callbacks = {
		click: this.clickFeature
		, clickout: this.clickoutFeature
	};
	if (this.hover || this.highlightOnly) {
		callbacks.over = this.overFeature;
		callbacks.out = this.outFeature;
	}
	this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
	this.handlers = {
		feature: new OpenLayers.Handler.Feature(
			this, this.layer, this.callbacks
			, {geometryTypes: this.geometryTypes}
		)
	};
	if (this.box) {
		this.handlers.box = new OpenLayers.Handler.Box(
			this, {done: this.selectBox}
			, {boxDivClassName: "olHandlerBoxSelectFeature"}
		);
	}
	if (this.selectStyle) /* Bad hack for modify feature */
		this.renderIntent = this.selectStyle;
};
OpenLayers.Control.SelectFeature.prototype.clickFeature = function(feature) {
	if (! this.hover || this.highlightOnly) {
		var selected = (OpenLayers.Util.indexOf(
			feature.layer.selectedFeatures, feature) > -1);
		if (selected) {
			if (this.toggleSelect()) {
				this.unselect(feature);
			} else if(!this.multipleSelect()) {
				this.unselectAll({except: feature});
			}
		} else {
			if (!this.multipleSelect()) {
				this.unselectAll({except: feature});
			}
			this.select(feature);
		}
	}
};
OpenLayers.Control.SelectFeature.prototype.overFeature = function(feature) {
	var layer = feature.layer;
	if (this.hover) {
		if(this.highlightOnly) {
			this.highlight(feature);
		} else if(OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
			this.select(feature);
		}
	} else if (this.highlightOnly) {
		this.highlight(feature);
	}
};
OpenLayers.Control.SelectFeature.prototype.outFeature = function(feature) {
	var layer = feature.layer;
	if (this.hover) {
		if(this.highlightOnly) {
			if(feature._lastHighlighter == this.id) {
				if(feature._prevHighlighter &&
					feature._prevHighlighter != this.id) {
					delete feature._lastHighlighter;
					var control = this.map.getControl(
						feature._prevHighlighter);
					if(control)
						control.highlight(feature);
				}
				else
					this.unhighlight(feature);
			}
		}
		else
			this.unselect(feature);
	} else if (this.highlightOnly) {
		if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1)
			this.unhighlight(feature);
	}
};
