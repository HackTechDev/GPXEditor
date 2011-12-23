Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.StatGrid = Ext.extend(Ext.grid.GridPanel, {
	initComponent: function() {
		Ext.apply(this, {
			
		});
		GPXEditor1_1.grid.StatGrid.superclass.initComponent.call(this);
	},
});
Ext.reg('gpxe-StatGrid', GPXEditor1_1.grid.StatGrid);
