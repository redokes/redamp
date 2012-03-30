Ext.define('RedAmp.music.playlist.Album', {
	extend:'Ext.util.Observable',
	
	view: false,
	artist: false,
	album: false,
	records: [],
	el: false,
	
	//Inits
	constructor: function(view, artist, album, records, config){
		this.view = view;
		this.artist = artist;
		this.album = album;
		this.records = records;
		this.initConfig(config);
		this.callParent(config);
		this.init();
		return this;
	},
	
	init: function(){
		this.initTemplate();
		this.initElements();
	},
	
	initTemplate: function(){
		this.template = Ext.create('Ext.XTemplate', 
			'<div class="playlist-album-item">',
				'<div class="playlist-album-header">{artist} - {album}</div>',
				'<div class="playlist-album-body"></div>',
			'</div>'
		);
	},
	
	initElements: function(){
		this.initEl();
		this.initHeader();
		this.initBody();
		this.initRecords();
	},
	
	initEl: function(){
		var firstRecord = this.records[0];
		var firstNode = Ext.get(this.view.getNode(firstRecord));
		
		this.el = Ext.get(this.template.insertBefore(firstNode, {
			artist: this.artist,
			album: this.album
		}));
	},
	
	initHeader: function(){
		this.headerEl = Ext.get(this.el.down('.playlist-album-header'));
		this.headerEl.on('click', function(){
			//this.bodyEl.toggle();
		}, this);
	},
	
	initBody: function(){
		this.bodyEl = Ext.get(this.el.down('.playlist-album-body'));
		this.bodyEl.setVisibilityMode(Ext.Element.DISPLAY);
	},
	
	initRecords: function(){
		//Move all record nodes into the body
		Ext.each(this.records, function(record){
			var node = Ext.get(this.view.getNode(record));
			this.bodyEl.appendChild(node);
		}, this);
	}
});