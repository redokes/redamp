Ext.define('RedAmp.user.Menu', {
	extend: 'Ext.panel.Panel',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initFolderSelect();
		this.initFolderView();
	},
	
	initFolderSelect: function(){
		this.folder = Ext.create('RedAmp.form.field.Folder', {
			scope: this,
			fieldLabel: 'Share',
			labelWidth: 70
		});
		this.items.push(new Ext.container.Container({
			padding: 10,
			items:[this.folder]
		}));
	},
	
	initFolderView: function(){
		this.folderView = Ext.create('RedAmp.user.view.Folders', {
			scope: this
		});
		this.items.push(this.folderView);
		
		//Listeners
		this.folder.on('select', function(folder, field, event){
			this.folderView.store.add({
				text: this.folder.getDirectory()
			});
		}, this);
	}
});

