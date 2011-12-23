Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.TRKRecord = GPXEditor1_1.data.GPXPathRecord.create([
	{name: 'numberOfSignalLost', type: 'int'}
	, {name: 'duration', type: 'float'}
	, {name: 'breakDuration', type: 'float'}
	, {name: 'minimumSpeedDistance', type: 'float'}
	, {name: 'averageSpeedDistance', type: 'float'}
	, {name: 'maximumSpeedDistance', type: 'float'}
	, {name: 'positiveDenivelationDuration', type: 'float'}
	, {name: 'minimumSpeedPositiveDenivelation', type: 'float'}
	, {name: 'averageSpeedPositiveDenivealtion', type: 'float'}
	, {name: 'maximumSpeedPositiveDenivelation', type: 'float'}
	, {name: 'negativeDenivelationDuration', type: 'float'}
	, {name: 'minimumSpeedNegativeDenivelation', type: 'float'}
	, {name: 'averageSpeedNegativeDenivealtion', type: 'float'}
	, {name: 'maximumSpeedNegativeDenivelation', type: 'float'}
]);

GPXEditor1_1.data.TRKRecord.prototype.getRecordName = function() {
	return GPXEditor1_1.data.TRKRecord.LOCALES.RECORD_NAME;
};

GPXEditor1_1.data.TRKRecord.prototype.changeFeatureStyle = function(feature) {
	feature = feature || this.get('feature');
	if (feature) 
		feature.style = GPXEditor1_1.data.TRKRecord.TRK_STYLE;
};

GPXEditor1_1.data.TRKRecord.prototype.updateRecordByStats = function() {
	GPXEditor1_1.data.TRKRecord.superclass.updateRecordByStats.call(this);
	if (! (this.statStore instanceof GPXEditor1_1.data.StatStore) || this.statStore.getCount() < 2) {
		this.set('numberOfSignalLost', null);
		this.set('duration', null);
		this.set('breakDuration', null);
		this.set('minimumSpeedDistance', null);
		this.set('averageSpeedDistance', null);
		this.set('maximumSpeedDistance', null);
		this.set('positiveDenivelationDuration', null);
		this.set('minimumSpeedPositiveDenivelation', null);
		this.set('averageSpeedPositiveDenivealtion', null);
		this.set('maximumSpeedPositiveDenivelation', null);
		this.set('negativeDenivelationDuration', null);
		this.set('minimumSpeedNegativeDenivelation', null);
		this.set('averageSpeedNegativeDenivealtion', null);
		this.set('maximumSpeedNegativeDenivelation', null);
	}
	else {
		var lastStat = this.statStore.getAt(this.statStore.getTotalCount() - 1);
		this.set('numberOfSignalLost', this.get('feature').geometry.components.length);
		this.set('duration', lastStat.get('totalDuration'));
		this.set('breakDuration', null); // TODO: fix it 
		this.set('minimumSpeedDistance', null);
		this.set('averageSpeedDistance', null);
		this.set('maximumSpeedDistance', null);
		this.set('positiveDenivelationDuration', lastStat.get('positiveDenivelationDuration'));
		this.set('minimumSpeedPositiveDenivelation', null);
		this.set('averageSpeedPositiveDenivealtion', null);
		this.set('maximumSpeedPositiveDenivelation', null);
		this.set('negativeDenivelationDuration', lastStat.get('negativeDenivelationDuration'));
		this.set('minimumSpeedNegativeDenivelation', null);
		this.set('averageSpeedNegativeDenivealtion', null);
		this.set('maximumSpeedNegativeDenivelation', null);
	}
};

GPXEditor1_1.data.TRKRecord.create = function(o) {
	var f = Ext.extend(GPXEditor1_1.data.TRKRecord, {});
	var p = f.prototype;

	p.fields = new Ext.util.MixedCollection(false, function(field) {
		return field.name;
	});

	GPXEditor1_1.data.TRKRecord.prototype.fields.each(function(f) {
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

GPXEditor1_1.data.TRKRecord.TRK_STYLE = {
	strokeColor: '#ff00ff'
	, strokeWidth: 3
	, strokeOpacity: .7
};

GPXEditor1_1.data.TRKRecord.LOCALES = Ext.apply({
	RECORD_NAME: 'RECORD_NAME'
	, FIELD_NUMBER_OF_SIGNAL_LOST_NAME: 'FIELD_NUMBER_OF_SIGNAL_LOST_NAME'
	, FIELD_NUMBER_OF_SIGNAL_LOST_SHORTNAME: 'FIELD_NUMBER_OF_SIGNAL_LOST_SHORTNAME'
	, FIELD_DURATION_NAME: 'FIELD_DURATION_NAME'
	, FIELD_BREAK_DURATION_NAME: 'FIELD_BREAK_DURATION_NAME'
	, FIELD_MINIMUM_SPEED_DISTANCE_NAME: 'FIELD_MINIMUM_SPEED_DISTANCE_NAME'
	, FIELD_MINIMUM_SPEED_DISTANCE_SHORTNAME: 'FIELD_MINIMUM_SPEED_DISTANCE_SHORTNAME'
	, FIELD_AVERAGE_SPEED_DISTANCE_NAME: 'FIELD_AVERAGE_SPEED_DISTANCE_NAME'
	, FIELD_AVERAGE_SPEED_DISTANCE_SHORTNAME: 'FIELD_AVERAGE_SPEED_DISTANCE_SHORTNAME'
	, FIELD_MAXIMUM_SPEED_DISTANCE_NAME: 'FIELD_MAXIMUM_SPEED_DISTANCE_NAME'
	, FIELD_MAXIMUM_SPEED_DISTANCE_SHORTNAME: 'FIELD_MAXIMUM_SPEED_DISTANCE_SHORTNAME'
	, FIELD_POSITIVE_DENIVELATION_DURATION_NAME: 'FIELD_POSITIVE_DENIVELATION_DURATION_NAME'
	, FIELD_POSITIVE_DENIVELATION_DURATION_SHORTNAME: 'FIELD_POSITIVE_DENIVELATION_DURATION_SHORTNAME'
	, FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_NAME: 'FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_NAME'
	, FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME: 'FIELD_MINIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME'
	, FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_NAME: 'FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_NAME'
	, FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_SHORTNAME: 'FIELD_AVERAGE_SPEED_POSITIVE_DENIVELATION_SHORTNAME'
	, FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_NAME: 'FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_NAME'
	, FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME: 'FIELD_MAXIMUM_SPEED_POSITIVE_DENIVELATION_SHORTNAME'
	, FIELD_POSITIVE_NEGATIVE_DURATION_NAME: 'FIELD_NEGATIVE_DENIVELATION_DURATION_NAME'
	, FIELD_POSITIVE_NEGATIVE_DURATION_SHORTNAME: 'FIELD_NEGATIVE_DENIVELATION_DURATION_SHORTNAME'
	, FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_NAME: 'FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_NAME'
	, FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME: 'FIELD_MINIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME'
	, FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_NAME: 'FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_NAME'
	, FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_SHORTNAME: 'FIELD_AVERAGE_SPEED_NEGATIVE_DENIVELATION_SHORTNAME'
	, FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_NAME: 'FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_NAME'
	, FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME: 'FIELD_MAXIMUM_SPEED_NEGATIVE_DENIVELATION_SHORTNAME'
}, GPXEditor1_1.data.GPXPathRecord.LOCALES);

