Ext.define('RedAmp.file.store.Tag', {
    extend: 'Ext.data.Store',
    singleton: true,
    autoLoad: true,
    listeners:{
        load:{
            fn: function(){
                this.removeAll();
				this.getProxy().clear();
				this.sync();
            }
        }
    },
    
    fields:[{
        name: 'path',
        type: 'string'
    },{
        name: 'artist',
        type: 'string'
    },{
        name: 'album',
        type: 'string'
    },{
        name: 'title',
        type: 'string'
    },{
        name: 'track',
        type: 'int'
    },{
        name: 'year',
        type: 'int'
    },{
        name: 'genre',
        type: 'string'
    }],
    proxy: {
        type: 'localstorage',
        id  : 'redamp-file-store-tag'
    }
});
