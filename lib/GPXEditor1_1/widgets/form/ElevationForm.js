Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.ElevationForm = Ext.extend(Ext.form.FormPanel, {
	gpxLayer: undefined
	, feature: undefined
	, point: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.form.ElevationForm.LOCALES});

		if (! this.gpxLayer || ! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();

		Ext.applyIf(this, {
			frame: true
			, title: this.LOCALES.TITLE
			, iconCls: 'gpxe-GetElevation'
			, labelWidth: 90
			, defaults: {width: 210}
			, buttons: [{
				text: this.LOCALES.BT_SAVE_TEXT
				, handler: function() {
					if (this.getForm().isValid()) {
						this.doSuccess();
						this.getForm().fireEvent('actioncomplete', this.getForm(), 'success');
					}
				}
				, scope: this
			}
			, {
				text: this.LOCALES.BT_CANCEL_TEXT
				, handler: function() {
					this.getForm().fireEvent('actioncomplete', this.getForm(), 'cancel');
				}
				, scope: this
			}]
			, items: [{
				xtype: 'compositefield'
				, fieldLabel: this.LOCALES.LABEL_ELE
				, items: [{
					xtype: 'numberfield'
					, allowDecimals: false
					, name: 'ele'
				}
				, {
					xtype: 'button'
					, iconCls: 'gpxe-GetElevation'
					, tooltip: this.LOCALES.BT_FINDELE_TOOLTIP
					, form: this
					, handler: function(button, evtObject) {
						if (! this.form.point || ! this.form.feature)
							return;
						var f = this.form.getForm();
						var fEle = f.findField('ele');
						var ll = new OpenLayers.LonLat(this.form.point.x, this.form.point.y);
						ll = ll.transform(this.form.gpxLayer.getGPXMap().getDrawProjection(), this.form.gpxLayer.getGPXMap().getDisplayProjection());
						button.setDisabled(true);
						fEle.setDisabled(true);
						var getEle = new OpenLayers.Elevation(ll, function(ele) {
							if (ele != null) 
								var f = this.form.getForm();
							f.findField('ele').setValue(ele);
							f.findField('ele').setDisabled(false);
							this.setDisabled(false);
						}, button);
					}
				}]
			}]
		});
		GPXEditor1_1.form.ElevationForm.superclass.initComponent.call(this);
	}
	, getGPXLayer: function() {
		return this.gpxLayer;
	}
	, setOpenConfig: function(openConfig) {
		this.feature = openConfig.feature;
		this.point = openConfig.point;
		this.getForm().setValues({
			ele: this.point.ele
		});
	}
	, doSuccess: function() {
		if (! this.feature || ! this.point)
			return;
		var fEle = this.form.findField('ele');
		if (fEle.isDirty()) {
			if (fEle.getValue() && fEle.getValue() != '')
				this.point.ele = fEle.getValue();
			else
				delete this.point.ele;
			this.feature.layer.events.triggerEvent('vertexmodified', {
				vertex: this.point
				, feature: this.feature
			});
			this.feature.layer.events.triggerEvent('featuremodified', {feature: this.feature});
		}
		else if (this.point.ele && fEle.getValue() == '') {
			delete this.point.ele;
			this.feature.layer.events.triggerEvent('vertexmodified', {
				vertex: this.point
				, feature: this.feature
			});
			this.feature.layer.events.triggerEvent('featuremodified', {feature: this.feature});
		}
	}
});
Ext.reg('gpxe-ElevationForm', GPXEditor1_1.form.ElevationForm);

GPXEditor1_1.form.ElevationForm.LOCALES = {
	TITLE: 'TITLE'
	, LABEL_ELE: 'LABEL_ELE'
	, BT_FINDELE_TOOLTIP: 'BT_FINDELE_TOOLTIP'
	, BT_SAVE_TEXT: 'BT_SAVE_TEXT'
	, BT_CANCEL_TEXT: 'BT_CANCEL_TEXT'
};

