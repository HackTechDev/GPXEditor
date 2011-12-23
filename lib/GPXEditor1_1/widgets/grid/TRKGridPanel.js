Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.TRKGridPanel = Ext.extend(GPXEditor1_1.grid.GPXPathGridPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.grid.TRKGridPanel.LOCALES});

		if (! (this.store instanceof GPXEditor1_1.data.TRKStore))
			this.store = new GPXEditor1_1.data.TRKStore();

		GPXEditor1_1.grid.TRKGridPanel.superclass.initComponent.call(this);
	}
	/*
	, showStat: function() {
		console.log('showstat statStore => ' + this.store.getAt(0).statStore);
		var win = new Ext.Window({
			layout: 'fit'
			, width: 800
			, height: 600
			, items: [{
				xtype: 'grid'
				, store: this.store.getAt(0).statStore
				, colModel: new Ext.grid.ColumnModel({
					columns: [
						{header: 'ele', dataIndex: 'elevation'}
						, {header: 'positiveDenivelation', dataIndex: 'positiveDenivelation'}
						, {header: 'totalPositiveDenivelation', dataIndex: 'totalPositiveDenivelation'}
						, {header: 'negativeDenivelation', dataIndex: 'negativeDenivelation'}
						, {header: 'totalNegativeDenivelation', dataIndex: 'totalNegativeDenivelation'}
						, {header: 'dateTime', dataIndex: 'dateTime'}
						, {header: 'duration', dataIndex: 'duration'}
						, {header: 'totalDuration', dataIndex: 'totalDuration'}
						, {header: 'positiveDenivelationDuration', dataIndex: 'positiveDenivelationDuration'}
						, {header: 'negativeDenivelationDuration', dataIndex: 'negativeDenivelationDuration'}
					]
				})
			}]
		});
		win.show();
	}
	*/
	, _getColumnsConfig: function() {
		var ret = GPXEditor1_1.grid.TRKGridPanel.superclass._getColumnsConfig.call(this);
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_NUMBER_OF_SIGNAL_LOST_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_NUMBER_OF_SIGNAL_LOST_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'numberOfSignalLost'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value; /* TODO: numberOfSignalLost must be nb trkseg - 1 */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_DURATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'duration'
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatDuration(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		/*
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_BREAK_DURATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'breakDuration'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatDuration(value);
			}
			, scope: this
		});
		*/
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_DISTANCE_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_DISTANCE_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'minimumSpeedDistance'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_DISTANCE_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_DISTANCE_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'averageSpeedDistance'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_DISTANCE_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_DISTANCE_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumSpeedDistance'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_POSITIVE_DENIVELATION_DURATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_POSITIVE_DENIVELATION_DURATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'positiveDenivelationDuration'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatDuration(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumSpeedPositiveDenivelation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'averageSpeedPositiveDenivelation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumSpeedPositiveDenivelation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_NEGATIVE_DENIVELATION_DURATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_NEGATIVE_DENIVELATION_DURATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'negativeDenivelationDuration'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return OpenLayers.Util.formatDuration(value); /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumSpeedNegativeDenivelation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'averageSpeedNegativeDenivealtion'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		ret.push({
			header: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME
			, tooltip: GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_NAME
			, align: 'right'
			, sortable: true
			, dataIndex: 'maximumSpeedNegativeDenivelation'
			, hidden: true
			, renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var tt = this._getDefaultRowTooltip();
				if (tt)
					metaData.attr = 'ext:qtip="' + tt + '"';
				if (value === null || value === undefined || value.length == 0) {
					metaData.css = 'gpxe-DefaultValue';
					return '-';
				}
				return value + ' m/ms'; /* need to be call to global func deals with units user choice */
			}
			, scope: this
		});
		return ret;
	}
});
Ext.reg('gpxe-grid-TRKGridPanel', GPXEditor1_1.grid.TRKGridPanel);

GPXEditor1_1.grid.TRKGridPanel.LOCALES = Ext.apply({
	DBLCLICK_INFO: 'DBLCLICK_INFO'
}, GPXEditor1_1.grid.GPXPathGridPanel);
