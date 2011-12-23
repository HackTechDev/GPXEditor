Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.WPTSEditor = Ext.extend(Ext.grid.GridPanel, {
	mapPanel: undefined,
	bAddWpt: undefined,
	bEditWpt: undefined,
	bDeleteWpt: undefined,
	winAddWpt: undefined,
	winEditWpt: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.grid.WPTSEditor.LOCALES;
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		this.bAddWpt = new Ext.Button({
			tooltip: this.LOCALES.BT_ADD_WPT_TOOLTIP,
			iconCls: 'gpxe-WptAdd',
			handler: function() {
				this.winAddWpt.show({feature: null});
			},
			scope: this
		});
		this.bEditWpt = new Ext.Button({
			tooltip: this.LOCALES.BT_EDIT_WPT_TOOLTIP,
			iconCls: 'gpxe-WptEdit',
			handler: function() {
				this.winEditWpt.show({feature: this.getSelectedWpt().get('feature')});
			},
			scope: this
		});
		this.bDeleteWpt = new Ext.Button({
			tooltip: this.LOCALES.BT_DELETE_WPT_TOOLTIP,
			iconCls: 'gpxe-WptDelete',
			handler: function() {
				this.mapPanel.getGPXLayer().removeFeatures([this.getSelectedWpt().get('feature')]);
			},
			scope: this
		});
		this.winAddWpt = new GPXEditor1_1.form.FormWindow({
			modal: true,
			width: 350,
			formPanel: {
				xtype: 'gpxe-FeatureForm',
				deferredRender: false,
				forceLayout: true,
				frame: true,
				header: false,
				autoHeight: true,
				mapPanel: this.mapPanel,
				type: GPXEditor1_1.form.FeatureForm.TYPES.WPT,
				mode: GPXEditor1_1.form.FeatureForm.MODES.ADD
			}
		});
		this.winEditWpt = new GPXEditor1_1.form.FormWindow({
			modal: true,
			width: 350,
			formPanel: {
				xtype: 'gpxe-FeatureForm',
				deferredRender: false,
				forceLayout: true,
				frame: true,
				header: false,
				autoHeight: true,
				mapPanel: this.mapPanel,
				type: GPXEditor1_1.form.FeatureForm.TYPES.WPT,
				mode: GPXEditor1_1.form.FeatureForm.MODES.EDIT
			}
		});
		Ext.applyIf(this, {
			store: new GPXEditor1_1.data.GPXStore({
				layer: this.mapPanel.getGPXLayer(),
				fields: [
					{name: 'name', type: 'string'},
					{name: 'desc', type: 'string'},
					{name: 'type', type: 'string'},
					{name: 'ele', type: 'integer'},
					{name: 'lon', type: 'float'},
					{name: 'lat', type: 'float'}
				],
				addFeatureFilter: function(feature) {
					return (feature.geometry instanceof OpenLayers.Geometry.Point);
				}
			}),
			columns: [{
				header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_NAME,
				sortable: true,
				dataIndex: 'name',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if (! value || value.length <= 0) {
						metaData.css = 'gpxe-DefaultValue';
						value = this.LOCALES.WPT_NAME + ' ' + (store.indexOf(record) + 1);
					}
					return value;
				}, 
				scope: this
			}, {
				header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_ELE,
				sortable: true,
				dataIndex: 'ele',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					var rValue = record.get('feature').attributes['ele'];
					if (rValue === null || rValue === undefined)
						return null;
					return value;
				}
			}, {
				header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_TYPE,
				sortable: true,
				dataIndex: 'type',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if (value == GPXEditor1_1.form.FeatureForm.WPT_TYPES.UNKNOW)
						return null;
					return GPXEditor1_1.form.FeatureForm.LOCALES['WPT_TYPE_' + value];
				}
			}],
			autoExpandColumn: 'name',
			viewConfig: {
				forceFit: true
			},
			sm: new GPXEditor1_1.grid.GPXSelectionModel({
				selectControl: this.mapPanel.getGPXSelectControl(),
				autoActivateControl: false
			}),
			tbar: ['->', this.bAddWpt, this.bEditWpt, ' ', this.bDeleteWpt]
		});
		GPXEditor1_1.grid.WPTSEditor.superclass.initComponent.call(this);
		this.updateButtons();
		this.getSelectionModel().on('selectionchange', this.updateButtons, this);
		this.store.on('update', function(store, records, index) {
			store.commitChanges();
		});
		var gpxLayer = this.mapPanel.getGPXLayer();
		gpxLayer.events.register('featureadded', this, function(f) {
			if (! f.feature || ! (f.feature.geometry instanceof OpenLayers.Geometry.Point) || this.winAddWpt.isVisible())
				return;
			if (this.mapPanel.isLoadingInProgress())
				return;
			this.winEditWpt.show({feature: f.feature});
		});
		gpxLayer.events.register('featuremodified', this, function(f) {
			if (! f.feature || ! (f.feature.geometry instanceof OpenLayers.Geometry.Point))
				return;
			if (this.winAddWpt.isVisible() || this.winEditWpt.isVisible())
				return;
			if (this.updatingEleAndLL) // prevent dblRecall 
				return;
			this.updatingEleAndLL = true;
			delete f.feature.attributes['ele'];
			this.store.findBy(function(record, id) {
				if (record.get('feature') == f.feature) {
					var ll = new OpenLayers.LonLat(f.feature.geometry.x, f.feature.geometry.y);
					ll = ll.transform(this.mapPanel.getMap().getProjection(), this.mapPanel.getProjection());
					record.set('lon', ll.lon);
					record.set('lat', ll.lat);
					record.set('ele', null);
					this.updatingEleAndLL = false;
					return true;
				}
			}, this);
		});
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	updateButtons: function() {
		if (this.getSelectionModel().getCount() > 0) {
			this.bEditWpt.setDisabled(false);
			this.bDeleteWpt.setDisabled(false);
		}
		else {
			this.bEditWpt.setDisabled(true);
			this.bDeleteWpt.setDisabled(true);
		}
	},
	getSelectedWpt: function() {
		return this.getSelectionModel().getSelected();
	}
});
Ext.reg('gpxe-WPTSEditor', GPXEditor1_1.grid.WPTSEditor);

GPXEditor1_1.grid.WPTSEditor.LOCALES = {
	BT_ADD_WPT_TOOLTIP: 'BT_ADD_WPT_TOOLTIP',
	BT_EDIT_WPT_TOOLTIP: 'BT_EDIT_WPT_TOOLTIP',
	BT_DELETE_WPT_TOOLTIP: 'BT_DELETE_WPT_TOOLTIP',
	WPT_NAME: 'WPT_NAME'
};
