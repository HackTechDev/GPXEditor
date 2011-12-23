Ext.namespace('GPXEditor1_1');

GPXEditor1_1.ElementInfo = Ext.extend(Ext.Panel, {
	element: undefined
	, initComponent: function() {
		this.LOCALES = GPXEditor1_1.ElementInfo.LOCALES;

		Ext.applyIf(this, {
			autoScroll: true,
			title: '-'
		});
		GPXEditor1_1.ElementInfo.superclass.initComponent.call(this);
	}
	, setElement: function(element) {
		this.element = element;
		this.updateInfos();
	}
	, updateInfos: function() {
		this.updateTitle();
		this.updateData();
	}
	, updateTitle: function() {
		this.setTitle(this.element ? this.element.get('name') : '-');
	}
	, updateData: function() {
		this.update(this.getDescription());
	}
	, getDescription: function() {
		return 
			'<div class="gpxe-elementDesc">'
			+ '<span class="gpxe-elementLabel">' + GPXEditor1_1.form.FeatureForm.LOCALES.LABEL_DESC + ': </span>'
			+ (this.element ? this.element.get('desc') : '')
			+ '</div>';
	}
});
Ext.reg('gpxe-ElementInfo', GPXEditor1_1.ElementInfo);

GPXEditor1_1.ElementInfo.LOCALES = {
};
