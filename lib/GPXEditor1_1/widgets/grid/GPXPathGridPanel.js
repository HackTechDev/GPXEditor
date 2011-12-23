Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.GPXPathGridPanel = Ext.extend(GPXEditor1_1.grid.GPXElementGridPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.grid.GPXPathGridPanel.LOCALES});

		if (! (this.store instanceof GPXEditor1_1.data.GPXPathStore))
			this.store = new GPXEditor1_1.data.GPXPathStore();

		GPXEditor1_1.grid.GPXPathGridPanel.superclass.initComponent.call(this);

		this.on('rowdblclick', function(grid, rowIndex, e) {
			var record = this.store.getAt(rowIndex);
			if (this.gpxLayer && this.gpxLayer.getGPXMap() && record)
				this.gpxLayer.getGPXMap().zoomToExtent(record.get('feature').geometry.getBounds());
		});
	}
	, _getColumnsConfig: function() {
		var ret = GPXEditor1_1.grid.GPXPathGridPanel.superclass._getColumnsConfig.call(this);
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NUMBER_OF_POINTS_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NUMBER_OF_POINTS_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'numberOfPoints'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value; 
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_DISTANCE_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_DISTANCE_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'distance'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatDistance(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_POSITIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_POSITIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'positiveDenivelation'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatElevation(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NEGATIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NEGATIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'negativeDenivelation'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatElevation(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_MINIMUM_ELEVATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_MINIMUM_ELEVATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'minimumElevation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatElevation(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_AVERAGE_ELEVATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_AVERAGE_ELEVATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'averageElevation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatElevation(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_MAXIMUM_ELEVATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_MAXIMUM_ELEVATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumElevation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatElevation(value); /* need to be call to global func deals with units user choice */
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
Ext.reg('gpxe-grid-GPXPathGridPanel', GPXEditor1_1.grid.GPXPathGridPanel);

GPXEditor1_1.grid.GPXPathGridPanel.LOCALES = Ext.apply({
	DBLCLICK_INFO: 'DBLCLICK_INFO'
}, GPXEditor1_1.grid.GPXElementGridPanel);
