Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.StatStore = Ext.extend(Ext.data.JsonStore, {
	feature: undefined
	, projection: undefined
	, constructor: function(config) {
		this.LOCALES = GPXEditor1_1.data.StatStore.LOCALES;
		this.projection = new OpenLayers.Projection('EPSG:4326');
		config = config || {};
		Ext.applyIf(config, {
			root: 'points'
			, fields: [
				{name: 'point'}                                             /* OL geometry point     */
				, {name: 'll'}                                              /* OL ll on EPSG:4326    */
				, {name: 'elevation', type: 'float'}                        /* meter                 */
				, {name: 'computedElevation', type: 'float'}                /* meter                 */
				, {name: 'minimumElevation', type: 'float'}                 /* meter                 */
				, {name: 'averageElevation', type: 'float'}                 /* meter                 */
				, {name: 'maximumElevation', type: 'float'}                 /* meter                 */
				, {name: 'flatDistance', type: 'float'}                     /* meter                 */
				, {name: 'totalFaltDistance', type: 'float'}                /* meter                 */
				, {name: 'distance', type: 'float'}                         /* meter                 */
				, {name: 'totalDistance', type: 'float'}                    /* meter                 */
				, {name: 'positiveDenivelation', type: 'float'}             /* meter                 */
				, {name: 'totalPositiveDenivelation', type: 'float'}        /* meter                 */
				, {name: 'negativeDenivelation', type: 'float'}             /* meter                 */
				, {name: 'totalNegativeDenivelation', type: 'float'}        /* meter                 */
				, {name: 'heading', type: 'float'}                          /* °                     */
				, {name: 'dateTime', type: 'date'}                          /* date                  */
				, {name: 'computedDateTime', type: 'date'}                  /* date                  */
				, {name: 'duration', type: 'float'}                         /* millisecond           */
				, {name: 'totalDuration', type: 'float'}                    /* millisecond           */
				, {name: 'breakDuration', type: 'float'}                    /* millisecond           */
				, {name: 'minimumSpeedDistance', type: 'float'}             /* meter per millisecond */
				, {name: 'averageSpeedDistance', type: 'float'}             /* meter per millisecond */
				, {name: 'maximumSpeedDistance', type: 'float'}             /* meter per millisecond */
				, {name: 'positiveDenivelationDuration', type: 'float'}     /* millisecond           */
				, {name: 'minimumSpeedPositiveDenivelation', type: 'float'} /* meter per millisecond */
				, {name: 'averageSpeedPositiveDenivealtion', type: 'float'} /* meter per millisecond */
				, {name: 'maximumSpeedPositiveDenivelation', type: 'float'} /* meter per millisecond */
				, {name: 'negativeDenivelationDuration', type: 'float'}     /* millisecond           */
				, {name: 'minimumSpeedNegativeDenivelation', type: 'float'} /* meter per millisecond */
				, {name: 'averageSpeedNegativeDenivealtion', type: 'float'} /* meter per millisecond */
				, {name: 'maximumSpeedNegativeDenivelation', type: 'float'} /* meter per millisecond */
			]
		});
		GPXEditor1_1.data.StatStore.superclass.constructor.call(this, config);
		this.setFeature(this.feature);
	}
	, reloadFromFeature: function() {
		this.setFeature(this.feature);
	}
	, setFeature: function(feature) {
		this.feature = feature;
		var points = [];
		if (this.feature) {
			/* test feature.geometry type */
			/* do the data job */
			var vertices = [];
			if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
				var lv = feature.geometry.getVertices();
				for (var i = 0, len = lv.length; i < len; i++)
					vertices.push(lv[i]);
			}
			else if (feature.geometry instanceof OpenLayers.Geometry.MultiLineString) {
				for (var i = 0; i < feature.geometry.components.length; i++) {
					var lv = feature.geometry.components[i].getVertices();
					for (var j = 0, len = lv.length; j < len; j++)
						vertices.push(lv[j]);
				}
			}
			for (var i = 0; i < vertices.length; i++) {
				points.push({
					point: vertices[i]
					, ll: null
					, elevation: 0
					, computedElevation: 0
					, minimumElevation: 0
					, averageElevation: 0
					, maximumElevation: 0
					, flatDistance: 0.0
					, totalFaltDistance: 0.0
					, distance: 0.0
					, totalDistance: 0.0
					, positiveDenivelation: 0
					, totalPositiveDenivelation: 0
					, negativeDenivelation: 0
					, totalNegativeDenivelation: 0
					, heading: 0
					, dateTime: null 
					, computedDateTime: null 
					, duration: 0.0
					, totalDuration: 0.0
					, breakDuration: 0.0
					, minimumSpeedDistance: 0.0
					, averageSpeedDistance: 0.0
					, maximumSpeedDistance: 0.0
					, positiveDenivelationDuration: 0.0
					, minimumSpeedPositiveDenivelation: 0.0
					, averageSpeedPositiveDenivealtion: 0.0
					, maximumSpeedPositiveDenivelation: 0.0
					, negativeDenivelationDuration: 0.0
					, minimumSpeedNegativeDenivelation: 0.0
					, averageSpeedNegativeDenivealtion: 0.0
					, maximumSpeedNegativeDenivelation: 0.0
				});
			}
		}
		this.loadData({points: points});
		this.refreshStats();
	}
	, getFeature: function() {
		return this.feature;
	}
	, refreshStats: function() {
		if (! this.feature)
			return;
		var nbPoints = this.getTotalCount();
		var last = null;
		var lastWithEle = null;
		var lastWithDateTime = null;
		var durationEnabled = true;
		var ptCurIdx = 0;
		/* 1st pass flatDistance, totalFaltDistance, elevation & computedElevation */
		this.each(function(record) {
			ptCurIdx++;
			var index = this.indexOf(record);
			var point = record.get('point');
			var ll = new OpenLayers.LonLat(point.x, point.y);
			ll = ll.transform(this.feature.layer.projection, this.projection);
			record.set('ll', ll);
			record.set('flatDistance', last ? OpenLayers.Util.distanceBetweenLonLat(last.get('ll'), record.get('ll')) : 0);
			record.set('totalFaltDistance', last ? last.get('totalFaltDistance') + record.get('flatDistance') : 0);
			record.set('elevation', point.ele ? point.ele : null);
			if (record.get('elevation') || index == nbPoints - 1) {
				var lastIndex = 0;
				var lastElevation = 0;
				var lastTotalFlatDistance = 0;
				if (lastWithEle) {
					lastIndex = this.indexOf(lastWithEle);
					lastElevation = lastWithEle.get('elevation');
					lastTotalFlatDistance = lastWithEle.get('totalFaltDistance');
				}
				var curIndex = this.indexOf(record);
				var curTotalFlatDistance = record.get('totalFaltDistance');
				for (var i = curIndex - 1; i > lastIndex; i--) {
					pRecord = this.getAt(i);
					pRecord.set('computedElevation', Math.round((
						(record.get('elevation') - lastElevation)
						* (pRecord.get('totalFaltDistance') - lastTotalFlatDistance)
						/ (curTotalFlatDistance - lastTotalFlatDistance)
					) + lastElevation));
				}
				lastWithEle = record;
			}
			if (last)
				last.set('heading', OpenLayers.Util.headingBetweenLonLat(last.get('ll'), record.get('ll')));
			record.set('dateTime', point.time ? point.time : null);
			if (record.get('dateTime')) {
				/* TODO: be certain that they have one dateTime or computedDateTime per point */
				lastWithDateTime = record;
			}
			else {
				//console.log('no time for ' + ptCurIdx);
				durationEnabled = false;
			}

			last = record;
		}, this);
		last = null;
		/* 2nd pass for all other fields */
		var nbView = 0;
		var averageElevationSum = 0;
		var ptIdx = 0;
		var lastDenivelationType = 0;
		this.each(function(record) {
			if (last) {
				var lastEle = last.get('elevation') || last.get('computedElevation');
				var ele = record.get('elevation') || record.get('computedElevation');
				if (durationEnabled) {
					record.set('duration', last.get('dateTime').getElapsed(record.get('dateTime')));
					record.set('totalDuration', last.get('totalDuration') + record.get('duration'));
					/* TODO: breakDuration */
					record.set('positiveDenivelationDuration', last.get('positiveDenivelationDuration'));
					record.set('negativeDenivelationDuration', last.get('negativeDenivelationDuration'));
				}
				if (lastEle < ele) {
					record.set('positiveDenivelation', ele - lastEle);
					record.set('distance', Math.sqrt(Math.pow((ele - lastEle), 2) + Math.pow(record.get('flatDistance'), 2)));
					lastDenivelationType = 'POS';
				}
				else {
					record.set('negativeDenivelation', lastEle - ele);
					record.set('distance', Math.sqrt(Math.pow((lastEle - ele), 2) + Math.pow(record.get('flatDistance'), 2)));
					if (lastEle > ele)
						lastDenivelationType = 'NEG';
				}
				if (durationEnabled) {
					if (lastDenivelationType == 'POS')
						record.set('positiveDenivelationDuration', last.get('positiveDenivelationDuration') + record.get('duration'));
					else
						record.set('negativeDenivelationDuration', last.get('negativeDenivelationDuration') + record.get('duration'));
				}
				record.set('totalDistance', last.get('totalDistance') + record.get('distance'));
				record.set('totalPositiveDenivelation', last.get('totalPositiveDenivelation') + record.get('positiveDenivelation'));
				record.set('totalNegativeDenivelation', last.get('totalNegativeDenivelation') + record.get('negativeDenivelation'));
				record.set('minimumElevation', (ele < last.get('minimumElevation') ? ele : last.get('minimumElevation')));
				averageElevationSum += ele;
				record.set('averageElevation', (averageElevationSum / (nbView + 1)));
				record.set('maximumElevation', (ele > last.get('maximumElevation') ? ele : last.get('maximumElevation')));
			}
			else {
				var ele = record.get('elevation') || record.get('computedElevation');
				record.set('minimumElevation', ele);
				record.set('averageElevation', ele);
				record.set('maximumElevation', ele);
				averageElevationSum = ele;
				if (durationEnabled) {
					record.set('duration', 0.0);
					record.set('totalDuration', 0.0);
					/* TODO: breakDuration */
					record.set('positiveDenivelationDuration', 0.0);
					record.set('negativeDenivelationDuration', 0.0);
				}
			}
			last = record;
			nbView++;
			ptIdx++;
		}, this);
		this.commitChanges();
	}
});

GPXEditor1_1.data.StatStore.LOCALES = {
	ELEVATION: 'ELEVATION',
	DISTANCE: 'DISTANCE',
	POSITIVE_DENIVELATION: 'POSITIVE_DENIVELATION',
	NEGATIVE_DENIVELATION: 'NEGATIVE_DENIVELATION',
	DURATION: 'DURATION'
};
