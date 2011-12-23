Ext.namespace('GPXEditor1_1.chart');

GPXEditor1_1.chart.StatChart = Ext.extend(Ext.chart.LineChart, {
	mapPanel: undefined,
	defaultStore: undefined,
	initComponent: function() {
		this.LOCALES = GPXEditor1_1.chart.StatChart.LOCALES;
		/*
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		*/
		this.defaultStore = new GPXEditor1_1.data.StatStore();
		if (! this.store || ! (this.store instanceof GPXEditor1_1.data.StatStore))
			this.store = this.defaultStore;
		Ext.apply(this, {
			xAxis: new Ext.chart.NumericAxis({
				adjustMaximumByMajorUnit: false
			}),
			yAxis: new Ext.chart.NumericAxis({
				alwaysShowZero: false
			}),
			xField: 'totalDistance',
			extraStyle: {
				padding: 2,
				font: {
					size: 8
				},
				dataTip: {
					padding: 2,
					font: {
						size: 8,
						bold: false
					}
				},
				animationEnabled: true,
				xAxis: {
					majorGridLines: {size: 1, color: 0xeeeeee}
				}
			},
			series: [{
				type: 'line',
				yField: 'computedElevation',
				style: {
					size: 0,
					borderColor: 0x0000ff,
					fillColor: 0x0000ff,
					connectPoints: true,
					lineColor: 0xee9900,
					lineSize: 1 
				}
			}],
			tipRenderer : function(chart, record) {
				ret = GPXEditor1_1.data.StatStore.LOCALES.ELEVATION + ': ' 
						+ (record.get('elevation') ? record.get('elevation') : record.get('computedElevation')) + ' m'
					+ "\n" +
					GPXEditor1_1.data.StatStore.LOCALES.DISTANCE + ': '
						+ OpenLayers.Util.formatDistance(record.get('totalDistance'));
				return ret;
			}
		});
		GPXEditor1_1.chart.StatChart.superclass.initComponent.call(this);
	},
	getDefaultStore: function() {
		return this.defaultStore;
	},
	refresh: function(){
		if (this.fireEvent('beforerefresh', this) !== false) {
			var styleChanged = false;
			// convert the store data into something YUI charts can understand
			var data = [], rs = this.store.data.items;
			for (var j = 0, len = rs.length; j < len; j++) {
				//data[j] = rs[j].data; /* Shama MDF  [ */
				data[j] = {
					totalDistance: rs[j].get('totalFaltDistance') / 1000,
					computedElevation: rs[j].get('elevation') ? rs[j].get('elevation') : rs[j].get('computedElevation')
				};
				/* ] Shama MDF */
			}
			//make a copy of the series definitions so that we aren't
			//editing them directly.
			var dataProvider = [];
			var seriesCount = 0;
			var currentSeries = null;
			var i = 0;
			if (this.series) {
				seriesCount = this.series.length;
				for (i = 0; i < seriesCount; i++) {
					currentSeries = this.series[i];
					var clonedSeries = {};
					for (var prop in currentSeries) {
						if (prop == "style" && currentSeries.style !== null) {
							clonedSeries.style = Ext.encode(currentSeries.style);
							styleChanged = true;
							//we don't want to modify the styles again next time
							//so null out the style property.
							// this causes issues
							// currentSeries.style = null;
						} else{
							clonedSeries[prop] = currentSeries[prop];
						}
					}
					dataProvider.push(clonedSeries);
				}
			}

			if (seriesCount > 0) {
				for (i = 0; i < seriesCount; i++) {
					currentSeries = dataProvider[i];
					if (!currentSeries.type) {
						currentSeries.type = this.type;
					}
					currentSeries.dataProvider = data;
				}
			} else{
				dataProvider.push({type: this.type, dataProvider: data});
			}
			if (this.isVisible() && this.getWidth() > 0) /* Shama MDF */
				this.swf.setDataProvider(dataProvider);
			if (this.seriesStyles) {
				this.setSeriesStyles(this.seriesStyles);
			}
			this.fireEvent('refresh', this);
		}
	}
});
Ext.reg('gpxe-StatChart',GPXEditor1_1.chart.StatChart);

GPXEditor1_1.chart.StatChart.LOCALES={
};
