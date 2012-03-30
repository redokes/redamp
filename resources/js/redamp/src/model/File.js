Ext.define('RedAmp.model.File', {
	extend:'Ext.data.Model',
	fields:[{
		name:'text',
		type:'string'
	},{
		name: 'icon',
		type: 'string',
		convert: function(){
			console.log(arguments);
		}
	},{
		name:'leaf',
		type:'boolean'
	},{
		name:'fileName',
		type:'string'
	},{
		name:'fileSize',
		type:'string'
	},{
		name:'lastModifiedDate',
		type:'string'
	},{
		name:'name',
		type:'string'
	},{
		name:'size',
		type:'string'
	},{
		name:'type',
		type:'string'
	},{
		name:'webkitRelativePath',
		type:'string'
	}],

	proxy:{
		type:'memory',
		reader:{
			type:'json',
			root:'records'
		}
	}
});