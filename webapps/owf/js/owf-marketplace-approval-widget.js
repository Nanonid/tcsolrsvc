Ext.define('Ozone.data.WidgetDefinition', {
    extend: 'Ext.data.Model',
    idProperty: 'widgetGuid',
    fields:[
        {name:'id', mapping: 'id'},
        {name:'name', mapping:'value.namespace'},
        {name:'originalName', mapping:'value.originalName'},
        {name:'version', mapping:'value.widgetVersion'},
        {name:'description', mapping: 'value.description'},
        {name:'url', mapping:'value.url'},
        {name:'headerIcon', mapping:'value.headerIcon'},
        {name:'image', mapping:'value.image'},
        {name:'width', mapping:'value.width'},
        {name:'height', mapping:'value.height'},
        {name:'widgetGuid', mapping:'path'},
        {name:'universalName', mapping:'value.universalName'},
        {name:'maximized', mapping:'value.maximized'},
        {name:'minimized', mapping:'value.minimized'},
        {name:'x', mapping:'value.x'},
        {name:'y', mapping:'value.y'},
        {name:'visible', mapping:'value.visible'},
        {name:'definitionVisible', mapping:'value.definitionVisible'},
        {name:'background', mapping:'value.background'},
        {name:'disabled', mapping:'value.disabled'},
        {name:'editable', mapping:'value.editable'},
        {name:'tags', mapping:'value.tags'},
        {name:'singleton', mapping:'value.singleton'},
        {name:'allRequired', mapping:'value.allRequired'},
        {name:'directRequired', mapping:'value.directRequired'},
        {name:'userId', mapping:'value.userId'},
        {name:'userRealName', mapping:'value.userRealName'},
        {name:'totalUsers', mapping:'value.totalUsers'},
        {name:'totalGroups', mapping:'value.totalGroups'},
        {name:'widgetTypes', mapping: 'value.widgetTypes'},
        {name:'descriptorUrl', mapping: 'value.descriptorUrl'},
        {name:'intents', mapping: 'value.intents'},
        {name:'title', mapping:'value.namespace'},
        {name:'groups', mapping: 'value.groups'},
        {name:'disabled', mapping: 'value.disabled'}
    ]
});
Ext.define('Ozone.data.stores.AdminWidgetStore', {
  extend:'Ozone.data.OWFStore',
  model: 'Ozone.data.WidgetDefinition',
  alias: 'store.adminwidgetstore',
//  proxy: {
//    type: 'ajax',
//
//    startParam: 'offset',
//    limitParam: 'max',
//
//    //don't use a page param
//    pageParam: undefined,
//
//    simpleSortMode: true,
//    sortParam: 'sort',
//    directionParam: 'order',
//
//    api: {
//      read: Ozone.util.contextPath() + "/widget",
//      create: Ozone.util.contextPath() + "/widget",
//      update: Ozone.util.contextPath() + "/widget",
//      destroy: Ozone.util.contextPath() + "/widget"
//    },
//
//    reader: {
//      type: 'json',
//      totalProperty:'results',
//      root: 'data'
//    }
//  },
  remoteSort: true,
//  buffered: true,
  sorters: [
    {
      property : 'name',
      direction: 'ASC'
    }
  ],
  constructor: function(config) {

    Ext.applyIf(config, {
      api: {
        read: "/widget",
        create: "/widget",
        update: "/widget",
        destroy: "/widget"
      }
    });

    this.callParent(arguments);
  }

});
Ext.define('Ozone.data.stores.WidgetApprovalStore', {
  extend:'Ozone.data.OWFStore',
  model: 'Ozone.data.WidgetDefinition',
  alias: 'store.widgetapprovalstore',

  sorters: [
    {
      property : 'name',
      direction: 'ASC'
    }
  ],

  constructor: function(config) {

    Ext.applyIf(config, {
      api: {
        read: "/widget/listUserWidgets"
//        ,
//        create: "/widget",
//        update: "/widget",
//        destroy: "/widget"
      }
    });

    this.callParent(arguments);
  }

});
Ext.define('Ozone.components.admin.grid.WidgetApprovalsGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.widgetapprovalsgrid'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),

  cls: 'grid-widget',
  
  defaultPageSize: 50,
  //forceFit: true,
  baseParams: {
    tags: Ozone.config.carousel.pendingApprovalTagGroupName
  },

  initComponent: function() {

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'widgetapprovalstore',
        pageSize: this.defaultPageSize
      });
    }
    
    if (this.baseParams) { this.setBaseParams(this.baseParams); }

    Ext.apply(this, {
      selModel: Ext.create('Ext.selection.CheckboxModel'),
      columnLines: true,
      columns: [
        {
          itemId: 'widgetGuid',
          header: 'Widget GUID',
          dataIndex: 'widgetGuid',
          flex: 1,
          minWidth: 210,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'name',
          header: 'Widget',
          dataIndex: 'name',
          flex: 1,
          minWidth: 200,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {

            var title = value;
            var url = record.get('headerIcon');

            var contextPath = Ozone.util.contextPath();
            if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
              //url is not relative to the contextPath
              if (url.indexOf('/') == 0) {
                url = contextPath + url;
              }
              else {
                url = contextPath + '/' + url;
              }
              
              var blueDashboardIconRegX = /admin\/64x64_blue_dashboard.png/g;
              var blueGroupIconRegX = /admin\/64x64_blue_group.png/g;
              var blueUserIconRegX = /admin\/64x64_blue_user.png/g;
              var blueWidgetIconRegX = /admin\/64x64_blue_widget.png/g;
              
              if(url.match(blueDashboardIconRegX)){
              	url = url.replace(blueDashboardIconRegX, "admin/24x24_blue_dashboard.png");
              }else if(url.match(blueGroupIconRegX)){
              	url = url.replace(blueGroupIconRegX, "admin/24x24_blue_group.png");
              }else if(url.match(blueUserIconRegX)){
              	url = url.replace(blueUserIconRegX, "admin/24x24_blue_user.png");
              }else if(url.match(blueWidgetIconRegX)){
              	url = url.replace(blueWidgetIconRegX, "admin/24x24_blue_widget.png");
              }
            }
          
            var retVal = '<div class="grid-icon-and-text-title-box"><div class="grid-icon-and-text-icon"><img class="grid-icon-and-text-icon-image" src="' + Ext.htmlEncode(url) + '">';
            retVal += '</div>';
            retVal += '<div class="grid-icon-and-text-title">' + Ext.htmlEncode(title) + '</div>';


            return  retVal;
          }
        },
        {
          itemId: 'userId',
          header: 'Requesting User Name',
          dataIndex: 'userId',
          minWidth: 200,
          flex: 1,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'userRealName',
          header: 'Requesting User',
          dataIndex: 'userRealName',
          minWidth: 200,
          flex: 1,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        }
      ]
    });

