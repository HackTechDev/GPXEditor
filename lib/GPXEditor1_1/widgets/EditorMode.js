Ext.namespace('GPXEditor1_1');

GPXEditor1_1.EditorMode = Ext.extend(Ext.util.Observable, {
	mapPanel: undefined,
	changeModeActions: undefined,
	mode: undefined,
	constructor: function(config) {
		config = config || {};

		this.LOCALES = GPXEditor1_1.EditorMode.LOCALES;

		if (! config.mapPanel || ! (config.mapPanel instanceof GPXEditor1_1.MapPanel))
			config.mapPanel = new GPXEditor1_1.MapPanel();
		this.mapPanel = config.mapPanel;
		delete config.mapPanel;

		this.changeModeActions = {};

		this.mode = GPXEditor1_1.EditorMode.MODES.WPTS;

		this.addEvents({
			'modechanged': true
		});
		this.listeners = config.listeners;

		GPXEditor1_1.EditorMode.superclass.constructor.call(this, config);

		this.mapPanel.getGPXLayer().events.register('featureselected', this, function(obj) {
			if (obj.feature) {
				if (obj.feature.geometry instanceof OpenLayers.Geometry.Point)
					this.setMode(GPXEditor1_1.EditorMode.MODES.WPTS);
				else if (obj.feature.geometry instanceof OpenLayers.Geometry.LineString)
					this.setMode(GPXEditor1_1.EditorMode.MODES.RTES);
				else if (obj.feature.geometry instanceof OpenLayers.Geometry.MultiLineString)
					this.setMode(GPXEditor1_1.EditorMode.MODES.TRKS);
			}
		});
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	setMode: function(mode) {
		if (this.mode == mode)
			return;
		this.mode = mode;
		this.fireEvent('modeChange', mode);
	},
	getMode: function() {
		return this.mode;
	},
	getChangeModeAction: function(modeId) {
		if (! this.changeModeActions[modeId]) {
			var definedModes = GPXEditor1_1.EditorMode.MODES;
			switch (modeId) {
				case definedModes.WPTS:
					this.changeModeActions[definedModes.WPTS] = new Ext.Action({
						toggleGroup: 'editorMode',
						allowDepress: false,
						pressed: true,
						checked: true,
						iconCls: 'gpxe-WptIcon',
						text: this.LOCALES.ACTION_SETMODE_WPT_TEXT,
						tooltip: this.LOCALES.ACTION_SETMODE_WPT_TOOLTIP,
						handler: function() { this.setMode(definedModes.WPTS); },
						scope: this
					});
					break;
				case definedModes.RTES:
					this.changeModeActions[definedModes.RTES] = new Ext.Action({
						toggleGroup: 'editorMode',
						allowDepress: false,
						pressed: false,
						checked: false,
						iconCls: 'gpxe-RteIcon',
						text: this.LOCALES.ACTION_SETMODE_RTE_TEXT,
						tooltip: this.LOCALES.ACTION_SETMODE_RTE_TOOLTIP,
						handler: function() { this.setMode(definedModes.RTES); },
						scope: this
					});
					break;
				case definedModes.TRKS:
					this.changeModeActions[definedModes.TRKS] = new Ext.Action({
						toggleGroup: 'editorMode',
						allowDepress: false,
						pressed: false,
						checked: false,
						iconCls: 'gpxe-TrkIcon',
						text: this.LOCALES.ACTION_SETMODE_TRK_TEXT,
						tooltip: this.LOCALES.ACTION_SETMODE_TRK_TOOLTIP,
						handler: function() { this.setMode(definedModes.TRKS); },
						scope: this
					});
					break;
			}
		}
		return this.changeModeActions[modeId];
	}
});
Ext.reg('gpxe-EditorMode', GPXEditor1_1.EditorPanel);

GPXEditor1_1.EditorMode.MODES = {
	WPTS: 0
	, RTES: 1
	, TRKS: 2
};

GPXEditor1_1.EditorMode.LOCALES = {
	, ACTION_SETMODE_WPT_TEXT: 'ACTION_SETMODE_WPT_TEXT'
	, ACTION_SETMODE_WPT_TOOLTIP: 'ACTION_SETMODE_WPT_TOOLTIP'
	, ACTION_SETMODE_RTE_TEXT: 'ACTION_SETMODE_RTE_TEXT'
	, ACTION_SETMODE_RTE_TOOLTIP: 'ACTION_SETMODE_RTE_TOOLTIP'
	, ACTION_SETMODE_TRK_TEXT: 'ACTION_SETMODE_TRK_TEXT'
	, ACTION_SETMODE_TRK_TOOLTIP: 'ACTION_SETMODE_TRK_TOOLTIP'
};
