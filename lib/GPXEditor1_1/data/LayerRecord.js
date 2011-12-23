Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.LayerRecord = GeoExt.data.LayerRecord.create([
	{name: 'id', type: 'string'}
	, {name: 'provider', type: 'string'}
	, {name: 'zone', type: 'string'}
	, {name: 'type', type: 'strint'}
	, {name: 'orderNum', type: 'int'}
	, {name: 'active', type: 'boolean'}
]);

GPXEditor1_1.data.LayerRecord.LOCALES = {
	FIELD_TITLE_NAME: 'FIELD_TITLE_NAME'
	, FIELD_ID_NAME: 'FIELD_ID_NAME'
	, FIELD_PROVIDERS_NAME: 'FIELD_PROVIDERS_NAME'
	, FIELD_ZONE_NAME: 'FIELD_ZONE_NAME'
	, FIELD_ZONE_TYPE: 'FIELD_ZONE_TYPE'
	, FIELD_ORDERNUM_TYPE: 'FIELD_ORDERNUM_TYPE'
	, FIELD_ACTIVE_TYPE: 'FIELD_ACTIVE_TYPE'
};
