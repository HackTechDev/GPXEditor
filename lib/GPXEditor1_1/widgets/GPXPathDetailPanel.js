Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXPathDetailPanel = Ext.extend(GPXEditor1_1.GPXElementDetailPanel, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GPXPathDetailPanel.LOCALES});

		GPXEditor1_1.GPXPathDetailPanel.superclass.initComponent.call(this);
	}
	, getHtmlBodyContent: function(gpxPathRecord) {
		var htmlDesc = GPXEditor1_1.GPXPathDetailPanel.superclass.getHtmlBodyContent.call(this, gpxPathRecord);
		var htmlNbPts = gpxPathRecord && gpxPathRecord.get('numberOfPoints')
			? gpxPathRecord.get('numberOfPoints')
			: this._getHtmlDefaultValue();
		var htmlDistance = gpxPathRecord && gpxPathRecord.get('distance')
			? OpenLayers.Util.formatDistance(gpxPathRecord.get('distance'))
			: this._getHtmlDefaultValue();
		var htmlPositiveDenivelation = gpxPathRecord && gpxPathRecord.get('positiveDenivelation')
			? OpenLayers.Util.formatElevation(gpxPathRecord.get('positiveDenivelation'))
			: this._getHtmlDefaultValue();
		var htmlNegativeDenivelation = gpxPathRecord && gpxPathRecord.get('negativeDenivelation')
			? OpenLayers.Util.formatElevation(gpxPathRecord.get('negativeDenivelation'))
			: this._getHtmlDefaultValue();
		var htmlMinimumElevation = gpxPathRecord && gpxPathRecord.get('minimumElevation')
			? OpenLayers.Util.formatElevation(gpxPathRecord.get('minimumElevation'))
			: this._getHtmlDefaultValue();
		var htmlAverageElevation = gpxPathRecord && gpxPathRecord.get('averageElevation')
			? OpenLayers.Util.formatElevation(gpxPathRecord.get('averageElevation'))
			: this._getHtmlDefaultValue();
		var htmlMaximumElevation = gpxPathRecord && gpxPathRecord.get('maximumElevation')
			? OpenLayers.Util.formatElevation(gpxPathRecord.get('maximumElevation'))
			: this._getHtmlDefaultValue();

		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NUMBER_OF_POINTS_NAME)
			, this._getHtmlValue(htmlNbPts)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_DISTANCE_NAME)
			, this._getHtmlValue(htmlDistance)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_POSITIVE_DENIVELATION_NAME)
			, this._getHtmlValue(htmlPositiveDenivelation)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(GPXEditor1_1.data.GPXPathRecord.LOCALES.FIELD_NEGATIVE_DENIVELATION_NAME)
			, this._getHtmlValue(htmlNegativeDenivelation)
		);
		htmlDesc += this._getHtmlDetailLine(
			this._getHtmlField(
				GPXEditor1_1.data.GPXPathRecord.LOCALES.ELEVATION 
				+ ' (' + GPXEditor1_1.data.GPXPathRecord.LOCALES.MIN_AVR_MAX + ')')
			, this._getHtmlValue(htmlMinimumElevation + ' / ' + htmlAverageElevation + ' / ' + htmlMaximumElevation)
		);
		return htmlDesc;
	}
});
Ext.reg('gpxe-GPXPathDetailPanel', GPXEditor1_1.GPXPathDetailPanel);

GPXEditor1_1.GPXPathDetailPanel.LOCALES = Ext.apply({
}, GPXEditor1_1.GPXElementDetailPanel);
