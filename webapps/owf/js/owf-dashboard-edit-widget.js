var guid = guid || {};
var Ozone = Ozone || {};
Ozone.util = Ozone.util || {};

guid.util = function() {
	function S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
	return {
		guid : function () {
		  	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		}
	};
}();

/**
 * @description Returns a globally unique identifier (guid)
 * 
 * @returns {String} guid
 */
Ozone.util.guid = function() {
    return guid.util.guid();
}
Ext.define('Ozone.data.Dashboard', {
    extend: 'Ext.data.Model',
    idProperty: 'guid',
    fields:[
        'alteredByAdmin',
        'guid',
        {name:'id', mapping: 'guid'},
        { name: 'isdefault', type: 'boolean', defaultValue: false },
        { name: 'dashboardPosition', type: 'int' },
        'EDashboardLayoutList',
        'name',
        { name: 'state', defaultValue: [] },
        'removed',
        'groups',
        'isGroupDashboard',
        'description',
        'createdDate',
        'prettyCreatedDate',
        'editedDate',
        'prettyEditedDate',
        { name: 'stack', defaultValue: null },
        { name: 'locked', type: 'boolean', defaultValue: false },
        { name: 'layoutConfig', defaultValue: null },
        { name: 'createdBy', model: 'User'},
        { name: 'user', model: 'User'}
    ],

    constructor: function(data, id, raw) {
        if(data.layoutConfig && typeof data.layoutConfig === 'string' && data.layoutConfig !== Object.prototype.toString()) {
            data.layoutConfig = Ext.JSON.decode(data.layoutConfig);
        }

        //todo see if we still need this
        if(data.layoutConfig === Object.prototype.toString()) {
            data.layoutConfig = "";
        }

        if(!data.guid) {
            data.guid = guid.util.guid();
        }

        this.callParent(arguments);
    }
});
Ext.define('Ozone.data.stores.AdminDashboardStore', {
    extend:'Ozone.data.OWFStore',
    model: 'Ozone.data.Dashboard',
    alias: 'store.admindashboardstore',
    remoteSort: true,
    totalProperty:'results',
    sorters: [
        {
            property : 'dashboardPosition',
            direction: 'ASC'
        }
    ],
    constructor: function(config) {

        Ext.applyIf(config, {
            api: {
                read: "/dashboard",
                create: "/dashboard",
                update: "/dashboard",
                destroy: "/dashboard"
            },
            reader: {
                root: 'data'
            },
            writer: {
                root: 'data'
            }
        });

        this.callParent(arguments);
    },
  
    reorder: function() {
        if (this.getCount() > 0) {
            for (var i = 0; i < this.getCount(); i++) {
                var dashboard = this.getAt(i);
                dashboard.set('dashboardPosition', i + 1);
            }
        }
    }

});
Ext.define('Ozone.data.Group', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'id', type: 'int' },
        { name: 'description', type: 'string' },
        { name: 'totalWidgets', type: 'int' },
        { name: 'totalUsers', type: 'int' },
        { name: 'totalStacks', type: 'int' },
        { name: 'automatic', type: 'boolean' },
        { name: 'stackDefault', type: 'boolean' },
        { name: 'status', type: 'string' },
        { name: 'displayName', type: 'string' },
        { name: 'email', type: 'string'},
        { name: 'title', mapping:'displayName'}
    ]
});
Ext.define('Ozone.data.GroupStore', {
    extend:'Ozone.data.OWFStore',
    model: 'Ozone.data.Group',

    sorters: [
      {
        property : 'displayName',
        direction: 'ASC'
      }
    ],

    constructor:function(config) {
        
        config = config ? config : {};
    	
        Ext.applyIf(config, {
            api: {
                read: '/group',
                create: '/group',
                update: '/group',
                destroy: '/group'
            },
            fields: ['id', 'name', 'description', 'totalWidgets', 'totalUsers', 'totalStacks', 'automatic', 'stackDefault', 'status', 'displayName', 'email'],
            autoDestroy: true
        });
    	
        this.callParent(arguments);
    }
});
Ext.define('Ozone.components.admin.GroupsGrid', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.groupsgrid'],
    plugins: new Ozone.components.focusable.FocusableGridPanel(),

    title: 'Groups',
    columns: [
        {
          itemId: 'id',
          header: 'ID',
          dataIndex: 'id',
          sortable: true,
          hidden: true
        },
        {
            header: 'Group Name',
            dataIndex: 'displayName',
            flex: 3,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return this.renderCell(Ext.htmlEncode(value ? value : record.data.name), metaData, record);
            }
        }, {
            header: 'Users',
            dataIndex: 'totalUsers',
            flex: 1,
            sortable: false,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return this.renderCell(value, metaData, record);
            }
        }, {
            header: 'Widgets',
            dataIndex: 'totalWidgets',
            flex: 1,
            sortable: false,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return this.renderCell(value, metaData, record);
            }
        }, {
            header: 'Stacks',
            dataIndex: 'totalStacks',
            flex: 1,
            sortable: false,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return this.renderCell(value, metaData, record);
            }
        }
    ],
    defaultPageSize: 50,
    multiSelect: true,
    
    initComponent: function() {
        Ext.apply(this,{
        	columnLines:true
        });
        this.store = Ext.create('Ozone.data.GroupStore', {
            id: 'groupstore',
            autoLoad: false,
            pageSize: this.defaultPageSize
        });
        
        this.bbar = Ext.create('Ext.toolbar.Paging', {
            itemId: 'bottomBar',
            store: this.store,
            pageSize: this.pageSize,
            displayInfo: true
        });
        
        this.relayEvents(this.store, ['datachanged']);
        
        this.callParent(arguments);
    },
    
    applyFilter: function(filterText, fields) {
        
        this.store.proxy.extraParams = undefined;
        
        if (filterText) {
            var filters = [];
            for (var i = 0; i < fields.length; i++) {
                filters.push({
                    filterField: fields[i], 
                    filterValue: filterText
                });
            }
            this.store.proxy.extraParams = {
                filters: Ext.JSON.encode(filters), 
                filterOperator: 'OR'
            };
        }
        
        if (this.baseParams) { this.setBaseParams(this.baseParams); }
        
        this.store.loadPage(1,{
            params: {
                offset: 0,
                max: this.pageSize
            }
        });
        
    },
    
    clearFilter: function() {
        this.store.proxy.extraParams = undefined;
        if (this.baseParams) { this.setBaseParams(this.baseParams); }
        this.store.load({
            params: {
                start: 0,
                max: this.pageSize
            }
        });
    },
    
    renderCell: function(value, meta, record) {
        if (record.get('status') == 'inactive') {
            meta.tdCls += ' x-item-disabled';
        }
        return value;
    },

    setBaseParams: function (params) {
    	this.baseParams = params;
    	if (this.store.proxy.extraParams) {
            Ext.apply(this.store.proxy.extraParams, params);
        } else {
            this.store.proxy.extraParams = params;
        }
    },

    setStore: function(store, cols) {
        this.reconfigure(store, cols);
        var pgtb = this.getBottomToolbar();
        if (pgtb) { pgtb.bindStore(store); }
    },

    getTopToolbar: function() {
    	return this.getDockedItems('toolbar[dock="top"]')[0];
    },

    getBottomToolbar: function() {
    	return this.getDockedItems('toolbar[dock="bottom"]')[0];
    },

    load: function() {
        this.store.loadPage(1);
    },

    refresh: function() {
      this.store.loadPage(this.store.currentPage);
    }
});

