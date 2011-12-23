OpenLayers.Control.GPXNavigation = OpenLayers.Class(OpenLayers.Control, {
  layer: undefined
//	, osdInfo: undefined
	, navigationControl: undefined
  , selectControl: undefined
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
		this.selectControl = new OpenLayers.Control.SelectFeature(
			layer, selectOptions
		);
		this.selectControl.events.register('featurehighlighted', this, this.highlightFeature);
		this.selectControl.events.register('featureunhighlighted', this, this.unhighlightFeature);
		this.navigationControl = new OpenLayers.Control.Navigation();
//		this.osdInfo = new OpenLayers.Control.OSDInfo();
//		this.layer.events.register('featureremoved', this, function() { this.osdInfo.deactivate(); });
	}
  , destroy: function() {
		this.layer = null;
		this.navigationControl.destroy();
		this.selectControl.destroy();
//		this.osdInfo.destroy();
		OpenLayers.Control.prototype.destroy.apply(this, []);
	}
	, activate: function() {
//		this.map.addControl(this.osdInfo);
		return (this.selectControl.activate() && 
			this.navigationControl.activate() &&
			OpenLayers.Control.prototype.activate.apply(this, arguments));
	}
	, deactivate: function() {
		var deactivated = false;
		if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
			this.layer.unselectAllFeatures();
			this.selectControl.deactivate();
			this.navigationControl.deactivate();
//			this.osdInfo.deactivate();
//			this.map.removeControl(this.osdInfo);
			deactivated = true;
		}
		return deactivated;
	}
	, selectFeature: function(evt) {
	}
	, highlightFeature: function(evt) {
		var feature = evt.feature;
		/*
		this.osdInfo.deactivate();
		var infos = {
			title: null,
			titleRight: null,
			body: null
		};
		if (! feature)
			return;
		var atts = feature.attributes || {};
		infos.title = atts.name || '(...)';
		if (atts.ele) 
			infos.titleRight = '&nbsp; ' + atts.ele + 'm';
		if (atts.desc)
			infos.body = atts.desc.split("\n").join('<br />') + '<br >';
		else
			infos.body = '';
		if (feature.geometry instanceof OpenLayers.Geometry.Point) {
			infos.body += '<br />';
			infos.body += 'type: ' + OpenLayers.Lang.translate('WPT_TYPE_' + atts.type) + '<br />';
			infos.body += 'lon: ' + atts.lon.toFixed(5) + '<br />';
			infos.body += 'lat: ' + atts.lat.toFixed(5);
		}
		var c = feature.geometry.getCentroid();
		var ll = new OpenLayers.LonLat(c.x, c.y);
		this.osdInfo.setInfo(infos, this.map.getPixelFromLonLat(ll));
		this.osdInfo.activate();
		*/
	}
	, unhighlightFeature: function(evt) {
		//this.osdInfo.deactivate();
	}
	, setMap: function(map) {
		this.selectControl.setMap(map);
		this.navigationControl.setMap(map);
		this.navigationControl.draw();
		//this.osdInfo.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	}
	, CLASS_NAME: 'OpenLayers.Control.GPXNavigation'
});
