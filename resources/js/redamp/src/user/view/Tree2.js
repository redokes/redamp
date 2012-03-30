Ext.define('RedAmp.user.view.Tree', {
	extend: 'Ext.tree.Panel',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	//Config
	rootVisible:false,
	nodes: [],
	remote: false,
	remoteUserId: 0,

    initComponent: function() {
		this.showLog();
		this.items = [];
		this.dockedItems = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initToolbar();
		//this.initSearch();
		this.initDownload();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.TreeStore');
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initSearch: function(){
		this.search = new Ext.form.field.Text({
			scope: this,
			emptyText: 'Search...'
		});
		this.toolbar.add(this.search);
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
		this.store.tree.root.appendChild(processedList);
	},
	
	processFileList: function(fileList) {
		var numFiles = fileList.length;
		
		// Loop through file list to build object structure
		var pathObject = {};
		for (var i = 0; i < numFiles; i++) {
			var pathParts = fileList[i].webkitRelativePath.split('/');
			var fileName = pathParts.pop();
			
			// Loop through the path parts and make the directory structure
			// in the path object
			if (fileName.substr(0, 1) != '.') {
				var subPathObject = pathObject;
				for (var j = 0; j < pathParts.length; j++) {
					if (subPathObject[pathParts[j]] == null) {
						subPathObject[pathParts[j]] = {}
					}
					subPathObject = subPathObject[pathParts[j]];
//					var folderName = pathParts[j];
//					if (subPath[folderName] == null) {
//						subPath[folderName] = {
//							record:fileList[i],
//							isFile:false
//						};
//					}
//					subPath = subPath[folderName];
				}
				
				// Add the file to the directory's file array
				if (subPathObject['_files'] == null) {
					subPathObject['_files'] = [];
				}
				subPathObject['_files'].push({
					record:fileList[i]
				});
			}
		}
		
		this.log(pathObject);
		var processedList = {};
		this.buildNodes2(processedList, pathObject);
		this.log('Processed = ');
		this.log(processedList);
		return processedList;
		return;
		
		
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
			var subPath = {};
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
			if(fileName != "."){
				subPath[fileName] = {
					record:fileList[i],
					isFile:true
				};
			}
		}
		this.buildNodes(paths[topDir], processedList.children);
		return processedList;
	},
	
	buildNodes2: function(processedList, pathObject, indent) {
		indent = indent || 0;
		var indentStr = '';
		for (var i = 0; i < indent; i++) {
			indentStr += ' ';
		}
		
		var isRoot = true;
		for (var i in processedList) {
			isRoot = false;
			break;
		}
		
		if (isRoot) {
			this.log(indentStr + 'This is root');
			for (var i in pathObject) {
				processedList.text = i;
				break;
			}
		}
		
		for (var i in pathObject) {
			this.log(indentStr + 'i = ' + i);
			if (i == '_files') {
				this.log(indentStr + 'Stop on files');
				return;
			}
			
			
			// Set the text for this tree node
//			processedList.text = i;

			// Check if this is a leaf (no children)
			var isLeaf = true;
			for (var j in pathObject[i]) {
				isLeaf = false;
			}

			// Set the leaf property for this node
			processedList.leaf = isLeaf;
			if (!isLeaf) {

				// Set the children array for this node
				processedList.children = [];
				this.log(indentStr + 'Children for ' + processedList.text);
				
				// Add children to array
				for (var j in pathObject[i]) {
					this.log(indentStr + 'j = ' + j);
					if (j == '_files') {
						// Loop through files and add to children
						for (var fileIndex = 0; fileIndex < pathObject[i][j].length; fileIndex++) {
							var file = pathObject[i][j][fileIndex];
							processedList.children.push({
								text: file.record.fileName,
								leaf: true,
								file: file
							});
						}
					}
					else {
						processedList.children.push({
							text: j
						});
						this.log(indentStr + 'Build nodes for ' + j);
//						this.log(pathObject[i]);
						this.buildNodes2(processedList.children[processedList.children.length-1], pathObject[i], indent + 2);
					}
				}

			}
		}
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
					//Add Config
					Ext.apply(config, {
						leaf:true,
						id: dir[i].record.webkitRelativePath,
						file: dir[i].record
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
			id: node.data.id
		});
		
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