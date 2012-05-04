Ext.define('RedAmp.music.library.artist.DragZone', {
    extend: 'RedAmp.dd.DragZone',
	
	requires:[
		'RedAmp.music.library.Store'
	],
	
	constructor: function(library, group, config){
		this.library = library;
		this.callParent([library.getEl(), group, config]);
	},
	
	getDragData: function(e) {
        var view = this.library,
			dragData = {},
            item = null,
			artist = null,
			records = []
		//Look for a data view item
		item = e.getTarget(".library-artist");
		
		//If item is still null return
		if(item == null){
			return;
		}
		
		//Get the records
		artist = this.library.getArtistByEl(item);
		records = RedAmp.music.library.Store.getByArtist(artist.record.get('artist'));
		
		//Create the node
		var clone = item.cloneNode(true);
		clone.id = Ext.id();
		dragEl = Ext.get(clone);
		dragEl.addCls('drag');
		dragEl.addCls('library-artist-drag');
		
		//Setup the drag data
		Ext.apply(dragData, {
			event: new Ext.EventObjectImpl(e),
			item: item,
			artist: artist,
			records: records.items,
			el: dragEl
		});
		
		//return the data
		return dragData;
    }
});
