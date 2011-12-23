Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.GPXElementGridPanel = Ext.extend(Ext.grid.GridPanel, {
	gpxLayer: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.grid.GPXElementGridPanel.LOCALES});

		if (! (this.store instanceof GPXEditor1_1.data.GPXElementStore))
			this.store = new GPXEditor1_1.data.GPXElementStore();

		Ext.applyIf(this, {
			columns: this._getColumnsConfig()
			, autoExpandColumn: 'name'
			, viewConfig: {
				forceFit: true
			}
			, sm: new GPXEditor1_1.grid.GPXElementSelectionModel()
		});

		GPXEditor1_1.grid.GPXElementGridPanel.superclass.initComponent.call(this);

		this.on('rowclick', function(grid, rowIndex, e) {
			if (this.gpxLayer && this.gpxLayer.getGPXMap()) {
				this.gpxLayer.getGPXMap().setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
				this.gpxLayer.setSelectedElement(this.store.getAt(rowIndex));
			}
		});
	}
	, setGPXLayer: function(gpxLayer) {
		if (this.gpxLayer == gpxLayer || ! (gpxLayer instanceof GPXEditor1_1.GPXLayer))
			return;
		this.gpxLayer = gpxLayer;
	}
	, getGPXLayer: function() {
		return this.gpxLayer;
	}
	, _getColumnsConfig: function() {
		var ret = [];
		ret.push({
			header: GPXEditor1_1.data.GPXElementRecord.LOCALES.FIELD_NAME_NAME
			, sortable: true
			, dataIndex: 'name'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (! value || value.length <= 0) {
					metaData.css = 'gpxe-DefaultValue';
					value = record.getName();
				}
				return value;
			}
			, scope: this
		});
		return ret;
	}
	, _getDefaultRowTooltip: function() {
		return null;
	}
});
Ext.reg('gpxe-grid-GPXElementGridPanel', GPXEditor1_1.grid.GPXElementGridPanel);

GPXEditor1_1.grid.GPXElementGridPanel.LOCALES = {
};
