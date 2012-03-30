Ext.define('RedAmp.music.playlist.Toolbar', {
	extend:'Ext.toolbar.Toolbar',
	
	//Config
	vertical: true,
	playlist: null,
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTrash();
		this.initDropZone();
	},
	
	initTrash: function(){
		this.trashButton = new Ext.button.Button({
			scope: this,
			iconCls: 'trash',
			scale: 'medium',
			tooltip: 'clear',
			handler: function(){
				this.playlist.clear();
			}
		});
		this.items.push(this.trashButton);
	},
	
	initDropZone: function(){
		this.on('afterrender', function(){
			new Ext.dd.DropTarget(this.trashButton.getEl(), {
				ddGroup: RedAmp.music.Music.ddGroup,
				notifyDrop: Ext.bind(function(source, event, data){
					if(!data.playlist){
						return false;
					}
					data.playlist.getStore().remove(data.records);
				}, this),
				notifyOver: Ext.bind(function(source, event, data){
					if(!data.playlist){
						return Ext.dd.DropZone.prototype.dropNotAllowed;
					}
					return 'drop-trash';
				}, this)
			});
		}, this);
	}
});