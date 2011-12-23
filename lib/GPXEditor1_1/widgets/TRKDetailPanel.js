Ext.namespace('GPXEditor1_1');

GPXEditor1_1.TRKDetailPanel = Ext.extend(GPXEditor1_1.GPXPathDetailPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.TRKDetailPanel.LOCALES});

		GPXEditor1_1.TRKDetailPanel.superclass.initComponent.call(this);
	}
	, getHtmlBodyContent: function(trkRecord) {
		var htmlDesc = GPXEditor1_1.TRKDetailPanel.superclass.getHtmlBodyContent.call(this, trkRecord);
		var htmlDuration = trkRecord && trkRecord.get('duration')
			? OpenLayers.Util.formatDuration(trkRecord.get('duration'))
			: this._getHtmlDefaultValue();

		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.TRKRecord.LOCALES.FIELD_DURATION_NAME)
			, this._getHtmlValue(htmlDuration)
		);
		return htmlDesc;
	}
});
Ext.reg('gpxe-TRKDetailPanel', GPXEditor1_1.TRKDetailPanel);

GPXEditor1_1.TRKDetailPanel.LOCALES = Ext.apply({
}, GPXEditor1_1.GPXPathDetailPanel);

