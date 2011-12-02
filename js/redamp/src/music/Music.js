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
		this.getApplication().getCenter().add(new Ext.panel.Panel({
			layout: 'fit',
			title: 'Playlist',
			items:[this.playlist],
			lbar: Ext.create('RedAmp.music.playlist.Toolbar', {
				playlist: this.playlist
			})
		}));
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