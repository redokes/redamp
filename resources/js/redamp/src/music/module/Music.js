Ext.define('RedAmp.music.module.Music', {
	extend: 'Lapidos.module.Viewable',
	requires: [
		'RedAmp.music.Player'
	],
	
	statics:{
		getDDGroup: function(){
			return 'redamp-music';
		}
	},
	
	//Config
	config: {
		name: 'music',
		title: 'Music',
		viewConfig: {
			home: 'RedAmp.music.ui.Library'
		},
		menu:[{
			display: 'Library',
			tags:['application']
		}],
		channel: null
	},
	
	init: function(){
		this.initChannel();
		this.initPlayer();
		this.initPlaylist();
	},
	
	onRegister: function(){
		this.getOs().getShell().getView().getNorth().add(this.player);
		this.getOs().getShell().getView().getWest().add(this.playlist);
	},
	
	onLaunch: function(){
		this.callParent(arguments);
	},
	
	initChannel: function() {
		this.setChannel(new Lapidos.audio.Channel({
			name: 'Music',
			mode: 'multi',
			crossfade: true,
			crossfadeDuration: 80
		}));
	},
	
	initPlayer: function(){
		this.player = new RedAmp.music.Player({
			scope: this,
			channel: this.getChannel()
		});
		this.on({
			scope: this,
			initviewhome: function(module, view){
				//view.setPlayer(this.player);
			}
		});
	},
	
	initPlaylist: function(){
		this.playlist = Ext.create('RedAmp.music.playlist.Playlist', {
			scope: this,
			player: this.player,
			channel: this.getChannel()
		});
	},
	
	getPlayer: function(){
		return this.player;
	},
	
	getPlaylist: function(){
		return this.playlist;
	}
});
/*
Ext.define('RedAmp.music.Music', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config:{
		name: 'music',
		title: 'Playlist'
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	ddGroup: 'redamp-music',
	
	///////////////////////////////////////////////////////////////////////////
	// Init Functions
	///////////////////////////////////////////////////////////////////////////
	init: function(){
		this.initPlayer();
		this.initPlaylist();
	},
	
	initPlayer: function(){
		this.player = Ext.create('RedAmp.music.Player', {
			scope: this
		}, this);
		this.getApplication().getNorth().add(this.player);
	},
	
	initPlaylist: function(){
		this.playlist = Ext.create('RedAmp.music.playlist.Playlist', {
			player: this.player
		});
		
		var view = this.getApplication().getCenter().add(new Ext.panel.Panel({
			layout: 'fit',
			title: 'Playlist',
			items:[this.playlist],
			lbar: Ext.create('RedAmp.music.playlist.Toolbar', {
				playlist: this.playlist
			})
		}));
		
		var tabBar = this.getApplication().getCenter().getTabBar();
		var tab = tabBar.items.getAt(tabBar.items.findIndex('card', view));
		if(tab != null){
			tab.on('afterrender', function(tab){
				new Ext.dd.DropTarget(tab.getEl(), {
					ddGroup: this.ddGroup,
					notifyDrop: Ext.bind(function(source, event, data){
						//Make copies of the records
						var records = [];
						Ext.each(data.records, function(record){
							var copy = record.copy();
							Ext.data.Model.id(copy);
							records.push(copy);
						}, this);
						
						this.playlist.getStore().add(records);
					}, this)
				});
			}, this);
		}
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Accessors
	///////////////////////////////////////////////////////////////////////////
	getPlayer: function(){
		return this.player;
	},
	
	getPlaylist: function(){
		return this.playlist;
	}
});
*/