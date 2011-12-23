Ext.namespace('GPXEditor1_1.WPTInfo');

GPXEditor1_1.WPTInfo = Ext.extend(GPXEditor1_1.ElementInfo, {
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.WPTInfo.LOCALES;

		GPXEditor1_1.WPTInfo.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-WPTInfo', GPXEditor1_1.WPTInfo);

GPXEditor1_1.WPTInfo.LOCALES = {
};