Ext.define('Ozone.components.EditWidgetPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.editwidgetpanel', 'widget.Ozone.components.EditWidgetPanel'],
    layout: 'card',
    bodyCls: 'editpanel-body',
	
    initComponent: function() {
        this.addEvents('itemcreated', 'itemupdated', 'initialdataloaded');

        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();

        OWF.Eventing.subscribe(this.channel, Ext.bind(this.handleSubscriptionEvent, this));

        this.launchConfig = OWF.Launcher.getLaunchData();
        if (this.launchConfig != null) {
            this.launchData = Ozone.util.parseJson(this.launchConfig);
        }
			
		this.widgetState = Ozone.state.WidgetState.getInstance({
			autoInit: true,
			onStateEventReceived: Ext.bind(this.handleStateEvent, this)
		});
		/*this.widgetState.addStateEventOverrides({
			events: ['beforeclose']
		});*/

        this.store.on('write', function(store, action, result, records, rs) {
            OWF.Eventing.publish(this.channel, {
                action: action,
                domain: this.domain,
                records: result
            })
        }, this);
		
        this.on('itemcreated', function(itemId) {
            this.recordId = itemId;
            OWF.Eventing.publish(this.channel, {
                action: 'created',
                id: itemId
            });
        }, this);
		
        this.on('itemupdated', function(itemId) {
            OWF.Eventing.publish(this.channel, {
                action: 'modified',
                id: itemId
            });
        }, this);
		
        this.on('afterrender', function(component, eOpts) {
            if (this.launchConfig != null) {
                if (!this.launchData.isCreate) {
                    this.store.load({
                        params: {
                            id: this.launchData.id
                        },
                        callback: function() {
                            this.record = this.store.getById(this.launchData.id);
                            this.recordId = this.record ? this.record.getId() : null;
                            this.fireEvent('initialdataloaded', this.record);
                            this.enableTabs();
                        },
                        scope: this
                    });
                }
            }
            else {
                this.record = {};
                this.fireEvent('initialdataloaded', this.record);
            }

            var tbarItems = [];
            for (var i = 0; this.items && i < this.items.getCount(); i++) {
                tbarItems.push({
                    xtype: 'button',
                    pressed: i == 0,
                    disabled: this.items.getAt(i).initDisabled,
            //        width: 70,
                    toggleGroup: 'editorTabs',
                    allowDepress: false,
                    text: this.items.getAt(i).title,
                    iconCls: this.items.getAt(i).iconCls,
                    icon: this.items.getAt(i).iconCls == undefined ? this.items.getAt(i).icon : undefined,
                    iconAlign: 'top',
                    scale: 'xlarge',
                    index: i,
                    handler: function(button, e) {
                        this.getLayout().setActiveItem(button.index);
                    },
                    scope: this
                });
            }

            this.addDocked([{
                itemId: 'editorToolbar',
                hidden: this.hideEditorToolbar,
                xtype: 'toolbar',
                cls: 'editor-tabs',
                dock: 'top',
                items: tbarItems,
                enableOverflow: true,
                listeners: {
                    afterlayout: function(cmp) {
                        //make height explicit so that height:100% works on children
                        cmp.setHeight(cmp.getHeight());
                    }
                }
            }])

        },this);
		
        this.callParent(arguments);
    },
    handleStateEvent: function(sender, msg) {	
        if (msg.eventName.indexOf("afterEventIntercept_") == -1) {
            // Confirm before closing if data has not been saved
            if (msg.eventName == "beforeclose") {
                this.widgetState.removeStateEventOverrides({
                    events: ['beforeclose'],
                    callback: Ext.bind(function() {
                        // close widget in callback
                        this.widgetState.closeWidget();
                    },this)
                });
            }
        } 
    },
    handleSubscriptionEvent: function(sender, msg) {
        if (msg.action == "delete" && msg.id == this.recordId)
            this.closeWidget();
    },
    closeWidget: function() {
        this.widgetStateHandler.handleWidgetRequest({
            fn: 'closeWidget',
            params: {
                guid: Ozone.getInstanceId()
            }
        });
    },
    enableTabs: function() {
        var tb = this.getDockedComponent('editorToolbar');
        for (var i = 0; tb.items && i < tb.items.getCount(); i++) {
            var button = tb.items.getAt(i);
            if (button) {
                button.setDisabled(false);
            }
        }
    }
});

