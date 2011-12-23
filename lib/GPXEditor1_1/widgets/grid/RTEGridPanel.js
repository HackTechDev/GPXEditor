Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.RTEGridPanel = Ext.extend(GPXEditor1_1.grid.GPXPathGridPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.grid.RTEGridPanel.LOCALES});

		if (! (this.store instanceof GPXEditor1_1.data.RTEStore))
			this.store = new GPXEditor1_1.data.RTEStore();

		GPXEditor1_1.grid.RTEGridPanel.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-grid-RTEGridPanel', GPXEditor1_1.grid.RTEGridPanel);

GPXEditor1_1.grid.RTEGridPanel.LOCALES = Ext.apply({
	DBLCLICK_INFO: 'DBLCLICK_INFO'
}, GPXEditor1_1.grid.GPXPathGridPanel);
