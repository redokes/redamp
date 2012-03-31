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
	emptyText: '<div class="playlist-empty-text">Drag files from the library and drop here...</div>',
	deferEmptyText: false,
	overItemCls: 'view-hover',
	trackOver: true,
	autoScroll: true,
	multiSelect: true,
	playlistItems: false,
	playingCls: 'playing',
	
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	initComponent: function(){
		this.items = this.items || [];
		this.playlistItems = new Ext.util.MixedCollection();
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
		
		this.on('refresh', this.onRefreshView, this, { buffer: 100});
		
		this.on('itemupdate', this.onItemUpdate, this);
	},
	
	initDragZone: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDragZone, this);
			return;
		}
		
		this.dragZone = Ext.create('RedAmp.music.playlist.DragZone', this, {
			ddGroup: RedAmp.music.module.Music.getDDGroup()
		});
	},
	
	initDropZone: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDropZone, this);
			return;
		}
		
		this.dropZone = Ext.create('RedAmp.music.playlist.DropZone', this, {
			ddGroup: RedAmp.music.module.Music.getDDGroup()
		});
	},
	
	initPlayer: function(){
		if(this.player == null){
			return
		}
		this.setPlayer(this.player);
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
	// Mutators
	///////////////////////////////////////////////////////////////////////////
	setPlayer: function(player){
		this.player = player;
		
		//Listen for the complete event
		this.player.un('complete', this.next, this);
		this.player.on('complete', this.next, this);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	play: function(record){
		if(this.player == null){
			return
		}
		
		//Tell the player to play the record
		this.currentlyPlaying = record;
		this.player.play(record);
		this.select(record);
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
		//Destroy any current items
		this.playlistItems.each(function(item){
			item.destroy();
		}, this);
		this.playlistItems.clear();
		
		//Create all the items
		this.getStore().each( function(record){
			var item = Ext.create('RedAmp.music.playlist.Item', this, record);
			this.playlistItems.add(record.internalId, item);
		}, this);
		
		return;
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
	},
	
	onItemUpdate: function(record){
		this.playlistItems.get(record.internalId).destroy();
		this.playlistItems.removeAtKey(record.internalId);
		var item = Ext.create('RedAmp.music.playlist.Item', this, record);
		this.playlistItems.add(record.internalId, item);
	}
});