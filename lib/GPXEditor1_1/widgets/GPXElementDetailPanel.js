Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXElementDetailPanel = Ext.extend(Ext.Panel, {
	gpxElementRecord: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GPXElementDetailPanel.LOCALES});
		
		Ext.applyIf(this, {
			title: '-'
			, bodyCfg: {cls: 'gpxe-DetailPanel'}
			, html: this.getHtmlBodyContent(null)
		});

		GPXEditor1_1.GPXElementDetailPanel.superclass.initComponent.call(this);

	}
	, getGPXElementRecord: function() {
		return this.gpxElementRecord;
	}
	, setGPXElementRecord: function(gpxElementRecord, force) {
		if (this.gpxElementRecord === gpxElementRecord && ! force)
			return;
		var store = gpxElementRecord ? gpxElementRecord.store : null;
		if (! gpxElementRecord || this.store != store) {
			if (this.store && this.store != store) {
				this.store.un('update', this._onStoreUpdate, this);
				delete this.store;
			}
			if (gpxElementRecord && this.store != store) {
				this.store = store;
				this.store.on('update', this._onStoreUpdate, this);
			}
		}
		this.gpxElementRecord = gpxElementRecord;
		this.setTitle(gpxElementRecord ? gpxElementRecord.getName() : '-');
		this.update(this.getHtmlBodyContent(this.gpxElementRecord));
	}
	, getHtmlBodyContent: function(gpxElementRecord) {
		var htmlDesc = gpxElementRecord && gpxElementRecord.get('desc')
			? gpxElementRecord.get('desc') 
			: this._getHtmlDefaultValue();
		return this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.GPXElementRecord.LOCALES.FIELD_DESC_NAME)
			, this._getHtmlValue(htmlDesc.replace(GPXEditor1_1.GPXElementDetailPanel.HTMLNEWLINE_REGEX, '<br />'))
		);
	}
	, _getHtmlDefaultValue: function(value) {
		value = value || '-';
		return '<span class="gpxe-DefaultValue">' + value + '</span>';
	}
	, _getHtmlField: function(fieldName) {
		return '<span class="gpxe-DetailField">' + fieldName + ': </span>';
	}
	, _getHtmlValue: function(fieldValue) {
		return '<span class="gpxe-DetailValue">' + fieldValue + '</span>';
	}
	, _getHtmlDetailLine: function(htmlFieldName, htmlFieldValue) {
		return '<div class="gpxe-DetailLine">' + htmlFieldName + htmlFieldValue + '</div>';
	}
	, _onStoreUpdate: function(store, record, operation) {
		if (record == this.gpxElementRecord)
			this.setGPXElementRecord(record, true);
	}
});
Ext.reg('gpxe-GPXElementDetailPanel', GPXEditor1_1.GPXElementDetailPanel);

GPXEditor1_1.GPXElementDetailPanel.HTMLNEWLINE_REGEX = new RegExp('(\n|\r\n)', 'g');

GPXEditor1_1.GPXElementDetailPanel.LOCALES = {
};
