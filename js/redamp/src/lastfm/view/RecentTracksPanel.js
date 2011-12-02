Ext.define('RedAmp.lastfm.view.RecentTracksPanel', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'fit',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initView();
		this.dockedItems = [{
			xtype: 'pagingtoolbar',
			store: this.view.getStore(),
			dock: 'top',
			displayInfo: true
		}];
	},
	
	initView: function(){
		this.view = Ext.create('RedAmp.lastfm.view.RecentTracks');
		this.items.push(this.view);
	}
});