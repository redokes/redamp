Ext.define('RedAmp.music.dd.Artist', {
	extend: 'Ext.dd.DragDrop',
	
	requires:[
		'RedAmp.music.library.Store'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	dragEl: null,
	dragData: {},
	
	constructor: function(el, group, artist, config){
		this.artist = artist;
		this.callParent([el, group, config]);
		this.ignoreSelf = true;
		this.isTarget = false;
		this.dragData = {};
	},
	
	getDragData: function(event){
		var records = RedAmp.music.library.Store.getByArtist(this.artist.record.get('artist'));
		Ext.apply(this.dragData, {
			records: records.items
		});
		return this.dragData;
	},
	
	onMouseDown: function(event){
		var clone = this.getEl().cloneNode(true);
		clone.id = Ext.id();
		this.dragEl = Ext.get(clone);
		this.dragEl.addCls('drag');
		this.dragEl.addCls('library-artist-drag');
		this.dragEl.setOpacity(0);
		this.dragEl.set({
			style:{
				position: 'absolute',
				top: '-20000px',
				left: '0px',
				'z-index': 10000
			}
		});
		this.dragIcon = Ext.get(Ext.DomHelper.append(this.dragEl, {
			tag: 'div',
			cls: 'dd-notify-icon'
		}));
		
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
	
	onDragEnter: function(el, dropId){
		var dropItem = Ext.dd.DragDropManager.getDDById(dropId);
		var legal = Ext.dd.DragDropManager.isLegalTarget(this, dropItem);
		var target = dropItem.isTarget || false;
		
		//If this is a legal target
		if(target && legal){
			this.dragIcon.setOpacity(0);
			this.dragIcon.addCls('ok');
			this.dragIcon.animate({
				to:{
					opacity: 1
				},
				duration: 500
			});
		}
		
		//Notify drop item
		dropItem.notifyEnter(this, event, this.dragData);
	},
	
	onDragOver: function(event, dropId){
		var dropItem = Ext.dd.DragDropManager.getDDById(dropId);
		
		//Notify drop item
		dropItem.notifyOver(this, event, this.dragData);
	},
	
	onDragOut: function(){
		this.dragIcon.animate({
			scope: this,
			to:{
				opacity: 0
			},
			duration: 500,
			callback: function(){
				this.dragIcon.removeCls('ok');
			}
		});
	},
	
	onDragDrop: function(event, dropId){
		var dropEl = Ext.dd.DragDropManager.getDDById(dropId);
		if(Ext.isDefined(dropEl.notifyDrop)){
			dropEl.notifyDrop(this, event, this.getDragData());
		}
	}
});