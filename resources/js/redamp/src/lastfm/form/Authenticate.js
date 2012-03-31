Ext.define('RedAmp.lastfm.form.Authenticate', {
	extend: 'Ext.panel.Panel',
	
	bodyPadding: 5,
	requires:[
		'RedAmp.lastfm.api.Api'
	],
	title: 'Last FM',
	
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