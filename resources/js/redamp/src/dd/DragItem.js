Ext.define('RedAmp.dd.DragItem', {
	extend: 'Ext.dd.DragDrop',
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	constructor: function(){
		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
	},
	
	//Config
	cloneEl: false,
	data:{},
	proxyOffset: 0,
	
	setCloneEl: function(el){
		this.cloneEl = Ext.get(el);
	},

    b4StartDrag: function(x, y) {
		var el = Ext.get(this.getEl());
		
		var cloneEl = Ext.get(this.getEl());
		if(this.cloneEl){
			cloneEl = this.cloneEl;
		}
		
		//Build the proxy
		this.proxyOffset = x - el.getX();
		this.buildProxy(cloneEl, x, y);
		this.proxy.set({
    		style: {
    			position: 'absolute',
    			'z-index': 100000
    		}
    	});
		
    	Ext.getBody().appendChild(this.proxy);
	},
	
	/**
     * Overwrite this function for a custom drag proxy
	 * @param {Ext.Element} el the element that is being dragged
     */
	buildProxy: function(el){
		this.proxy = el.dom.cloneNode(true);
    	this.proxy.id = '';
    	this.proxy = Ext.get(this.proxy);
		this.proxy.addCls('x-proxy');
    	
    	this.proxy.set({
    		style: {
    			position: 'absolute',
    			'z-index': 100000,
    			width: el.getWidth() + 'px'
    		}
    	});
	},
	
	startDrag: function(){
		this.fireEvent('dragstart', this);
	},
	endDrag: function(){
		this.fireEvent('dragend', this);
	},
	onDrag: function(event){
		var xy = event.getXY();
		var x = xy[0] - this.proxyOffset;
		var y = xy[1] + 1;
		this.proxy.setLocation(x, y);
	},
	onDragEnter: function(event, id){
		var target = Ext.dd.DragDropManager.getDDById(id);
		if(target.notifyEnter != null){
			target.notifyEnter(this, event);
			this.fireEvent('dragenter', this, target, event);
		}
	},
	onDragOver: function(event, id){
		var target = Ext.dd.DragDropManager.getDDById(id);
		if(target.notifyOver != null){
			target.notifyOver(this, event);
			this.fireEvent('dragover', this, target, event);
		}
	},
	onDragOut: function(event, id){
		var target = Ext.dd.DragDropManager.getDDById(id);
		if(target.notifyOut != null){
			target.notifyOut(this, event);
			this.fireEvent('dragout', this, target, event);
		}
	},
	onDragDrop: function(event, id){
		var target = Ext.dd.DragDropManager.getDDById(id);
		if(target.notifyDrop != null){
			this.dropResponse = target.notifyDrop(this, event);
			this.fireEvent('dragdrop', this, target, event);
		}
	},
	onMouseUp: function(){
		if(Ext.get(this.proxy) == null){
			return false;
		}
		
		this.proxy.fadeOut({
			scope: this,
			callback: function(){
				this.proxy.remove();
			}
		});
		
		this.fireEvent('dragend', this);
	}
});