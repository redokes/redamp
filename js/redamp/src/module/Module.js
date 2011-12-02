/**
 * @constructor
 * @param {Object} config The config object
 */
Ext.define('RedAmp.module.Module', {
	extend:'Ext.util.Observable',
	
	///////////////////////////////////////////////////
	//	Config
	///////////////////////////////////////////////////
	config: {
		/**
		 * @cfg {String} name  name of the module
		 */
		name: null,

		/**
		 * @cfg {String} title title to use for this module
		 */
		title: '',

		/**
		 * @cfg {String} navigationTitle title to use for the navigation button
		 */
		navigationTitle: '',

		/**
		 * @cfg {String} viewClass class to create when the view is created.
		 */
		viewClass: null,
		
		/**
		 * @cfg {String} viewRegion what region to add the view to
		 *  
		 *  - center
		 *  - east
		 *  - west
		 *  - north
		 *  - south
		 */
		viewRegion: 'center',

		/**
		 * @cfg {Boolean} isMainNavigationItem Should this module be automatically added to the Applications main navigation
		 * If this is set to true a navigation item will be added to the main navigation of the application using the title attribute.
		 * When the navigation button is clicked it will use the viewClass to create the view interface for the module
		 */
		isMainNavigationItem: false,

		/**
		 * @cfg {Boolean} isSubNavigationItem should this module be automatically added as a submenu item
		 * If this is set to true a navigation item will be added to the sub navigation of the application using the title attribute.
		 * When the navigation button is clicked it will use the viewClass to create the view interface for the module
		 */
		isSubNavigationItem: false,

		/**
		 * @cfg {Array} subNavigationModules Array of modules to add a menu item to, when isSubNavigationItem is set to true
		 * @cfg {String} Class name of the module to add the navigation to
		 */
		subNavigationModules: []
	},
	
	///////////////////////////////////////////////////
	//	Properties
	///////////////////////////////////////////////////
	
	/**
	 * @type Boolean
	 * @property active Is this module active or not
	 */
	active: false,
	
	/**
	 * @type TMS.Application
	 * @property application reference to the application object
	 */
	application: false,
	
	/**
	 * @property view reference to the main view of the module
	 * @type Object
	 */
	view: null,
	
	/**
	 * @type {Boolean}
	 * True if the module is in the process of creating the view
	 */
	creatingView: false,
	
	/**
	 * @type Ext.panel.Panel
	 * @property mainNavigationPanel Main navigation panel for the module, holds all the navigation buttons
	 */
	mainNavigationPanel: null,
	
	/**
	 * @type Ext.button.Button
	 * @property mainNavigationItem If this module is a main navigation item, this will be the main button
	 */
	mainNavigationItem: null,
	
	
	constructor: function(config){
		//Init the config
		this.initConfig(config);
		
		//Add events
		this.addEvents(
			/**
			 * @event activate
			 * Fires when the module has been registered with an application.
			 * @param {TMS.module.Module} module the module that was registered.
			 * @param {TMS.Application} application The application that the module was registered with.
			 */
			'activate',
			
			/**
			 * @event initview
			 * Fires when the view has been created and added to the application.
			 * @param {TMS.module.Module} module the module the view is associated with
			 * @param {Object} view the view that was created.
			 */
			'initview',
			
			/**
			 * @event show
			 * Fires when the module is the active module on the application
			 * @param {TMS.module.Module} module the module that is active.
			 */
			'show'
		);
		
		//Make sure there is a name
		if(this.name == null){
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
		
		//Call the parent
		return this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){},
	baseInit: function(){
		//this.initNavigation();
		//this.initSubNavigation();
		this.initView();
	},
	
	initNavigation: function(){
		if(!this.isMainNavigationItem || !this.title.length || !this.navigationTitle.length){
			return;
		}
		
		var navObject = this.getApplication().getNavigation().addMainMenuItem(this);
		this.mainNavigationPanel = navObject.panel;
		this.mainNavigationItem = navObject.button;
	},
	
	initSubNavigation: function(){
		if(!this.isSubNavigationItem || !this.title.length || !this.subNavigationModules.length){
			return;
		}
		
		Ext.each(this.subNavigationModules, function(module){
			this.getApplication().onModuleReady(module, function(module){
				this.getApplication().getNavigation().addSubMenuItem(module, this, {
					text: this.navigationTitle || this.title
				});
			}, this);
		}, this);
	},
	
	initView: function(){
		//If no viewClass is set return
		if(this.viewClass == null){
			return;
		}
		
		//Create the view if it hasnt already been created
		if(this.view == null && !this.creatingView){
			this.creatingView = true;
			var region = this.viewRegion.charAt(0).toUpperCase() + this.viewRegion.slice(1);
			var regionPanel = this.getApplication()['get' + region]();
			regionPanel.setLoading(true);
			
			//Load the view class
			Ext.require(this.viewClass, function(){
				//create the view and add to center
				this.view = Ext.create(this.viewClass, {
					title: this.title
				});
				
				//Set up show event
				this.view.on('show', function(){
					//Fire the show event
					this.fireEvent('show', this);
				}, this);
				
				//Fire the init view event
				this.fireEvent('initview', this, this.getView());
				
				//Add the view to the applications center
				regionPanel.add(this.getView());
				regionPanel.setLoading(false);
				
				//Set creating view to false
				this.creatingView = false;
				
				//Set the view active
				this.setViewActive();
				
			}, this);
		}
		else if(!this.creatingView){
			this.setViewActive();
		}
	},
	
	///////////////////////////////////////////////////
	//	Methods
	///////////////////////////////////////////////////
	
	/**
     * Register an application with this module
     * @param {TMS.Application} application
     */
	register: function(application){
		if(this.active){
			return false;
		}
		this.application = application;
		if(!this.active){
			this.active = true;
			this.baseInit();
			this.init();
		}
		
		//Register the module with the application
		this.application.registerModule(this);
		
		//Call the onRegister function
		this.onRegister(this.application);
		
		//Fire the active event
		this.fireEvent('activate', this, this.getApplication());
	},
	
	/**
     * Set this modules view to the applications active view. Only applies if a {@link #viewClass view class} is set.
     */
	show: function(){
		this.initView();
	},
	
	setViewActive: function(){
		//Check if this view is in the center region
		if(this.viewRegion !== 'center'){
			return;
		}
		
		//Add history to the application
		this.getApplication().addHistory(this.getModuleName());
		
		//Set the view to active
		this.getApplication().setActive(this.getView());
	},
	
	/**
     * If true, this module is active and has been registered with an application
	 * @return {Boolean} active
     */
	isActive: function(){
		return this.active;
	},
	
	///////////////////////////////////////////////////
	//	Events
	///////////////////////////////////////////////////
	
	/**
     * Overwrite this method to run code when the module gets registered with an application
     * @param {TMS.Application} application
     */
	onRegister: function(application){},
	
	
	/**
     * A special listener/function that allows you to listen for when the view has been created. Much like Ext.onReady
     * @param {Function} callback Function to run when the view is ready
	 * @param {Object} scope Scope to run the callback function in
	 * @param {Object} options Any additional options to pass to the callback function
     */
	onViewReady: function(callback, scope, options){
		if(scope == null){
			scope = this;
		}
		if(options == null){
			options = {};
		}
		
		if(this.view != null){
			Ext.bind(callback, scope)(this, this.getView(), options);
		}
		else{
			this.on('initview', function(module, view, options){
				Ext.bind(options.callback, options.scope)(this, this.getView(), options.options);
			}, this, {single: true, callback: callback, scope: scope, options: options});
		}
	},
	
	///////////////////////////////////////////////////
	//	Accessors
	///////////////////////////////////////////////////
	
	/**
     * Returns the application this module is registered with, or false if the module has not been registered
	 * @return {TMS.Application/Boolean} application
     */
	getApplication: function(){
		if(this.isActive()){
			return this.application;
		}
		return false;
	},
	
	/**
     * A helper function that tries to find a module that has been registered with the application.
     * @param {String} name The name of the module we are searching for
	 * @return {TMS.module.Module/Boolean} module
     */
	getModule: function(name){
		if(this.isActive()){
			return this.application.getModule(name);
		}
		return false;
	},
	
	/**
     * Returns the {@link #name name} of this module
	 * @return {String} name
     */
	getModuleName: function(){
		return this.name;
	},
	
	/**
     * Gets the {@link #viewClass view} associated with this module.
	 * @return {Object/Boolean} view
     */
	getView: function(){
		if(this.view != null){
			return this.view;
		}
		return false;
	},
	
	/**
     * Gets the main navigation button that was created with this module. 
	 * Will only return a button if {@link #isMainNavigationItem isMainNavigationItem} was set to true
	 * @return {TMS.button.Badge/Boolean} button
     */
	getMainNavigationItem: function(){
		if(this.mainNavigationItem != null){
			return this.mainNavigationItem;
		}
		return false;
	}
});