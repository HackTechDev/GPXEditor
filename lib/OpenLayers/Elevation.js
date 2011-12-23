OpenLayers.Elevation = OpenLayers.Class(OpenLayers.Control, {
	initialize: function(ll, func, scope) {
		this.ll = ll;
		if (func && scope)
			this.callback = OpenLayers.Function.bind(func, scope);
		this.doSRTM3Request();
	}
	, abort: function(abortCurent) {
	/*
		if (this.request && this.request.abort) 
			this.request.abort();
			*/
		this.request = null;
		if (! abortCurent)
			this.aborted = true;
	}
	, doSRTM3Request: function() {
		if (this.aborted)
			return;
		if (this.ll.lat > 60 || this.ll.lat < -56) {
			this.doASTERGDEMRequest();
			return;
		}
		this._doRequest('http://ws.geonames.org/srtm3', 'checkSRTM3Result');
	}
	, checkSRTM3Result: function(ele) {
		if (this.aborted)
			return;
		if (ele == -32768) {
			this.doASTERGDEMRequest();
			return;
		}
		this.callback(ele);
	}
	, doASTERGDEMRequest: function() {
		if (this.aborted)
			return;
		if (this.ll.lat > 83 || this.ll.lat < -65) {
			this.doGTOPO30Request();
			return;
		}
		this._doRequest('http://ws.geonames.org/astergdem', 'checkASTERGDEMResult');
	}
	, checkASTERGDEMResult: function(ele) {
		if (this.aborted)
			return;
		if (ele == -9999) {
			this.doGTOPO30Request();
			return;
		}
		this.callback(ele);
	}
	, doGTOPO30Request: function() {
		if (this.aborted)
			return;
		this._doRequest('http://ws.geonames.org/gtopo30', 'checkGTOPO30Result');
	}
	, checkGTOPO30Result: function(ele) {
		if (this.aborted)
			return;
		if (ele == -9999) {
			this.callback(null);
			return;
		}
		this.callback(ele);
	}
	, _doRequest: function(url, fCheck) {
		this.abort(true);
		if (! url)
			return;
		this.request = OpenLayers.Request.GET({
			url: './proxy.php' 
			, params: {
				'_proxy_url': url
				, 'lng': this.ll.lon
				, 'lat': this.ll.lat
			}
			, scope: this
			, success: function(request) {
				this[fCheck].call(this, parseInt(request.responseText.replace(/(\n|\r)+$/, ''), 10));
			}
			, failure: function(request) {
				this[fCheck].call(this, null);
			}
		});
	}
	, CLASS_NAME: 'OpenLayers.Elevation'
});

OpenLayers.Elevation.SERVICES = {
	SRTM3: 1
	, ASTERGDEM: 2
	, GTOPO30: 3
};
