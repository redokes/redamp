Ext.define('RedAmp.lastfm.form.Authenticate', {
	extend: 'Ext.form.Panel',
	
	requires:[
		'RedAmp.lastfm.api.Api'
	],
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initAuthButton();
	},
	
	initAuthButton: function(){
		this.items.push(Ext.create('RedAmp.lastfm.button.Authenticate'));
	}
});