Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.FormWindow = Ext.extend(Ext.Window, {
	initComponent: function() {
		if (this.formPanel) {
			if (! (this.formPanel instanceof Ext.form.FormPanel)) 
				this.formPanel = Ext.create(this.formPanel);
			Ext.applyIf(this, {
				title: this.formPanel.title
				, iconCls: this.formPanel.iconCls
			});
			this.getForm().on('actioncomplete', function() { this.hide(); }, this);
		}
		Ext.apply(this, {
			forceLayout: true
			, autoHeight: true
			, resizable: false
			, closeAction: 'hide'
			, border: false
			, bodyBorder: false
			, plain: true
			, layout: 'fit'
			, items: [this.formPanel]
		});
		GPXEditor1_1.form.FormWindow.superclass.initComponent.call(this);
		this.on('beforeshow', function() {
			if (this.formPanel)
				this.formPanel.fireEvent('beforeshow', this.form);
		}, this);
	}
	, getFormPanel: function() {
		return this.formPanel;
	}
	, getForm: function() {
		if (this.formPanel)
			return this.formPanel.getForm();
		return null;
	}
	, show: function(openConfig) {
		this.getFormPanel().setOpenConfig(openConfig);
		GPXEditor1_1.form.FormWindow.superclass.show.call(this);
	}
});
Ext.reg('gpxe-FormWindow', GPXEditor1_1.form.FormWindow);
