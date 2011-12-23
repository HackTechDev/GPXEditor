Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.WPTForm = Ext.extend(GPXEditor1_1.form.GPXElementForm, {
	initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.form.WPTForm.LOCALES
			, iconCls: 'gpxe-WptIcon'
		});

		GPXEditor1_1.form.WPTForm.superclass.initComponent.call(this);
	}
	, _initItems: function() {
		var ret = GPXEditor1_1.form.WPTForm.superclass._initItems.call(this);
		ret.push({
			xtype: 'combo'
			, mode: 'local'
			, store: new Ext.data.ArrayStore({
				id: 0
				, fields: ['wptTypeId', 'wptTypeName']
				, data: [
					[GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_UNKNOW ]
					, [GPXEditor1_1.data.WPTRecord.WPT_TYPES.PK, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_PK]
					, [GPXEditor1_1.data.WPTRecord.WPT_TYPES.PASS, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_PASS]
					, [GPXEditor1_1.data.WPTRecord.WPT_TYPES.RHSE, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_RHSE]
					, [GPXEditor1_1.data.WPTRecord.WPT_TYPES.WTRW, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_WTRW]
					, [GPXEditor1_1.data.WPTRecord.WPT_TYPES.PKLT, GPXEditor1_1.data.WPTRecord.LOCALES.WPT_TYPE_PKLT]
				]
			})
			, valueField: 'wptTypeId'
			, displayField: 'wptTypeName'
			, allowBlank: false
			, triggerAction: 'all'
			, value: GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW
			, blankText: GPXEditor1_1.data.WPTRecord.WPT_TYPE_UNKNOW
			, forceSelection: true
			, fieldLabel: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_TYPE_NAME
			, name: 'type'
		});

		ret.push({
			xtype: 'compositefield'
			, fieldLabel: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_ELE_NAME
			, items: [{
				xtype: 'numberfield'
				, allowDecimals: false
				, name: 'ele'
			}
			, {
				xtype: 'button'
				, iconCls: 'gpxe-GetElevation'
				, tooltip: this.LOCALES.BT_FINDELE_TOOLTIP
				, form: this
				, handler: function(button, evtObject) {
					var f = button.form.getForm();
					var fEle = f.findField('ele');
					var lon = f.findField('lon').getValue();
					var lat = f.findField('lat').getValue();
					if (lon != null && lat != null) {
						var ll = new OpenLayers.LonLat(lon, lat);
						button.setDisabled(true);
						fEle.setDisabled(true);
						var getEle = new OpenLayers.Elevation(ll, function(ele) {
							if (ele != null) 
								f.findField('ele').setValue(ele);
							f.findField('ele').setDisabled(false);
							this.setDisabled(false);
						}, button);
					}
				}
			}]
		});

		ret.push({
			xtype: 'numberfield'
			, decimalPrecision: GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS
			, allowBlank: false
			, minValue: -180.0
			, maxValue: 179.999999999
			, fieldLabel: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_LON_NAME
			, name: 'lon'
		});

		ret.push({
			xtype: 'numberfield'
			, decimalPrecision: GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS
			, allowBlank: false
			, minValue: -90.0
			, maxValue: 90.0
			, fieldLabel: GPXEditor1_1.data.WPTRecord.LOCALES.FIELD_LAT_NAME
			, name: 'lat'
		});

		return ret;
	}
});
Ext.reg('gpxe-WPTForm', GPXEditor1_1.form.WPTForm);

GPXEditor1_1.form.WPTForm.LOCALES = Ext.applyIf({
	WHAT_TITLE_PART: 'WHAT_TITLE_PART'
}, GPXEditor1_1.form.GPXElementForm.LOCALES);
