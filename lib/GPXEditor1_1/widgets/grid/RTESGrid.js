Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.RTESGrid = Ext.extend(Ext.grid.GridPanel, {
	mapPanel: undefined,
	bEditRte: undefined,
	bDeleteRte: undefined,
	bGetEle: undefined,
	winEditRte: undefined,
	winGetEle: undefined,
	winEditEle: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.grid.RTESGrid.LOCALES;
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		this.bEditRte = new Ext.Button({
			tooltip: this.LOCALES.BT_EDIT_RTE_TOOLTIP,
			iconCls: 'gpxe-RteEdit',
			handler: function() {
				this.winEditRte.show({feature: this.getSelectedRte().get('feature')});
			},
			scope: this
		});
		this.bDeleteRte = new Ext.Button({
			tooltip: this.LOCALES.BT_DELETE_RTE_TOOLTIP,
			iconCls: 'gpxe-RteDelete',
			handler: function() {
				this.mapPanel.getGPXLayer().removeFeatures([this.getSelectedRte().get('feature')]);
			},
			scope: this
		});
		this.bGetEle = new Ext.Button({
			tooltip: this.LOCALES.BT_GET_ELE_TOOLTIP,
			iconCls: 'gpxe-GetElevation',
			handler: function() {
				this.getMissedElevation();
			},
			scope: this
		});
		this.winEditRte = new GPXEditor1_1.form.FormWindow({
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
				type: GPXEditor1_1.form.FeatureForm.TYPES.RTE,
				mode: GPXEditor1_1.form.FeatureForm.MODES.EDIT
			}
		});
		this.winGetEle = new GPXEditor1_1.GetMissedElevationWindow({
			mapPanel: this.mapPanel
		});
		this.winGetEle.on('hide', function() {
			var feature = this.getSelectedRte().get('feature');
			if (feature)
				feature.layer.events.triggerEvent('featuremodified', {feature: feature});
		}, this);
		this.winEditEle = new GPXEditor1_1.form.FormWindow({
			modal: true,
			width: 350,
			formPanel: {
				xtype: 'gpxe-ElevationForm',
				deferredRender: false,
				forceLayout: true,
				frame: true,
				header: false,
				autoHeight: true,
				mapPanel: this.mapPanel
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
					return (feature.geometry instanceof OpenLayers.Geometry.LineString);
				}
			}),
			columns: [{
				header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_NAME,
				sortable: true,
				dataIndex: 'name',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if (! value || value.length <= 0) {
						metaData.css = 'gpxe-DefaultValue';
						value = this.LOCALES.RTE_NAME + ' ' + (store.indexOf(record) + 1);
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
			tbar: ['->', this.bEditRte, this.bGetEle, ' ', this.bDeleteRte
			/* TEMP for debuging */
				,{
				text: 'simplify',
				handler: function() {
					var feature = this.getSelectedRte().get('feature');
					var statStore = feature.statStore;
					if (! feature || ! statStore)
						return;
					var cmpsRemove = [];
					var lastOK = null;
					var diffDistance = 50;
					var diffElevation = 20;
					var diffHeading = 10;
					for (var i = 0, len = statStore.getTotalCount(); i < len; i++) {
						record = statStore.getAt(i);
						if (i == 0 || i == len - 1) {
							last = record;
							lastOK = record;
						}
						else {
							var next = statStore.getAt(i + 1);
							var tfd = lastOK.get('totalFaltDistance');
							var ntfd = next.get('totalFaltDistance');
							var ele = lastOK.get('elevation') ? lastOK.get('elevation') : lastOK.get('computedElevation');
							var nele = next.get('elevation') ? next.get('elevation') : next.get('computedElevation');
							var heading = record.get('heading');
							var minHeading = lastOK.get('heading') - diffHeading;
							var headingTest = 'OR';
							if (minHeading < 0) {
								minHeading = 360 + minHeading;
								headingTest = 'AND';
							}
							var maxHeading = lastOK.get('heading') + diffHeading;
							if (maxHeading > 360) {
								maxHeading = maxHeading - 360;
								headingTest = 'AND';
							}

							if (headingTest == 'OR' && (heading < minHeading || heading > maxHeading)) 
								lastOK = record;
							else if (heading < minHeading && heading > maxHeading) 
								lastOK = record;
							else if (ntfd - tfd > diffDistance) 
								lastOK = record;
							else if (Math.abs(nele - ele) > diffElevation) 
								lastOK = record;
							else 
								cmpsRemove.push(record.get('point'));
						}
					}
					if (cmpsRemove.length > 0) {
						for (var i = 0; i < cmpsRemove.length; i++) {
							feature.geometry.removeComponent(cmpsRemove[i]);
						}
						feature.layer.events.triggerEvent('featuremodified', {feature: feature});
					}
				},
				scope: this
			}]
		});
		GPXEditor1_1.grid.RTESGrid.superclass.initComponent.call(this);
		this.updateButtons();
		this.getSelectionModel().on('selectionchange', this.updateButtons, this);
		this.store.on('update', function(store, records, index) {
			store.commitChanges();
		});
		var gpxLayer = this.mapPanel.getGPXLayer();
		gpxLayer.events.register('featureadded', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.LineString))
				return;
			evt.feature.statStore = new GPXEditor1_1.data.StatStore({feature: evt.feature});
			this.updateFeatureStatAttributes(evt.feature);
			if (this.mapPanel.isLoadingInProgress())
				return;
			this.winEditRte.show({feature: evt.feature});
		});
		gpxLayer.events.register('featuremodified', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.LineString))
				return;
			if (evt.feature.statStore.dontRefresh)
				return;
			if (evt.feature && evt.feature.statStore) {
				evt.feature.statStore.reloadFromFeature();
				this.updateFeatureStatAttributes(evt.feature);
			}
		});
		gpxLayer.events.register('vertexmodified', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.LineString))
				return;
			if (evt.vertex.ele)
				delete evt.vertex.ele;
		});
		gpxLayer.events.register('featureremoved', this, function(evt) {
			if (! evt.feature || ! (evt.feature.geometry instanceof OpenLayers.Geometry.LineString))
				return;
			if (evt.feature && evt.feature.statStore) {
				evt.feature.statStore.destroy();
				delete evt.feature.statStore;
			}
		});
		gpxLayer.events.register('elevationneeded', this, function(evt) {
			this.winEditEle.show(evt);
		});
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	updateFeatureStatAttributes: function(feature) {
		feature.statStore.dontRefresh = true;
		var lastStat = feature.statStore.getAt(feature.statStore.getTotalCount() - 1);
		feature.attributes.totalFlatDistance = lastStat.get('totalFlatDistance');
		feature.attributes.totalDistance = lastStat.get('totalDistance');
		feature.attributes.totalPositiveDenivelation = lastStat.get('totalPositiveDenivelation');
		feature.attributes.totalNegativeDenivelation = lastStat.get('totalNegativeDenivelation');
		feature.layer.events.triggerEvent('featuremodified', {feature: feature});
		feature.statStore.dontRefresh = false;
	},
	updateButtons: function() {
		var disable = this.getSelectionModel().getCount() <= 0;
		this.bEditRte.setDisabled(disable);
		this.bGetEle.setDisabled(disable);
		this.bDeleteRte.setDisabled(disable);
	},
	getSelectedRte: function() {
		return this.getSelectionModel().getSelected();
	},
	getMissedElevation: function() {
		var f = this.getSelectedRte().get('feature');
		if (! f)
			return;
		this.winGetEle.show(f.geometry.getVertices(), this.bGetEle);
	}
});
Ext.reg('gpxe-RTESGrid', GPXEditor1_1.grid.RTESGrid);

GPXEditor1_1.grid.RTESGrid.LOCALES = {
	BT_EDIT_RTE_TOOLTIP: 'BT_EDIT_RTE_TOOLTIP',
	BT_DELETE_RTE_TOOLTIP: 'BT_DELETE_RTE_TOOLTIP',
	BT_GET_ELE_TOOLTIP: 'BT_GET_ELE_TOOLTIP',
	RTE_NAME: 'RTE_NAME'
};