//    if (this.infiniteScrolling) {
//      Ext.apply(this, {
//        // Use a PagingGridScroller (this is interchangeable with a PagingToolbar)
//        verticalScrollerType: 'paginggridscroller',
//        // do not reset the scrollbar when the view refreshs
//        invalidateScrollerOnRefresh: false,
//        loadMask: true
////        ,
////        disableSelection: true,
////        viewConfig: {
////            trackOver: false
////        }
//
//      });
//    }
//    else {
      Ext.apply(this, {
        multiSelect: true,
        dockedItems: [Ext.create('Ext.toolbar.Paging', {
          dock: 'bottom',
          store: this.store,
          displayInfo: true,
          hidden: this.hidePagingToolbar,
          itemId: 'widget-grid-paging'
          //,
//          hidden: true,
//          items: ['-', 'Results&nbsp;',
//            {
//              xtype: 'combo',
//              itemId: 'pageSizeCombo',
//              store: Ext.create('Ext.data.Store', {
//                data: [
//                  {pageSize:10},
//                  {pageSize:25},
//                  {pageSize:50},
//                  {pageSize:100}
//                ],
//                fields: ['pageSize']
//              }),
//              valueField: 'pageSize',
//              displayField: 'pageSize',
//              editable: false,
//              mode: 'local',
//              triggerAction: 'all',
//              clearFilterOnReset: false,
//              selectOnFocus: true,
//              forceSelection: true,
//              width: 75,
//              value: this.defaultPageSize,
//              listeners: {
//                select: {
//                  scope: this,
//                  fn: function(combo, records, opts) {
//                    //set page size
//                    if (records != null && records.length > 0) {
//                      var record = records[0];
//                      this.store.pageSize = record.get('pageSize');
//                      this.getBottomToolbar().pageSize = record.get('pageSize');
//                      this.getBottomToolbar().moveFirst();
//                    }
//                  }
//                }
//              }
//            }]
        })]
      });
