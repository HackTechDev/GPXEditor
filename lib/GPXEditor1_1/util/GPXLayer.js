Ext.namespace('GPXEditor1_1');

GPXEditor1_1.GPXLayer = Ext.extend(Ext.util.Observable, {
	gpxMap: undefined
	, gpxLayer: undefined
	, selectControl: undefined
	, gpxIO: undefined
	, wptStore: undefined
	, rteStore: undefined
	, trkStore: undefined
	, loadingInProgress: undefined
	, mapActions: undefined
	, gpxActions: undefined
	, allowEditing: undefined
	, highlightedFeature: undefined
	, winLoadGPX: undefined
	, winSaveGPX: undefined
	, winEditWpt: undefined
	, winEditRte: undefined
	, winEditTrk: undefined
	, winEditElevation: undefined
	, winGetEle: undefined
	, constructor: function(config) {
		config = config || {};

		this.LOCALES = GPXEditor1_1.GPXLayer.LOCALES;

		/* Creating the OL gpx layer and IO */
		this.gpxLayer = new OpenLayers.Layer.GPXLayer('__gpx__', {
			displayProjection: new OpenLayers.Projection('EPSG:4326')
			, displayInLayerSwitcher: false
		});
		this.gpxLayer.events.register('featureselected', this, this._onSelectFeature);
		this.gpxLayer.events.register('featureunselected', this, this._onUnselectFeature);
		this.gpxLayer.events.register('elevationneeded', this, this._onElevationNeeded);
		/*
		this.selectFeatureControl = new OpenLayers.Control.SelectFeature(this.gpxLayer, {
			autoActivate: true
			, highlightOnly: true
			, geometryTypes: ['OpenLayers.Geometry.Point', 'OpenLayers.Geometry.LineString']
			, onSelect: this.onSelectFeature
			, scope: this
		});
		*/
		this.gpxIO = new OpenLayers.Format.GPXEditorIO();

		/* Creating store for wpt */
		this.wptStore = new GPXEditor1_1.data.WPTStore({
			gpxLayer: this
			, listeners: {
				add: function(store, records, index) {
					this.fireEvent('wptadded', records, this);
					//console.log('wpts added ' + records.length + '/' + this.getNbWpts());
					this.fireEvent('modified', true, this);
					if (! this.loadingInProgress)
						this.showEditGPXElementWindow(records[0]);
				}
				, update: function(store, record, operation) {
					this.fireEvent('wptmodified', record, operation, this);
					//console.log('record instanceof GPXEditor1_1.data.WPTRecord => ' + (record instanceof GPXEditor1_1.data.WPTRecord));
					//console.log('wpt modified ' + record.getName());
					this.fireEvent('modified', true, this);
				}
				, remove: function(store, record, index) {
					if (this.getNbWpts() == 0 && this.gpxMap) /* Not really god impl */
						this.gpxMap.setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
					this.fireEvent('wptremoved', record, index, this);
					//console.log('record instanceof GPXEditor1_1.data.WPTRecord => ' + (record instanceof GPXEditor1_1.data.WPTRecord));
					//console.log('wpt removed ' + record.getName());
					this.fireEvent('modified', true, this);
				}
				, scope: this
			}
		});

		/* Creating store for rte */
		this.rteStore = new GPXEditor1_1.data.RTEStore({
			gpxLayer: this
			, listeners: {
				add: function(store, records, index) {
					//console.log('RTE add listener');
					this.fireEvent('rteadded', records, this);
					this.fireEvent('modified', true, this);
					if (! this.loadingInProgress)
						this.showEditGPXElementWindow(records[0]);
				}
				, update: function(store, record, operation) {
					//console.log('RTE update listener');
					this.fireEvent('rtemodified', record, operation, this);
					this.fireEvent('modified', true, this);
				}
				, remove: function(store, record, index) {
					//console.log('RTE removed listener');
					if (this.getNbRtes() == 0 && this.gpxMap) /* Not really god impl */
						this.gpxMap.setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
					this.fireEvent('rteremoved', record, index, this);
					this.fireEvent('modified', true, this);
				}
				, scope: this
			}
		});

		/* Creating store for trk */
		this.trkStore = new GPXEditor1_1.data.TRKStore({
			gpxLayer: this
			, listeners: {
				add: function(store, records, index) {
					this.fireEvent('trkadded', records, this);
					this.fireEvent('modified', true, this);
				}
				, update: function(store, record, operation) {
					this.fireEvent('trkmodified', record, operation, this);
					this.fireEvent('modified', true, this);
				}
				, remove: function(store, record, index) {
					if (this.getNbTrks() == 0 && this.gpxMap) /* Not really god impl */
						this.gpxMap.setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
					this.fireEvent('trkremoved', record, index, this);
					this.fireEvent('modified', true, this);
				}
				, scope: this
			}
		});

		this.addEvents({
			gpxmapchange: true
			, gpxelementselectionchange: true
			, wptselectionchange: true
			, rteselectionchange: true
			, trkselectionchange: true
			, modified: true
			, wptadded: true
			, wptmodified: true
			, wptremoved: true
			, rteadded: true
			, rtemodified: true
			, rteremoved: true
			, trkadded: true
			, trkmodified: true
			, trkremoved: true
		});

		this.listeners = config.listeners;

		this.mapActions = [];
		this.gpxActions = [];
		this.loadingInProgress = false;
		this.allowEditing = false;

		this._initWindows();

		GPXEditor1_1.GPXLayer.superclass.constructor.call(this, config);

		if (config.gpxMap instanceof GPXEditor1_1.GPXMap) {
			this.setGPXMap(config.gpxMap);
			delete config.gpxMap;
		}

		this.on('modified', this.updateActions);
	}
	, setGPXMap: function(gpxMap) {
		if (this.gpxMap === gpxMap)
			return;
		var nc;
		if (this.gpxMap) {
			if (this.selectControl) {
				this.selectControl.events.unregister('beforefeaturehighlighted', this, this._onBeforeFeatureHighlighted);
				this.selectControl.events.unregister('featureunhighlighted', this, this._onBeforeFeatureUnhighlighted);
			}
			this.gpxMap.getMap().removeLayer(this.gpxLayer);
		}
		this.gpxMap = gpxMap;
		this.gpxMap.getMap().addLayers([this.gpxLayer]);
		nc = this.gpxMap.getAction(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
		this.selectControl = nc.control.selectControl;
		this.selectControl.events.register('beforefeaturehighlighted', this, this._onBeforeFeatureHighlighted);
		this.selectControl.events.register('featureunhighlighted', this, this._onBeforeFeatureUnhighlighted);
		this.fireEvent('gpxmapchange', this.gpxMap, this);
	}
	, getGPXMap: function() {
		return this.gpxMap;
	}
	, getOLSelectControl: function() { /* need to be a real selection control in Ext scope */
		return this.selectControl;
	}
	, setAllowEditing: function(bool) {
		this.allowEditing = (bool == true);
	}
	, isAllowEditing: function() {
		return this.allowEditing;
	}
	, getWptStore: function() {
		return this.wptStore;
	}
	, addWpt: function(wptRecord) {
		this.wptStore.add(wptRecord);
	}
	, getNbWpts: function() {
		return this.wptStore.getCount();
	}
	, getWptAt: function(index) {
		return this.wptStore.getAt(index);
	}
	, removeWpt: function(wptRecord) {
		this.wptStore.remove(wptRecord);
	}
	, getRteStore: function() {
		return this.rteStore;
	}
	, addRte: function(rteRecord) {
		this.wptStore.add(rteRecord);
	}
	, getNbRtes: function() {
		return this.rteStore.getCount();
	}
	, getRteAt: function(index) {
		return this.rteStore.getAt(index);
	}
	, removeRte: function(rteRecord) {
		this.rteStore.remove(rteRecord);
	}
	, getTrkStore: function() {
		return this.trkStore;
	}
	, addTrk: function(trkRecord) {
		this.wptStore.add(trkRecord);
	}
	, getNbTrks: function() {
		return this.trkStore.getCount();
	}
	, getTrkAt: function(index) {
		return this.trkStore.getAt(index);
	}
	, removeTrk: function(trkRecord) {
		this.trkStore.remove(trkRecord);
	}
	, clear: function() {
		//this.gpxLayer.unselectAllFeatures();
		this.gpxLayer.destroyFeatures();
	}
	, showEditGPXElementWindow: function(obj) {
		if (! this.isAllowEditing() || ! obj)
			return;
		var record = null;
		var test = obj;
		if (test instanceof OpenLayers.Feature)
			test = obj.geometry;

		/* WPT */
		if (test instanceof OpenLayers.Geometry.Point)
			record = this.wptStore.getRecordFromFeature(obj);
		else if (test instanceof GPXEditor1_1.data.WPTRecord)
			record = obj;
		if (record) {
			this.winEditWpt.show({record: record});
			return;
		}

		/* RTE */
		if (test instanceof OpenLayers.Geometry.LineString)
			record = this.rteStore.getRecordFromFeature(obj);
		else if (test instanceof GPXEditor1_1.data.RTERecord)
			record = obj;
		if (record) {
			this.winEditRte.show({record: record});
			return;
		}

		/* TRK */
		if (test instanceof OpenLayers.Geometry.MultiLineString)
			record = this.trkStore.getRecordFromFeature(obj);
		else if (test instanceof GPXEditor1_1.data.TRKRecord)
			record = obj;
		if (record) {
			this.winEditTrk.show({record: record});
			return;
		}
	}
	, showGPXLoadWindow: function() {
		if (this.isAllowEditing())
			this.winLoadGPX.show();
	}
	, loadGPXDoc: function(gpxDoc, options) {
		if (! this.isAllowEditing())
			return;
		var features = this._getFeatureFromGPXDoc(gpxDoc, options);
		if (features.length > 0) {
			this.clear();
			this.gpxLayer.addFeatures(features);
			this.zoomToGPX();
			if (this.gpxMap) /* Not good impl */
				this.gpxMap.setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
		}
		this.loadingInProgress = false;
	}
	, importGPXDoc: function(gpxDoc, options) {
		if (! this.isAllowEditing())
			return;
		var features = this._getFeatureFromGPXDoc(gpxDoc, options);
		if (features.length > 0) {
			this.gpxLayer.addFeatures(features);
			this.zoomToGPX();
			if (this.gpxMap) /* Not good impl */
				this.gpxMap.setMapMode(GPXEditor1_1.GPXMap.ACTIONS.NAVIGATE);
		}
		this.loadingInProgress = false;
	}
	, getDataExtent: function() {
		return this.gpxLayer.getDataExtent();
	}
	, zoomToGPX: function() {
		if (this.gpxMap)
			this.gpxMap.zoomToExtent(this.getDataExtent());
	}
	, getHighlightedFeature: function() {
		return this.highlightedFeature;
	}
	, getAction: function(actionId) {
		if (actionId in GPXEditor1_1.GPXLayer.GPX_ACTIONS)
			return this.getGPXAction(actionId);
		if (actionId in GPXEditor1_1.GPXLayer.MAP_ACTIONS)
			return this.getMapAction(actionId);
		return null;
	}
	, getGPXAction: function(actionId) {
		if (! this.gpxActions[actionId]) {
			var definedActions = GPXEditor1_1.GPXLayer.GPX_ACTIONS;
			switch (actionId) {
				case definedActions.LOAD_GPX:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-AddFileIcon'
						, text: this.LOCALES.ACTION_LOADGPX_TEXT
						, tooltip: this.LOCALES.ACTION_LOADGPX_TOOLTIP
						, handler: function() {
							this.loadingInProgress = true;
							this.winLoadGPX.show();
						}
						, scope: this
					});
					break;
				case definedActions.SAVE_GPX:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-SaveFileIcon'
						, text: this.LOCALES.ACTION_SAVEGPX_TEXT
						, tooltip: this.LOCALES.ACTION_SAVEGPX_TOOLTIP
						, handler: function() {
							this.winSaveGPX.show();
						}
						, scope: this
					});
					break;
				case definedActions.DEL_GPX:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-DeleteAllIcon'
						, text: this.LOCALES.ACTION_DELGPX_TEXT
						, tooltip: this.LOCALES.ACTION_DELGPX_TOOLTIP
						, handler: function() {
							this.clear();
						}
						, scope: this
					});
					break;
				case definedActions.EDIT_WPT:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-WptEdit'
						//, text: this.LOCALES.MAP_ACTION_EDIT_WPT_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_WPT_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement)
								this.winEditWpt.show({record: this.selectedElement});
						}
						, scope: this
					});
					break;
				case definedActions.DEL_WPT:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-WptDelete'
						//, text: this.LOCALES.MAP_ACTION_DEL_WPT_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_WPT_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement) {
								this.wptStore.remove([this.selectedElement]);
								this.setSelectedElement(null);
							}
						}
						, scope: this
					});
					break;
				case definedActions.EDIT_RTE:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-RteEdit'
						//, text: this.LOCALES.MAP_ACTION_EDIT_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_RTE_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement)
								this.winEditRte.show({record: this.selectedElement});
						}
						, scope: this
					});
					break;
				case definedActions.GET_MISSED_ELE:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-GetElevation'
						//, text: this.LOCALES.MAP_ACTION_EDIT_RTE_TEXT
						, tooltip: this.LOCALES.ACTION_GET_MISSED_ELEVATION
						, disabled: true
						, handler: function() {
							if (this.selectedElement)
								this.winGetEle.show(this.selectedElement.get('feature'));
						}
						, scope: this
					});
					break;
				case definedActions.DEL_RTE:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-RteDelete'
						//, text: this.LOCALES.MAP_ACTION_DEL_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_RTE_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement) {
								this.rteStore.remove([this.selectedElement]);
								this.setSelectedElement(null);
							}
						}
						, scope: this
					});
					break;
				case definedActions.EDIT_TRK:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-TrkEdit'
						//, text: this.LOCALES.MAP_ACTION_EDIT_TRK_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_TRK_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement)
								this.winEditTrk.show({record: this.selectedElement});
						}
						, scope: this
					});
					break;
				case definedActions.DEL_TRK:
					this.gpxActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-TrkDelete'
						//, text: this.LOCALES.MAP_ACTION_DEL_TRK_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_TRK_TOOLTIP
						, disabled: true
						, handler: function() {
							if (this.selectedElement) {
								this.trkStore.remove([this.selectedElement]);
								this.setSelectedElement(null);
							}
						}
						, scope: this
					});
					break;
			}
		}
		return this.gpxActions[actionId];
	}
	, getMapAction: function(actionId) {
		var map = this.gpxMap ? this.gpxMap.getMap() : null;
		if (! map)
			return null;
		if (! this.mapActions[actionId]) {
			var definedActions = GPXEditor1_1.GPXLayer.MAP_ACTIONS;
			switch (actionId) {
				case definedActions.MAP_ZOOM_GPX:
					this.mapActions[actionId] = new Ext.Action({
						iconCls: 'gpxe-ZoomToGPX'
						, text: this.LOCALES.MAP_ACTION_ZOOMGPX_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_ZOOMGPX_TOOLTIP
						, handler: function() {
							this.zoomToGPX();
						}
						, scope: this
					});
					break;
				case definedActions.MAP_ADD_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DrawFeature(this.gpxLayer, OpenLayers.Handler.Point, {
							selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_ADD_WPT_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_ADD_WPT_TOOLTIP
						, iconCls: 'gpxe-WptAdd'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_EDIT_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point']
							, hover: true
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_EDIT_WPT_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_WPT_TOOLTIP
						, iconCls: 'gpxe-WptEdit'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_DEL_WPT:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.Point']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_DEL_WPT_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_WPT_TOOLTIP
						, iconCls: 'gpxe-WptDelete'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_ADD_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DrawFeature(this.gpxLayer, OpenLayers.Handler.Path, {
							selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_ADD_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_ADD_RTE_TOOLTIP
						, iconCls: 'gpxe-RteAdd'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_EDIT_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString']
							, highlightOnly: true
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_EDIT_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_RTE_TOOLTIP
						, iconCls: 'gpxe-RteEdit'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_SWAP_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.PasteAndInverseFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_SWAP_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_SWAP_RTE_TOOLTIP
						, iconCls: 'gpxe-RteSwap'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_DEL_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_DEL_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_RTE_TOOLTIP
						, iconCls: 'gpxe-RteDelete'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_CONV_RTE:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ConvertFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.LineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_CONV_RTE_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_CONV_RTE_TOOLTIP
						, iconCls: 'gpxe-ToTrk'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_EDIT_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ModifyFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString']
							, highlightOnly: true
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_EDIT_TRK_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_EDIT_TRK_TOOLTIP
						, iconCls: 'gpxe-TrkEdit'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_DEL_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.DeleteFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_DEL_TRK_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_DEL_TRK_TOOLTIP
						, iconCls: 'gpxe-TrkDelete'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
				case definedActions.MAP_CONV_TRK:
					this.mapActions[actionId] =  new GeoExt.Action({
						control: new OpenLayers.Control.ConvertFeature(this.gpxLayer, {
							geometryTypes: ['OpenLayers.Geometry.MultiLineString']
							, selectStyle: OpenLayers.Feature.Vector.style.select
						})
						, map: map
						, text: this.LOCALES.MAP_ACTION_CONV_TRK_TEXT
						, tooltip: this.LOCALES.MAP_ACTION_CONV_TRK_TOOLTIP
						, iconCls: 'gpxe-ToRte'
						, toggleGroup: GPXEditor1_1.GPXMap.MAP_ACTION_GROUP
						, allowDepress: false
					});
					break;
			}
		}
		return this.mapActions[actionId];
	}
	, updateActions: function() {
		var definedActions = GPXEditor1_1.GPXLayer.ACTIONS;
		var definedMapActions = GPXEditor1_1.GPXLayer.MAP_ACTIONS;
		var nbWpts = this.getNbWpts();
		var nbRtes = this.getNbRtes();
		var nbTrks = this.getNbTrks();
		var nbElements = nbWpts + nbRtes + nbTrks;

		if (this.gpxActions[definedActions.SAVE_GPX]) 
			this.gpxActions[definedActions.SAVE_GPX].setDisabled(nbElements == 0);
		if (this.gpxActions[definedActions.DEL_GPX])
			this.gpxActions[definedActions.DEL_GPX].setDisabled(nbElements == 0);
		if (this.mapActions[definedActions.MAP_ZOOM_GPX]) 
			this.mapActions[definedActions.MAP_ZOOM_GPX].setDisabled(nbElements == 0);

		if (this.gpxMap) {
			/* WPT */
			if (this.mapActions[definedActions.MAP_EDIT_WPT])
				this.mapActions[definedMapActions.MAP_EDIT_WPT].setDisabled(nbWpts == 0);
			if (this.mapActions[definedActions.MAP_DEL_WPT])
				this.mapActions[definedMapActions.MAP_DEL_WPT].setDisabled(nbWpts == 0);
			/* RTE */
			if (this.mapActions[definedMapActions.MAP_EDIT_RTE])
				this.mapActions[definedMapActions.MAP_EDIT_RTE].setDisabled(nbRtes == 0);
			if (this.mapActions[definedMapActions.MAP_SWAP_RTE])
				this.mapActions[definedMapActions.MAP_SWAP_RTE].setDisabled(nbRtes == 0);
			if (this.mapActions[definedMapActions.MAP_DEL_RTE])
				this.mapActions[definedMapActions.MAP_DEL_RTE].setDisabled(nbRtes == 0);
			if (this.mapActions[definedMapActions.MAP_CONV_RTE])
				this.mapActions[definedMapActions.MAP_CONV_RTE].setDisabled(nbRtes == 0);
			/* TRK */
			if (this.mapActions[definedMapActions.MAP_EDIT_TRK])
				this.mapActions[definedMapActions.MAP_EDIT_TRK].setDisabled(true); /* not yet written nbTrks == 0); */
			if (this.mapActions[definedMapActions.MAP_DEL_TRK])
				this.mapActions[definedMapActions.MAP_DEL_TRK].setDisabled(nbTrks == 0);
			if (this.mapActions[definedMapActions.MAP_CONV_TRK])
				this.mapActions[definedMapActions.MAP_CONV_TRK].setDisabled(nbTrks == 0);
		}
		else {
			for (var i = 0, len = definedMapActions.length; i < len; i++) {
				if (this.mapActions[definedMapActions[i]]) /* no map actions without gpxMap */
					this.mapActions[definedMapActions[i]].setDisabled(true);
			}
		}
	}
	, _updateSelectedActions: function() {
		var isWptSelected = (this.selectedElement instanceof GPXEditor1_1.data.WPTRecord);
		var isRteSelected = (this.selectedElement instanceof GPXEditor1_1.data.RTERecord);
		var isTrkSelected = (this.selectedElement instanceof GPXEditor1_1.data.TRKRecord);

		var definedActions = GPXEditor1_1.GPXLayer.ACTIONS;
		if (this.gpxActions[definedActions.EDIT_WPT])
			this.gpxActions[definedActions.EDIT_WPT].setDisabled(! isWptSelected);
		if (this.gpxActions[definedActions.DEL_WPT])
			this.gpxActions[definedActions.DEL_WPT].setDisabled(! isWptSelected);

		if (this.gpxActions[definedActions.EDIT_RTE])
			this.gpxActions[definedActions.EDIT_RTE].setDisabled(! isRteSelected);
		if (this.gpxActions[definedActions.GET_MISSED_ELE])
			this.gpxActions[definedActions.GET_MISSED_ELE].setDisabled(! isRteSelected);
		if (this.gpxActions[definedActions.DEL_RTE])
			this.gpxActions[definedActions.DEL_RTE].setDisabled(! isRteSelected);

		if (this.gpxActions[definedActions.EDIT_TRK])
			this.gpxActions[definedActions.EDIT_TRK].setDisabled(! isTrkSelected);
		if (this.gpxActions[definedActions.DEL_TRK])
			this.gpxActions[definedActions.DEL_TRK].setDisabled(! isTrkSelected);
	}
	, _getFeatureFromGPXDoc: function(gpxDoc, options) {
		var options = options || {extractWaypoints: true, extractRoutes: true, extractTracks: true};
		if (! gpxDoc)
			return [];
		this.gpxIO.internalProjection = this.gpxMap.getDrawProjection();
		Ext.apply(this.gpxIO, options);
		return this.gpxIO.read(gpxDoc);
	}
	, _initWindows: function() {
		this.winLoadGPX = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-ImportForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
				, gpxLayer: this
			}
		});
		this.winLoadGPX.on('show', function() {
			this.loadingInProgress = true;
		}, this);

		this.winSaveGPX = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-ExportForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
				, gpxLayer: this
			}
		});

		this.winEditWpt = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-WPTForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
			}
		});

		this.winEditRte = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-RTEForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
			}
		});

		this.winEditTrk = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-TRKForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
			}
		});

		this.winEditElevation = new GPXEditor1_1.form.FormWindow({
			modal: true
			, width: 350
			, formPanel: {
				xtype: 'gpxe-ElevationForm'
				, deferredRender: false
				, forceLayout: true
				, frame: true
				, header: false
				, autoHeight: true
				, gpxLayer: this
			}
		});

		this.winGetEle = new GPXEditor1_1.GetMissedElevationWindow({
			gpxLayer: this
		});
		this.winGetEle.on('show', function() { /* TODO: refactoring needed */
			this._featureGetEle = this.selectedElement;
		}, this);
		this.winGetEle.on('hide', function() {
			if (this._featureGetEle)
				this.gpxLayer.events.triggerEvent('featuremodified', {feature: this._featureGetEle});
			delete this._featureGetEle;
		}, this);
	}
	, _onBeforeFeatureHighlighted: function(evt) {
		if (this.isAllowEditing()) 
			this.highlightedFeature = evt.feature;
	}
	, _onBeforeFeatureUnhighlighted: function(evt) {
		delete this.highlightedFeature;
	}
	, getSelectedElement: function() {
		return this.selectedElement;
	}
	, setSelectedElement: function(gpxElementRecord) {
	/*
		console.log('setSelectedElement(' + gpxElementRecord + ') != this.selectedElement => ' 
			+ (this.selectedElement == gpxElementRecord));
			*/
		if (this.selectedElement == gpxElementRecord)
			return;
		this.selectedElement = gpxElementRecord;
		this._updateSelectedActions();
		if (this.selectedElement && 
			(this.gpxLayer.selectedFeatures.length < 0 || this.gpxLayer.selectedFeatures[0] != this.selectedElement.get('feature')))
			this.selectControl.select(this.selectedElement.get('feature'));
		this.fireEvent('gpxelementselectionchange', this.selectedElement, this);
	}
	, _onSelectFeature: function(evt) {
		if (this.selectControl && this.selectControl.active && evt.feature) {
			var store = null;
			if (evt.feature.geometry instanceof OpenLayers.Geometry.Point)
				store = this.wptStore;
			else if (evt.feature.geometry instanceof OpenLayers.Geometry.LineString)
				store = this.rteStore;
			else if (evt.feature.geometry instanceof OpenLayers.Geometry.MultiLineString)
				store = this.trkStore;
			if (store) 
				this.setSelectedElement(store.getRecordFromFeature(evt.feature));
		}
	}
	, _onUnselectFeature: function(evt) {
		if (this.selectControl && this.selectControl.active) 
			this.setSelectedElement(null);
	}
	, _onElevationNeeded: function(evt) {
		if (evt && evt.feature && evt.point)
			this.winEditElevation.show(evt);
	}
});
Ext.reg('gpxe-GPXLayer', GPXEditor1_1.GPXLayer);

