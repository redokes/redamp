Ext.define('RedAmp.music.playlist.Item', {
	extend:'Ext.util.Observable',
	
	view: false,
	el: false,
	record: false,
	
	//Inits
	constructor: function(view, record, config){
		this.view = view;
		this.record = record;
		this.el = Ext.get(this.view.getNode(this.record));
		this.initConfig(config);
		this.callParent(config);
		this.init();
		return this;
	},
	
	init: function(){
		this.initElements();
		this.initDragDrop();
	},
	
	initElements: function(){
		
	},
	
	initDragDrop: function(){
		return;
		var drag = Ext.create('RedAmp.dd.DragItem', this.el.id);
		var drop = Ext.create('RedAmp.dd.DropItem', this.el.id);
		drag.on('dragstart', function(){
			this.el.setVisibilityMode(Ext.Element.DISPLAY);
			this.el.hide();
			drag.tempEl = Ext.get(Ext.core.DomHelper.createDom({
				tag: 'div',
				style:{
					position: 'absolute',
					top: '-3px',
					left: '0px',
					'z-index': 100,
					'border-color': 'transparent transparent transparent black',
					'border-style': 'solid',
					'border-width': '6px',
					'height': '0px',
					'width': '0px'
				}
			}));
		}, this);
		drag.on('dragover', function(dragItem, dropItem, event){
			var top = dropItem.el.getY();
			var half = top + (dropItem.el.getHeight() / 2);
			var xy = event.getXY();
			var record = this.view.getRecord(dropItem.el);
			var index = this.view.store.indexOf(record);
			
			//Add the tempEl
			dropItem.el.appendChild(drag.tempEl);
			
			if(xy[1] > half){
				drag.index = index+1;
				drag.tempEl.set({
					style:{
						top: 'auto',
						bottom: '-6px'
					}
				});
			}
			else{
				drag.index = index;
				drag.tempEl.set({
					style:{
						bottom: 'auto',
						top: '-6px'
					}
				});
			}
		}, this);
		drag.on('dragdrop', function(dragItem, dropItem, event){
			this.view.store.remove(this.record);
			this.view.store.insert(drag.index, this.record);
		}, this);
		drag.on('dragend', function(){
			drag.tempEl.remove();
			this.el.show();
			delete drag.index;
		}, this);
	}
});