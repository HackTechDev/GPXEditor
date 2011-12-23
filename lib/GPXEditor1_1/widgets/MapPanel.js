Ext.namespace('GPXEditor1_1');

GPXEditor1_1.MapPanel = Ext.extend(GeoExt.MapPanel, {
	gpxLayer: undefined,
	mapActions: undefined,
	projection: undefined,
	winLoadGPX: undefined,
	winSaveGPX: undefined,
	loadingInProgress: undefined,
	initComponent: function() {
		//console.log('CREATION DE MAPPANEL');
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.MapPanel.LOCALES
		});
		this.loadingInProgress = false;
		this.mapActions = {};
		if (! this.map || ! (this.map instanceof OpenLayers.GPXEditorMap)) 
			this.map = GPXEditor1_1.Util.getDefaultMap();
		Ext.applyIf(this, {
			bodyCfg: {
				cls: 'gpxe-MapPanel'
			},
			projection: new OpenLayers.Projection('EPSG:4326'),
			mapProvidersStore: new GPXEditor1_1.data.MapProvidersStore({map: this.map, layersId: this.layersId})
		});
		this.gpxLayer = new OpenLayers.Layer.GPXLayer('GPXEditor', {
			projection: new OpenLayers.Projection('EPSG:4326')
		});
		this.map.addLayer(this.gpxLayer);
		this.mapToolbarConfig = this.mapToolbarConfig || {};
		Ext.apply(this.mapToolbarConfig, {mapPanel: this});
		Ext.applyIf(this, {
			bbar: new GPXEditor1_1.MapToolbar(this.mapToolbarConfig)
		});
		if (! this.center)
			this.center = new OpenLayers.LonLat(6.31328, 45.35818);
		this.center = this.center.transform(this.projection, this.map.getProjection());
		if (! this.zoom)
			this.zoom = 5;
		this.winLoadGPX = new GPXEditor1_1.form.FormWindow({
			modal: true,
			width: 350,
			formPanel: {
				xtype: 'gpxe-ImportForm',
				deferredRender: false,
				forceLayout: true,
				frame: true,
				header: false,
				autoHeight: true,
				mapPanel: this
			}
		});
		this.winSaveGPX = new GPXEditor1_1.form.FormWindow({
			modal: true,
			width: 350,
			formPanel: {
				xtype: 'gpxe-ExportForm',
				deferredRender: false,
				forceLayout: true,
				frame: true,
				header: false,
				autoHeight: true,
				mapPanel: this
			}
		});
		GPXEditor1_1.MapPanel.superclass.initComponent.call(this);
		this.map.events.on({
			'zoomend': this.updateZoomActions,
			'changebaselayer': this.checkExtentCompatibility,
			scope: this
		});
		this.on('render', function() {
			this.body.on('mouseenter', function() {
				if (! this.mapKbdControl)
					this.mapKbdControl = new OpenLayers.Control.KeyboardDefaults({autoActivate: true});
				this.map.addControl(this.mapKbdControl);
			}, this);
			this.body.on('mouseleave', function() {
				this.map.removeControl(this.mapKbdControl);
				if (this.mapKbdControl)
					this.mapKbdControl.destroy();
				delete this.mapKbdControl;
			}, this);
		}, this);
		this.gpxLayer.events.register('featuresremoved', this, function(o) {
			if (this.gpxLayer.getNbGPXElements == 0)
				this.setMapMode(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE);
		});
		this.gpxLayer.events.register('featureremoved', this, function(o) {
			if (this.gpxLayer.getNbWpts() == 0 && (o.feature.geometry instanceof OpenLayers.Geometry.Point))
				this.setMapMode(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE);
			else if (this.gpxLayer.getNbRtes() == 0 && (o.feature.geometry instanceof OpenLayers.Geometry.LineString))
				this.setMapMode(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE);
			else if (this.gpxLayer.getNbTrks() == 0 && (o.feature.geometry instanceof OpenLayers.Geometry.MultiLineString))
				this.setMapMode(GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE);
		});
		this.winLoadGPX.on('hide', function() {
			this.loadingInProgress = false;
		}, this);
	},
	getGPXLayer: function() {
		return this.gpxLayer;
	},
	isLoadingInProgress: function() {
		return this.loadingInProgress;
	},
	checkExtentCompatibility: function(o) {
		var me = this.map.getMaxExtent();
		var e = this.map.getExtent();
		if (! me.containsBounds(e, true)) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_INCOMPATIBLE_EXTENT_TITLE,
				msg: this.LOCALES.ERROR_INCOMPATIBLE_EXTENT_MSG,
				buttons: Ext.MessageBox.OKCANCEL,
				animEl: this.el,
				icon: Ext.MessageBox.ERROR,
				fn: function(bId) {
					if (bId == 'ok')
						this.map.zoomToMaxExtent();
					else {
						this.map.setBaseLayer(o.oldLayer);
						this.map.zoomToExtent(o.oldExtent);
					}
				},
				scope: this
			});
		}
	},
	onLayerchange: function(e) {
		GPXEditor1_1.MapPanel.superclass.onLayerchange.apply(this, arguments);
		this.updateZoomActions();
		/* Pb google map v2 */
		var e = Ext.get(this.map.id + '_GMap2Container');
		if (e != null)
			e.setStyle('background-color', null);
	},
	getMapProvidersStore: function() {
		return this.mapProvidersStore;
	},
	getGPXSelectControl: function() {
		return this.mapActions[GPXEditor1_1.MapPanel.MAP_ACTIONS.NAVIGATE].control.selectControl;
	},
	setMapMode: function(mode) {
		if (this.mapActions[mode] && this.mapActions[mode].control)
			this.mapActions[mode].control.activate();
	},
	getAction: function(actionId) {
		if (! this.mapActions[actionId]) {
			var definedActions = GPXEditor1_1.MapPanel.MAP_ACTIONS;
			switch (actionId) {
				case definedActions.ZOOM_OUT:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomOut(),
						map: this.map,
						iconCls: 'gpxe-ZoomOut',
						text: this.LOCALES.MAPACTION_ZOOM_IN_TEXT,
						tooltip: this.LOCALES.MAPACTION_ZOOM_OUT_TOOLTIP
					});
					break;
				case definedActions.ZOOM_MAP:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomToMaxExtent(),
						map: this.map,
						iconCls: 'gpxe-ZoomToMaxExtent',
						text: this.LOCALES.MAPACTION_ZOOM_MAP_TEXT,
						tooltip: this.LOCALES.MAPACTION_ZOOM_MAP_TOOLTIP
					});
					break;
				case definedActions.ZOOM_IN:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomIn(),
						map: this.map,
						iconCls: 'gpxe-ZoomIn',
						text: this.LOCALES.MAPACTION_ZOOM_IN_TEXT,
						tooltip: this.LOCALES.MAPACTION_ZOOM_IN_TOOLTIP
					});
					break;
				case definedActions.NAVIGATE:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.GPXNavigation(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point', 'OpenLayers.Geometry.LineString', 'OpenLayers.Geometry.MultiLineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						iconCls: 'gpxe-Nav',
						text: this.LOCALES.MAPACTION_NAVIGATE_TEXT,
						tooltip: this.LOCALES.MAPACTION_NAVIGATE_TOOLTIP,
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false,
						pressed: true,
						checked: true
					});
					break;
				case definedActions.INFOPOINT:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.InfoPoint(),
						map: this.map,
						iconCls: 'gpxe-WptInfo',
						text: this.LOCALES.MAPACTION_INFOPOINT_TEXT,
						tooltip: this.LOCALES.MAPACTION_INFOPOINT_TOOLTIP,
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false,
						pressed: false,
						checked: false
					});
					break;
				case definedActions.LOAD_GPX:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-AddFileIcon',
						text: this.LOCALES.MAPACTION_LOADGPX_TEXT,
						tooltip: this.LOCALES.MAPACTION_LOADGPX_TOOLTIP,
						handler: function() {
							this.loadingInProgress = true;
							this.winLoadGPX.show();
						},
						scope: this
					});
					break;
				case definedActions.SAVE_GPX:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-SaveFileIcon',
						text: this.LOCALES.MAPACTION_SAVEGPX_TEXT,
						tooltip: this.LOCALES.MAPACTION_SAVEGPX_TOOLTIP,
						handler: function() {
							this.winSaveGPX.show();
						},
						scope: this
					});
					break;
				case definedActions.DEL_GPX:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-DeleteAllIcon',
						text: this.LOCALES.MAPACTION_DELGPX_TEXT,
						tooltip: this.LOCALES.MAPACTION_DELGPX_TOOLTIP,
						handler: function() {
							this.gpxLayer.unselectAllFeatures();
							this.gpxLayer.destroyFeatures();
						},
						scope: this
					});
					break;
				case definedActions.ZOOM_GPX:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-ZoomToGPX',
						text: this.LOCALES.MAPACTION_ZOOMGPX_TEXT,
						tooltip: this.LOCALES.MAPACTION_ZOOMGPX_TOOLTIP,
						handler: function() {
							this.map.zoomToExtent(this.gpxLayer.getDataExtent());
						},
						scope: this
					});
					break;
				case definedActions.ADD_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DrawFeature(this.gpxLayer, OpenLayers.Handler.Point, {
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_ADD_WPT_TEXT,
						tooltip: this.LOCALES.MAPACTION_ADD_WPT_TOOLTIP,
						iconCls: 'gpxe-WptAdd',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.EDIT_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point'],
							hover: true,
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_EDIT_WPT_TEXT,
						tooltip: this.LOCALES.MAPACTION_EDIT_WPT_TOOLTIP,
						iconCls: 'gpxe-WptEdit',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.DEL_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_DEL_WPT_TEXT,
						tooltip: this.LOCALES.MAPACTION_DEL_WPT_TOOLTIP,
						iconCls: 'gpxe-WptDelete',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.ADD_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DrawFeature(this.gpxLayer, OpenLayers.Handler.Path, {
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_ADD_RTE_TEXT,
						tooltip: this.LOCALES.MAPACTION_ADD_RTE_TOOLTIP,
						iconCls: 'gpxe-RteAdd',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.EDIT_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString'],
							highlightOnly: true,
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_EDIT_RTE_TEXT,
						tooltip: this.LOCALES.MAPACTION_EDIT_RTE_TOOLTIP,
						iconCls: 'gpxe-RteEdit',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.SWAP_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.PasteAndInverseFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_SWAP_RTE_TEXT,
						tooltip: this.LOCALES.MAPACTION_SWAP_RTE_TOOLTIP,
						iconCls: 'gpxe-RteSwap',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.DEL_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_DEL_RTE_TEXT,
						tooltip: this.LOCALES.MAPACTION_DEL_RTE_TOOLTIP,
						iconCls: 'gpxe-RteDelete',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.CONV_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ConvertFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_CONV_RTE_TEXT,
						tooltip: this.LOCALES.MAPACTION_CONV_RTE_TOOLTIP,
						iconCls: 'gpxe-ToTrk',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.ADD_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DrawFeature(this.gpxLayer, OpenLayers.Handler.Path, {
							multi: true,
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_ADD_TRK_TEXT,
						tooltip: this.LOCALES.MAPACTION_ADD_TRK_TOOLTIP,
						iconCls: 'gpxe-TrkAdd',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.EDIT_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString'],
							highlightOnly: true,
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_EDIT_TRK_TEXT,
						tooltip: this.LOCALES.MAPACTION_EDIT_TRK_TOOLTIP,
						iconCls: 'gpxe-TrkEdit',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.SWAP_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.PasteAndInverseFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_SWAP_TRK_TEXT,
						tooltip: this.LOCALES.MAPACTION_SWAP_TRK_TOOLTIP,
						iconCls: 'gpxe-TrkSwap',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.DEL_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_DEL_TRK_TEXT,
						tooltip: this.LOCALES.MAPACTION_DEL_TRK_TOOLTIP,
						iconCls: 'gpxe-TrkDelete',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
				case definedActions.CONV_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ConvertFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString'],
							selectStyle: OpenLayers.Feature.Vector.style.select
						}),
						map: this.map,
						text: this.LOCALES.MAPACTION_CONV_TRK_TEXT,
						tooltip: this.LOCALES.MAPACTION_CONV_TRK_TOOLTIP,
						iconCls: 'gpxe-ToRte',
						toggleGroup: GPXEditor1_1.MapPanel.MAP_MODE_GROUP,
						allowDepress: false
					});
					break;
			}
		}
		return this.mapActions[actionId];
	},
	getMap: function() {
		return this.map;
	},
	getProjection: function() {
		return this.projection;
	},
	updateZoomActions: function() {
		if (this.mapActions['ZOOM_OUT']) 
			this.map.getZoom() == 0 ?
				this.mapActions['ZOOM_OUT'].disable()
				:
				this.mapActions['ZOOM_OUT'].enable();
		if (this.mapActions['ZOOM_IN'])
			this.map.getZoom() == (this.map.getNumZoomLevels() - 1) ?
				this.mapActions['ZOOM_IN'].disable()
				:
				this.mapActions['ZOOM_IN'].enable();
	},
	getMinZoomLevel: function() {
		return 0;
	},
	getMaxZoomLevel: function() {
		return this.map.getNumZoomLevels() - 1;
	},
	isValidCenter: function(lon, lat) { /* epsg:4326 */
		var ll = new OpenLayers.LonLat(lon, lat);
		var me = this.map.getMaxExtent();
		ll.transform(this.projection, this.map.getProjection());
		return me.containsLonLat(ll);
	},
	setCenter: function(lon, lat, zoom) { /* epsg:4326 */
		var ll = new OpenLayers.LonLat(lon, lat);
		var me = this.map.getMaxExtent();
		if (! this.isValidCenter(lon, lat)) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_INCOMPATIBLE_CENTER_POINT_TITLE,
				msg: this.LOCALES.ERROR_INCOMPATIBLE_CENTER_POINT_MSG,
				buttons: Ext.MessageBox.CANCEL,
				animEl: this.el,
				icon: Ext.MessageBox.ERROR,
				scope: this
			});
			return;
		}
		ll.transform(this.projection, this.map.getProjection());
		if (zoom)
			this.map.setCenter(ll, zoom, false, true);
		else
			this.map.setCenter(ll);
	}
});
Ext.reg('gpxe_MapPanel', GPXEditor1_1.MapPanel);

