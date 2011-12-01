var RedAmpPath = '/js/redamp/src';
var ExtPath = 'js/ext-4.0.7/src';
if (Ext.Loader.config.enabled) {
	Ext.Loader.setPath('Ext', ExtPath);
	Ext.Loader.setPath('RedAmp', RedAmpPath);
}
else {
	Ext.Loader.setConfig({
		enabled: true,
		paths:{
			RedAmp: RedAmpPath,
			Ext: ExtPath
		}
	});
}

//Check for a console, if one doesnt exist make one
if(window.console == null){
	window.console = {
		log: function(s){
			//alert(s);
		},
		warn: function(){},
		info: function(){}
	};
}