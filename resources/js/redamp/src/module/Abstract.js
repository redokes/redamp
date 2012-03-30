/**
 * Abstract module class
 * @extends Ext.util.Observable
 */
Ext.define('RedAmp.module.Abstract', {
	extend:'Ext.util.Observable',
	
	//Config
	
	/**
	 * @type String
	 * @property name name
	 */
	name: null,
	
	/**
	 * @type Boolean
	 * @property active Is this module active or not
	 */
	active: false,
	
	/**
	 * @type Retickr.Application
	 * @property application reference to the application object
	 */
	application: false,
	
	
	constructor: function(){
		this.callParent(arguments);
		
		//Make sure there is a name
		if(this.name == null){
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
	},
	
	/**
     * Register an application with this module
     * @param {Application} application
     */
	register: function(application){
		if(this.active){
			return false;
		}
		this.application = application;
		if(!this.active){
			this.init();
			this.active = true;
		}
		
		//Register the module with the application
		this.application.registerModule(this);
	},
	
	init: function(){}
});