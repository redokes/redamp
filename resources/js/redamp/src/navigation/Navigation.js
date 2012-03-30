/**
 *
 */
Ext.define('RedAmp.navigation.Navigation', {
	extend:'Ext.panel.Panel',
	
	//Config
	layout: {
		type: 'accordion',
		multi: true
	},
	unstyled: true,
	
	constructor: function(application, config){
		this.application = application;
		return this.callParent([config]);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initNavigationStore();
	},
	
	initNavigationStore: function(){
		this.navigationStore = new Ext.data.Store({
			scope: this,
			fields:[
				'moduleName',
				'module',
				'menuItem',
				'parentRecord'
			]
		});
	},
	
	addMainMenuItem: function(module, config){
		if(config == null){
			config = {};
		}
		
		//Create the menu item
		var mainMenuItem = this.add(Ext.apply(config, {
			module: module,
			title: module.title,
			layout: 'anchor',
			border: false,
			//frame: true,
			//margin: 2,
			defaults:{
				anchor: '100%'
			}
		}));
		
		//Add to the store
		var records = this.navigationStore.add({
			moduleName: module.getModuleName(),
			module: module,
			menuItem: mainMenuItem
		});
		
		//Attach the record to the menuItem
		mainMenuItem.record = records[0];
		
		//Create the sub menu item button
		var subMenuItem = this.addSubMenuItem(module, module, {
			text: module.navigationTitle
		});
		
		//Return the main panel and the sub menu item
		return{
			panel: mainMenuItem,
			button: subMenuItem
		};
	},
	
	addSubMenuItem: function(subModule, module, config){
		//Check if the record exists
		var record = this.navigationStore.findRecord('moduleName', subModule.getModuleName());
		if(record == null){
			return false;
		}
		
		//get the sub navigation
		var menuItem = record.get('menuItem');
		var subMenuItem = menuItem.add(Ext.create('RedAmp.navigation.Item', Ext.apply(config, {
			module: module,
			margin: 2,
			//ui: '',
			enableToggle: true,
			toggleGroup: 'application-sub-navigation',
			allowDepress: false
		})));
		subMenuItem.on('click', this.onSubMenuItemClick, this);
		module.on('initview', function(module, view, options){
			this.onSubMenuItemClick(options.menuItem);
			view.on('show', function(panel, options){
				this.onSubMenuItemClick(options.menuItem);
			}, this, {menuItem: options.menuItem});
		}, this, {menuItem: subMenuItem});
		
		//Add to the store
		var records = this.navigationStore.add({
			moduleName: module.getModuleName(),
			module: module,
			menuItem: subMenuItem,
			parentRecord: record
		});
		
		//Attach the record to the menuItem
		subMenuItem.record = records[0];
		
		//Return the button
		return subMenuItem;
	},
	
	setActiveSubNavigation: function(subNavigation){
		this.subNavigationContainer.getLayout().setActiveItem(subNavigation);
	},
	
	onSubMenuItemClick: function(item){
		//get the record from the item
		var record = item.record;
		var parentRecord = record.get('parentRecord');
		
		//Expand the parent container
		parentRecord.get('menuItem').expand();
		
		//make sure the item is pressed
		item.toggle(true);
		
		//Show the view
		record.get('module').initView();
	}
});