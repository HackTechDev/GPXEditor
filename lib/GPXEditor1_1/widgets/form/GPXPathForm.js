Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.GPXPathForm = Ext.extend(GPXEditor1_1.form.GPXElementForm, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.form.GPXPathForm.LOCALES});

		GPXEditor1_1.form.GPXPathForm.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-GPXPathForm', GPXEditor1_1.form.GPXPathForm);

GPXEditor1_1.form.GPXPathForm.LOCALES = Ext.applyIf({
	WHAT_TITLE_PART: 'WHAT_TITLE_PART'
}, GPXEditor1_1.form.GPXElementForm.LOCALES);
