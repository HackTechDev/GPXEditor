Ext.namespace('GPXEditor1_1');

GPXEditor1_1.MapToolbar = Ext.extend(Ext.Toolbar, {
	mapPanel: undefined,
	layersMenu: undefined,
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.MapToolbar.LOCALES
		});
		GPXEditor1_1.MapToolbar.superclass.initComponent.call(this);
		this.setMapPanel(this.mapPanel);
	},
	setMapPanel: function(mapPanel) {
		if (! mapPanel || ! mapPanel instanceof GPXEditor1_1.MapPanel) {
			delete this.mapPanel;
			delete this.layersMenu;
			this.removeAll(true);
		}
		this.mapPanel = mapPanel;
		this.initMapItems();
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	initMapItems: function() {
		var bt = null;
		this.layersMenu = new GPXEditor1_1.menu.LayersMenu({mapProvidersStore: this.mapPanel.getMapProvidersStore()});
		bt = new Ext.Button(this.layersMenu.getActionMenu());
		bt.menuAlign = 'bl-tl';
		bt.setText(null);
		this.layersMenu.winProviders.on('hide', function() { // Hack for good computation offset pos of menu 
			this.showMenu();
			this.hideMenu();
		}, bt);
		this.add(bt);
		this.add(' ');
		this.add(' ');
		this.add('-');
		bt = new Ext.Button(this.mapPanel.getAction('ZOOM_OUT'));
		bt.setText(null);
		this.add(bt);
		bt = new Ext.Button(this.mapPanel.getAction('ZOOM_MAP'));
		bt.setText(null);
		this.add(bt);
		bt = new Ext.Button(this.mapPanel.getAction('ZOOM_IN'));
		bt.setText(null);
		this.add(bt);
		this.add(' ');
		this.add(' ');
		this.add('-');
		bt = new Ext.Button(this.mapPanel.getAction('NAVIGATE'));
		bt.setText(null);
		this.add(bt);
		bt = new Ext.Button(this.mapPanel.getAction('INFOPOINT'));
		bt.setText(null);
		this.add(bt);
		this.add('->');
		this.add({
			text: GPXEditor1_1.form.CitySearchComboBox.LOCALES.LABEL_SEARCH_CITY, 
			tooltip: GPXEditor1_1.form.CitySearchComboBox.LOCALES.SEARCH_INPUT_HELP
		});
		this.add(new GPXEditor1_1.form.CitySearchComboBox({
			listAlign: 'br-tr',
			listeners: {
				scope: this,
				select: this.selectCity
			}
		}));
	},
	selectCity: function(cb, record, index) {
		var zoom = this.mapPanel.getMaxZoomLevel() - 4;
		if (! this.mapPanel.isValidCenter(record.get('lon'), record.get('lat'))) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE,
				msg: this.LOCALES.ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG,
				buttons: Ext.MessageBox.CANCEL,
				animEl: this.el,
				icon: Ext.MessageBox.ERROR,
				scope: this
			});
			return;
		}
		this.mapPanel.setCenter(record.get('lon'), record.get('lat'), zoom);
	}
});

GPXEditor1_1.MapToolbar.LOCALES = {
	ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE: 'ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_TITLE',
	ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG: 'ERROR_CANT_DISPLAY_CITY_ON_THIS_MAP_BACKGROUND_MSG'
};