//    }

    this.callParent(arguments);

//    this.getView().on('refresh', function () {
//        var els = this.getEl()
//            .select('.x-grid-row-checker');
//
//        els.each(function (fly) {
//            fly.dom.tabIndex = 0;
//        });
//
//        els.on('focus', function(evt, dom) {
//            var row = Ext.fly(dom).up('tr'),
//            view = this.getView();
//
//            view.getSelectionModel().setLastFocused(view.getRecord(row));
//        }, this);
//
//    }, this);

    this.on('afterrender', function(cmp) {
        var topCheckEl = cmp.getEl().select('.x-column-header-checkbox').first();

        Ozone.components.focusable.Focusable.setupFocus(topCheckEl);
        topCheckEl.on('keydown', function(evt) {
            if (evt.getKey() === evt.SPACE)
                if (topCheckEl.hasCls('x-grid-hd-checker-on'))
                    this.getView().getSelectionModel().deselectAll();
                else
                    this.getView().getSelectionModel().selectAll();
        }, cmp);
    });
  },

  load: function() {
//    if (this.infiniteScrolling) {
//      this.store.guaranteeRange(0, this.store.pageSize - 1);
//    }
//    else {
      this.store.loadPage(1);
//    }
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

Ext.define('Ozone.components.admin.widget.WidgetDetailPanel', {
  extend: 'Ext.panel.Panel',
  alias: ['widget.widgetdetailpanel'],
  layout: {
      type: 'vbox',
      align: 'stretch'
  },
  viewGroup: null,

  initComponent: function() {
    var me = this;
    
    OWF.Preferences.getUserPreference({
        namespace: 'owf.admin.WidgetEditCopy',
        name: 'guid_to_launch',
        onSuccess: function(result) {
            me.guid_EditCopyWidget = result.value;
        },
        onFailure: function(err){ /* No op */
            Ext.Msg.alert('Preferences Error', 'Error looking up Widget Editor: ' + err);
        }
    });

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'adminwidgetstore'
      });
    }

    this.viewGroup = Ext.create('Ext.view.View', {
		cls: 'widgetDetailsView',
		store: this.store,
		deferEmptyText: false,
		//minHeight: 200,
		//autoScroll: true,
		flex: 1,
		tpl: new Ext.XTemplate(
			'<tpl for=".">',
			'<div class="detail-info">',
			'<div class="detail-header-block">',
			'<div class="detail-widget">',
			'<div class="detail-icon">',
			  '<img src={image:this.renderImage} title="{name:htmlEncode}" class="detail-icon-image">',
			'</div>',
			'</div>',
			'<div class="detail-icon-block">',
			'<div class="detail-title">{name:htmlEncode}</div>',
			 '<div><span class="detail-label">Version:</span> {version:htmlEncode}</div>',
			'</div>',
			'</div>',
			'<div class="detail-block">',
			'<div><span class="detail-label">Description:</span> {description:htmlEncode}</div>',
			'<div><span class="detail-label">Universal Name:</span> {universalName:htmlEncode}</div>',
			'<div><span class="detail-label">Default Tags:</span> {tags:this.renderTags}</div>',
			'<div><span class="detail-label">Single Instance:</span> {singleton}</div>',
			'<div><span class="detail-label">Visible:</span> {definitionVisible}</div>',
      '<div><span class="detail-label">Background:</span> {background}</div>',
			'<div><span class="detail-label">Requires Widgets:</span> {directRequired:this.renderRequiresFlag}</div>',
			'<div><span class="detail-label">Width:</span> {width}</div>',
			'<div><span class="detail-label">Height:</span> {height}</div>',
			'</div>',
			'</div>',
			'</tpl>',
			{
				// XTemplate configuration:
				compiled: true,
				// member functions:
				renderImage: function(url) {
					var contextPath = Ozone.util.contextPath();
					if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
						//url is not relative to the contextPath
						if (url.indexOf('/') == 0) {
						url = contextPath + url;
						}
						else {
						url = contextPath + '/' + url;
						}
					}
					return encodeURI(decodeURI(url));
				},
				renderTags: function(tags) {
					var strTags = "";
					if (tags != null) {
						for (var i = 0; i < tags.length; i++) {
							strTags += Ext.htmlEncode(tags[i].name);
							if (i < tags.length - 1) {
								strTags += ", ";
							}
						}
					}

					if (strTags == "") {
						strTags = "<i>none</i>";
					}

					return strTags;
				},
				renderRequiresFlag: function(directRequired) {
					return directRequired != null && directRequired.length > 0 ;
				}
			}
		),
		emptyText: 'No widget selected',
		itemSelector: 'div.mpDetailSummary',
		autoScroll: 'true'
    });

    this.items = [
      this.viewGroup,
      {
        xtype: 'grid',
        itemId: 'reqGrid',
        cls: 'reqGrid',
        autoScroll: true,
        hidden: true,
        hideHeaders: true,
        forceFit: true,
//        disableSelection: true,
        flex: 1,
        border: false,
        store: {
          type: 'adminwidgetstore',
          remoteSort: false
        },
//        title: 'This Widget Requires:',
        dockedItems: [
          {
            xtype: 'toolbar',
            dock: 'top',
            items: [
              {
                xtype: 'tbtext',
                text: 'This Widget Requires:'
              }
            ]
          }
        ],
        columns: [
          {
            itemId: 'name',
            header: 'Title',
            dataIndex: 'name',
            flex: 1,
            minWidth: 200,
            sortable: true,
            renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {

              var title = value;
              var url = record.get('headerIcon');

              var contextPath = Ozone.util.contextPath();
              if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
                //url is not relative to the contextPath
                if (url.indexOf('/') == 0) {
                  url = contextPath + url;
                }
                else {
                  url = contextPath + '/' + url;
                }
              }

              var retVal = '<div class="grid-widget"><div class="grid-icon-and-text-title-box"><div class="grid-icon-and-text-icon"><img class="grid-icon-and-text-icon-image" src="' + url + '"> ';
              retVal += '</div>';
              retVal += '<div class="grid-icon-and-text-title">' + title + '</div>';

              return  retVal;
            }
          }
        ],
        listeners: {
          itemdblclick: {
            fn: function(view) {
              var records = view.getSelectionModel().getSelection();
              if (records && records.length > 0) {
                for (var i = 0; i < records.length; i++) {
                  this.doEdit(records[i].data.id, records[i].data.name);
                }
              }
              else {
                Ext.Msg.alert("Error", "You must select at least one widget to edit.");
              }
            },
            scope: this
          }
        }
      }

    ];

    this.callParent(arguments);

  },

  clear: function() {
    this.load(null);
  },

  load: function(record) {
    var reqGrid = this.getComponent('reqGrid');

    var records = [];
    if (record != null) {
      records.push(record);
    }
    //set the detailsView to display info for the passed in widget
    this.viewGroup.store.loadData(records, false);

    //there are required widgets display them
    if (record != null && record.data.allRequired != null && record.data.allRequired.length > 0) {
      //save off where this request comes from for later
      this.requestFrom = record.data.id;
      //get all required widgets via ajax call
      Ext.Ajax.request({
          url: Ozone.util.contextPath() + '/widget',
          params: {
              id: record.data.allRequired,
              _method: 'GET'
          },
          success: function(response, opts) {
              var json = Ext.decode(response.responseText);
              if (json) {
                var data = json.data;
                if (data != null && data.length > 0) {

                  var requiredWidgets = [];
                  if (data) {
                    for (var i = 0; i < data.length; i++) {
                        requiredWidgets.push({
                          id: data[i].path,
                          name: data[i].value.namespace,
                          version: data[i].value.widgetVersion,
                          url: data[i].value.url,
                          headerIcon: data[i].value.headerIcon,
                          image: data[i].value.image,
                          width: data[i].value.width,
                          height: data[i].value.height,
                          widgetGuid: data[i].path,
                          maximized: data[i].value.maximized,
                          minimized: data[i].value.minimized,
                          x: data[i].value.x,
                          y: data[i].value.y,
                          visible: data[i].value.visible,
                          tags: data[i].value.tags,
                          totalUsers: data[i].value.totalUsers,
                          totalGroups: data[i].value.totalGroups,
                          singleton: data[i].value.singleton
                        });
                    }
                  }

                  //show required widgets
                  if (reqGrid && this.store.getAt(0).get('id') == this.requestFrom) {
                    reqGrid.store.loadData(requiredWidgets);
                    reqGrid.setVisible(true);
                  }
                }
                else {
                  //hide grid there are no required widgets
                  if (reqGrid) {
                    reqGrid.store.removeAll(true);
                    reqGrid.setVisible(false);
                  }
                }
              }
          },
          failure: function(response, opts) {
              Ext.Msg.alert('Server Error','Error retrieving required widgets: ' + response);
          },
          scope: this
      });
    }
    else {
      if (reqGrid) {
        reqGrid.store.removeAll(true);
        reqGrid.setVisible(false);
      }
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
    }, function(response) {
      if (response.error) {
        Ext.Msg.alert('Launch Error', 'Widget Editor Launch Failed: ' + response.message);
      }
    });
  }


});

