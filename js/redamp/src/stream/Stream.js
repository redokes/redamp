Ext.define('RedAmp.stream.Stream', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	//Requires
	requires:[
		'RedAmp.model.Stream'
	],
	
	//Config
	config:{
		name: 'stream',
		title: 'Stream',
		viewClass: 'RedAmp.stream.view.Stream'
	},
	
	//Init Functions
	init: function(){
		this.initWelcomeMessage();
	},
	
	initWelcomeMessage: function(){
		this.onViewReady(function(){
			this.addMessage(Ext.create(this.getModel(), {
				text: 'Welcome!',
				module: this.getModuleName()
			}));
		}, this);
	},
	
	initNavigation: function(){
		//Call parent
		this.callParent(arguments);
		
		//Listen for when the view is ready
		this.onViewReady(function(){
			
			//Listen for a record added to the stream
			this.getView().store.on('add', function(){
				if(this.getApplication().getActive() != this.getView()){
					var badgeNumber = parseInt(this.getMainNavigationItem().getBadgeText()) || 0;
					badgeNumber++;
					this.getMainNavigationItem().setBadgeText(badgeNumber.toString());
				}
			}, this);
			
			//Listen for when this module goes active and clear the badge
			this.on('show', function(){
				this.getMainNavigationItem().setBadgeText('');
			}, this);
			
		}, this);
	},
		
	//Helper Functions
	getModel: function(){
		return RedAmp.model.Stream;
	},
	
	addMessage: function(record){
		return this.getView().addMessage(record);
	}
});