Ext.namespace('GPXEditor1_1');

GPXEditor1_1.EditorPanel = Ext.extend(Ext.Panel, {
	gpxLayer: undefined
	, editorMode: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.EditorPanel.LOCALES});

		if (! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();

		if (! (this.editorMode instanceof GPXEditor1_1.EditorMode))
			this.editorMode = new GPXEditor1_1.EditorMode(
				{gpxLayer: this.gpxLayer}
			);
		if (this.editorMode.getGPXLayer() !== this.gpxLayer)
			this.editorMode.setGPXLayer(this.gpxLayer);
		this.editorMode.on('modechange', function(mode, editorMode) {
			this.showEditor(mode);
		}, this);

		Ext.applyIf(this, {
			border: false
			, layout: 'card'
			, activeItem: 0
			, items: [
				{
					xtype: 'gpxe-GPXElementEditorPanel'
					, title: this.editorMode.LOCALES.ACTION_SETMODE_WPT_TOOLTIP
					, iconCls: 'gpxe-WptIcon'
					, gridPanel: new GPXEditor1_1.grid.WPTGridPanel({
						store: this.gpxLayer.getWptStore()
						, gpxLayer: this.gpxLayer
						, border: false
						, sm: new GPXEditor1_1.grid.GPXElementSelectionModel({
							selectControl: this.gpxLayer.getOLSelectControl()
						})
						, tbar: [
							'->'
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.EDIT_WPT)
							, ' '
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.DEL_WPT)
						]
					})
					, detailPanel: new GPXEditor1_1.WPTDetailPanel()
				}
				, {
					xtype: 'gpxe-GPXElementEditorPanel'
					, title: this.editorMode.LOCALES.ACTION_SETMODE_RTE_TOOLTIP
					, iconCls: 'gpxe-RteIcon'
					, gridPanel: new GPXEditor1_1.grid.RTEGridPanel({
						store: this.gpxLayer.getRteStore()
						, gpxLayer: this.gpxLayer
						, border: false
						, sm: new GPXEditor1_1.grid.GPXElementSelectionModel({
							selectControl: this.gpxLayer.getOLSelectControl()
						})
						, tbar: [
							'->'
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.EDIT_RTE)
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.GET_MISSED_ELE)
							, ' '
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.DEL_RTE)
						]
					})
					, detailPanel: new GPXEditor1_1.GPXPathDetailPanel()
				}
				, {
					xtype: 'gpxe-GPXElementEditorPanel'
					, title: this.editorMode.LOCALES.ACTION_SETMODE_TRK_TOOLTIP
					, iconCls: 'gpxe-TrkIcon'
					, gridPanel: new GPXEditor1_1.grid.TRKGridPanel({
						store: this.gpxLayer.getTrkStore()
						, gpxLayer: this.gpxLayer
						, border: false
						, sm: new GPXEditor1_1.grid.GPXElementSelectionModel({
							selectControl: this.gpxLayer.getOLSelectControl()
						})
						, tbar: [
							'->'
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.EDIT_TRK)
							, ' '
							, this.gpxLayer.getGPXAction(GPXEditor1_1.GPXLayer.ACTIONS.DEL_TRK)
						]
					})
					, detailPanel: new GPXEditor1_1.TRKDetailPanel()
				}
			]
				/*
				items: [{
					region: 'center',
					bodyStyle: {
						marginBottom: '5px'
					},
					xtype: 'gpxe-WPTGrid',
					mapPanel: this.mapPanel,
					title: this.LOCALES.ACTION_SETMODE_WPT_TOOLTIP,
					iconCls: 'gpxe-WptIcon'
				}, {
					region: 'south',
					collapsible: true,
					frame: true,
					xtype: 'gpxe-WPTInfo',
				}]
			}, {
		//		xtype: 'gpxe-RTESEditor',
		//		mapPanel: this.mapPanel,
				html: 'rtes',
				frame: true,
				title: this.LOCALES.ACTION_SETMODE_RTE_TOOLTIP,
				iconCls: 'gpxe-RteIcon'
			}, {
//				xtype: 'gpxe-TRKSEditor',
//				mapPanel: this.mapPanel,
				html: 'trks',
				frame: true,
				title: this.LOCALES.ACTION_SETMODE_TRK_TOOLTIP,
				iconCls: 'gpxe-TrkIcon'
			}]
			*/
		});
		GPXEditor1_1.EditorPanel.superclass.initComponent.call(this);
	}
	, showEditor: function(mode) {
		var modes = GPXEditor1_1.EditorMode.MODES;
		var idx = 0;
		switch (mode) {
			case modes.WPTS:
				idx = 0;
				break;
			case modes.RTES:
				idx = 1;
				break;
			case modes.TRKS:
				idx = 2;
				break;
		}
		this.getLayout().setActiveItem(idx);
	}
});

Ext.reg('gpxe-EditorPanel', GPXEditor1_1.EditorPanel);

GPXEditor1_1.EditorPanel.LOCALES = {
/*
	ACTION_SETMODE_WPT_TEXT: 'ACTION_SETMODE_WPT_TEXT',
	ACTION_SETMODE_WPT_TOOLTIP: 'ACTION_SETMODE_WPT_TOOLTIP',
	ACTION_SETMODE_RTE_TEXT: 'ACTION_SETMODE_RTE_TEXT',
	ACTION_SETMODE_RTE_TOOLTIP: 'ACTION_SETMODE_RTE_TOOLTIP',
	ACTION_SETMODE_TRK_TEXT: 'ACTION_SETMODE_TRK_TEXT',
	ACTION_SETMODE_TRK_TOOLTIP: 'ACTION_SETMODE_TRK_TOOLTIP'
	*/
};
