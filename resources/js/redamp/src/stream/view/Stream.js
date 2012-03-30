Ext.define('RedAmp.stream.view.Stream', {
	extend: 'Ext.view.View',
	
	//Requires
	requires:[
		'RedAmp.model.Stream'
	],

	//Config
    itemSelector: 'div.view-item',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			scope: this,
			model: 'RedAmp.model.Stream'
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="view-item">{text}</div>',
			'</tpl>'
		);
	},
	
	addMessage: function(record){
		return this.store.add(record);
	}
});