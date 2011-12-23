Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.CitySearchComboBox = Ext.extend(Ext.form.ComboBox, {
	initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.form.CitySearchComboBox.LOCALES});

		Ext.apply(this, {
			store: new GPXEditor1_1.data.GeoNamesStore()
			, displayField: 'name'
			, typeAhead: false
			, loadingText: this.LOCALES.SEARCHING
			, width: 100
			, pageSize: 10
			, hideTrigger: true
			, tpl: new Ext.XTemplate(
				'<tpl for="."><div class="search-item" ext:qtip="' + this.LOCALES.CLICK_TO_CENTER_MAP_ON_CITY + '">'
					, '<h3 class="gpxe-gsnName">{name}</h3>'
					, '<span class="gpxe-gsnContryName">{countryName}</span>'
							+ ' / ' 
							+ '<span class="gpxe-gsnAdminName1">{adminName1}</span>'
							+ ' '
							+ '<span class="gpxe-gsnPopulation">({population} ' + this.LOCALES.INHABITANTS + ')</span>'
				, '</div></tpl>'
			)
			, itemSelector: 'div.search-item'
			, queryParam: 'name_startsWith'
			, listWidth: 400
			, enableKeyEvents: true
			, listeners: {
				scope: this
				, keydown: function(field, e) {
					if (e.getCharCode() == e.BACKSPACE) {
						this.collapse();
					}
					else if (e.getCharCode() == e.ENTER) {
						var v = this.getRawValue();
						if (v.length > 0) {
							e.stopPropagation();
							e.stopEvent();
							this.setValue(null);
							this.doQuery(v, true);
						}
					}
				}
				, select: function(cb, record, index) {
					cb.collapse();
				}
			}
		});

		GPXEditor1_1.form.CitySearchComboBox.superclass.initComponent.call(this);
	}
});
Ext.reg('gpxe-CitySearchComboBox', GPXEditor1_1.form.CitySearchComboBox);

GPXEditor1_1.form.CitySearchComboBox.LOCALES = {
	LABEL_SEARCH_CITY: 'LABEL_SEARCH_CITY'
	, SEARCHING: 'SEARCHING'
	, INHABITANTS: 'INHABITANTS'
	, CLICK_TO_CENTER_MAP_ON_CITY: 'CLICK_TO_CENTER_MAP_ON_CITY'
	, CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND: 'CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND'
	, SEARCH_INPUT_HELP: 'SEARCH_INPUT_HELP'
};
