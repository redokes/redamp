Ext.define('RedAmp.File', {
	extend:'Ext.util.Observable',
	id:false,
	fileSelector:false,
	store:false,
	storeData:false,
	
	constructor: function(options) {
		Ext.apply(this, options || {});
		this.storeData = {
			root:{
				expanded:true
			}
		};
		this.init();
		window.wes = this;
	},
	
	init: function() {
		this.initStore();
		this.initTree();
		this.initFileSelector();
		this.initListeners();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.TreeStore', this.storeData);
	},
	
	initTree: function() {
		this.tree = Ext.create('Ext.tree.Panel', {
			width:200,
			height:300,
			title:'Shared Directories',
			store:this.store,
			rootVisible:false,
			renderTo:'tree-render'
		});
	},
	
	initFileSelector: function() {
		if (this.id) {
			this.fileSelector = Ext.get(this.id);
			this.fileSelector.on('change', function(e) {
				var fileList = e.target.files;
				var processedList = this.processFileList(fileList);
				this.store.tree.root.appendChild(processedList);
				
			}, this);
		}
	},
	
	initListeners: function() {
		this.tree.on('itemclick', function(tree, record) {
			if (record.raw) {
				console.log(record.raw);
//				this.reader = new FileReader();
//				this.reader.onload = function(e) {
//					
//				};
//				var audio = document.createElement('audio');
//				document.body.appendChild(audio);
//				audio.src = record.raw.webkitRelativePath;
//				audio.play();
			}
		}, this);
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
			subPath[fileName] = {
				record:fileList[i],
				isFile:true
			};
		}
		this.buildNodes(paths[topDir], processedList.children);
		return processedList;
	},
	
	buildNodes: function(dir, children) {
		for (var i in dir) {
			if (i == 'record') {
				
			}
			else {
				if (dir[i].isFile) {
					children.push(Ext.apply({
						text:i,
						leaf:true
					}, dir[i].record));
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
	}
	
});