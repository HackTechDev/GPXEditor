Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.WPTGridPanel = Ext.extend(GPXEditor1_1.grid.GPXElementGridPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.grid.WPTGridPanel.LOCALES});

		if (! (this.store instanceof GPXEditor1_1.data.WPTStore))
			this.store = new GPXEditor1_1.data.WPTStore();

		GPXEditor1_1.grid.WPTGridPanel.superclass.initComponent.call(this);

		this.on('rowdblclick', function(grid, rowIndex, e) {
			var record = this.store.getAt(rowIndex);
			if (this.gpxLayer && this.gpxLayer.getGPXMap() && record)
				this.gpxLayer.getGPXMap().setCenter(record.get('lon'), record.get('lat'));
		});
	}
	, _getColumnsConfig: function() {
		var ret = GPXEditor1_1.grid.WPTGridPanel.superclass._getColumnsConfig.call(this);
		ret.push({
			header: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_ELE_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'ele'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_TYPE_NAME
			, sortable: true
			, dataIndex: 'type'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value == null || value == GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return GPXEditor1_1.data.WPTRecord.LOCALES['WPT_TYPE_' + value];
			}
			, scope: this
		});
		return ret;
	}
	, _getDefaultRowTooltip: function() {
		if (this.gpxLayer)
			return this.LOCALES.DBLCLICK_INFO;
		else
			return GPXEditor1_1.grid.WPTGridPanel.superclass._getDefaultRowTooltip();
	}
});
Ext.reg('gpxe-grid-WPTGridPanel', GPXEditor1_1.grid.WPTGridPanel);

GPXEditor1_1.grid.WPTGridPanel.LOCALES = Ext.apply({
	DBLCLICK_INFO: 'DBLCLICK_INFO'
}, GPXEditor1_1.grid.GPXElementGridPanel);
