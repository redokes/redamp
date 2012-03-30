Ext.define('RedAmp.System', {
	extend: 'Lapidos.os.OS',
	requires: [
		'RedAmp.shell.Shell'
	],
	
	modules:[
		//'RedAmp.stream.Stream',
		'RedAmp.music.module.Music',
		//'RedAmp.lastfm.LastFm',
		
		//Sources
		//'RedAmp.source.local.Local'
	],
	
	singleton: true,
	init: function(){
		this.callParent(arguments);
	},
	
	initShell: function(){
		this.shell = new RedAmp.shell.Shell(this);
	},
	
	onBoot: function() {
		this.callParent(arguments);
		this.initModules();
	},
	
	initModules: function() {
		Ext.require(this.modules, function() {
			this.getModuleManager().register(this.modules);
			this.getModuleManager().getInstance('music').launch();
		}, this);
	}
});