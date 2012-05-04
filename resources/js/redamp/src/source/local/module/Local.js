Ext.define('RedAmp.source.local.module.Local', {
	extend: 'Lapidos.module.Viewable',
	
	requires:[
		'RedAmp.form.field.Folder',
		'RedAmp.music.library.Store',
		'RedAmp.source.local.model.Audio',
		'RedAmp.file.File',
		'RedAmp.file.store.Tag',
		'RedAmp.progress.Line'
	],
	
	//Config
	config: {
		name: 'source-local',
		title: 'Source Local'
	},
	totalFiles: 0,
	completedFiles: 0,
	progressLine: null,
	
	init: function(){
		this.initBrowseButton();
		this.initProgressLine();
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
	
	initProgressLine: function(){
	   this.progressLine = new RedAmp.progress.Line({
	       dock: 'bottom'
	   });
	},
	
	onMusicLaunch: function(manager, module){
		if(module.getName() != "music"){
			return;
		}
		module.getActiveView(function(library){
			library.toolbar.add(this.browseButton);
			library.addDocked(this.progressLine);
		}, this);
		this.manager.un('launch', this.onMusicLaunch);
	},
	
	onBrowseSelect: function(field, inputEl, event, options){
		var files = field.getFiles();
        var records = [];
        var tagStore = RedAmp.file.store.Tag;
        
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
		
		this.progressLine.show();
		this.processFiles(records);
	},
	
	processFiles: function(records, index){
	    if(Ext.isEmpty(index)){
	        index = 0;
	    }
	    var record = null;
	    record = records[index];
	    if(Ext.isEmpty(record)){
	        this.progressLine.updateProgress(0);
	        RedAmp.file.store.Tag.sync();
	        return;
	    }
	    
	    //Read the tags and add to the library
        var redampFile = Ext.create('RedAmp.file.File', record.get('file'));
        redampFile.getTags(function(musicFile, tags, options){
            options.record.set(tags);
            RedAmp.music.library.Store.add(options.record);
            this.completedFiles++;
            var percentage = this.completedFiles / this.totalFiles;
            var defer = 1;
            this.progressLine.updateProgress(percentage);
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