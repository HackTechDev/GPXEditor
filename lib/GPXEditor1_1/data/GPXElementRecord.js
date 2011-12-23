Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.GPXElementRecord = GeoExt.data.FeatureRecord.create([
	{name: 'name', type: 'string'}
	, {name: 'desc', type: 'string'}
]);

GPXEditor1_1.data.GPXElementRecord.prototype.getName = function() { 
	if (this.get('name'))
		return this.get('name');
	var ret = this.getRecordName();
	if (this.store)
		ret += ' ' + (this.store.indexOf(this) + 1);
	return ret;
};
GPXEditor1_1.data.GPXElementRecord.prototype.getRecordName = function() {
	return GPXEditor1_1.data.GPXElementRecord.LOCALES.RECORD_NAME;
};
GPXEditor1_1.data.GPXElementRecord.prototype.updateRecordByGeometryChange = function() {
};
GPXEditor1_1.data.GPXElementRecord.prototype.updateFeatureStyle = function() {
	var feature = this.get('feature');
	if (feature) {
		this.changeFeatureStyle(feature);
		if (feature.layer)
			feature.layer.drawFeature(feature);
	}
};
GPXEditor1_1.data.GPXElementRecord.prototype.changeFeatureStyle = function(feature) {
};
GPXEditor1_1.data.GPXElementRecord.prototype.cleanBeforeDestroy = function() {
};

GPXEditor1_1.data.GPXElementRecord.create = function(o) {
	var f = Ext.extend(GPXEditor1_1.data.GPXElementRecord, {});
	var p = f.prototype;

	p.fields = new Ext.util.MixedCollection(false, function(field) {
		return field.name;
	});

	GPXEditor1_1.data.GPXElementRecord.prototype.fields.each(function(f) {
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

GPXEditor1_1.data.GPXElementRecord.LOCALES = {
	RECORD_NAME: 'RECORD_NAME'
	, FIELD_NAME_NAME: 'FIELD_NAME_NAME'
	, FIELD_DESC_NAME: 'FIELD_DESC_NAME'
};
