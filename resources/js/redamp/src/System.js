Ext.define('RedAmp.System', {
	extend: 'Lapidos.os.OS',
	requires: [
		'RedAmp.shell.Shell'
	],
	
	modules:[
		//'RedAmp.stream.Stream',
		'RedAmp.music.module.Music',
		'RedAmp.lastfm.module.Settings',
		
		//Sources
		'RedAmp.source.local.module.Local',
		
		//Settings
		'RedAmp.about.module.About',
		'RedAmp.settings.module.Settings'
	],
	
	singleton: true,
	init: function(){
		this.callParent(arguments);
		this.initStore();
	},
	
	initShell: function(){
		this.shell = new RedAmp.shell.Shell(this);
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			scope: this,
			fields:[
				'key',
				'value'
			],
			proxy: {
				type: 'localstorage',
				id  : 'redamp-store'
			}
		});
		this.store.on('load', function(){
			console.log(arguments);
		}, this);
		this.store.load();
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