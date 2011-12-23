Ext.namespace('GPXEditor1_1');

GPXEditor1_1.EditorMode = Ext.extend(Ext.util.Observable, {
	mode: undefined
	, gpxLayer: undefined
	, changeModeActions: undefined
	, constructor: function(config) {
		config = config || {};
		this.LOCALES = GPXEditor1_1.EditorMode.LOCALES;

		this.changeModeActions = [];

		this.mode = (config.mode in GPXEditor1_1.EditorMode.MODES) ?
			config.mode : GPXEditor1_1.EditorMode.MODES.WPTS;
		delete config.mode;
		
		var gpxLayer = config.gpxLayer;
		delete config.gpxLayer;

		this.addEvents({
			modechange: true
			, gpxlayerchange: true
		});
		this.listeners = config.listeners;

		GPXEditor1_1.EditorMode.superclass.constructor.call(this, config);

		this.setGPXLayer(gpxLayer);
	}
	, setGPXLayer: function(gpxLayer) {
		if (this.gpxLayer === gpxLayer)
			return;
		if (this.gpxLayer)
			this.gpxLayer.un('gpxelementselectionchange', this._onGPXElementSelectionChange, this);
		this.gpxLayer = gpxLayer;
		if (this.gpxLayer)
			this.gpxLayer.on('gpxelementselectionchange', this._onGPXElementSelectionChange, this);
		this.fireEvent('gpxlayerchange', this.gpxLayer, this);
	}
	, getGPXLayer: function() {
		return this.gpxLayer;
	}
	, setMode: function(mode) {
		var definedModes = GPXEditor1_1.EditorMode.MODES;
		if (! mode || ! (mode in definedModes))
			mode = definedModes.WPTS;
		if (this.mode == mode)
			return;
		this.mode = mode;
		var action = this.changeModeActions[mode];
		if (action)
			action.toggle(true);
		if (this.gpxLayer && this.gpxLayer.getGPXMap())
			this.gpxLayer.getGPXMap().setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
		this.fireEvent('modechange', this.mode, this);
	}
	, getMode: function() {
		return this.mode;
	}
	, getChangeModeAction: function(modeId) {
		if (! this.changeModeActions[modeId]) {
			var definedModes = GPXEditor1_1.EditorMode.MODES;
			var actionGroup = GPXEditor1_1.EditorMode.MODE_ACTION_GROUP;
			switch (modeId) {
				case definedModes.WPTS:
					this.changeModeActions[definedModes.WPTS] = new Ext.Action({
						toggleGroup: actionGroup
						, allowDepress: false
						, pressed: true
						, checked: true
						, iconCls: 'gpxe-WptIcon'
						, text: this.LOCALES.ACTION_SETMODE_WPT_TEXT
						, tooltip: this.LOCALES.ACTION_SETMODE_WPT_TOOLTIP
						, handler: function() { this.setMode(definedModes.WPTS); }
						, scope: this
					});
					break;
				case definedModes.RTES:
					this.changeModeActions[definedModes.RTES] = new Ext.Action({
						toggleGroup: actionGroup
						, allowDepress: false
						, pressed: false
						, checked: false
						, iconCls: 'gpxe-RteIcon'
						, text: this.LOCALES.ACTION_SETMODE_RTE_TEXT
						, tooltip: this.LOCALES.ACTION_SETMODE_RTE_TOOLTIP
						, handler: function() { this.setMode(definedModes.RTES); }
						, scope: this
					});
					break;
				case definedModes.TRKS:
					this.changeModeActions[definedModes.TRKS] = new Ext.Action({
						toggleGroup: actionGroup
						, allowDepress: false
						, pressed: false
						, checked: false
						, iconCls: 'gpxe-TrkIcon'
						, text: this.LOCALES.ACTION_SETMODE_TRK_TEXT
						, tooltip: this.LOCALES.ACTION_SETMODE_TRK_TOOLTIP
						, handler: function() { this.setMode(definedModes.TRKS); }
						, scope: this
					});
					break;
			}
		}
		return this.changeModeActions[modeId];
	}
	, _onGPXElementSelectionChange: function(gpxElement, gpxLayer) {
		var definedModes = GPXEditor1_1.EditorMode.MODES;
		if (! gpxElement)
			return;
		if (gpxElement instanceof GPXEditor1_1.data.WPTRecord)
			this.setMode(definedModes.WPTS);
		else if (gpxElement instanceof GPXEditor1_1.data.RTERecord)
			this.setMode(definedModes.RTES);
		else if (gpxElement instanceof GPXEditor1_1.data.TRKRecord)
			this.setMode(definedModes.TRKS);
	}
});

GPXEditor1_1.EditorMode.MODE_ACTION_GROUP = 'GPXEditor1_1.EditorMode.MODE_ACTION_GROUP';

GPXEditor1_1.EditorMode.MODES = {
	WPTS: 'WPTS'
	, RTES: 'RTES'
	, TRKS: 'TRKS'
};

GPXEditor1_1.EditorMode.LOCALES = {
	ACTION_SETMODE_WPT_TEXT: 'ACTION_SETMODE_WPT_TEXT'
	, ACTION_SETMODE_WPT_TOOLTIP: 'ACTION_SETMODE_WPT_TOOLTIP'
	, ACTION_SETMODE_RTE_TEXT: 'ACTION_SETMODE_RTE_TEXT'
	, ACTION_SETMODE_RTE_TOOLTIP: 'ACTION_SETMODE_RTE_TOOLTIP'
	, ACTION_SETMODE_TRK_TEXT: 'ACTION_SETMODE_TRK_TEXT'
	, ACTION_SETMODE_TRK_TOOLTIP: 'ACTION_SETMODE_TRK_TOOLTIP'
};
