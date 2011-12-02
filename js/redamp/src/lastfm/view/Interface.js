Ext.define('RedAmp.lastfm.view.Interface', {
	extend: 'Ext.panel.Panel',
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.html = 'test';
	}
});