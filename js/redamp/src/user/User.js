Ext.define('RedAmp.user.User', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	//Config
	config:{
		name: 'user',
		title: ''
	},
	
	socketId: null,
	
	//Init Functions
	init: function(){
		//this.initStore();
		/*
		this.getApplication().getSocketClient().on('connect', function(socket){
			this.socketId = socket.socket.sessionid;
		}, this);
		*/
		this.initStream();
		//this.initList();
		//this.initUserHandler();
		//this.initFileHandler();
		this.onViewReady(this.initViewListeners, this);
	},
	
	initView: function(){
		//Create the view if it hasnt already been created
		if(!this.creatingView){
			this.creatingView = true;

			//Load the view class
			this.view = Ext.create('RedAmp.user.view.User', {
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
	
	initViewListeners: function(){
		this.getView().on('select', function(field){
			var fileList = field.getFiles();
			this.getView().tree.addFileList(field.getFiles());
		}, this);
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
			this.getView().on('select', function(field){
				var stream = this.application.getModule('stream');

				//Add to local stream
				stream.addMessage({
					text: '<span style="color:green;"> + ' + field.getFiles().length + ' file(s) </span>'
				});

				//Send a message to everyone else
				/*
				this.getApplication().getSocketClient().send(
					'user',
					'message',
					{ 
						message: '<span style="color:green;"> + ' + field.getFiles().length + ' file(s) </span>'
					}
				);
				*/
			}, this);
		}, this);
	},
	
	initList: function(){
		
		//Create the list to hold the users that are currently connected
		this.list = Ext.create('RedAmp.user.view.List', {
			scope: this
		});
		
		//Add a navigation panel to hold the list
		this.getApplication().getCenter().add(new Ext.panel.Panel({
			scope: this,
			title: 'Users',
			layout: 'fit',
			items: [this.list]
		}));
		
		//Listen for when an item is clicked, and load the users shared files
		this.list.on('itemclick', function(view, record){
			this.loadUser(record);
		}, this);
		
	},
	
	initUserHandler: function(){
		//Get the current remote users
		this.getApplication().getSocketClient().socket.emit('getRemoteUsers', {}, Ext.bind(function(response){
			Ext.each(response.sockets, function(socket){
				this.list.store.add({
					name: socket.id,
					id: socket.id
				});
			}, this);
		}, this));
		
		//Listen for a new user connect
		this.getApplication().getSocketClient().socket.on('otherConnect', Ext.bind(function(user){
			
			//Add the user to the list store
			this.list.store.add({
				name: user.id,
				id: user.id
			});
			
			//Show a message to the stream
			this.getApplication().onModuleReady('stream', function(stream){
				stream.addMessage({
					text: '<b>' + user.id + ': </b>' + ' <span style="color: green;">Connected</span>'
				});
			}, this);
			
		}, this));
		
		//Listen for a user disconnect
		this.getApplication().getSocketClient().socket.on('otherDisconnect', Ext.bind(function(id){
			//Find the record of the user
			var record = this.list.store.findRecord('id', id);
			this.list.store.remove(record);
			
			//Show a message to the stream
			this.getApplication().onModuleReady('stream', function(stream){
				stream.addMessage({
					text: '<b>' + record.get('name') + ': </b>' + ' <span style="color: red;">Disconnected</span>'
				});
			}, this);
			
		}, this));
	},
	
	initFileHandler: function(){
		//Share the file list
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'files',
			actions: {
				get: function(handler, response){
					//Return if no view yet
					if(!this.getView()){
						return;
					}
					
					//Send files to user who requested them
					this.getApplication().getSocketClient().send(
						'files',
						'receive',
						{ 
							socketId:  response.socketId,
							nodes: this.getView().tree.convertToObject()
						}
					);
				},
				receive: function(handler, response){
					console.log(response.data.nodes);
					this.getApplication().setActive(this.remoteView);
					this.remoteView.setTitle('Viewing ' + response.storeData.id + ' Files');
					this.remoteView.tree.loadRemoteUser(response.storeData.id , response.data.nodes);
				}
			}
		});
		
		//Share a file
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'file',
			actions: {
				get: function(handler, response){
					console.log('on get file');
					console.log(response.data);
					
					//Get the file
					var fileId = response.data.fileId;
					var file = Ext.create('RedAmp.file.File', this.getTree().getStore().getNodeById(fileId).raw.file, {
						startByte: response.data.start
					});
					file.on('chunk', function(event, data, options){
						var fileObject = Ext.apply({}, {
							name: file.name,
							size: file.fileSize,
							type: file.type,
							totalChunks: file.totalChunks,
							currentChunk: file.currentChunk
						});
						this.getApplication().getSocketClient().send(
							'file',
							'chunk',
							Ext.apply({}, {
								chunk: data,
								chunkSize: file.chunkSize,
								currentChunk: file.currentChunk
							}, response.data)
						);
					}, this);
					file.on('complete', function(){
						this.getApplication().getSocketClient().send(
							'file',
							'complete',
							response.data
						);
					}, this);
					file.download();
				}
			}
		});
	},
	
	//Functions
	loadUser: function(record){
		this.application.getSocketClient().send(
			'files',
			'get',
			{ 
				socketId:  record.get('id')
			}
		);
	},
	
	//Helper functions
	getTree: function(){
		return this.view.tree;
	},
	
	getRemoteTree: function(){
		return this.remoteView.tree;
	}
});