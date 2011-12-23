Ext.namespace('GPXEditor1_1');

GPXEditor1_1.WPTDetailPanel = Ext.extend(GPXEditor1_1.GPXElementDetailPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.WPTDetailPanel.LOCALES});

		GPXEditor1_1.WPTDetailPanel.superclass.initComponent.call(this);
	}
	, getHtmlBodyContent: function(wptRecord) {
		var htmlDesc = GPXEditor1_1.WPTDetailPanel.superclass.getHtmlBodyContent.call(this, wptRecord);
		var htmlEle = wptRecord && wptRecord.get('ele') 
			? OpenLayers.Util.formatElevation(wptRecord.get('ele')) 
			: this._getHtmlDefaultValue();
		var htmlType = 
			wptRecord && wptRecord.get('type') != GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW 
				? GPXEditor1_1.data.WPTRecord.LOCALES['WPT_TYPE_' + wptRecord.get('type')]
				: this._getHtmlDefaultValue();
		var htmlLon = wptRecord ? wptRecord.get('lon') : this._getHtmlDefaultValue();
		var htmlLat = wptRecord ? wptRecord.get('lat') : this._getHtmlDefaultValue();
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_ELE_NAME)
			, this._getHtmlValue(htmlEle)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_TYPE_NAME)
			, this._getHtmlValue(htmlType)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_LON_NAME)
			, this._getHtmlValue(htmlLon)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_LAT_NAME)
			, this._getHtmlValue(htmlLat)
		);
		return htmlDesc;
	}
});
Ext.reg('gpxe-WPTDetailPanel', GPXEditor1_1.WPTDetailPanel);

GPXEditor1_1.WPTDetailPanel.LOCALES = Ext.apply({
}, GPXEditor1_1.GPXElementDetailPanel);
