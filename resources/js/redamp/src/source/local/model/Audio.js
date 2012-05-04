Ext.define('RedAmp.source.local.model.Audio', {
	extend:'Lapidos.audio.model.Audio',
	
	play: function() {
		console.log('redamp audio play ' + this.get('name'))
		//If we arent loading just call the parent
		if (this.get('isLoaded') || this.get('isLoading')) {
			return this.callParent(arguments);
		}
		this.on('preload', function(audio) {
			audio.play();
		}, this);
		this.preload();
		return;
		//Load the file to local storage, play when finished
		var file = Ext.create('RedAmp.file.File', this.get('file'));
		file.getURL(function(url){
			console.log('call bacjk')
			console.log(url)
			this.set({
				url: url
			});
			this.setSrc(url);
			console.log('calling play again')
			this.play();
		}, this);
		
		//Return
		return true;
	},
	
	preload: function() {
		console.log('preload from local ' + this.get('title'));
		if (this.get('src') && !this.get('isLoaded') && !this.get('isLoading')) {
			
		}
		else {
			this.set('isLoading', true);
			var file = Ext.create('RedAmp.file.File', this.get('file'));
			file.getURL(function(url) {
				this.set('isLoaded', true);
				this.set('isLoading', false);
				console.log('call back from preload ' + this.get('name'));
				this.set({
					url: url
				});
				this.setSrc(url);
				this.fireEvent('preload', this);
			}, this);
		}
	},
});