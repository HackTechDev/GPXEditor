Ext.namespace('GPXEditor1_1.form');

GPXEditor1_1.form.ImportForm = Ext.extend(Ext.form.FormPanel, {
	gpxLayer: undefined
	, fuFile: undefined
	, tfURL: undefined
	, sMode: undefined
	, cbLoadMode: undefined
	, bLoad: undefined
	, bImport: undefined
	, lastBtAction: undefined
	, initComponent: function() {
		Ext.applyIf(this, {LOCALES: GPXEditor1_1.form.ImportForm.LOCALES});

		if (! (this.gpxLayer instanceof GPXEditor1_1.GPXLayer))
			this.gpxLayer = new GPXEditor1_1.GPXLayer();

		this.MODE = GPXEditor1_1.form.ImportForm.MODE;
		this.fuFile = new Ext.ux.form.FileUploadField({
			name: 'file'
			, hiddenName: 'file'
			, fieldLabel: this.LOCALES.FILE_FIELD_LABEL
			, emptyText: this.LOCALES.FILE_FIELD_EMPTYTEXT
			, buttonText: '...'
			, allowBlank: false
		});
		this.tfURL = new Ext.form.TextField({
			name: 'url'
			, fieldLabel: this.LOCALES.URL_FIELD_LABEL
			, emptyText: this.LOCALES.URL_FIELD_EMPTYTEXT
			, disabled: true
			, allowBlank: false
		});
		this.sMode = new Ext.data.ArrayStore({
			id: 0
			, fields: [
				'id'
				, 'text'
			]
			, data: [
				[this.MODE.FILE, this.LOCALES.MODE_FILE_TEXT]
				, [this.MODE.URL, this.LOCALES.MODE_URL_TEXT]
			]
		});
		this.cbLoadMode = new Ext.form.ComboBox({
			selectOnFocus: true
			, editable: false
			, forceSelection: true
			, lazyRender: true
			, typeAhead: true
			, triggerAction: 'all'
			, mode: 'local'
			, store: this.sMode
			, valueField: 'id'
			, displayField: 'text'
			, value: this.sMode.getAt(0).get('id')
			, name: 'mode'
			, hiddenName: 'mode'
			, fieldLabel: this.LOCALES.MODE_FIELD_LABEL
		});
		this.bLoad = new Ext.Button({
			text: this.LOCALES.ACTION_LOAD_TEXT
			, tooltip: this.LOCALES.ACTION_LOAD_TOOLTIP
			, iconCls: 'gpxe-GPXFileLoadIcon'
			, disabled: true
			, handler: this.doLoad
			, scope: this
			, formBind: true
		});
		this.bImport = new Ext.Button({
			text: this.LOCALES.ACTION_IMPORT_TEXT
			, tooltip: this.LOCALES.ACTION_IMPORT_TOOLTIP
			, iconCls: 'gpxe-GPXFileImportIcon'
			, disabled: true
			, handler: this.doLoad
			, scope: this
			, formBind: true
		});
		Ext.apply(this, {
			title: this.LOCALES.TITLE
			, iconCls: 'gpxe-AddFileIcon'
			, monitorValid: true
			, fileUpload: true
			, frame: true
			, autoHeight: true
			, autoWidth: true
			, defaults: {
				allowBlank: false
				, anchor: '100%'
				, msgTarget: 'qtip'
			}
			, items: [
				this.cbLoadMode
				, this.fuFile
				, this.tfURL 
				, {
					xtype: 'fieldset'
					, title: this.LOCALES.OPTIONS_FIELDSET_TITLE
					, autoHeight: true
					, defaultType: 'checkbox'
					, hideLabels: true
					, defaults: {
						checked: true
					}
					, items: [
						{
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
						}
					]
				}
			]
			, buttons: [
				this.bLoad
				, this.bImport
			]
		});
		GPXEditor1_1.form.ImportForm.superclass.initComponent.call(this);
		this.addEvents({
			'load': true
			, 'import': true
		});
		this.cbLoadMode.on('select', function(combo, record, index) {
			if (record.get('id') == this.MODE.FILE) {
				this.fuFile.enable();
				this.tfURL.disable();
				this.tfURL.setValue(null);
			}
			else if (record.get('id') == this.MODE.URL) {
				this.tfURL.enable();
				this.fuFile.disable();
				if (this.fuFile.fileInput) /* bug in ux */
					this.fuFile.reset();
			}
		}, this);
		this.on('clientvalidation', function(form, isValid) {
			var form = this.getForm();
			if (form.findField('doWpts').getValue() == false
				&& form.findField('doRtes').getValue() == false
				&& form.findField('doTrks').getValue() == false)
					isValid = false;
			if (isValid) {
				this.bLoad.enable();
				this.bImport.enable();
			}
			else {
				this.bLoad.disable();
				this.bImport.disable();
			}
			return isValid;
		}, this);
		this.getForm().on('beforeaction', function(form, action) {
			Ext.apply(action, {
				handleResponse : function(response) {
					if (this.form.errorReader) {
						var rs = this.form.errorReader.read(response);
						var errors = [];
						if (rs.records) {
							for (var i = 0, len = rs.records.length; i < len; i++) {
								var r = rs.records[i];
								errors[i] = r.data;
							}
						}
						if (errors.length < 1) {
							errors = null;
						}
						return {
							success : rs.success
							, errors : errors
						};
					}
					if (response.responseXML && response.responseXML.documentElement && response.responseXML.documentElement.localName == 'gpx') 
						return {success: true, gpxData: response.responseXML};

					return Ext.decode(response.responseText);
				}
			});
		}, this);
	}
	, setOpenConfig: function(openConfig) {
		if (this.fuFile.fileInput) /* Bug in ux */
			this.fuFile.reset();
		this.tfURL.setValue(null);
	}
	, doLoad: function(bt) {
		if (this.getForm().isValid()) {
			this.lastBtAction = bt;
			this.getForm().submit({
				url: 'gpxfileLoad.php',
				waitMsg: this.LOCALES.WAIT_MESSAGE,
				success: this.submitSuccess,
				failure: this.submitFailure,
				scope: this
			});
		}
	}
	, submitSuccess: function(form, action) {
		if (! action.result.success || ! action.result.gpxData)
			this.submitFailure(form, action);
		else {
			var options = {
				extractWaypoints: form.findField('doWpts').getValue()
				, extractRoutes: form.findField('doRtes').getValue()
				, extractTracks: form.findField('doTrks').getValue()
			};
			if (this.lastBtAction == this.bLoad)
				this.gpxLayer.loadGPXDoc(action.result.gpxData, options);
			else
				this.gpxLayer.importGPXDoc(action.result.gpxData, options);
		}
	}
	, submitFailure: function(form, action) {
		var errorMsg = this.LOCALES[action.result.error];
		if (! errorMsg)
			errorMsg = this.LOCALES.MSG_ERROR_NOT_VALID_XML;
		Ext.Msg.show({
			title: this.LOCALES.ERROR_TITLE
			, msg: errorMsg
			, buttons: Ext.Msg.OK
			, icon: Ext.MessageBox.ERROR
		});
	}
});
Ext.reg('gpxe-ImportForm', GPXEditor1_1.form.ImportForm);

