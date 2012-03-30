Ext.define('RedAmp.server.Socket', {
	extend: 'Redokes.node.server.Socket',
	
	//Requires
	requires:[
		"RedAmp.server.file.model.File"
	],
	
	//Config
	
	//Init the socket
	init: function(){
		this.initFileStore();
		this.initFileRequest();
		this.initFileListeners();
	},
	
	initFileStore: function(){
		this.fileStore = Ext.create('Ext.data.Store', {
			model: "RedAmp.server.file.model.File"
		});
	},
	
	initFileRequest: function(){
		//io, httpServerWrapper, httpServer, namespace
		//Listen for a request for a file
		this.httpServerWrapper.on('request', function(request, response, path, data){
			var parts = path.split('/');
			
			//Total Rig for now
			if(parts[0] != 'file'){
				return;
			}
			
			//Get the header range
			var range = request.headers.range;
			var rangeParts = range.match(/bytes=\h*(\d+)-(\d*)[\D.*]?/i);
			var startByte = rangeParts[1];
			var endByte = rangeParts[2];
			console.log(rangeParts);
			
			//Setup the response code and headers
			var responseCode = 206;
			
			//Get the file request
			var fileRequest = JSON.parse(decodeURI(parts[1]));
			var emitRequest = {
				module: 'file',
				action: 'get',
				data: Ext.apply({}, {
					start: startByte
				}, fileRequest)
			};
			
			//Create the stream
			var stream = this.createStream();
			
			//Look for this record
			var record = this.findRecord(fileRequest);
			if(record != null){
				record.set({
					request: request,
					response: response,
					stream: stream
				});
			}
			else{
				//Save this file request in the fileStore
				this.fileStore.add(Ext.apply({}, {
					request: request,
					response: response,
					stream: stream,
					content: ''
				}, fileRequest));
			}
			
			//Output the head
			var headers = {
				'Content-Type': 'audio/mp3',
				'Content-Length': fileRequest.size - startByte,
				'Cache-Control': 'public, must-revalidate, max-age=0',
				'Pragma': 'no-cache',
				'Accept-Ranges': 'bytes',
				"Content-Disposition": "inline; filename=file.mp3",
				"Content-Transfer-Encoding": "binary",
				'Content-Range': 'bytes ' + startByte + '-' + fileRequest.size + '/' + fileRequest.size
			};
			console.log(headers);
			response.writeHead(responseCode, headers);
			
			//Pump the data
			require("util").pump(stream, response);

			//Send a get file request to the correct user
			if(record == null){
				this.namespace.emitRequest(emitRequest, this.namespace.getSocket(fileRequest.socketId));
			}
			
		}, this);
	},
	
	initFileListeners: function(){
		this.namespace.on('beforemessage', function(namespace, request, socket){
			//If this is not a file request return
			if(request.module == null || request.module !== 'file'){
				return;
			}
			
			//Look for this record
			var record = this.findRecord(request.data);
			
			//If no record found just return
			if(record == null){
				return;
			}
			
			//Switch on the action
			if(request.action == "chunk"){
				//write to the response
				console.log('write');
				var buffer = new Buffer(request.data.chunk, 'binary');
				record.get('stream').write(buffer, 'binary');
			}
			if(request.action == "complete"){
				//end response
				console.log('end');
				record.get('response').end();
				
				//remove record
				this.fileStore.remove(record);
			}
			else{
				return;
			}
			
			//Cancel the message
			return false;
		}, this);
	},
	
	createStream: function(){
		//Create a custom stream
		var util = require("util");
		var events = require("events");
		function FileStream() {
			events.EventEmitter.call(this);
		}
		util.inherits(FileStream, events.EventEmitter);
		FileStream.prototype.write = function(data) {
			this.emit("data", data);
		}
		var stream = new FileStream();
		return stream;
	},
	
	findRecord: function(data){
		var record = this.fileStore.getAt(this.fileStore.findBy(function(record, id){
			if(record.get('socketId') == data.socketId && record.get('fileId') == data.fileId && record.get('userSocketId') == data.userSocketId){
				return id;
			}
		}, this));
		return record;
	}
});