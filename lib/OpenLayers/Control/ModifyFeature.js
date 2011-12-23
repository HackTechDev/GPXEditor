/* Change override to real class */
OpenLayers.Control.ModifyFeature.prototype.initialize = function(layer, options) {
	this.layer = layer;
	this.vertices = [];
	this.virtualVertices = [];
	this.virtualStyle = OpenLayers.Util.extend({},
	this.layer.style || this.layer.styleMap.createSymbolizer());
	this.virtualStyle.fillOpacity = 0.3;
	this.virtualStyle.strokeOpacity = 0.3;
	this.deleteCodes = [46, 68];
	this.cutCodes = [67];
	this.elevationCodes = [69];
	this.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
	OpenLayers.Control.prototype.initialize.apply(this, [options]);
	if (! (this.deleteCodes instanceof Array)) 
		this.deleteCodes = [this.deleteCodes];
	var control = this;

	var selectOptions = {
		selectStyle: options.selectStyle
		, geometryTypes: this.geometryTypes
		, hover: this.hover
		, highlightOnly: this.highlightOnly
		, clickout: this.clickout
		, toggle: this.toggle
		, onBeforeSelect: this.beforeSelectFeature
		, onSelect: this.selectFeature
		, onUnselect: this.unselectFeature
		, scope: this
	};
	if (this.standalone === false) 
		this.selectControl = new OpenLayers.Control.SelectFeature(layer, selectOptions);
	var dragOptions = {
		geometryTypes: ["OpenLayers.Geometry.Point"]
		, snappingOptions: this.snappingOptions
		, onStart: function(feature, pixel) {
			control.dragStart.apply(control, [feature, pixel]);
		}
		, onDrag: function(feature, pixel) {
			control.dragVertex.apply(control, [feature, pixel]);
		}
		, onComplete: function(feature) {
			control.dragComplete.apply(control, [feature]);
		}
		, featureCallbacks: {
			over: function(feature) {
				if (control.standalone !== true || feature._sketch || control.feature === feature)
					control.dragControl.overFeature.apply(control.dragControl, [feature]);
			}
		}
	};
	this.dragControl = new OpenLayers.Control.DragFeature(layer, dragOptions);

	var keyboardOptions = {keydown: this.handleKeypress};
	this.handlers = {keyboard: new OpenLayers.Handler.Keyboard(this, keyboardOptions)};
};

OpenLayers.Control.ModifyFeature.prototype.handleKeypress = function(evt) {
	var code = evt.keyCode;

	if (this.feature && 
		(OpenLayers.Util.indexOf(this.deleteCodes, code) != -1 
		|| OpenLayers.Util.indexOf(this.cutCodes, code) != -1)
		|| OpenLayers.Util.indexOf(this.elevationCodes, code) != -1) {
	
		var vertex = this.dragControl.feature;
		if (vertex && OpenLayers.Util.indexOf(this.vertices, vertex) != -1 && 
			! this.dragControl.handlers.drag.dragging && vertex.geometry.parent) {

			if (OpenLayers.Util.indexOf(this.deleteCodes, code) != -1) {
				vertex.geometry.parent.removeComponent(vertex.geometry);
				this.layer.drawFeature(
					this.feature
					, this.standalone ? undefined : this.selectControl.renderIntent
				);
				this.resetVertices();
				this.setFeatureState();
				this.onModification(this.feature);
				this.layer.events.triggerEvent('sketchmodified', {
					feature: this.feature
					, vertex: vertex
				});
				this.layer.events.triggerEvent("featuremodified", {feature: this.feature});
			}

			else if (OpenLayers.Util.indexOf(this.elevationCodes, code) != -1) {
				var pt = vertex.geometry;
				var line = pt.parent;
				var lineNodes = line.getVertices();
				var idx = OpenLayers.Util.indexOf(lineNodes, pt);
				if (idx != -1) {
					this.layer.events.triggerEvent(
						'elevationneeded'
						, {
							feature: this.feature
							, index: idx
							, point: pt
						}
					);
				}
			}

			else if (OpenLayers.Util.indexOf(this.cutCodes, code) != -1) {
				var pt = vertex.geometry;
				var line = pt.parent;
				var lineNodes = line.getVertices();
				var ptIndex = OpenLayers.Util.indexOf(lineNodes, pt);
				if (ptIndex > 0 && ptIndex < (lineNodes.length + 1)) {
					var newLineNodes = [pt.clone()];
					for (var i = ptIndex +1; i < lineNodes.length; i++) { 
						newLineNodes.push(lineNodes[i]);
					}
					for (var i = 1; i < newLineNodes.length; i++) {
						line.removeComponent(newLineNodes[i]);
					}
					var newGeometry = null;
					var newLine = new OpenLayers.Geometry.LineString(newLineNodes);
					if (line.parent != null) { /* Considere only MultiLineString if parent */
						var multiLine = line.parent;
						var lineIndex = OpenLayers.Util.indexOf(multiLine.components, line);
						var newLines = [newLine];
						for (var i = lineIndex + 1; i < multiLine.components.length; i++)
							newLines.push(multiLine.components[i]);
						for (var i = 1; i < newLines.length; i++) {
							multiLine.removeComponent(newLines[i]);
						}
						newGeometry = new OpenLayers.Geometry.MultiLineString(newLines);
					}
					else 
						newGeometry = newLine;
					this.layer.addFeatures([new OpenLayers.Feature.Vector(newGeometry)]);
					this.layer.drawFeature(this.feature, this.standalone ?
						undefined :
						this.selectControl.renderIntent);
					this.resetVertices();
					this.setFeatureState();
					this.onModification(this.feature);
					this.layer.events.triggerEvent('sketchmodified', {
						feature: this.feature
						, vertex: vertex
					});
					this.layer.events.triggerEvent("featuremodified",
						{feature: this.feature});
				}
			}
		}
	}
};

OpenLayers.Control.ModifyFeature.prototype.dragVertex = function(vertex, pixel) {
	this.modified = true;

	if (this.feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
		if (this.feature != vertex)
			this.feature = vertex;
		this.layer.events.triggerEvent("vertexmodified", {
			vertex: vertex.geometry
			, feature: this.feature
			, pixel: pixel
		});
	}
	else {
		if (vertex._index) {
			vertex.geometry.parent.addComponent(vertex.geometry, vertex._index);
			delete vertex._index;
			OpenLayers.Util.removeItem(this.virtualVertices, vertex);
			this.vertices.push(vertex);
		}
		else if (vertex == this.dragHandle) {
			this.layer.removeFeatures(this.vertices, {silent: true});
			this.vertices = [];
			if (this.radiusHandle) {
				this.layer.destroyFeatures([this.radiusHandle], {silent: true});
				this.radiusHandle = null;
			}
		}
		else if (vertex !== this.radiusHandle) {
			/* remove ele and time */
			delete vertex.geometry.ele;
			delete vertex.geometry.time;
			this.layer.events.triggerEvent("vertexmodified", {
				vertex: vertex.geometry
				, feature: this.feature
				, pixel: pixel
			});
		}

		if (this.virtualVertices.length > 0) {
			this.layer.destroyFeatures(this.virtualVertices, {silent: true});
			this.virtualVertices = [];
		}

		this.layer.drawFeature(this.feature, this.standalone ? undefined : this.selectControl.renderIntent);
	}

	this.layer.drawFeature(vertex);
};
