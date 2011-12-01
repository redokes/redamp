Ext.define('RedAmp.music.playlist.Playlist', {
	extend:'Ext.view.View',
	
	requires:[
		'RedAmp.model.Audio'
	],
	
	//config
	player: null,
	itemSelector: '.view-item',
	emptyText: '<div class="playlist-empty-text">Drop files here....</div>',
	deferEmptyText: false,
	overItemCls: 'view-hover',
	playingCls: 'playing',
	trackOver: true,
	autoScroll: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initTpl();
		this.initListeners();
		this.initDragDrop();
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
		
		this.on('refresh', function(){
			Ext.each(this.store.data.items, function(record){
				Ext.create('RedAmp.music.playlist.Item', this, record);
			}, this);
		}, this);
	},
	
	initDragDrop: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDragDrop, this);
			return;
		}
		this.dragDrop = Ext.create('Ext.dd.DropTarget', this.getEl(), {
			ddGroup: 'TreeDD',
			notifyOver: function() {
				return this.dropAllowed;
			},
			notifyDrop: Ext.bind(function(source, e, data) {
				var files = this.getDroppedFiles(data.records);
				this.addFiles(files);
			}, this)
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
	
	getDroppedFiles: function(records) {
		var files = [];
		for (var i = 0; i < records.length; i++) {
			if (records[i].childNodes && records[i].childNodes.length) {
				// Combine files with current file list
				var newFiles = this.getDroppedFiles(records[i].childNodes)
				var numFiles = newFiles.length;
				for (var j = 0; j < numFiles; j++) {
					files.push(newFiles[j]);
				}
			}
			else {
				files.push(records[i].raw.record);
			}
		}
		
		return files;
	},
	
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
	
	addFiles: function(records) {
		this.store.add(records);
	}
	
});