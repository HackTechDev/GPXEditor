Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.FeatureForm = Ext.extend(Ext.form.FormPanel, {
	type: undefined,
	mapPanel: undefined,
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.form.FeatureForm.LOCALES
		});
		if (! this.mapPanel || ! (this.mapPanel instanceof GPXEditor1_1.MapPanel))
			this.mapPanel = new GPXEditor1_1.MapPanel();
		Ext.applyIf(this, {
			frame: true,
			labelWidth: 90,
			defaults: {width: 210},
			mode: GPXEditor1_1.form.FeatureForm.MODES.ADD,
			type: GPXEditor1_1.form.FeatureForm.TYPES.WPT,
			buttons: [{
				text: this.LOCALES.BT_SAVE_TEXT, 
				handler: function() {
					if (this.getForm().isValid()) {
						this.doSuccess();
						this.getForm().fireEvent('actioncomplete', this.getForm(), 'success');
					}
				},
				scope: this
			}, {
				text: this.LOCALES.BT_CANCEL_TEXT,
				handler: function() {
					this.getForm().fireEvent('actioncomplete', this.getForm(), 'cancel');
				},
				scope: this
			}]
		});
		var conf = {
			items: [{
				xtype: 'textfield',
				fieldLabel: this.LOCALES.LABEL_NAME,
				name: 'name'
			}, {
				xtype: 'textarea',
				fieldLabel: this.LOCALES.LABEL_DESC,
				name: 'desc'
			}]
		};
		if (this.type == GPXEditor1_1.form.FeatureForm.TYPES.WPT) {
			conf.items.push([{
				xtype: 'combo',
				mode: 'local',
				store: new Ext.data.ArrayStore({
					id: 0,
					fields: ['wptTypeId', 'wptTypeName'],
					data: [
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.UNKNOW, this.LOCALES.WPT_TYPE_UNKNOW ],
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.PK, this.LOCALES.WPT_TYPE_PK],
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.PASS, this.LOCALES.WPT_TYPE_PASS],
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.RHSE, this.LOCALES.WPT_TYPE_RHSE],
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.WTRW, this.LOCALES.WPT_TYPE_WTRW],
						[GPXEditor1_1.form.FeatureForm.WPT_TYPES.PKLT, this.LOCALES.WPT_TYPE_PKLT]
					]
				}),
				valueField: 'wptTypeId',
				displayField: 'wptTypeName',
				allowBlank: false,
				triggerAction: 'all',
				value: GPXEditor1_1.form.FeatureForm.WPT_TYPES.UNKNOW,
				blankText: this.LOCALES.WPT_TYPE_UNKNOW,
				forceSelection: true,
				fieldLabel: this.LOCALES.LABEL_TYPE,
				name: 'type'
			}, {
				xtype: 'compositefield',
				fieldLabel: this.LOCALES.LABEL_ELE,
				items: [{
					xtype: 'numberfield',
					allowDecimals: false,
					name: 'ele'
				}, {
					xtype: 'button',
					iconCls: 'gpxe-GetElevation',
					tooltip: this.LOCALES.BT_FINDELE_TOOLTIP,
					form: this,
					handler: function(button, evtObject) {
						var f = this.form.getForm();
						var fEle = f.findField('ele');
						var lon = f.findField('lon').getValue();
						var lat = f.findField('lat').getValue();
						if (! lon || ! lat )
							return;
						var ll = new OpenLayers.LonLat(lon, lat);
						button.setDisabled(true);
						fEle.setDisabled(true);
						var getEle = new OpenLayers.Elevation(ll, function(ele) {
							if (ele != null) 
								var f = this.form.getForm();
							f.findField('ele').setValue(ele);
							f.findField('ele').setDisabled(false);
							this.setDisabled(false);
						}, button);
					}
				}]
			}, {
				xtype: 'numberfield',
				decimalPrecision: 15,
				allowBlank: false,
				minValue: -180.0,
				maxValue: 179.999999999,
				fieldLabel: this.LOCALES.LABEL_LON,
				name: 'lon'
			}, {
				xtype: 'numberfield',
				decimalPrecision: 15,
				allowBlank: false,
				minValue: -90.0,
				maxValue: 90.0,
				fieldLabel: this.LOCALES.LABEL_LAT,
				name: 'lat'
			}]);
		}
		Ext.apply(this, conf);
		Ext.applyIf(this, this.getTitleConfig());
		GPXEditor1_1.form.FeatureForm.superclass.initComponent.call(this);
	},
	getMapPanel: function() {
		return this.mapPanel;
	},
	getTitleConfig: function() {
		switch (this.type) {
			case GPXEditor1_1.form.FeatureForm.TYPES.WPT: 
				if (this.mode == GPXEditor1_1.form.FeatureForm.MODES.ADD) {
					return {
						title: this.LOCALES.WPT_MODE_ADD_TITLE,
						iconCls: 'gpxe-WptAdd'
					};
				}
				return {
					title: this.LOCALES.WPT_MODE_EDIT_TITLE,
					iconCls: 'gpxe-WptEdit'
				};
				break;
			case GPXEditor1_1.form.FeatureForm.TYPES.RTE:
				if (this.mode == GPXEditor1_1.form.FeatureForm.MODES.ADD) {
					return {
						title: this.LOCALES.RTE_MODE_ADD_TITLE,
						iconCls: 'gpxe-RteAdd'
					};
				}
				return {
					title: this.LOCALES.RTE_MODE_EDIT_TITLE,
					iconCls: 'gpxe-RteEdit'
				};
				break;
			case GPXEditor1_1.form.FeatureForm.TYPES.TRK:
				if (this.mode == GPXEditor1_1.form.FeatureForm.MODES.ADD) {
					return {
						title: this.LOCALES.TRK_MODE_ADD_TITLE,
						iconCls: 'gpxe-TrkAdd'
					};
				}
				return {
					title: this.LOCALES.TRK_MODE_EDIT_TITLE,
					iconCls: 'gpxe-TrkEdit'
				};
				break;
		}
		return {};
	},
	setOpenConfig: function(openConfig) {
		if (openConfig && 'feature' in openConfig)
			this.setFeature(openConfig.feature);
	},
	setFeature: function(feature) {
		this.feature = feature;
		if (! this.feature) {
			switch (this.type) {
				case GPXEditor1_1.form.FeatureForm.TYPES.WPT: 
					this.feature = new OpenLayers.Feature.Vector(
						new OpenLayers.Geometry.Point(0.0, 0.0)
					);
				break;
				default:
					return;
			}
		}
		var atts = this.feature.attributes || {};
		Ext.applyIf(atts, {
			name: null,
			desc: null
		});
		if (this.type == GPXEditor1_1.form.FeatureForm.TYPES.WPT)
			Ext.applyIf(atts, {
				type: GPXEditor1_1.form.FeatureForm.WPT_TYPES.UNKNOW,
				ele: null,
				lon: null,
				lat: null
			});
			/*
		Ext.iterate(this.form.getValues(), function(key, value) {
			var f = this.form.findField(key);
			f.setValue(atts[key]);
		}, this);
		*/
		console.log('atts.lon: ' + atts.lon);
		console.log('atts.lat: ' + atts.lat);
		this.getForm().setValues(atts);
	},
	doSuccess: function() {
		if (! this.feature)
			return;
		var newValues = {};
		Ext.iterate(this.form.getValues(), function(key, value) {
			var f = this.form.findField(key);
			if (f.isDirty())
				newValues[key] = f.getValue();
		}, this);
		if (this.type == GPXEditor1_1.form.FeatureForm.TYPES.WPT) {
			if (newValues['lon'] || newValues['lat']) {
				console.log('lon or lat modified');
				var lon = newValues['lon'] ? newValues['lon'] : this.form.findField('lon').getValue();
				var lat = newValues['lat'] ? newValues['lat'] : this.form.findField('lat').getValue();
				console.log('lon old: ' + this.form.findField('lon').originalValue + ' new: ' + newValues['lon'] + ' lon: ' + lon);
				console.log('lat old: ' + this.form.findField('lat').originalValue + ' new: ' + newValues['lat'] + ' lat: ' + lat);
				var ll = new OpenLayers.LonLat(lon, lat);
				ll = ll.transform(this.mapPanel.getProjection(), this.mapPanel.getMap().getProjection());
				this.feature.geometry.x = ll.lon;
				this.feature.geometry.y = ll.lat;
			}
		}
		Ext.apply(this.feature.attributes, newValues);
		if (this.type == GPXEditor1_1.form.FeatureForm.TYPES.WPT) {
			GPXEditor1_1.Util.setWPTStyle(this.feature, newValues.type);
			/*
			switch (newValues.type) {
				case GPXEditor1_1.form.FeatureForm.WPT_TYPES.PASS:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT_PASS;
					break;
				case GPXEditor1_1.form.FeatureForm.WPT_TYPES.PK:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT_PK;
					break;
				case GPXEditor1_1.form.FeatureForm.WPT_TYPES.RHSE:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT_RHSE;
					break;
				case GPXEditor1_1.form.FeatureForm.WPT_TYPES.WTRW:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT_WTRW;
					break;
				case GPXEditor1_1.form.FeatureForm.WPT_TYPES.PKLT:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT_PKLT;
					break;
				default:
					this.feature.style = OpenLayers.Layer.GPXLayer.GPXStyles.WPT;
					break;
			}
			*/
		}
		if (this.feature.layer) {
			this.feature.layer.events.triggerEvent('featuremodified', {feature: this.feature});
			this.feature.layer.drawFeature(this.feature);
		}
		else {
			this.mapPanel.getGPXLayer().addFeatures([this.feature]);
		}
	}
});
Ext.reg('gpxe-FeatureForm', GPXEditor1_1.form.FeatureForm);

