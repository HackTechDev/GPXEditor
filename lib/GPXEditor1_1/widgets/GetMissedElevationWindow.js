Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GetMissedElevationWindow = Ext.extend(Ext.Window, {
	gpxLayer: undefined
	, pb: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GetMissedElevationWindow.LOCALES});

		this.changeModeActions = {};

		if (! this.gpxLayer || ! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();

		this.pb = new Ext.ProgressBar({});
		Ext.apply(this, {
			forceLayout: true
			, autoHeight: true
			, resizable: false
			, closeAction: 'hide'
			, border: false
			, bodyBorder: false
			, plain: true
			, layout: 'fit'
			, title: this.LOCALES.WINDOW_TITLE
			, width: 300
			, modal: true
			, items: [this.pb]
			, buttons: [{
				text: this.LOCALES.BT_ABORT_TEXT
				, handler: function() {
					this.hide();	
				}
				, scope: this
			}]
		});
		GPXEditor1_1.GetMissedElevationWindow.superclass.initComponent.call(this);
	}
	, show: function(feature, animEle, callback, scope) {
		GPXEditor1_1.GetMissedElevationWindow.superclass.show.call(this, animEle, callback, scope);
		this.feature = feature;
		this.wpts = this.feature.geometry.getVertices();
		this.idx = 0;
		this.pb.updateProgress((this.idx + 1) / this.wpts.length, this.LOCALES.PBAR_MSG
		        + ' ' + (this.idx + 1) + '/' + this.wpts.length, false);
		window.setTimeout(this.doGetElevations.createDelegate(this), 200);
	}
	, doGetElevations: function() {
		if (! this.wpts || this.idx >= this.wpts.length) {
			if (this.feature && this.feature.layer) {
				this.feature.layer.events.triggerEvent('featuremodified', {feature: this.feature});
				this.feature.layer.events.triggerEvent('afterfeaturemodified', {feature: this.feature});
			}
			this.hide();
			return;
		}
		if (! this.isVisible()) {
			if (this.feature && this.feature.layer) {
				this.feature.layer.events.triggerEvent('featuremodified', {feature: this.feature});
				this.feature.layer.events.triggerEvent('afterfeaturemodified', {feature: this.feature});
			}
			return;
		}
		if (! this.wpts[this.idx].ele) {
			this.pb.updateProgress((this.idx + 1) / this.wpts.length, this.LOCALES.PBAR_MSG 
				+ ' ' + (this.idx + 1) + '/' + this.wpts.length, true);
			var ll = new OpenLayers.LonLat(this.wpts[this.idx].x, this.wpts[this.idx].y);
			ll = ll.transform(this.gpxLayer.getGPXMap().getDrawProjection(), this.gpxLayer.getGPXMap().getDisplayProjection());
			var getEle = new OpenLayers.Elevation(ll, function(ele) {
				if (ele != null) {
					this.wpts[this.idx].ele = ele;
					if (this.feature && this.feature.layer) {
						this.feature.layer.events.triggerEvent('vertexmodified', {
							vertex: this.wpts[this.idx]
							, feature: this.feature
						});
					}
				}
				this.idx++;
				this.doGetElevations();
			}, this);
		} else {
			this.idx++;
			this.doGetElevations();
		}
	}
});
Ext.reg('gpxe-GetMissedElevationWindow', GPXEditor1_1.GetMissedElevationWindow);

GPXEditor1_1.GetMissedElevationWindow.LOCALES = {
	WINDOW_TITLE: 'WINDOW_TITLE',
	PBAR_MSG: 'PBAR_MSG',
	BT_ABORT_TEXT: 'BT_ABORT_TEXT'
};
