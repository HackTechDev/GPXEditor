Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.RTEForm = Ext.extend(GPXEditor1_1.form.GPXPathForm, {
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.form.RTEForm.LOCALES
			, iconCls: 'gpxe-RteIcon'
		});

		GPXEditor1_1.form.RTEForm.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-RTEForm', GPXEditor1_1.form.RTEForm);

GPXEditor1_1.form.RTEForm.LOCALES = Ext.applyIf({
	WHAT_TITLE_PART: 'WHAT_TITLE_PART'
}, GPXEditor1_1.form.GPXPathForm.LOCALES);
