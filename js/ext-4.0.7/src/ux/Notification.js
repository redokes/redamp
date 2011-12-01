Ext.ux.NotificationMgr = {
    positions: []
};
    
Ext.define('Ext.ux.Notification', {
    extend: 'Ext.Window',
   
    initComponent: function(){
        Ext.apply(this, {
            iconCls: this.iconCls || 'x-icon-information',
            cls: 'x-notification',
            width: 200,
            autoHeight: true,
            plain: true,
            border:false,
            draggable: false,
            shadow:true,
            bodyStyle: 'text-align:center'
        });
        if(this.autoDestroy) {
            this.task = new Ext.util.DelayedTask(this.hide, this);
        } else {
            this.closable = true;
        }
        Ext.ux.Notification.superclass.initComponent.apply(this);
    },
    setMessage: function(msg){
        this.body.update(msg);
    },
    setTitle: function(title, iconCls){
        Ext.ux.Notification.superclass.setTitle.call(this, title, iconCls||this.iconCls);
    },
    onDestroy: function(){
        Ext.ux.NotificationMgr.positions.splice(this.pos);
        Ext.ux.Notification.superclass.onDestroy.call(this);   
    },
    cancelHiding: function(){
        this.addClass('fixed');
        if(this.autoDestroy) {
            this.task.cancel();
        }
    },
    afterShow: function(){
        
        Ext.ux.Notification.superclass.afterShow.call(this);
        Ext.fly(this.body.dom).on('click', this.cancelHiding, this);
        if(this.autoDestroy) {
            this.task.delay(this.hideDelay || 5000);
       }
    },
    
    beforeShow:function(){
        this.el.hide();
    },
    
    onShow: function(){
        var me = this;
        
        this.pos = 0;
        while(Ext.ux.NotificationMgr.positions.indexOf(this.pos)>-1)
            this.pos++;
        Ext.ux.NotificationMgr.positions.push(this.pos);
        
        this.el.alignTo(document, "br-br", [ -20, -20-((this.getSize().height+10)*this.pos) ]);
        this.el.slideIn('b', {
            duration: 500,
            listeners:{
                afteranimate:{
                    fn: function() {
                          me.el.show();
                    }
                }
            }
        });
        
        
    },
    onHide: function(){
        this.el.disableShadow();
        this.el.ghost("b", {duration: 500,remove: true});
         Ext.ux.NotificationMgr.positions.splice(this.pos);
    },
    focus: Ext.emptyFn
});