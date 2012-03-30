Ext.define("RedAmp.server.file.model.File", {
    extend: 'Ext.data.Model',
	fields:[
		'userSocketId',
		'socketId',
		'fileId',
		'request',
		'response',
		'content'
	]
});