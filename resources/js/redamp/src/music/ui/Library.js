Ext.define('RedAmp.music.ui.Library', {
	extend: 'Ext.panel.Panel',
	requires:[
		'RedAmp.music.library.artist.View'
	],
	layout: 'fit',
	autoScroll: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initToolbar();
		this.initArtistView();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar();
		this.dockedItems.push(this.toolbar);
	},
	
	initArtistView: function(){
		this.artistView = new RedAmp.music.library.artist.View();
		this.items.push(this.artistView);
	}
});