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
Ext.define('Ozone.components.admin.grid.DashboardGroupsGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.dashboardgroupsgrid'],
  quickSearchFields: ['name'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),

  cls: 'grid-dashboard',
  
  defaultPageSize: 50,
  multiSelect: true,
  forceFit: true,
  baseParams: null,

  initComponent: function() {

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'admindashboardstore',
        pageSize: this.defaultPageSize
      });
    }
    
    if (this.baseParams) { this.setBaseParams(this.baseParams); }

    Ext.apply(this, {
        columnLines:true,
      columns: [
        {
          itemId: 'guid',
          header: 'GUID',
          dataIndex: 'guid',
          flex: 1,
          width: 210,
          minWidth: 210,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + value +'</div>';
          }
        },{
          itemId: 'name',
          header: 'Dashboard Title',
          dataIndex: 'name',
          flex: 3,
          minWidth: 200,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {

            var title = value;
            var dashboardLayoutList = record.get('EDashboardLayoutList'); //List of valid ENUM Dashboard Layout Strings
            var dashboardLayout = record.get('layout'); //current dashboard layout string
            var iconClass = "grid-dashboard-default-icon-layout";
            
            // if(dashboardLayout && dashboardLayoutList){
            //     if(dashboardLayoutList.indexOf(dashboardLayout) != -1){
            //         iconClass = "grid-dashboard-icon-layout-" + dashboardLayout;
            //     }
            // }
            
            // var retVal = '<div class="grid-dashboard-title-box"><div class="grid-dashboard-icon ' + iconClass +'"></div>';
            // retVal += '<div class="grid-dashboard-title">' + title + '</div>';
            // retVal += '</div>';

            return  '<p class="grid-dashboard-title '+ iconClass + '">' + Ext.htmlEncode(title) + '</p>';
          }
        },
        {
          itemId: 'groups',
          header: 'Groups',
          dataIndex: 'groups',
          flex: 1,
          sortable: false,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text grid-dashboard-group-count">' + value.length +'</div>';
          }
        },
        {
          itemId: 'widgets',
          header: 'Widgets',
          dataIndex: 'layoutConfig',
          flex: 1,
          sortable: false,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
        	  var widgetCount = 0;
        	  if (value) {
    			var countWidgets = function(cfg) {
    				if(!cfg || !cfg.items)
    					return;
    				
    				if(cfg.items.length === 0) {
    					if(cfg.widgets && cfg.widgets.length > 0) {
    						widgetCount += cfg.widgets.length;
    					}
    				}
    				else {
    					for(var i = 0, len = cfg.items.length; i < len; i++) {
    						countWidgets(cfg.items[i]);
    					}
    				}

    				return widgetCount;
    			};
          	    widgetCount = countWidgets(value);
        	  }
        	  return  '<div class="grid-text grid-dashboard-widget-count">' + widgetCount +'</div>';
          }
        }
      ]
    });


      Ext.apply(this, {
        multiSelect: true,
        dockedItems: [Ext.create('Ext.toolbar.Paging', {
          dock: 'bottom',
          store: this.store,
          displayInfo: true,
          hidden: this.hidePagingToolbar,
          itemId: 'dashboard-groups-grid-paging'
        })]
      });

    this.callParent(arguments);
  },
  
  getSelectedDashboards: function(){
    return this.getSelectionModel().getSelection();
  },

  load: function() {
      this.store.loadPage(1);
  },

  refresh: function() {
    this.store.loadPage(this.store.currentPage);
  },

  getTopToolbar: function() {
    return this.getDockedItems('toolbar[dock="top"]')[0];
  },
  getBottomToolbar: function() {
    return this.getDockedItems('toolbar[dock="bottom"]')[0];
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
        max: this.store.pageSize
      }
    });
  },

  clearFilters: function() {
    this.store.proxy.extraParams = undefined;
    if (this.baseParams) { this.setBaseParams(this.baseParams); }
    this.store.load({
      params: {
        start: 0,
        max: this.store.pageSize
      }
    });
  },
  
  setBaseParams: function(params) {
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
  }

});

