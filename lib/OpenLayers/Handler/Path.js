/* Change override to real class */
OpenLayers.Handler.Path.prototype.createFeature = function(pixel) {
	var lonlat = this.control.map.getLonLatFromPixel(pixel);
	if (this.control.selectedFeature) {
		var feature = this.control.selectedFeature;
		if (feature.layer) /* not sure do this in right place instand of callback */
			feature.layer.events.triggerEvent('sketchmodified', {feature: feature});
		var lineString = null;
		if (feature.geometry) {
			if (feature.geometry instanceof OpenLayers.Geometry.MultiLineString) {
				var cmps = feature.geometry.components;
				lineString = cmps[cmps.length - 1];
			}
			else if (feature.geometry instanceof OpenLayers.Geometry.LineString) 
				lineString = feature.geometry;
			if (lineString) {
				var cmps = lineString.components;
				if (cmps.length > 0) {
					var lastPoint = cmps[cmps.length - 1];
					lonlat = new OpenLayers.LonLat(lastPoint.x, lastPoint.y);
				}
			}
			this.editedFeature = feature;
		}
	}	
	else 
		this.editedFeature = null;

	this.point = new OpenLayers.Feature.Vector(
		new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
	);
	this.line = new OpenLayers.Feature.Vector(
		new OpenLayers.Geometry.LineString([this.point.geometry])
	);

	this.callback("create", [this.point.geometry, this.getSketch()]);
	this.point.geometry.clearBounds();
	this.layer.addFeatures([this.line, this.point], {silent: true});
};

/*
OpenLayers.Handler.Path.prototype.mousedown = function(evt) {
	if (this.selectedFeature != null) {
		alert('OK feature selected');
		return false;
	} else {
		if(!this.checkModifiers(evt))
			return true;
		if(this.lastDown && this.lastDown.equals(evt.xy))
			return true;
		this.drawing = true;
		if(this.lastDown == null) {
			if(this.persist)
				this.destroyFeature();
			this.createFeature(evt.xy);
		}
		else
			this.modifyFeature(evt.xy);
		this.lastDown = evt.xy;
		return false;
	}
};
*/