GPXEditor1_1.MapPanel.MAP_ACTIONS = {
	ZOOM_IN: 'ZOOM_IN',
	ZOOM_MAP: 'ZOOM_MAP',
	ZOOM_OUT: 'ZOOM_OUT',
	NAVIGATE: 'NAVIGATE',
	INFOPOINT: 'INFOPOINT',
	LOAD_GPX: 'LOAD_GPX',
	SAVE_GPX: 'SAVE_GPX',
	DEL_GPX: 'DEL_GPX',
	ZOOM_GPX: 'ZOOM_GPX',
	ADD_WPT: 'ADD_WPT',
	EDIT_WPT: 'EDIT_WPT',
	DEL_WPT: 'DEL_WPT',
	ADD_RTE: 'ADD_RTE',
	EDIT_RTE: 'EDIT_RTE',
	SWAP_RTE: 'SWAP_RTE',
	DEL_RTE: 'DEL_RTE',
	CONV_RTE: 'CONV_RTE',
	ADD_TRK: 'ADD_TRK',
	EDIT_TRK: 'EDIT_TRK',
	SWAP_TRK: 'SWAP_TRK',
	DEL_TRK: 'DEL_TRK',
	CONV_TRK: 'CONV_TRK'
};

GPXEditor1_1.MapPanel.MAP_MODE_GROUP = 'mapMode';