GPXEditor1_1.form.ImportForm.MODE = {
	FILE: 'FILE'
	, URL: 'URL'
};

GPXEditor1_1.form.ImportForm.LOCALES = {
	TITLE: 'TITLE'
	, FILE_FIELD_LABEL: 'FILE_FIELD_LABEL'
	, FILE_FIELD_EMPTYTEXT: 'FILE_FIELD_EMPTYTEXT'
	, URL_FIELD_LABEL: 'URL_FIELD_LABEL'
	, URL_FIELD_EMPTYTEXT: 'URL_FIELD_EMPTYTEXT'
	, MODE_FILE_TEXT: 'MODE_FILE_TEXT'
	, MODE_URL_TEXT: 'MODE_URL_TEXT'
	, MODE_FIELD_LABEL: 'MODE_FIELD_LABEL'
	, OPTIONS_FIELDSET_TITLE: 'OPTIONS_FIELDSET_TITLE'
	, DOWPTS_FIELD_BOXLABEL: 'DOWPTS_FIELD_BOXLABEL'
	, DORTES_FIELD_BOXLABEL: 'DORTES_FIELD_BOXLABEL'
	, DOTRKS_FIELD_BOXLABEL: 'DOTRKS_FIELD_BOXLABEL'
	, ACTION_LOAD_TEXT: 'ACTION_LOAD_TEXT'
	, ACTION_LOAD_TOOLTIP: 'ACTION_LOAD_TOOLTIP'
	, ACTION_IMPORT_TEXT: 'ACTION_IMPORT_TEXT'
	, ACTION_IMPORT_TOOLTIP: 'ACTION_IMPORT_TOOLTIP'
	, ERROR_TITLE: 'ERROR_TITLE'
	, MSG_ERROR_ONLY_LOCAL_REQUEST: 'MSG_ERROR_ONLY_LOCAL_REQUEST'
	, MSG_ERROR_NO_FILE_OR_URL: 'MSG_ERROR_NO_FILE_OR_URL'
	, MSG_ERROR_NOT_VALID_XML: 'MSG_ERROR_NOT_VALID_XML'
	, WAIT_MESSAGE: 'WAIT_MESSAGE'
};
