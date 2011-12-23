Ext.namespace('GPXEditor1_1');

GPXEditor1_1.EditorToolbar = Ext.extend(Ext.Toolbar, {
	gpxLayer: undefined
	, editorMode: undefined
	, winAbout: undefined
	, bExpand: undefined
	, bLoadGPX: undefined
	, bSaveGPX: undefined
	, bDeleteGPX: undefined
	, bZoomGPX: undefined
	, bSetModeWPTS: undefined
	, bSetModeRTES: undefined
	, bSetModeTRKS: undefined
	, bNavigate: undefined
	, bAddWpt: undefined
	, bEditWpt: undefined
	, bDeleteWpt: undefined
	, bAddRte: undefined
	, bEditRte: undefined
	, bSwapRte: undefined
	, bDeleteRte: undefined
	, bConvertRte: undefined
	, bEditTrk: undefined
	, bDeleteTrk: undefined
	, bConvertTrk: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.EditorToolbar.LOCALES});

		if (! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();

		if (! (this.editorMode instanceof GPXEditor1_1.EditorMode))
			this.editorMode = new GPXEditor1_1.EditorMode(
				{gpxLayer: this.gpxLayer}
			);
		if (this.editorMode.getGPXLayer() !== this.gpxLayer)
			this.editorMode.setGPXLayer(this.gpxLayer);
		this.editorMode.on('modechange', function(mode, editorMode) {
			this.updateButtonsVisibility();
		}, this);

		this._initButtons();

		this.winAbout = new Ext.Window({
			title: this.LOCALES.BT_ABOUT_TOOLTIP
			, forceLayout: true
			, layout: 'fit'
			, closeAction: 'hide'
			, modal: true
			, width: 460
			, autoHeight: true
			, items: [{
				xtype: 'panel'
				, border: false
				, bodyBorder: false
				, margins: 10
				, contentEl: 'gpxe-aboutGPXEditor1_1'
				, autoScroll: true
			}]
			, listeners: {
				show: function() { Ext.get('gpxe-aboutGPXEditor1_1').show(); }
				, scope: this
			}
		});

		Ext.applyIf(this, {
			cls: 'gpxe-EditorToolbar',
			items: [
				' '
			/*
				this.bExpand ? this.bExpand, ' ' : ' '
				, ' ', '-'
				*/
				, this.bLoadGPX, this.bSaveGPX, this.bDeleteGPX, this.bZoomGPX
				, ' ', ' ', '-'
				, this.bSetModeWPTS, this.bSetModeRTES, this.bSetModeTRKS
				, ' ', ' ', '-', this.bNavigate
				, this.bAddWpt, this.bEditWpt, this.bDeleteWpt
				, this.bAddRte, this.bEditRte, this.bSwapRte, this.bDeleteRte, ' ' , ' ', this.bConvertRte
				/*, this.bEditTrk*/ ,this.bDeleteTrk, ' ', ' ', this.bConvertTrk
				, '->'
				, {
					type: 'button'
					, id: 'gpxe-GPXEditorLogoV'
					, style: { height: '120px' }
					, handler: function() { this.winAbout.show(); }
					, scope: this
					, iconCls: 'gpxe-GPXEditorLogoV'
					, tooltip: this.LOCALES.BT_ABOUT_TOOLTIP
				}
			]
		});

		GPXEditor1_1.EditorToolbar.superclass.initComponent.call(this);

/*
		if (this.editorPanel) {
			this.editorPanel.on('collapse', function() {
				this.bExpand.setTooltip(this.LOCALES.BT_EXPAND_EDITOR_TOOLTIP);
				this.bExpand.setIconClass('gpxe-ExpandIcon');
			}, this);
			this.editorPanel.on('expand', function() {
				this.bExpand.setTooltip(this.LOCALES.BT_COLLAPSE_EDITOR_TOOLTIP);
				this.bExpand.setIconClass('gpxe-CollapseIcon');
			}, this);
			this.editorPanel.on('modeChange', function(mode) {
				this.editorPanel.getMapPanel().setMapMode(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE);
				this.updateButtonsVisibility();
			}, this);
		}
		*/

		this.on('afterlayout', function() {
			this.gpxLayer.updateActions();
			this.updateButtonsVisibility();
		}, this);

		//this.updateButtons();
	}
	/*
	, getEditorPanel: function() {
		return this.editorPanel;
	}
	*/
	/*
	, updateButtons: function() {
		this.updateButtonsVisibility();
		this.updateButtonsState();
	}
	*/
	, updateButtonsVisibility: function() {
		var mode = this.editorMode.getMode();
		var definedModes = GPXEditor1_1.EditorMode.MODES;
		var visible;

		/* WPTS */
		visible = (mode == definedModes.WPTS);
		this.bAddWpt.setVisible(visible);
		this.bEditWpt.setVisible(visible);
		this.bDeleteWpt.setVisible(visible);

		/* RTES */
		visible = (mode == definedModes.RTES);
		this.bAddRte.setVisible(visible);
		this.bEditRte.setVisible(visible);
		this.bDeleteRte.setVisible(visible);
		this.bSwapRte.setVisible(visible);
		this.bConvertRte.setVisible(visible);

		/* TRKS */
		visible = (mode == definedModes.TRKS);
		this.bEditTrk.setVisible(visible);
		this.bDeleteTrk.setVisible(visible);
		this.bConvertTrk.setVisible(visible);
	}
	, getMode: function() {
		return this.mode;
	}
	, getChangeModeAction: function(modeId) {
	/*
		if (! this.changeModeActions[modeId]) {
			var definedModes = GPXEditor1_1.Toolbar.MODES;
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
		*/
	}
	, _initButtons: function() {
		var gpxActions = GPXEditor1_1.GPXLayer.ACTIONS;
		/*
		if (this.editorPanel) {
			this.bExpand = new Ext.Button({
				iconCls: 'gpxe-CollapseIcon',
				tooltip: this.LOCALES.BT_COLLAPSE_EDITOR_TOOLTIP,
				handler: function() {
					this.editorPanel.toggleCollapse(true);
				},
				scope: this
			});
		}
		*/
		this.bLoadGPX = new Ext.Button(this.gpxLayer.getAction(gpxActions.LOAD_GPX));
		this.bLoadGPX.setText(null);
		this.bSaveGPX = new Ext.Button(this.gpxLayer.getAction(gpxActions.SAVE_GPX));
		this.bSaveGPX.setText(null);
		this.bDeleteGPX = new Ext.Button(this.gpxLayer.getAction(gpxActions.DEL_GPX));
		this.bDeleteGPX.setText(null);
		this.bZoomGPX = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_ZOOM_GPX));
		this.bZoomGPX.setText(null);

		this.bSetModeWPTS = new Ext.Button(this.editorMode.getChangeModeAction(GPXEditor1_1.EditorMode.MODES.WPTS));
		this.bSetModeWPTS.setText(null);
		this.bSetModeRTES = new Ext.Button(this.editorMode.getChangeModeAction(GPXEditor1_1.EditorMode.MODES.RTES));
		this.bSetModeRTES.setText(null);
		this.bSetModeTRKS = new Ext.Button(this.editorMode.getChangeModeAction(GPXEditor1_1.EditorMode.MODES.TRKS));
		this.bSetModeTRKS.setText(null);

		this.bNavigate = new Ext.Button(this.gpxLayer.getGPXMap().getAction(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE));
		this.bNavigate.setText(null);
		
		this.bAddWpt = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_ADD_WPT));
		this.bAddWpt.setText(null);
		this.bEditWpt = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_EDIT_WPT));
		this.bEditWpt.setText(null);
		this.bDeleteWpt = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_DEL_WPT));
		this.bDeleteWpt.setText(null);

		this.bAddRte = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_ADD_RTE));
		this.bAddRte.setText(null);
		this.bEditRte = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_EDIT_RTE));
		this.bEditRte.setText(null);
		this.bSwapRte = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_SWAP_RTE));
		this.bSwapRte.setText(null);
		this.bDeleteRte = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_DEL_RTE));
		this.bDeleteRte.setText(null);
		this.bConvertRte = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_CONV_RTE));
		this.bConvertRte.setText(null);

		this.bEditTrk = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_EDIT_TRK));
		this.bEditTrk.setText(null);
		this.bDeleteTrk = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_DEL_TRK));
		this.bDeleteTrk.setText(null);
		this.bConvertTrk = new Ext.Button(this.gpxLayer.getAction(gpxActions.MAP_CONV_TRK));
		this.bConvertTrk.setText(null);
	}
});
Ext.reg('gpxe-EditorToolbar', GPXEditor1_1.EditorToolbar);

GPXEditor1_1.EditorToolbar.LOCALES = {
/*
	BT_COLLAPSE_EDITOR_TEXT: 'BT_COLLAPSE_TEXT',
	BT_COLLAPSE_EDITOR_TOOLTIP: 'BT_COLLAPSE_TOOLTIP',
	BT_EXPAND_EDITOR_TEXT: 'BT_EXPAND_EDITOR_TEXT',
	BT_EXPAND_EDITOR_TOOLTIP: 'BT_EXPAND_EDITOR_TOOLTIP',
	BT_ABOUT_TEXT: 'BT_ABOUT_TEXT',
	BT_ABOUT_TOOLTIP: 'BT_ABOUT_TOOLTIP'
	*/
};
