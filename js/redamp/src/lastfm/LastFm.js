Ext.define('RedAmp.lastfm.LastFm', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	///////////////////////////////////////////////////////////////////////////
	// Requires
	///////////////////////////////////////////////////////////////////////////
	requires:[
		'RedAmp.lastfm.api.Api'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config:{
		name: 'lastfm',
		title: 'Last FM',
		viewClass: 'RedAmp.lastfm.view.RecentTracksPanel'
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	api: false,
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	baseInit: function(){
		return this.callParent(arguments);
	},
	
	init: function(){
		this.api = RedAmp.lastfm.api.Api;
		this.initAuth();
		this.initScrobble();
	},
	
	initAuth: function(){
		this.authWindow = Ext.create('Ext.window.Window', {
			title: 'Authenticate Last FM',
			scope: this,
			width: 200,
			height: 100,
			layout: 'fit',
			closable: true,
			closeAction: 'hide',
			resizable: false,
			draggable: false,
			modal: true,
			items: Ext.create('RedAmp.lastfm.button.Authenticate')
		});
		this.on('show', this.onShowAuth, this);
		
		this.api.onAuthentication(function(){
			this.authWindow.hide();
			this.un('show', this.onShowAuth, this);
			if(this.getView()){
				this.getView().getEl().unmask();
			}
		}, this);
	},
	
	initScrobble: function(){
		//Get a reference to the music module
		var musicModule = this.getApplication().getModule('music');
		
		//Make sure the music module is loaded
		if(!musicModule){
			this.getApplication().onModuleReady('music', function(){
				this.initScrobble();
			}, this);
			return;
		}
		
		//Get the player
		var player = musicModule.getPlayer();
		
		//Listen for when a song starts playing
		player.on('play', this.onPlay, this);
		
		//Listen for when a song stops
		player.on('beforestop', this.onBeforeStop, this);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	onPlay: function(player, track){
		this.api.request({
			scope: this,
			signed: true,
			type: 'post',
			module: 'track',
			method: 'updateNowPlaying',
			params:{
				track: track.get('title'),
				artist: track.get('artist')
			},
			callback: function(response){
				if(response.success){
					this.getApplication().onModuleReady('stream', function(stream, options){
						var response = options.response;
						stream.addMessage({
							text: '<span style="font-weight: bold;">Now Playing: </span>' + response.nowplaying.artist.text + ' - ' + response.nowplaying.track.text
						});
					}, this, {response: response});
				}
			}
		});
	},
	
	onBeforeStop: function(player, track, percentagePlayed){
		if(percentagePlayed < 50){
			return;
		}
		
		//Scrobble the track
		this.api.request({
			scope: this,
			signed: true,
			type: 'post',
			module: 'track',
			method: 'scrobble',
			params:{
				timestamp: RedAmp.util.Util.getUnixTimestamp(),
				track: track.get('title'),
				artist: track.get('artist')
			},
			callback: function(response){
				if(response.success){
					this.getApplication().onModuleReady('stream', function(stream, options){
						var response = options.response;
						var scrobble = response.scrobbles.scrobble;
						stream.addMessage({
							text: '<span style="font-weight: bold;">Scrobbled: </span>' + scrobble.artist.text + ' - ' + scrobble.track.text
						});
					}, this, {response: response});
				}
			}
		});
	},
	
	onShowAuth: function(){
		if(this.api.isAuthenticated()){
			return;
		}
		this.getView().getEl().mask();
		this.authWindow.show();
	}
});