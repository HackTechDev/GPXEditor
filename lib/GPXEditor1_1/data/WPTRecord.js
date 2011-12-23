Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.WPTRecord = GPXEditor1_1.data.GPXElementRecord.create([
	{name: 'ele', type: 'float'}
	, {name: 'type', type: 'string', defaultValue: 'UNKNOW'} /* Bad string UNKNOW but mecanical pb unsolved yet */
	, {name: 'lon', type: 'float'}
	, {name: 'lat', type: 'float'}
]);

GPXEditor1_1.data.WPTRecord.prototype.getRecordName = function() {
	return GPXEditor1_1.data.WPTRecord.LOCALES.RECORD_NAME;
};

GPXEditor1_1.data.WPTRecord.prototype.updateRecordByGeometryChange = function() {
	var feature = this.get('feature');
	if (feature) {
		this.beginEdit();
		if (feature.geometryModified) {
			this.set('lon', null);
			this.set('lat', null);
			this.set('ele', null);
		}
		else {
			var ll = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
			if (feature.layer) {
				ll = ll.transform(feature.layer.projection, feature.layer.displayProjection);
			}
			this.beginEdit();
			this.set('lon', Ext.util.Format.round(ll.lon, GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS));
			this.set('lat', Ext.util.Format.round(ll.lat, GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS));
		}
		this.endEdit();
		this.commit();
	}
};
GPXEditor1_1.data.WPTRecord.prototype.updatePositionByLonLat = function() {
	var ll = new OpenLayers.LonLat(this.get('lon'), this.get('lat'));
	var feature = this.get('feature');
	if (feature && feature.layer) {
		ll = ll.transform(feature.layer.displayProjection, feature.layer.projection);
		feature.geometry.x = ll.lon;
		feature.geometry.y = ll.lat;
		feature.layer.drawFeature(feature);
	}
};
GPXEditor1_1.data.WPTRecord.prototype.changeFeatureStyle = function(feature) {
	feature = feature || this.get('feature');
	if (feature) 
		feature.style = GPXEditor1_1.data.WPTRecord.WPT_STYLES[this.get('type')];
};

GPXEditor1_1.data.WPTRecord.create = function(o) {
	var f = Ext.extend(GPXEditor1_1.data.WPTRecord, {});
	var p = f.prototype;

	p.fields = new Ext.util.MixedCollection(false, function(field) {
		return field.name;
	});

	GPXEditor1_1.data.WPTRecord.prototype.fields.each(function(f) {
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

GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS = 7;

GPXEditor1_1.data.WPTRecord.WPT_TYPES = {/* see http://www.geonames.org/export/codes.html */
	UNKNOW: 'UNKNOW'
	, PK: 'PK'     /* peak         */
	, PASS: 'PASS' /* pass         */
	, RHSE: 'RHSE' /* shelter      */
	, WTRW: 'WTRW' /* water source */
	, PKLT: 'PKLT' /* parking      */
};

GPXEditor1_1.data.WPTRecord.WPT_STYLES = {
	UNKNOW: { /* need to be graphic */
		pointRadius: 6
		, fill: true
		, fillColor: '#ff0000'
		, fillOpacity: .7
	}
	, PK: {
		graphicWidth: 12
		, graphicHeight: 12
		, graphicXOffset: -6
		, graphicYOffset: -6
		, externalGraphic: 'js/lib/GPXEditor1_1/css/GPXEditor1_1-img/wpt_pk.png'
	}
	, PASS: {
		graphicWidth: 12
		, graphicHeight: 12
		, graphicXOffset: -6
		, graphicYOffset: -6
		, externalGraphic: 'js/lib/GPXEditor1_1/css/GPXEditor1_1-img/wpt_pass.png'
	}
	, RHSE: {
		graphicWidth: 12
		, graphicHeight: 12
		, graphicXOffset: -6
		, graphicYOffset: -6
		, externalGraphic: 'js/lib/GPXEditor1_1/css/GPXEditor1_1-img/wpt_rhse.png'
	}
	, WTRW: {
		graphicWidth: 12
		, graphicHeight: 12
		, graphicXOffset: -6
		, graphicYOffset: -6
		, externalGraphic: 'js/lib/GPXEditor1_1/css/GPXEditor1_1-img/wpt_wtrw.png'
	}
	, PKLT: {
		graphicWidth: 12
		, graphicHeight: 12
		, graphicXOffset: -6
		, graphicYOffset: -6
		, externalGraphic: 'js/lib/GPXEditor1_1/css/GPXEditor1_1-img/wpt_pklt.png'
	}
};

GPXEditor1_1.data.WPTRecord.LOCALES = Ext.apply({
	RECORD_NAME: 'RECORD_NAME'
	, FIELD_TYPE_NAME: 'FIELD_TYPE_NAME'
	, FIELD_ELE_NAME: 'FIELD_ELE_NAME'
	, FIELD_LON_NAME: 'FIELD_LON_NAME'
	, FIELD_LAT_NAME: 'FIELD_LAT_NAME'
	, WPT_TYPE_UNKNOW: 'WPT_TYPE_UNKNOW'
	, WPT_TYPE_PK: 'WPT_TYPES_PK'
	, WPT_TYPE_PASS: 'WPT_TYPE_PASS'
	, WPT_TYPE_RHSE: 'WPT_TYPE_RHSE'
	, WPT_TYPE_WTRW: 'WPT_TYPE_WTRW'
	, WPT_TYPE_PKLT: 'WPT_TYPE_PKLT'
}, GPXEditor1_1.data.GPXElementRecord.LOCALES);