Ext.define('Ozone.components.admin.widget.ApprovePanel', {
  extend: 'Ext.panel.Panel',
  alias: ['widget.approvepanel', 'widget.Ozone.components.admin.widget.ApprovePanel'],

  widgets: null,
  itemId: 'approvepanel',
  cls: 'approvepanel',

  // private
  initComponent: function() {

    this.addEvents(['approve','cancel']);

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'adminwidgetstore'
      });
    }

    Ext.apply(this, {
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [
        {
          xtype: 'component',
          itemId: 'titlePanel',
          cls: 'titlePanel',
          layout: 'fit',
          border: false,
          height: 30,
          renderTpl: ['You have selected to approve {name}.'],
          renderData: {
            name: '0 widget(s)'
          }
        }
        ,
        {
          xtype: 'component',
          itemId: 'reqTitlePanel',
          cls: 'reqTitlePanel',
          layout: 'fit',
          border: false,
          height: 50,
          renderTpl: ['These widgets are required by other widgets in OWF. ' +
                  'Approving these widgets will additionally approve the widgets listed below.']
        },
        {
          xtype: 'grid',
          itemId: 'reqGrid',
          autoScroll: true,
          forceFit: true,
          flex: 1,
          border: false,
          store: {
            type: 'adminwidgetstore',
            remoteSort: false
          },
          columns: [
            {
              itemId: 'name',
              header: 'Title',
              dataIndex: 'name',
              flex: 1,
              minWidth: 200,
              sortable: true,
              renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {

                var title = value;
                var url = record.get('headerIcon');

                var contextPath = Ozone.util.contextPath();
                if (!url.match(new RegExp('^/?' + contextPath + '/.*$', 'i')) && !url.match(new RegExp('^https?://.*', 'i'))) {
                  //url is not relative to the contextPath
                  if (url.indexOf('/') == 0) {
                    url = contextPath + url;
                  }
                  else {
                    url = contextPath + '/' + url;
                  }
                }

                var retVal = '<div class="grid-widget"><div class="grid-icon-and-text-title-box"><div class="grid-icon-and-text-icon"><img class="grid-icon-and-text-icon-image" src="' + url + '"> ';
                retVal += '</div>';
                retVal += '<div class="grid-icon-and-text-title">' + title + '</div>';
                    
                return  retVal;
              }
            },
            {
              itemId: 'widgetUrl',
              header: 'URL',
              dataIndex: 'url',
              flex: 1,
              minWidth: 250,
              menuDisabled: true,
              sortable: true
            }
          ]
        }
      ],
      buttons: [
        {
          text: Ozone.layout.DialogMessages.ok,
          handler: function(button) {
            this.approve();
          },
          scope: this
        },
        {
          text: 'Cancel',
          handler: function(button) {
            this.cancel();
          },
          scope: this
        }
      ]
    });

    this.callParent();

    this.on({
      afterrender: {
        fn: function() {
          if (this.widgets != null) {
            this.loadData(this.widgets);
          }
        },
        scope: this
      }
    })
  },

  loadData: function(widgets) {
    if (widgets != null) {
      this.store.loadData(widgets);

      var titlePanel = this.down('#titlePanel');
      var selectedWidgetCount = this.store.getCount();
      var renderData = {
        name: selectedWidgetCount > 1 ? ('<span class="heading-bold">'+ selectedWidgetCount + '</span> widgets') : ('<span class="heading-bold">'+this.store.getAt(0).data.name+'</span>')
      };
      if (titlePanel.rendered) {
        titlePanel.renderTpl.overwrite(titlePanel.getTargetEl(), renderData);
      }
      else {
        titlePanel.renderData = renderData;
      }

      var data = this.requiredWidgets;
      var reqGrid = this.down('#reqGrid');
      var reqStore = reqGrid.getStore();
      if (reqStore) {
        reqStore.removeAll();
        if (data.length > 0) {
          reqStore.loadData(data);
        }
        this.doLayout();
      }
    }
  },

  approve: function() {
    var widgetRecs = this.store.getRange();
    var reqGrid = this.down('#reqGrid');
    var reqStore = reqGrid.getStore();
    var reqRecs = reqStore.getRange();
    var allRecs = widgetRecs.concat(reqRecs);

    this.fireEvent('approve', {
      widgetRecs: allRecs
    });
  },

  cancel: function() {
    this.fireEvent('cancel');
  },

  //cache components that are searched for
  down: function(selector) {
    if (this.cmpCache == null) {
      this.cmpCache = Ext.create('Ext.util.MixedCollection');
    }

    var cmp = this.cmpCache.getByKey(selector);
    if (cmp == null) {
      cmp = this.callParent(arguments);
      if (cmp != null) {
        this.cmpCache.add(selector, cmp);
      }
    }

    return cmp;
  }
});

