Ext.onReady(function() {

	Ext.BLANK_IMAGE_URL = 'js/lib/ext-3.2.1/resources/images/default/s.gif';
	Ext.chart.Chart.CHART_URL = 'js/lib/ext-3.2.1/resources/charts.swf';
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'side';

	var urlParams = Ext.urlDecode(window.location.href);
	var layersId = urlParams['layersId'];
	var layersActive = urlParams['layersActive'];

	var viewport = new Ext.Viewport({
		layout: 'border'
		, bodyBorder: false
		, hideBorders: true
		, items: [
			{
				region: 'north'
				, xtype: 'box'
				, frame: true
				, el: 'header'
				, split : false
			}
			, {
				region: 'center'
				, xtype: 'gpxe-GPXEditor'
				, mapConfig: {
					layersId: layersId
					, layersActive: layersActive
				}
				, margins: '0 10 0 10'
			}
			, {
				region: 'south'
				, xtype: 'box'
				, frame: true
				, el: 'footer'
				, split : false
			}
		]
	});

	var hideMask = function () {
		Ext.get('loading').remove();
		Ext.fly('loading-mask').fadeOut({remove:true});
	}

	hideMask.defer(250);

});
