Ext.namespace('GPXEditor1_1');

GPXEditor1_1.ElementEditor = Ext.extend(Ext.Panel, {
	mapPanel: undefined,
	gridPanel: undefined,
	infoPanel: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.ElementEditor.LOCALES;
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		if (! this.gridPanel || ! (this.gridPanel instanceof GPXEditor1_1.grid.ElementGrid))
			this.gridPanel = new GPXEditor1_1.grid.ElementGrid();
		if (! this.infoPanel || ! (this.infoPanel instanceof GPXEditor1_1.ElementInfo))
			this.infoPanel = new GPXEditor1_1.ElementInfo();
		Ext.apply(this.gridPanel, {
			region: 'center'
		});
		Ext.apply(this.infoPanel, {
			region: 'south'
		});
		Ext.apply(this, {
			layout: 'border',
			items: [this.gridPanel, this.infoPanel]
		});
		GPXEditor1_1.ElementEditor.superclass.initComponent.call(this);
	},
	getGrid: function() {
		return this.gridPanel;
	},
	getInfo: function() {
		return this.infoPanel;
	}
});
Ext.reg('gpxe-ElementEditor', GPXEditor1_1.ElementEditor);

GPXEditor1_1.ElementEditor.LOCALES = {
};

