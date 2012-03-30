Ext.define('RedAmp.user.view.Folders', {
	extend: 'Ext.view.View',

	//Config
    itemSelector: 'div.shared-folder',
    emptyText: 'No shared folders',
	deferEmptyText: false,

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
			fields: [
				'text'
			],
			data: []
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="shared-folder">{text}</div>',
			'</tpl>'
		);
	}
});