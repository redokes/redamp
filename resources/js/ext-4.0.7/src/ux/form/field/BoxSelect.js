/**
 * @class Ext.ux.form.field.BoxSelect
 * @extends Ext.form.field.ComboBox
 * 
 * BoxSelect for ExtJS 4, a combo box improved for multiple value querying, selection and management.
 * 
 * A friendlier combo box for multiple selections that creates easily individually
 * removable labels for each selection, as seen on facebook and other sites. Querying
 * and type-ahead support are also improved for multiple selections.
 * 
 * Options and usage mostly remain consistent with the {@link Ext.form.field.ComboBox}
 * control, with the notable difference being forceSelection must be true and added
 * support for multiSelect and typeAhead to coexist. The defaults for selectOnFocus
 * and multiSelect have been overridden for better usability in the default use case,
 * but should still work properly if overridden.
 * 
 * Inspired by the SuperBoxSelect component for ExtJS 3 (http://technomedia.co.uk/SuperBoxSelect/examples3.html), 
 * which in turn was inspired by the BoxSelect component for ExtJS 2 (http://efattal.fr/en/extjs/extuxboxselect/).
 * 
 * Various contributions and suggestions made by members of the ExtJS community, 
 * in the user extension posting: http://www.sencha.com/forum/showthread.php?134751-Ext.ux.form.field.BoxSelect
 * 
 * @author kvee_iv http://www.sencha.com/forum/member.php?29437-kveeiv
 * @version 0.5
 * @requires BoxSelect.css
 * @xtype boxselect
 */
