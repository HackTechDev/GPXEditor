Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXMap = Ext.extend(GeoExt.MapPanel, {
	keyMap: undefined
	, gpxLayer: undefined
	, slideFactor: undefined
	, mapActions: undefined
	, winHelp: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.GPXMap.LOCALES});

		/* Initialize other properties */
		Ext.applyIf(this, {
			bodyCssClass: 'gpxe-GPXMap'
			, slideFactor: 75
			, mapActions: []
			, winHelp: new Ext.Window({
				title: this.LOCALES.HELP_TITLE
				, iconCls: 'gpxe-Help'
				, forceLayout: true
				, layout: 'fit'
				, closeAction: 'hide'
				, modal: false
				, width: 600
				, height: 300
				, items: [{
					xtype: 'panel'
					, border: false
					, bodyBorder: false
					, margins: 10
					, contentEl: 'gpxe-helpGPXEditor1_1'
					, autoScroll: true
				}]
				, listeners: {
					show: function() { Ext.get('gpxe-helpGPXEditor1_1').show(); }
					, scope: this
				}
			})
		});

		/* Create the real map */
		if (! (this.map instanceof OpenLayers.MapWithVectorReprojection))
			this.map = new OpenLayers.MapWithVectorReprojection(Ext.id(null, 'map_'), {
			//this.map = new OpenLayers.Map(Ext.id(null, 'map_'), {
				displayProjection: new OpenLayers.Projection('EPSG:4326')
				, controls: [
					new OpenLayers.Control.MouseDefaults()
					, new Geoportal.Control.TermsOfService()
					, new Geoportal.Control.PermanentLogo()
					, new Geoportal.Control.Logo()
				]
			});
		this.map.events.on({
			'zoomend': this._updateZoomActions,
			'changebaselayer': this.checkExtentCompatibility,
			scope: this
		});

		/* BAD Refactoring */
		this.mapProvidersStore = new GPXEditor1_1.data.MapProvidersStore({map: this.map}); 
		this.center = new OpenLayers.LonLat(6.31328, 45.35818);
		this.center = this.center.transform(this.getDisplayProjection(), this.getDrawProjection());
		this.zoom = 5;

		/* Add minimal layer */
		/*
		if (! this.layers)
			this.layers = [new OpenLayers.Layer(
				'__emptyMap__'
				, {
					isBaseLayer: true
					, projection: new OpenLayers.Projection('EPSG:4326')
					, units: 'degrees'
					, maxResolution: 1.40625
					, numZoomLevels: 21
					, maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
					, minZoomLevel: 1
					, maxZoomLevel: 20
				}
			)];
		if (! Ext.isArray(this.layers))
			this.layers = [this.layers];
		*/


		/* Add gpx layer */
		if (! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();
		this.gpxLayer.setGPXMap(this);
		this.gpxLayer.setAllowEditing(this.allowEditing);

		GPXEditor1_1.GPXMap.superclass.initComponent.call(this);

		/* Initialize key map */
		this._initKeyEvent();
	}
	, getMap: function() {
		return this.map;
	}
	, getDisplayProjection: function() {
		return this.map.displayProjection;
	}
	, getDrawProjection: function() {
		return this.map.getProjectionObject();
	}
	, getNumZoomLevels: function() {
		return this.map.getNumZoomLevels();
	}
	, getMinZoomLevel: function() {
		return 0;
	}
	, getMaxZoomLevel: function() {
		return this.getNumZoomLevels() - 1;
	}
	, getMaxExtent: function() {
		return this.map.getMaxExtent();
	}
	, checkExtentCompatibility: function(o) { /* BAD Refactoring */
		var me = this.map.getMaxExtent();
		var e = this.map.getExtent();
		if (! me.containsBounds(e, true)) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_INCOMPATIBLE_EXTENT_TITLE
				, msg: this.LOCALES.ERROR_INCOMPATIBLE_EXTENT_MSG
				, buttons: Ext.MessageBox.OKCANCEL
				, animEl: this.el
				, icon: Ext.MessageBox.ERROR
				, fn: function(bId) {
					if (bId == 'ok')
						this.map.zoomToMaxExtent();
					else {
						this.map.setBaseLayer(o.oldLayer);
						this.map.zoomToExtent(o.oldExtent);
					}
				}
				, scope: this
			});
		}
	}
	, onLayerchange: function(e) {
		GPXEditor1_1.GPXMap.superclass.onLayerchange.apply(this, arguments);
		this._updateZoomActions();
		/* Pb google map v2 */
		var e = Ext.get(this.map.id + '_GMap2Container');
		if (e != null)
			e.setStyle('background-color', null);
	}
	, isValidCenter: function(lon, lat) { /* epsg:4326 */
		var ll = new OpenLayers.LonLat(lon, lat);
		var me = this.map.getMaxExtent();
		ll.transform(this.getDisplayProjection(), this.getDrawProjection());
		return me.containsLonLat(ll);
	}
	, setCenter: function(lon, lat, zoom) { /* epsg:4326 */
		var ll = new OpenLayers.LonLat(lon, lat);
		var me = this.getMaxExtent();
		if (! this.isValidCenter(lon, lat)) {
			Ext.MessageBox.show({
				title: this.LOCALES.ERROR_INCOMPATIBLE_CENTER_POINT_TITLE
				, msg: this.LOCALES.ERROR_INCOMPATIBLE_CENTER_POINT_MSG
				, buttons: Ext.MessageBox.CANCEL
				, animEl: this.el
				, icon: Ext.MessageBox.ERROR
				, scope: this
			});
			return;
		}
		ll.transform(this.getDisplayProjection(), this.getDrawProjection());
		if (zoom)
			this.map.setCenter(ll, zoom, false, true);
		else
			this.map.setCenter(ll);
	}
	, panRight: function(page) {
		if (page) {
			var size = this.map.getSize();
			this.map.pan(0.75 * size.w, 0);
		}
		else
			this.map.pan(this.slideFactor, 0);
	}
	, panLeft: function(page) {
		if (page) {
			var size = this.map.getSize();
			this.map.pan(-0.75 * size.w, 0);
		}
		else
			this.map.pan(-this.slideFactor, 0);
	}
	, panUp: function(page) {
		if (page) {
			var size = this.map.getSize();
			this.map.pan(0, -0.75 * size.h);
		}
		else
			this.map.pan(0, -this.slideFactor);
	}
	, panDown: function(page) {
		if (page) {
			var size = this.map.getSize();
			this.map.pan(0, 0.75 * size.h);
		}
		else
			this.map.pan(0, this.slideFactor);
	}
	, zoomIn: function() {
		this.map.zoomIn();
	}
	, zoomOut: function() {
		this.map.zoomOut();
	}
	, zoomToMap: function() {
		this.map.zoomToMaxExtent();
	}
	, zoomToExtent: function(extent) {
		if (! extent)
			return;
		//console.warn('Need to test compatibility');
		this.map.zoomToExtent(extent);
	}
	, zoomToGPX: function() {
		if (this.gpxLayer)
			this.gpxLayer.zoomToGPX();
	}
	, getGPXLayer: function() {
		return this.gpxLayer;
	}
	, setMapMode: function(mode) {
		if (this.mapActions[mode] && this.mapActions[mode].control)
			this.mapActions[mode].control.activate();
	}
	/*
	, getMapMode: function() {
		if (this.mapActions[GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE])
			console.log('OK for this.mapActions[GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE] => ' + this.mapActions[GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE]);
			var a = this.mapActions[GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE];
			console.log('a.getPressed() => ' + a.getPressed(GPXEditor1_1.GPXMap.MAP_ACTION_GROUP));
		return null;
	}
	*/
	, getAction: function(actionId) {
		if (! this.mapActions[actionId]) {
			var definedActions = GPXEditor1_1.GPXMap.ACTIONS;
			switch (actionId) {
				case definedActions.ZOOM_OUT:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomOut()
						, map: this.map
						, iconCls: 'gpxe-ZoomOut'
						, text: this.LOCALES.ACTION_ZOOM_IN_TEXT
						, tooltip: this.LOCALES.ACTION_ZOOM_OUT_TOOLTIP
					});
					break;
				case definedActions.ZOOM_MAP:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomToMaxExtent()
						, map: this.map
						, iconCls: 'gpxe-ZoomToMaxExtent'
						, text: this.LOCALES.ACTION_ZOOM_MAP_TEXT
						, tooltip: this.LOCALES.ACTION_ZOOM_MAP_TOOLTIP
					});
					break;
				case definedActions.ZOOM_IN:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.ZoomIn()
						, map: this.map
						, iconCls: 'gpxe-ZoomIn'
						, text: this.LOCALES.ACTION_ZOOM_IN_TEXT
						, tooltip: this.LOCALES.ACTION_ZOOM_IN_TOOLTIP
					});
					break;
				case definedActions.NAVIGATE:
					this.mapActions[actionId] = new GeoExt.Action({
						control: new OpenLayers.Control.GPXNavigation(this.gpxLayer.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point', 'OpenLayers.Geometry.LineString', 'OpenLayers.Geometry.MultiLineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: this.map
						, iconCls: 'gpxe-Nav'
						, text: this.LOCALES.ACTION_NAVIGATE_TEXT
						, tooltip: this.LOCALES.ACTION_NAVIGATE_TOOLTIP
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
						, pressed: true
						, checked: true
					});
					break;
				case definedActions.HELP:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-Help'
						, text: this.LOCALES.ACTION_HELP_TEXT
						, tooltip: this.LOCALES.ACTION_HELP_TOOLTIP
						, handler: function() { this.winHelp.show(); }
						, scope: this
					});
					break;
			}
		}
		return this.mapActions[actionId];
	}
	, _updateZoomActions: function() { /* BAD Refactoring */
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
	}
	, _initKeyEvent: function() {
		this.keyMap = new Ext.KeyMap(document, [
			{
				key: [43, 61, 187, 107]
				, fn: function() { this.zoomIn(); }
				, scope: this
				, stopEvent: true
			}
			, {
				key: [45, 95, 109, 189]
				, fn: function() { this.zoomOut(); }
				, scope: this
				, stopEvent: true
			}
			, {
				key: 'hH'
				, fn: function() { this.winHelp.show(); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
			, {
				key: 'eE'
				, fn: function() { this.gpxLayer.showEditGPXElementWindow(this.gpxLayer.getHighlightedFeature()); }
				, scope: this
				, stopEvent: true
			}
			, {
				key: 'oO'
				, ctrl: true
				, fn: function() { this.gpxLayer.showGPXLoadWindow(); }
				, scope: this
				, stopEvent: true
			}
			, {
				key: 'aA'
				, fn: function() { this.zoomToMap(); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
			, {
				key: 'aA'
				, ctrl: false
				, fn: function() { this.gpxLayer.zoomToGPX(); }
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.LEFT
				, fn: function() { this.panLeft(); }
				, ctrl: false
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.LEFT
				, fn: function() { this.panLeft(true); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.RIGHT
				, fn: function() { this.panRight(); }
				, ctrl: false
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.RIGHT
				, fn: function() { this.panRight(true); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.UP
				, fn: function() { this.panUp(); }
				, ctrl: false
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.UP
				, fn: function() { this.panUp(true); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.DOWN
				, fn: function() { this.panDown(); }
				, ctrl: false
				, scope: this
				, stopEvent: true
			}
			, {
				key: Ext.EventObject.DOWN
				, fn: function() { this.panDown(true); }
				, ctrl: true
				, scope: this
				, stopEvent: true
			}
		]);
		this.keyMap.disable();
		this.on('render', function() {
			this.body.on('mouseenter', function() {
				this.keyMap.enable();
			}, this);
			this.body.on('mouseleave', function() {
				this.keyMap.disable();
			}, this);
		}, this);
	}
});
Ext.reg('gpxe-GPXMap', GPXEditor1_1.GPXMap);

GPXEditor1_1.GPXMap.MAP_ACTION_GROUP = 'GPXEditor1_1.GPXMap.MAP_ACTION_GROUP';

GPXEditor1_1.GPXMap.ACTIONS = {
	ZOOM_IN: 'ZOOM_IN'
	, ZOOM_MAP: 'ZOOM_MAP'
	, ZOOM_OUT: 'ZOOM_OUT'
	, NAVIGATE: 'NAVIGATE'
	, HELP: 'HELP'
};

GPXEditor1_1.GPXMap.LOCALES = {
	ACTION_ZOOM_IN_TEXT: 'ACTION_ZOOM_IN_TEXT'
	, ACTION_ZOOM_IN_TOOLTIP: 'ACTION_ZOOM_IN_TOOLTIP'
	, ACTION_ZOOM_MAP_TEXT: 'ACTION_ZOOM_MAP_TEXT'
	, ACTION_ZOOM_MAP_TOOLTIP: 'ACTION_ZOOM_MAP_TOOLTIP'
	, ACTION_ZOOM_OUT_TEXT: 'ACTION_ZOOM_OUT_TEXT'
	, ACTION_ZOOM_OUT_TOOLTIP: 'ACTION_ZOOM_OUT_TOOLTIP'
	, ACTION_NAVIGATE_TEXT: 'ACTION_NAVIGATE_TEXT'
	, ACTION_NAVIGATE_TOOLTIP: 'ACTION_NAVIGATE_TOOLTIP'
	, ERROR_INCOMPATIBLE_CENTER_POINT_TITLE: 'ERROR_INCOMPATIBLE_CENTER_POINT_TITLE'
	, ERROR_INCOMPATIBLE_CENTER_POINT_MSG: 'ERROR_INCOMPATIBLE_CENTER_POINT_MSG'
	, ACTION_HELP_TEXT: 'ACTION_HELP_TEXT'
	, ACTION_HELP_TOOLTIP: 'ACTION_HELP_TOOLTIP'
	, HELP_TITLE: 'HELP_TITLE'
};
