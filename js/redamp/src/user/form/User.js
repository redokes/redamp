Ext.define('RedAmp.user.form.User', {
	extend: 'Ext.form.Panel',
	
    initComponent: function() {
		this.items = [];
		this.dockedItems = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initName();
	},
	
	initName: function(){
		this.nameField = new Ext.form.field.Text({
			scope: this,
			name: 'name'
		});
		this.items.push(this.nameField);
	}
});