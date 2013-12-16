Ext.define('Ozone.data.Stack', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        { name: 'id', type: 'int', defaultValue: -1 },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'stackContext', type: 'string' },
        // { name: 'imageUrl', type: 'string'},
        { name: 'descriptorUrl', type: 'string'},
        { name: 'totalDashboards', type: 'int' },
        { name: 'totalUsers', type: 'int' },
        { name: 'totalGroups', type: 'int' },
        { name: 'totalWidgets', type: 'int' }
    ]
});
Ext.define('Ozone.data.StackStore', {
    extend:'Ozone.data.OWFStore',
    model: 'Ozone.data.Stack',

    sorters: [
      {
        property : 'name',
        direction: 'ASC'
      }
    ],

    constructor:function(config) {
        
        config = config ? config : {};
    	
        Ext.applyIf(config, {
            api: {
                read: '/stack',
                create: '/stack',
                update: '/stack',
                destroy: '/stack'
            },
            fields: ['id', 'name', 'description', 'stackContext', /*'imageUrl',*/ 'descriptorUrl', 'totalDashboards', 'totalUsers', 'totalGroups', 'totalWidgets'],
            autoDestroy: true
        });
    	
        this.callParent(arguments);
    }
});
Ext.define('Ozone.components.admin.ExportWindow', {
    extend: 'Ext.window.Window',
    alias: ['widget.exportwindow', 'widget.ExportWindow'],

    mixins: {
        widget: 'Ozone.components.focusable.CircularFocus'
    },

    title: 'Export',
    itemId: 'exportwindow',
    modal: true,
    closable: true,
    draggable: false,
    resizable: false,
    closeAction: 'hide',
    border: false,
    minWidth: 250,
    layout: 'auto',
    items: [{
        xtype: 'panel',
        itemId: 'exportpanel',
        cls: 'admineditoraddpanel',
        layout: 'fit',
        border: false,
        flex: 1,
        items: [{
            xtype: 'form',
            itemId: 'form',
            layout: 'anchor',
            bodyCls: 'properties-body',
            border: false,
            preventHeader: true,
            padding: 5,
            autoScroll: true,
            defaults: {
                anchor: '100%',
                msgTarget: 'side',
                labelSeparator: '',
                margin: '5 5 0 5'
            },
            items: [{
                xtype: 'textfield',
                itemId: 'filename',
                fieldLabel: 'File Name',
                labelWidth: 130,
                allowBlank: false,
                name: 'filename',
                maxLength: 200,
                regex: /^[a-zA-Z\d\-\_]+$/,
                regexText: 'Invalid characters! The Filename may only contain letters, numbers, dashes, and underscores.'
            }]
        }]
    }],
    buttons: [{
        text: 'OK',
        itemId: 'ok',
        disabled: true
    }, {
        text: 'Cancel',
        itemId: 'cancel'
    }],

    initComponent: function() {
        var me = this;
        
        me.setWidth(Math.round(Ext.getBody().getViewSize().width * .9));
        
        me.on('beforeshow', function() {
            me.setTitle(me.generateTitle());
        });
        
        me.on('afterrender', function() {
            
            var form = me.down('#form');
            var filename = me.down('#filename');
            var okBtn = me.down('#ok');
            var cancelBtn = me.down('#cancel');

            //If a filename is given, use it in the filename field initially and enable ok button
            me.itemFilename && filename.setValue(me.itemFilename) && okBtn.enable();
            
            form.on('fieldvaliditychange', function(form, t, isValid, eOpts) {
                if (isValid) {
                    okBtn.enable();
                } else {
                    okBtn.disable();
                }
            });
            
            cancelBtn.on('click', function(btn, e) {
                me.close();
            });
            
            okBtn.on('click', function(btn, e) {
                if(me.okFn) {
                    me.okFn(filename.value);
                }
                me.close();
            });
            
            me.setupFocus(filename.getFocusEl(), cancelBtn.getFocusEl());
        });
        
        me.on('beforeclose', function() {
            me.down('#form').clearListeners();
            me.down('#ok').clearListeners();
            me.down('#cancel').clearListeners();
            me.focusOnClose && me.focusOnClose.focus();
        });
        
        me.callParent(arguments);
    },
    
    generateTitle: function() {
        var title = "Export";
        if (this.itemName) { title = "Export " + this.itemName; }

        //Set a character limit to start at and truncate the title to it if necessary
        var charLimit = 100;
        title = Ext.util.Format.ellipsis(title, charLimit);

        //Get the size of the parent container
        var vpSize = Ext.getBody().getViewSize();

        //Use TextMetrics to get the pixel width of the title
        var textMetrics = new Ext.util.TextMetrics();
        var titleWidth = textMetrics.getWidth(title);

        //If the title's pixel width is too large for the window, decrease it
        //by 5 characters until its pixel width fits
        while(titleWidth > ((vpSize.width * .8))) {
            charLimit -= 5;
            title = Ext.util.Format.ellipsis(title, charLimit);
            titleWidth = textMetrics.getWidth(title);
        }

        textMetrics.destroy();

        return Ext.htmlEncode(title);
    }
});
Ext.define('Ozone.components.admin.StacksGrid', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.stacksgrid'],
    plugins: new Ozone.components.focusable.FocusableGridPanel(),

    cls: 'grid-stack',

    title: 'Stacks',
    columns: [
        {
          itemId: 'id',
          header: 'ID',
          dataIndex: 'id',
          sortable: true,
          hidden: true
        },
        {
            header: 'Title',
            dataIndex: 'name',
            flex: 8,
            renderer: function(v) {
                return v ? Ext.htmlEncode(v) : "";
            }
            // renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //     var title = value;
            //     var url = record.get('imageUrl');

            //     var contextPath = Ozone.util.contextPath();
            //     if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
            //         //url is not relative to the contextPath
            //         if (url.indexOf('/') == 0) {
            //             url = contextPath + url;
            //         }
            //         else {
            //             url = contextPath + '/' + url;
            //         }
            //     }

            //     var retVal = '<div class="grid-icon-and-text-title-box"><div class="grid-icon-and-text-icon"><img class="grid-icon-and-text-icon-image" src="' + Ext.htmlEncode(url) + '">';
            //     retVal += '</div>';
            //     retVal += '<div class="grid-icon-and-text-title">' + Ext.htmlEncode(title) + '</div>';

            //     return  retVal;
            // }
        }, {
            header: 'URL Name',
            dataIndex: 'stackContext',
            flex: 4,
            hidden: true,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                return  Ext.htmlEncode(value);
            }
        }, {
            header: 'Dashboards',
            dataIndex: 'totalDashboards',
            flex: 3,
            sortable: false
        }, {
            header: 'Widgets',
            dataIndex: 'totalWidgets',
            flex: 3,
            sortable: false
        }, {
            header: 'Groups',
            dataIndex: 'totalGroups',
            flex: 3,
            sortable: false
        }, {
            header: 'Users',
            dataIndex: 'totalUsers',
            flex: 3,
            sortable: false
        }
    ],
    defaultPageSize: 50,
    multiSelect: true,
    
    initComponent: function() {
        Ext.apply(this,{
        	columnLines:true
        });
        this.store = Ext.create('Ozone.data.StackStore', {
            id: 'stackstore',
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

Ext.define('Ozone.components.admin.stack.StackDetailPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.stackdetailpanel'],
    
    viewStack: null,
    
    initComponent: function() {
        
        this.viewStack = Ext.create('Ext.view.View', {
            store: Ext.create('Ext.data.Store', {
                storeId: 'storeStackItem',
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'stackContext', type: 'string' }
                    // { name: 'imageUrl', type: 'string' }
                ]
            }),
            deferEmptyText: false,
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="selector">',
                        '<div id="detail-info" class="detail-info">',
                            '<div class="detail-header-block">',
                                // '<div class="detail-widget">',
                                //     '<div class="detail-icon">',
                                //         '<img src={imageUrl:this.renderImage} title="{name:htmlEncode}" class="detail-icon-image">',
                                //     '</div>',
                                // '</div>',
                                '<div class="detail-icon-block">',
                                    '<div class="detail-title">{name:htmlEncode}</div>',
                                '</div>',
                            '</div>',
                            '<div class="detail-block">',
                                '<div><span class="detail-label">Stack URL:</span></div>',
                                '<div><span class="detail-link">{stackContext:this.renderStackUrl}</span></div>',
                            '</div>',
                            '<div class="detail-block">',
                                '<div><span class="detail-label">Description:</span></div>',
                                '<div>{description:htmlEncode}</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</tpl>',
                {
                    compiled: true,
                    // renderImage: function(url) {
                    //     var contextPath = Ozone.util.contextPath();
                    //     if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
                    //         //url is not relative to the contextPath
                    //         if (url.indexOf('/') == 0) {
                    //         url = contextPath + url;
                    //         }
                    //         else {
                    //         url = contextPath + '/' + url;
                    //         }
                    //     }
                    //     return encodeURI(decodeURI(url));
                    // },
                    renderStackUrl: function(context) {
                        context = Ext.htmlEncode(context);
                        var url = OWF.getContainerUrl() + '/#stack=' + context;
                        return '<a href="' + url + '" target="_top">' + url + '</a>';
                    }
                }
            ),
			emptyText: 'No stack selected',
            itemSelector: 'div.selector',
            autoScroll: 'true'
        });
        
        this.items = [this.viewStack];
        
        this.callParent(arguments);
    },
    
    loadData: function(record) {
        this.viewStack.store.loadData([record], false);
    },
    
    removeData: function() {
        this.viewStack.store.removeAll(false);
    }
    
});
Ext.define('Ozone.components.admin.stack.StackManagementPanel', {
    extend: 'Ozone.components.admin.ManagementPanel',
    alias: ['widget.stackmanagement'],
    
    layout: 'fit',
    
    gridStacks: null,
    pnlStackDetail: null,
    txtHeading: null,
    lastAction: null,
    guid_EditCopyWidget: null,
    
    widgetStateHandler: null,
    dragAndDrop: true,
    launchesWidgets: true,
    channel: 'AdminChannel',
    defaultTitle: 'Stacks',
    minButtonWidth: 80,
    detailsAutoOpen: true,
    
    initComponent: function() {
        
        var me = this;
        
        OWF.Preferences.getUserPreference({
            namespace: 'owf.admin.StackEditCopy',
            name: 'guid_to_launch',
            onSuccess: function(result) {
                me.guid_EditCopyWidget = result.value;
            },
            onFailure: function(err){ /* No op */
                me.showAlert('Preferences Error', 'Error looking up Stack Editor: ' + err);
            }
        });
        
        this.gridStacks = Ext.create('Ozone.components.admin.StacksGrid', {
            preventHeader: true,
            region: 'center',
            border: false
        });
        this.gridStacks.store.proxy.extraParams = {
                adminEnabled: true
              };
        this.gridStacks.store.load({
        	params: {
                offset: 0,
                max: this.pageSize
            }
        });
        this.relayEvents(this.gridStacks, ['datachanged', 'select', 'deselect', 'itemdblclick']);
        
        this.pnlStackDetail = Ext.create('Ozone.components.admin.stack.StackDetailPanel', {
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
                this.gridStacks,
                this.pnlStackDetail
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
                    var records = me.gridStacks.getSelectionModel().getSelection();
                    if (records && records.length > 0) {
                        for (var i = 0; i < records.length; i++) {
                            me.doEdit(records[i].data.id, records[i].data.name);
                        }
                    } else {
                        me.showAlert('Error', 'You must select at least one stack to edit.');
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
                            text: 'Export',
                            handler: function(button) {
                                var records = me.gridStacks.getSelectionModel().getSelection();
                                if(records && records.length === 1) {
                                    me.doExport('stack', records[0]);
                                }
                                else if(records && records.length > 1) {
                                    me.showAlert('Error', 'You must select only one stack to export.');
                                }
                                else {
                                    me.showAlert('Error', 'You must select a stack to export.');
                                }
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
                  if (this.pnlStackDetail != null ) {
                    this.pnlStackDetail.collapse();
                    this.pnlStackDetail.removeData();
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
                this.pnlStackDetail.loadData(record);
                if (this.pnlStackDetail.collapsed && this.detailsAutoOpen) {this.pnlStackDetail.expand();}
            },
            this
        );
            
        this.searchBox.on(
            'searchChanged',
            function(searchbox, value) {
                this.gridStacks.applyFilter(value, ['name', 'description', 'stackContext']);
            },
            this
        );

        this.on(
             'itemdblclick',
             function(view, record, item, index, evt, opts) {
                 this.doEdit(record.data.id, record.data.name);
             },
             this
         );

        this.gridStacks.getView().on('itemkeydown', function(view, record, dom, index, evt) {
            switch(evt.getKey()) {
                case evt.SPACE:
                case evt.ENTER:
                    this.doEdit(record.data.id, record.data.name);
            }
        }, this);
        
        this.callParent(arguments);
        
        OWF.Eventing.subscribe('AdminChannel', owfdojo.hitch(this, function(sender, msg, channel) {
            if(msg.domain === 'Stack') {
                this.gridStacks.getBottomToolbar().doRefresh();
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
            this.showAlert('Launch Error', 'Stack Editor Launch Failed: ' + response.message);
        }
    },
    
    doEdit: function(id ,title) {
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
    
    doDelete: function() {
        var records = this.gridStacks.getSelectionModel().getSelection();
        if (records && records.length > 0) {

            var msg = 'This action will permanently delete ';
            if (records.length === 1) {
              msg += '<span class="heading-bold">' + Ext.htmlEncode(records[0].data.name) + '</span>.';
            }
            else {
              msg += 'the selected <span class="heading-bold">' + records.length + ' stacks</span>.';
            }
            this.showConfirmation('Warning', msg, function(btn, text, opts) {
                if (btn == 'ok') {
                    var store = this.gridStacks.getStore();
                    store.remove(records);
                    var remainingRecords = store.getTotalCount() - records.length;
                    store.on({
                       write: {
                         fn: function() {
                           if(store.data.items.length==0 && store.currentPage>1)
                           {
                               var lastPage = store.getPageFromRecordIndex(remainingRecords - 1);
                               var pageToLoad = (lastPage>=store.currentPage)?store.currentPage:lastPage;
                               store.loadPage(pageToLoad);
                           }
                           this.gridStacks.getBottomToolbar().doRefresh();
                           this.pnlStackDetail.removeData();
                           if (!this.pnlDashboardDetail.collapsed) {this.pnlDashboardDetail.collapse();}
                           this.refreshWidgetLaunchMenu();
                         },
                         scope: this,
                         single: true
                       }
                    });
                    store.save();
                }
            });
        } else {
            this.showAlert('Error', 'You must select at least one stack to delete.');
        }
    }
});

