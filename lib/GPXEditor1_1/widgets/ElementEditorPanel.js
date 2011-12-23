Ext.namespace('GPXEditor1_1');

GPXEditor1_1.ElementEditorPanel = Ext.extend(Ext.Panel, {
	mapPanel: undefined,
	grid: undefined,
	selectionModel: undefined,
	infoPanel: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.ElementEditorPanel.LOCALES;
		this.selectionModel = new GPXEditor1_1.grid.GPXSelectionModel({
			selectControl: this.mapPanel.getGPXSelectControl(),
			autoActivateControl: false
		});
		this.grid = new Ext.grid.GridPanel({
			region: 'center',
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
		Ext.apply(this, {
			layout: 'border',
			items: [this.grid, {
				type: 'panel',
				region: 'south',
				html: 'infos'
			}]
		});
		GPXEditor1_1.ElementEditorPanel.superclass.initComponent.call(this);
		this.mapPanel.getAction(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE)
			.control.events.register('activate', this, function() {
			this.selectionModel.clearSelections();
		});
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
	getGrid: function() {
		return this.grid;
	},
	getSelectionModel: function() {
		return this.selectionModel;
	},
	getInfoPanel: function() {
		return this.infoPanel;
	},
	getSelected: function() {
		return this.selectionModel.getSelected();
	}
	/*
	updateInfo: function() {
		this.infoPanel.setFeature(this.grid.getSelectionModel());
	}
	*/
});
Ext.reg('gpxe-ElementEditorPanel', GPXEditor1_1.ElementEditorPanel);

GPXEditor1_1.ElementEditorPanel.LOCALES = {
	ELEMENT_NAME: 'ELEMENT_NAME'
};
