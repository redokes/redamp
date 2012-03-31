Ext.define('RedAmp.settings.form.Settings', {
	extend: 'Ext.form.Panel',
	bodyPadding: 10,
	initComponent: function(){
		this.items = this.items || [];
		this.callParent(arguments);
	}
});