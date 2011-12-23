Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.TRKSGrid = Ext.extend(Ext.grid.GridPanel, {
	mapPanel: undefined,
	bEditTrk: undefined,
	bDeleteTrk: undefined,
	winEditTrk: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.grid.TRKSGrid.LOCALES;
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		this.bEditTrk = new Ext.Button({
			tooltip: this.LOCALES.BT_EDIT_TRK_TOOLTIP,
			iconCls: 'gpxe-TrkEdit',
			handler: function() {
				this.winEditTrk.show({feature: this.getSelectedTrk().get('feature')});
			},
			scope: this
		});
		this.bDeleteTrk = new Ext.Button({
			tooltip: this.LOCALES.BT_DELETE_TRK_TOOLTIP,
			iconCls: 'gpxe-TrkDelete',
			handler: function() {
				this.mapPanel.getGPXLayer().removeFeatures([this.getSelectedTrk().get('feature')]);
			},
			scope: this
		});
		this.winEditTrk = new GPXEditor1_1.form.FormWindow({
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
				type: GPXEditor1_1.form.FeatureForm.TYPES.TRK,
				mode: GPXEditor1_1.form.FeatureForm.MODES.EDIT
			}
		});
		Ext.applyIf(this, {
			store: new GPXEditor1_1.data.GPXStore({
				layer: this.mapPanel.getGPXLayer(),
				fields: [
					{name: 'name', type: Ext.data.Types.STRING},
					{name: 'desc', type: Ext.data.Types.STRING},
					{name: 'totalDistance', type: Ext.data.Types.FLOAT},
					{name: 'totalFlatDistance', type: Ext.data.Types.FLOAT},
					{name: 'totalPositiveDenivelation', type: Ext.data.Types.INT},
					{name: 'totalNegativeDenivelation', type: Ext.data.Types.INT}
				],
				addFeatureFilter: function(feature) {
					return (feature.geometry instanceof OpenLayers.Geometry.MultiLineString);
				}
			}),
			columns: [{
				header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_NAME,
				sortable: true,
				dataIndex: 'name',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if (! value || value.length <= 0) {
						metaData.css = 'gpxe-DefaultValue';
						value = this.LOCALES.TRK_NAME + ' ' + (store.indexOf(record) + 1);
					}
					return value;
				}, 
				scope: this
			}, {
				header: GPXEditor1_1.data.StatStore.LOCALES.DISTANCE,
				sortable: true,
				dataIndex: 'totalDistance',
				align: 'right',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return OpenLayers.Util.formatDistance(value, 'km');
				}
			}, {
				header: GPXEditor1_1.data.StatStore.LOCALES.POSITIVE_DENIVELATION,
				sortable: true,
				align: 'right',
				dataIndex: 'totalPositiveDenivelation',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return value + ' m';
				}
			}, {
				header: GPXEditor1_1.data.StatStore.LOCALES.NEGATIVE_DENIVELATION,
				sortable: true,
				align: 'right',
				dataIndex: 'totalNegativeDenivelation',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return value + ' m';
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
			tbar: ['->', this.bEditTrk, ' ', this.bDeleteTrk]
		});
		GPXEditor1_1.grid.TRKSGrid.superclass.initComponent.call(this);
		this.updateButtons();
		this.getSelectionModel().on('selectionchange', this.updateButtons, this);
		this.store.on('update', function(store, records, index) {
			store.commitChanges();
		});
		var gpxLayer = this.mapPanel.getGPXLayer();
		gpxLayer.events.register('featureadded', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.MultiLineString))
				return;
			evt.feature.statStore = new GPXEditor1_1.data.StatStore({feature: evt.feature});
			this.updateFeatureStatAttributes(evt.feature);
			this.winEditTrk.show({feature: evt.feature});
		});
		gpxLayer.events.register('featuremodified', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.MultiLineString))
				return;
			if (evt.feature.statStore.dontRefresh)
				return;
			if (evt.feature && evt.feature.statStore) {
				evt.feature.statStore.reloadFromFeature();
				this.updateFeatureStatAttributes(evt.feature);
			}
		});
		gpxLayer.events.register('featureremoved', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.MultiLineString))
				return;
			if (evt.feature && evt.feature.statStore) {
				evt.feature.statStore.destroy();
				delete evt.feature.statStore;
			}
		});
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	updateFeatureStatAttributes: function(feature) {
		feature.statStore.dontRefresh = true;
		var lastStat = feature.statStore.getAt(feature.statStore.getTotalCount() - 1);
		if (lastStat) {
			feature.attributes.totalFlatDistance = lastStat.get('totalFlatDistance');
			feature.attributes.totalDistance = lastStat.get('totalDistance');
			feature.attributes.totalPositiveDenivelation = lastStat.get('totalPositiveDenivelation');
			feature.attributes.totalNegativeDenivelation = lastStat.get('totalNegativeDenivelation');
			feature.layer.events.triggerEvent('featuremodified', {feature: feature});
			feature.statStore.dontRefresh = false;
		}
	},
	updateButtons: function() {
		var disable = this.getSelectionModel().getCount() <= 0;
		this.bEditTrk.setDisabled(disable);
		this.bDeleteTrk.setDisabled(disable);
	},
	getSelectedTrk: function() {
		return this.getSelectionModel().getSelected();
	}
});
Ext.reg('gpxe-TRKSGrid', GPXEditor1_1.grid.TRKSGrid);

GPXEditor1_1.grid.TRKSGrid.LOCALES = {
	BT_EDIT_TRK_TOOLTIP: 'BT_EDIT_TRK_TOOLTIP',
	BT_DELETE_TRK_TOOLTIP: 'BT_DELETE_TRK_TOOLTIP',
	TRK_NAME: 'TRK_NAME'
};

