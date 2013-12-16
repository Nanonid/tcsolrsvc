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
Ext.define('Ozone.components.admin.grid.WidgetsGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.widgetsgrid'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),

  cls: 'grid-widget',
  
  defaultPageSize: 50,
//  infiniteScrolling: false,
  forceFit: true,
  baseParams: null,

  initComponent: function() {

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'adminwidgetstore',
        pageSize: this.defaultPageSize
      });
    }
    
    if (this.baseParams) { this.setBaseParams(this.baseParams); }

    Ext.apply(this, {
    	columnLines: true,
      columns: [
        {
          itemId: 'universalName',
          header: 'Universal Name',
          dataIndex: 'universalName',
          flex: 1,
          width: 210,
          minWidth: 210,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + value ? Ext.htmlEncode(value) : '' +'</div>';
          }
        },
        {
          itemId: 'widgetGuid',
          header: 'GUID',
          dataIndex: 'widgetGuid',
          flex: 1,
          width: 210,
          minWidth: 210,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + value +'</div>';
          }
        },
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
          itemId: 'widgetUrl',
          header: 'URL',
          dataIndex: 'url',
          width: 250,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'type',
          header: 'Type',
          dataIndex: 'widgetTypes',
          width: 75,
          sortable: false,
          hidden:true,
          renderer: function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return '<div class="grid-text">' + value[0] ? value[0].name : '' + '</div>';
          }
        },
        {
          itemId: 'version',
          header: 'Version',
          dataIndex: 'version',
          width: 75,
          sortable: true,
          hidden: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'totalUsers',
          header: 'Users',
          dataIndex: 'totalUsers',
          width: 75,
          hidden: this.hideTotalUsersCol,
          sortable: false,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + value +'</div>';
          }
        },
        {
          itemId: 'totalGroups',
          header: 'Groups',
          dataIndex: 'totalGroups',
          width: 75,
          hidden: this.hideTotalGroupsCol,
          sortable: false,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + value +'</div>';
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

Ext.define('Ozone.components.admin.widget.DeleteWidgetsPanel', {
  extend: 'Ext.panel.Panel',
  alias: ['widget.deletewidgetspanel', 'widget.Ozone.components.admin.widget.DeleteWidgetsPanel'],

  mixins: {
    circularFocus: 'Ozone.components.focusable.CircularFocus'
  },

  delWidgets: null,
  itemId: 'deletepanel',
  cls: 'deletepanel',

  // private
  initComponent: function() {

    this.addEvents(['delete','cancel']);

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
          itemId: 'delTitlePanel',
          cls: 'delTitlePanel',
          layout: 'fit',
          border: false,
          height: 30,
          renderTpl: ['You have selected to delete {name}.'],
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
                  'Deleting these widgets will additionally delete the widgets listed below.']
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
          itemId: 'ok',
          handler: function(button) {
            this.del();
          },
          scope: this
        },
        {
          text: 'Cancel',
          itemId: 'cancel',
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
            if (this.delWidgets != null) {
            this.loadData(this.delWidgets);
            }
            var okBtn = this.down('#ok').getFocusEl(),
                cancelBtn = this.down('#cancel').getFocusEl();
            this.setupFocus(okBtn, cancelBtn);
            Ext.defer(function() {cancelBtn.focus();}, 400);
        },
        scope: this
      }
    });
  },

  loadData: function(delWidgets) {
    if (delWidgets != null) {
      this.store.loadData(delWidgets);

      var delTitlePanel = this.down('#delTitlePanel');
      var selectedWidgetCount = this.store.getCount();
      var renderData = {
        name: selectedWidgetCount > 1 ? ('<span class="heading-bold">'+selectedWidgetCount + '</span> widgets') : ('<span class="heading-bold">'+this.store.getAt(0).data.name+'</span>')
      };
      if (delTitlePanel.rendered) {
        delTitlePanel.renderTpl.overwrite(delTitlePanel.getTargetEl(), renderData);
      }
      else {
        delTitlePanel.renderData = renderData;
      }

      var requiredWidgets = [];
      var data = this.requiredWidgets;

      if (data) {
        for (var i = 0; i < data.length; i++) {
          if (-1 == this.store.find('guid', data[i].path)) {
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
      }

      var reqGrid = this.down('#reqGrid');
      var reqStore = reqGrid.getStore();
      if (reqStore) {
        reqStore.removeAll();
        if (requiredWidgets.length > 0) {
          reqStore.loadData(requiredWidgets);
        }
        this.doLayout();
      }
    }
  },

  del: function() {
    var delRecs = this.store.getRange();
    var reqGrid = this.down('#reqGrid');
    var reqStore = reqGrid.getStore();
    var reqRecs = reqStore.getRange();
    var allRecs = Ext.create('Ext.util.MixedCollection');
    for (var i = 0; i < delRecs.length; i++) {
      allRecs.add(delRecs[i].data.widgetGuid,delRecs[i].data.widgetGuid);
    }
    for (var i = 0; i < reqRecs.length; i++) {
      allRecs.add(reqRecs[i].data.widgetGuid,reqRecs[i].data.widgetGuid);
    }

    this.fireEvent('delete', {
      widgetGuidsToDelete: allRecs.getRange()
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

Ext.define('Ozone.components.admin.widget.WidgetManagementPanel', {
  extend: 'Ozone.components.admin.ManagementPanel',
  alias: ['widget.widgetmanagement', 'widget.widgetmanagementpanel', 'widget.Ozone.components.admin.widget.WidgetManagementPanel'],

  dragAndDrop: true,
  launchesWidgets: true,
  channel: 'AdminChannel',
  defaultTitle: 'Widgets',
  minButtonWidth: 80,
  cls: 'widgetmanagementpanel',
  detailsAutoOpen: true,

  initComponent: function() {

    var me = this;

    OWF.Preferences.getUserPreference({
      namespace: 'owf.admin.WidgetEditCopy',
      name: 'guid_to_launch',
      onSuccess: function(result) {
        me.guid_EditCopyWidget = result.value;
      },
      onFailure: function(err) { /* No op */
        me.showAlert('Preferences Error', 'Error looking up Widget Editor: ' + err);
      }
    });

    Ext.applyIf(this, {
      xtype: 'panel',
      itemId: 'main',
      layout: {
        type: 'border'
      },
      items: [
        {
          xtype: 'widgetsgrid',
          itemId: 'grid',
          border: false,
          region: 'center'

        },
        {
          xtype: 'widgetdetailpanel',
          itemId: 'widgetdetailpanel',
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
                            grid.applyFilter(value, ['displayName', 'universalName']);
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
              text: 'Create',
              itemId: 'create',
              handler: function(btn, evt) {
                evt.stopPropagation();
                this.doCreate();
              },
              scope: this
            },
            {
                xtype: 'splitbutton',
                text: 'Edit',
                itemId: 'editButton',
                handler: function() {
                    var grid = this.down('#grid');
                    var records = grid.getSelectionModel().getSelection();
                    if (records && records.length > 0) {
                        for (var i = 0; i < records.length; i++) {
                            this.doEdit(records[i].data.id, records[i].data.name);
                        }
                    }
                    else {
                        me.showAlert('Error', 'You must select at least one widget to edit.');
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
                                var records = me.down('#grid').getSelectionModel().getSelection();
                                if(records && records.length === 1) {
                                    me.doExport('widget', records[0]);
                                }
                                else if(records && records.length > 1) {
                                    me.showAlert('Error', 'You must select only one widget to export.');
                                }
                                else {
                                    me.showAlert('Error', 'You must select a widget to export.');
                                }
                            }
                        }
                    ]
                },
                scope: this
            },
            {
              xtype: 'button',
              text: 'Delete',
              itemId: 'deleteButton',
              handler: function() {
                var grid = this.down('#grid');
                var records = grid.getSelectionModel().getSelection();
                if (records && records.length > 0) {
                    this.createDeleteWindow(records);
                }
                else {
                    me.showAlert('Error', 'You must select at least one widget to delete.');
                }
              },
              scope: this
            }
          ]
        }
      ]
    });

    this.callParent();
        
    OWF.Eventing.subscribe('AdminChannel', owfdojo.hitch(this, function(sender, msg, channel) {
        if(msg.domain === 'Widget') {
            this.down('#grid').getBottomToolbar().doRefresh();
        }
    }));

    this.on({
      render: {
        fn: function() {

          //bind to grid after render
          var grid = this.down('#grid');
          if (grid != null) {

            grid.on({
              itemdblclick: {
                fn: function() {
                  var records = grid.getSelectionModel().getSelection();
                  if (records && records.length > 0) {
                    for (var i = 0; i < records.length; i++) {
                        this.doEdit(records[i].data.id, records[i].data.name);
                    }
                  }
                  else {
                    me.showAlert('Error', 'You must select at least one widget to edit.');
                  }
                },
                scope: this
              },
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

            grid.getView().on({
              itemkeydown: {
                  scope: this,
                  fn: function(view, record, dom, index, evt) {
                      switch(evt.getKey()) {
                          case evt.SPACE:
                          case evt.ENTER:
                              this.doEdit(record.data.id, record.data.name);
                      }
                  }
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

  createDeleteWindow: function(widgetsToDelete) {
    var me = this;
    var vpSize = Ext.getBody().getViewSize();

    var widgetsToDeleteIds = [];
    if (widgetsToDelete != null) {
      for (var i = 0; i < widgetsToDelete.length; i++) {
        widgetsToDeleteIds.push(widgetsToDelete[i].data.widgetGuid);
      }
    }

    OWF.Preferences.getDependentWidgets({
      content: {'ids': widgetsToDeleteIds},
      onSuccess: Ext.bind(function(ret) {
        var requiredWidgets = ret.data;

        if (requiredWidgets != null && requiredWidgets.length > 0) {
          var win = Ext.create('Ext.window.Window', {
            title: 'Warning',
            itemId: 'deletewidgetwindow',
            minWidth: 250,
            minHeight: 200,
            width: vpSize.width * .8,
            height: vpSize.height * .75,
            layout: 'fit',
            modal: true,
            items: [
              {
                xtype: 'deletewidgetspanel',
                itemId: 'deletewidgetspanel',
                delWidgets: widgetsToDelete,
                requiredWidgets: requiredWidgets,
                listeners: {
                  'delete': {
                    fn: function(data) {
                      if (data != null && data.widgetGuidsToDelete != null) {
                        //actually delete these widgets
                        OWF.Preferences.deleteWidgetDefs({
                          content: {'id': data.widgetGuidsToDelete, '_method': 'delete'},
                          onSuccess: Ext.bind(function(ret) {
                            var grid = this.down('#grid');

                            if (grid != null) {
                              grid.refresh();
                            }
                            win.close();
                          }, this),
                          onFailure: function() {
                            me.showAlert(Ozone.util.ErrorMessageString.saveUpdatedWidgets, Ozone.util.ErrorMessageString.saveUpdatedWidgetsMsg);
                          }
                        });
                      }
                    },
                    scope: this
                  },
                  cancel: {
                    fn: function() {
                      win.close();
                    },
                    scope: this
                  }
                }
              }
            ]
          });
          win.show();
        }
        else {
            var msg = 'This action will permanently delete ';
            if (widgetsToDelete.length == 1) {
                msg += '<span class="heading-bold">' + Ext.htmlEncode(widgetsToDelete[0].data.name) + '</span>.';
            }
            else {
                msg += 'the selected <span class="heading-bold">' + widgetsToDelete.length + ' widgets</span>.';
            }
            this.showConfirmation('Warning', msg, function(btn, text, opts) {
                if (btn == 'ok') {
                    var grid = me.down('#grid');
                    var store = grid.store;
                    var autoSave = store.autoSave;
                    store.autoSave = false;
                    store.remove(widgetsToDelete);
                    var remainingRecords = store.getTotalCount() - widgetsToDelete.length;
                    store.on({
                        write: {
                            fn: function(s, b, data) {
                                if(store.data.items.length == 0 && store.currentPage > 1) {
                                    var lastPage = store.getPageFromRecordIndex(remainingRecords - 1);
                                    var pageToLoad = (lastPage >= store.currentPage) ? store.currentPage : lastPage;
                                    store.loadPage(pageToLoad);
                                }
                                grid.getBottomToolbar().doRefresh();
                            },
                            scope: this,
                            single: true
                        }
                    });
                    store.save();
                }
            });
        }
      }, this),
      onFailure: function() {
          me.showAlert('Error', 'Error deleting the selected widget(s).');
      }
    });
  }
});

