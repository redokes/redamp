Ext.define('RedAmp.source.local.view.Tree', {
	extend: 'Ext.tree.Panel',
	
	requires:[
		'RedAmp.model.Audio',
		'RedAmp.music.library.Store'
	],
	
	statics:{
		currentId: 0,
		generateId: function(){
			this.currentId++;
			return this.currentId;
		}
	},
	 
	//Config
	rootVisible:false,
	nodes: [],
	remote: false,
	remoteUserId: 0,

    initComponent: function() {
		this.items = [];
		this.dockedItems = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initDragZone();
		this.initStore();
		this.initAudioStore();
		this.initToolbar();
		this.initFolderSelect();
		this.initDownload();
	},
	
	initDragZone: function(){
		if(!this.rendered){
			this.on('afterrender', function(){
				this.initDragZone();
			}, this);
			return;
		}
		
		this.dragZone = Ext.create('RedAmp.source.local.dd.TreeDragZone', this, {
			ddGroup: RedAmp.music.module.Music.getDDGroup()
		});
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.TreeStore');
	},
	
	initAudioStore: function(){
		this.audioStore = Ext.create('Ext.data.Store', {
			model: 'RedAmp.model.Audio'
		});
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initFolderSelect: function(){
		this.folderSelect = Ext.create('RedAmp.form.field.Folder', {
			scope: this,
			width: 60,
			iconCls: 'add',
			buttonText: 'Add'
		});
		
		//Chain events
		this.folderSelect.on('select', function(field, inputEl, event, options){
			var fileList = field.getFiles();
			this.addFileList(field.getFiles());
			this.fireEvent('filesadded', field, inputEl, event);
		}, this);
		this.toolbar.add(this.folderSelect);
	},
	
	initDownload: function(){
		this.on('itemdblclick', function(view, record, item){
			//return if local
			if(!this.isRemote()){
				return;
			}
			
			if(!record.get('leaf')){
				return;
			}
			
			//Download the file
			this.downloadFile(record);
			
		}, this);
	},
	
	addFileList: function(fileList){
		var processedList = this.processFileList(fileList);
		this.nodes.push(Ext.apply({}, processedList));
		var node = this.store.tree.root.appendChild(processedList);
	},
	
	processFileList: function(fileList) {
		var numFiles = fileList.length;
		
		if (!numFiles) {
			return [];
		}
		
		// Get the top folder name
		var topDir = fileList[0].webkitRelativePath.split('/')[0];
		
		var processedList = {
			text:topDir,
			leaf:false,
			children:[]
		};
		
		var paths = {};
		paths[topDir] = {
			record:{}
		};
		
		// Loop through files and store the path of every file
		// so we can build an object of the hierarchy
		for (var i = 0, pathParts, fileName; i < numFiles; i++) {
			pathParts = fileList[i].webkitRelativePath.split('/');
			fileName = pathParts.pop();
			for (var j = 0, subPath = paths; j < pathParts.length; j++) {
				var folderName = pathParts[j];
				if (subPath[folderName] == null) {
					subPath[folderName] = {
						record:fileList[i],
						isFile:false
					};
				}
				subPath = subPath[folderName];
			}
			
			// Check extension
			var fileNameParts = fileName.split('.');
			var extension = fileNameParts[fileNameParts.length-1];
			if (fileName.substr(0,1) != '.' && extension == 'mp3') {
				subPath[fileName] = {
					record:fileList[i],
					isFile:true
				};
			}
		}
		this.buildNodes(paths[topDir], processedList.children);
		return processedList;
	},
	
	buildNodes: function(dir, children) {
		for (var i in dir) {
			var item = dir[i];
			var config = {};
			if (i != 'record') {
				config = {
					text: i
				};
				if (dir[i].isFile) {
					delete dir[i].isFile;
					
					//Create the audio record
					var audioRecord = Ext.create('RedAmp.source.local.model.Audio', {
						file: dir[i].record,
						path: dir[i].record.webkitRelativePath,
						name: dir[i].record.fileName,
						size: dir[i].record.size,
						type: dir[i].record.type
					});
					this.audioStore.add(audioRecord);
					
					//Get the meta data
					var file = Ext.create('RedAmp.file.File', audioRecord.get('file'));
					file.getTags(function(file, tags, options){
						options.record.set(tags);
						RedAmp.music.library.Store.add(options.record);
					}, this, {record: audioRecord});
					
					//Add Config
					Ext.apply(config, {
						leaf:true,
						//id: dir[i].record.webkitRelativePath,
						id: this.self.generateId(),
						file: dir[i].record,
						record: audioRecord,
						fileObject: {
							path: dir[i].record.webkitRelativePath,
							name: dir[i].record.fileName,
							size: dir[i].record.size,
							type: dir[i].record.type
						}
					});
					
					//Check File type
					if(item.record.type.match(/^audio/gi)){
						Ext.apply(config, {
							iconCls: 'audio-icon-16'
						});
					}
					children.push(config);
				}
				else {
					delete dir[i].isFile;
					children.push(Ext.apply({
						text:i,
						leaf:false,
						children:[]
					}, dir[i].record));
					this.buildNodes(dir[i], children[children.length-1].children);
				}
			}
		}
		return children;
	},
	
	convertToObject: function(){
		//Build the nodes
		var nodes = [];
		this.getRootNode().eachChild(function(node){
			nodes.push(this.convertNode(node));
		}, this);
		return nodes;
	},
	
	convertNode: function(node){
		var objectNode = {};
		Ext.apply(objectNode, {
			text: node.data.text,
			leaf: node.data.leaf,
			id: node.data.id,
			remote: true
		});
		
		if(node.raw != null && node.raw.file != null){
			Ext.apply(objectNode, {
				file:{
					name: node.raw.file.fileName,
					size: node.raw.file.fileSize,
					type: node.raw.file.type
				}
			});
		}
		
		objectNode.children = [];
		Ext.each(node.childNodes, function(node){
			objectNode.children.push(this.convertNode(node));
		}, this);
		
		return objectNode;
	},
	
	loadUser: function(){
		this.store.getRootNode().removeAll();
		Ext.each(this.nodes, function(node){
			this.store.tree.root.appendChild(node);
		}, this);
		this.remote = false;
	},
	
	loadRemoteUser: function(id, nodes){
		this.store.getRootNode().removeAll();
		Ext.each(nodes, function(node){
			this.store.tree.root.appendChild(node);
		}, this);
		this.remote = true;
		this.remoteUserId = id;
	},
	
	isRemote: function(){
		return this.remote;
	},
	
	downloadFile: function(record){
		if(!record.get('leaf')){
			return;
		}
		this.fireEvent('download', this, record);
	}
});