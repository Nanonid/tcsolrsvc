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
/**
 * Uses the idProperty of the model to create ids
 */
Ext.define('Ozone.data.ModelIdGenerator', {
    extend: 'Ext.data.IdGenerator',
    alias: 'idgen.model',

    //overrideIdProperty: undefined,

    /**
     * @cfg {String} id
     * The id by which to register a new instance. This instance can be found using the
     * {@link Ext.data.IdGenerator#get} static method.
     */

    getRecId: function (rec) {
        var idField = this.overrideIdProperty || rec.idProperty;
        return rec.get(idField);
    },

    generate: function () {
        return null;
    }

});


Ext.define('Ozone.components.admin.form.UrlField', {
	 extend: 'Ext.form.field.Text',
	 alias: 'widget.urlfield',
	 
     urlRegex: /(^https):\/\/\S+/i,
     urlRegexText: Ozone.layout.DialogMessages.widgetDefinition_secureUrl_warningText,
	 hasActiveWarning: function() {
             var value = this.getValue();
		if (this.urlRegex && !this.urlRegex.test(value) && value != null && value != '')
			return true;
		else
			return false;
           },
	 getActiveWarning: function() {
	 	return this.hasActiveWarning() ? this.urlRegexText : '';
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
Ext.define('Ozone.data.Intent', {
	extend: 'Ext.data.Model',
    fields: [
        { name:'title', mapping:'action'},
        { name:'action'},
        { name:'dataType'},
        { name:'send'},
        { name:'receive'}]
});
Ext.define('Ozone.data.stores.IntentStore', {
  extend:'Ext.data.Store',
  model: 'Ozone.data.Intent',
  alias: 'store.intentstore',

  groupField: 'action',

  sorters: [
    {
        property : 'action',
        direction: 'ASC'
    },
    {
        property : 'dataType',
        direction: 'ASC'
    },
    {
        property : 'send',
        direction: 'ASC'
    },
    {
      property : 'receive',
      direction: 'ASC'
    }
  ],
  constructor: function(config) {

    this.callParent(arguments);
  }
});
Ext.define('Ozone.data.User',{
	extend:'Ext.data.Model',
	idProperty:'id',
	fields:[
	        {name:'id'},
	        {name:'username'},
	        {name:'userRealName'},
	        {name:'email'},
            {name:'totalGroups'},
	        {name:'totalWidgets'},
	        {name:'totalDashboards'},
            {name:'totalStacks'},
	        {name:'lastLogin'},
	        {name:'title', mapping:'userRealName'}
	]
});
Ext.define('Ozone.data.UserStore',{
	extend:'Ozone.data.OWFStore',
	model: 'Ozone.data.User',
	alias: 'store.userstore',

	/*proxy: {
		type: 'ajax',
		api: Ozone.util.contextPath() + '/user', 

        //the components which use this store do not support paging yet, so these must be explicitly set to undefined
        //to disable paging params from being passed to the server
        limitParam: undefined,
        pageParam: undefined,
        startParam: undefined,

		reader: {
			type: 'json',
			root: 'rows'
		}
	},
	autoLoad:true,
    totalProperty:'results',
    */
    sorters: [
      {
        property : 'userRealName',
        direction: 'ASC'
      }
    ],


    constructor:function(config)
    {
    	config = config ? config : {};
    	
    	Ext.applyIf(config, {
    		api:{
    			read:"/user",
    			create:"/user",
    			update:"/user",
    			destroy:"/user"
    		},
    		fields:['id','username','userRealName','email','totalWidgets','totalGroups','totalDashboards','lastLogin'],
    		autoDestroy:true
    	});
    	
    	Ozone.data.UserStore.superclass.constructor.call(this,config);
    }
});
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
Ext.define('Ozone.data.WidgetType', {
	extend: 'Ext.data.Model',
	fields: [
		'id',
		'name'
	]
});
Ext.define('Ozone.data.WidgetTypeStore', {
	extend: 'Ext.data.Store',
	model: 'Ozone.data.WidgetType',
	proxy: {
		type: 'ajax',
		url: Ozone.util.contextPath() + '/widgettype/list', 

        //the components which use this store do not support paging yet, so these must be explicitly set to undefined
        //to disable paging params from being passed to the server
        limitParam: undefined,
        pageParam: undefined,
        startParam: undefined,

		reader: {
			type: 'json',
			root: 'data'
		}
	},
	totalProperty: 'results'
});
Ext.define('Ozone.components.admin.EditIntentWindow', {
    extend: 'Ext.window.Window',
    alias: [
        'widget.editintentwindow',
        'widget.Ozone.components.admin.EditIntentWindow'
    ],

    mixins: {
      widget: 'Ozone.components.focusable.CircularFocus'
    },

    cls: 'editintentwindow',
    
    callback: Ext.emptyFn,
    scope: undefined,

    action: undefined,
    dataType: undefined,
    send: undefined,
    receive: undefined,
    
    resizable: false,
    modal: true,
            
    initComponent: function() {
        
        var me = this;
        var message = Ozone.config.freeTextEntryWarningMessage;
        
        if (!this.scope)
            this.scope = this;
            
        Ext.apply(this, {
            layout: 'fit',
            items: [{
                xtype: 'panel',
                cls: 'usereditpanel',
                layout: 'fit',
                items: [{
                    xtype: 'panel',
                    cls: 'adminEditor',
                    bodyCls: 'adminEditor-body',
                    layout: 'fit',
                    border: false,
                    
                    items: [{
                        xtype: 'form',
                        itemId: 'form',
                        layout: 'anchor',
                        bodyCls: 'properties-body',
                        border: false,
                        bodyBorder: true,
                        preventHeader: true,
                        padding: 5,
                        autoScroll: true,
                        
                        defaults: {
                            anchor: '100%',
                            msgTarget: 'side',
                            labelSeparator: '',
                            margin: '5 5 0 5',
                            listeners: {
                                blur: {
                                    fn: function(field) {
                                        field.changed = true;
                                        field.doComponentLayout();
                                    },
                                    scope: me
                                },
                                change: {
                                    fn: function(field, newValue, oldValue, eOpts) {
                                        if(!field.changed && field.isDirty()) field.changed = true;
                                    },
                                    scope: me
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
                                                    var errorEl = owner.errorEl;
                                    
                                                    if (owner.hasActiveError() && owner.changed) {
                                                        errorEl.removeCls('owf-form-valid-field');
                                                        errorEl.removeCls('x-form-warning-icon');
                                                        errorEl.removeCls('owf-form-unchanged-field');
                                                        errorEl.addCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                                                        layout.tip = layout.tip ? layout.tip : Ext.create('Ext.tip.QuickTip', {
                                                            baseCls: Ext.baseCSSPrefix + 'form-invalid-tip',
                                                            renderTo: Ext.getBody()
                                                        });
                                                        layout.tip.tagConfig = Ext.apply({}, {
                                                            attribute: 'errorqtip'
                                                        }, layout.tip.tagConfig);
                                                        errorEl.dom.setAttribute('data-errorqtip', owner.getActiveError() || '');
                                                        errorEl.setDisplayed(owner.hasActiveError());
                                                    }
                                                    else if (owner.hasActiveWarning && owner.hasActiveWarning() && owner.changed) {
                                                        errorEl.removeCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                                                        errorEl.removeCls('owf-form-valid-field');
                                                        errorEl.removeCls('owf-form-unchanged-field');
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
                                                    else if (owner.changed) {
                                                        if (layout.tip) 
                                                            layout.tip.unregister(errorEl);
                                                        errorEl.removeCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                                                        errorEl.removeCls('x-form-warning-icon');
                                                        errorEl.removeCls('owf-form-unchanged-field');
                                                        errorEl.addCls('owf-form-valid-field');
                                                        errorEl.dom.setAttribute('data-errorqtip', '');
                                                        errorEl.setDisplayed(true);
                                                    }
                                                    else {
                                                        errorEl.removeCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                                                        errorEl.removeCls('x-form-warning-icon');
                                                        errorEl.removeCls('owf-form-valid-field');
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
                                        }
                                    },
                                    scope: me
                                }
                            }
                        },
                        items: [{
                            xtype: 'component',
                            hidden: message == null || message == '',
                            renderTpl: '<div id="{id}" class="{cls}"><div class="headerSpacer"></div>{message}</div>',
                            renderData: {
                                cls: (message && message.length > 0) ? 'dialogHeader' : '',
                                message: message ? message : ''
                            }
                        }, {
                            xtype: 'textfield',
                            name: 'action',
                            itemId: 'nameField',
                            value: me.action,
                            fieldLabel: Ozone.util.createRequiredLabel('Action'),
                            labelWidth: 130,
                            allowBlank: false,
                            maxLength: 255
                        }, {
                            xtype: 'textfield',
                            name: 'dataType',
                            itemId: 'dataTypeField',
                            value: me.dataType,
                            fieldLabel: Ozone.util.createRequiredLabel('Data Type'),
                            labelWidth: 130,
                            allowBlank: false,
                            maxLength: 255
                        }, {
                            xtype: 'checkbox',
                            name: 'send',
                            itemId: 'sendChk',
                            fieldLabel: 'Send',
                            labelWidth: 130,
                            submitValue: true,
                            preventMark: true,
                            checked: (me.send != undefined) ? me.send : true
                        },{
                            xtype: 'checkbox',
                            name: 'receive',
                            itemId: 'receiveChk',
                            fieldLabel: 'Receive',
                            labelWidth: 130,
                            submitValue: true,
                            preventMark: true,
                            checked: me.receive
                        }]
                    }],
                    buttons: [{
                        text: 'OK',
                        itemId: 'ok',
                        handler: function(button, e) {
                            //Show validation on fields
                            var textfields = this.query('textfield');
                            for (var i = 0; i < textfields.length; i++) {
                                var field = textfields[i];
                                if (!Ext.isFunction(field)) {
                                    field.isValid();
                                    field.changed = true;
                                    field.doComponentLayout();
                                    if (field.getXType() == 'textfield') {
                                        field.setValue(Ext.String.trim(field.getValue()));
                                    }
                                }
                            }
                            var p = button.ownerCt.ownerCt;
                            this.submitValues = p.getComponent('form').getValues();
                            var fields = p.getComponent('form').getForm().getFields().items;
                            
                            var blankField = false;
                            for(field in fields) {
                                if(fields[field].name) this.submitValues['original' + fields[field].name.charAt(0).toUpperCase() + fields[field].name.slice(1)] = fields[field].originalValue;
                                if(fields[field].xtype == 'textfield' && fields[field].getValue() == '') blankField = true;
                            }
                            if(!blankField) {
                                this.callback.call(this.scope, this.submitValues);
                                this.close();
                            }
                        },
                        scope: this
                    }, {
                        text: 'Cancel',
                        itemId: 'cancel',
                        handler: function(button, e) {
                            this.close();
                        },
                        scope: this
                    }]
                }]
        
            }]
        })
        
        this.callParent(arguments);

        var sendChk = this.down('#sendChk'),
            receiveChk = this.down('#receiveChk');

        //Ensure that at least one of the send and receive checkboxes are always checked
        sendChk.on('change', function() {
            //Stop events temporarily so change doesn't fire other listener
            receiveChk.suspendEvents(false);
            receiveChk.setValue(true);
            receiveChk.resumeEvents();
        });
        receiveChk.on('change', function() {
            //Stop events temporarily so change doesn't fire again
            sendChk.suspendEvents(false);
            sendChk.setValue(true);
            sendChk.resumeEvents();
        });

        this.on('afterrender', function() {
            this.setupFocus(this.down('#nameField').getFocusEl(), this.down('#cancel').getFocusEl());
        });
    }
});

Ext.define('Ozone.components.admin.IntentsGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.intentsgrid'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),

  cls: 'grid-intent',
  
  forceFit: true,
  baseParams: null,

  initComponent: function() {

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'intentstore'
      });
    }
    
    if (this.baseParams) { this.setBaseParams(this.baseParams); }

    var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
        groupHeaderTpl: '{name:htmlEncode}',
        enableNoGroups: false,
        enableGroupingMenu: false
    });

    Ext.apply(this, {
      features: [groupingFeature],
      columnLines: true,
      columns: [
        {
          itemId: 'dataType',
          header: 'Intent',
          dataIndex: 'dataType',
          flex: 1,
          minWidth: 200,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="intent-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'send',
          header: 'Send',
          dataIndex: 'send',
          width: 140,
          sortable: true,
          align: 'center',
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
    		  var icon = '&nbsp;';
        	  if (value == true) {
        		  icon = '<img src="../themes/common/images/icons/ball.png" />';
        	  }
        	  return icon;
          }
        },
        {
            itemId: 'receive',
            header: 'Receive',
            dataIndex: 'receive',
            width: 140,
            sortable: true,
            align: 'center',
            renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
      		  var icon = '&nbsp;';
          	  if (value == true) {
        		  icon = '<img src="../themes/common/images/icons/ball.png" />';
          	  }
        	  return icon;
            }
        }
      ]
    });
    
    this.callParent(arguments);
  },

  refresh: function() {
    this.store.loadPage(this.store.currentPage);
  },

  getTopToolbar: function() {
    return this.getDockedItems('toolbar[dock="top"]')[0];
  },

  applyFilter: function(filterText) {
      this.clearFilters();
      if (filterText) {
        filterText = filterText.toLowerCase();
        this.store.filter({
            filterFn: function(item) {
                if(item.get('action').toLowerCase().indexOf(filterText) !== -1) {
                    return true;
                }
                if(item.get('dataType').toLowerCase().indexOf(filterText) !== -1) {
                    return true;
                }
                return false;
            }
        });
      }
  },

  clearFilters: function() {
	  this.store.clearFilter();
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

Ext.define('Ozone.components.UsersGrid', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.usersgrid', 'widget.Ozone.components.UsersGrid'],
    plugins: new Ozone.components.focusable.FocusableGridPanel(),
    store: null,
    baseParams: {},
    quickSearchFields: ['userRealName', 'username', 'email'],
    showHeaderBar: true,

    viewConfig: {
        forceFit: true
    },
    defaultPageSize: 50,
    initComponent: function(){
        if (this.store == null) {
            this.store = Ext.StoreMgr.lookup({
                type: 'userstore',
                pageSize: this.defaultPageSize
            });
        }
        
        if (this.baseParams) {
            this.setBaseParams(this.baseParams);
        }
        
        this.columns = [{
            itemId: 'id',
            header: 'ID',
            dataIndex: 'id',
            sortable: true,
            hidden: true
          },
          {
			header: 'User Name',
			dataIndex: 'username',
			flex: 2,
            sortable: true,
            editable: false,
			hidden: true,
            renderer: function(v) {
                return v ? Ext.htmlEncode(v) : "";
            }
		}, {
            header: 'Full Name',
            dataIndex: 'userRealName',
            flex: 2,
            sortable: true,
            editable: false,
            renderer: function(v) {
                return v ? Ext.htmlEncode(v) : "";
            }
        }, {
            header: 'Last Sign In',
            dataIndex: 'lastLogin',
            flex: 2,
            sortable: true,
            editable: false,
            renderer: function(v){
                return v ? Ext.Date.format(new Date(v), "m-d-Y H:i") : "";
            }
        }, {
            header: 'Groups',
            dataIndex: 'totalGroups',
            flex: 1,
            sortable: false,
            editable: false
        }, {
            header: 'Widgets',
            dataIndex: 'totalWidgets',
            flex: 1,
            sortable: false,
            editable: false
        }, {
            header: 'Dashboards',
            dataIndex: 'totalDashboards',
            flex: 1,
            sortable: false,
            editable: false
        }, {
            header: 'Stacks',
            dataIndex: 'totalStacks',
            flex: 1,
            sortable: false,
            editable: false
        }];
        
        Ext.apply(this, {
            multiSelect: true,
            dockedItems: [Ext.create('Ext.toolbar.Paging', {
                itemId: 'bottomBar',
                dock: 'bottom',
                store: this.store,
                pageSize: this.pageSize,
                displayInfo: true,
                hidden: this.hidePagingToolbar
            })],
            columnLines: true
        });
        
        this.relayEvents(this.store, ['datachanged']);
        this.callParent(arguments);
    },
    setBaseParams: function(params){
        this.baseParams = params;
        if (this.store.proxy.extraParams) {
            Ext.apply(this.store.proxy.extraParams, params);
        }
        else {
            this.store.proxy.extraParams = params;
        }
    },
    applyFilter: function(filterText, fields){
    
        this.store.proxy.extraParams = {};
        Ext.apply(this.store.proxy.extraParams, this.baseParams);
        
        if (!Ext.isEmpty(filterText)) {
            var filters = [];
            for (var i = 0; i < fields.length; i++) {
                filters.push({
                    filterField: fields[i],
                    filterValue: filterText
                });
            }
            Ext.apply(this.store.proxy.extraParams, {
                filters: Ext.JSON.encode(filters),
                filterOperator: 'OR'
            });
        }
        
        if (this.baseParams) { this.setBaseParams(this.baseParams); }
        
        this.store.loadPage(1,{
            params: {
                offset: 0,
                max: this.store.pageSize
            }
        });
        
    	//this.store.filter(fields[0],filterText);
    },
    clearFilters: function(){
        this.store.proxy.extraParams = undefined;
        if (this.baseParams) { this.setBaseParams(this.baseParams); }
        this.store.load({
            params: {
                start: 0,
                max: this.store.pageSize
            }
        });
        
    	//this.store.clearFilter();
    },
    load: function(){
        this.store.loadPage(1);
    },
    refresh: function(){
        this.store.loadPage(this.store.currentPage);
    },
    setStore: function(store, cols){
        this.reconfigure(store, cols);
        var pgtb = this.getBottomToolbar();
        if (pgtb) {
            pgtb.bindStore(store);
        }
    },
    getTopToolbar: function(){
        return this.getDockedItems('toolbar[dock="top"]')[0];
    },
    getBottomToolbar: function(){
        return this.getDockedItems('toolbar[dock="bottom"]')[0];
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

Ext.define('Ozone.components.admin.IntentsTabPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.intentstabpanel'],
    
    initComponent: function() {
        
        Ext.apply(this, {

            layout:'fit',
            itemId: 'intents-tab',
            cls: 'widgeteditintentstab',
            iconCls: 'intents-tab',
            title: 'Intents',
            editor: 'Widget',
            componentId: 'intent_id',
            preventHeader: true,
            border: true,
            padding: 5,
    
            items: [{
                xtype: 'intentsgrid',
                itemId: 'intentsGrid',
                preventHeader: true,
                border: false
            }],

            dockedItems: [{
                xtype: 'toolbar',
                itemId: 'tbIntentsGridHdr',
                cls: 'tbIntentsGridHdr',
                dock: 'top',
                items: [{
                    xtype: 'tbtext',
                    itemId: 'lblIntentsGrid',
                    cls: 'tbIntentsGridHdr',
                    text: 'Intents'
                },
                '->',
                {
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('intentsGrid');
                                if (grid != null) {
                                    if (!value)
                                        grid.clearFilters();
                                    else
                                        grid.applyFilter(value);
                                }
                            },
                            scope: this
                        }
                    }
                }]
            },
            {
                xtype: 'toolbar',
                itemId: 'tbDashboardsGridFtr',
                dock: 'bottom',
                ui: 'footer',
                defaults: {
                    minWidth: 80
                },
                items: [{
                    xtype: 'button',
                    text: 'Create',
                    itemId: 'btnCreate',
                    handler: this.onCreateOrEdit,
                    disabled: true,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: 'Edit',
                    itemId: 'btnEdit',
                    handler: this.onCreateOrEdit,
                    disabled: true,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: 'Delete',
                    itemId: 'btnDelete',
                    handler: this.onDelete,
                    disabled: true,
                    scope: this
                }]
            }]
        });
        
        this.callParent(arguments);
        
        this.on({
            activate: {
                scope: this,
                fn: function(cmp, opts) {
                    var comp = cmp.ownerCt;
                    
                    // Set the title
                    if (comp.record.data) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('title'), 25)) || 'Intents';
                        var title = cmp.getDockedItems('toolbar[dock="top"]')[0].getComponent('lblIntentsGrid');
                        title.setText(titleText);
                    }
                },
                single: true
            }
        });
        
        this.on({
            activate: {
                fn: function(cmp) {
                    var grid = cmp.getComponent('intentsGrid');
                    if (grid) {
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var editBtn = this.down('#btnEdit');
                                    if(!editBtn.isDisabled()) {
                                        var selectedIntent = this.getComponent('intentsGrid').getSelectionModel().getSelection()[0];
                                        this.onCreateOrEdit(editBtn);
                                    }
                                },
                                scope: this
                            }
                        });
                    }
                },
                single: true
            },
        	afterrender: {
        		fn: function(cmp) {
        	        this.ownerCt.on({
        	        	recordupdated: {
        	             fn: function(record) {
        	               var grid = this.getComponent('intentsGrid');
        	               var store = grid.getStore();
        	               var intents = record ? record.intents : null;
        	               
        	               var storeData = [];
        	            	 
        	               // Format intents for store
        	               if (intents) {
        	            	   // Add send intents
        	        		   for (var i = 0; intents.send && i < intents.send.length; i++) {
        	        			   var intent = intents.send[i];
        	        			   var action = intent.action;
        	        			   
        	        			   for (var j = 0; intent.dataTypes && j < intent.dataTypes.length; j++) {
        	        				   storeData.push({
        	        					   action: action,
        	        					   dataType: intent.dataTypes[j],
        	        					   send: true,
        	        					   receive: false	// default value; will be overridden if widget receives the same intent
        	        				   });
        	        			   }
        	        		   }
        	        		   
        	            	   // Add receive intents
        	        		   for (var i = 0; intents.receive && i < intents.receive.length; i++) {
        	        			   var intent = intents.receive[i];
        	        			   var action = intent.action;
        	        			   
        	        			   for (var j = 0; intent.dataTypes && j < intent.dataTypes.length; j++) {
        	        				   var intentFound = false;
        	        				   
        	        				   for (var k = 0; k < storeData.length; k++) {
        	        					   if (storeData[k].action == action && storeData[k].dataType == intent.dataTypes[j]) {
        	                				   storeData[k].receive = true;
        	                				   intentFound = true;
        	        					   }
        	        				   }
        	        				   
        	        				   if (!intentFound) {
        		        				   storeData.push({
        		        					   action: action,
        		        					   dataType: intent.dataTypes[j],
        		        					   send: false,
        		        					   receive: true
        		        				   });
        	        				   }
        	        			   }
        	        		   }
        	               }
        	               
        	               // Update grid data
        	               if (store) {
        	                   store.loadData(storeData);
        	                   
        	                   //allow headers to be focused
        	             	   var groupHeaders = grid.getEl().query('.x-grid-group-hd');
        	             	   if (groupHeaders) {
        	             		   for (var i = 0; i < groupHeaders.length; i++) {
        	                           var el = new Ext.Element(groupHeaders[i]);
        	                           var selectedEl = el.down('.x-grid-cell-inner');
        	                           if (selectedEl) {
        	                        	   Ozone.components.focusable.Focusable.setupFocus(selectedEl, this);

        	                        	   new Ext.util.KeyMap(selectedEl, {
        	                                   key: [Ext.EventObject.ENTER, Ext.EventObject.SPACE],
        	                                   fn: function (key, evt) {
        	                                       // required for IE, focus goes back to active widget for some reason
        	                                       evt.preventDefault();
        	                                       evt.stopPropagation();

        	                                       var group = grid.features[0];
        	                                       group.onGroupClick(grid.getView(), this);
        	                                   },
        	                                   scope: el.dom
        	                               });
        	                        	   
        	                               new Ext.util.KeyMap(selectedEl, {
        	                                   key: [Ext.EventObject.UP, Ext.EventObject.DOWN],
        	                                   fn: function (key, evt) {
        	                                       // required for IE, focus goes back to active widget for some reason
        	                                       evt.preventDefault();
        	                                       evt.stopPropagation();

        	                                       var node = (key == Ext.EventObject.UP) ? this.previousSibling : this.nextSibling;
        		                           	       if (node) {
        		                           	    	   // Select last row of previous section
        		                           	    	   var siblingEl = Ext.fly(node);
        		                           	    	   var rows = siblingEl.select('.x-grid-row');
        		                           	    	   if (rows) {
        		                           	    		   var view = grid.getView();
        		                           	    		   var record = view.getRecord(rows.elements[0]);
        		                           	    		   view.focus();
        		                           	    		   view.focusRow(record);
        		                           	    		   view.select(record.index);
        		                           	    		   view.addCls('x-grid-view-focus');
        		                           	    	   }
        		                           	       }
        	                                   },
        	                                   scope: el.dom
        	                               });
        	                           }
        	             		   }
        	             	  }
        	               }
        	             },
        	             scope: this
        	           }
        	        });
        		},
        		scope: this
        	}
        });
    },

    onCreateOrEdit: function(btn, evt) {
        var me = this;

        var isEdit = false,
            selectedIntent = null;

        if(btn == me.down('#btnEdit')) {
            isEdit = true;
            //Get the intent to edit
            selectedIntent = this.getComponent('intentsGrid').getSelectionModel().getSelection()[0];
        }

        if(!isEdit || (isEdit && selectedIntent)) {
            evt && evt.stopPropagation();
            Ext.create('Ozone.components.admin.EditIntentWindow', {
                title: 'Create Intent',
                action: isEdit ? selectedIntent.get('action') : null,
                dataType: isEdit ? selectedIntent.get('dataType') : null,
                send: isEdit ? selectedIntent.get('send') : null,
                receive: isEdit ? selectedIntent.get('receive') : null,
                width: Math.round(Ext.getBody().getViewSize().width * .9),
                height: 260,
                scope: this,
                callback: function(values) {
                    if (values != undefined) {
                        var intent = {action: values.action, dataTypes: [values.dataType]},
                            widget = me.ownerCt,
                            record = widget.store.getById(widget.recordId),
                            intents = record.get('intents');

                        //If edit, remove the old intent first
                        if(isEdit) {
                            var oldIntent = {action: selectedIntent.get('action'), dataTypes: [selectedIntent.get('dataType')]};
                            me.removeIntentFromArray(oldIntent, intents.send);
                            me.removeIntentFromArray(oldIntent, intents.receive);
                        }

                        //If the new intent already exists remove it
                        me.removeIntentFromArray(intent, intents.send);
                        me.removeIntentFromArray(intent, intents.receive);

                        //If action exists still, use the same case as it
                        var getExistingAction = function(action, intentArray) {
                            if(intentArray) {
                                for(var i = 0; i < intentArray.length; i++) {
                                    if(intentArray[i].action.toLowerCase() === intent.action.toLowerCase()) {
                                        return intentArray[i].action;
                                    }
                                }
                            }
                            return action;
                        }
                        intent.action = getExistingAction(getExistingAction(intent.action, intents.send), intents.receive);

                        //Add the new intent
                        if(values.send) {
                            !intents.send && (intents.send = [])
                            intents.send.push(intent);
                        }
                        if(values.receive) {
                            !intents.receive && (intents.receive = [])
                            intents.receive.push(intent);
                        }

                        //Edit and save the widget definition record with the new intent
                        record.beginEdit();
                        record.set('intents', intents);
                        record.setDirty();
                        record.endEdit();

                        widget.store.save();

                        //Refresh the intents grid
                        widget.fireEvent('recordupdated', {intents: intents});
                        
                        //Update the intents field of the properties tab
                        widget.down('#widgeteditproperties').getComponent('intents').setValue(Ext.JSON.encode(intents));
                    }
                }
            }).show();
        }
        else {
            me.editPanel.showAlert("Error", "You must select an intent to edit.");
        }
    },

    onDelete: function(btn, evt) {
        var me = this,
            selectedIntent = this.getComponent('intentsGrid').getSelectionModel().getSelection()[0];

        if(selectedIntent) {
            me.editPanel.showConfirmation('Delete Intent', 
                'This action will permanently delete intent <b>' + Ext.htmlEncode(selectedIntent.get('action')) 
                + '</b> with data type <b>' + Ext.htmlEncode(selectedIntent.get('dataType')) + '</b> from this widget.', 
                function(btn, text, opts) {
                    if (btn == 'ok') {
                        var intent = {action: selectedIntent.get('action'), dataTypes: [selectedIntent.get('dataType')]},
                            widget = me.ownerCt,
                            record = widget.store.getById(widget.recordId),
                            intents = record.get('intents');

                        me.removeIntentFromArray(intent, intents.send);
                        me.removeIntentFromArray(intent, intents.receive);

                        //Edit and save the widget definition record with the intent removed
                        record.beginEdit();
                        record.set('intents', intents);
                        record.setDirty();
                        record.endEdit();

                        widget.store.save();

                        //Refresh the intents grid
                        widget.fireEvent('recordupdated', {intents: intents});
                        
                        //Update the intents field of the properties tab
                        widget.down('#widgeteditproperties').getComponent('intents').setValue(Ext.JSON.encode(intents));
                    }
                });
        }
        else {
            me.editPanel.showAlert("Error", "You must select an intent to delete.");
        }
    },

    //Looks through an array of intents for the given intent and data type and removes it (case-insensitive)
    removeIntentFromArray: function(intent, intentArray) {
        if(intentArray) {
            for(var i = 0; i < intentArray.length; i++) {
                if(intentArray[i].action.toLowerCase() === intent.action.toLowerCase()) {
                    if(intentArray[i].dataTypes) {
                        for(var j = 0; j < intentArray[i].dataTypes.length; j++) {
                            //If dataType found, remove it from the list of dataTypes
                            if(intentArray[i].dataTypes[j].toLowerCase() == intent.dataTypes[0].toLowerCase()) {
                                Ext.Array.remove(intentArray[i].dataTypes, intentArray[i].dataTypes[j]);
                                //If dataType removed makes the dataTypes empty, remove the intent
                                if(intentArray[i].dataTypes.length == 0) {
                                    Ext.Array.remove(intentArray, intentArray[i]);
                                }
                                break;
                            }
                        }
                    }
                }
            }
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

Ext.define('Ozone.components.admin.UsersTabPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.userstabpanel'],
    layout: {
        type: 'fit'
    },
    preventHeader: true,
    border: true,
    padding: 5,
    initDisabled: true,

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function() {
        var me = this;

        Ext.apply(this,{
          dockedItems: [{
            xtype: 'toolbar',
            itemId: 'usersHeader',
            cls: 'tbUsersGridHdr',
            dock: 'top',
            items: [{
                xtype: 'tbtext',
                itemId: 'usersHeaderLabel',
                cls: 'tbUsersGridHdr',
                text:'Users'
            },
            '->',
            {
                xtype: 'searchbox',
                listeners: {
                    searchChanged: {
                        fn: function(cmp, value) {
                            var grid = this.getComponent('usersgrid');
                            if (grid != null) {
                                grid.applyFilter(value, grid.quickSearchFields);
                            }
                        },
                        scope: this
                    }
                }
            }]
        }, {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            itemId: 'usersFooter',
            defaults: {
                minWidth: 80
            },
            items: [{
                xtype: 'button',
                text: 'Add',
                itemId: 'add',
                handler: function() {
                  this.onAddClicked();
                },
                scope: this
            }, {
                xtype: 'button',
                text: 'Remove',
                itemId: 'remove',
                handler: function() {
                  var grid = this.getComponent("usersgrid");
                  var store = grid.getStore();
                  var records = grid.getSelectionModel().getSelection();
                  if (records && records.length > 0) {
                      store.remove(records);
                      store.save();
                  }
                  else {
                    me.editPanel.showAlert("Error", "You must select at least one user to remove.");
                  }
                },
                scope: this
            }]
        }],
          items: [{
              xtype: 'usersgrid',
              itemId: 'usersgrid',
              preventHeader: true,
              border: false
          }]
        });

        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();
        
        this.on({
            activate: {
                scope: this,
                fn: function(cmp, opts) {
                    var grid = cmp.getComponent('usersgrid');
                    var comp = cmp.ownerCt;
                    var compId = -1;
                    
                    // Enable/Disable Add and Remove buttons based on whether or not tab
                    // is editable.
                    var usersFooterToolbar = cmp.getDockedComponent('usersFooter');
                    var addBtn = usersFooterToolbar.getComponent('add');
                    var removeBtn = usersFooterToolbar.getComponent('remove');
                    var record = comp.store.getAt(comp.store.findExact('id', comp.recordId));
                    if (record.data.automatic) {
                        addBtn.setDisabled(true);
                        removeBtn.setDisabled(true);
                    }
                    
                    OWF.Preferences.getUserPreference({
                        namespace: 'owf.admin.UserEditCopy',
                        name: 'guid_to_launch',
                        onSuccess: function(result) {
                            cmp.guid_EditCopyWidget = result.value;
                        },
                        onFailure: function(err) { /* No op */
                            me.editPanel.showAlert('Preferences Error', 'Error looking up User Editor: ' + err);
                        }
                    });
                    
                    // Create modified widget store and bind to grid
                    grid.setStore(Ext.create('Ozone.data.UserStore', cmp.storeCfg));
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

                    if (grid && comp) {
                        if (Ext.isNumeric(comp.recordId)) {
                            comp.record = comp.recordId > -1 ? comp.store.getAt(comp.store.findExact('id', comp.recordId)) : undefined;
                            compId = comp.recordId > -1 ? comp.recordId: -1;
                        } else {
                            comp.record = comp.recordId ? comp.store.getAt(comp.store.findExact('id', comp.recordId)) : undefined;
                            compId = comp.recordId ? comp.recordId: -1;
                        }
                        var p = {
                            tab: 'users'
                        };
                        p[cmp.componentId] = compId;
                        grid.setBaseParams(p);
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var records = grid.getSelectionModel().getSelection();
                                    if (records && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            cmp.doEdit(records[i].data.id,records[i].data.userRealName);
                                        }
                                    }
                                    else {
                                        me.editPanel.showAlert("Error", "You must select at least one user to edit.");
                                    }
                                },
                                scope: this
                            }
                        });
                    }
                    
                    // Set the title
                    if (comp.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('title'), 25));
                        if(!titleText) {
                            titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('name'), 25)) || 'Users';
                        }
                        var title = cmp.getDockedItems('toolbar[dock="top"]')[0].getComponent('usersHeaderLabel');
                        title.setText(titleText);
                    }
                },
                single: true
            }
        });

        //reload store everytime the tab is activated
        this.on({
           activate: {
             fn: function() {
               var grid = this.getComponent('usersgrid');
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

        this.callParent(arguments);
    },
    refreshWidgetLaunchMenu: function() {
        if (this.widgetStateHandler) {
            this.widgetStateHandler.handleWidgetRequest({
                fn: 'refreshWidgetLaunchMenu'
            });
        }
    },
    onAddClicked: function(button, e) {
        var itemName = this.ownerCt.record.get('title');
        if(!itemName){
            itemName = this.ownerCt.record.get('name');
        }
        var win = Ext.widget('admineditoraddwindow', {
            addType: 'User',
            itemName: itemName,
            editor: this.editor,
            focusOnClose: this.down(),
            existingItemsStore: this.getComponent('usersgrid').getStore(),
            grid: Ext.widget('usersgrid', {
                itemId: 'usersaddgrid',
                border: false,
                enableColumnHide: false,
                sortableColumns: false
            })
        });
        win.show();
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
                this.editPanel.showAlert('Launch Error', 'User Editor Launch Failed: ' + response.message);
            }
        });
    }
});

