Ext.define('RedAmp.source.local.module.Local', {
	extend: 'Lapidos.module.Viewable',
	
	requires:[
		'RedAmp.form.field.Folder',
		'RedAmp.music.library.Store',
		'RedAmp.source.local.model.Audio',
		'RedAmp.file.File'
	],
	
	//Config
	config: {
		name: 'source-local',
		title: 'Source Local'
	},
	totalFiles: 0,
	completedFiles: 0,
	progressBar: null,
	
	init: function(){
		this.initBrowseButton();
		this.initProgressBar();
	},
	
	initBrowseButton: function(){
		this.browseButton = Ext.create('RedAmp.form.field.Folder', {
			scope: this,
			width: 60,
			iconCls: 'add',
			buttonText: 'Add'
		});
		
		//Chain events
		this.browseButton.on('select', this.onBrowseSelect, this);
		this.manager.on({
			scope: this,
			launch: this.onMusicLaunch
		});
	},
	
	initProgressBar: function(){
	   this.progressBar = new Ext.ProgressBar({
	       width: 300
	   });
	},
	
	onMusicLaunch: function(manager, module){
		if(module.getName() != "music"){
			return;
		}
		module.getActiveView(function(library){
			library.toolbar.add(this.browseButton);
			this.getOs().getShell().getView().getNorth().addDocked(this.progressBar);
			this.progressBar.hide();
		}, this);
		this.manager.un('launch', this.onMusicLaunch);
	},
	
	onBrowseSelect: function(field, inputEl, event, options){
		var files = field.getFiles();
        var records = [];
        
		//Create the audio records
		Ext.each(files, function(file, index){
			var pathParts = file.webkitRelativePath.split('/');
			var fileName = pathParts.pop();
			var fileNameParts = fileName.split('.');
			var extension = fileNameParts[fileNameParts.length-1];
			if (fileName.substr(0,1) == '.' || extension != 'mp3') {
				return;
			}
			this.totalFiles++;
			
			//Create the record
			var record = Ext.create('RedAmp.source.local.model.Audio', {
				file: file,
				path: file.webkitRelativePath,
				name: file.fileName,
				size: file.size,
				type: file.type
			});
			records.push(record);
		}, this);
		
		this.progressBar.show();
		this.processFiles(records);
	},
	
	processFiles: function(records, index){
	    if(Ext.isEmpty(index)){
	        index = 0;
	    }
	    var record = null;
	    record = records[index];
	    if(Ext.isEmpty(record)){
	        this.progressBar.hide();
	        return;
	    }
	    
	    //Read the tags and add to the library
        var redampFile = Ext.create('RedAmp.file.File', record.get('file'));
        redampFile.getTags(function(musicFile, tags, options){
            options.record.set(tags);
            RedAmp.music.library.Store.add(options.record);
            this.completedFiles++;
            var percentage = this.completedFiles / this.totalFiles;
            var defer = 10;
            this.progressBar.updateProgress(percentage, Math.round(100*percentage)+'% completed');
            if(!(this.completedFiles % 100)){
                defer = 500;
            }
            Ext.defer(this.processFiles, defer, this, [options.records, index+1]);
        }, this, {record: record, records: records, index: index});
	},
	
	onRegister: function(){
		//this.getOs().getShell().getView().getEast().add(this.tree);
	}
});
/*
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
*/