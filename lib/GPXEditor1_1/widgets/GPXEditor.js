Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXEditor = Ext.extend(Ext.Panel, {
	gpxMap: undefined
	, editorPanel: undefined
	, editorToolbar: undefined
	, bExpand: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GPXEditor.LOCALES});

		this.gpxMap = new GPXEditor1_1.GPXMap({
			region: 'center'
			, allowEditing: true
			, bbar: {
				xtype: 'gpxe-GPXMapToolbar'
				, style: {
					borderRight: 'none'
				}
			}
		});

		var editorMode = new GPXEditor1_1.EditorMode({gpxLayer: this.gpxMap.getGPXLayer()});

		this.bExpand = new Ext.Button({
			iconCls: 'gpxe-CollapseIcon'
			, tooltip: this.LOCALES.BT_COLLAPSE_EDITOR_TOOLTIP
			, handler: function() {
				this.editorPanel.toggleCollapse(true);
			}
			, scope: this
		});

		this.editorPanel = new GPXEditor1_1.EditorPanel({
			region: 'east'
			, split: true
			, width: 300
			, collapsible: false
			, collapseMode:'mini'
			, editorMode: editorMode
			, gpxLayer: this.gpxMap.getGPXLayer()
		});

		this.editorToolbar = new GPXEditor1_1.EditorToolbar({
			region: 'east'
			, layout: 'vtoolbar'
			, width: 20
			, editorMode: editorMode
			, gpxLayer: this.gpxMap.getGPXLayer()
		});
		this.editorToolbar.insert(0, '-');
		this.editorToolbar.insert(0, ' ');
		this.editorToolbar.insert(0, ' ');
		this.editorToolbar.insert(0, this.bExpand);

		this.editorPanel.on('collapse', function() {
			this.bExpand.setTooltip(this.LOCALES.BT_EXPAND_EDITOR_TOOLTIP);
			this.bExpand.setIconClass('gpxe-ExpandIcon');
		}, this);
		this.editorPanel.on('expand', function() {
			this.bExpand.setTooltip(this.LOCALES.BT_COLLAPSE_EDITOR_TOOLTIP);
			this.bExpand.setIconClass('gpxe-CollapseIcon');
		}, this);

		Ext.applyIf(this, {
			layout: 'border'
			, border: false
			, bodyBorder: false
			/*
			, bodyCfg: {
				cls: 'gpxe-GPXEditor'
			}
			*/
			, items: [{
				region: 'center'
				, xtype: 'panel'
				, layout: 'border'
				, border: false
				, items: [this.gpxMap, this.editorToolbar]
			}, this.editorPanel]
		});
		GPXEditor1_1.GPXEditor.superclass.initComponent.call(this);
	},
	getGPXMap: function() {
		return this.gpxMap;
	},
	getEditorPanel: function() {
		return this.editorPanel;
	},
	getEditorToolbar: function() {
		return this.editorToolbar;
	}
});
Ext.reg('gpxe-GPXEditor', GPXEditor1_1.GPXEditor);

GPXEditor1_1.GPXEditor.LOCALES = {
	BT_COLLAPSE_EDITOR_TOOLTIP: 'BT_COLLAPSE_EDITOR_TOOLTIP'
	, BT_EXPAND_EDITOR_TOOLTIP: 'BT_EXPAND_EDITOR_TOOLTIP'
};
