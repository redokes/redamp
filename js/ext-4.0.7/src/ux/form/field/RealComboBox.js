Ext.define('Ext.ux.form.field.RealComboBox', {
	extend:'Ext.form.field.ComboBox',
	
	alias: ['widget.realcombobox', 'widget.realcombo'],
	isStoreLoaded: false,
	autoSetRecord:false,
	
	initComponent: function() {
		this.callParent(arguments);
		this.initHiddenField();
		this.initFocusExtensions();
		this.initStoreExtensions();
		this.initValueExtensions();
	},
	
	initStoreExtensions: function(){
		this.store.on('load', function(){
			this.isStoreLoaded = true;
		}, this);
	},
	
	initHiddenField: function(){
		this.on('afterrender', function() {
			this.hiddenField = Ext.get(Ext.core.DomHelper.append(this.getEl(), {
				tag:'input',
				type:'hidden',
				name:this.hiddenName
			}));
			this.hiddenField.dom.value = this.getValue();
		}, this);
	},
	
	initFocusExtensions: function(){
		return;
		this.on('focus', function(){
			if(this.getPicker().isHidden() && (this.getValue() == '' || this.getValue() == null) && this.queryMode != 'local'){
				this.doQuery(this.getValue());
			}
			this.expand();
		}, this);
		
		this.on('afterrender', function(){
			this.inputEl.on('click', function(){
				if(!this.storeLoaded){
					this.doQuery(this.getValue());
				}
			}, this);
		}, this);
	},
	
	initValueExtensions: function(){
		if (this.autoSetRecord) {
			this.on('afterrender', function(){
				if(this.getRawValue() == '' && this.getValue() != ''){
					if(this.isStoreLoaded){
						var record = this.store.getAt(this.store.find(this.valueField, this.getValue()));
						if(record != null){
							this.setRawValue(record.get(this.displayField));
						}
					}
					else{
						this.store.on('load', function(){
							var record = this.store.getAt(this.store.find(this.valueField, this.getValue()));
							if(record != null){
								this.select(record);
							}
							else{
								var params = {};
								params[this.valueField] = this.getValue();
								this.loadFromStore(params, false);
							}
						}, this, {single: true});
					}
				}
			}, this);
		}
	},
	
	setValue: function(value, doSelect) {
		this.callParent(arguments);
		value = this.getValue();
		
		if(!this.rendered && this.hiddenName != null){
			this.on('afterrender', function(field, options){
				this.setHiddenValue(options.value);
			}, this, {value: value});
			return false;
		}
		this.setHiddenValue(value);
	},
	
	setHiddenValue: function(value){
		if(!this.rendered){
			this.on('afterrender', function(field, options){
				this.setHiddenValue(options.value);
			}, this, {value: value});
			return false;
		}
		if (this.hiddenField) {
			this.hiddenField.dom.value = value;
		}
	},
	
	getParams: function(queryString) {
		if(this.pageSize){
			this.store.currentPage = 1;
		}
		if(this.store.proxy.extraParams != null){
			this.store.proxy.extraParams.query = queryString;
		}
        return this.callParent(arguments);
    },
	
	getRealValue: function() {
		return this.hiddenField.getValue();
	},
	
	loadFromStore: function(params, fireEvent) {
		if (fireEvent == null) {
			fireEvent = true;
		}
		this.store.on('load', function(store, records, successful, options){
			if(records.length){
				this.select(records[0]);
				if (fireEvent) {
					this.fireEvent('select', this, records);
				}
			}
		}, this, {single: true });
		this.store.load({
			params:params
		});
	}
	
});