Ext.define('Ozone.components.admin.dashboard.DashboardDetailPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.dashboarddetailpanel', 'widget.dashboarddetail'],
    
    viewDashboard: null,
    loadedRecord: null,
    
    initComponent: function() {
        //init quicktips
        Ext.tip.QuickTipManager.init(true,{
            dismissDelay: 60000,
            showDelay: 2000
        });
        
        this.viewDashboard = Ext.create('Ext.view.View', {
            store: Ext.create('Ext.data.Store', {
                storeId: 'storeDashboardItem',
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'layout',  type: 'string' },
                    { name: 'EDashboardLayoutList',  type: 'string' },
                    { name: 'isGroupDashboard', type: 'boolean'},
                    { name: 'groups', model: 'Group'},
                    { name: 'description', type: 'string' },
                    { name: 'createdDate', type: 'string' },
                    { name: 'prettyCreatedDate', type: 'string' },
                    { name: 'editedDate', type: 'string' },
                    { name: 'prettyEditedDate', type: 'string' },
                    { name: 'createdBy', model: 'User' },
                    { name: 'stack', model: 'Stack'}
                ]
            }),
            deferEmptyText: false,
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="selector">',
                        '<div id="detail-info" class="detail-info">',
                            '<div class="dashboard-detail-icon-block">',
                                '{[this.renderIconBlock(values)]}',
                            '</div>',
                            '<div class="dashboard-detail-info-block">',
                                '<div class="detail-header-block">',
                                    '{[this.renderDetailHeaderBlock(values)]}',
                                '</div>',
                                '<div class="detail-block">',
                                    '<div><span class="detail-label">Description:</span> {description:htmlEncode}</span></div><br>',
                                    '<div><span class="detail-label">Groups:</span> {[this.renderGroups(values)]}</div>',
                                    '<div><span class="detail-label">Created:</span> <span {createdDate:this.renderToolTip}>{prettyCreatedDate:this.renderDate}</span></div>',
                                    '<div><span class="detail-label">Author:</span> {[this.renderUserRealName(values)]}</div>',
                                    '<div><span class="detail-label">Last Modified:</span> <span {editedDate:this.renderToolTip}>{prettyEditedDate:this.renderDate}</span></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</tpl>',
                {
                    compiled: true,
                    renderDate: function(value) {
                        return value ? value : '';
                    },
                    renderToolTip: function (value) {
                        var str = 'data-qtip="' + value + '"';

                        return str;
                    },
                    renderUserRealName: function(values) {
                        var createdBy = values.createdBy;
                        return (createdBy.userRealName ? Ext.htmlEncode(createdBy.userRealName) : '')
                    },
                    renderGroups: function(values) {
                        var groups = values.groups;
                        var stack = values.stack;
                        var retVal = '';
                        if (!stack && groups && groups.length > 0) {
                            for (var i = -1; ++i < groups.length;) {
                                retVal += Ext.htmlEncode(groups[i].name) + ', ';
                            }
                            retVal = retVal.substring(0, retVal.length - 2);
                        }
                        return retVal;
                    },
                    
                    renderIconBlock: function(values) {
                        var iconClass = "dashboard-default-icon-layout";
                        var retVal = '<div class="dashboard-icon ' + iconClass + '"></div>';
                        return retVal;
                    },
                    renderDetailHeaderBlock: function(values){
                        var isGroupDashboard = values.isGroupDashboard;
                        var title = values.name;

                        var retVal = '<div class="dashboard-title-block">';
                        retVal += '<div class="dashboard-title detail-title">' + Ext.htmlEncode(title) + '</div>';
                        retVal += (isGroupDashboard) ? '<div>This is a group dashboard.</div>' : '';
                        retVal += '</div>';
            
                        return  retVal;
                    }
                }
            ),
			emptyText: 'No dashboard selected',
            itemSelector: 'div.selector',
            autoScroll: 'true'
        });
        
        this.items = [this.viewDashboard];
        
        this.callParent(arguments);
    },
    
    loadData: function(record) {
        this.viewDashboard.store.loadData([record], false);
        this.loadedRecord = record;
    },
    
    removeData: function() {
        this.viewDashboard.store.removeAll(false);
        this.loadedRecord = null;
    }
    
});
Ext.define('Ozone.components.admin.dashboard.GroupDashboardManagementPanel', {
    extend: 'Ozone.components.admin.ManagementPanel',
    alias: ['widget.groupdashboardmanagement','widget.groupdashboardmanagementpanel','widget.Ozone.components.admin.GroupDashboardManagementPanel'],
    
    layout: 'fit',
    
    cls: 'groupdashboardmanagementpanel',
    
    gridDashboards: null,
    pnlDashboardDetail: null,
    txtHeading: null,
    lastAction: null,
    guid_EditCopyWidget: null,
    
    widgetStateHandler: null,
    dragAndDrop: true,
    launchesWidgets: true,
    channel: 'AdminChannel',
    defaultTitle: 'Group Dashboards',
    minButtonWidth: 80,
    detailsAutoOpen: true,
    
    initComponent: function() {
        
        var me = this;
        
        OWF.Preferences.getUserPreference({
            namespace: 'owf.admin.DashboardEditCopy',
            name: 'guid_to_launch',
            onSuccess: function(result) {
                me.guid_EditCopyWidget = result.value;
            },
            onFailure: function(err){ /* No op */
                me.showAlert('Preferences Error', 'Error looking up Dashboard Editor: ' + err);
            }
        });
        
        this.gridDashboards = Ext.create('Ozone.components.admin.grid.DashboardGroupsGrid', {
            preventHeader: true,
            region: 'center',
            border: false
        });
        
        this.gridDashboards.setBaseParams({
                adminEnabled: true,
	            isGroupDashboard: true,
				isStackDashboard: false
        });
        
        this.gridDashboards.store.load({
            params: {
                offset: 0,
                max: this.pageSize
            }
        });
        
        this.relayEvents(this.gridDashboards, ['datachanged', 'select', 'deselect', 'itemdblclick']);
        
        this.pnlDashboardDetail = Ext.create('Ozone.components.admin.dashboard.DashboardDetailPanel', {
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
            width: 266
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
                this.gridDashboards,
                this.pnlDashboardDetail
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
                xtype: 'button',
                text: 'Edit',
                handler: function() {
                    me.doEdit();
                }
            }, {
                xtype: 'button', 
                text: 'Delete',
                handler: function(button) {
                    me.doDelete();
                }
            }]
        }];
    
        this.gridDashboards.store.on(
        	'load',
        	function(thisStore, records, options){
        		if ((this.pnlDashboardDetail != null ) && 
        		   (!this.pnlDashboardDetail.collapsed) && 
        		    (this.pnlDashboardDetail.loadedRecord != null)){
        			for(var idx=0; idx < records.length; idx++){
        				if(records[idx].id == this.pnlDashboardDetail.loadedRecord.id){
        					this.pnlDashboardDetail.loadData(records[idx]);
        					break;
        				}
        			}
        		}
        	},
        	this
        );
        
        this.on(
            'datachanged',
            function(store, opts) {
                  //collapse and clear detail panel if the store is refreshed
                  if (this.pnlDashboardDetail != null ) {
                    this.pnlDashboardDetail.collapse();
                    this.pnlDashboardDetail.removeData();
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
                this.pnlDashboardDetail.loadData(record);
                if (this.pnlDashboardDetail.collapsed && this.detailsAutoOpen) {this.pnlDashboardDetail.expand();}
            },
            this
        );
        
        this.searchBox.on(
            'searchChanged',
            function(searchbox, value) {
                var grid = this.gridDashboards;

                if (grid)  {
                    if (!value)
                        this.gridDashboards.clearFilters();
                    else
                        this.gridDashboards.applyFilter(value, ['name', 'description']);
                }
            },
            this
        );
            
        this.on({
            'itemdblclick': {
	            scope: this,
	            fn: this.doEdit
            }
        });

        this.gridDashboards.getView().on({
            itemkeydown: {
                scope: this,
                fn: function(view, record, dom, index, evt) {
                    switch(evt.getKey()) {
                        case evt.SPACE:
                        case evt.ENTER:
                            this.doEdit();
                    }
                }
            }
        });
        
        
        this.callParent(arguments);
        
        OWF.Eventing.subscribe('AdminChannel', owfdojo.hitch(this, function(sender, msg, channel) {
            if(msg.domain === 'Dashboard') {
               this.gridDashboards.getBottomToolbar().doRefresh();
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
    
    onLaunchFailed: function(response) {
        if (response.error) {
            this.showAlert('Launch Error', 'Dashboard Editor Launch Failed: ' + response.message);
        }
    },

    doCreate: function() {
    	var dataString = Ozone.util.toString({
            copyFlag: false,
            isCreate: true,
            isGroupDashboard: true
        });
        
        OWF.Launcher.launch({
            guid: this.guid_EditCopyWidget,
            launchOnlyIfClosed: false,
            data: dataString
        }, this.onLaunchFailed);
    },
    
    doEdit: function() {
    	var records = this.gridDashboards.getSelectedDashboards();
        if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {
                var id = records[i].getId();//From Id property of Dashboard Model
                var dataString = Ozone.util.toString({
		            id: id,
		            copyFlag: false,
		            isCreate: false,
		            isGroupDashboard: true
		        });
		        
		        OWF.Launcher.launch({
                    title: '$1 - ' + records[i].get('name'),
                    titleRegex: /(.*)/,
		            guid: this.guid_EditCopyWidget,
		            launchOnlyIfClosed: false,
		            data: dataString
		        }, this.onLaunchFailed);
            }
        } else {
            this.showAlert("Error", "You must select at least one dashboard to edit");
        }
    },
    
    doDelete: function() {
        var records = this.gridDashboards.getSelectionModel().getSelection();
        if (records && records.length > 0) {

            var msg = 'This action will permanently delete ';
            if (records.length == 1) {
              msg += '<span class="heading-bold">' + Ext.htmlEncode(records[0].data.name) + '</span>.';
            }
            else {
              msg += 'the selected <span class="heading-bold">' + records.length + ' dashboards</span>.';
            }
            this.showConfirmation('Warning', msg, function(btn, text, opts) {
                if(btn == 'ok') {
                    var store = this.gridDashboards.getStore();
                    store.remove(records);
                    var remainingRecords = store.getTotalCount() - records.length;
                    store.on({
                        write: {
                            fn: function() {
                                if(store.data.items.length == 0 && store.currentPage > 1) {
                                    var lastPage = store.getPageFromRecordIndex(remainingRecords - 1);
                                    var pageToLoad = (lastPage >= store.currentPage) ? store.currentPage : lastPage;
                                    store.loadPage(pageToLoad);
                                }
                                this.gridDashboards.getBottomToolbar().doRefresh();
                                this.pnlDashboardDetail.removeData();
                                if(!this.pnlDashboardDetail.collapsed) {
                                this.pnlDashboardDetail.collapse();}
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
            this.showAlert("Error", "You must select at least one dashboard to delete");
        }
    }
});

