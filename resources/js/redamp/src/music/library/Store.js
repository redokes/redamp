Ext.define('RedAmp.music.library.Store', {
	extend: 'Ext.data.Store',
	requires:[
		'Lapidos.audio.model.Audio'
	],
	singleton: true,
	model: 'Lapidos.audio.model.Audio',
	remoteGroup: false,
	
	getByArtist: function(artist){
		var records = this.data.filterBy(function(record){
			if(record.get('artist') == artist){
				return true;
			}
		});
		return records;
	}
});