Ext.define('Ozone.components.admin.widget.WidgetEditGroupsTab', {
	extend: 'Ozone.components.admin.GroupsTabPanel',
	alias: ['widget.widgeteditgroups',
	        'widget.widgeteditgroupstab',
	        'widget.Ozone.components.admin.widget.WidgetEditGroupsTab'],
	        
	cls: 'widgeteditgroupstab',
	
	initComponent: function() {
		var self = this;
		Ext.applyIf(this, {
			layout: 'fit',
			itemId: 'tabGroups',
			iconCls: 'groups-tab',
                        editor: 'Widget',
			componentId: 'widget_id',
			title: 'Groups',
			padding: 5,
			widgetRecord: null,
			storeCfg: {
				api: {
					read: '/group',
                    create: '/widget',
                    update: '/group',
                    destroy: '/widget'
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
		this.callParent();
	},
	initBaseParams: function(record) {
		this.baseParams = {
				widget_id:record.data.id
		};
		this.applyFilter();
	}
});

Ext.define('Ozone.components.admin.widget.WidgetEditUsersTab', {
    extend: 'Ozone.components.admin.UsersTabPanel',
    alias: [
        'widget.widgeteditusers',
        'widget.widgetedituserstab',
        'widget.Ozone.components.admin.widget.WidgetEditUsersTab'
    ],
    cls: 'widgetedituserstab',
    preventHeader: true,

    initComponent: function () {
		
        var self = this;
        Ext.applyIf(this,{
            layout:'fit',
            itemId: 'users-tab',
            iconCls: 'users-tab',
            title: 'Users',
            editor: 'Widget',
            componentId: 'widget_id',
            storeCfg: {
                api: {
                    read: '/user',
                    create: '/widget',
                    update: '/user',
                    destroy: '/widget'
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
                }
            }
        });
        this.callParent(arguments);
    }
});
Ext.define('Ozone.components.admin.widget.WidgetEditPropertiesTab', {
    extend: 'Ozone.components.PropertiesPanel',
    alias: [
        'widget.widgeteditproperties',
        'widget.widgeteditpropertiestab',
        'widget.Ozone.components.admin.widget.WidgetEditPropertiesTab'
    ],
    widgetTypeStore: null,
    cls: 'widgeteditpropertiestab',
    record: null,
    xhr: null,

    initComponent: function() {
        var me = this;
        var newGuid = guid.util.guid();
        this.widgetTypeStore = Ext.create('Ozone.data.WidgetTypeStore');
        
      Ext.applyIf(this, {
        layout:'fit',
        title: 'Properties',
        iconCls: 'properties-tab',
        defaults: {
          labelWidth: 150
        },
        items: [
          {
          	  xtype: 'component',
          	  itemId: 'descriptorUrlInfo',
          	  name: 'descriptorUrlInfo',
          	  cls: 'descriptorUrlInfo',
              renderTpl: '<div class="descriptorUrlHeader">' +
              				'<div class="descriptorUrlTitle">{descriptorUrlTitle}</div><button class="descriptorUrlInfoIcon" ></button>' + 
              			 '</div>',
              renderData: {
        		  descriptorUrlTitle: 'Import Widget from Descriptor URL'
        	  },
              renderSelectors: {
                  iconEl: '.descriptorUrlInfoIcon',
                  titleEl: '.descriptorUrlTitle'
              },
              listeners: {
            	  afterrender: function(cmp){
                      // After rendering the component will have an iconEl property
                      cmp.iconEl.on('click', function() {
                    	  var descriptorUrlInfoMsg = cmp.ownerCt.getComponent('descriptorUrlInfoMsg');
                    	  if (descriptorUrlInfoMsg.isVisible()) {
                    		  descriptorUrlInfoMsg.hide();
                    	  } else {
                    		  descriptorUrlInfoMsg.show();
                    	  }
                      }, this);
                      
                   	  Ozone.components.focusable.Focusable.setupFocus(cmp.iconEl, this);
                      //pressing enter on the header toggles collapse
                      new Ext.util.KeyMap(cmp.iconEl, {
                          key: [Ext.EventObject.ENTER],
                          fn: function (key, evt) {
                              // required for IE, focus goes back to active widget for some reason
                              evt.stopEvent();

                        	  var descriptorUrlInfoMsg = this.ownerCt.getComponent('descriptorUrlInfoMsg');
                        	  if (descriptorUrlInfoMsg.isVisible()) {
                        		  descriptorUrlInfoMsg.hide();
                        	  } else {
                        		  descriptorUrlInfoMsg.show();
                        	  }
                          },
                          scope: cmp
                      });
                  }
              }
          },
          {
        	  xtype: 'component',
        	  itemId: 'descriptorUrlInfoMsg',
        	  name: 'descriptorUrlInfoMsg',
        	  cls: 'descriptorUrlInfoMsg',
        	  hidden: true,
        	  html: 'Enter the URL of a Widget Descriptor and click the Load button. Widget data is automatically retrieved from a Web-accessible location. To create the Widget Definition in OWF, click Apply.'
          },
          {
              xtype: 'urlfield',
              itemId: 'descriptorUrl',
              name: 'descriptorUrl',
              cls: 'descriptorUrlField',
              allowBlank: true,
              maxLength: 2083,
              enableKeyEvents: true,
              preventMark: true,
              emptyText: 'https://mycompany.com/widget/descriptor.html',
              usePlaceholderIfAvailable: false,
              value: '',
              rawValue: '',
              anchor: '100%',
              listeners: {
            	  change: {
            		  fn: this.handleDescriptorUrlChange,
            		  scope: this
            	  },
                  specialkey: {
                	  fn: function(field, e){
	                      // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
	                      // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
	                      if (e.getKey() == e.ENTER) {
	                    	  this.loadDescriptor(this);
	                      }
                	  },
                	  scope: this
                  }
              }
          },
          {
        	  xtype: 'toolbar',
        	  dock: 'bottom',
        	  itemId: 'descriptorUrlToolbar',
        	  name: 'descriptorUrlToolbar',
        	  cls: 'descriptorUrlToolbar',
        	  ui: 'footer',
        	  defaults: {minWidth: 75},
        	  items: [
        	      { 
        	    	  text: '<u>Don\'t have a descriptor URL?</u>',
        	    	  itemId: 'manualEntryLinkBtn',
        	    	  cls: 'manualEntryLinkBtn',
        	    	  handler: function(btn) {
		        		  var field = this.getComponent('descriptorUrl');
		        		  field.setValue("");
		        		  // Show all major properties.
        	    		  this.showProperties(true);
                          this.getComponent('descriptorUrlErrorMsg').hide();
        	    	  },
        	    	  scope: this
        	      },
        	      '->',
        	      {
    	        	  text: 'Load',
    	              itemId: 'descriptorUrlBtn',
    	              name: 'descriptorUrlBtn',
    	              cls: 'descriptorUrlBtn',
    	              margin: 0,
    	              disabled: true,
    	        	  handler: function(btn) {
    	        		  var btnText = btn.getText();
    	        		  if (btnText == 'Load') {
	                    	  this.loadDescriptor(this);
    	        		  } else {
    		        		  var loading = this.getComponent('descriptorUrlLoading');
	    	        		  var field = this.getComponent('descriptorUrl');
    	        			  if (this.xhr) {
    	        				  this.xhr.cancel();
    	        			  }
    	        			  loading.hide();
    		        		  field.enable();
    	        			  btn.setText('Load');
    	        		  }
    	        	  },
    	        	  scope: this
    	          }
        	  ]
          },
          {
        	  xtype: 'component',
        	  itemId: 'descriptorUrlLoading',
        	  name: 'descriptorUrlLoading',
        	  cls: 'descriptorUrlLoading',
        	  hidden: true,
        	  html: '<img src="../themes/common/images/shared/large-loading.gif" /><br />Loading...'
          },
          {
        	  xtype: 'component',
        	  itemId: 'descriptorUrlErrorMsg',
        	  name: 'descriptorUrlErrorMsg',
        	  cls: 'descriptorUrlErrorMsg',
        	  hidden: true,
        	  html: 'Unable to retrieve widget information. Please check your descriptor and try again.'
          },
          {
              xtype: 'component',
              name: 'horizontalRule',
              itemId: 'horizontalRule',
        	  cls: 'horizontalRule',
        	  hidden: true,
        	  html: '<hr>'
          },
          {
        	  xtype: 'component',
        	  itemId: 'manualEntryTitle',
        	  name: 'manualEntryTitle',
        	  cls: 'manualEntryTitle',
        	  hidden: true,
        	  html: 'Enter Widget Description'
          },
          {
            xtype: 'hidden',
            name: 'widgetGuid',
            itemId: 'widgetGuid',
            value: newGuid,
			preventMark: true
          },
          {
            xtype: 'textfield',
            itemId: 'name',
            name: 'name',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_displayNameField_blankText,
            maxLength: 256,
            emptyText: 'MyWidget',
            usePlaceholderIfAvailable: false,
            fieldLabel: Ozone.util.createRequiredLabel('Name')
          },
          {
            xtype: 'textarea',
            itemId: 'description',
            name: 'description',
            hidden: true,
            allowBlank: true,
            maxLength: 4000,
            emptyText: 'Describe the widget',
            usePlaceholderIfAvailable: false,
            fieldLabel: 'Description'
          },
          {
            xtype: 'textfield',
            name: 'version',
            itemId: 'version',
            hidden: true,
            allowBlank: true,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_widgetVersionField_blankText,
            maxLength: 256,
            emptyText: '1.0',
            usePlaceholderIfAvailable: false,
            fieldLabel: 'Version'
          },
          {
            xtype: 'textfield',
            name: 'universalName',
            itemId: 'universalName',
            hidden: true,
            allowBlank: true,
            emptyText: 'MyWidget.mycompany.com',
            usePlaceholderIfAvailable: false,
            fieldLabel: 'Universal Name'
          },
          {
            xtype: 'displayfield',
            fieldLabel: 'GUID',
            itemId: 'guid',
            hidden: true,
            value: newGuid,
			preventMark: true
          },
          {
            xtype: 'urlfield',
            name: 'url',
            itemId: 'url',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_widgetUrlField_blankText,
            fieldLabel: Ozone.util.createRequiredLabel('URL'),
            emptyText: 'https://mycompany.com/widget/MyWidget.html',
            usePlaceholderIfAvailable: false,
            maxLength: 2083
          },
          {
            xtype: 'urlfield',
            name: 'headerIcon',
            itemId: 'headerIcon',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_imageUrlSmallField_blankText,
            maxLength: 2083,
            emptyText: 'https://mycompany.com/widget/images/containerIcon.png',
            usePlaceholderIfAvailable: false,
            fieldLabel: Ozone.util.createRequiredLabel('Container Icon URL')
          },
          {
            xtype: 'urlfield',
            name: 'image',
            itemId: 'image',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_imageLargeUrlField_blankText,
            maxLength: 2083,
            emptyText: 'https://mycompany.com/widget/images/launchMenuIcon.png',
            usePlaceholderIfAvailable: false,
            fieldLabel: Ozone.util.createRequiredLabel('Launch Menu Icon URL')
          },
          {
            xtype: 'numberfield',
            name: 'width',
            itemId: 'width',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_widthNumberField_blankText,
            fieldLabel: Ozone.util.createRequiredLabel('Width'),
            value: 200,
            minValue: 200,
            maxValue: 2000
          },
          {
            xtype: 'numberfield',
            name: 'height',
            itemId: 'height',
            hidden: true,
            allowBlank: false,
            blankText: Ozone.layout.DialogMessages.widgetDefinition_heightNumberField_blankText,
            fieldLabel: Ozone.util.createRequiredLabel('Height'),
            value: 200,
            minValue: 200,
            maxValue: 2000
          },
          {
            xtype: 'textfield',
            name: '_tags',
            itemId: '_tags',
            hidden: true,
            emptyText: 'geo, map, tracking',
            usePlaceholderIfAvailable: false,
            fieldLabel: 'Default Tags'
          },
          {
            xtype: 'combobox',
            name: '_types',
            itemId: '_types',
            hidden: true,
            fieldLabel: Ozone.util.createRequiredLabel('Widget Type'),
            valueNotFoundText: 'invalid widget type',
            forceSelection: true,
            allowBlank: false,
            editable: false,
            store: this.widgetTypeStore,
            displayField: 'name',
            valueField: 'id',
            autoSelect:true,
            queryMode: 'local'
          },
          {
            xtype: 'checkbox',
            name: 'singleton',
            itemId: 'singleton',
            hidden: true,
            submitValue: true,
            fieldLabel: 'Singleton',
			preventMark: true
          },
          {
            xtype: 'checkbox',
            name: 'visible',
            itemId: 'visible',
            hidden: true,
            submitValue: true,
            checked: true,
            fieldLabel: 'Visible',
			preventMark: true
          },
          {
            xtype: 'checkbox',
            name: 'background',
            itemId: 'background',
            hidden: true,
            submitValue: true,
            checked: false,
            fieldLabel: 'Background',
			preventMark: true
          },
          {
            xtype: 'hidden',
            name: 'intents',
            itemId: 'intents',
            value: null,
  			preventMark: true
          }]
      });
      this.addEvents('recordupdated');
      
      this.callParent(arguments);
      //handle auto-selecting widget type for a new widget
      this.on('afterrender',
        function() {
          // Disable apply button until descriptor load or manual entry mode
          var toolbars = this.getDockedItems('toolbar[dock="bottom"]');
          var applyBtn = toolbars[0].getComponent('apply');
          applyBtn.disable();

    	  if (this.ownerCt.launchData && this.ownerCt.launchData.id) {
    		  this.showProperties(true);
    	  }
          var widgetType = this.getComponent('_types');
          if(!widgetType.value) {
            this.widgetTypeStore.load({
              callback: function() {
                widgetType.setRawValue(widgetType.store.findRecord('name','standard').get('name'));
                me.setWidgetType();
              }
            });
          }
    	}, this, {
          single: true
        } 
      );
    },
    initFieldValues: function(record) {
        var component = this;
        var data = record ? record.data : record;
        this.record = data;
        if (data) {
            var strTags = "";
            var newGuid = (data && data.widgetGuid) ? data.widgetGuid : guid.util.guid();
			var widgetGuid = component.getComponent('widgetGuid'),
			    name = component.getComponent('name'),
			    description = component.getComponent('description'),
				version = component.getComponent('version'),
				universalName = component.getComponent('universalName'),
				guid = component.getComponent('guid'),
				url = component.getComponent('url'),
				headerIcon = component.getComponent('headerIcon'),
				image = component.getComponent('image'),
				width = component.getComponent('width'),
				height = component.getComponent('height'),
				tags = component.getComponent('_tags'),
				singleton = component.getComponent('singleton'),
				visible = component.getComponent('visible'),
				background = component.getComponent('background'),
				widgetType = component.getComponent('_types'),
        		descriptorUrl = component.getComponent('descriptorUrl'),
				intents = component.getComponent('intents');

            for (var i = 0; data && data.tags && i < data.tags.length; i++) {
                strTags += data.tags[i].name;
                if (i < data.tags.length - 1) {
                    strTags += ", ";
                }
            }
            strTags = Ext.util.Format.htmlDecode(strTags);

            widgetGuid.setValue(newGuid).originalValue = newGuid;
            name.setValue(data.name).originalValue = data.name;
            description.setValue(data.description).originalValue = data.description;
            version.setValue(data.version).originalValue = data.version;
            universalName.setValue(data.universalName).originalValue = data.universalName;
            guid.setValue(newGuid).originalValue = newGuid;
            url.setValue(data.url).originalValue = data.url;
            headerIcon.setValue(data.headerIcon).originalValue = data.headerIcon;
            image.setValue(data.image).originalValue = data.image;
            width.setValue(data.width).originalValue = data.width;
            height.setValue(data.height).originalValue = data.height;
            tags.setValue(strTags).originalValue = strTags;
            singleton.setValue(data.singleton).originalValue = data.singleton;
            visible.setValue(data.visible).originalValue = data.visible;
            background.setValue(data.background).originalValue = data.background;
            if(!descriptorUrl.getValue()) {
                descriptorUrl.setValue(data.descriptorUrl).originalValue = data.descriptorUrl;
            }
            
            var strIntents = Ext.JSON.encode(data.intents);
            intents.setValue(strIntents).originalValue = strIntents;
            this.setWidgetType();

            //Update the descriptorUrlInfo title and help message for editing an existing widget
            component.getComponent('descriptorUrlInfo').titleEl.dom.innerHTML = 'Update Widget from Descriptor URL';
            component.getComponent('descriptorUrlInfoMsg').update('Click Load to update the widget. If the widget descriptor file changed since it was added to your instance of OWF, clicking Load will retrieve the latest widget data. To upload it to your OWF, click Apply.');

            //Enable all the intent CRUD buttons
            var intentsTab = component.ownerCt.down('#intents-tab');
            intentsTab.down('#btnCreate').enable();
            intentsTab.down('#btnEdit').enable();
            intentsTab.down('#btnDelete').enable();
            this.getForm().isValid();
        }
      	
        this.ownerCt.fireEvent('recordupdated', this.record);
    },
    
    loadDescriptor: function(component) {
		var field = component.getComponent('descriptorUrl'),
            loading = component.getComponent('descriptorUrlLoading'),
            text = Ext.String.trim(field.getValue()),
            btn = component.getComponent('descriptorUrlToolbar').getComponent('descriptorUrlBtn'),
            applyBtn = this.getDockedItems('toolbar[dock="bottom"]')[0].getComponent('apply'),
            manualEntryLinkBtn = descriptorUrlToolbar.getComponent('manualEntryLinkBtn');
		
		component.getComponent('descriptorUrlErrorMsg').hide();
		field.disable();
		component.showProperties(false);
		loading.show();
		component.xhr = Ozone.util.Transport.send({
            url : text,
            method : "GET",
            forceXdomain: true,
            onSuccess: Ext.bind(component.updatePropertiesFromDescriptor, component),
            onFailure: function (json){
                if(component.record) {
                    component.showProperties(true);
                }
                else {
                    manualEntryLinkBtn.show();
                }
                loading.hide();
                field.enable();
                btn.setText('Load');
                component.getComponent('descriptorUrlErrorMsg').show();
            },
            autoSendVersion : false
        });
		btn.setText('Cancel');
        //Disable the apply button while descriptor is loading
        applyBtn.disable();
    },
    
    updatePropertiesFromDescriptor: function(data) {
    	this.loadedFromDescriptor = true;
    	this.showProperties(true);
        var component = this;
		var loading = this.getComponent('descriptorUrlLoading');
		loading.hide();
		var btn = this.getComponent('descriptorUrlToolbar').getComponent('descriptorUrlBtn');
		btn.setText('Load');
		var descriptorUrl = component.getComponent('descriptorUrl');
		descriptorUrl.enable();
        this.loadedDecriptorUrl = descriptorUrl.getValue();
        this.record = data;
        if (data) {
            var strTags = "";
            var newGuid = (data && data.widgetGuid) ? data.widgetGuid : this.generateNewGuid();
			var widgetGuid = component.getComponent('widgetGuid'),
			    name = component.getComponent('name'),
			    description = component.getComponent('description'),
				version = component.getComponent('version'),
				universalName = component.getComponent('universalName'),
				guid = component.getComponent('guid'),
				url = component.getComponent('url'),
				headerIcon = component.getComponent('headerIcon'),
				image = component.getComponent('image'),
				width = component.getComponent('width'),
				height = component.getComponent('height'),
				tags = component.getComponent('_tags'),
				singleton = component.getComponent('singleton'),
				visible = component.getComponent('visible'),
				background = component.getComponent('background'),
				widgetType = component.getComponent('_types'),
				intents = component.getComponent('intents');

            for (var i = 0; data && data.defaultTags && i < data.defaultTags.length; i++) {
                strTags += data.defaultTags[i];
                if (i < data.defaultTags.length - 1) {
                    strTags += ", ";
                }
            }
            strTags = Ext.util.Format.htmlDecode(strTags);

            // Only change guid and universalId if this is a new record
            if (!this.ownerCt.recordId) {
                widgetGuid.setValue(Ext.String.trim(newGuid));
                guid.setValue(Ext.String.trim(newGuid));
            }
            
            // Set the description values
            name.setValue(Ext.String.trim(data.displayName));
            description.setValue(Ext.String.trim(data.description || ""));
            version.setValue(Ext.String.trim(data.widgetVersion || ""));
            universalName.setValue(Ext.htmlEncode(data.universalName) || "");
            url.setValue(Ext.String.trim(data.widgetUrl));
            headerIcon.setValue(Ext.String.trim(data.imageUrlSmall));
            image.setValue(Ext.String.trim(data.imageUrlLarge));
            width.setValue(data.width);
            height.setValue(data.height);
            tags.setValue(Ext.String.trim(strTags));
            singleton.setValue(data.singleton);
            visible.setValue(data.visible);
            background.setValue(data.background);
            intents.setValue(Ext.JSON.encode(data.intents || ""));
            
            this.record.intents = data.intents || {};
            
            // Set widget type
            var typeId = data.widgetTypes[0];
            if(!Ext.isNumeric(typeId))
            {
                widgetType.setRawValue(widgetType.store.findRecord('name','standard').get('name'));
            	typeId = this.widgetTypeStore.getAt(this.widgetTypeStore.find('name',typeId)).get('id');
            }
            this.getComponent('_types').setValue(typeId);
            
            // Set title because incoming json won't have this value
            data.title = Ext.String.trim(data.displayName);
            
            // Set record
            this.ownerCt.record = new Ozone.data.WidgetDefinition(data);
            this.ownerCt.record.phantom = true;
            
            // Enable the apply button.
            var toolbars = this.getDockedItems('toolbar[dock="bottom"]');
            var applyBtn = toolbars[0].getComponent('apply');
            applyBtn.enable();
        }
        this.getForm().isValid();
        this.ownerCt.fireEvent('recordupdated', this.record);
    },

    showProperties: function(show) {
		var descriptorUrlToolbar = this.getComponent('descriptorUrlToolbar');
		var manualEntryLinkBtn = descriptorUrlToolbar.getComponent('manualEntryLinkBtn');
		manualEntryLinkBtn.hide();
		
        var component = this;
		var horizontalRule = component.getComponent('horizontalRule'),
			manualEntryTitle = component.getComponent('manualEntryTitle'),
			name = component.getComponent('name'),
			description = component.getComponent('description'),
			version = component.getComponent('version'),
			universalName = component.getComponent('universalName'),
			guid = component.getComponent('guid'),
			url = component.getComponent('url'),
			headerIcon = component.getComponent('headerIcon'),
			image = component.getComponent('image'),
			width = component.getComponent('width'),
			height = component.getComponent('height'),
			tags = component.getComponent('_tags'),
			singleton = component.getComponent('singleton'),
			visible = component.getComponent('visible'),
			background = component.getComponent('background'),
			widgetType = component.getComponent('_types');
		
        if (show) {
            // Enable the apply button.
            var toolbars = this.getDockedItems('toolbar[dock="bottom"]');
            var applyBtn = toolbars[0].getComponent('apply');
            applyBtn.enable();

        	horizontalRule.show();
        	manualEntryTitle.show();
            name.show();
            description.show();
            version.show();
            universalName.show();
            guid.show();
            url.show();
            headerIcon.show();
            image.show();
            width.show();
            height.show();
            tags.show();
            singleton.show();
            visible.show();
            background.show();
            widgetType.show();
        } else {
        	horizontalRule.hide();
        	manualEntryTitle.hide();
            name.hide();
            description.hide();
            version.hide();
            universalName.hide();
            guid.hide();
            url.hide();
            headerIcon.hide();
            image.hide();
            width.hide();
            height.hide();
            tags.hide();
            singleton.hide();
            visible.hide();
            background.hide();
            widgetType.hide();
        }
    },
    handleDescriptorUrlChange: function(field, newValue, oldValue, eOpts) {
        var me = this,
            form = this.getForm();
            descriptorUrlToolbar = this.getComponent('descriptorUrlToolbar');
            descriptorUrlBtn = descriptorUrlToolbar.getComponent('descriptorUrlBtn');
        if (!field.changed && field.isDirty()) field.changed = true;
        if (field.isValid() && field.getValue()) {
        	descriptorUrlBtn.enable();
        } else {
        	descriptorUrlBtn.disable();
        }
    },
    onApply: function() {
        this.validateFields();
        
        if(!this.getForm().hasInvalidField()) {
          var panel = this;
          var widget = panel.ownerCt;
          var record = null;

          // Collect form values. Can't use this.getValues() because if descriptorUrl is used
          // fields may be disabled.
          var formFields = ['widgetGuid', 'name', 'description', 'version', 'universalName', 
                          'guid', 'url', 'headerIcon', 'image', 'width',
                          'height', '_tags', 'singleton', 'visible', 
                          'background', '_types', 'intents'];
          
          var formValues = {};
          for (var i = 0; i < formFields.length; i++) {
              var field = formFields[i];
              var cmp = this.getComponent(field);
              var value = cmp.getValue();
              if (Ext.isEmpty(value) || (cmp.inputEl && cmp.inputEl.hasCls(cmp.emptyCls))) {
                  if (field in ['singleton', 'visible', 'background']) {
                      formValues[field] = false;
                  } else {
                      formValues[field] = "";
                  }
              } else if (field == 'intents' && value){
                  formValues[field] = Ozone.util.parseJson(value);
              } else {
                  formValues[field] = value;
              }
          }

          //If descriptor url was successfully loaded save it, otherwise ignore it so we don't change
          //the record's previous value.
          if(panel.loadedDecriptorUrl) {
              formValues['descriptorUrl'] = panel.loadedDecriptorUrl;
          }
          
          if (widget.store.data.length > 0) {
              record = widget.store.getById(widget.recordId);
              record.beginEdit();
              for (field in formValues) {
                  record.set(field, formValues[field]);
              }
              record.endEdit();
          }
          else {
              widget.store.add(formValues);
              record = widget.store.data.items[0];
              record.phantom = true;
          }

          //the _tags text field it needs to be turned into json
            var tags = [];
            var tagString = formValues['_tags'];
            if (tagString && tagString.length > 0 && tagString != '') {
                var splits = tagString.split(',');
                for (var j = 0 ; j < splits.length ; j++) {
                    var name = Ext.String.trim(splits[j]);
                    if (name != '') {
                        tags.push({
                            name: name,
                            visible: true,

                            //todo use position to order groups for now just set to -1
                            position: -1,
                            editable: true
                        });
                    }
                }
            }
            var types = [];
            var typeId = formValues['_types'];
            if(!Ext.isNumeric(typeId))
            {
              typeId = this.widgetTypeStore.getAt(this.widgetTypeStore.find('name',typeId)).get('id');
            }
            types.push({
              id:typeId,
              name: this.widgetTypeStore.getById(typeId).get('name')
            });
           record.beginEdit();
           // Set title because incoming json won't have this value
           record.set('title', formValues['name']);
           
           //set the tags record with the json
           record.set('tags', tags);
           record.set('widgetTypes',types);
           record.endEdit();

           widget.record = record;
           widget.store.on({
             write: {
               fn: function() {
                 if (Ext.isFunction(panel.initFieldValues)) {
                     panel.showProperties(true);
                     panel.initFieldValues(widget.record);
                 }
                 this.refreshWidgetLaunchMenu();
               },
               scope: this,
               single: true
             }
          });
          widget.store.save();
        }
        else {
            this.showApplyAlert('Invalid field, changes cannot be saved.', 3000);
        }
    },
    setWidgetType: function() {
        var widgetTypeCmp = this.getComponent('_types');
        if (widgetTypeCmp) {
            if (this.record && this.record.widgetTypes) {
                var widgetTypeObj = this.record.widgetTypes[0];
                if (widgetTypeObj) {
                    widgetTypeCmp.setValue(widgetTypeObj.id).originalValue = widgetTypeObj.id;
                }
            }
        }
    },
    generateNewGuid: function() {
    	return guid.util.guid();
    }
});

Ext.define('Ozone.components.admin.widget.WidgetEditPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.widgetedit','widget.widgeteditpanel','widget.Ozone.components.admin.widget.WidgetEditPanel'],

    mixins: ['Ozone.components.WidgetAlerts'],

    cls: 'widgeteditpanel',
	
    initComponent: function () {
        var self = this;
        Ext.applyIf(this,{
            layout: 'fit',
            items: [{
                xtype: 'editwidgetpanel',
                cls: 'adminEditor',
                bodyCls: 'adminEditor-body',
                dragAndDrop: false,
                launchesWidgets: false,
                domain: 'Widget',
                channel: 'AdminChannel',
                store: Ext.create('Ozone.data.stores.AdminWidgetStore', {}),
                items: [
                    {
                        xtype: 'widgeteditproperties',
                        itemId: 'widgeteditproperties',
                        editPanel: self
                    },
                    {
                        xtype: 'intentstabpanel',
                        itemId: 'intentstabpanel',
                        editPanel: self
                    },
                    {
                        xtype: 'widgeteditusers',
                        itemId: 'widgeteditusers',
                        editPanel: self
                    },
                    {
                        xtype: 'widgeteditgroups',
                        itemId: 'widgeteditgroups',
                        editPanel: self
                    }
                ]
            }]
        });
        this.callParent(arguments);
    }
});
