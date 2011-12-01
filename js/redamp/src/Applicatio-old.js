/**
 * Main application
 * @extends Ext.container.Viewport
 */
Ext.define('RedAmp.Application', {
	extend: 'Ext.container.Viewport',
	
	//Require Modules
	requires:[
		'RedAmp.stream.Stream',
		'RedAmp.user.User',
		'RedAmp.chat.Chat',
		'RedAmp.music.Music'
	],
	
	//Config
	processingPage: '/at-ajax/modules/util/application/',
	layout: 'border',
	modules: {},
	
	//Inits
	initComponent: function(){
		//Clear arrays and objects
		this.items = [];
		this.modules = {};
		
		//Add Events
		this.addEvents(
			'registermodule'
		);
		
		//Init the items
		this.init();
		
		//Call the parent function
		this.callParent(arguments);
	},
	
	init: function(){
		//Init Ext items
		this.initExt();
		
		//Containers
		this.initNorth();
		this.initSouth();
		this.initWest();
		this.initCenter();
		
		//Menus
		this.initMenu();
		this.initAccordion();
		
		//Init socket client
		this.initSocketClient();
		
		//Init the modules
		this.initModules();
	},
	
	initSocketClient: function() {
		this.socketClient = Ext.create('Redokes.socket.client.Client', {
			url:'http://localhost',
			port: '8080'
		});
	},
	
	getSocketClient: function() {
		return this.socketClient;
	},
	
	initModules: function(){
		RedAmp.stream.Stream.register(this);
		RedAmp.user.User.register(this);
		RedAmp.chat.Chat.register(this);
		RedAmp.music.Music.register(this);
	},
	
	initExt: function(){
		//Quicktips
		Ext.tip.QuickTipManager.init();
	},
	
	
	initNorth: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property north north panel
		 */
		this.north = new Ext.panel.Panel({
			scope: this,
			unstyled: true,
			border: false,
			hidden: true,
			region: 'north'
		});
		this.items.push(this.north);
	},
	
	getNorth: function(){
		return this.northPanel;
	},
	
	initSouth: function(){
		this.south = Ext.create('Ext.panel.Panel', {
			scope: this,
			region: 'south',
			hidden: true
		});
		this.items.push(this.south);
	},
	
	getSouth: function(){
		return this.south;
	},
	
	initWest: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property west west panel
		 */
		this.west = Ext.create('Ext.panel.Panel', {
			scope: this,
			region: 'west',
			layout: 'fit',
			width: 300,
			split: true
		});
		this.items.push(this.west);
	},
	
	/**
     * Gets the west panel
     * @return {Ext.panel.Panel} west
     */
	getWest: function(){
		return this.west;
	},
	
	initCenter: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property center center panel
		 */
		this.center = Ext.create('Ext.panel.Panel', {
			scope: this,
			region: 'center',
			layout: 'card',
			activeItem: 0,
			setActiveItem: function(item){
				this.getLayout().setActiveItem(item);
			},
			getActiveItem: function(){
				return this.getLayout().getActiveItem();
			}
		});
		this.items.push(this.center);
	},
	
	/**
     * Gets the center panel
     * @return {Ext.panel.Panel} center
     */
	getCenter: function(){
		return this.center;
	},
	
	initMenu: function(){
		this.menu = Ext.create('RedAmp.menu.Menu', {
			scope: this,
			docked: 'top'
		});
		this.west.addDocked(this.menu);
	},
	
	getMenu: function(){
		return this.menu;
	},
	
	initAccordion: function(){
		this.accordion = new Ext.panel.Panel({
			scope: this,
			layout: {
				type: 'accordion',
				multi: true
			}
		});
		this.west.add(this.accordion);
	},
	
	getAccordion: function(){
		return this.accordion;
	},

	registerModule: function(module){
		if(module.name != null){
			this.modules[module.name] = module;
			this.fireEvent('registermodule', this, module.name, module);
		}
	},
	
	getModule: function(name){
		if(this.modules[name] != null){
			return this.modules[name];
		}
		return false;
	},
	
	onModuleReady: function(name, callback, scope, options){
		if(this.getModule(name)){
			Ext.bind(callback, scope)(this.getModule(name), options);
		}
		else{
			this.on('registermodule', function(application, name, module, options){
				if(name == options.name){
					Ext.bind(options.callback, options.scope)(module, options.options);
				}
			}, this, {name: name, callback: callback, scope: scope, options: options});
		}
	},
	
	setActiveItem: function(item){
		this.getCenter().setActiveItem(item);
	},
	
	getActiveItem: function(){
		return this.getCenter().getActiveItem();
	}
});