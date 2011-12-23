OpenLayers.Control.InfoPoint = OpenLayers.Class(OpenLayers.Control, {

		handler: undefined,
		osdInfo: undefined,
		feature: undefined,
		layer: undefined,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
				this.dProjection = new OpenLayers.Projection('EPSG:4326');
				this.handler = new OpenLayers.Handler.Point(this, {
					create: this.removeLastInfo,
					done: this.createInfo
				});
				this.osdInfo = new OpenLayers.Control.OSDInfo();
    },

    destroy: function() {
				this.removeLastInfo();
				this.osdInfo.destroy();
				delete this.osdInfo;
				delete this.handler;
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },

    activate: function() {
        if (! this.handler.activate() ||
					! OpenLayers.Control.prototype.activate.apply(this, arguments)) {
					return false;
				}
				this.map.addControl(this.osdInfo);
				this.layer = new OpenLayers.Layer.Vector(this.CLASS_NAME, {
					calculateInRange: OpenLayers.Function.True
				});
				this.map.addLayer(this.layer);
				return true;
    },

    deactivate: function() {
        var deactivated = false;
        if(OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
					this.removeLastInfo();
					if (this.layer) {
						if (this.layer.map)
							this.layer.destroy();
						delete this.layer;
					}
					this.handler.deactivate();
					this.map.removeControl(this.osdInfo);
					this.osdInfo.deactivate();
          deactivated = true;
        }
        return deactivated;
    },
    
		removeLastInfo: function() {
			if (this.layer) 
				this.layer.destroyFeatures();
			this.osdInfo.deactivate();
			if (this.reqEle)
				this.reqEle.abort();
			delete this.feature;
			delete this.ele;
			delete this.ll;
			delete this.oll;
			delete this.geoname;
		},
		updateInfo: function() {
			var proxInfos = '';
			if (this.geoname) {
				if (this.geoname.toponymName)
					proxInfos += ' &nbsp; ' + this.geoname.toponymName;
				if (this.geoname.countryName) {
					proxInfos += '<br/> &nbsp; (' + this.geoname.countryName;
					if (this.geoname.adminName1)
						proxInfos += ' / ' + this.geoname.adminName1;
					proxInfos += ')';
				}
				if (proxInfos.length > 0)
					proxInfos = '<div style="margin-top: 5px;"><b>... ' + OpenLayers.Util.toFloat(this.geoname.distance).toFixed(2) + 'km</b><br/>' + proxInfos + '</div>';
			}
			var info = {
				title: OpenLayers.Lang.translate('WPT_NAME'),
				titleRight: this.ele ? ' &nbsp; &nbsp; ' + this.ele + 'm' : null,
				body: 'Lon: ' + this.ll.lon.toFixed(5) + '<br/>'
					+ 'Lat: ' + this.ll.lat.toFixed(5)
					+ proxInfos
			};
			this.osdInfo.setInfo(info, this.map.getViewPortPxFromLonLat(this.oll));
		},
		createInfo: function(point) {
			this.feature = new OpenLayers.Feature.Vector(point);
			this.layer.addFeatures([this.feature]);
			this.oll = new OpenLayers.LonLat(point.x, point.y);
			this.ll = this.oll.clone();
			this.ll.transform(this.map.getProjection(), this.dProjection);
			this.reqEle = new OpenLayers.Elevation(this.ll, function(ele) {
				this.ele = ele;
				this.updateInfo();
			}, this);
			this.reqNearby = OpenLayers.Request.GET({
				url: './proxy.php', 
				params: {
					'_proxy_url': 'http://ws.geonames.org/findNearbyJSON',
					'lng': this.ll.lon,
					'lat': this.ll.lat,
					'lang': OpenLayers.Lang.getCode(),
					'style': 'MEDIUM'
				},
				scope: this,
				success: function(request) {
					var nearbyInfo = eval('(' + request.responseText + ')');
					if (nearbyInfo.geonames && nearbyInfo.geonames[0]) {
						this.geoname = nearbyInfo.geonames[0];
						this.updateInfo();
					}
				},
				failure: function(request) {}
			});
			this.updateInfo();
			this.osdInfo.activate();
		},

		setMap: function(map) {
			this.osdInfo.setMap(map);
			OpenLayers.Control.prototype.setMap.apply(this, arguments);
		},

    CLASS_NAME: 'OpenLayers.Control.InfoPoint'
});
