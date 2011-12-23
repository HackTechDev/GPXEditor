Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.TRKForm = Ext.extend(GPXEditor1_1.form.GPXPathForm, {
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.form.TRKForm.LOCALES
			, iconCls: 'gpxe-TrkIcon'
		});

		GPXEditor1_1.form.TRKForm.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-TRKForm', GPXEditor1_1.form.TRKForm);

GPXEditor1_1.form.TRKForm.LOCALES = Ext.applyIf({
	WHAT_TITLE_PART: 'WHAT_TITLE_PART'
}, GPXEditor1_1.form.GPXPathForm.LOCALES);
