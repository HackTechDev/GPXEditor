Ext.namespace('GPXEditor1_1.menu');

GPXEditor1_1.menu.LayersMenu = Ext.extend(Ext.menu.Menu, {
	mapProvidersStore: undefined,
	mapProvidersGrid: undefined,
	itemsLayers: undefined,
	actionMenu: undefined,
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.menu.LayersMenu.LOCALES
		});
		this.itemsLayers = [];
		if (! this.mapProvidersStore || ! (this.mapProvidersStore instanceof GPXEditor1_1.data.MapProvidersStore))
			this.mapProvidersStore = new GPXEditor1_1.data.MapProvidersStore();
		GPXEditor1_1.menu.LayersMenu.superclass.initComponent.call(this);
		this.actionMenu = new Ext.Action({
			iconCls: 'gpxe-Layers',
			text: this.LOCALES.ACTIONMENU_TEXT,
			tooltip: this.LOCALES.ACTIONMENU_TOOTIP,
			menu: this
		});
		this.mapProvidersGrid = new GPXEditor1_1.grid.MapProvidersGrid({
			store: this.mapProvidersStore,
			region: 'center'
		});
		this.winProviders = new Ext.Window({
			layout: 'border',
			iconCls: 'gpxe-Config',
			title: this.LOCALES.MAP_CONFIG_TITLE,
			width: 400,
			height: 300,
			closeAction: 'hide',
			plain: true,
			items: [this.mapProvidersGrid],
			buttons: [{
				text: this.LOCALES.MAP_CONFIG_CLOSE,
				handler: function() { this.winProviders.hide(); },
				scope: this
			}]
		});
		this.mapProvidersStore.on('update', this.updateLayersItems, this);
		this.mapProvidersStore.map.events.register('changebaselayer', this, function() {
			this.updateLayersItems();
		});
		this._initItems();
	},
	getMapProvidersStore: function() {
		return this.mapProvidersStore;
	},
	getMapProvidersGrid: function() {
		return this.mapProvidersGrid;
	},
	updateLayersItems: function(layers) {
		for (var i = 0; i < this.itemsLayers.length; i++) {
			var il = this.itemsLayers[i];
			var r = il.layerRecord;
			r.get('isActive') ? il.show() : il.hide();
			if (r.get('layer') == this.mapProvidersStore.map.baseLayer)
				il.disable();
			else
				il.enable();
		}
	},
	_initItems: function() {
		this.add({
			text: this.LOCALES.OPEN_MAP_CONFIG,
			iconCls: 'gpxe-Config',
			handler: function() { this.winProviders.show(this); },
			scope: this
		});
		this.add('-');
		var layers = new Ext.util.MixedCollection();
		this.mapProvidersStore.each(function (r) {
			layers.add(r.get('id'), r);
		});
		layers.sort('DESC', function(r1, r2) {
			return r1.data.orderNum - r2.data.orderNum;
		}, this);
		layers.each(function(r, idx, length) {
			var l = r.data.layer;
			var iconCls = 'gpxe-LayerMap';
			var type = GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_MAP;
			if (r.data.type == GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.SAT) {
				iconCls = 'gpxe-LayerSat';
				type = GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_SAT;
			}
			else if (r.data.type == GPXEditor1_1.data.MapProvidersStore.LAYER_TYPE.TOPO) {
				iconCls = 'gpxe-LayerTopo';
				type = GPXEditor1_1.data.MapProvidersStore.LOCALES.LAYER_TYPE_TOPO;
			}
			var p = {
				toggleGroup: 'mapLayer',
				allowDepress: false,
				pressed: false,
				checked: false,
				text: '<span class="gpxe-lm-provider">' + r.data.provider + '</span> - <span class="gpxe-lm-zone">' + r.data.zone + '</span> - <span class="gpxe-lm-type">(' + type + ')',
				width: '100%',
				iconAlign: 'left',
				iconCls: 'gpxe-LayerMap',
				scope: this,
				handler: this.changeLayer,
				layerRecord: r,
				iconCls: iconCls
			};
			if (this.mapProvidersStore.map.baseLayer === l) {
				p.checked = true;
				p.pressed = true;
			}
			p = new Ext.menu.Item(p);
			this.add(p);
			this.itemsLayers.push(p);
		}, this);
		this.updateLayersItems();
	},
	getActionMenu: function() {
		return this.actionMenu;
	},
	changeLayer: function(item, event) {
		this.mapProvidersStore.map.setBaseLayer(item.layerRecord.data.layer);
	}
});

GPXEditor1_1.menu.LayersMenu.LOCALES = {
	MAP_CONFIG_CLOSE: 'MAP_CONFIG_CLOSE',
	MAP_CONFIG_TITLE: 'MAP_CONFIG_TITLE',
	OPEN_MAP_CONFIG: 'OPEN_MAP_CONFIG',
	ACTIONMENU_TOOTIP: 'ACTIONMENU_TOOTIP',
	ACTIONMENU_TEXT: 'ACTIONMENU_TEXT'
};
