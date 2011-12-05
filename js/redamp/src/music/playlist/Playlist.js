Ext.define('RedAmp.music.playlist.Playlist', {
	extend:'Ext.view.View',
	
	requires:[
		'RedAmp.model.Audio'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	player: null,
	albumSelector: '.playlist-album-item',
	itemSelector: '.view-item',
	emptyText: '<div class="playlist-empty-text">Drop files here....</div>',
	deferEmptyText: false,
	overItemCls: 'view-hover',
	playingCls: 'playing',
	trackOver: true,
	autoScroll: true,
	multiSelect: true,
	
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initTpl();
		this.initListeners();
		this.initDragZone();
		this.initDropZone();
		this.initPlayer();
		this.initToolbar();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			model: 'RedAmp.model.Audio'
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate', 
			'<tpl for=".">',
				'<div class="playlist-item view-item x-unselectable">',
				  '<span>{artist} - {title}</span>',
				  '<div class="icon"></div>',
				'</div>',
			'</tpl>'
		);
	},
	
	initListeners: function(){
		this.on('itemdblclick', function(view, record, item, index, event){
			//Cancel the event
			event.preventDefault();
			event.stopEvent();
			
			//Play the file if a player is attached
			this.play(record);
			
		}, this);
		
		this.on('afterrender', function(){
			this.refresh();
		}, this);
		
		this.on('refresh', this.onRefreshView, this);
	},
	
	initDragZone: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDragZone, this);
			return;
		}
		
		this.dragZone = Ext.create('RedAmp.music.playlist.DragZone', this, {
			ddGroup: RedAmp.music.Music.ddGroup
		});
	},
	
	initDropZone: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDropZone, this);
			return;
		}
		
		this.dropZone = Ext.create('RedAmp.music.playlist.DropZone', this, {
			ddGroup: RedAmp.music.Music.ddGroup
		});
	},
	
	initPlayer: function(){
		if(this.player == null){
			return
		}
		
		//Listen for the complete event
		this.player.on('complete', function(){
			this.next();
		}, this);
	},
	
	initToolbar: function(){
		this.lbar = new Ext.toolbar.Toolbar({
			items: [{
				text: 'test'
			}]
		});
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Accessors
	///////////////////////////////////////////////////////////////////////////
	getAlbumSelector: function(){
		return this.albumSelector;
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	play: function(record){
		if(this.player == null){
			return
		}
		
		//If there is a currentlyPlaying remove the class
		if(this.currentlyPlaying != null){
			Ext.get(this.getNode(this.currentlyPlaying)).removeCls(this.playingCls);
		}
		
		this.currentlyPlaying = record;
		this.player.play(record);
		this.select(record);
		Ext.get(this.getNode(this.currentlyPlaying)).addCls(this.playingCls);
	},
	
	next: function(){
		var record = this.store.getAt(this.store.indexOf(this.currentlyPlaying) + 1);
		if(record != null){
			this.play(record);
		}
	},
	
	clear: function(){
		this.store.removeAll();
	},
	
	createAlbum: function(artist, album, records){
		if(!artist.length || !album.length || records.length < 2){
			return;
		}
		
		Ext.create('RedAmp.music.playlist.Album', this, artist, album, records);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// On Events
	///////////////////////////////////////////////////////////////////////////
	onRefreshView: function(){
		//Create all the items
		this.getStore().each( function(record){
			Ext.create('RedAmp.music.playlist.Item', this, record);
		}, this);
		
		//Find albums
		var currentAlbum = false;
		var currentArtist = false;
		var albumRecords = [];
		this.getStore().each(function(record){
			var artist = record.get('artist');
			var album = record.get('album');
			if(!currentArtist || !currentAlbum){
				currentArtist = artist;
				currentAlbum = album;
			}
			if(artist != currentArtist || album != currentAlbum){
				this.createAlbum(currentArtist, currentAlbum, albumRecords);
				currentArtist = artist;
				currentAlbum = album;
				albumRecords = [];
			}
			albumRecords.push(record);
		}, this);
		this.createAlbum(currentArtist, currentAlbum, albumRecords);
	}
});