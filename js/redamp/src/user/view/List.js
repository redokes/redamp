Ext.define('RedAmp.user.view.List', {
	extend: 'Ext.view.View',
	
	requires:[
		'RedAmp.model.User'
	],

	//Config
    itemSelector: 'div.user-item',
	application: null,
	module: null,

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
		//this.initUsers();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			scope: this,
			model: 'RedAmp.model.User'
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="user-item">{name}</div>',
			'</tpl>'
		);
	},
	
	initUsers: function(){
		this.application.getSocketClient().socket.emit('getRemoteUsers', {}, Ext.bind(function(response){
			Ext.each(response.sockets, function(socket){
				this.store.add({
					name: socket.id,
					id: socket.id
				});
			}, this);
		}, this));
	}
});