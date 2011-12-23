Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXElementEditorPanel = Ext.extend(Ext.Panel, {
	gridPanel: undefined
	, detailPanel: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.EditorPanel.LOCALES});

		if (! (this.gridPanel instanceof GPXEditor1_1.grid.GPXElementGridPanel))
			this.gridPanel = new GPXEditor1_1.gridPanel.GPXElementGridPanel();

		if (! (this.detailPanel instanceof GPXEditor1_1.GPXElementDetailPanel))
			this.detailPanel = new GPXEditor1_1.GPXElementDetailPanel();

		this.gridPanel.getSelectionModel().on('selectionchange', function(selectionModel) {
			this.detailPanel.setGPXElementRecord(selectionModel.getSelected());
			if (! this.detailPanel.getGPXElementRecord())
				this.detailPanel.disable();
			else
				this.detailPanel.enable();
			this.doLayout();
		}, this);

		Ext.apply(this.gridPanel, {
			region: 'center'
			, bodyStyle: {
				marginBottom: '5px'
			}
		});

		Ext.apply(this.detailPanel, {
			region: 'south'
			, autoHeight: true
			, gpxElementRecord: null
		});

		Ext.apply(this, {
			layout: 'border'
			, frame: true
			, items: [
				this.gridPanel
				, this.detailPanel
			]
		});

		GPXEditor1_1.GPXElementEditorPanel.superclass.initComponent.call(this);
	}
	, getGridPanel: function() {
		return this.gridPanel;
	}
	, getDetailPanel: function() {
		return this.detailPanel;
	}
});
Ext.reg('gpxe-GPXElementEditorPanel', GPXEditor1_1.GPXElementEditorPanel);

GPXEditor1_1.GPXElementEditorPanel.LOCALES = {
};
