Ext.define('RedAmp.user.view.User', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'border',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		console.log('init user');
		this.initTree();
		this.initFolderSelect();
	},
	
	initTree: function(){
		this.tree = Ext.create('RedAmp.user.view.Tree', {
			scope: this,
			region: 'center'
		});
		this.items.push(this.tree);
	},
	
	initFolderSelect: function(){
		this.folderSelect = Ext.create('RedAmp.form.field.Folder', {
			scope: this,
			width: 60,
			buttonText: 'Add Library'
		});
		
		//Chain events
		//this.fireEvent('select', this, this.fileInputEl, e);
		this.folderSelect.on('select', function(field, inputEl, event, options){
			this.fireEvent('select', field, inputEl, event);
		}, this);
		if(!this.tree.isRemote()){
			this.tree.toolbar.add(this.folderSelect);
		}
	}
	
});