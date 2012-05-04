Ext.define('RedAmp.music.library.Store', {
	extend: 'Ext.data.Store',
	requires:[
		'RedAmp.model.Audio'
	],
	singleton: true,
	model: 'RedAmp.model.Audio',
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