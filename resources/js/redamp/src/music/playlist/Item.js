Ext.define('RedAmp.music.playlist.Item', {
	extend:'Ext.Component',
	
	view: false,
	el: false,
	record: false,
	playingCls: 'playing',
	
	//Inits
	constructor: function(view, record, config){
		this.view = view;
		this.record = record;
		this.el = Ext.get(this.view.getNode(this.record));
		this.initConfig(config);
		this.callParent(config);
		this.init();
		return this;
	},
	
	init: function(){
		this.initEl();
		this.initListeners();
	},
	
	initEl: function(){
		if(this.record.isPlaying()){
			this.onPlay();
		}
	},
	
	initListeners: function(){
		this.mon(this.record, 'play', this.onPlay, this);
	},
	
	onPlay: function(){
		var currentPlaying = this.view.getEl().down("." + this.playingCls);
		if(currentPlaying != null){
			currentPlaying.removeCls(this.playingCls);
		}
		this.el.addCls(this.playingCls);
	}
	
});