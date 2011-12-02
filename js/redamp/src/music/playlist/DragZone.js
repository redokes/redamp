Ext.define('RedAmp.music.playlist.DragZone', {
    extend: 'Ext.dd.DragZone',
    containerScroll: false,
	animRepair: false,
	
	playlist: false,
	ddel: false,
	proxyCls: 'redamp-music-playlist-proxy',

    constructor: function(playlist, config) {
		this.playlist = playlist;
		this.callParent([this.playlist.getEl(), config]);
		this.ddel = Ext.get(document.createElement('div'));
    },
	
    getDragData: function(e) {
        var view = this.playlist,
            item = e.getTarget(view.getItemSelector()),
			selectionModel = false,
			record = null,
			records = [];
			
		//If no item exists just return
		if(!item){
			return;
		}
		
		//Get the records
		record = this.playlist.getRecord(item);
		selectionModel = view.getSelectionModel();
		records = selectionModel.getSelection();
		
		if(!records.length){
			records.push(record);
		}
		
		//Create the data
		var dragData = {
			event: new Ext.EventObjectImpl(e),
			view: view,
			item: item,
			ddel: this.ddel.dom,
			records: records
		};
		
		//Create the ddel
		this.updateDragEl(dragData);
		
		
		//return the data
		return dragData;
    },
	
	updateDragEl: function(dragData){
		this.ddel.update('reorder');
	}
});
