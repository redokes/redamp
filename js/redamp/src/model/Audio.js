Ext.define('RedAmp.model.Audio', {
	extend:'Ext.data.Model',
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	playing: false,
	paused: false,
	
	///////////////////////////////////////////////////////////////////////////
	// Fields
	///////////////////////////////////////////////////////////////////////////
	fields:[{
		name: 'url',
		type: 'string'
	},{
		name:'name',
		type:'string'
	},{
		name:'size',
		type:'integer'
	},{
		name:'type',
		type:'string'
	},{
		name:'path',
		type:'string'
	},{
		name:'title',
		type:'string'
	},{
		name:'artist',
		type:'string'
	},{
		name:'album',
		type:'string'
	},{
		name:'year',
		type:'string'
	},{
		name:'track',
		type:'string'
	}],

	proxy:{
		type:'memory',
		reader:{
			type:'json',
			root:'records'
		}
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	play: function(player){
		this.playing = true;
		player.setText(this.data);
		player.setSrc(this.get('url'));
		player.play();
		this.fireEvent('play', this, player);
	},
	
	pause: function(player){
		this.paused = true;
		this.fireEvent('pause', this, player);
	},
	
	stop: function(player){
		this.playing = false;
		this.paused = false;
		this.fireEvent('stop', this, player);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Checkers
	///////////////////////////////////////////////////////////////////////////
	isPlaying: function(){
		return this.playing;
	},
	
	isPaused: function(){
		return this.paused;
	}
});