GPXEditor1_1.GPXLayer.GPX_ACTIONS = {
	LOAD_GPX: 'LOAD_GPX'
	, SAVE_GPX: 'SAVE_GPX'
	, DEL_GPX: 'DEL_GPX'
	, EDIT_WPT: 'EDIT_WPT'
	, DEL_WPT: 'DEL_WPT'
	, EDIT_RTE: 'EDIT_RTE'
	, GET_MISSED_ELE: 'GET_MISSED_ELE'
	, DEL_RTE: 'DEL_RTE'
	, EDIT_TRK: 'EDIT_TRK'
	, DEL_TRK: 'DEL_TRK'
};
GPXEditor1_1.GPXLayer.MAP_ACTIONS = {
	MAP_ZOOM_GPX: 'MAP_ZOOM_GPX'
	, MAP_ADD_WPT: 'MAP_ADD_WPT'
	, MAP_EDIT_WPT: 'MAP_EDIT_WPT'
	, MAP_DEL_WPT: 'MAP_DEL_WPT'
	, MAP_ADD_RTE: 'MAP_ADD_RTE'
	, MAP_EDIT_RTE: 'MAP_EDIT_RTE'
	, MAP_SWAP_RTE: 'MAP_SWAP_RTE'
	, MAP_CONV_RTE: 'MAP_CONV_RTE'
	, MAP_DEL_RTE: 'MAP_DEL_RTE'
	, MAP_EDIT_TRK: 'MAP_EDIT_TRK'
	, MAP_DEL_TRK: 'MAP_DEL_TRK'
	, MAP_CONV_TRK: 'MAP_CONV_TRK'
};
GPXEditor1_1.GPXLayer.ACTIONS = 
	Ext.apply(Ext.apply({}, GPXEditor1_1.GPXLayer.GPX_ACTIONS), GPXEditor1_1.GPXLayer.MAP_ACTIONS);