Ext.define('Ozone.components.admin.GroupsTabPanel',{
    extend: 'Ext.panel.Panel',
    alias: ['widget.groupstabpanel','widget.Ozone.components.admin.GroupsTabPanel'],

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function () {
        var self = this;
        Ext.apply(this, {
            layout: 'fit',
            preventHeader:true,
            border:true,
            initDisabled: true,
            widgetLauncher: null,
            widgetEventingController: null,
            widgetStateHandler: null,
            items:[{
                xtype:'groupsgrid',
                itemId:'groupsgrid',
                preventHeader:true,
                border:false
            }],
            dockedItems:[{
                xtype:'toolbar',
                itemId: 'tbGroupsGridHdr',
                cls: 'tbGroupsGridHdr',
                dock:'top',
                items:[{
                    xtype:'tbtext',
                    itemId: 'lblGroupsGrid',
                    cls: 'tbGroupsGridHdr',
                    text:'Groups'
                },'->',{
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('groupsgrid');
                                if (grid != null) {
                                    grid.applyFilter(value, ['name', 'description']);
                                }
                            },
                            scope: this
                        }
                    }
                }]
            },{
                xtype:'toolbar',
                dock:'bottom',
                ui:'footer',
                defaults: {
                    minWidth: 80
                },
                items:[{
                    xtype:'button',
                    text:'Add',
                    itemId: 'addButton',
                    handler: function() {
                      this.onAddClicked();
                    },
                    scope: this
                },{
                    xtype:'button',
                    text:'Remove',
                    itemId: 'removeButton',
                    handler: function() {
                        var grid = this.down('#groupsgrid');
                        //TODO make sure this is filtered by the passed in id
                        if(grid) {
                            var records = grid.getSelectionModel().getSelection();
                            if(records && records.length>0) {
                                var store = grid.store;
                                store.remove(records);
                                store.on({
                                    save: {
                                        fn: function(s,b,data) {
                                            store.reload();
                                        }
                                    }
                                });
                                store.save();
                            }
                            else {
                                self.editPanel.showAlert("Error", "You must select at least one group to remove.")
                            }
                        }
                    },
                    scope:this
                }]
            }]
        });

        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();

        this.on({
            activate: {
                scope: this,
                fn: function (cmp, opts) {
                    //load store with proper filter
                    var owner = cmp.ownerCt;
                    var grid = cmp.down('#groupsgrid');
                    
                    grid.setStore(Ext.create('Ozone.data.GroupStore',cmp.storeCfg));
                    var refreshPagingToolbar = function(operation) {
                        if (operation.action == "destroy" || operation.action == "create") {
                            var ptb = grid.getBottomToolbar();
                            ptb.doRefresh();
                        }
                    };
                    grid.store.proxy.callback = refreshPagingToolbar;

                    grid.store.on('write', function(store, action, result, records, rs) {
                        //Refresh whatever manager lauched this editor widget
                        OWF.Eventing.publish(this.ownerCt.channel, {
                            action: action,
                            domain: this.ownerCt.domain,
                            records: result
                        });
                    }, this);
                    
                    if (grid && owner) {
                        if (Ext.isNumeric(owner.recordId)) {
                            owner.record = owner.recordId > -1 ? owner.store.getAt(owner.store.findExact('id', owner.recordId)) : undefined;
                        } else {
                            owner.record = owner.recordId ? owner.store.getAt(owner.store.findExact('id', owner.recordId)) : undefined;
                        }
                    }
                    
                    // Set the title
                    if (owner.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(owner.record.get('title'), 25));
                        if(!titleText) {
                            titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(owner.record.get('name'), 25)) || 'Groups';
                        }
                        var title = cmp.getDockedItems('toolbar[dock="top"]')[0].getComponent('lblGroupsGrid');
                        title.setText(titleText);
                    }

                    OWF.Preferences.getUserPreference({
                        namespace: 'owf.admin.GroupEditCopy',
                        name: 'guid_to_launch',
                        onSuccess: function(result) {
                            cmp.guid_EditCopyWidget = result.value;
                        },
                        onFailure: function(err) { /* No op */
                            self.editPanel.showAlert('Preferences Error', 'Error looking up Group Editor: ' + err);
                        }
                    });
                    
                    if(grid && owner) {
                        var compId
                        if (Ext.isNumeric(owner.recordId)) {
                            compId = owner.recordId > -1 ? owner.recordId: -1;
                        } else {
                            compId = owner.recordId ? owner.recordId: -1;
                        }
                        var p = {
                            tab:'groups'
                        };
                        p[cmp.componentId] = compId;
                        grid.setBaseParams(p);
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var records = grid.getSelectionModel().getSelection();
                                    if (records && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            cmp.doEdit(records[i].data.id, records[i].data.displayName);
                                        }
                                    }
                                    else {
                                        self.editPanel.showAlert("Error", "You must select at least one group to edit.");
                                    }
                                },
                                scope: this
                            }
                        });
                    }
                },
                single: true
            }
        });

        //reload store everytime the tab is activated
        this.on({
           activate: {
             fn: function() {
               var grid = this.getComponent('groupsgrid');
               var store = grid.getStore();
               if (store) {
                   store.load({
                       params: {
                           offset: 0,
                           max: store.pageSize
                       }
                   });
               }
             },
             scope: this
           }
        });

        this.callParent();
    },
    onAddClicked: function (button, e) {
        var record = this.ownerCt.record,
            itemName = record.get('name') ? record.get('name') : record.get('userRealName');

        var win = Ext.widget('admineditoraddwindow', {
            addType: 'Group',
            itemName: itemName,
            editor: this.editor,
            focusOnClose: this.down(),
            existingItemsStore: this.getComponent('groupsgrid').getStore(),
            searchFields: ['displayName'],
            grid: Ext.widget('groupsgrid', {
                itemId: 'groupsaddgrid',
                border: false,
                preventHeader:true,
                enableColumnHide: false,
                sortableColumns: false
            })
        });
        win.show();
    },
    doEdit: function(id, title) {
        var self = this;
        var dataString = Ozone.util.toString({
            id: id,
            copyFlag: false
        });

        OWF.Launcher.launch({
            guid: this.guid_EditCopyWidget,
            title: '$1 - ' + title,
            titleRegex: /(.*)/,
            launchOnlyIfClosed: false,
            data: dataString
        }, function(response) {
            if (response.error) {
                self.editPanel.showAlert('Launch Error', 'Group Editor Launch Failed: ' + response.message);
            }
        });
    },
    refreshWidgetLaunchMenu: function() {
        if (this.widgetStateHandler) {
            this.widgetStateHandler.handleWidgetRequest({
                fn: 'refreshWidgetLaunchMenu'
            });
        }
    }
});

