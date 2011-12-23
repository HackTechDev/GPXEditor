Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.ElementGrid = Ext.extend(Ext.grid.GridPanel, {
	mapPanel: undefined,
	selectionModel: undefined,
	infoPanel: undefined,
	btForSelected: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.grid.ElementGrid.LOCALES;
		this.btForSelected = [];
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		this.selectionModel = new GPXEditor1_1.grid.GPXSelectionModel({
			selectControl: this.mapPanel.getGPXSelectControl(),
			autoActivateControl: false
		});
		Ext.applyIf(this, {
			store: new GPXEditor1_1.data.GPXStore({
				geometryClass: this.getGeometryClass(),
				layer: this.mapPanel.getGPXLayer(),
				fields: this.getFieldsConfig(),
				addFeatureFilter: function(feature) {
					if (! feature || ! feature.geometry)
						return false;
					return (feature.geometry instanceof this.geometryClass);
				}
			}),
			columns: this.getColumnsConfig(),
			sm: this.selectionModel,
			autoExpandColumn: 'name',
			viewConfig: {
				forceFit: true
			},
			tbar: this.getGridToolbarConfig()
		});
		GPXEditor1_1.grid.ElementGrid.superclass.initComponent.call(this);
		this.store.on('update', function(store, records, index) {
			store.commitChanges();
		});
		this.mapPanel.getAction(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE)
			.control.events.register('activate', this, function() {
			this.selectionModel.clearSelections();
		});
		this.selectionModel.on('selectionchange', function(sm) {
			var disabled = true;
			if (this.selectionModel.getCount() == 1)
				disabled = false;
			for (var i = 0; i < this.btForSelected.length; i++)
				this.btForSelected[i].setDisabled(disabled);
		}, this);
	},
	getGridToolbarConfig: function() {
		return null;
	},
	getFieldsConfig: function() {
		return [
			{name: 'name', type: 'string'},
			{name: 'desc', type: 'string'}
		];
	},
	getColumnsConfig: function() {
		return [{
			header: GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_NAME,
			sortable: true,
			dataIndex: 'name',
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				console.log('this.LOCALES => ' + this.LOCALES);
				console.log('ELEMENT_NAME => ' + this.LOCALES.ELEMENT_NAME);
				if (! value || value.length <= 0) {
					metaData.css = 'gpxe-DefaultValue';
					value = this.LOCALES.ELEMENT_NAME + ' ' + (store.indexOf(record) + 1);
				}
				return value;
			}, 
			scope: this
		}];
	},
	getGeometryClass: function() {
		return OpenLayers.Geometry;
	},
	getSelectionModel: function() {
		return this.selectionModel;
	},
	getSelected: function() {
		return this.selectionModel.getSelected();
	}
});

GPXEditor1_1.grid.ElementGrid.LOCALES = {
	ELEMENT_NAME: 'ELEMENT_NAME'
};
