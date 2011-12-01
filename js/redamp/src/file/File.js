Ext.define('RedAmp.file.File', {
	extend: 'Ext.util.Observable',
	
	//Config
	remote: false,
	file: null,
	reader: null,
	startByte: 0,
	chunkSize: 131072,	//1024*128
	chunks: [],
	chunkOffsets: [],
	totalChunks: 0,
	currentChunk: 0,
	tags: {},

	constructor: function(file, config){
		this.tags = {};
		Ext.apply(this, file);
		this.file = file;
		this.callParent([config]);
		this.init();
	},

	init: function(){
		this.initFile();
		this.initReader();
	},
	
	initFile: function(){
		this.startByte = parseInt(this.startByte);
		this.chunks = [];
		this.chunkOffsets = [];
		this.totalChunks = Math.ceil((this.file.size - this.startByte) / this.chunkSize);
		for(var i = this.startByte; i <= this.file.size; i += this.chunkSize){
			this.chunkOffsets.push(i);
		}
	},
	
	initReader: function(){
		this.reader = new FileReader();
		this.reader.onloadend = Ext.bind(function(e) {
			if (e.target.readyState == FileReader.DONE) { // DONE == 2
				this.fireEvent('chunk', e, e.target.result);
			}
		}, this);
	},
	
	getTags: function(callback, scope, options){
		if(scope == null){
			scope = this;
		}
		var me = this;
		var tagSize = 128;
		var blob = this.file.webkitSlice(this.file.size - tagSize, this.file.size);
		var reader = new FileReader();
		reader.onloadend = Ext.bind(function(e) {
			if (e.target.readyState == FileReader.DONE) { // DONE == 2
				Ext.apply(this.tags, this.readTags(e.target.result));
				Ext.bind(callback, scope)(this, this.tags, options);
			}
		}, this);
		reader.readAsBinaryString(blob);
	},
	
	download: function(){
		this.chunks = [];
		this.currentChunk = 0;
		this.on('chunk', this.onDownloadChunk, this);
		this.downloadChunk(this.currentChunk);
	},
	
	onDownloadChunk: function(event, data, options){
		this.chunks[this.currentChunk] = data;
		this.currentChunk++;
		//Check if we are finished
		if(this.currentChunk >= this.totalChunks){
			this.un('chunk', this.onDownloadChunk, this);
			this.fireEvent('complete', this, this.chunks.join(''));
		}
		
		//Keep downloading
		else{
			this.initReader();
			this.downloadChunk(this.currentChunk);
		}
	},
	
	downloadChunk: function(chunkIndex){
		var blob = this.file.webkitSlice(this.chunkOffsets[chunkIndex], this.chunkOffsets[chunkIndex] + this.chunkSize);
		this.reader.readAsBinaryString(blob);
	},
	
	readTags: function(tags) {
		//var offset = data.getLength() - 128;

		var offset = 0;

		var header = tags.substr(offset, 3);
		if (header == "TAG") {
			var title = tags.substr(offset + 3, 30).replace(/\0/g, "");
			var artist = tags.substr(offset + 33, 30).replace(/\0/g, "");
			var album = tags.substr(offset + 63, 30).replace(/\0/g, "");
			var year = tags.substr(offset + 93, 4).replace(/\0/g, "");

			var trackFlag = tags.charAt(offset + 97 + 28);
			if (trackFlag == 0) {
				var comment = tags.substr(offset + 97, 28).replace(/\0/g, "");
				var track = tags.charAt(offset + 97 + 29);
			} else {
				var comment = "";
				var track = 0;
			}

			/*
			var genreIdx = data.getByteAt(offset + 97 + 30);
			if (genreIdx < 255) {
				var genre = ID3.genres[genreIdx];
			} else {
				var genre = "";
			}
			*/

			return {
				title : title,
				artist : artist,
				album : album,
				year : year,
				comment : comment,
				track : track,
				genre : null
			}
		} else {
			return {};
		}
	},
	
	getURL: function(callback, scope){
		var me = this;
		if(scope == null){
			scope = this;
		}
		window.webkitRequestFileSystem(window.TEMPORARY, (1024*1024) * 50, function(fs) {
			// Capture current iteration's file in local scope for the getFile() callback.
			fs.root.getFile('temp.mp3', {
				create: true
			}, function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function(){
						fileWriter.onwriteend = function(){
							Ext.bind(callback, scope)(fileEntry.toURL());
						}
						fileWriter.write(me.file);
					};
					fileWriter.truncate(0);
				}, me.fileSystemErrorHandler);
			}, me.fileSystemErrorHandler);
		}, me.fileSystemErrorHandler);
	},
	
	fileSystemErrorHandler: function(e){
		var msg = '';

		switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
		case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
		case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
		case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
		case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
		default:
			msg = 'Unknown Error';
			break;
		};
		console.log('Error: ' + msg);
	}
});