GPXEditor1_1.GPXLayer.LOCALES = {
	ACTION_LOADGPX_TEXT: 'ACTION_LOADGPX_TEXT'
	, ACTION_LOADGPX_TOOLTIP: 'ACTION_LOADGPX_TOOLTIP'
	, ACTION_SAVEGPX_TEXT: 'ACTION_SAVEGPX_TEXT'
	, ACTION_SAVEGPX_TOOLTIP: 'ACTION_SAVEGPX_TOOLTIP'
	, ACTION_DELGPX_TEXT: 'ACTION_DELGPX_TEXT'
	, ACTION_DELGPX_TOOLTIP: 'ACTION_DELGPX_TOOLTIP'
	, ACTION_GET_MISSED_ELEVATION: 'ACTION_GET_MISSED_ELEVATION'
	, MAP_ACTION_ZOOMGPX_TEXT: 'MAP_ACTION_ZOOMGPX_TEXT'
	, MAP_ACTION_ZOOMGPX_TOOLTIP: 'MAP_ACTION_ZOOMGPX_TOOLTIP'
	, MAP_ACTION_ADD_WPT_TEXT: 'MAP_ACTION_ADD_WPT_TEXT'
	, MAP_ACTION_ADD_WPT_TOOLTIP: 'MAP_ACTION_ADD_WPT_TOOLTIP'
	, MAP_ACTION_EDIT_WPT_TEXT: 'MAP_ACTION_EDIT_WPT_TEXT'
	, MAP_ACTION_EDIT_WPT_TOOLTIP: 'MAP_ACTION_EDIT_WPT_TOOLTIP'
	, MAP_ACTION_DEL_WPT_TEXT: 'MAP_ACTION_DELETE_WPT_TEXT'
	, MAP_ACTION_DEL_WPT_TOOLTIP: 'MAP_ACTION_DELETE_WPT_TOOLTIP'
	, MAP_ACTION_ADD_RTE_TEXT: 'MAP_ACTION_ADD_RTE_TEXT'
	, MAP_ACTION_ADD_RTE_TOOLTIP: 'MAP_ACTION_ADD_RTE_TOOLTIP'
	, MAP_ACTION_EDIT_RTE_TEXT: 'MAP_ACTION_EDIT_RTE_TEXT'
	, MAP_ACTION_EDIT_RTE_TOOLTIP: 'MAP_ACTION_EDIT_RTE_TOOLTIP'
	, MAP_ACTION_SWAP_RTE_TEXT: 'MAP_ACTION_SWAP_RTE_TEXT'
	, MAP_ACTION_SWAP_RTE_TOOLTIP: 'MAP_ACTION_SWAP_RTE_TOOLTIP'
	, MAP_ACTION_CONV_RTE_TEXT: 'MAP_ACTION_CONV_RTE_TEXT'
	, MAP_ACTION_CONV_RET_TOOLTIP: 'MAP_ACITON_CONV_RTE_TOOLTIP'
	, MAP_ACTION_DEL_RTE_TEXT: 'MAP_ACTION_DEL_RTE_TEXT'
	, MAP_ACTION_DEL_RTE_TOOLTIP: 'MAP_ACTION_DEL_RTE_TOOLTIP'
	, MAP_ACTION_EDIT_TRK_TEXT: 'MAP_ACTION_EDIT_TRK_TEXT'
	, MAP_ACTION_EDIT_TRK_TOOLTIP: 'MAP_ACTION_EDIT_TRK_TOOLTIP'
	, MAP_ACTION_DEL_TRK_TEXT: 'MAP_ACTION_DEL_TRK_TEXT'
	, MAP_ACTION_DEL_TRK_TOOLTIP: 'MAP_ACTION_DEL_TRK_TOOLTIP'
	, MAP_ACTION_CONV_TRK_TEXT: 'MAP_ACTION_CONV_TRK_TEXT'
	, MAP_ACTION_CONV_TRK_TOOLTIP: 'MAP_ACTION_CONV_TRK_TOOLTIP'
};
