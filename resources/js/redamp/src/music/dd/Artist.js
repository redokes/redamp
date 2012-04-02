Ext.define('RedAmp.music.dd.Artist', {
	extend: 'Ext.dd.DragDrop',
	
	requires:[
		'RedAmp.music.library.Store'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	dragEl: null,
	
	constructor: function(el, group, artist, config){
		this.artist = artist;
		this.callParent([el, group, config]);
	},
	
	onMouseDown: function(event){
		var clone = this.getEl().cloneNode(true);
		clone.id = Ext.id();
		this.dragEl = Ext.get(clone);
		this.dragEl.addCls('drag');
		this.dragEl.setOpacity(0);
		this.dragEl.set({
			style:{
				position: 'absolute',
				top: '-20000px',
				left: '0px',
				'z-index': 10000
			}
		});
		
		this.dragEl.setXY(event.getXY());
		this.dragEl.animate({
			to:{
				opacity: 1
			}
		});
		Ext.getBody().appendChild(this.dragEl);
	},
	
	onMouseUp: function(){
		this.dragEl.animate({
			scope: this,
			to:{
				opacity: 0
			},
			callback: function(){
				this.dragEl.remove();
				delete this.dragEl;
			}
		});
	},
	
	onDrag: function(event){
		this.dragEl.setXY(event.getXY());
	},
	
	onDragDrop: function(event, dropId){
		var dropEl = Ext.dd.DragDropManager.getDDById(dropId);
		var records = RedAmp.music.library.Store.getByArtist(this.artist.record.get('artist'));
		dropEl.notifyDrop(this, event, {
			records: records.items
		});
	}
});