/**
 * @extends Ext.container.Viewport
 * @singleton
 */
Ext.define('RedAmp.Application', {
	extend: 'Ext.container.Viewport',
    singleton: true,
	
	//Requires
	requires:[
		'RedAmp.stream.Stream',
		'RedAmp.music.Music',
		'RedAmp.lastfm.LastFm',
		
		//Sources
		'RedAmp.source.local.Local'
	],
	
	///////////////////////////////////////////////////
	//	Config
	///////////////////////////////////////////////////
	
	/**
	 * @cfg {Array} modules an array of module class names to load with this application
	 */
	modules:[
		'RedAmp.stream.Stream',
		'RedAmp.music.Music',
		'RedAmp.lastfm.LastFm',
		
		//Sources
		'RedAmp.source.local.Local'
	],
	
	layout: 'border',
	_modules: {},
	
	//User Config
	userData: null,
	
	constructor: function(){
		//Empty objects and arrays
		this.userData = null;
		this._modules = {};
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//////////////////////////////////////////////////////////////////////
	//	Init Functions
	/////////////////////////////////////////////////////////////////////
	init: function(){
		
		//Add events
		this.addEvents(
			/**
			 * @event registemodule
			 * Fires when the module has been registered with this application.
			 * @param {Application} the application that the module was registered to
			 * @param {String} name the name of the module that was registered
			 * @param {Module} module the module that was registered
			 */
			'registermodule'
		);
		
		//Init ext items
		this.initExt();
		
		//Init the cookie provider
		this.initCookieProvider();
		
		//Init the regions
		this.initNorth();
		this.initSouth();
		this.initEast();
		this.initWest();
		this.initCenter();
		
		//Init the socket client
		//this.initSocketClient();
		
		//Init the modules
		this.initModules();
		
		//Show the tasks
		this.on('afterrender', function(){
			//this.initLocation();
			this.onModuleReady('stream', function(stream){
				stream.show();
			}, this);
		}, this);
	},
	
	initModules: function(){
		Ext.each(this.modules, function(module){
			moduleClass = eval(module);
			if(moduleClass.singleton == null || moduleClass.singleton == false){
				console.error(module + " is not a singleton and therefore will not be loaded");
				return;
			}
			//Register module
			moduleClass.register(this);
		}, this);
	},
	
	initLocation: function(){
		var parts = decodeURI(location.href).split("#");
		if(parts.length == 2){
			Ext.History.fireEvent('change', parts[1]);
		}
		else{
			Ext.History.fireEvent('change', null);
		}
	},
	
	initExt: function(){
		//Init Quicktips
		Ext.tip.QuickTipManager.init();
		
		//Prototype the field to always show the msgTarget on the side
		Ext.form.field.Base.prototype.msgTarget = 'side';
		
		return;
		
		//History
		Ext.History.init();
		Ext.History.Delimiter = '/';
		Ext.History.parseToken = function(token){
			if(token != null){
				return token.split(Ext.History.Delimiter);
			}
			return [];
		};
		Ext.History.on('change', function(token){
			var location = Ext.History.parseToken(token);
			if(!location.length){
				this.getModule('task').show();
			}
			
			if(location.length == 1){
				var module = location[0];
				this.onModuleReady(module, function(module){
					if(module.getView() != this.getActive()){
						module.show();
					}
				}, this);
			}
		}, this);
	},
	
	initCookieProvider: function(){
		this.cookieProvider = Ext.create('Ext.state.CookieProvider', {
		});
		Ext.state.Manager.setProvider(this.cookieProvider);
	},
	
	initSocketClient: function() {
		this.socketClient = Ext.create('Redokes.socket.client.Client', {
			url:'http://' + location.hostname,
			port: '8080'
		});
	},
	
	initNorth: function(){
		this.north = new Ext.panel.Panel({
			region: 'north',
			unstyled: true,
			border: false
		});
		this.items.push(this.north);
	},
	
	initSouth: function(){
		
	},
	
	initEast: function(){
		return;
		this.east = Ext.create('Ext.panel.Panel', {
			width: 250,
			split: true,
			collapsible: true,
			titleCollapse: true,
			header: false,
			region: 'east',
			layout: 'fit',
			border: false
		});
		this.items.push(this.east);
	},
	
	initWest: function(){
		return;
		this.west = Ext.create('RedAmp.navigation.Navigation', this, {
			width: 200,
			region: 'west'
		});
		this.items.push(this.west);
	},
	
	initCenter: function(){
		this.center = new Ext.tab.Panel({
			region: 'center',
			tabPosition: 'bottom',
			autoScroll: true
		});
		this.items.push(this.center);
	},
	
	
	//////////////////////////////////////////////////////////////////////
	//	Module Functions
	/////////////////////////////////////////////////////////////////////
	
	/**
     * Register a module with this application
     * @param {Module} module
     */
	registerModule: function(module){
		if(module.name != null){
			this._modules[module.name] = module;
			this.fireEvent('registermodule', this, module.name, module);
		}
	},
	
	/**
     * A special listener/function that allows you to listen for when a module is ready. Much like Ext.onReady
     * @param {String} name Name of the module to listen for
     * @param {Function} callback Function to run when the view is ready
	 * @param {Object} scope Scope to run the callback function in
	 * @param {Object} options Any additional options to pass to the callback function
     */
	onModuleReady: function(name, callback, scope, options){
		if(scope == null){
			scope = this;
		}
		if(options == null){
			options = {};
		}
		
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
	
	//////////////////////////////////////////////////////////////////////
	//	Accessors
	/////////////////////////////////////////////////////////////////////
	getCookieProvider: function(){
		return this.cookieProvider;
	},
	
	/**
     * Gets a module by its name, or false if no module was found
	 * @return {Module/Boolean} module
     */
	getModule: function(name){
		if(this._modules[name] != null){
			return this._modules[name];
		}
		return false;
	},
	
	/**
     * Gets the active panel of the application
	 * @return {Ext.component.Compnent} item
     */
	getActive: function(){
		return this.getCenter().getActiveTab();
	},
	
	/**
     * Gets the north panel of the applications interface
	 * @return {Ext.panel.Panel} panel
     */
	getNorth: function(){
		return this.north;
	},
	
	/**
     * Gets the south panel of the applications interface
	 * @return {Ext.panel.Panel} panel
     */
	getSouth: function(){
		return this.south;
	},
	
	/**
     * Gets the east panel of the applications interface
	 * @return {Ext.panel.Panel} panel
     */
	getEast: function(){
		return this.east;
	},
	
	/**
     * Gets the west panel of the applications interface
	 * @return {Ext.panel.Panel} panel
     */
	getWest: function(){
		return this.west;
	},
	
	/**
     * Gets the center panel of the applications interface
	 * @return {Ext.panel.Panel} panel
     */
	getCenter: function(){
		return this.center;
	},
	
	/**
     * Gets the navigation panel of the application
	 * @return {Ext.panel.Panel} panel
     */
	getNavigation: function(){
		return this.west;
	},
	
	getSocketClient: function() {
		return this.socketClient;
	},
	
	//////////////////////////////////////////////////////////////////////
	//	Mutators
	/////////////////////////////////////////////////////////////////////
	
	/**
     * Sets the applications active screen to the passed in item
	 * @param {Ext.component.Component} item
     */
	setActive: function(item){
		this.getCenter().setActiveTab(item);
	},
	
	//////////////////////////////////////////////////////////////////////
	//	Utility Functions
	/////////////////////////////////////////////////////////////////////
	
	/**
     * Adds a javascript file to the dom
	 * @param {String} src path to the file
     */
	addJs: function(src) {
		var needToAdd = true;
		Ext.select('script').each(function(el) {
			if (el.dom.src.replace(src, '') != el.dom.src) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'script',
				type:'text/javascript',
				src:src
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	/**
     * Adds a css file to the dom
	 * @param {String} href path to the file
     */
	addCss: function(href) {
		var needToAdd = true;
		Ext.select('link').each(function(el) {
			if (el.dom.href.replace(href, '') != el.dom.href) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'link',
				type:'text/css',
				rel: 'stylesheet',
				href:href
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	/**
	 * Add a level to the history stack
	 * @param {String} module
	 * @param {String} view
	 * @param {String/Array} info
	 */
	addHistory: function(module, view, info){
		if(typeof info == 'string'){
			info = [info];
		}
		var str = module;
		if(view != null){
			str += Ext.History.Delimiter + view + Ext.History.Delimiter
		}
		if(info != null){
			str += info.join(Ext.History.Delimiter);
		}
		Ext.History.add(str);
	}
});
