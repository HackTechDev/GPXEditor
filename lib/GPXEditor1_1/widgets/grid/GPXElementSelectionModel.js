Ext.namespace('GPXEditor1_1.grid');

GPXEditor1_1.grid.GPXElementSelectionModel = Ext.extend(GeoExt.grid.FeatureSelectionModel, {
	rowSelected: function(model, row, record) {
		if (this.selectControl.active)
			GPXEditor1_1.grid.GPXElementSelectionModel.superclass.rowSelected.call(this, model, row, record);
	}
});
