Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXMapToolbar = Ext.extend(Ext.Toolbar, {
	gpxMap: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GPXMapToolbar.LOCALES});

		if (! (this.gpxMap instanceof GPXEditor1_1.GPXMap))
			this.gpxMap = this.findParentByType(GPXEditor1_1.GPXMap);
		if (! (this.gpxMap instanceof GPXEditor1_1.GPXMap))
			this.gpxMap = new GPXEditor1_1.GPXMap();

		var leftItems = this._initLeftItems();
		var rightItems = this._initRightItems();
		var items = [];
		if (leftItems.length > 0)
			items.push(leftItems);
		if (rightItems.length > 0) {
			items.push('->');
			items.push(rightItems);
		}

		Ext.apply(this, {
			items: items
		});

		GPXEditor1_1.GPXMapToolbar.superclass.initComponent.call(this);
	}
	, getGPXMap: function() {
		return this.gpxMap;
	}
	, _initLeftItems: function() {
		var ret = [];
		var mapActions = GPXEditor1_1.GPXMap.ACTIONS;
		var bt;

		this.layersMenu = new GPXEditor1_1.menu.LayersMenu({mapProvidersStore: this.gpxMap.mapProvidersStore}); /* BAD Need refactoring */
		bt = new Ext.Button(this.layersMenu.getActionMenu());
		bt.menuAlign = 'bl-tl';
		bt.setText(null);
		this.layersMenu.winProviders.on('hide', function() { // Hack for good computation offset pos of menu 
			this.showMenu();
			this.hideMenu();
		}, bt);
		ret.push(bt);
		ret.push(' ');
		ret.push(' ');

		ret.push('-');
		bt = new Ext.Button(this.gpxMap.getAction(mapActions.ZOOM_OUT));
		bt.setText(null);
		ret.push(bt);
		bt = new Ext.Button(this.gpxMap.getAction(mapActions.ZOOM_MAP));
		bt.setText(null);
		ret.push(bt);
		bt = new Ext.Button(this.gpxMap.getAction(mapActions.ZOOM_IN));
		bt.setText(null);
		ret.push(bt);
		ret.push(' ');
		ret.push('-');
		bt = new Ext.Button(this.gpxMap.getAction(mapActions.NAVIGATE));
		bt.setText(null);
		ret.push(bt);

		return ret;
	}
	, _initRightItems: function() {
		var mapActions = GPXEditor1_1.GPXMap.ACTIONS;
		var ret = [];
		var bt;

		ret.push({
			text: GPXEditor1_1.form.CitySearchComboBox.LOCALES.LABEL_SEARCH_CITY 
			, tooltip: GPXEditor1_1.form.CitySearchComboBox.LOCALES.SEARCH_INPUT_HELP
		});
		ret.push(new GPXEditor1_1.form.CitySearchComboBox({
			listAlign: 'br-tr'
			, listeners: {
				select: this.selectCity
				, scope: this
			}
		}));
		ret.push(' ');
		ret.push(' ');
		bt = new Ext.Button(this.gpxMap.getAction(mapActions.HELP));
		bt.setText(null);
		ret.push(bt);
		ret.push(' ');
		ret.push(' ');

		return ret;
	}
	, selectCity: function(cb, record, index) {
		var zoom = this.gpxMap.getMaxZoomLevel() - 4;
		if (! this.gpxMap.isValidCenter(record.get('lon'), record.get('lat'))) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE
				, msg: this.LOCALES.ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG
				, buttons: Ext.MessageBox.CANCEL
				, animEl: this.el
				, icon: Ext.MessageBox.ERROR
				, scope: this
			});
			return;
		}
		this.gpxMap.setCenter(record.get('lon'), record.get('lat'), zoom);
	}
});
Ext.reg('gpxe-GPXMapToolbar', GPXEditor1_1.GPXMapToolbar);

GPXEditor1_1.GPXMapToolbar.LOCALES = {
	ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE: 'ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE'
	, ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG: 'ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG'
};