Ext.define('Ext.ux.form.field.BoxSelect', {
    extend:'Ext.ux.form.field.RealComboBox',
    alias: ['widget.comboboxselect', 'widget.boxselect'],

    /**
     * @cfg {Boolean} selectOnFocus <tt>true</tt> to automatically select any existing field text when the field
     * receives input focus (defaults to <tt>true</tt> for best multi-select usability during querying)
     */
	selectOnFocus: true,

    /**
     * @cfg {Boolean} multiSelect
     * If set to <code>true</code>, allows the combo field to hold more than one value at a time, and allows selecting
     * multiple items from the dropdown list. (Defaults to <code>true</code>, the default usage for BoxSelect)
     */
    multiSelect: true,

	// private
	forceSelection: true, // changing this will have no effect

	// private
	fieldSubTpl: [
		'<div class="x-boxselect">',
			'<ul class="x-boxselect-list {fieldCls} {typeCls}">',
				'<li class="x-boxselect-input">',
					'<input id="{id}" type="{type}" ',
						'<tpl if="name">name="{name}" </tpl>',
						'<tpl if="size">size="{size}" </tpl>',
						'<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
						'class="x-boxselect-input-field" autocomplete="off" />',
				'</li>',
			'</ul>',
			'<div class="{triggerWrapCls}" role="presentation">',
				'{triggerEl}',
				'<div class="{clearCls}" role="presentation"></div>',
			'</div>',
		'</div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

	// private
	renderSelectors: {
		itemList: 'ul.x-boxselect-list',
		inputEl: 'input.x-boxselect-input-field',
		inputElCt: 'li.x-boxselect-input'
	},

	//private
    componentLayout: 'boxselectfield',

	/**
	 * Initialize additional settings and enable simultaneous typeAhead and multiSelect support 
	 */
    initComponent: function() {
        var me = this,
			typeAhead = me.typeAhead;

        if (typeAhead && !me.editable) {
            Ext.Error.raise('If typeAhead is enabled the combo must be editable: true -- please change one of those settings.');
        }

		Ext.apply(me, {
			forceSelection: true,
			typeAhead: false,
			filteredSelections: new Ext.util.MixedCollection(false, function(record) {
				return record.get(me.valueField);
			})
		});

		this.callParent(arguments);

		me.typeAhead = typeAhead;
		
		this.on('change', function() {
			if(this.rendered){
				if (this.getHeight()) {
					this.setHeight(this.getEl().down('.x-boxselect-list').getHeight() + 20);
				}
			}
        }, this);
    },

	/**
	 * Register events for multiSelect management controls
	 */
	initEvents: function() {
		var me = this;

		me.callParent();

		me.mon(me.itemList, {
			'click': {
				fn: me.onItemListClick,
				scope: me
			}
		});
		me.mon(me.store, {
			'beforeload': {
				fn: me.holdFilteredSelections,
				scope: me
			},
			'datachanged': {
				fn: me.trackFilteredSelections,
				buffer: 10,
				scope: me
			}
		});
	},

	onDestroy: function() {
		var me = this;

		Ext.destroyMembers(me, 'filteredSelections');

		me.callParent();
	},

	/**
	 * Overridden to avoid use of placeholder, as our main input field is often empty
	 */
	afterRender: function() {
		var me = this;

		if (Ext.supports.Placeholder && me.inputEl && me.emptyText) {
			delete me.inputEl.dom.placeholder;
		}

		me.callParent();
	},

	/**
	 * Overridden to search store snapshot instead of data (if available)
	 */
	findRecord: function(field, value) {
        var ds = this.store,
			rec = false,
            idx;
				
		if (ds.snapshot) {
			idx = ds.snapshot.findIndexBy(function(rec) {return rec.get(field) === value;});
			rec = (idx !== -1) ? ds.snapshot.getAt(idx) : false;
		} else {
			idx = ds.findExact(field, value);
			rec = (idx !== -1) ? ds.getAt(idx) : false;
		}

		return rec;
    },

	/**
	 * Overridden to map previously selected records to the "new" versions of the records 
	 * based on value field, if they are part of the new store load
	 */
	onLoad: function() {
		var me = this,
			valueField = me.valueField;

		if (!Ext.isEmpty(me.lastSelection)) {
			Ext.Array.forEach(me.lastSelection, function(selectedRecord, idx) {
				var r = me.findRecord(valueField, selectedRecord.get(valueField));
				if (r) {
					me.lastSelection[idx] = r;
				}
			});
		}
		if (!Ext.isEmpty(me.valueModels)) {
			Ext.Array.forEach(me.valueModels, function(selectedRecord, idx) {
				var r = me.findRecord(valueField, selectedRecord.get(valueField));
				if (r) {
					me.valueModels[idx] = r;
				}
			});
		}
		if (me.filteredSelections) {
			me.filteredSelections.eachKey(function(value, selectedRecord) {
				var r = me.findRecord(valueField, value);
				if (r) {
					me.filteredSelections.replace(r);
				}
			});
		}
		
		me.callParent();
	},

	/**
	 * Used to determine if a record is filtered (for retaining as a multi-select value)
	 */
	isFilteredRecord: function(record) {
		var me = this,
			store = me.store,
			valueField = me.valueField,
			storeRecord;

		storeRecord = store.findExact(valueField, record.get(valueField));

		return ((storeRecord === -1) && (!store.snapshot || (me.findRecord(valueField, record.get(valueField)) !== false)))
	},

	/**
	 * Grabs all of the current selection in to filteredSelections, for holding between store loads
	 */
	holdFilteredSelections: function() {
		var me = this,
			lastSelection = me.lastSelection;

		if (lastSelection) {
			me.filteredSelections.addAll(me.lastSelection);
		}
	},

	/**
	 * Watch for changes on the store's data to keep filteredSelections up to date
	 */
	trackFilteredSelections: function() {
		var me = this;
		me.filteredSelections = me.filteredSelections.filterBy(me.isFilteredRecord, me);
	},

	/**
	 * Overridden to allow for continued querying with multiSelect selections already made
	 */
	doRawQuery: function() {
		var me = this,
			rawValue = me.inputEl.dom.value;
			
		if (me.multiSelect) {
			rawValue = rawValue.split(me.delimiter).pop();
		}

		this.doQuery(rawValue);
    },

	/**
	 * Overridden to preserve multiSelect selections when list is refiltered via overridden doRawQuery
	 */
	onListSelectionChange: function(list, selectedRecords) {
        var me = this,
			valueField = me.valueField,
			mergedRecords = [],
			i;

        // Only react to selection if it is not called from setValue, and if our list is
        // expanded (ignores changes to the selection model triggered elsewhere)
        if (!me.ignoreSelection && me.isExpanded) {
			if (!Ext.isEmpty(me.lastSelection)) {
				Ext.Array.forEach(me.lastSelection, function(selectedRecord) {
					if (Ext.Array.contains(selectedRecords, selectedRecord)) {
						// in current selection
						mergedRecords.push(selectedRecord);
					} else if (me.isFilteredRecord(selectedRecord)) {
						// is now filtered
						mergedRecords.push(selectedRecord);
						me.filteredSelections.add(selectedRecord);
					} else if (me.filteredSelections.containsKey(selectedRecord.get(valueField))) {
						// was already filtered
						mergedRecords.push(selectedRecord);
					}
				});

				// combine remaining current selections and previously filtered selections
				mergedRecords = Ext.Array.merge(Ext.Array.merge(mergedRecords, selectedRecords), me.filteredSelections.getRange());
			} else {
				mergedRecords = selectedRecords;
			}


			i = Ext.Array.intersect(mergedRecords, me.lastSelection).length;
			if ((i != mergedRecords.length) || (i != me.lastSelection.length)) {
				me.setValue(mergedRecords, false);
				if (!me.multiSelect) {
					Ext.defer(me.collapse, 1, me);
				} 
				if (me.valueModels.length > 0) {
					me.fireEvent('select', me, me.valueModels);
				}
				me.inputEl.focus();
			}
			me.alignPicker();
        }
    },

	/**
     * Overridden to look up existence of records by valueField instead of exact object, and to include filteredSelections
     */
    syncSelection: function() {
        var me = this,
            ExtArray = Ext.Array,
            picker = me.picker,
			valueField = me.valueField,
            selection, selModel;

        if (picker) {
            // From the value, find the Models that are in the store's current data
            selection = [];
			
			var loopData = [];
			if (me.filteredSelections && me.valueModels) {
				loopData = me.valueModels.concat(me.filteredSelections);
			}
			ExtArray.forEach(loopData, function(value) {
				if (value && value.isModel && (picker.store.findExact(valueField, value.get(valueField)) !== -1)) {
					selection.push(value);
				}
			});

            // Update the selection to match
            me.ignoreSelection++;
            selModel = picker.getSelectionModel();
            selModel.deselectAll();
            if (selection.length) {
                selModel.select(selection);
            }
            me.ignoreSelection--;
        }
    },

	/**
	 * Overridden to align to itemList size instead of inputEl
     */
    alignPicker: function() {
        var me = this,
            picker, isAbove,
            aboveSfx = '-above',
			itemBox = me.itemList.getBox(false, true);

        if (this.isExpanded) {
            picker = me.getPicker();
            if (me.matchFieldWidth) {
                // Auto the height (it will be constrained by min and max width) unless there are no records to display.
                picker.setSize(itemBox.width, picker.store && picker.store.getCount() ? null : 0);
            }
            if (picker.isFloating()) {
                picker.alignTo(me.itemList, me.pickerAlign, me.pickerOffset);

                // add the {openCls}-above class if the picker was aligned above
                // the field due to hitting the bottom of the viewport
                isAbove = picker.el.getY() < me.inputEl.getY();
                me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
                picker.el[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
            }
        }
    }, 

	/**
	 * Intercept backspaces and deletes when user input is empty to remove the last selected entry
	 */
    onKeyUp: function(e, t) {
        var me = this,
            key = e.getKey(),
			value = me.value;

        if (!me.readOnly && !me.disabled && me.editable && (key == e.BACKSPACE || key == e.DELETE) && (me.inputEl.dom.value == '') && 
					Ext.isEmpty(me.lastInputValue) && (value.length > 0)) {
			me.removeByListItemIndex(me.multiSelect ? value.length - 1 : 0);
			me.inputEl.focus();
		} else {
			me.callParent([e,t]);
		}

		// tracker to make sure we were empty before the backspace/delete, since the field will be empty by the time we know
		me.lastInputValue = me.inputEl.dom.value;
    },

	/**
	 * Overridden to get and set the dom value directly for type-ahead suggestion (bypassing get/setRawValue)
	 */
	onTypeAhead: function() {
        var me = this,
            displayField = me.displayField,
			inputElDom = me.inputEl.dom,
            record = me.store.findRecord(displayField, inputElDom.value),
            boundList = me.getPicker(),
            newValue, len, selStart;

        if (record) {
            newValue = record.get(displayField);
            len = newValue.length;
            selStart = inputElDom.value.length;
            boundList.highlightItem(boundList.getNode(record));
            if (selStart !== 0 && selStart !== len) {
				inputElDom.value = newValue;
                me.selectText(selStart, newValue.length);
            }
        }
    },

	/**
	 * Delegation control for removing selected items or triggering list collapse/expansion
	 */
	onItemListClick: function(evt, el, o) {
		var me = this,
			itemEl = evt.getTarget('.x-boxselect-item'),
			closeEl = itemEl ? evt.getTarget('.x-boxselect-item-close') : false;

		if (!closeEl) {
			me.onTriggerClick();
			return;
		}

		me.removeByListItemNode(itemEl);
	},

	/**
	 * Build the markup for the multi-selected items. Template must be built on demand due to combobox initComponent
	 * lifecycle for the creation of on-demand stores (to account for automatic displayField setting)
	 */
	getMultiSelectItemMarkup: function() {
		var me = this;

		if (!me.multiSelectItemTpl) {
			me.multiSelectItemTpl = [
				'<tpl for=".">',
						'<li class="x-boxselect-item" ',
						'qtip="{[typeof values === "string" ? values : values.' + me.displayField + ']}">' ,
						'<div class="x-boxselect-item-text">{[typeof values === "string" ? values : values.' + me.displayField + ']}</div>',
						'<div class="x-tab-close-btn x-boxselect-item-close"></div>' ,
						'</li>' ,
					'</tpl>',
				{
					compile: true,
					disableFormats: true
				}
			];
		}

        return this.getTpl('multiSelectItemTpl').apply(this.valueModels ? Ext.Array.pluck(this.valueModels, 'data') : this.value);
	},

	/**
	 * Removal of value by node reference
	 */
	removeByListItemNode: function(itemEl) {
		var me = this,
			itemIdx = 0,
			searchEl = me.itemList.dom.firstChild;

		while (searchEl && searchEl.nextSibling) {
			if (searchEl == itemEl) {
				break;
			}
			itemIdx++;
			searchEl = searchEl.nextSibling;
		}
		itemIdx = (searchEl == itemEl) ? itemIdx : false;

		if (itemIdx !== false) {
			me.removeByListItemIndex(itemIdx);
			me.inputEl.focus();
		}
	},

	/**
	 * Removal of value by selected items index
	 */
	removeByListItemIndex: function(index) {
		var me = this,
			value = Ext.Array.from(Ext.clone(me.value)),
			removedValue = value.splice(index, 1);
		me.filteredSelections.removeAtKey(removedValue);
		me.setValue(value);
	},

	/**
	 * Intercept calls to getRawValue to pretend there is no inputEl for rawValue handling, 
	 * so that we can use inputEl for just the user input.
	 */
	getRawValue: function() {
		var me = this,
			inputEl = me.inputEl,
			result;
		me.inputEl = false;
		result = me.callParent(arguments);
		me.inputEl = inputEl;
		return result;
	},

	/**
	 * Intercept calls to setValue to include filteredSelections
	 */
	setValue: function(value, doSelect) {
		var me = this,
			record, len, i, filteredSelection, h;

		if (Ext.isEmpty(value)) {
			value = [];
		} else {
			value = Ext.Array.from(value);
		}

		if (me.filteredSelections && me.filteredSelections.getCount() > 0) {
			for (i = 0, len = value.length; i < len; i++) {
				record = value[i];
				if (!record || !record.isModel) {
					filteredSelection = me.filteredSelections.getByKey(record);
					if (filteredSelection) {
						value[i] = filteredSelection;
					}
				} 
			}
		} 

		/**
		 * For single-select boxes, use the most recent selection
		 */
		if (!me.multiSelect && (value.length > 0)) {
			value = value[value.length - 1];
		}

		me.callParent([value, doSelect]);

		if (me.filteredSelections) {
			me.filteredSelections = me.filteredSelections.filterBy(function(rec) {
				return Ext.Array.contains(me.valueModels, rec);
			});
		}
	},

	/**
	 * Intercept calls to setRawValue to pretend there is no inputEl for rawValue handling, so that we can use inputEl 
	 * for just the user input. Update the multiSelect items list display based on the new values.
	 */
	setRawValue: function(value) {
        var me = this,
			inputEl = me.inputEl,
			result, rawValues;

		me.inputEl = false;
		result = me.callParent([value]);
		me.inputEl = inputEl;

		if (inputEl && me.multiSelect) {
			rawValues = result.split(me.delimiter);
			if (rawValues.length != me.value.length) {
				inputEl.dom.value = Ext.value(rawValues[rawValues.length - 1], '');
			} else if (me.emptyText === inputEl.dom.value) {
				inputEl.dom.value = '';
			}
		}

		if (me.itemList) {
			me.el.appendChild(me.inputElCt);
			me.itemList.update(me.getMultiSelectItemMarkup());
			me.itemList.appendChild(me.inputElCt);
			me.alignPicker();
		}

        return result;
    },

	/**
	 * Overridden to handle forcing selections on multiSelect values more directly
	 */
    assertValue: function() {
        var me = this,
			rawValue = me.inputEl.dom.value,
			rec = rawValue ? me.findRecordByDisplay(rawValue) : false;

		if (rec && !Ext.Array.contains(me.value, rec.get(me.valueField))) {
			me.setValue(me.value.concat(rec.get(me.valueField)));
		}

		me.inputEl.dom.value = '';

        me.collapse();
    },

	/**
	 * Overridden to use value (selection) instead of raw value and to avoid the use of placeholder
	 */
	applyEmptyText : function() {
		var me = this,
            emptyText = me.emptyText,
            isEmpty;

        if (me.rendered && emptyText) {
            isEmpty = me.value.length < 1 && !me.hasFocus;
            
            if (isEmpty) {
                me.setRawValue(emptyText);
                me.inputEl.addCls(me.emptyCls);
            }

            me.autoSize();
        }
    },

	/**
	 * Intercept calls to onFocus to add focusCls, because the base field classes assume this should be applied to inputEl
	 */
    onFocus: function() {
        var me = this,
            focusCls = me.focusCls,
            itemList = me.itemList;

        if (focusCls && itemList) {
            itemList.addCls(focusCls);
        }

		me.callParent();
	},

	/**
	 * Intercept calls to onBlur to remove focusCls, because the base field classes assume this should be applied to inputEl
	 */
	onBlur: function() {
		var me = this,
            focusCls = me.focusCls,
            itemList = me.itemList;

        if (focusCls && itemList) {
            itemList.removeCls(focusCls);
        }

		me.callParent();
	},

	/**
	 * Ensure inputEl is sized well for user input using the remaining horizontal space available in the list element
	 */
	autoSize: function() {
		if(!this.rendered){
            return this;
        }

		var me = this,
        	inputElCt = me.inputElCt,
			itemList = me.itemList,
			listBox = itemList.getBox(true, true),
			listWidth = listBox.width, 
			newWidth, newHeight, offsets;

		inputElCt.setWidth('1px');
		offsets = inputElCt.getOffsetsTo(itemList);
		newWidth = listWidth - offsets[0];
		if (newWidth < 35) {
			newWidth = listWidth;
		}

		inputElCt.setWidth(newWidth + 'px');

		me.callParent();

		newHeight = itemList.getHeight();
		if (!me.lastHeight) {
			me.lastHeight = newHeight;
		} else if (me.lastHeight != newHeight) {
			me.fireEvent('autosize', newHeight);
			me.lastHeight = newHeight;
			me.alignPicker();
		}
	}

});

/**
 * Overridden to resize the field at the item list wrap instead of the inputEl
 */
Ext.define('Ext.ux.layout.component.field.BoxSelectField', {

    /* Begin Definitions */

    alias: ['layout.boxselectfield'],

    extend: 'Ext.layout.component.field.Field',

    /* End Definitions */

    type: 'boxselectfield',

    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner,
            itemList = owner.itemList,
            triggerWrap = owner.triggerWrap,
            triggerWidth = owner.getTriggerWidth();

        // If we or our ancestor is hidden, we can get a triggerWidth calculation
        // of 0.  We don't want to resize in this case.
        if (owner.hideTrigger || owner.readOnly || triggerWidth > 0) {
            // Decrease the field's width by the width of the triggers. Both the field and the triggerWrap
            // are floated left in CSS so they'll stack up side by side.
            me.setElementSize(itemList, Ext.isNumber(width) ? width - triggerWidth : width);
    
            // Explicitly set the triggerWrap's width, to prevent wrapping
            triggerWrap.setWidth(triggerWidth);

			owner.autoSize();
        }
    }
});
