Ext.define('RedAmp.model.Audio', {
	extend:'Ext.data.Model',
	
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
	
	play: function(player){
		player.setText(this.data);
		player.setSrc(this.get('url'));
		player.play();
	}
});