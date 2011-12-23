Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.GPXPathRecord = GPXEditor1_1.data.GPXElementRecord.create([
	, {name: 'numberOfPoints', type: 'int'}
	, {name: 'distance', type: 'float'}
	, {name: 'positiveDenivelation', type: 'float'}
	, {name: 'negativeDenivelation', type: 'float'}
	, {name: 'minimumElevation', type: 'float'}
	, {name: 'averageElevation', type: 'float'}
	, {name: 'maximumElevation', type: 'float'}
]);

GPXEditor1_1.data.GPXPathRecord.prototype.getRecordName = function() {
	return GPXEditor1_1.data.GPXPathRecord.LOCALES.RECORD_NAME;
};
GPXEditor1_1.data.GPXPathRecord.prototype.updateRecordByGeometryChange = function() {
	var feature = this.get('feature');
	//console.log('updateRecordByGeometryChange');
	if (feature) {
		if (! (this.statStore instanceof GPXEditor1_1.data.StatStore)) {
			this.statStore = new GPXEditor1_1.data.StatStore({
				feature: feature
			});
		} else {
			if (feature.geometryModified === true) {
				//console.log('reset stat to null');
				this.statStore.removeAll();
			}
			else {
				//console.log('need to compute stat');
				this.statStore.reloadFromFeature();
			}
		}
		this.updateRecordByStats();
		this.commit();
	}
};
GPXEditor1_1.data.GPXPathRecord.prototype.updateRecordByStats = function() {
	if (! (this.statStore instanceof GPXEditor1_1.data.StatStore) || this.statStore.getCount() < 2) {
		this.set('numberOfPoints', null);
		this.set('distance', null);
		this.set('positiveDenivelation', null);
		this.set('negativeDenivelation', null);
		this.set('minimumElevation', null);
		this.set('averageElevation', null);
		this.set('maximumElevation', null);
	}
	else {
		var lastStat = this.statStore.getAt(this.statStore.getTotalCount() - 1);
		this.set('numberOfPoints', this.statStore.getTotalCount());
		this.set('distance', lastStat.get('totalDistance'));
		this.set('positiveDenivelation', lastStat.get('totalPositiveDenivelation'));
		this.set('negativeDenivelation', lastStat.get('totalNegativeDenivelation'));
		this.set('minimumElevation', lastStat.get('minimumElevation'));
		this.set('averageElevation', lastStat.get('averageElevation'));
		this.set('maximumElevation', lastStat.get('maximumElevation'));
	}
};
GPXEditor1_1.data.GPXPathRecord.prototype.cleanBeforeDestroy = function() {
	if (this.statStore)
		this.statStore.destroy();
};

GPXEditor1_1.data.GPXPathRecord.create = function(o) {
	var f = Ext.extend(GPXEditor1_1.data.GPXPathRecord, {});
	var p = f.prototype;

	p.fields = new Ext.util.MixedCollection(false, function(field) {
		return field.name;
	});

	GPXEditor1_1.data.GPXPathRecord.prototype.fields.each(function(f) {
		p.fields.add(f);
	});

	if(o) {
		for (var i = 0, len = o.length; i < len; i++) {
			p.fields.add(new Ext.data.Field(o[i]));
		}
	}

	f.getField = function(name) {
		return p.fields.get(name);
	};

	return f;
};

GPXEditor1_1.data.GPXPathRecord.LOCALES = Ext.apply({
	RECORD_NAME: 'RECORD_NAME'
	, FIELD_NUMBER_OF_POINTS_NAME: 'FIELD_NUMBER_OF_POINTS_NAME'
	, FIELD_NUMBER_OF_POINTS_NAME: 'FIELD_NUMBER_OF_POINTS_SHORTNAME'
	, FIELD_DISTANCE_NAME: 'FIELD_DISTANCE_NAME'
	, FIELD_DISTANCE_SHORTNAME: 'FIELD_DISTANCE_SHORTNAME'
	, FIELD_POSITIVE_DENIVELATION_NAME: 'FIELD_POSITIVE_DENIVELATION_NAME'
	, FIELD_POSITIVE_DENIVELATION_SHORTNAME: 'FIELD_POSITIVE_DENIVELATION_SHORTNAME'
	, FIELD_NEGATIVE_DENIVELATION_NAME: 'FIELD_NEGATIVE_DENIVELATION_NAME'
	, FIELD_NEGATIVE_DENIVELATION_SHORTNAME: 'FIELD_NEGATIVE_DENIVELATION_SHORTNAME'
	, FIELD_MINIMUM_ELEVATION_NAME: 'FIELD_MINIMUM_ELEVATION_NAME'
	, FIELD_MINIMUM_ELEVATION_SHORTNAME: 'FIELD_MINIMUM_ELEVATION_SHORTNAME'
	, FIELD_AVERAGE_ELEVATION_NAME: 'FIELD_AVERAGE_ELEVATION_NAME'
	, FIELD_AVERAGE_ELEVATION_SHORTNAME: 'FIELD_AVERAGE_ELEVATION_SHORTNAME'
	, FIELD_MAXIMUM_ELEVATION_NAME: 'FIELD_MAXIMUM_ELEVATION_NAME'
	, FIELD_MAXIMUM_ELEVATION_SHORTNAME: 'FIELD_MAXIMUM_ELEVATION_SHORTNAME'
	, ELEVATION: 'ELEVATION'
	, MIN_AVR_MAX: 'MIN_AVR_MAX'
}, GPXEditor1_1.data.GPXElementRecord.LOCALES);

