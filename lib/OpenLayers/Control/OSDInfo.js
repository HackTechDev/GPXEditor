OpenLayers.Control.OSDInfo = OpenLayers.Class(OpenLayers.Control, {
	element: null,
	style: 'gpxe-OSDInfo',
	isFollowMouse: false,
	infoGen: null,
	lastPos: null,
	initialize: function(options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.deactivate();
		options = options || {};
		if ('className' in options)
			this.style += ' ' + options.className;
		this.element = document.createElement('element');
		this.element.style.position = 'absolute';
		this.element.style.zIndex = 500000000;
		this.element.className = this.style;
		OpenLayers.Element.toggle(this.element);
		if ('info' in options)
			this.setInfo(options.info);
		if ('isFollowMouse' in options)
			this.isFollowMouse = options.isFollowMouse;
		if ('infoGen' in options)
			this.infoGen = options.infoGen;
	},
	followMouse: function() {
		if (this.isFollowMouse)
			return;
		this.isFollowMouse = true;
		this.map.events.register('mousemove', this, this.update);
	},
	stick: function() {
		if (! this.isFollowMouse)
			return;
		this.map.events.unregister('mousemove', this, this.update);
		this.isFollowMouse = false;
	},
	setInfo: function(text, px) {
		var body = '';
		var title = '';
		var lp = px || this.lastPos;
		this.moveTo(new OpenLayers.Pixel(0, 0));
		if (typeof text == 'string') {
			body += '<div class="gpxe-OSDInfoBody">' + text + '</div>';
		} else {
			title += '<div class="gpxe-OSDInfoTitle">';
			if (text.titleRight) 
				title += '<table class="gpxe-OSDInfoTitleTable"><tr><td class="gpxe-OSDInfoTitleLeftCell">';
			title += text.title;
			if (text.titleRight)
				title += '</td><td class="gpxe-OSDInfoTitleRightCell">' + text.titleRight + '</td></tr></table>';
			title += '</div>';
			body += '<div class="gpxe-OSDInfoBody">' + text.body + '</div>';
		}
		this.element.innerHTML = title + body;
		if (px)
			this.activateTo(px);
		else
			this.moveTo(lp);
	},
	draw: function(px) {
		return this.element;
	},
	activateTo: function(px) {
		this.activate();
		this.moveTo(px);
	},
	update: function(evt) {
		if (! this.activate)
			return;
		if (this.infoGen)
			this.setInfo(this.infoGen(evt));
		this.moveTo(evt.xy);
	},
	replace: function(px) {
		this.moveTo();
	},
	moveTo: function(px) {
		if (! px && this.lastPos) {
			var npos = this.lastPos.clone();
			npos.transform(this.map.displayProjection, this.map.getProjectionObject());
			px = this.map.getPixelFromLonLat(npos);
		}
		var cstyle = this.style + ' gpxe-OSDInfo';
		var mdim = OpenLayers.Element.getDimensions(this.element.parentNode);
		var edim = OpenLayers.Element.getDimensions(this.element);
		var l = px.x;
		var t = px.y;
		if (px.y < mdim.height / 2) {
			t += 5;
			cstyle += 'Top';
		}
		else {
			t -= (edim.height + 5);
			cstyle += 'Bottom';
		}
		if (px.x > mdim.width / 2) {
			l -= (edim.width + 5);
			cstyle += 'Right';
		}
		else {
			l += 5;
			cstyle += 'Left';
		}
		this.element.className = cstyle;
		this.element.style.left = l + 'px';
		this.element.style.top = t + 'px';
		this.lastPos = this.map.getLonLatFromPixel(px);
		this.lastPos.transform(this.map.getProjectionObject(), this.map.displayProjection);
	},
	activate: function() {
		if (OpenLayers.Control.prototype.activate.apply(this)) {
			if (this.element && ! OpenLayers.Element.visible(this.element))
				OpenLayers.Element.toggle(this.element);
			if (this.isFollowMouse)
				this.map.events.register('mousemove', this, this.update);
			this.map.events.register('moveend', this, this.replace);
			this.draw();
			return true;
		}
		return false;
	},
	deactivate: function() {
		if (OpenLayers.Control.prototype.deactivate.apply(this)) {
			if (this.element && OpenLayers.Element.visible(this.element))
				OpenLayers.Element.toggle(this.element);
			if (this.isFollowMouse)
				this.map.events.unregister('mousemove', this, this.update);
			this.map.events.unregister('moveend', this, this.replace);
			return true;
		}
	},
	CLASS_NAME: 'OpenLayers.Control.OSDInfo'
});
