Ext.define('RedAmp.dd.DragZone', {
	extend: 'Ext.dd.DragDrop',
	
	requires:[
		'RedAmp.music.library.Store'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	proxyCls: '',
	proxy: null,
	ddel: null,
	dragData: {},
	
	constructor: function(el, group, config){
		Ext.apply(this, config || {});
		this.initProxy();
		this.initIconEl();
		this.initDDel();
		this.dragData = {};
		
        if (el) {
            this.init(el, group, {
				moveOnly: true,
				isTarget: false,
				ignoreSelf: true
			});
        }
	},
	
	applyConfig: function() {
		this.callParent(arguments);
		this.setDragElId(this.proxy.dom.id);
    },
	
	initProxy: function(){
		this.proxy = Ext.get(Ext.DomHelper.append(Ext.getBody(), {
			tag: 'div',
			cls: this.proxyCls,
			style:{
				position: 'absolute',
				top: '-20000px',
				left: '0px',
				'z-index': 10000
			}
		}));
		this.proxy.setOpacity(0);
	},
	
	initIconEl: function(){
		this.iconEl = Ext.get(Ext.DomHelper.append(this.proxy, {
			tag: 'div',
			cls: 'dd-notify-icon'
		}));
	},
	
	initDDel: function(){
		this.ddel = Ext.get(Ext.DomHelper.append(this.proxy, {
			tag: 'div'
		}));
	},
	
	getDragData: function(event){
		
	},
	
	onMouseDown: function(event){
		//Get the drag data
		this.dragData = this.getDragData(event) || {};
		
		//Append el to dragEl if one exists
		if(!Ext.isEmpty(this.dragData.el)){
			this.ddel.update('');
			this.ddel.appendChild(this.dragData.el);
		}
		else{
			return;
		}
		
		//Show the proxy
		this.proxy.setXY(event.getXY());
		this.proxy.animate({
			to:{
				opacity: 1
			}
		});
	},
	
	onMouseUp: function(){
		this.proxy.animate({
			scope: this,
			to:{
				opacity: 0
			},
			callback: function(){
			}
		});
		this.iconEl.removeCls('ok');
		this.dragData = {};
	},
	
	onDrag: function(event){
		var xy = event.getXY();
		this.proxy.setXY([xy[0] + 10, xy[1] + 10]);
	},
	
	onDragEnter: function(el, dropId){
		var dropItem = Ext.dd.DragDropManager.getDDById(dropId);
		var legal = Ext.dd.DragDropManager.isLegalTarget(this, dropItem);
		var target = dropItem.isTarget || false;
		
		//If this is a legal target
		if(target && legal){
			this.iconEl.setOpacity(0);
			this.iconEl.addCls('ok');
			this.iconEl.animate({
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
		this.iconEl.animate({
			scope: this,
			to:{
				opacity: 0
			},
			duration: 500,
			callback: function(){
				this.iconEl.removeCls('ok');
			}
		});
	},
	
	onDragDrop: function(event, dropId){
		var dropEl = Ext.dd.DragDropManager.getDDById(dropId);
		if(Ext.isDefined(dropEl.notifyDrop)){
			dropEl.notifyDrop(this, event, this.dragData);
		}
	},
	
	hideIcon: function(){
		
	}
});