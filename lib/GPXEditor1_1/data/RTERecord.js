Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.RTERecord = GPXEditor1_1.data.GPXPathRecord.create([
]);

GPXEditor1_1.data.RTERecord.prototype.getRecordName = function() {
	return GPXEditor1_1.data.RTERecord.LOCALES.RECORD_NAME;
};

GPXEditor1_1.data.RTERecord.prototype.changeFeatureStyle = function(feature) {
	feature = feature || this.get('feature');
	if (feature) 
		feature.style = GPXEditor1_1.data.RTERecord.RTE_STYLE;
};

GPXEditor1_1.data.RTERecord.create = function(o) {
	var f = Ext.extend(GPXEditor1_1.data.RTERecord, {});
	var p = f.prototype;

	p.fields = new Ext.util.MixedCollection(false, function(field) {
		return field.name;
	});

	GPXEditor1_1.data.RTERecord.prototype.fields.each(function(f) {
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

GPXEditor1_1.data.RTERecord.RTE_STYLE = {
	strokeColor: '#ffff00'
	, strokeWidth: 3
	, strokeOpacity: .7
};

GPXEditor1_1.data.RTERecord.LOCALES = Ext.apply({
	RECORD_NAME: 'RECORD_NAME'
}, GPXEditor1_1.data.GPXPathRecord.LOCALES);

