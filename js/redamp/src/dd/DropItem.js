Ext.define('RedAmp.dd.DropItem', {
	extend: 'Ext.dd.DropTarget',
	
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	constructor: function(){
		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
		return this;
	},
	
	notifyEnter: function(source, event, data){
		this.fireEvent('dragenter', this, source, event, data);
	},
	notifyOut: function(source, event, data){
		this.fireEvent('dragout', this, source, event, data);
	},
	notifyOver: function(source, event, data){
		this.fireEvent('dragover', this, source, event, data);
	},
    notifyDrop: function(source, event){
		this.fireEvent('dragdrop', this, source, event);
    }
});