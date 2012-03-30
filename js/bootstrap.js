Ext.Loader.setConfig({
	enabled: true,
	paths:{
		Ext: 'js/ext-4.0.7/src',
		RedAmp: '/js/redamp/src',
		Lapidos: '/js/lapidos/src'
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