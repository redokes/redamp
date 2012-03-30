Ext.Loader.setConfig({
	enabled: true,
	paths:{
		Ext: '/resources/js/ext-4.0.7/src',
		RedAmp: '/resources/js/redamp/src',
		Lapidos: '/resources/js/lapidos/src'
	}
});

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