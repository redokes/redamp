Ext.define('RedAmp.source.local.dd.TreeDragZone', {
    extend: 'Ext.dd.DragZone',
    containerScroll: false,
	animRepair: false,
	tree: false,
	view: false,
	ddel: false,
	proxyCls: 'redamp-lastfm-tree-proxy',

    constructor: function(tree, config) {
		this.tree = tree;
		this.view = tree.getView();
		this.callParent([tree.getView().getEl().dom.parentNode, config]);
		this.ddel = Ext.get(document.createElement('div'));
		this.ddel.addCls('redamp-lastfm-tree-proxy');
    },
	

    getDragData: function(e) {
        var view = this.view,
            item = e.getTarget(view.getItemSelector()),
            record, selectionModel, nodes;
			
		//If no item exists just return
		if(!item){
			return;
		}
		
		//Get the records
		selectionModel = view.getSelectionModel();
		nodes = selectionModel.getSelection();
		
		//Create the data
		var dragData = {
			event: new Ext.EventObjectImpl(e),
			view: view,
			item: item,
			records: this.getRecords(nodes),
			ddel: this.ddel.dom,
			fromPosition: Ext.fly(item).getXY()
		};
		
		//update the el
		this.updateDragEl(dragData);
		
		setTimeout(Ext.bind(function(){
			console.log(this.getProxy().getEl().dom);
		}, this), 500);
		
		//return the data
		return dragData;
    },
	
	getRecords: function(nodes) {
		var records = [];
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].childNodes && nodes[i].childNodes.length) {
				// Combine files with current file list
				var newRecords = this.getRecords(nodes[i].childNodes)
				var numRecords = newRecords.length;
				for (var j = 0; j < numRecords; j++) {
					records.push(newRecords[j]);
				}
			}
			else {
				records.push(nodes[i].raw.record);
			}
		}
		return records;
	},
	
	onInitDrag: function(){
		this.proxy.getEl().addCls(this.proxyCls);
		this.callParent(arguments);
	},
	
	updateDragEl: function(dragData){
		this.ddel.update(dragData.records.length);
	}
});