Ext.define('Ozone.components.PropertiesPanel', {
    extend: 'Ext.form.Panel',
    alias: ['widget.propertiespanel', 'widget.Ozone.components.PropertiesPanel'],
    layout: 'anchor',
    bodyCls: 'properties-body',
    border: false,
    bodyBorder: true,
    preventHeader: true,
    padding: 5,
    autoScroll: true,

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function() {
        var me = this;

        me.buttonAlign = me.buttonAlign || 'left';
        me.buttons = [{
            text: 'Apply',
            itemId: 'apply',
            handler: me.onApply,
            scope: me
        }];
        
        me.defaults = Ext.apply(me.defaults || {}, {
            labelSeparator: '',
            margin: '5 5 0 5',
            msgTarget: 'side',
            anchor: '100%',
            listeners: {
                blur: {
                    fn: me.handleBlur
                },
                change: {
                    fn: me.handleChange
                },
                afterrender: {
                    fn: function(field, eOpts) {
                        var layout = field.getComponentLayout();
                        if (layout.errorStrategies != null) {
                            layout.previousBeforeLayout = layout.beforeLayout;
                            layout.beforeLayout = function(width, height){
                                return this.previousBeforeLayout() || !this.owner.preventMark;
                            };
                            layout.errorStrategies.side = {
                                prepare: function(owner){
                                	var panel = owner.findParentByType('widgeteditpropertiestab');
                                	var loadedFromDescriptor = panel ? panel.loadedFromDescriptor : false;
                                    var errorEl = owner.errorEl;
                                    
                                    var isRequired = owner.fieldLabel.indexOf('required-label') < 0 ? false : true;
                                    if ((owner.hasActiveError() && owner.changed) ||
                                        ( isRequired && Ext.isEmpty(owner.getValue()) && loadedFromDescriptor )) {
                                        	
                                        errorEl.removeCls(['owf-form-valid-field', 'x-form-warning-icon', 'owf-form-unchanged-field']);
                                        errorEl.addCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                                        layout.tip = layout.tip ? layout.tip : Ext.create('Ext.tip.QuickTip', {
                                            baseCls: Ext.baseCSSPrefix + 'form-invalid-tip',
                                            renderTo: Ext.getBody()
                                        });
                                        layout.tip.tagConfig = Ext.apply({}, {
                                            attribute: 'errorqtip'
                                        }, layout.tip.tagConfig);
                                        errorEl.dom.setAttribute('data-errorqtip', owner.getActiveError() || '');
                                        if ( isRequired && Ext.isEmpty(owner.getValue()) ) {
                                        	errorEl.setDisplayed(true);
                                        } else {
                                            errorEl.setDisplayed(owner.hasActiveError());
                                        }
                                    }
                                    else if (owner.hasActiveWarning && owner.hasActiveWarning() && owner.changed) {
                                        errorEl.removeCls([Ext.baseCSSPrefix + 'form-invalid-icon', 'owf-form-valid-field', 'owf-form-unchanged-field']);
                                        errorEl.addCls('x-form-warning-icon');
                                        layout.tip = layout.tip ? layout.tip : Ext.create('Ext.tip.QuickTip', {
                                            iconCls: 'x-form-warning-icon',
                                            renderTo: Ext.getBody()
                                        });
                                        layout.tip.tagConfig = Ext.apply({}, {
                                            attribute: 'errorqtip'
                                        }, layout.tip.tagConfig);
                                        errorEl.dom.setAttribute('data-errorqtip', owner.getActiveWarning() || '');
                                        errorEl.setDisplayed(owner.hasActiveWarning());
                                    }
                                    else if (owner.changed && !loadedFromDescriptor) {
                                        if (layout.tip) 
                                            layout.tip.unregister(errorEl);
                                        errorEl.removeCls([Ext.baseCSSPrefix + 'form-invalid-icon', 'x-form-warning-icon', 'owf-form-unchanged-field']);
                                        errorEl.addCls('owf-form-valid-field');
                                        errorEl.dom.setAttribute('data-errorqtip', '');
                                        errorEl.setDisplayed(true);
                                    }
                                    else {
                                        errorEl.removeCls([Ext.baseCSSPrefix + 'form-invalid-icon', 'x-form-warning-icon', 'owf-form-valid-field']);
                                        //errorEl.addCls('owf-form-unchanged-field');
                                        errorEl.dom.setAttribute('data-errorqtip', '');
                                        errorEl.setDisplayed(false);
                                    }
                                },
                                adjustHorizInsets: function(owner, info){
                                    if (owner.autoFitErrors) {
                                        info.insets.right += owner.errorEl.getWidth();
                                    }
                                },
                                adjustVertInsets: Ext.emptyFn,
                                layoutHoriz: function(owner, info){
                                    owner.errorEl.setStyle('left', info.width - info.insets.right + 'px');
                                },
                                layoutVert: function(owner, info){
                                    owner.errorEl.setStyle('top', info.insets.top + 'px');
                                },
                                onFocus: Ext.emptyFn
                            };
                            //field.validate();
                        }
                    },
                    scope: me
                }
            }
        });
        
        me.on('afterrender', function(component) {
            var widget = component.ownerCt;
                            
            if (widget.record)
                component.initFieldValues(widget.record);
            else
                widget.on('initialdataloaded', component.initFieldValues, component);
            
            if (widget.store) {
                widget.store.on(
                    'write',
                    function(store, operation, eOptd) {
                        var recs = operation.getRecords();
                        if (recs) {
                            var rec = recs[0];
                            if (rec) {
                                var id = rec.get('id');
                                if (id) {
                                    widget.recordId = id;
                                }
                            }
                        }
                        widget.enableTabs();

                        me.showApplyAlert('Your changes have been saved.');
                    }
                );
                if (widget.store.proxy) {
                    var panel = component;
                    widget.store.proxy.on(
                        'exception',
                        function(proxy, response, operation, eOpts) {
                            if ('create' == operation.action) {
                                widget.store.removeAll();
                                if (Ext.isFunction(panel.initFieldValues)) {
                                    panel.initFieldValues({});
                                }
                            }
                            var json;
                            try {
                                json = (typeof response) == 'string' ?  Ext.JSON.decode(response) : response;
                            } catch(e) {
                                json = {
                                    errorMsg: response
                                }
                            }
                            me.editPanel.showAlert('Server Error!', Ext.htmlEncode(json.errorMsg));
                        }
                    );
                }
            }
        });

        if (Ozone.config.freeTextEntryWarningMessage != null && Ozone.config.freeTextEntryWarningMessage != '') {
            var message = Ozone.config.freeTextEntryWarningMessage;
            this.items = this.items || [];
            this.items.splice(0,0,{
               xtype: 'component',
               //margin: '5 5 10 5',
               //height: (message && message.length > 0) ? 40 : 16,
               renderTpl: '<div id="{id}" class="{cls}"><div class="headerSpacer"></div>{message}</div>',
               renderData: {
                   cls: (message && message.length > 0) ? 'dialogHeader' : '',
                   message: message ? message : ''
              }
            });
        }

        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();

        me.callParent();
    },
    initFieldValues: Ext.emptyFn,
    handleBlur: function(field) {
        field.changed = true;
        field.doComponentLayout();
        if (field.getXType() == 'textfield') {
            field.setValue(Ext.String.trim(field.getValue()));
        }
    },
    handleChange: function(field, newValue, oldValue, eOpts) {
        if(!field.changed && field.isDirty()) field.changed = true;
    },
    refreshWidgetLaunchMenu: function()
    {
        if (this.widgetStateHandler) {
            this.widgetStateHandler.handleWidgetRequest({
                fn: 'refreshWidgetLaunchMenu'
            });
        }
    },
    onApply: function() {
        this.validateFields();

        if(!this.getForm().hasInvalidField()) {
            var panel = this;
            var widget = panel.ownerCt;
            var formValues = this.getValues();

            if (widget.store.data.length > 0) {
                var record = widget.store.getById(widget.recordId);
                record.beginEdit();
                for (var field in formValues) {
                    if (!Ext.isFunction(field)) {
                        record.set(field, formValues[field]);
                    }
                }
                record.endEdit();
            } else {
                widget.store.add(formValues);
                widget.store.data.items[0].phantom = true;
                if (Ext.isFunction(panel.initFieldValues)) {
                    panel.initFieldValues(widget.store.data.items[0]);
                }
            }

            //Even if the user made no changes, still display the changes saved alert for confirmation
            if(widget.store.getNewRecords().length === 0 && widget.store.getUpdatedRecords().length === 0) {
                panel.showApplyAlert('Your changes have been saved.');
            }

            widget.store.save();
        }
        else {
            this.showApplyAlert('Invalid field, changes cannot be saved.', 3000);
        }
    },
    showApplyAlert: function(msg, duration) {
        var me = this,
            toolbar = this.getDockedItems()[0];

        if(!toolbar.getComponent(me.applyAlert)) {
            me.applyAlert = Ext.widget('displayfield', {
                itemId: 'applyAlert',
                name: 'applyAlert',
                cls: 'applyAlert',
                width: 450,
                html: msg
            });

            toolbar.add(me.applyAlert);

            Ext.defer(function() {
                toolbar.remove(me.applyAlert);
            }, duration ? duration : 2000);
        }
    },
    validateFields: function() {
        //Show validation on fields
        var textfields = this.query('textfield');
        for (var i = 0; i < textfields.length; i++) {
            var field = textfields[i];
            if (!Ext.isFunction(field)) {
                field.isValid();
                this.handleBlur(field);
            }
        }
    }
});

