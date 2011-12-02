Ext.define('RedAmp.source.local.Local', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	//Config
	config:{
		name: 'source-local',
		title: ''
	},
	
	//Init Functions
	init: function(){
		this.initStream();
	},
	
	initView: function(){
		//Create the view if it hasnt already been created
		if(!this.creatingView){
			this.creatingView = true;

			//Load the view class
			this.view = Ext.create('RedAmp.source.local.view.Tree', {
				dock: 'right',
				width: 200
			});
			
			//Fire the init view event
			this.fireEvent('initview', this, this.getView());

			//Add the view to the applications center
			this.getApplication().getCenter().addDocked(this.view);

			//Set creating view to false
			this.creatingView = false;
		}
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			scope: this,
			fields:[
				'file'
			],
			proxy: {
				type: 'localstorage',
				id  : 'file-store'
			}
		});
		this.store.on('load', function(){
			console.log(arguments);
		}, this);
		this.store.load();
	},
	
	initUser: function(){
		var record = this.store.getAt(0);
		if(record == null){
			record = this.store.add({
				name: 'New User'
			});
			this.store.sync();
		}
		
		this.application.getSocketClient().socket.emit('setData', {
			user: record.data
		});
	},
	
	
	initStream: function(){
		var stream = this.application.getModule('stream');
		if(!stream){
			this.appication.onModuleReady('stream', function(){
				this.initStream();
			}, this);
			return;
		}
		
		//Listen for when the user adds files
		this.onViewReady(function(){
			this.getView().on('filesadded', function(field){
				var stream = this.application.getModule('stream');

				//Add to local stream
				stream.addMessage({
					text: '<span style="color:green;"> + ' + field.getFiles().length + ' file(s) </span>'
				});
			}, this);
		}, this);
	}
});