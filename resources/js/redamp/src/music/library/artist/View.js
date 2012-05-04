Ext.define('RedAmp.music.library.artist.View', {
	extend:'Ext.container.Container',
	requires:[
		'Lapidos.audio.model.Audio',
		'RedAmp.music.library.Store',
		'RedAmp.music.library.artist.Item'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	padding: 10,
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	initComponent: function(){
		this.items = this.items || [];
		this.artists = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initArtistContainer();
		this.initStore();
	},
	
	initArtistContainer: function(){
		this.artistContainer = new Ext.container.Container();
		this.items.push(this.artistContainer);
		this.items.push({
			border: false,
			html: '<div class="x-clear"></div>'
		})
	},
	
	initStore: function() {
		this.store = new Ext.data.Store({
			fields:[{
				name: 'artist',
				type: 'string'
			},{
				name: 'image',
				src: 'string'
			}]
		});
		this.store.on({
			add: {
				scope: this,
				fn: this.onArtistAdd
			}
		});
		this.on({
			afterrender: {
				scope: this,
				fn: this.onLibraryChange
			}
		});
		RedAmp.music.library.Store.on({
			datachanged: {
				scope: this,
				buffer: 500,
				fn: this.onLibraryChange
			} 
		});
	},
	
	onLibraryChange: function(){
		var records = [];
		RedAmp.music.library.Store.each(function(record){
			var artist = record.get('artist');
			if(!artist.length){
				return;
			}
			if(Ext.isEmpty(this.artists[artist])){
				this.artists[artist] = true;
				records.push({
					artist: artist
				});
			}
		}, this);
		this.store.add(records);
	},
	
	onArtistAdd: function(store, records){
		//Create the artist item
		Ext.each(records, function(record){
			var artist = new RedAmp.music.library.artist.Item({
				record: record
			});
			this.artistContainer.add(artist);
		}, this);
	}
});