Ext.define('Ozone.components.admin.dashboard.DashboardEditPropertiesTab', {
  extend: 'Ozone.components.PropertiesPanel',
  alias: ['widget.dashboardeditproperties',
    'widget.dashboardeditpropertiestab',
    'widget.Ozone.components.admin.dashboard.DashboardEditPropertiesTab'],

  cls: 'dashboardeditpropertiestab',

  initComponent: function () {
    Ext.apply(this, {
      title: 'Properties',
      iconCls: 'properties-tab',
      items: [
        {
          xtype: 'hidden',
          name: 'guid',
          preventMark: true,
          itemId: 'guid'
        },
        {
          xtype: 'textfield',
          name: 'name',
          fieldLabel: Ozone.util.createRequiredLabel('Name'),
          allowBlank: false,
          maxLength: 200,
          enforceMaxLength: true,
          itemId: 'name',
          labelWidth: 140 //done in javascript because Ext would ignore anything we did in css anyway
        },
        {
          xtype: 'textarea',
          name: 'description',
          fieldLabel: 'Description',
          allowBlank: true,
          maxLength: 255,
          enforceMaxLength: true,
          itemId: 'description',
          labelWidth: 140 //done in javascript because Ext would ignore anything we did in css anyway
        },
        {
          xtype: 'textarea',
          fieldLabel: Ozone.util.createRequiredLabel('Definition'),
          name: 'definition',
          itemId: 'definition',
          allowBlank: true,
          labelWidth: 140, //done in javascript because Ext would ignore anything we did in css anyway
          height: 160,
          minHeight: 160,
          //anchor: '100% -90',
          validator: function(value) {
            try {
              Ext.decode(value);
            }
            catch (err) {
              return 'This field must be a valid JSON Object string';
            }

            //check for brackets which would indicate an array
            if (value != null && value.length > 0 && value.charAt(0) == '[' && value.charAt(value.length -1) == ']') {
              return 'This field must be a valid JSON Object string';
            }

            return true;
          }
        }
      ]
    });
    this.callParent(arguments);
  },
  initFieldValues: function(record) {
    var data = record ? record.data : record;

    if (data != null) {
      this.getComponent('guid').setValue(data.guid != null ? data.guid : '');
      this.getComponent('name').setValue(data.name != null ? data.name : '');
		
      this.getComponent('description').setValue(data.description != null ? data.description : '');
      
      var jsonString = null;
      if (data != null) {
        jsonString = owfdojo.toJson(data, true);
      }
      this.getComponent('definition').setValue(jsonString != null ? jsonString : '');
    }
  },
  onApply: function() {
    this.validateFields();
        
    if(!this.getForm().hasInvalidField()) {
        var panel = this;
        var widget = panel.ownerCt;

        //get values from the form
        var formValues = this.getValues();
        var name = formValues.name;
        var description = formValues.description;
        var definition = formValues.definition;

        ///get defObj
        var defObj = Ext.decode(definition);

        //override fields in defObj
        if (formValues.guid != '' && formValues.guid != null ) {
          defObj.guid = formValues.guid;
        }
        defObj.name = name;
        defObj.description = description;

        var record = widget.store.getAt(0);
        //editing an existing record
        if (record != null) {
          record.beginEdit();

          //clear all data fields
          record.data = {};

          //copy new data from the form into the fields
          for (var field in defObj) {
            if (!Ext.isFunction(field)) {
              record.set(field, defObj[field]);
            }
          }
          record.endEdit();
        }
        //no record found, creating new one
        else {
          //use a new guid if needed
          if (widget.launchData == null || widget.launchData.isCreate || formValues.guid == '' || formValues.guid == null) {
            defObj.guid = guid.util.guid();
          }

          widget.store.add(defObj);
          record = widget.store.data.items[0];
          record.phantom = true;
        }


        //sync form with the data which returns from the store.sync
        widget.store.on({
          write: {
            fn: function(store, operation, eOpts) {
            var recs = operation.getRecords();
            if (recs) {
              var rec = recs[0];
              if (rec) {
                var id = rec.getId();
                if (id) {
                  widget.recordId = id;
                }
                //once the save/update is complete update the form
                this.initFieldValues(rec);

                widget.enableTabs();
              }
            }
            widget.fireEvent('itemcreated', widget.recordId);
            },
            scope: this,
            single: this
          }
        });
        widget.store.sync();
    }
    else {
        this.showApplyAlert('Invalid field, changes cannot be saved.', 3000);
    }
  }

});

