Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXEditorPanel = Ext.extend(Ext.Panel, {
	gpxLayer: undefined
	, editorMode: undefined
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.EditorToolbar.LOCALES});

		if (! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();
		GPXEditor1_1.GPXEditorPanel.superclass.initComponent.call(this);
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	getEditorPanel: function() {
		return this.editorPanel;
	},
	getEditorToolbar: function() {
		return this.editorToolbar;
	}
});

Ext.reg('gpxe-GPXEditorPanel', GPXEditor1_1.GPXEditorPanel);
