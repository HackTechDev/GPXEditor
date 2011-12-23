OpenLayers.MapWithVectorReprojection = OpenLayers.Class(OpenLayers.Map, {
	ignfCat: undefined
	, initialize: function (div, options) { 
		if (window.gGEOPORTALRIGHTSMANAGEMENT != null) 
			OpenLayers.Util.extend(options, gGEOPORTALRIGHTSMANAGEMENT);
		OpenLayers.Map.prototype.initialize.apply(this, arguments);
		if (window.gGEOPORTALRIGHTSMANAGEMENT != null) 
			this.ignfCat = new Geoportal.Catalogue(this, gGEOPORTALRIGHTSMANAGEMENT);
		if (! this.center) /* hack for Geoportal */
			this.center = new OpenLayers.LonLat(0, 0);
	}
	, getIGNFCatalogue: function() {
		return this.ignfCat;
	}
	, _updateVectorLayers: function(layers) {
		if (! this.baseLayer || ! this.baseLayer.projection)
			return;
		layers = layers ? [layers] : this.layers;
		for (var li = 0; li < layers.length; li++) {
			var layer = layers[li];
			if (layer && layer instanceof OpenLayers.Layer.Vector) {
				var bl = this.baseLayer;
				var lp = layer.projection;
				if (! bl.projection.equals(lp)) {
					for (var vfi = 0; vfi < layer.features.length; vfi++) {
						var g = layer.features[vfi].geometry;
						if (! g)
							continue;
						if (g instanceof OpenLayers.Geometry.Point) 
							g.transform(lp, bl.projection);
						else if (g instanceof OpenLayers.Geometry.Collection) 
							g.transform(lp, bl.projection);
					}
				}
				layer.projection = bl.projection;
				layer.redraw();
			}
		}
	}	
	, addLayer: function(layer) {
		this._updateVectorLayers(layer);
		OpenLayers.Map.prototype.addLayer.apply(this, [layer]);
	}
	, setBaseLayer: function(newBaseLayer) {
		if (newBaseLayer == this.baseLayer)
			return;
		if (OpenLayers.Util.indexOf(this.layers, newBaseLayer) != -1) {
			var oldBaseLayer = this.baseLayer;
			var oldExtent = this.getExtent();
			var oldProjection = this.getProjection();
			var center = this.getCenter();
			var newResolution = OpenLayers.Util.getResolutionFromScale(
				this.getScale(), newBaseLayer.units
			);
			if (this.baseLayer != null && ! this.allOverlays)
				this.baseLayer.setVisibility(false);
			this.baseLayer = newBaseLayer;
			this.viewRequestID++;
			if (! this.allOverlays || this.baseLayer.visibility)
				this.baseLayer.setVisibility(true);
			if (center != null) {
				var newZoom = this.getZoomForResolution(
					newResolution || this.resolution, true
				);
				if (oldProjection != null && ! oldProjection.equals(this.getProjection())) {
					center.transform(oldProjection, this.getProjection());
					this._updateVectorLayers();
				}
				this.setCenter(center, newZoom, false, true);
			}
			/* Geoportal TermsOfService */
			var ctos = this.getControlsByClass('Geoportal.Control.TermsOfService');
			if (ctos && ctos.length > 0) {
				var display = 'none';
				if (this.baseLayer.GeoRM)
					display = 'block';
				for (var i = 0; i < ctos.length; i++)
					ctos[i].div.style.display = display;
			}
			this.events.triggerEvent("changebaselayer", {
				oldLayer: oldBaseLayer,
				oldExtent: oldExtent,
				layer: this.baseLayer
			});
		}
	}
	, setDisplayCenter: function(lonlat, zoom) {
		if (lonlat && this.displayProjection && this.baseLayer.projection) 
			lonlat.transform(this.displayProjection, this.baseLayer.projection);
		this.setCenter(lonlat, zoom);
	}
	, CLASS_NAME: 'OpenLayers.MapWithVectorReprojection'
});
