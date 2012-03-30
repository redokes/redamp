Ext.define('RedAmp.music.playlist.DropZone', {
    extend: 'Ext.dd.DropZone',
	playlist: false,

    constructor: function(playlist, config) {
        this.playlist = playlist;
		this.callParent([this.playlist.getEl(), config]);
		this.tempEl = Ext.get(Ext.core.DomHelper.createDom({
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
    },
	
	getTargetFromEvent: function(e) {
		var target = e.getTarget(this.playlist.getItemSelector());
		if(target == null){
			target = this.playlist.getEl();
		}
		return target;
	},
	
	dragEnd: function(){
		Ext.getBody().appendChild(this.tempEl);
		this.tempEl.hide();
	},
	
	onNodeOver: function(target, dd, event, data){
		if(target == this.playlist.getEl()){
			return Ext.dd.DropZone.prototype.dropAllowed;
		}
		target = Ext.get(target);
		
		var top = target.getY();
		var half = top + (target.getHeight() / 2);
		var xy = event.getXY();
		var record = this.playlist.getRecord(target);
		var index = this.playlist.getStore().indexOf(record);

		//Add the tempEl
		target.appendChild(this.tempEl);

		if(xy[1] > half){
			data.index = index+1;
			this.tempEl.set({
				style:{
					top: 'auto',
					bottom: '-6px'
				}
			});
		}
		else{
			data.index = index;
			this.tempEl.set({
				style:{
					bottom: 'auto',
					top: '-6px'
				}
			});
		}
        return Ext.dd.DropZone.prototype.dropAllowed;
	},
	
	onNodeDrop : function(target, dd, event, data){
		if(dd == this.playlist.dragZone){
			return this.handleInternalDrop(target, dd, event, data);
		}
		else{
			return this.handleExternalDrop(target, dd, event, data);
		}
		
	},
	
	handleInternalDrop: function(target, dd, event, data){
		var records = data.records;
		if(data.index == null){
			return false;
		}
		this.playlist.getStore().remove(records);
		this.playlist.getStore().insert(data.index, records);
	},
	
	handleExternalDrop: function(target, dd, event, data){
		//Make copies of the records
		var records = [];
		Ext.each(data.records, function(record){
			var copy = record.copy();
			Ext.data.Model.id(copy);
			records.push(copy);
		}, this);
		
		//Insert the records
		if(data.index != null){
			this.playlist.getStore().insert(data.index, records);
		}
		else{
			this.playlist.getStore().add(records);
		}
	}
});

