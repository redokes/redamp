Ext.define('RedAmp.lastfm.model.RecentTrack', {
	extend:'Ext.data.Model',
	
	fields:[{
		name: 'attr',
		defaultValue: {}
	},{
		name:'album'
	},{
		name:'artist'
	},{
		name:'date'
	},{
		name: 'image'
	},{
		name: 'name'
	}]
});