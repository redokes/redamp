Ext.define('RedAmp.lastfm.api.Auth', {
	extend: 'Ext.util.Observable',
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		
	}
});