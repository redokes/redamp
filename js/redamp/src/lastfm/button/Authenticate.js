Ext.define('RedAmp.lastfm.button.Authenticate', {
	extend: 'Ext.button.Button',
	text: 'Authenticate',
	handler: function(){
		var key = RedAmp.lastfm.api.Api.key;
		window.open("http://www.last.fm/api/auth/?api_key=" + key + "&cb=http://redamp/auth/lastfm.php", "_blank","");
	}
});