Ext.define('Ozone.components.admin.widget.WidgetApprovalPanel', {
  extend: 'Ozone.components.admin.ManagementPanel',
  alias: ['widget.WidgetApprovalPanel', 'widget.widgetapprovalpanel', 'widget.Ozone.components.admin.widget.WidgetApprovalPanel'],

  dragAndDrop: true,
  launchesWidgets: true,
  channel: 'AdminChannel',
  defaultTitle: 'Widget Requests',
  minButtonWidth: 80,
  cls: 'widgetapprovalpanel',
  detailsAutoOpen: true,

  initComponent: function() {

    var me = this;

    //create new store
    Ext.apply(this, {
      xtype: 'panel',
      itemId: 'main',
      layout: {
        type: 'border'
      },
      items: [
        {
          xtype: 'widgetapprovalsgrid',
          itemId: 'grid',
          border: false,
          region: 'center'

        },
        {
          xtype: 'widgetdetailpanel',
          itemId: 'widgetdetailpanel',
          store:  Ext.create('Ozone.data.stores.WidgetApprovalStore'),
          region: 'east',
          preventHeader: true,
          collapseMode: 'mini',
          collapsible: true,
          collapsed: true,
          split: true,
          border: false,
          width: 300
        }
      ],
      dockedItems: [
        {
          xtype: 'toolbar',
          dock: 'top',
          layout: {
              type: 'hbox',
              align: 'stretchmax'
          },
          items: [
            {
              itemId: 'tbtext',
              xtype: 'tbtext',
              text: '<span class="heading-bold">' + this.defaultTitle + ' </span>'
            },
            '->',
            {
                xtype: 'searchbox',
                listeners: {
                    searchChanged: function(box, value) {
                        var grid = me.down('#grid');
                        if (grid != null) {
                            grid.applyFilter(value, ['name','userId','userRealName']);
                        }
                    }
                }
            }
          ]
        },
        {
          xtype: 'toolbar',
          dock: 'bottom',
          ui: 'footer',
          defaults: {
            minWidth: this.minButtonWidth
          },
          items: [
            {
              xtype: 'button',
              text: 'Approve',
              itemId: 'approveButton',
              handler: function() {
                var grid = this.down('#grid');
                var records = grid.getSelectionModel().getSelection();
                if (records && records.length > 0) {
                  this.approve(records);
                }
                else {
                    me.showAlert('Error', 'You must select at least one widget to approve.');
                }
              },
              scope: this
            },
            {
              xtype: 'button',
              text: 'Reject',
              itemId: 'rejectButton',
              handler: function() {
                var grid = this.down('#grid');
                var records = grid.getSelectionModel().getSelection();
                if (records && records.length > 0) {
                  this.reject(records);
                }
                else {
                    me.showAlert('Error', 'You must select at least one widget to reject.');
                }
              },
              scope: this
            }
          ]
        }
      ]
    });

    this.callParent();

    this.on({
      render: {
        fn: function() {

          //bind to grid after render
          var grid = this.down('#grid');
          if (grid != null) {

            grid.on({
              select: {
                fn: function(rowModel, record, index, opts) {
                  var widgetdetailpanel = this.down('#widgetdetailpanel');
                  if (widgetdetailpanel != null) {
                    widgetdetailpanel.load(record);
                    if(this.detailsAutoOpen) {
                    	widgetdetailpanel.expand();
                    }
                  }
                },
                scope: this
              }
            });

            //load the data
            grid.load();

            grid.store.on({
              datachanged: {
                fn: function() {
                  //collapse and clear detail panel if the store is refreshed
                  var widgetdetailpanel = this.down('#widgetdetailpanel');
                  if (widgetdetailpanel != null) {
                    widgetdetailpanel.collapse();
                    widgetdetailpanel.clear();
                  }

                  //refresh launch menu
                  if (!this.disableLaunchMenuRefresh) {
                    this.refreshWidgetLaunchMenu();
                  }
                },
                scope: this
              }
            })
          }
        },
        scope: this
      },
      afterrender: {
    	  fn: function() {
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
    	  scope: this
      }
    });
  },

  createApprovalWindow: function(widgets) {

    var me = this;

    var requestedWidgetIds  = Ext.create('Ext.util.MixedCollection');
    requestedWidgetIds.getKey = function(obj) {
      return obj;
    };

    var requiredWidgetIds  = Ext.create('Ext.util.MixedCollection');
    requestedWidgetIds.getKey = function(obj) {
      return obj;
    };

    var allWidgetRequests = Ext.create('Ext.util.MixedCollection');
    allWidgetRequests.getKey = function(obj) {
      return obj.userId +'-'+obj.widgetGuid;
    };

    if (widgets != null) {
      for (var i = 0; i < widgets.length; i++) {
        var w = widgets[i].data;
        requestedWidgetIds.add(w.widgetGuid);
        allWidgetRequests.add({
          userId: w.userId,
          widgetGuid: w.widgetGuid
        });
        if (w.allRequired != null && w.allRequired.length > 0) {
          for (var j = 0 ; j < w.allRequired.length ; j++) {
            requiredWidgetIds.add(w.allRequired[j]);
            allWidgetRequests.add({
              userId: w.userId,
              widgetGuid: w.allRequired[j]
            });
          }
        }
      }
    }

      //get all required widgets requests via ajax call
      Ext.Ajax.request({
          url: Ozone.util.contextPath() + '/widget',
          params: {
              id: requiredWidgetIds.getRange(),
              _method: 'GET'
          },
          success: function(response, opts) {
              var json = Ext.decode(response.responseText);
              if (json) {
                var data = json.data;
                if (data != null && data.length > 0) {

                  var requiredWidgets = [];
                  if (data) {
                    for (var i = 0; i < data.length; i++) {
                      var widgetData = {
                          id: data[i].id,
                          name: data[i].value.namespace,
                          version: data[i].value.widgetVersion,
                          url: data[i].value.url,
                          headerIcon: data[i].value.headerIcon,
                          image: data[i].value.image,
                          width: data[i].value.width,
                          height: data[i].value.height,
                          widgetGuid: data[i].path,
                          maximized: data[i].value.maximized,
                          minimized: data[i].value.minimized,
                          x: data[i].value.x,
                          y: data[i].value.y,
                          visible: data[i].value.visible,
                          tags: data[i].value.tags,
                          userId: data[i].value.userId,
                          userRealName: data[i].value.userRealName,
                          totalUsers: data[i].value.totalUsers,
                          totalGroups: data[i].value.totalGroups,
                          singleton: data[i].value.singleton
                        };
                      //make sure we don't include the same widgets that we want to approve
                      if (!requestedWidgetIds.containsKey(widgetData.widgetGuid)) {
                        requiredWidgets.push(widgetData);
                      }
                    }
                  }

                  //open approve window
//                  var vpSize = Ext.getBody().getViewSize();
//                  var win = Ext.create('Ext.window.Window', {
//                    id: 'approvewindow',
//                    title: 'Warning',
//                    itemId: 'approvewindow',
//                    minWidth: 250,
//                    minHeight: 200,
//                    width: vpSize.width * .8,
//                    height: vpSize.height * .75,
//                    width: 250,
//                    height: 200,
//                    layout: 'fit',
//                    modal: true,
//                    items: [
//                      {
//                        xtype: 'approvepanel',
//                        itemId: 'approvepanel',
//                        widgets: widgets,
//                        requiredWidgets: requiredWidgets,
//                        listeners: {
//                          approve: {
//                            fn: function(data) {
//                                this.doApproveReject(allWidgetRequests.getRange());
//                            },
//                            scope: this
//                          },
//                          cancel: {
//                            fn: function() {
//                              win.close();
//                            },
//                            scope: this
//                          }
//                        }
//                      }
//                    ]
//                  });
//                  win.show();

                  var msg = 'You have selected to approve ';
                  var selectedWidgetCount = widgets.length;
                  msg += selectedWidgetCount > 1 ? ('<span class="heading-bold">'+ selectedWidgetCount + '</span> widgets')
                          : ('<span class="heading-bold">'+widgets[0].data.name+'</span>');
                  msg += '. <br/><br/> '+ (selectedWidgetCount > 1 ? 'These widgets require' : 'This widget requires')
                          + ' other widget(s) in OWF. Approving '+ (selectedWidgetCount > 1 ? 'these widgets' : 'this widget ')
                          + ' will automatically approve '+ (selectedWidgetCount > 1 ? 'their' : 'its') +' required widget(s).';

                  this.showConfirmation('Warning', msg, function(btn, text, opts) {
                      if (btn == 'ok') {
                          this.doApproveReject(allWidgetRequests.getRange());
                      }
                  });
                }
              }
          },
          failure: function(response, opts) {
              me.showAlert('Error', 'Error retrieving required widgets.');
          },
          scope: this
      });



  },

  approve: function(requests) {
    var requiredWidgetsExist = false;
    if (requests != null) {
      for (var i = 0; i < requests.length; i++) {
        if (requests[i].data.allRequired != null && requests[i].data.allRequired.length > 0) {
          requiredWidgetsExist = true;
          break;
        }
      }

      if (requiredWidgetsExist) {
        this.createApprovalWindow(requests);
      }
      //just approve the widgets no required widgets found
      else {
        this.doApproveReject(requests);
      }

    }

  },

  reject: function(requests) {
    this.doApproveReject(null,requests);
  },

  doApproveReject : function(approveList, rejectList) {
    var toApprove = [];
    var toReject = [];

    var dt = new Date();
    var dateString = Ext.Date.format(dt,'Y-m-d');

    if (approveList) {
      for (var i = 0, len = approveList.length ; i < len ; i++) {
        var rec = approveList[i].data != null ? approveList[i].data : approveList[i];
        toApprove.push({
//          id: rec.id,
          userId: rec.userId,
          widgetGuid: rec.widgetGuid
        });
      }
    }
    if (rejectList) {
      for (var i = 0, len = rejectList.length ; i < len ; i++) {
        var rec = rejectList[i].data != null ? rejectList[i].data : rejectList[i];
        toReject.push({
          //id: rec.id,
          userId: rec.userId,
          widgetGuid: rec.widgetGuid
        });
      }
    }

    Ext.Ajax.request({
      url: Ozone.util.contextPath() + '/widget/approve',
      method: 'POST',
      timeout: 30000,
      autoAbort: false,
      disableCaching: true,
      params: {
        toApprove: Ext.encode(toApprove),
        toDelete: Ext.encode(toReject)
      },
      scope: this,
      success: function() {
        //refresh store
        var grid = this.down('#grid');
        grid.refresh();

        var win = Ext.getCmp('approvewindow');
        if (win) {
          win.close();
        }
      },
      failure: function() {
        me.showAlert('Error', 'Server Error during approve or reject.');
        var win = Ext.getCmp('approvewindow');
        if (win) {
          win.close();
        }
      }
    });
  }

});

