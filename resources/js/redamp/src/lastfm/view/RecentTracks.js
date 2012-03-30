Ext.define('RedAmp.lastfm.view.RecentTracks', {
	extend: 'Ext.view.View',
	
	//Requires
	requires:[
		'RedAmp.lastfm.model.RecentTrack'
	],
	
	//config
	itemSelector: '.view-item',
	emptyText: '<div class="empty-text">No recent tracks...</div>',
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
				'<div class="lastfm-recent-track view-item x-unselectable">',
					'<div class="image">',
						'<img src="{[values.image[0].text]}" />',
					'</div>',
					'<div class="display">',
						'<span>{artist.text} - {name}</span>',
					'</div>',
					'<div class="date">',
						'{[this.formatDate(values.date.uts, values)]}',
					'</div>',
				'</div>',
			'</tpl>',
			{
				formatDate: function(date, values){
					var d = new Date();
					if(values.attr.nowplaying != null && values.attr.nowplaying == "true"){
						return 'now playing';
					}
					else{
						d.setTime(date * 1000);
						return Ext.util.Format.date(d, 'F j, Y g:i a');
					}
				}
			}
		);
	}
});