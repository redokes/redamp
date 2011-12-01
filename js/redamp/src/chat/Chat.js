Ext.define('RedAmp.chat.Chat', {
	extend: 'RedAmp.module.Module',
	singleton: true,
	
	//Config
	config:{
		name: 'chat',
		title: 'Chat'
	},
	
	//Init Functions
	init: function(){
		//this.initMessagePanel();
		//this.initMessageHandler();
	},
	
	initMessagePanel: function(){
		//Create a message field so the user can send messages
		this.messageField = Ext.create('Ext.form.field.Text', {
    		//fieldLabel: 'Message',
	    	//labelWidth: 50,
			anchor: '100%',
	    	enableKeyEvents: true,
			emptyText: 'Type your message here...',
			listeners: {
				scope: this,
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        this.application.getSocketClient().send(
							'user',
							'message',
							{ message: this.messageField.getValue() }
						);
						
						this.getApplication().onModuleReady('stream', function(stream){
							stream.addMessage({
								text: "<b>Me: </b>" + this.messageField.getValue()
							});
						}, this);
						this.messageField.setValue('');
                    }
                }
            }
    	});
		
		//on key up, send a request to the server that says the user is typing or not typing
    	this.messageField.on('keyup', function(){
    		this.getApplication().getSocketClient().send(
				'user',
				'typing',
				{
					message: this.messageField.getValue()
				}
			);
    	}, this);
		
		//Create a toolbar to hold the message field
    	this.messagePanel = Ext.create('Ext.panel.Panel', {
			dock: 'bottom',
			layout: 'anchor',
			bodyPadding: 5,
			bodyCls: 'message-footer',
    	    items: [this.messageField]
    	});
		this.getApplication().getCenter().addDocked(this.messagePanel);
	},
	
	initMessageHandler: function(){
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'user',
			actions: {
				message: function(handler, response){
					//Share this on the stream
					this.getApplication().onModuleReady('stream', function(stream){
						stream.onViewReady(function(stream){
							stream.addMessage({
								text: '<b>' + response.storeData.id + ": </b>" + response.data.message,
								module: this.getModuleName()
							});
						}, this);
					}, this);
				},
				typing: function(handler, response){
					return;
					var panel = this.userList.down('#' + response.session);
					if(panel != null){
						if(response.data.message.length){	
							panel.getEl().down('.info').update('typing...');
						}
						else{
							panel.getEl().down('.info').update('');
						}
					}
				}
			}
		});
	}
});