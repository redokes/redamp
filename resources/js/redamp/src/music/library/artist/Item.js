Ext.define('RedAmp.music.library.artist.Item', {
	extend:'Ext.Component',
	requires:[
		'RedAmp.music.library.artist.ImageStore',
		'RedAmp.music.dd.Artist'
	],
	
	config:{
		record: null
	},
	cls: 'library-artist',
	
	constructor: function(config){
		this.initConfig(config);
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.imageStore = RedAmp.music.library.artist.ImageStore;
		this.initRenderTemplate();
		this.initRenderSelectors();
	},
	
	initRenderTemplate: function(){
		this.renderTpl = new Ext.XTemplate(
			'<div class="name">{artist}</div>',
			'<img src="{image}" width="126px" style="display: none;" />'
		);
	},
	
	initRenderSelectors: function(){
		this.renderSelectors = {
			nameEl: '.name',
			imageEl: 'img'
		};
	},
	
	initDragDrop: function(){
		//this.dd = new RedAmp.music.dd.Artist(this.getEl(), RedAmp.music.module.Music.getDDGroup(), this);
	},
	
	setImage: function(image){
		//Fade image in
		this.imageEl.on({
			load: {
				scope: this,
				single: true,
				fn: function(event, img){
					this.imageEl.setOpacity(0);
					this.imageEl.show();
					this.imageEl.animate({
						to:{
							opacity: 1
						},
						from:{
							opacity: 0
						},
						duration: 1000
					});
				}
			}
		});
		this.imageEl.set({
			src: image
		});
	},
	
	loadImage: function(){
		//Look in the store first
		var record = this.imageStore.getAt(this.imageStore.findExact('artist', this.record.get('artist')));
		if(!Ext.isEmpty(record)){
			this.setImage(record.get('image'));
			return;
		}
		
		//Find an image from last fm
		RedAmp.lastfm.api.Api.request({
			scope: this,
			signed: false,
			module: 'artist',
			method: 'getimages',
			params: {
				artist: this.record.get('artist'),
				limit: 1
			},
			callback: function(response, request){
				if(!response.success){
					return;
				}
				var sizes = response.images.image.sizes.size;
				var image = '';
				Ext.each(sizes, function(size){
					if(size.name == "largesquare"){
						image = size.text;
						return false;
					}
				}, this);
				//Save the image to the imageStore
				this.imageStore.add({
					artist: this.record.get('artist'),
					image: image
				});
				this.imageStore.sync();
				
				//Set the image
				this.setImage(image);
			}
		});
	},
	
	onRender: function(){
		// Apply the renderData to the template args
        Ext.apply(this.renderData, this.record.data);
		this.callParent(arguments);
	},
	
	afterRender: function(){
		this.callParent(arguments);
		this.loadImage();
		this.initDragDrop();
	}
});