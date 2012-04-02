Ext.define('RedAmp.source.local.model.Audio', {
	extend:'RedAmp.model.Audio',
	
	play: function(player, load){
		if(load == null){
			load = true;
		}
		
		//If we arent loading just call the parent
		if(!load){
			return this.callParent(arguments);
		}
		
		//Load the file to local storage, play when finished
		var file = Ext.create('RedAmp.file.File', this.get('file'));
		file.getURL(function(url){
			this.set({
				url: url
			});
			this.play(player, false);
		}, this);
		
		//Return
		return true;
	}
});