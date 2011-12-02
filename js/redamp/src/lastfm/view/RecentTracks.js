Ext.define('RedAmp.lastfm.view.RecentTracks', {
	extend: 'Ext.view.View',
	
	//Requires
	requires:[
		'RedAmp.lastfm.model.RecentTrack'
	],
	
	//config
	itemSelector: '.view-item',
	emptyText: '<div class="playlist-empty-text">No recent tracks...</div>',
	deferEmptyText: false,
	overItemCls: 'view-hover',
	trackOver: true,
	autoScroll: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.api = RedAmp.lastfm.api.Api;
		this.initStore();
		this.initTpl();
		
		this.api.onAuthentication(function(){
			this.getStore().getProxy().extraParams = this.api.getParams('user', 'getRecentTracks', {
				user: this.api.getSession().name
			});
			this.getStore().load();
		}, this);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			model: 'RedAmp.lastfm.model.RecentTrack',
			proxy:{
				url: this.api.getRequestUrl(),
				type:'ajax',
				noCache: false,
				actionMethods:{
					read: 'POST'
				},
				reader:{
					type:'json',
					root:'recenttracks.track',
					totalProperty: 'recenttracks.attr.total'
				}
			}
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate', 
			'<tpl for=".">',
				'<div class="playlist-item view-item x-unselectable">',
				  '<span>{artist.text} - {name}</span>',
				'</div>',
			'</tpl>'
		);
	}
});