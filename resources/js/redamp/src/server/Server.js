require('node-extjs');

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		Redokes: __dirname + '/../../../../js/redokes/src',
		Modules: __dirname + '/../../../'
	}
});

Ext.require('RedAmp.server.Http');
Ext.require('RedAmp.server.Socket');

Ext.onReady(function() {
	var httpServer = Ext.create('RedAmp.server.Http');
	var socketServer = Ext.create('RedAmp.server.Socket', httpServer);
});