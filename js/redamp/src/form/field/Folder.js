Ext.define('RedAmp.form.field.Folder', {
	extend: 'Ext.form.field.File',
	
	buttonOnly: true,
	lastEvent: null,

    createFileInput : function() {
        var me = this;
        me.fileInputEl = me.button.el.createChild({
            name: me.getName(),
            cls: Ext.baseCSSPrefix + 'form-file-input',
            tag: 'input',
            type: 'file',
			webkitdirectory: true
        }).on('change', me.onFileChange, me);
		
		me.fileInputEl.on('change', function(e) {
			this.lastEvent = e;
			this.fireEvent('select', this, this.fileInputEl, e);
		}, this);
    },
	
	getDirectory: function(){
		var directory = false;
		if(this.lastEvent != null){
			var files = this.getFiles();
			directory = files[0].webkitRelativePath.split('/')[0];
		}
		return directory;
	},
	
	getFiles: function(){
		var files = [];
		if(this.lastEvent != null){
			files = this.lastEvent.target.files;
		}
		return files;
	}
});

