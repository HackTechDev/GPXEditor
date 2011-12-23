OpenLayers.Control.ConvertFeature = OpenLayers.Class(OpenLayers.Control, {
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
		var geometry = feature.geometry;
		if (geometry instanceof OpenLayers.Geometry.MultiLineString) {
			var pts = [];
			for (var i = 0; i < geometry.components.length; i++) {
				var ls = geometry.components[i];
				for (var j = 0; j < ls.components.length; j++)  {
					delete ls.components[j].time;
					pts.push(ls.components[j]);
				}
			}
			this.layer.removeFeatures([feature]);
			feature.geometry = new OpenLayers.Geometry.LineString(pts);
			this.layer.addFeatures([feature]);
			/*
			this.layer.addFeatures([new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.LineString(pts))]);
			*/
		}
		else if (geometry instanceof OpenLayers.Geometry.LineString) {
			this.layer.removeFeatures([feature]);
			feature.geometry = new OpenLayers.Geometry.MultiLineString([geometry]);
			this.layer.addFeatures([feature]);
			/*
			this.layer.addFeatures(new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.MultiLineString([geometry])));
			*/
		}
	}
	, setMap: function(map) {
		this.selectControl.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	}
	, CLASS_NAME: 'OpenLayers.Control.ConvertFeature'
});
