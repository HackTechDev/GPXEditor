Ext.namespace('GPXEditor1_1.data');

GPXEditor1_1.data.GeoNamesStore = Ext.extend(Ext.data.Store, {
	constructor: function(config) {
		config = config || {};

		this.LOCALES = GPXEditor1_1.data.GeoNamesStore.LOCALES;

		Ext.applyIf(config, {
			proxy: new Ext.data.HttpProxy({
				url: './proxy.php' // URL PROXY
				, method: 'POST'
			})
			, baseParams: {
				_proxy_url: 'http://ws.geonames.org/search'
				, lang: GPXEditor1_1.data.GeoNamesStore.LANG
				, type: 'json'
				, featureClass: 'P'
				, style: 'MEDIUM'
			}
			, paramNames: {
				start: 'startRow'
				, limit: 'maxRows'
			}
			, reader: new Ext.data.JsonReader(
				{
					root: 'geonames'
					, totalProperty: 'totalResultsCount'
					, id: 'geonameId'
				}, [
					{name: 'countryName' }
					, {name: 'adminCode1'}
					, {name: 'fclName'}
					, {name: 'countryCode'}
					, {name: 'lon', mapping: 'lng'}
					, {name: 'fcodeName'}
					, {name: 'toponymName'}
					, {name: 'fcl'}
					, {name: 'name'}
					, {name: 'fcode'}
					, {name: 'geonameId'}
					, {name: 'lat'}
					, {name: 'adminName1'}
					, {name: 'population'}
				]
			)
		});

		GPXEditor1_1.data.GeoNamesStore.superclass.constructor.call(this, config);
	}
});
GPXEditor1_1.data.GeoNamesStore.LANG = 'fr'; /* Need to be changed at startup */

GPXEditor1_1.data.GeoNamesStore.LOCALES = {
};