GPXEditor1_1.MapPanel.LOCALES = {
	MAPACTION_ZOOM_IN_TEXT: 'MAPACTION_ZOOM_IN_TEXT',
	MAPACTION_ZOOM_IN_TOOLTIP: 'MAPACTION_ZOOM_IN_TOOLTIP',
	MAPACTION_ZOOM_MAP_TEXT: 'MAPACTION_ZOOM_MAP_TEXT',
	MAPACTION_ZOOM_MAP_TOOLTIP: 'MAPACTION_ZOOM_MAP_TOOLTIP',
	MAPACTION_ZOOM_OUT_TEXT: 'MAPACTION_ZOOM_OUT_TEXT',
	MAPACTION_ZOOM_OUT_TOOLTIP: 'MAPACTION_ZOOM_OUT_TOOLTIP',
	MAPACTION_NAVIGATE_TEXT: 'MAPACTION_NAVIGATE_TEXT',
	MAPACTION_NAVIGATE_TOOLTIP: 'MAPACTION_NAVIGATE_TOOLTIP',
	MAPACTION_INFOPOINT_TEXT: 'MAPACTION_INFOPOINT_TEXT',
	MAPACTION_INFOPOINT_TOOLTIP: 'MAPACTION_INFOPOINT_TOOLTIP',
	MAPACTION_LOADGPX_TEXT: 'MAPACTION_LOADGPX_TEXT',
	MAPACTION_LOADGPX_TOOLTIP: 'MAPACTION_LOADGPX_TOOLTIP',
	MAPACTION_SAVEGPX_TEXT: 'MAPACTION_SAVEGPX_TEXT',
	MAPACTION_SAVEGPX_TOOLTIP: 'MAPACTION_SAVEGPX_TOOLTIP',
	MAPACTION_DELGPX_TEXT: 'MAPACTION_DELGPX_TEXT',
	MAPACTION_DELGPX_TOOLTIP: 'MAPACTION_DELGPX_TOOLTIP',
	MAPACTION_ZOOMGPX_TEXT: 'MAPACTION_ZOOMGPX_TEXT',
	MAPACTION_ZOOMGPX_TOOLTIP: 'MAPACTION_ZOOMGPX_TOOLTIP',
	MAPACTION_ADD_WPT_TEXT: 'MAPACTION_ADD_WPT_TEXT',
	MAPACTION_ADD_WPT_TOOLTIP: 'MAPACTION_ADD_WPT_TOOLTIP',
	MAPACTION_EDIT_WPT_TEXT: 'MAPACTION_EDIT_WPT_TEXT',
	MAPACTION_EDIT_WPT_TOOLTIP: 'MAPACTION_EDIT_WPT_TOOLTIP',
	MAPACTION_DEL_WPT_TEXT: 'MAPACTION_DELETE_WPT_TEXT',
	MAPACTION_DEL_WPT_TOOLTIP: 'MAPACTION_DELETE_WPT_TOOLTIP',
	MAPACTION_ADD_RTE_TEXT: 'MAPACTION_ADD_RTE_TEXT',
	MAPACTION_ADD_RTE_TOOLTIP: 'MAPACTION_ADD_RTE_TOOLTIP',
	MAPACTION_EDIT_RTE_TEXT: 'MAPACTION_EDIT_RTE_TEXT',
	MAPACTION_EDIT_RTE_TOOLTIP: 'MAPACTION_EDIT_RTE_TOOLTIP',
	MAPACTION_SWAP_RTE_TEXT: 'MAPACTION_SWAP_RTE_TEXT',
	MAPACTION_SWAP_RTE_TOOLTIP: 'MAPACTION_SWAP_RTE_TOOLTIP',
	MAPACTION_DEL_RTE_TEXT: 'MAPACTION_DEL_RTE_TEXT',
	MAPACTION_DEL_RTE_TOOLTIP: 'MAPACTION_DEL_RTE_TOOLTIP',
	MAPACTION_CONV_RTE_TEXT: 'MAPACTION_CONV_RTE_TEXT',
	MAPACTION_CONV_RTE_TOOLTIP: 'MAPACTION_CONV_RTE_TOOLTIP',
	MAPACTION_ADD_TRK_TEXT: 'MAPACTION_TRK_RTE_TEXT',
	MAPACTION_ADD_TRK_TOOLTIP: 'MAPACTION_TRK_RTE_TOOLTIP',
	MAPACTION_EDIT_TRK_TEXT: 'MAPACTION_EDIT_TRK_TEXT',
	MAPACTION_EDIT_TRK_TOOLTIP: 'MAPACTION_EDIT_TRK_TOOLTIP',
	MAPACTION_SWAP_TRK_TEXT: 'MAPACTION_SWAP_TRK_TEXT',
	MAPACTION_SWAP_TRK_TOOLTIP: 'MAPACTION_SWAP_TRK_TOOLTIP',
	MAPACTION_DEL_TRK_TEXT: 'MAPACTION_DEL_TRK_TEXT',
	MAPACTION_DEL_TRK_TOOLTIP: 'MAPACTION_DEL_TRK_TOOLTIP',
	MAPACTION_CONV_TRK_TEXT: 'MAPACTION_CONV_TRK_TEXT',
	MAPACTION_CONV_TRK_TOOLTIP: 'MAPACTION_CONV_TRK_TOOLTIP',
	ERROR_INCOMPATIBLE_EXTENT_TITLE: 'ERROR_INCOMPATIBLE_EXTENT_TITLE',
	ERROR_INCOMPATIBLE_EXTENT_MSG: 'ERROR_INCOMPATIBLE_EXTENT_MSG',
	ERROR_INCOMPATIBLE_CENTER_POINT_TITLE: 'ERROR_INCOMPATIBLE_CENTER_POINT_TITLE',
	ERROR_INCOMPATIBLE_CENTER_POINT_MSG: 'ERROR_INCOMPATIBLE_CENTER_POINT_MSG'
};
