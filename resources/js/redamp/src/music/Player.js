Ext.define('RedAmp.music.Player', {
	extend:'Ext.Component',
	
	///////////////////////////////////////////////////////////////////////////
	// Render Template
	///////////////////////////////////////////////////////////////////////////
	renderTpl:
        '<div class="audio-player {cls}">' +
			'<audio preload="false"></audio>' +
			'<div class="previous"></div>' + 
			'<div class="play-pause play">' +
				'<div class="play-pause-inner"></div>' +
			'</div>' +
			'<div class="next"></div>' +
			'<div class="progress-container">' +
				'<div class="loader" style="">' +
					'<div class="progress" style=""></div>' +
				'</div>' +
			'</div>' +
			'<div class="text"></div>' +
			'<div class="time"></div>' + 
			'<div class="clear"></div>' +
		'</div>',
	
	///////////////////////////////////////////////////////////////////////////
	// Render Selectors
	///////////////////////////////////////////////////////////////////////////
	renderSelectors: {
        audio: 'audio',
        playPauseEl: '.play-pause',
        progressContainerEl: '.progress-container',
        loaderEl: '.progress-container .loader',
        progressEl: '.progress-container .progress',
        textEl: '.text',
        timeEl: '.time',
        previousEl: '.previous',
        nextEl: '.next'
    },
    
    config: {
    	channel: null
    },
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	lastTrack: false,
	currentTrack: false,
	loaded: false,
	playing: false,
	paused: false,
	
	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	
	/**
	* @event play
	* Fires when a song begins to play
	* @param {Player} player
	* @param {Record} record
	*/
   
   /**
	* @event pause
	* Fires when a song has been paused
	* @param {Player} player
	* @param {Record} record
	*/
   
   /**
	* @event stop
	* Fires when a song has been stopped
	* @param {Player} player
	* @param {Record} record
	*/
   
   /**
	* @event complete
	* Fires when a song has completed playing
	* @param {Player} player
	* @param {Record} record
	*/
   
   /**
	* @event next
	* Fires when the next button was pressed
	* @param {Player} player
	* @param {Record} record
	*/
   
   /**
	* @event previous
	* Fires when the previous button was pressed
	* @param {Player} player
	* @param {Record} record
	*/
   
	
	constructor: function(config) {
		this.initConfig(config);
		this.callParent(arguments);
		this.initChannel();
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	initChannel: function() {
		this.getChannel().on({
			scope: this,
			changeaudio: this.onChangeAudio
		});
	},
	
	onChangeAudio: function(channel, audio, oldAudio) {
		if (oldAudio) {
			console.log('on change audio from ' + oldAudio.get('name') + ' to ' + audio.get('name'));
			this.unregisterAudioListeners(oldAudio);
		}
		else {
			console.log('on change audio to ' + audio.get('name'));
		}
		
		this.registerAudioListeners(audio);
		this.setText(audio.data);
	},
	
	registerAudioListeners: function(audio) {
		audio.on({
			scope: this,
			progress: this.onProgress,
			timeupdate: this.onTimeUpdate,
			ended: this.onEnded,
		})
	},
	
	unregisterAudioListeners: function(audio) {
		audio.clearListeners();
	},
	
	initPlayPause: function(){
		this.playPauseEl.on('click', this.onPlayPauseClick, this);
	},
	
	initNext: function(){
		this.nextEl.on('click', this.next, this);
	},
	
	initPrevious: function(){
		this.previousEl.on('click', this.previous, this);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// On Events
	///////////////////////////////////////////////////////////////////////////
	onRender: function(){
		this.callParent(arguments);
		this.progressContainerEl.on('click', this.onProgressClick, this);
		this.initPlayPause();
		this.initNext();
		this.initPrevious();
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Checkers
	///////////////////////////////////////////////////////////////////////////
	isLoaded: function(){
		return this.loaded;
	},
	
	isPlaying: function(){
		return this.playing;
	},
	
	isPaused: function(){
		return this.paused;
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Accessors
	///////////////////////////////////////////////////////////////////////////
	getCurrentTrack: function(){
		return this.currentTrack;
	},
	
	getLastTrack: function(){
		return this.lastTrack;
	},
	
	getPlayPercentage: function(){
		var percentage = 0;
		if(this.isPlaying() || this.isPaused()){
			percentage = (this.audio.dom.currentTime / this.audio.dom.duration) * 100;
		}
		return percentage;
	},
	
	
	///////////////////////////////////////////////////////////////////////////
	// Mutators																 
	///////////////////////////////////////////////////////////////////////////
	setText: function(tags){
		this.textEl.update(tags.artist + ' - ' + tags.title);
	},
	
	setRawSrc: function(type, data){
		this.stop();
		this.audio.dom.src = '';
		//this.audio.dom.src = 'data:' + type + ';base64,' + window.btoa(data);
		this.audio.dom.src = data;
		this.loaded = true;
	},
	
	setSrc: function(src){
		this.stop();
		this.audio.dom.src = '';
		this.audio.dom.src = src;
		this.loaded = true;
	},
	
	setVolume: function(volume) {
		// TODO: switch this to a method of the channel once it is implemented
		this.getChannel().getActiveAudio().setVolume(volume);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	play: function(record) {
		console.log('player play method');
		return;
		if (record != null) {
			
			//Stop the player
			this.stop();
			
			//Save the lastTrack if necessary
			if(this.currentTrack){
				this.lastTrack = this.currentTrack;
			}
			
			//Save this record as the playing record
			this.currentTrack = record;
			
			//Run the play function of the record for custom loading
			record.play(this);
			return;
		}
		
		//Make sure we are loaded and not already playing
		if(!this.isLoaded() || this.isPlaying()){
			return;
		}
		
		this.audio.dom.play();
		this.playPauseEl.removeCls('play');
		this.playPauseEl.addCls('pause');
		this.playing = true;
		this.paused = false;
		
		//Fire event
		this.fireEvent('play', this, this.getCurrentTrack());
	},
	
	stop: function() {
		if(!this.isLoaded || !this.isPlaying()){
			return;
		}
		
		//Fire before stop event
		if(this.fireEvent('beforestop', this, this.getCurrentTrack(), this.getPlayPercentage()) === false){
			return;
		}
		
		this.seek(0);
		this.audio.dom.pause();
		this.playing = false;
		this.paused = false;
		
		//call the function on the track
		this.getCurrentTrack().stop(this);
		
		//Fire event
		this.fireEvent('stop', this, this.getCurrentTrack());
	},
	
	pause: function() {
		if(!this.isLoaded() || !this.isPlaying() || this.isPaused()){
			return;
		}
		
		this.playPauseEl.removeCls('pause');
		this.playPauseEl.addCls('play');
		this.audio.dom.pause();
		this.paused = true;
		this.playing = false;
		
		//call the function on the track
		this.getCurrentTrack().pause(this);
		
		//Fire event
		this.fireEvent('pause', this, this.getCurrentTrack());
	},
	
	previous: function() {
		this.fireEvent('previous', this, this.getCurrentTrack());
	},
	
	next: function() {
		this.fireEvent('next', this, this.getCurrentTrack());
	},
	
	mute: function() {
		this.oldVolume = this.audio.dom.volume;
		this.audio.dom.volume = 0;
	},
	
	unmute: function() {
		this.audio.dom.volume = this.oldVolume;
	},
	
	seek: function(seconds) {
		if (this.isLoaded) {
			this.audio.dom.currentTime = seconds;
		}
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	onProgress: function(audio) {
		var loaded = parseInt(((audio.getEl().dom.buffered.end(0) / audio.getEl().dom.duration) * 100), 10);
		this.loaderEl.setWidth(loaded + "%");
	},
	
	onTimeUpdate: function(audio) {
		var currentTime = parseInt(audio.getEl().dom.currentTime, 10);
		var totalTime = parseInt(audio.getEl().dom.duration, 10);
		var totalMinutes = Math.floor(totalTime/60, 10);
		var totalSeconds = totalTime - totalMinutes * 60;
		var currentMinutes = Math.floor(currentTime/60, 10);
		var currentSeconds = currentTime - currentMinutes * 60;
		var remainingMinutes = Math.floor((totalTime - currentTime)/60, 10);
		var remainingSeconds = (totalTime-currentTime) - remainingMinutes * 60;
		
		var percentage = audio.getPlayedPercent() * 100;
		
		//Update the progress
		this.progressEl.setWidth(percentage + "%");
		
		//Update the text
		this.timeEl.update("-" + remainingMinutes + ':' + (remainingSeconds > 9 ? remainingSeconds : '0' + remainingSeconds));
	},
	
	onEnded: function(audio) {
		// this.unregisterAudioListeners(audio);
		// this.fireEvent('complete', this, this.getCurrentTrack());
	},
	
	onProgressClick: function(event) {
		var eventX = event.getX();
		var elX = this.progressEl.getX();
		var elWidth = this.progressContainerEl.getWidth(true);
		var audio = this.getChannel().getActiveAudio();
		var percent = (eventX - elX) / elWidth;
		var seconds = percent * audio.getDuration();
		
		audio.seek(seconds);
	},
	
	onPlayPauseClick: function() {
		if (!this.isLoaded()) {
			return;
		}
		
		if (this.isPlaying()) {
			this.pause();
		}
		else {
			this.play();
		}
	}
});