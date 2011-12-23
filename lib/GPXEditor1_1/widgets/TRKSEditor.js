Ext.namespace('GPXEditor1_1');

GPXEditor1_1.TRKSEditor = Ext.extend(Ext.Panel, {
	mapPanel: undefined,
	trksGrid: undefined,
	statGrid: undefined,
	statChart: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.TRKSEditor.LOCALES;
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		this.trksGrid = new GPXEditor1_1.grid.TRKSGrid({
			region: 'north',
			mapPanel: this.mapPanel,
			bodyStyle: {
				border: 'solid 1px #99bbe8'
			},
			height: 150
		});
		this.statGrid = new GPXEditor1_1.grid.StatGrid({
			region: 'center',
			disabled: true,
			mapPanel: this.mapPanel,
			margins: '5 0 5 0',
			bodyStyle: {
				border: 'solid 1px #99bbe8'
			}
		});
		this.statChart = new GPXEditor1_1.chart.StatChart({
			region: 'south',
			disabled: true,
			height: 100,
			mapPanel: this.mapPanel
		});
		Ext.applyIf(this, {
			layout: 'border',
			items: [
				this.trksGrid,
				this.statGrid,
				this.statChart
			]
		});
		GPXEditor1_1.TRKSEditor.superclass.initComponent.call(this);
		this.trksGrid.getSelectionModel().on('selectionChange', function (sm) {
			var r = sm.getSelected();
			if (! r) {
				this.statGrid.reconfigure(this.statGrid.getDefaultStore(), new Ext.grid.ColumnModel(this.statGrid.getDefaultColumns()));
				this.statGrid.disable();
				this.statChart.bindStore(this.statChart.getDefaultStore());
				this.statChart.disable();
			}
			else {
				this.statGrid.enable();
				this.statGrid.reconfigure(r.get('feature').statStore, new Ext.grid.ColumnModel(this.statGrid.getDefaultColumns()));
				this.statChart.enable();
				this.statChart.bindStore(r.get('feature').statStore);
			}
		}, this);
	}
});
Ext.reg('gpxe-TRKSEditor', GPXEditor1_1.TRKSEditor);

GPXEditor1_1.TRKSEditor.LOCALES = {
};

