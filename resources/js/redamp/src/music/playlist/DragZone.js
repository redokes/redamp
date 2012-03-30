Ext.define('RedAmp.music.playlist.DragZone', {
    extend: 'Ext.dd.DragZone',
	
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
    containerScroll: false,
	animRepair: false,
	playlist: false,
	ddel: false,
	proxyCls: 'redamp-music-playlist-proxy',

    constructor: function(playlist, config) {
		this.playlist = playlist;
		this.callParent([this.playlist.getEl(), config]);
		this.ddel = Ext.get(document.createElement('div'));
		this.mixins.observable.constructor.call(this);
    },
	
	b4Drag: function(){
		//Hide all the records
		Ext.each(this.dragData.records, function(record){
			var node = Ext.get(this.playlist.getNode(record));
			node.setVisibilityMode(Ext.Element.DISPLAY);
			node.hide();
		}, this);
		
		//Fire an event
		this.fireEvent('beforedrag', this);
		
		//call parent
		return this.callParent(arguments);
	},
	
	onMouseUp: function(){
		//show all records
		Ext.each(this.dragData.records, function(record){
			var node = Ext.get(this.playlist.getNode(record));
			if(node != null){
				node.show();
			}
		}, this);
		
		//Fire event
		this.fireEvent('mouseup', this);
		
		//Call parent
		return this.callParent(arguments);
	},
	
    getDragData: function(e) {
        var view = this.playlist,
			dragData = {},
			isAlbum = false,
            item = null,
			selectionModel = false,
			record = null,
			nodes = [],
			records = [];
			
		//Look for a data view item
		item = e.getTarget(view.getItemSelector());
		
		//Look for an album
		if(item == null){
			item = e.getTarget(view.getAlbumSelector());
			if(item != null){
				isAlbum = true;
			}
		}
		
		//If item is still null return
		if(item == null){
			return;
		}
		
		//Setup the drag data
		Ext.apply(dragData, {
			event: new Ext.EventObjectImpl(e),
			playlist: this.playlist,
			item: item,
			ddel: this.ddel.dom
		});
		
		//Handle the drag
		if(!isAlbum){
			Ext.apply(dragData, this.onNormalDrag(dragData));
		}
		else{
			Ext.apply(dragData, this.onAlbumDrag(dragData));
		}

		//return the data
		return dragData;
    },
	
	onNormalDrag: function(dragData){
		//Get the records
		var selectionModel = this.playlist.getSelectionModel();
		var record = this.playlist.getRecord(dragData.item);
		var records = selectionModel.getSelection();
		if(!records.length){
			records.push(record);
		}
		
		//Update the drag el
		var text = '';
		if(records.length > 1){
			text = 'Moving ' + records.length + ' tracks.';
		}
		else{
			text = record.get('artist') + ' - ' + record.get('title');
		}
		this.ddel.update(text);
		
		//Return any information to drag data
		return {
			records: records
		};
	},
	
	onAlbumDrag: function(dragData){
		//Get the album header
		var albumItem = Ext.get(dragData.item);
		var albumHeader = Ext.get(albumItem.down('.playlist-album-header'));
		
		//Get the records
		var nodes = Ext.fly(dragData.item).query(this.playlist.getItemSelector());
		var records = this.playlist.getRecords(nodes);
		
		//Setup listeners
		this.on('beforedrag', function(){
			var node = Ext.get(this.dragData.item);
			node.setVisibilityMode(Ext.Element.DISPLAY);
			node.hide();
		}, this, {single: true});
		
		this.on('mouseup', function(){
			var node = Ext.get(this.dragData.item);
			if(node != null){
				node.show();
			}
		}, this, {single: true});
		
		//Update the drag el
		this.ddel.update(albumHeader.dom.innerHTML);
		
		//return any info to the drag data
		return {
			records: records
		};
	}
});
