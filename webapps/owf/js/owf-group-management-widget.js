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

Ext.define('Ozone.components.admin.group.GroupDetailPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.groupdetailpanel'],
    
    viewGroup: null,
    
    initComponent: function() {
        
        this.viewGroup = Ext.create('Ext.view.View', {
            store: Ext.create('Ext.data.Store', {
                storeId: 'storeGroupItem',
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'status',  type: 'string' },
                    { name: 'automatic', type: 'string' },
                    { name: 'description', type: 'string' }
                ]
            }),
            deferEmptyText: false,
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="selector">',
                        '<div id="detail-info" class="detail-info">',
                            '<div class="detail-block">',
                                '<div class="detail-title">{name:htmlEncode}</div>',
                                '<div><span class="detail-label">Status:</span> {status:this.renderStatus}</div>',
                                '<div><span class="detail-label">User Management:</span> {automatic:this.renderUserMgmt}</div>',
                            '</div>',
                            '<div><span class="detail-label">Description:</span></div>',
                            '<div>{description:htmlEncode}</div>',
                        '</div>',
                    '</div>',
                '</tpl>',
                {
                    compiled: true,
                    renderStatus: function(status) {
                        if (status == 'active') {
                            return 'active'
                        } else {
                            return 'inactive'
                        }
                    },
                    renderUserMgmt: function(value) {
                        if (value) {
                            return 'Automatic'
                        } else {
                            return 'Manual'
                        }
                    }
                }
            ),
			emptyText: 'No group selected',
            itemSelector: 'div.selector',
            autoScroll: 'true'
        });
        
        this.items = [this.viewGroup];
        
        this.callParent(arguments);
    },
    
    loadData: function(record) {
        this.viewGroup.store.loadData([record], false);
    },
    
    removeData: function() {
        this.viewGroup.store.removeAll(false);
    }
    
});
Ext.define('Ozone.components.admin.group.GroupManagementPanel', {
    extend: 'Ozone.components.admin.ManagementPanel',
    alias: ['widget.groupmanagement'],
    
    layout: 'fit',
    
    gridGroups: null,
    pnlGroupDetail: null,
    txtHeading: null,
    lastAction: null,
    guid_EditCopyWidget: null,
    
    widgetStateHandler: null,
    dragAndDrop: true,
    launchesWidgets: true,
    channel: 'AdminChannel',
    defaultTitle: 'Groups',
    minButtonWidth: 80,
    detailsAutoOpen: true,
    
    initComponent: function() {
        
        var me = this;
        
        OWF.Preferences.getUserPreference({
            namespace: 'owf.admin.GroupEditCopy',
            name: 'guid_to_launch',
            onSuccess: function(result) {
                me.guid_EditCopyWidget = result.value;
            },
            onFailure: function(err){ /* No op */
                me.showAlert('Preferences Error', 'Error looking up Group Editor: ' + err);
            }
        });
        
        this.gridGroups = Ext.create('Ozone.components.admin.GroupsGrid', {
            preventHeader: true,
            region: 'center',
            border: false
        });
        this.gridGroups.store.load({
        	params: {
                offset: 0,
                max: this.pageSize
            }
        });
        this.relayEvents(this.gridGroups, ['datachanged', 'select', 'deselect', 'itemdblclick']);
        
        this.pnlGroupDetail = Ext.create('Ozone.components.admin.group.GroupDetailPanel', {
            layout: {
                type: 'fit',
                align: 'stretch'
            },
            region: 'east',
            preventHeader: true,
            collapseMode: 'mini',
            collapsible: true,
            collapsed: true,
            split: true,
            border: false,
            width: 200
        });
        
        this.txtHeading = Ext.create('Ext.toolbar.TextItem', {
            text: '<span class="heading-bold">'+this.defaultTitle+'</span>'
        });
        
        
        this.searchBox = Ext.widget('searchbox');

        this.items = [{
            xtype: 'panel',
            layout: 'border',
            border: false,
            items: [
                this.gridGroups,
                this.pnlGroupDetail
            ]
        }];
        
        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            layout: {
                type: 'hbox',
                align: 'stretchmax'
            },
            items: [
                this.txtHeading,
            {
                xtype: 'tbfill'
            },
                this.searchBox
            ]
        }, {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            defaults: {
                minWidth: this.minButtonWidth
            },
            items: [{
                xtype: 'button', 
                text: 'Create',
                handler: function(button, evt) {
                    evt.stopPropagation();
                    me.doCreate();
                }
            }, {
                xtype: 'splitbutton',
                text: 'Edit',
                itemId: 'btnEdit',
                handler: function() {
                    var records = me.gridGroups.getSelectionModel().getSelection();
                    if (records && records.length > 0) {
                        for (var i = 0; i < records.length; i++) {
                            me.doEdit(records[i].data.id, records[i].data.displayName);
                        }
                    } else {
                        me.showAlert('Error', 'You must select at least one group to edit.');
                    }
                },
                menu: {
                    xtype: 'menu',
                    plain: true,
                    hideMode: 'display',
                    defaults: {
                        minWidth: this.minButtonWidth
                    },
                    items: [
                        {
                          xtype: 'owfmenuitem',
                          text: 'Activate',
                          handler: function(button) {
                            me.doActivate();
                          }
                        },
                        {
                          xtype: 'owfmenuitem',
                          text: 'Deactivate',
                          handler: function(button) {
                            me.doDeactivate();
                          }
                        }
                    ]
                }
            }, {
                xtype: 'button', 
                text: 'Delete',
                itemId: 'btnDelete',
                handler: function(button) {
                    me.doDelete();
                }
            }]
        }];
    
        this.on(
            'datachanged',
            function(store, opts) {
                  //collapse and clear detail panel if the store is refreshed
                  if (this.pnlGroupDetail != null ) {
                    this.pnlGroupDetail.collapse();
                    this.pnlGroupDetail.removeData();
                  }

                  //refresh launch menu
                  if (!this.disableLaunchMenuRefresh) {
                    this.refreshWidgetLaunchMenu();
                  }
            },
            this
        );
    
        this.on(
            'select',
            function(rowModel, record, index, opts) {
                this.pnlGroupDetail.loadData(record);
                if (this.pnlGroupDetail.collapsed && this.detailsAutoOpen) {this.pnlGroupDetail.expand();}
                this.updateDeleteButton(rowModel.selected);
            },
            this
        );
    
        this.on(
            'deselect',
            function(rowModel, record, index, opts) {
                this.updateDeleteButton(rowModel.selected);
            },
            this
        );
        
            
        this.searchBox.on(
            'searchChanged',
            function(searchbox, value) {
                this.gridGroups.applyFilter(value, ['name', 'description', 'displayName']);
            },
            this
        );

        this.on(
             'itemdblclick',
             function(view, record, item, index, evt, opts) {
                 this.doEdit(record.data.id, record.data.displayName);
             },
             this
         );

        this.gridGroups.getView().on('itemkeydown', function(view, record, dom, index, evt) {
            switch(evt.getKey()) {
                case evt.SPACE:
                case evt.ENTER:
                    this.doEdit(record.data.id, record.data.displayName);
            }
        }, this);

        
        
        this.callParent(arguments);
        
        OWF.Eventing.subscribe('AdminChannel', owfdojo.hitch(this, function(sender, msg, channel) {
            if(msg.domain === 'Group') {
                this.gridGroups.getBottomToolbar().doRefresh();
            }
        }));
        
        this.on(
    		'afterrender', 
    		function() {
				var splitterEl = this.el.down(".x-collapse-el");
				splitterEl.on('click', function() {
					var collapsed = this.el.down(".x-splitter-collapsed");
					if(collapsed) {
						this.detailsAutoOpen = true;
					}
					else {
						this.detailsAutoOpen = false;
					}
				}, this);
			}, 
			this
		);
    },

    launchFailedHandler: function(response) {
        if (response.error) {
            this.showAlert('Launch Error', 'Group Editor Launch Failed: ' + response.message);
        }
    },
    
    doEdit: function(id, title) {
        var dataString = Ozone.util.toString({
            id: id,
            copyFlag: false
        });
        
        OWF.Launcher.launch({
            title: '$1 - ' + title,
            titleRegex: /(.*)/,
            guid: this.guid_EditCopyWidget,
            launchOnlyIfClosed: false,
            data: dataString
        }, this.launchFailedHandler);
    },
    
    doActivate: function() {
        var records = this.gridGroups.getSelectionModel().getSelection();
        if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {
                var group = records[i];
                if (group) {
                    group.set('status', 'active');
                }
            }
            var store = this.gridGroups.getStore();
            store.save();
            this.refreshWidgetLaunchMenu();
        } else {
            this.showAlert('Error', 'You must select at least one group to activate.');
        }
    },
    
    doDeactivate: function() {
        var records = this.gridGroups.getSelectionModel().getSelection();
        if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {
                var group = records[i];
                if (group) {
                    group.set('status', 'inactive');
                }
            }
            var store = this.gridGroups.getStore();
            store.save();
            this.refreshWidgetLaunchMenu();
        } else {
            this.showAlert('Error', 'You must select at least one group to deactivate.');
        }
    },
    
    doDelete: function() {
        var records = this.gridGroups.getSelectionModel().getSelection();
        if (records && records.length > 0) {

            //Flag for if the OWF Users or OWF Administrators group is selected to delete
            var allUsersOrAdminsGroupSelected = false;
            for(var i = 0; i < records.length; i++) {
                if((records[i].get('name') == 'OWF Users' || records[i].get('name') == 'OWF Administrators') && records[i].get('automatic') == true) {
                    allUsersOrAdminsGroupSelected = true;
                    break;
                }
            }

            var msg = 'This action will permanently delete the selected group(s).';

            //If the OWF Users or OWF Administrators groups were selected for deletion, warn the user they will not be deleted
            if (allUsersOrAdminsGroupSelected) {
                //Get the current names of the OWF Users and OWF Administrators groups, since they are editable
                var nonremovableGroupNames = [];
                for(var i = 0; i < records.length; i++) {
                    if((records[i].get('name') == 'OWF Users' || records[i].get('name') == 'OWF Administrators') && records[i].get('automatic') == true) {
                        nonremovableGroupNames.push(records[i].get('name'));
                    }
                }

                if(nonremovableGroupNames.length == 1) {
                    msg = 'You have chosen to delete <span class="heading-bold">' + records.length + ' groups</span>.<br>'
                        + 'However, the <span class="heading-bold">' + nonremovableGroupNames[0] 
                        + '</span> group cannot be deleted.<br>Pressing OK will permanently delete your other selection(s).';
                } else if(nonremovableGroupNames.length == 2) {
                    msg = 'You have chosen to delete <span class="heading-bold">' + records.length + ' groups</span>.<br>'
                        + 'However, the <span class="heading-bold">' + nonremovableGroupNames[0] 
                        + '</span> and <span class="heading-bold">' + nonremovableGroupNames[1] 
                        + '</span> groups cannot be deleted.<br>Pressing OK will permanently delete your other selection(s).';
                }
            
                //Remove OWF Users and OWF Administrators groups from the records list so they aren't deleted
                for(var i = 0; i < records.length; i++) {
                    if((records[i].get('name') == 'OWF Users' || records[i].get('name') == 'OWF Administrators') && records[i].get('automatic') == true) {
                        records[i] = null;
                    }
                }
                records = Ext.Array.clean(records);
            }
            else if (records.length == 1) {
                msg = 'This action will permanently delete <span class="heading-bold">' 
                        + Ext.htmlEncode(records[0].data.name) + '</span>.';
            }
            else {
                 msg = 'This action will permanently delete the selected <span class="heading-bold">' 
                        + records.length + ' groups</span>.';
            }

            this.showConfirmation('Warning', msg, function(btn, text, opts) {
                if (btn == 'ok') {
                    var store = this.gridGroups.getStore();
                    store.remove(records);
                    var remainingRecords = store.getTotalCount() - records.length;
                    store.on({
                        write: {
                            fn: function(s,b,data) {
                                if(store.data.items.length === 0 && store.currentPage > 1) {
                                    var lastPage = store.getPageFromRecordIndex(remainingRecords - 1);
                                    var pageToLoad = (lastPage >= store.currentPage) ? store.currentPage : lastPage;
                                    store.loadPage(pageToLoad);
                                }
                                this.gridGroups.getBottomToolbar().doRefresh();
                                this.refreshWidgetLaunchMenu();
                            },
                            single: true,
                            scope: this
                        }
                    });
                    store.save();
                }
            });
        } else {
            this.showAlert('Error', 'You must select at least one group to delete.');
        }
    },
    
    updateDeleteButton: function(records) {
        var btnDelete = this.down('#btnDelete');

        //Only disable Delete if OWF Users or OWF Administrators groups are the only ones selected,
        //without any removable groups selected in addition to them.
        if(records.length == 1) {
            if ((records.get(0).get('name') == 'OWF Users' || records.get(0).get('name') == 'OWF Administrators') && records.get(0).get('automatic') == true) {
                btnDelete.disable();
            }
            else {
                btnDelete.enable();
            }
        }
        else if(records.length == 2) {
            var allUsersAndAdminsGroupsSelectedTotal = 0;
            for(var i = 0; i < 2; i++) {
                if((records.get(i).get('name') == 'OWF Users' || records.get(i).get('name') == 'OWF Administrators')  && records.get(i).get('automatic') == true) {
                    allUsersAndAdminsGroupsSelectedTotal++;
                }
            }
            if(allUsersAndAdminsGroupsSelectedTotal == 2) {
                btnDelete.disable();
            }
            else {
                btnDelete.enable();
            }
        }
        else {
            btnDelete.enable();
        }
    }
});

