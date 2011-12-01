/**
 *
 */
Ext.define('RedAmp.navigation.Item', {
	extend: 'Ext.button.Button',
	
	//Config
	badgeText: '',
	padding: 4,
	
	initComponent: function(){
		this.initBadge();
		this.callParent(arguments);
	},
	
	initBadge: function(){
		if(!this.rendered){
			this.on('afterrender', function(){
				this.initBadge();
			}, this);
			return;
		}
		
		this.badgeEl = Ext.get(this.getEl().createChild({
            tag: 'div',
			html: this.badgeText,
			cls: 'button-badge'
        }));
		if(!this.badgeText.length){
			this.badgeEl.hide();
		}
	},
	
	setBadgeText: function(text){
		this.badgeText = text;
		if(this.rendered){
			this.badgeEl.update(text);
			
			if(this.badgeText.toString().length){
				this.badgeEl.show();
			}
			else{
				this.badgeEl.hide();
			}
		}
	},
	
	getBadgeText: function(){
		return this.badgeText;
	}
});