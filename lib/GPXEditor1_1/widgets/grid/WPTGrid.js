Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.WPTGrid = Ext.extend(GPXEditor1_1.grid.ElementGrid, {
	bAddWpt: undefined,
	bEditWpt: undefined,
	bDeleteWpt: undefined,
	winAddWpt: undefined,
	winEditWpt: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.grid.WPTGrid.LOCALES;
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
		GPXEditor1_1.grid.WPTGrid.superclass.initComponent.call(this);
		this.store.on('add', function(store, records, index) {
			if (this.mapPanel.isLoadingInProgress())
				return;
			this.winEditWpt.show({feature: records[0].get('feature')});
		}, this);
	},
	getGeometryClass: function() {
		return OpenLayers.Geometry.Point;
	},
	getFieldsConfig: function() {
		var ret = GPXEditor1_1.grid.WPTGrid.superclass.getFieldsConfig.call(this);
		ret.push({name: 'desc', type: 'string'});
		ret.push({name: 'type', type: 'string'});
		ret.push({name: 'ele', type: 'integer'});
		ret.push({name: 'lon', type: 'float'});
		ret.push({name: 'lat', type: 'float'});
		return ret;
	},
	getColumnsConfig: function() {
		var ret = GPXEditor1_1.grid.WPTGrid.superclass.getColumnsConfig.call(this);
		ret.push({
			header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_ELE,
			align: 'right',
			sortable: true,
			dataIndex: 'ele',
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var rValue = record.get('feature').attributes['ele'];
				if (rValue === null || rValue === undefined) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m';
			}
		})
		ret.push({
			header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_TYPE,
			sortable: true,
			dataIndex: 'type',
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				if (value == null || value == GPXEditor1_1.form.FeatureForm.WPT_TYPES.UNKNOW) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return GPXEditor1_1.form.FeatureForm.LOCALES['WPT_TYPE_' + value];
			}
		});
		return ret;
	},
	getGridToolbarConfig: function() {
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
			disabled: true,
			iconCls: 'gpxe-WptEdit',
			handler: function() {
				this.winEditWpt.show({feature: this.getSelected().get('feature')});
			},
			scope: this
		});
		this.btForSelected.push(this.bEditWpt);
		this.bDeleteWpt = new Ext.Button({
			tooltip: this.LOCALES.BT_DELETE_WPT_TOOLTIP,
			disabled: true,
			iconCls: 'gpxe-WptDelete',
			handler: function() {
				this.mapPanel.getGPXLayer().removeFeatures([this.getSelected().get('feature')]);
			},
			scope: this
		});
		this.btForSelected.push(this.bDeleteWpt);
		return ['->', this.bAddWpt, this.bEditWpt, ' ', this.bDeleteWpt];
	}
});
Ext.reg('gpxe-WPTGrid', GPXEditor1_1.grid.WPTGrid);

GPXEditor1_1.grid.WPTGrid.LOCALES = {
	ELEMENT_NAME: 'ELEMENT_NAME',
	BT_ADD_WPT_TOOLTIP: 'BT_ADD_WPT_TOOLTIP',
	BT_EDIT_WPT_TOOLTIP: 'BT_EDIT_WPT_TOOLTIP',
	BT_DELETE_WPT_TOOLTIP: 'BT_DELETE_WPT_TOOLTIP'
};
