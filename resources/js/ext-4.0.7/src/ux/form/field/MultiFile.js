Ext.define("Ext.ux.form.field.MultiFile", {
    extend: 'Ext.form.field.File',
    
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to true).  If true, all inherited Text members will still be available.
     */
    buttonOnly: true,
    
    /**
     * The GridPanel element which contains the list of filenames.
     */
    listFilesPanel: null,
    
    /**
     * The store of the GridPanel element which contains the list of filenames.
     */
    listFilesStore: null,
    
    /**
     * Width of the GridPanel element.
     */
    listFilesWidth: 200,
    
    /**
     * Height of the GridPanel element.
     */
    listFilesHeight: 70,
    
    // private
    onRender: function() {
        var me = this,
            inputEl;


        me.callParent(arguments);
        
        // Creates the GridPanel element which contains the list of filenames
        me.createFileList();
    },
    
    /**
     * @private
     * Creates the file input element. It is inserted into the trigger button component, made
     * invisible, and floated on top of the button's other content so that it will receive the
     * button's clicks.
     */
    createFileInput : function() {
        var me = this;
        me.fileInputEl = me.button.el.createChild({
            name: me.getName(),
            cls: Ext.baseCSSPrefix + 'form-file-input',
            tag: 'input',
            type: 'file',
            size: 1,
            multiple: 'multiple'
        }).on('change', me.onFileChange, me);
    },


    /**
     * @private
     * Creates the GridPanel element which contains the list of filenames.
     */
    createFileList : function() {
    	var me = this;
    	
    	// Creates the store
    	me.listFilesStore = Ext.create('Ext.data.Store', {
    	    fields: ['filename'],
    	    sorters: [{
    	    	property : 'filename',
    	    	direction: 'ASC'
    		}],
    	    data: [{filename: '<i>' + __('No_File') + '</i>'}]
    	});
    	
    	// Creates the GridPanel
    	me.listFilesPanel = Ext.create('Ext.grid.GridPanel', {
    	    store: me.listFilesStore,
    	    columns: [{
    	    	header: 'Filename',
    	    	dataIndex: 'filename',
    	    	flex: 1
    	    }],
    	    hideHeaders: true,
    	    defaults: {
                flex: 1
            },
            padding: '0 0 0 2',
    	    width: me.listFilesWidth,
    	    height: me.listFilesHeight,
    	    renderTo: me.bodyEl
    	});
    },
    
    /**
     * @private Event handler fired when the user selects a file.
     */
    onFileChange: function() {
    	var me = this;
    	var fileEl = me.fileInputEl.dom;
    	var i = 0;
    	
    	me.callParent();
    	
        // Removes filenames from the store of the GridPanel
    	me.clearFileList();
        
        if (fileEl.files != undefined && fileEl.files != null) {
        	if(fileEl.files.length > 0) {
	        	// Adds each filenames to the store of the GridPanel
	        	for (i=0; i<fileEl.files.length; i++) {
	        		me.listFilesStore.add({filename: fileEl.files[i].fileName});
	        	}
	        	// Sort the store
	        	me.listFilesStore.sort('filename', 'ASC');
        	}
        } else { // For IE : keep only the filename and not the path
        	var fname = fileEl.value;
        	var lastSlash = fname.lastIndexOf('/');
        	var backSlash = fname.lastIndexOf('\\');
        	
        	lastSlash = Math.max(lastSlash, backSlash);
        	if(lastSlash > -1) {
        		fname = fname.substring(lastSlash + 1);
        	}        	
        	me.listFilesStore.add({filename: fname});
        }
    },
    
    /**
     * Removes filenames from the store of the GridPanel.
     */
    clearFileList: function() {
    	var me = this;
    	var storeSize = me.listFilesStore.count();
    	// Removes filenames from the store of the GridPanel
        for (i=0; i<storeSize; i++) {
        	me.listFilesStore.removeAt(0);
        }
    },
    
    /**
     * Removes filenames from the store of the GridPanel and the item 'No file'
     */
    initFileListWithNoFile: function() {
    	var me = this;
    	var storeSize = me.listFilesStore.count();
    	// Removes filenames from the store of the GridPanel
        for (i=0; i<storeSize; i++) {
        	me.listFilesStore.removeAt(0);
        }
        me.listFilesStore.add({filename: '<i>' + __('No_File') + '</i>'});
    }
    
});