GPXEditor1_1.form.FeatureForm.MODES = {
	ADD: 'ADD',
	EDIT: 'EDIT'
};

GPXEditor1_1.form.FeatureForm.TYPES = {
	WPT: 'WPT',
	RTE: 'RTE',
	TRK: 'TRK'
};

GPXEditor1_1.form.FeatureForm.WPT_TYPES = { /* see http://www.geonames.org/export/codes.html */
	UNKNOW: 'UNKNOW',
	PK: 'PK',     /* peak =~ sommet               */
	PASS: 'PASS', /* pass =~ col                  */
	RHSE: 'RHSE', /* shelter =~ refuge            */
	WTRW: 'WTRW', /* water source =~ source d'eau */
	PKLT: 'PKLT'
};

GPXEditor1_1.form.FeatureForm.LOCALES = {
	LABEL_NAME: 'LABEL_NAME',
	LABEL_DESC: 'LABEL_DESC',
	LABEL_TYPE: 'LABEL_TYPE',
	LABEL_ELE: 'LABEL_ELE',
	LABEL_LAT: 'LABEL_LAT',
	LABEL_LON: 'LABEL_LON',
	/*
	LABEL_DISTANCE: 'LABEL_DISTANCE',
	LABEL_POSITIVE_DENIVELATION: 'LABEL_POSITIVE_DENIVELATION',
	LABEL_NEGATIVE_DENIVELATION: 'LABEL_NEGATIVE_DENIVELATION',
	LABEL_DURATION: 'LABEL_DURATION',
	*/
	WPT_TYPE_UNKNOW: 'WPT_TYPE_UNKNOW',
	WPT_TYPE_PK: 'WPT_TYPES_PK',
	WPT_TYPE_PASS: 'WPT_TYPE_PASS',
	WPT_TYPE_RHSE: 'WPT_TYPE_RHSE',
	WPT_TYPE_WTRW: 'WPT_TYPE_WTRW',
	WPT_TYPE_PKLT: 'WPT_TYPE_PKLT',
	WPT_MODE_ADD_TITLE: 'WPT_MODE_ADD',
	WPT_MODE_EDIT_TITLE: 'WPT_MODE_EDIT',
	RTE_MODE_ADD_TITLE: 'RTE_MODE_ADD',
	RTE_MODE_EDIT_TITLE: 'RTE_MODE_EDIT',
	TRK_MODE_ADD_TITLE: 'TRK_MODE_ADD',
	TRK_MODE_EDIT_TITLE: 'TRK_MODE_EDIT',
	BT_FINDELE_TOOLTIP: 'BT_FINDELE_TOOLTIP',
	BT_SAVE_TEXT: 'BT_SAVE_TEXT',
	BT_CANCEL_TEXT: 'BT_CANCEL_TEXT'
};