Ext.define('Ozone.components.admin.dashboard.DashboardEditGroupsTab', {
  extend: 'Ozone.components.admin.GroupsTabPanel',
  alias: ['widget.dashboardeditgroups',
    'widget.dashboardeditgroupstab',
    'widget.Ozone.components.admin.dashboard.DashboardEditGroupsTab'],

  cls: 'dashboardeditgroupstab',

  initComponent: function () {
    Ext.apply(this, {
      padding: 5,
      iconCls: 'groups-tab',
      editor: 'Dashboard',
      componentId: 'dashboard_id',
      title: 'Groups',
      //userRecord: null,
      storeCfg: {
				api: {
					read: '/group',
                    create: '/dashboard',
                    update: '/group',
                    destroy: '/dashboard'
				},
				methods: {
					read: 'GET',
                    load: 'GET',
                    create: 'PUT',
                    update: 'PUT',
                    save: 'POST',
                    destroy: 'PUT'
				},
				updateActions: {
					destroy: 'remove',
                    create: 'add'
				},
				pageSize: 50
			}
    });
    this.callParent(arguments);
  },
  initBaseParams: function(record) {
    this.baseParams = {
      dashboard_id: record.data.id
    };
    this.applyFilter();
  }

});
Ext.define('Ozone.components.admin.dashboard.DashboardEditPanel', {
  extend: 'Ozone.components.EditWidgetPanel',
  alias: ['widget.dashboardedit','widget.dashboardeditpanel','widget.Ozone.components.admin.dashboard.DashboardEditPanel'],

  mixins: ['Ozone.components.WidgetAlerts'],

  cls: 'dashboardeditpanel',

  initComponent: function () {
    var self = this;

    this.launchConfig = Ozone.launcher.WidgetLauncherUtils.getLaunchConfigData();
    if (this.launchConfig != null) {
      this.launchData = Ozone.util.parseJson(this.launchConfig);
      this.hideEditorToolbar = !this.launchData.isGroupDashboard;
    }

    Ext.apply(this, {
      xtype: 'editwidgetpanel',
      cls: 'adminEditor',
      bodyCls: 'adminEditor-body',
      dragAndDrop: false,
      launchesWidgets: false,
      domain: 'Dashboard',
      channel: 'AdminChannel',
      store: Ext.StoreMgr.lookup({
        type: 'admindashboardstore'
      }),
      items: [
        {
          xtype: 'dashboardeditproperties',
          itemId: 'dashboardeditproperties',
          editPanel: self
        },
        {
          xtype: 'dashboardeditgroups',
          itemId: 'dashboardeditgroups',
          editPanel: self
        }
    ]
    });

    this.callParent(arguments);
    this.store.proxy.extraParams = {
      adminEnabled: true
    };
    if (this.launchConfig != null) {
      this.launchData = Ozone.util.parseJson(this.launchConfig);
      this.store.proxy.extraParams.isGroupDashboard = this.launchData.isGroupDashboard ;
      if (this.launchData.isGroupDashboard) {
        this.store.proxy.extraParams.group_id = this.launchData.group_id;
      }
      else {
        this.store.proxy.extraParams.user_id = this.launchData.user_id;
      }
    }
    else {
      //default to group dashboard editing
      this.store.proxy.extraParams.isGroupDashboard = true;
    }
  }
});

