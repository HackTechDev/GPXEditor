Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.GPXElementForm = Ext.extend(Ext.form.FormPanel, {
	mode: undefined
	, record: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.form.GPXElementForm.LOCALES});

		Ext.applyIf(this, {
			frame: true
			, labelWidth: 90
			, defaults: {width: 210}
			, mode: GPXEditor1_1.form.GPXElementForm.MODES.MDF
			, items: this._initItems()
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
		});
		Ext.applyIf(this, {title: this.LOCALES[this.mode + '_TITLE_PART'] + ' ' + this.LOCALES.WHAT_TITLE_PART});

		GPXEditor1_1.form.GPXElementForm.superclass.initComponent.call(this);
	}
	, setOpenConfig: function(openConfig) {
		if (openConfig && 'record' in openConfig)
			this.setRecord(openConfig.record);
	}
	, setRecord: function(record) {
		this.record = record;
		this.getForm().loadRecord(record);
	}
	, doSuccess: function() {
		if (this.record) {
			this.getForm().updateRecord(this.record);
			if (this.record.get('desc').length == 0)
				this.record.set('desc', null);
			this.record.commit();
		}
	}
	, _initItems: function() {
		return [{
			xtype: 'textfield'
			, fieldLabel: GPXEditor1_1.data.GPXElementRecord.LOCALES.FIELD_NAME_NAME
			, name: 'name'
		}, {
			xtype: 'textarea'
			, fieldLabel: GPXEditor1_1.data.GPXElementRecord.LOCALES.FIELD_DESC_NAME
			, name: 'desc'
		}]
	}
});
Ext.reg('gpxe-GPXElementForm', GPXEditor1_1.form.GPXElementForm);

GPXEditor1_1.form.GPXElementForm.MODES = {
	ADD: 'ADD'
	, MDF: 'MDF'
};

GPXEditor1_1.form.GPXElementForm.LOCALES = {
	ADD_TITLE_PART: 'ADD_TITLE_PART'
	, MDF_TITLE_PART: 'MDF_TITLE_PART'
	, WHAT_TITLE_PART: 'WHAT_TITLE_PART'
	, BT_SAVE_TEXT: 'BT_SAVE_TEXT'
	, BT_CANCEL_TEXT: 'BT_CANCEL_TEXT'
};
