OpenLayers.Util.onImageLoadError = function() {
	this._attempts = (this._attempts) ? (this._attempts + 1) : 1;
	if (this._attempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
		var urls = this.urls;
		if (urls && urls instanceof Array && urls.length > 1){
			var src = this.src.toString();
			var current_url, k;
			for (k = 0; current_url = urls[k]; k++){
				if(src.indexOf(current_url) != -1){
					break;
				}
			}
			var guess = Math.floor(urls.length * Math.random());
			var new_url = urls[guess];
			k = 0;
			while(new_url == current_url && k++ < 4){
				guess = Math.floor(urls.length * Math.random());
				new_url = urls[guess];
			}
			this.src = src.replace(current_url, new_url);
		} else {
			this.src = this.src;
		}
	} else {
		if (this.layer && this.layer.onLoadError) 
			this.src= this.layer.onLoadError(this.src);
		else
			OpenLayers.Element.addClass(this, "olImageLoadError");
	}
	this.style.display = "";
};
OpenLayers.Util.distanceBetweenLonLat = function(pt1, pt2) {
	/*
	 * With help from Xavier Hienne
	 * based on http://en.wikipedia.org/wiki/Haversine_formula
	 */
	function haversin(angle) {
		var sin = Math.sin(angle / 2);
		return sin * sin;
	};
	var dlon = (pt2.lon - pt1.lon) * Math.PI / 180;
	var lat1 = pt1.lat * Math.PI / 180;
	var lat2 = pt2.lat * Math.PI / 180;
	var dlat = lat2 - lat1;
	var h = haversin(dlat) + Math.cos(lat1) * Math.cos(lat2) * haversin(dlon);
	return 2 * OpenLayers.Util.EARTH_RADIUS * Math.asin(Math.sqrt(h));
};
OpenLayers.Util.EARTH_RADIUS = 6367449;

OpenLayers.Util.rad2deg = function(angle) { 
	return (angle/Math.PI) * 180; 
};
OpenLayers.Util.headingBetweenLonLat = function(pt1, pt2) {
	var ret = OpenLayers.Util.rad2deg(Math.atan((pt2.lat - pt1.lat) / (pt2.lon - pt1.lon)));
	if (pt2.lon - pt1.lon < 0)
		return 90 - ret + 180;
	return 90 - ret;
};

OpenLayers.Util.formatDistance = function(d, unit) {
	if (d > 100000 || unit == 'km')
		return (d / 1000).toFixed(0) + ' km';
	if (d > 1000)
		return (d / 1000).toFixed(1) + ' km';
	if (d > 100)
		return d.toFixed(0) + ' m';
	return d.toFixed(1) + ' m';
};

OpenLayers.Util.formatElevation = function(e) {
	return e.toFixed(0) + ' m';
};

OpenLayers.Util.formatDuration = function(d) {
	var ret = [];
	if (d >= 3600000) {
		ret.push(Math.floor(d / 3600000) + 'h');
		d = d % 3600000;
	}
	if (d >= 60000) {
		ret.push(Math.floor(d / 60000) + 'm');
		d = d % 60000;
	}
	if (d > 0) {
		ret.push(Math.floor(d / 1000) + 's');
	}
	return ret.join(' ');
};
