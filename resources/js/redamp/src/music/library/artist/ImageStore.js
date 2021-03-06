Ext.define('RedAmp.music.library.artist.ImageStore', {
	extend: 'Ext.data.Store',
	singleton: true,
	autoLoad: true,
	listeners:{
		load:{
			fn: function(){
				console.log('image store load');
				console.log(arguments);
			}
		}
	},
	
	fields:[{
		name: 'artist',
		type: 'string'
	},{
		name: 'image',
		type: 'string'
	}],
	proxy: {
		type: 'localstorage',
		id  : 'redamp-music-image-artist-store'
	}
});