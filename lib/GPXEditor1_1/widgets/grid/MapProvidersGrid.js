Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.MapProvidersGrid = Ext.extend(Ext.grid.GridPanel, {
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.grid.MapProvidersGrid.LOCALES
		});
		var checkColumn = GPXEditor1_1.grid.MapProvidersGrid.getDefaultCheckColumn();

		if (! this.store || ! (this.store instanceof GPXEditor1_1.data.MapProvidersStore))
			this.store = new GPXEditor1_1.data.MapProvidersStore({map: this.map});

		Ext.apply(this, {
			cm: GPXEditor1_1.grid.MapProvidersGrid.getDefaultColumnModel(checkColumn),
			autoExpandColumn: 'zone',
			clicksToEdit: 1,
			view: new Ext.grid.GroupingView({
				forceFit: true,
				groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
			}),
			sm: new GPXEditor1_1.grid.MapProvidersGridSelectionModel({singleSelect:true}),
			plugins: checkColumn
		});
		GPXEditor1_1.grid.MapProvidersGrid.superclass.initComponent.call(this);
		this.store.on('update', this.updateLayer, this);
		this.selModel.on('selectionchange', function(sm) {
			var r = sm.getSelected();
			if (! r)
				return;
			r.set('isActive', true);
			this.map.setBaseLayer(r.data.layer);
		}, this);
		this.setMap(this.store.map);
	},
	setMap: function(map) {
	/*
		if (! map || ! map instanceof OpenLayers.GPXEditorMap)
			return;
			*/
		if (this.map) {
			/* todo remove all active layers */
		}
		this.map = map;
		this.map.events.register('changebaselayer', this, function(evt) {
			var r = this.selModel.getSelected();
			if (! r || r != evt.layer.record) {
				r = evt.layer.record;
				var rIndex = this.store.indexOf(r);
				if (this.selModel.grid && rIndex != -1)
					this.selModel.selectRow(rIndex);
			}
		});
		/*
		var records = this.store.query('isActive', true);
		records.each(function(r) {
			this.updateLayer(this.store, r, 'edit');
		}, this);
		*/
	},
	updateLayer: function(store, record, operation) {
		if (operation == 'commit')
			return;
		if (this.map) {
			if (record.data.layer) {
				if (this.map.baseLayer == record.data.layer && ! record.data.isActive) {
					record.beginEdit();
					record.data.isActive = true;
					record.endEdit();
					alert('PAS POSSIBLE DE DESACTIVER LA LAYER COURANTE' + "\n" + 'need i18n');
				}
			}
			this.store.commitChanges();
		}
	}
});
Ext.reg('gpxe_MapProvidersGrid', GPXEditor1_1.grid.MapProvidersGrid);

GPXEditor1_1.grid.MapProvidersGrid.getDefaultCheckColumn = function() {
	return new Ext.grid.CheckColumn ({
		width: 50,
		header: this.LOCALES.COLUMN_ISACTIVE_TITLE,
		dataIndex: 'isActive',
		renderer: function(val, p, record) {
			p.css += ' x-grid3-check-col-td';
			return String.format(
				'<div class="x-grid3-check-col{0} {1}"' 
			  + ' ext:qtip="' + GPXEditor1_1.grid.MapProvidersGrid.LOCALES.CLICK_TO_ADD_MAP_ON_MAPPANEL + '"'
				+ '>&#160;</div>', val ? '-on' : '', this.createId());
		}
	});
};

GPXEditor1_1.grid.MapProvidersGrid.getDefaultColumnModel = function(checkColumn) {
	if (! checkColumn)
		checkColumn = GPXEditor1_1.grid.MapProvidersGrid.getDefaultCheckColumn();
	return new Ext.grid.ColumnModel({
		defaults: {
			sortable: true
		},
		columns: [{
			header: this.LOCALES.COLUMN_PROVIDER_TITLE, 
			dataIndex: 'provider',
			renderer: function(val, p) {
				p.attr = 'ext:qtip="' + GPXEditor1_1.grid.MapProvidersGrid.LOCALES.DBCLICK_TO_ACTIVE_AND_SELECT_THIS_MAP + '"';
				return val;
			}
		}, {
			header: this.LOCALES.COLUMN_ZONE_TITLE,
			dataIndex: 'zone',
			renderer: function(val, p) {
				p.attr = 'ext:qtip="' + GPXEditor1_1.grid.MapProvidersGrid.LOCALES.DBCLICK_TO_ACTIVE_AND_SELECT_THIS_MAP + '"';
				return val;
			}
		}, {
			header: this.LOCALES.COLUMN_TYPE_TITLE,
			dataIndex: 'type',
			renderer: function(val, p) {
				p.attr = 'ext:qtip="' + GPXEditor1_1.grid.MapProvidersGrid.LOCALES.DBCLICK_TO_ACTIVE_AND_SELECT_THIS_MAP + '"';
				switch(val) {
					case GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.MAP:
						return GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_MAP;
					case GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT:
						return GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_SAT;
					case GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO:
						return GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_TOPO;
				}
				return val;
			}
		}, checkColumn]
	});
};

GPXEditor1_1.grid.MapProvidersGrid.LOCALES = {
	COLUMN_PROVIDER_TITLE: 'COLUMN_PROVIDER_TITLE',
	COLUMN_ZONE_TITLE: 'COLUMN_ZONE_TITLE',
	COLUMN_TYPE_TITLE: 'COLUMN_TYPE_TITLE',
	COLUMN_ISACTIVE_TITLE: 'COLUMN_ISACTIVE_TITLE',
	CLICK_TO_ADD_MAP_ON_MAPPANEL: 'CLICK_TO_ADD_MAP_ON_MAPPANEL',
	DBCLICK_TO_ACTIVE_AND_SELECT_THIS_MAP: 'DBCLICK_TO_ACTIVE_AND_SELECT_THIS_MAP'
};

/* layer selection model */
GPXEditor1_1.grid.MapProvidersGridSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
	initEvents : function() {
		GPXEditor1_1.grid.MapProvidersGridSelectionModel.superclass.initEvents.call(this);
		if (!this.grid.enableDragDrop && !this.grid.enableDrag) {
			this.grid.un('rowmousedown', this.handleMouseDown, this);
			this.grid.on('rowdblclick', this.handleMouseDown, this);
		}
	}
});
