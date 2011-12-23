Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.ExportForm = Ext.extend(Ext.form.FormPanel, {
	gpxLayer: undefined
	, tfFilename: undefined
	, hXMLDoc: undefined
	, bSave: undefined
	, gpxIO: undefined
	, initComponent: function() {
		Ext.applyIf(this, {
			LOCALES: GPXEditor1_1.form.ExportForm.LOCALES
		});
		this.gpxIO = new OpenLayers.Format.GPXEditorIO();
		this.tfFilename = new Ext.form.TextField({
			name: 'filename'
			, fieldLabel: this.LOCALES.FILENAME_FIELD_LABEL
			, emptyText: this.LOCALES.FILENAME_FIELD_EMPTYTEXT
			, allowBlank: false
		});
		this.hXMLDoc = new Ext.form.Hidden({
			name: 'xmldoc'
		});
		this.bSave = new Ext.Button({
			text: this.LOCALES.ACTION_SAVE_TEXT
			, tooltip: this.LOCALES.ACTION_SAVE_TOOLTIP
			, iconCls: 'gpxe-GPXFileSaveIcon'
			, disabled: true
			, handler: this.doSave
			, scope: this
			, formBind: true
		});
		Ext.apply(this, {
			title: this.LOCALES.TITLE
			, iconCls: 'gpxe-SaveFileIcon'
			, url: 'gpxfileSave.php'
			, method: 'POST'
			, monitorValid: true
			, frame: true
			, autoHeight: true
			, autoWidth: true
			, defaults: {
				allowBlank: false
				, anchor: '100%'
			}
			, items: [this.hXMLDoc, this.tfFilename,
				{
					xtype: 'fieldset'
					, title: this.LOCALES.OPTIONS_FIELDSET_TITLE
					, autoHeight: true
					, defaultType: 'checkbox'
					, hideLabels: true
					, defaults: {
						checked: true
					}
					, items: [{
						name: 'doWpts'
						, boxLabel: this.LOCALES.DOWPTS_FIELD_BOXLABEL
					}
					, {
						name: 'doRtes'
						, boxLabel: this.LOCALES.DORTES_FIELD_BOXLABEL
					}
					, {
						name: 'doTrks'
						, boxLabel: this.LOCALES.DOTRKS_FIELD_BOXLABEL
					}]
				}
			]
			, buttons: [this.bSave]
		});
		GPXEditor1_1.form.ExportForm.superclass.initComponent.call(this);
		this.getForm().standardSubmit = true;

		this.on('clientvalidation', function(form, isValid) {
			var f = this.getForm();
			if (f.findField('doWpts').getValue() == false
				&& f.findField('doRtes').getValue() == false
				&& f.findField('doTrks').getValue() == false)
					isValid = false;
			if (isValid) {
				this.bSave.enable();
			}
			else {
				this.bSave.disable();
			}
			return isValid;
		}, this);
	}
	, setOpenConfig: function(openConfig) {
		this.tfFilename.setValue(null);
		this.hXMLDoc.setValue(null);
		var form = this.getForm();
		if (this.gpxLayer.getNbWpts() > 0) {
			form.findField('doWpts').setValue(true);
			form.findField('doWpts').setDisabled(false);
		} else {
			form.findField('doWpts').setValue(false);
			form.findField('doWpts').setDisabled(true);
		}
		if (this.gpxLayer.getNbRtes() > 0) {
			form.findField('doRtes').setValue(true);
			form.findField('doRtes').setDisabled(false);
		} else {
			form.findField('doRtes').setValue(false);
			form.findField('doRtes').setDisabled(true);
		}
		if (this.gpxLayer.getNbTrks() > 0) {
			form.findField('doTrks').setValue(true);
			form.findField('doTrks').setDisabled(false);
		} else {
			form.findField('doTrks').setValue(false);
			form.findField('doTrks').setDisabled(true);
		}
	}
	, doSave: function(bt) {
		if (this.getForm().isValid()) {
			var form = this.getForm();
			this.gpxIO.internalProjection = this.gpxLayer.getGPXMap().getDrawProjection();
			this.gpxIO.extractWaypoints = form.findField('doWpts').getValue();
			this.gpxIO.extractRoutes = form.findField('doRtes').getValue();
			this.gpxIO.extractTracks = form.findField('doTrks').getValue();
			var xmldoc = this.gpxIO.write(this.gpxLayer.gpxLayer.features);
			this.hXMLDoc.setValue(xmldoc);
			form.getEl().dom.action = this.url;
			form.submit();
			form.fireEvent('actioncomplete');
		}
	}
});
Ext.reg('gpxe-ExportForm', GPXEditor1_1.form.ExportForm);

GPXEditor1_1.form.ExportForm.LOCALES = {
	TITLE: 'TITLE',
	FILENAME_FIELD_LABEL: 'FILENAME_FIELD_LABEL',
	FILENAME_FIELD_EMPTYTEXT: 'FILE_FIELD_EMPTYTEXT',
	OPTIONS_FIELDSET_TITLE: 'OPTIONS_FIELDSET_TITLE',
	DOWPTS_FIELD_BOXLABEL: 'DOWPTS_FIELD_BOXLABEL',
	DORTES_FIELD_BOXLABEL: 'DORTES_FIELD_BOXLABEL',
	DOTRKS_FIELD_BOXLABEL: 'DOTRKS_FIELD_BOXLABEL',
	ACTION_SAVE_TEXT: 'ACTION_SAVE_TEXT',
	ACTION_SAVE_TOOLTIP: 'ACTION_SAVE_TOOLTIP'
};
