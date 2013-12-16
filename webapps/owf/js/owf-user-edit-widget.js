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
Ext.define('Ozone.data.Preference', {
	extend: 'Ext.data.Model',
	idProperty: 'id',
	fields:[
     {name: 'id', mapping: 'id'},
	 {name: 'namespace', mapping: 'namespace'},
	 {name: 'path', mapping: 'path'},
	 {name: 'value', mapping: 'value'},
	 {name: 'username', mapping: 'user.userId'},
	 {name: 'originalNamespace'},
	 {name: 'originalPath'},
	 {name: 'originalValue'},
     {name:'title', mapping:'namespace'}]
});
Ext.define('Ozone.data.stores.PreferenceStore', {
  extend:'Ozone.data.OWFStore',
  model: 'Ozone.data.Preference',
  alias: 'store.preferencestore',
  remoteSort: true,
  sorters: [
    {
      property : 'namespace',
      direction: 'ASC'
    }
  ],
  constructor: function(config) {

    Ext.applyIf(config, {
      api: {
        read: "/administration/listPreferences",
        create: "/administration/addCopyPreferenceSubmit",
        update: "/administration/updatePreference",
        destroy: "/administration/deletePreferences"
      }
    });

    this.callParent(arguments);
  }

});
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
Ext.define('Ozone.components.admin.EditPreferenceWindow', {
    extend: 'Ext.window.Window',
    alias: [
        'widget.editpreferencewindow',
        'widget.usereditpreferencestab',
        'widget.Ozone.components.admin.EditPreferenceWindow'
    ],

    mixins: {
      widget: 'Ozone.components.focusable.CircularFocus'
    },

    cls: 'editpreferencewindow',
    
    callback: Ext.emptyFn,
    scope: undefined,
    namespace: undefined,
    path: undefined,
    value: undefined,
    username: undefined,
    
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
                                        var f = field.ownerCt;
                                        var form = f.getForm(),
                                        applyButton = f.ownerCt.getDockedItems()[0].getComponent('ok');
                                        if (!field.changed && field.isDirty()) field.changed = true;
                                        if (form.isDirty() && !form.hasInvalidField()) {
                                            applyButton.enable();
                                        } else {
                                            applyButton.disable();
                                        }
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
                            xtype: 'hidden',
                            value: this.username,
                            name: 'username'
                        }, {
                            xtype: 'textfield',
                            itemId: 'nameField',
                            value: this.path,
                            fieldLabel: Ozone.util.createRequiredLabel('Preference Name'),
                            labelWidth: 140,
                            allowBlank: false,
                            name: 'path',
                            maxLength: 200,
                            enforceMaxLength: true
                        }, {
                            xtype: 'textfield',
                            value: this.namespace,
                            fieldLabel: Ozone.util.createRequiredLabel('Namespace'),
                            labelWidth: 140,
                            allowBlank: false,
                            name: 'namespace',
                            maxLength: 200,
                            enforceMaxLength: true
                        }, {
                            xtype: 'textarea',
                            value: this.value,
                            fieldLabel: Ozone.util.createRequiredLabel('Value'),
                            labelWidth: 140,
                            allowBlank: false,
                            name: 'value'
                        }]
                    }],
                    buttons: [{
                        text: 'OK',
                        itemId: 'ok',
                        disabled: true,
                        handler: function(button, e) {
                            this.closeButton = button;
                            var p = button.ownerCt.ownerCt;
                            this.submitValues = p.getComponent('form').getValues();
                            var fields = p.getComponent('form').getForm().getFields().items;
                            for (field in fields)
                                if (fields[field].name) this.submitValues['original' + fields[field].name.charAt(0).toUpperCase() + fields[field].name.slice(1)] = fields[field].originalValue;
                            this.close();
                        },
                        scope: this
                    }, {
                        text: 'Cancel',
                        itemId: 'cancel',
                        handler: function(button, e) {
                            this.closeButton = button;
                            this.close();
                        },
                        scope: this
                    }]
                }]
        
            }]
        })
        
        this.callParent(arguments);

        this.on('afterrender', function() {
            this.setupFocus(this.down('#nameField').getFocusEl(), this.down('#cancel').getFocusEl());
        });
        
        this.on('beforeclose', function(panel, e) {
            this.callback.call(this.scope, this.submitValues, this.closeButton);
        });
    }
});

Ext.define('Ozone.components.admin.EditDashboardWindow', {
    extend: 'Ext.window.Window',
    alias: [
        'widget.editdashboardwindow',
        'widget.Ozone.components.admin.EditDashboardWindow'
    ],

    mixins: {
      widget: 'Ozone.components.focusable.CircularFocus'
    },

    cls: 'editdashboardwindow',
    
    callback: Ext.emptyFn,
    scope: undefined,
    guid: undefined,
    name: undefined,
    description: undefined,
    definition: undefined,
    
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
                                        var f = field.ownerCt;
                                        var form = f.getForm(),
                                        applyButton = f.ownerCt.getDockedItems()[0].getComponent('ok');
                                        if (!field.changed && field.isDirty()) field.changed = true;
                                        if (form.isDirty() && !form.hasInvalidField()) {
                                            applyButton.enable();
                                        } else {
                                            applyButton.disable();
                                        }
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
                            xtype: 'hidden',
                            value: this.guid,
                            name: 'guid',
                            preventMark: true,
                            itemId: 'guid'
                        }, {
                            xtype: 'textfield',
                            itemId: 'nameField',
                            value: this.name,
                            fieldLabel: Ozone.util.createRequiredLabel('Name'),
                            labelWidth: 140,
                            allowBlank: false,
                            name: 'name',
                            maxLength: 200,
                            enforceMaxLength: true
                        }, {
                            xtype: 'textarea',
                            value: this.description,
                            fieldLabel: 'Description',
                            labelWidth: 140,
                            allowBlank: true,
                            name: 'description',
                            maxLength: 255,
                            enforceMaxLength: true
                        }, {
                            xtype: 'textarea',
                            value: this.definition,
                            fieldLabel: Ozone.util.createRequiredLabel('Definition'),
                            labelWidth: 140,
                            allowBlank: true,
                            name: 'definition',
                            height: 130,
                            minHeight: 130,
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
                        }]
                    }],
                    buttons: [{
                        text: 'OK',
                        itemId: 'ok',
                        disabled: true,
                        handler: function(button, e) {
                            this.closeButton = button;
                            var p = button.ownerCt.ownerCt;
                            this.submitValues = p.getComponent('form').getValues();
                            var fields = p.getComponent('form').getForm().getFields().items;
                            for (field in fields)
                                if (fields[field].name) this.submitValues['original' + fields[field].name.charAt(0).toUpperCase() + fields[field].name.slice(1)] = fields[field].originalValue;
                            this.close();
                        },
                        scope: this
                    }, {
                        text: 'Cancel',
                        itemId: 'cancel',
                        handler: function(button, e) {
                            this.closeButton = button;
                            this.close();
                        },
                        scope: this
                    }]
                }]
        
            }]
        })
        
        this.callParent(arguments);

        this.on('afterrender', function() {
            this.setupFocus(this.down('#nameField').getFocusEl(), this.down('#cancel').getFocusEl());
        });
        
        this.on('beforeclose', function(panel, e) {
            this.callback.call(this.scope, this.submitValues, this.closeButton);
        });
    }
});

Ext.define('Ozone.components.admin.grid.DashboardsGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.dashboardsgrid'],
  quickSearchFields: ['name'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),
  mixins: ['Ozone.components.WidgetAlerts'],

  cls: 'grid-dashboard',

  defaultPageSize: 50,
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
        columnLines: true,
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
        },
        {
          itemId: 'name',
          header: 'Dashboard Title',
          dataIndex: 'name',
          flex: 1,
          minWidth: 200,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {

            var title = value;
            var dashboardLayoutList = record.get('EDashboardLayoutList'); //List of valid ENUM Dashboard Layout Strings
            var dashboardLayout = record.get('layout'); //current dashboard layout string
            var iconClass = "grid-dashboard-default-icon-layout";
            
            return  '<p class="grid-dashboard-title '+ iconClass + '">' + Ext.htmlEncode(title) + '</p>';
          }
        },
        {
          itemId: 'widgets',
          header: 'Widgets',
          dataIndex: 'layoutConfig',
          width: 250,
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
          itemId: 'dashboard-grid-paging'
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
  },
  
    doMoveRow: function(direction) {
        
        var dashboards = this.getSelectedDashboards();

        if (dashboards && dashboards.length > 0) {
            
            var store = this.store;
            
            dashboards.sort(function(a,b) {
                return a.get('dashboardPosition') - b.get('dashboardPosition');
            });
            
            if ('up' === direction) {
                var firstPosition = 1;
                for (var i = 0; i < dashboards.length; i++) {
                    if (dashboards[i].get('dashboardPosition') === firstPosition) {
                        firstPosition++;
                    } else {
                        var origPos = dashboards[i].get('dashboardPosition'), newPos = origPos - 1;
                        store.each(function(rec) {
                            var pos = rec.get('dashboardPosition')
                            if (pos) {
                                if (pos == newPos) {
                                    rec.set('dashboardPosition', origPos);
                                } else if (pos == origPos) {
                                    rec.set('dashboardPosition', newPos);
                                }
                            }
                        })
                    }
                }
            } else {
                var lastPosition = store.getCount();
                for (var i = dashboards.length - 1; i >= 0; i--) {
                    if (dashboards[i].get('dashboardPosition') === lastPosition) {
                        lastPosition--;
                    } else {
                        var origPos = dashboards[i].get('dashboardPosition'), newPos = origPos + 1;
                        store.each(function(rec) {
                            var pos = rec.get('dashboardPosition')
                            if (pos) {
                                if (pos == origPos) {
                                    rec.set('dashboardPosition', newPos);
                                } else if (pos == newPos) {
                                    rec.set('dashboardPosition', origPos);
                                }
                            }
                        })
                    }
                }
            }
            
            //If records were updated, sync, refresh, and reselect rows
            
            if (store.getUpdatedRecords().length) {
                store.sync();

                store.on('write', function() {
                    this.refresh();
                }, this, {
                    single: true
                });

                //After the store is loaded, reselect the selected stacks
                store.on('load', function(store, records, successful, operation) {
                    for (var i = 0; i < dashboards.length; i++) {
                        this.getSelectionModel().select(store.indexOfId(dashboards[i].get('id')), true);
                    }
                }, this, {
                    single: true
                });
            }
        }
        else {
            this.showAlert('Error', 'You must select at least one dashboard to move.');
        }
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

Ext.define('Ozone.components.admin.grid.PreferencesGrid', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.preferencesgrid'],
  plugins: new Ozone.components.focusable.FocusableGridPanel(),

  cls: 'grid-preference',
  
  defaultPageSize: 50,
//  infiniteScrolling: false,
  forceFit: true,
  baseParams: null,
  multiSelect: true,

  initComponent: function() {

    //create new store
    if (this.store == null) {
      this.store = Ext.StoreMgr.lookup({
        type: 'preferencestore',
        pageSize: this.defaultPageSize
      });
    }
    
    if (this.baseParams) { this.setBaseParams(this.baseParams); }

    Ext.apply(this, {
    	columnLines: true,
      columns: [
        {
          itemId: 'name',
          header: 'Preference Name',
          dataIndex: 'path',
          flex: 1,
          width: 210,
          minWidth: 210,
          sortable: true,
          renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
        },
        {
          itemId: 'namespace',
          header: 'Namespace',
          dataIndex: 'namespace',
          flex: 1,
          minWidth: 200,
          sortable: true,
		  renderer:  function(value, metaData, record, rowIndex, columnIndex, store, view) {
            return  '<div class="grid-text">' + Ext.htmlEncode(value) +'</div>';
          }
		},
        {
			itemId: 'value',
			header: 'Value',
			dataIndex: 'value',
			width: 250,
			sortable: false,
			renderer: function(value, metaData, record, rowIndex, columnIndex, store, view){
				return '<div class="grid-text">' + Ext.htmlEncode(value) + '</div>';
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
          itemId: 'preferences-grid-paging'
        })]
      });

    this.callParent(arguments);
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

Ext.define('Ozone.components.admin.DashboardsTabPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.dashboardstabpanel'],
    
    layout: {
        type: 'fit'
    },
    preventHeader: true,
    border: true,
    padding: 5,
    initDisabled: true,
    
    widgetLauncher: null,
    widgetEventingController: null,
    widgetStateHandler: null,
    isGroupDashboard: false,

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function() {
        
        var self = this;

        Ext.apply(this,{
        items: [{
            xtype: 'dashboardsgrid',
            itemId: 'dashboardsgrid',
            preventHeader: true,
            border: false,
            listeners: {
              itemdblclick: {
                fn: this.doEdit,
                scope: this
              }
            }
        }],

        dockedItems: [{
                xtype: 'toolbar',
                itemId: 'tbDashboardsGridHdr',
                cls: 'tbDashboardsGridHdr',
                dock: 'top',
                items: [{
                    xtype: 'tbtext',
                    cls: 'tbDashboardsGridHdr',
                    itemId: 'lblDashboardsGrid',
                    text:'Dashboards'
                },
                '->',
                {
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('dashboardsgrid');
                                if (grid != null) {
                                    grid.applyFilter(value, ['name']);
                                }
                            },
                            scope: this
                        }
                    }

                }]
            }]
        });

        this.on({
        //setup panel on the first activate
        'activate': {
            scope: this,
            fn: function(cmp, opts) {
                var grid = cmp.getComponent('dashboardsgrid');
                //var tbf = cmp.getDockedComponent('tbDashboardsGridFtr');
                var tb = cmp.getDockedComponent('tbDashboardsGridHdr');
                var lbl = tb.getComponent('lblDashboardsGrid');
                var comp = cmp.ownerCt;
                var compId = -1;
                // Create modified widget store and bind to grid
                grid.setStore(Ext.create('Ozone.data.stores.AdminDashboardStore', cmp.storeCfg));
                var refreshPagingToolbar = function(operation) {
                    if (operation.action == "destroy" || operation.action == "create") {
                        var ptb = grid.getBottomToolbar();
                        ptb.doRefresh();
                    }
                };
                grid.store.proxy.callback = refreshPagingToolbar;

                grid.store.on('write', function(store, action, result, records, rs) {
                    //Refresh whatever manager launched this editor widget
                    OWF.Eventing.publish(this.ownerCt.channel, {
                        action: action,
                        domain: this.ownerCt.domain,
                        records: result
                    });
                }, this);

                if (grid && comp) {
                    comp.record = comp.recordId > -1 ? comp.store.getAt(comp.store.findExact('id', comp.recordId)) : undefined;
                    compId = comp.recordId > -1 ? comp.recordId : -1;
                    var p = {
                        tab: 'dashboards',
                        adminEnabled: true
                    };
                    p[cmp.componentId] = compId;
                    grid.setBaseParams(p);
                }
            },
            single: true
        }

        });

        //reload store everytime the tab is activated
        this.on({
            activate: {
                fn: function(cmp, opts) {
                    var grid = cmp.getComponent('dashboardsgrid');
                    var store = grid.getStore();

                    // Set the title
                    if (cmp.ownerCt.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(cmp.ownerCt.record.get('title'), 25));
                        if(!titleText) {
                            titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(cmp.ownerCt.record.get('name'), 25)) || 'Dashboards';
                        }
                        var title = this.getDockedItems('toolbar[dock="top"]')[0].getComponent('lblDashboardsGrid');
                        title.setText(titleText);
                    }

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

        OWF.Preferences.getUserPreference({
            namespace: 'owf.admin.DashboardEditCopy',
            name: 'guid_to_launch',
            onSuccess: function(result) {
                self.guid_DashboardEditCopyWidget = result.value;
            },
            onFailure: function(err) { /* No op */
                self.editPanel.showAlert('Preferences Error', 'Error looking up Dashboard Editor: ' + err);
            }
        });

        this.callParent();
    },

    launchFailedHandler: function(response) {
        if (response.error) {
            this.editPanel.showAlert('Launch Error', 'Dashboard Editor Launch Failed: ' + response.message);
        }
    },

    onStoreException: function(proxy, response, operation, eOpts) {
        var decodedResponse;
        try {
            decodedResponse = Ext.JSON.decode(response);
        }
        catch (e) {
            decodedResponse = response;
        }

        decodedResponse && this.editPanel.showAlert('Server Error', decodedResponse);
    },

    onAddClicked: function () {
        var win = Ext.widget('admineditoraddwindow', {
            addType: 'Dashboard',
            itemName: this.ownerCt.record.get('displayName'),
            editor: this.editor,
            focusOnClose: this.down(),
            existingItemsStore: this.getComponent('dashboardsgrid').getStore(),
            grid: Ext.widget('dashboardsgrid', {
                itemId: 'dashboardsaddgrid',
                border: false,
                enableColumnHide: false,
                sortableColumns: false,
                listeners: {
                    render: {
                        fn: function(cmp) {
                            cmp.setBaseParams({
                                adminEnabled: true,
                                isGroupDashboard: true,
                                isStackDashboard: false
                            });
                        },
                        scope: this
                    }
                }
            })
        });
        win.show();
    },
    
    doEdit: function(cmp, record, item, index, e) {
        var grid = this.getComponent('dashboardsgrid');
        var records = grid.getSelectedDashboards();
        if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {
                var id = records[i].data.guid;//From Id property of Dashboard Model
                var dataString = Ozone.util.toString({
                    id: id,
                    copyFlag: false,
                    isGroupDashboard: this.isGroupDashboard
                });

                OWF.Launcher.launch({
                    guid: this.guid_DashboardEditCopyWidget,
                    title: '$1 - ' + records[i].get('name'),
                    titleRegex: /(.*)/,
                    launchOnlyIfClosed: false,
                    data: dataString
                }, this.launchFailedHandler);
            }
        }
        else {
            this.editPanel.showAlert("Error", "You must select at least one dashboard to edit");
        }
    },

    doDelete: function(button, e) {
        var grid = this.getComponent('dashboardsgrid');
        var store = grid.getStore();
        var records = grid.getSelectedDashboards();
        if (records && records.length > 0) {
            store.remove(records);
            store.save();
        } else {
            this.editPanel.showAlert("Error", "You must select at least one dashboard to remove.");
        }
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

Ext.define('Ozone.components.admin.grid.PreferencesTabPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.preferencestabpanel'],

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(this, {

            layout: {
                type: 'fit'
            },
            preventHeader: true,
            border: true,
            padding: 5,
    
            //gridWidgets: null,
            widgetLauncher: null,
            widgetEventingController: null,
            widgetStateHandler: null,
            initDisabled: true,
    
            items: [{
                xtype: 'preferencesgrid',
                itemId: 'preferencesGrid',
                preventHeader: true,
                border: false
            }],

            dockedItems: [{
                xtype: 'toolbar',
                itemId: 'tbPreferencesGridHdr',
                cls: 'tbPreferencesGridHdr',
                dock: 'top',
                items: [{
                    xtype: 'tbtext',
                    itemId: 'lblPreferencesGrid',
                    cls: 'tbPreferencesGridHdr',
                    text: 'Preferences'
                },
                '->',
                {
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('preferencesGrid');
                                if (grid != null) {
                                    grid.applyFilter(value, ['namespace', 'path', 'value']);
                                }
                            },
                            scope: this
                        }
                    }
                }]
            }, {
                xtype: 'toolbar',
                itemId: 'tbPreferencesGridFtr',
                dock: 'bottom',
                ui: 'footer',
                defaults: {
                    minWidth: 80
                },
                items: [{
                    xtype: 'button',
                    itemId: 'btnCreate',
                    text: 'Create',
                    handler: this.onCreateClicked,
                    scope: this
                }, {
                    xtype: 'button',
                    itemId: 'btnEdit',
                    text: 'Edit',
                    handler: function() {
                        this.onEditClicked();
                    },
                    scope: this
                }, {
                    xtype: 'button',
                    itemId: 'btnDelete',
                    text: 'Delete',
                    handler: function() {
                        var grid = this.getComponent('preferencesGrid');
                        var store = grid.store;
                        var records = grid.getSelectionModel().getSelection();
                        if (records && records.length > 0) {
                            me.editPanel.showConfirmation('Delete Preferences', 
                                'This action will permanently delete the selected ' + records.length + ' preference(s)?', 
                                function(btn, text, opts) {
                                    if (btn == 'ok') {
                                        store.remove(records);
                                        store.save();
                                    }
                                });
                        } else {
                            me.editPanel.showAlert("Error", "You must select at least one preferences to delete.");
                        }
                    },
                    scope: this
                }]
            }]
        });
        
        this.on({
            activate: {
                scope: this,
                fn: function(cmp, opts) {
                    var grid = cmp.getComponent('preferencesGrid');

                    var tb = cmp.getDockedComponent('tbPreferencesGridHdr');
                    var lbl = tb.getComponent('lblPreferencesGrid');
                    var comp = cmp.ownerCt;
                    
                    grid.setStore(Ext.create('Ozone.data.stores.PreferenceStore', cmp.storeCfg));
                    var refreshPagingToolbar = function(operation) {
                        if (operation.action == "destroy" || operation.action == "create") {
                            var ptb = grid.getBottomToolbar();
                            ptb.doRefresh();
                        }
                    };
                    grid.store.proxy.callback = refreshPagingToolbar;
                    if (grid && comp) {
                        comp.record = comp.recordId ? comp.store.getAt(comp.store.findExact('id', comp.recordId)) : undefined;
                        compId = comp.recordId ? comp.record.data.username : '';
                        var p = {
                            tab: 'preferences'
                        };
                        p[cmp.componentId] = compId;
                        grid.setBaseParams(p);
                    }
                    
                    // Set the title
                    if (comp.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('title'), 25)) || 'Preferences';
                        lbl.setText(titleText);
                    }
                    
                    if (grid != null) {
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var records = grid.getSelectionModel().getSelection();
                                    if (records && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            cmp.onEditClicked();
                                        }
                                    }
                                    else {
                                        me.editPanel.showAlert("Error", "You must select at least one preference to edit.");
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
        
        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();
        
        this.on({
           activate: {
             fn: function() {
               var grid = this.getComponent('preferencesGrid');
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
    onCreateClicked: function(btn, evt) {
        evt.stopPropagation();
        Ext.create('Ozone.components.admin.EditPreferenceWindow', {
            title: 'Create Preference',
            username: this.ownerCt.record.data.username,
            width: Math.round(Ext.getBody().getViewSize().width * .9),
            height: Math.round(Ext.getBody().getViewSize().height * .9),
            scope: this,
            callback: function(values, button) {
                if (values != undefined) {
                    var store = this.getComponent('preferencesGrid').getStore();
                    store.add(values);
                    store.save();
                }
            }
        }).show();
    },
    onEditClicked: function() {
        var records = this.getComponent('preferencesGrid').getSelectionModel().getSelection();
        if (records.length == 1) {
            Ext.create('Ozone.components.admin.EditPreferenceWindow', {
                title: 'Edit Preference',
                namespace: records[0].data.namespace,
                path: records[0].data.path,
                value: records[0].data.value,
                username: this.ownerCt.record.data.username,
                width: Math.round(Ext.getBody().getViewSize().width * .9),
                height: Math.round(Ext.getBody().getViewSize().height * .9),
                scope: this,
                callback: function(values, button){
                    if (values != undefined) {
                        var record = this.getComponent('preferencesGrid').getSelectionModel().getSelection()[0];
                        var store = this.getComponent('preferencesGrid').getStore();
                        record.beginEdit()
                            for (var field in values) {
                                if (!Ext.isFunction(field)) {
                                    record.set(field, values[field]);
                                }
                            }
                        record.endEdit()
                        store.save();
                        record.commit();
                    }
                }
            }).show();
        } else if (records.length < 1) {
            this.editPanel.showAlert("Error", "You must select at least one preferences to edit.");
        } else {
            this.editPanel.showAlert("Error", "You can only edit one preference at a time.");
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

Ext.define('Ozone.components.admin.StacksTabPanel',{
    extend: 'Ext.panel.Panel',
    alias: ['widget.stackstabpanel','widget.Ozone.components.admin.StacksTabPanel'],

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
                xtype:'stacksgrid',
                itemId:'stacksgrid',
                preventHeader:true,
                border:false
            }],
            dockedItems:[{
                xtype:'toolbar',
                itemId: 'tbStacksGridHdr',
                cls: 'tbStacksGridHdr',
                dock:'top',
                items:[{
                    xtype:'tbtext',
                    itemId: 'lblStacksGrid',
                    cls: 'tbStacksGridHdr',
                    text:'Stacks'
                },'->',{
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('stacksgrid');
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
                        var grid = this.down('#stacksgrid');
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
                                self.editPanel.showAlert("Error", "You must select at least one stack to remove.")
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
                    var grid = cmp.down('#stacksgrid');
                    
                    grid.setStore(Ext.create('Ozone.data.StackStore',cmp.storeCfg));
                    var refreshPagingToolbar = function(operation) {
                        cmp.refreshWidgetLaunchMenu();
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
                        owner.record = owner.recordId ? owner.store.getAt(owner.store.findExact('id', owner.recordId)) : undefined;
                    }
                    
                    // Set the title
                    if (owner.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(owner.record.get('title'), 25)) || 'Stacks';
                        var title = cmp.getDockedItems('toolbar[dock="top"]')[0].getComponent('lblStacksGrid');
                        title.setText(titleText);
                    }

                    OWF.Preferences.getUserPreference({
                        namespace: 'owf.admin.StackEditCopy',
                        name: 'guid_to_launch',
                        onSuccess: function(result) {
                            cmp.guid_EditCopyWidget = result.value;
                        },
                        onFailure: function(err) { /* No op */
                            self.editPanel.showAlert('Preferences Error', 'Error looking up Stack Editor: ' + err);
                        }
                    });
                    
                    if(grid && owner) {
                        var compId = owner.recordId ? owner.recordId: -1;
                        var p = {
                            tab:'stacks'
                        };
                        p[cmp.componentId] = compId;
                        grid.setBaseParams(p);
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var records = grid.getSelectionModel().getSelection();
                                    if (records && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            cmp.doEdit(records[i].data.id, records[i].data.name);
                                        }
                                    }
                                    else {
                                        self.editPanel.showAlert("Error", "You must select at least one stack to edit.");
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
               var grid = this.getComponent('stacksgrid');
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
            addType: 'Stack',
            itemName: itemName,
            editor: this.editor,
            focusOnClose: this.down(),
            existingItemsStore: this.getComponent('stacksgrid').getStore(),
            searchFields: ['displayName'],
            grid: Ext.widget('stacksgrid', {
                itemId: 'stacksaddgrid',
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
            title: '$1 - ' + title,
            titleRegex: /(.*)/,
            guid: this.guid_EditCopyWidget,
            launchOnlyIfClosed: false,
            data: dataString
        }, function(response) {
            if (response.error) {
                self.editPanel.showAlert('Launch Error', 'Stack Editor Launch Failed: ' + response.message);
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
Ext.define('Ozone.components.admin.grid.WidgetsTabPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.widgetstabpanel'],

    //The editor widget the tab is open in
    editPanel: null,
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(this, {

            layout: {
                type: 'fit'
            },
            preventHeader: true,
            border: true,
            padding: 5,
    
            //gridWidgets: null,
            widgetLauncher: null,
            widgetEventingController: null,
            widgetStateHandler: null,
            initDisabled: true,
    
            items: [{
                xtype: 'widgetsgrid',
                itemId: 'widgetsGrid',
                preventHeader: true,
                border: false
            }],

            dockedItems: [{
                xtype: 'toolbar',
                itemId: 'tbWidgetsGridHdr',
                cls: 'tbWidgetsGridHdr',
                dock: 'top',
                items: [{
                    xtype: 'tbtext',
                    itemId: 'lblWidgetsGrid',
                    cls: 'tbWidgetsGridHdr',
                    text: 'Widgets'
                },
                '->',
                {
                    xtype: 'searchbox',
                    listeners: {
                        searchChanged: {
                            fn: function(cmp, value) {
                                var grid = this.getComponent('widgetsGrid');
                                if (grid != null) {
                                    grid.applyFilter(value, ['displayName', 'universalName']);
                                }
                            },
                            scope: this
                        }
                    }
                }]
            }, {
                xtype: 'toolbar',
                itemId: 'tbWidgetsGridFtr',
                dock: 'bottom',
                ui: 'footer',
                defaults: {
                    minWidth: 80
                },
                items: [{
                    xtype: 'button',
                    itemId: 'btnAdd',
                    text: 'Add',
                    handler: function() {
                      this.onAddClicked();
                    },
                    scope: this
                }, {
                    xtype: 'button',
                    itemId: 'btnRemove',
                    text: 'Remove',
                    handler: function() {
                      var grid = this.getComponent('widgetsGrid');
                      var store = grid.store;
                      var records = grid.getSelectionModel().getSelection();
                      if (records && records.length > 0) {
                          store.remove(records);
                          store.save();
                      } else {
                          me.editPanel.showAlert("Error", "You must select at least one widget to remove.");
                      }
                    },
                    scope: this
                }]
            }]
        });
        
        this.on({
            activate: {
                scope: this,
                fn: function(cmp, opts) {
                    var grid = cmp.getComponent('widgetsGrid');
                    //var tbf = cmp.getDockedComponent('tbWidgetsGridFtr');
                    var tb = cmp.getDockedComponent('tbWidgetsGridHdr');
                    var lbl = tb.getComponent('lblWidgetsGrid');
                    var comp = cmp.ownerCt;
                    var compId = -1;
                    
                    OWF.Preferences.getUserPreference({
                        namespace: 'owf.admin.WidgetEditCopy',
                        name: 'guid_to_launch',
                        onSuccess: function(result) {
                            cmp.guid_EditCopyWidget = result.value;
                        },
                        onFailure: function(err) { /* No op */
                            me.editPanel.showAlert('Preferences Error', 'Error looking up Widget Editor: ' + err);
                        }
                    });
    
                    // Create modified widget store and bind to grid
                    grid.setStore(Ext.create('Ozone.data.stores.AdminWidgetStore', cmp.storeCfg));
                    var refreshPagingToolbar = function(operation) {
                        cmp.refreshWidgetLaunchMenu();
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
                        comp.record = comp.recordId > -1 ? comp.store.getAt(comp.store.findExact('id', comp.recordId)) : undefined;
                        compId = comp.recordId > -1 ? comp.recordId : -1;
                        var p = {
                            tab: 'widgets'
                        };
                        p[cmp.componentId] = compId;
                        grid.setBaseParams(p);
                    }
                    
                    // Set the title
                    if (comp.record) {
                        var titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('title'), 25));
                        if(!titleText) {
                            titleText = Ext.htmlEncode(Ext.util.Format.ellipsis(comp.record.get('name'), 25)) || 'Widgets';
                        }
                        lbl.setText(titleText);
                    }
                    
                    if (grid != null) {
                        grid.on({
                            itemdblclick: {
                                fn: function() {
                                    var records = grid.getSelectionModel().getSelection();
                                    if (records && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            cmp.doEdit(records[i].data.id, records[i].data.name);
                                        }
                                    }
                                    else {
                                        me.editPanel.showAlert("Error", "You must select at least one widget to edit.");
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
        
        this.widgetStateHandler = Ozone.state.WidgetStateHandler.getInstance();

        this.on({
           activate: {
             fn: function() {
               var grid = this.getComponent('widgetsGrid');
               var store = grid.getStore();

               if (store) {
                    /*
                    store.on(
                        'datachanged',
                        function(store, opts) {
                            if (store && lbl) {
                                var s = '<span class="heading-bold">- Widgets</span> <span class="heading">(' + store.getCount() + ' Results';
                                if (this.lastAction) {
                                    s += ', ' + this.lastAction;
                                }
                                s += ')</span>';
                                lbl.setText(s);
                            }
                        }
                    );
                    */

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
    
    doEdit: function(id, title) {
        var me = this;
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
                me.editPanel.showAlert('Launch Error', 'Widget Editor Launch Failed: ' + response.message);
            }
        });
    },
    
    onAddClicked: function(button, e) {
        var win = Ext.widget('admineditoraddwindow', {
            addType: 'Widget',
            itemName: this.ownerCt.record.get('title'),
            editor: this.editor,
            focusOnClose: this.down(),
            existingItemsStore: this.getComponent('widgetsGrid').getStore(),
            searchFields: ['displayName'],
            grid: Ext.widget('widgetsgrid', {
                itemId: 'widgetsaddgrid',
                border: false,
                enableColumnHide: false,
                sortableColumns: false
            })
        });
        win.show();
    }
});
Ext.define('Ozone.components.admin.user.UserEditDashboardsTab', {
    extend: 'Ozone.components.admin.DashboardsTabPanel',
    alias: [
        'widget.usereditdashboards',
        'widget.usereditdashboardstab',
        'widget.Ozone.components.admin.user.UserEditDashboardsTab'
    ],
    
    cls: 'usereditdashboardstab',
    editor: 'User',
    
    initComponent: function () {
        //get widget to launch
        Ext.apply(this,{
            layout: 'fit',
            itemId: 'tabDashboards',
            title: 'Dashboards',
            iconCls: 'dashboard-tab',
            componentId: 'user_id',
            storeCfg: {
                api: {
                    read: '/dashboard',
                    create: '/dashboard',
                    update: '/dashboard',
                    destroy: '/dashboard'
                },
                methods: {
                    read: 'GET', 
                    load: 'GET',  
                    create: 'PUT', 
                    update: 'PUT', 
                    save: 'POST', 
                    destroy: 'DELETE'
                },
                updateActions: {
                    destroy: 'remove',
                    create: 'add'
                }
            }
        });
        this.callParent(arguments);

        this.addDocked({
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
                handler: function(btn, evt) {
                    evt.stopPropagation();
                    this.doCreate();
                },
                scope: this
            },
            {
                xtype: 'splitbutton',
                text: 'Edit',
                handler:  function() {
                    this.doEdit();
                },
                scope: this,
                menuAlign: 'bl-tl?',
                menu: {
                    xtype: 'menu',
                    plain: true,
                    defaults: {
                        minWidth: 80
                    },
                    items: [
                    {
                        xtype: 'owfmenuitem',
                        text: 'Copy To Group',
                        handler: function() {
                            this.doCopy();
                        },
                        scope: this
                    }
                    ]
                }
            },
            {
                xtype: 'button',
                text: 'Delete',
                itemId: 'btnDelete',
                handler: function() {
                    this.doDelete();
                },
                scope: this
            }]
        });
    },
    doCreate: function(button, e) {

        var grid = this.getComponent('dashboardsgrid');
        var comp = this.ownerCt;
        var compId = comp.recordId ? comp.recordId : -1;
        
        Ext.create('Ozone.components.admin.EditDashboardWindow', {
            title: 'Dashboard Editor',
            width: Ext.getBody().getViewSize().width * .9,
            height: Ext.getBody().getViewSize().height * .9,
            scope: this,
            callback: function(values, button) {
                if (values != undefined) {
                    var oDefinition = Ext.decode(values.definition);
                    if (oDefinition) {
                        oDefinition.guid = guid.util.guid();
                        if (values.name) {
                            oDefinition.name = values.name;
                        }
                        if (values.description) {
                            oDefinition.description = values.description;
                        }
                    }
                    var store = Ext.StoreMgr.lookup({
                        type: 'admindashboardstore'
                    });
                    store.proxy.extraParams.user_id = compId;
                    store.add(oDefinition);
                    var record = store.data.items[0];
                    record.phantom = true;
                    
                    store.on({
                        write: {
                            fn: function(store, action, result, records, rs) {
                                if (grid && grid.store) {
                                    OWF.Eventing.publish(this.ownerCt.channel, {
                                        action: action,
                                        domain: this.ownerCt.domain,
                                        records: result
                                    });
                                    grid.store.load();
                                }
                            },
                            scope: this
                        }
                    });
                    
                    if (store.proxy) {
                        store.proxy.on({
                            exception: {
                                fn: this.onStoreException,
                                scope: this
                            }
                        });
                    }
                    
                    store.sync();
                }
            }
        }).show();
    },
    doEdit: function(cmp, record, item, index, e) {
        var grid = this.getComponent('dashboardsgrid');
        var records = grid.getSelectedDashboards();
        var recId = this.ownerCt.recordId;
        if (records && records.length > 0) {
            var record = records[0];
            var data = record ? record.data : record;
            var jsonString = null;
            if (data) {
                jsonString = owfdojo.toJson(data, true);
            }
            
            Ext.create('Ozone.components.admin.EditDashboardWindow', {
                title: 'Dashboard Editor - ' + data.name ? Ext.htmlEncode(data.name) : '',
                guid: data.guid ? data.guid : '',
                name: data.name ? data.name : '',
                description: data.description ? data.description : '',
                definition: jsonString ? jsonString : '',
                width: Ext.getBody().getViewSize().width * .9,
                height: Ext.getBody().getViewSize().height * .9,
                scope: this,
                callback: function(values, button) {
                    if (values != undefined) {
                        var oDefinition = Ext.decode(values.definition);
                        if (oDefinition) {
                            if (values.guid) {
                                oDefinition.guid = values.guid;
                            }
                            if (values.name) {
                                oDefinition.name = values.name;
                            }
                            if (values.description) {
                                oDefinition.description = values.description;
                            }
                        }
                        var store = Ext.StoreMgr.lookup({
                            type: 'admindashboardstore'
                        });
                        store.proxy.extraParams.user_id = recId;
                        store.add(oDefinition);
                        var record = store.data.items[0];
                        record.phantom = true;
                        
                        store.on({
                            write: {
                                fn: function(store, operation, eOpts) {
                                    if (grid && grid.store) {
                                        grid.store.load();
                                    }
                                },
                                scope: this
                            }
                        });
                        
                        if (store.proxy) {
                            store.proxy.on({
                                exception: {
                                    fn: this.onStoreException,
                                    scope: this 
                                }
                            });
                        }
                        
                        store.sync();
                    }
                }
            }).show();
        }
        else {
            this.editPanel.showAlert("Error", "You must select at least one dashboard to edit.");
        }
    },
    doCopy: function(button, e) {
        var grid = this.getComponent('dashboardsgrid');
        var records = grid.getSelectedDashboards();
        if (records && records.length > 0) {
            var dashboardData = [];
            for (var i = 0 ; i < records.length ; i++) {
                dashboardData.push( Ozone.util.cloneDashboard(records[i].data, false, true) );
            }
            this.openCopyWindow(dashboardData);
        }
        else {
            this.editPanel.showAlert("Error", "You must select at least one dashboard to copy.");
        }
    },
    openCopyWindow: function (dashboardData) {
        var me = this;
        var addTitle = "Select one or more groups and click 'OK':";
        if (me.editor) {
            addTitle = "To copy the selected dashboards, select one or more groups and click 'OK':";
        }

        var win = Ext.widget('admineditoraddwindow', {
            addType: 'Group',
            itemName: dashboardData.length === 1 ? dashboardData[0].name : 'Dashboards',
            editor: this.editor,
            focusOnClose: this.down(),
            instructions: addTitle,
            searchFields: ['name', 'description'],
            grid: Ext.widget('groupsgrid', {
                itemId: 'groupsaddgrid',
                preventHeader:true,
                border: false,
                enableColumnHide: false,
                sortableColumns: false
            }),
            okFn: function() {
                var grid = win.down('#groupsaddgrid');
                if(grid) {
                    var groupRecords = grid.getSelectionModel().getSelection();
                    if (groupRecords && groupRecords.length > 0) {
                        var groupData = [];
                        for (var i = 0 ; i < groupRecords.length ; i++) {
                            groupData.push(groupRecords[i].data);
                        }

                        //ajax call to the server
                        Ozone.util.Transport.send({
                            url : Ozone.util.contextPath() + '/group/copyDashboard',
                            method : "POST",
                            onSuccess: Ext.bind(function (json){
                                var dashboardsgrid = this.down("#dashboardsgrid");
                                if (dashboardsgrid) {
                                    dashboardsgrid.refresh();
                                }
                            },this),
                            onFailure: function (errorMsg){
                                me.editPanel.showAlert("Error", "Error while " +
                                    "copying dashboard(s): " + 
                                    errorMsg);
                            },
                            autoSendVersion : false,
                            content : {
                                isGroupDashboard: true,
                                groups: Ext.encode(groupData),
                                dashboards: Ext.encode(dashboardData)
                            }
                        });

                    }
                }
            }
        });
        win.show();
    },
    doDelete: function(button, e) {
        var grid = this.getComponent('dashboardsgrid'),
            store = grid.getStore()
            records = grid.getSelectedDashboards();
        if (records && records.length > 0) {
            var msg = 'This action will permanently delete the selected dashboard(s)';
            if (records.length == 1) {
                msg = 'This action will permanently delete <span class="heading-bold">' 
                        + Ext.htmlEncode(records[0].data.name) + '</span>.';
            } else {
                msg = 'This action will permanently delete the selected <span class="heading-bold">' 
                        + records.length + ' dashboards</span>.';
            }
            var okFn = function(btn, text, opts) {
                if (btn == 'ok') {
                    store.remove(records);
                    store.save();
                }
            };
            this.editPanel.showConfirmation('Warning', msg, okFn);
        } else {
            this.editPanel.showAlert("Error", "You must select at least one dashboard to delete.");
        }
    }


});

Ext.define('Ozone.components.admin.user.UserEditPreferencesTab', {
    extend: 'Ozone.components.admin.grid.PreferencesTabPanel',
    alias: ['widget.usereditpreferences',
            'widget.usereditpreferencestab',
            'widget.Ozone.components.admin.user.UserEditPreferencesTab'],

    cls: 'usereditpreferencestab',
    	    
    initComponent: function () {
        
        var self = this;
        Ext.applyIf(this,{
            layout: 'fit',
            itemId: 'tabPreferences',
            title: 'Preferences',
            iconCls: 'preferences-tab',
			editor: 'User',
            componentId: 'username',
			storeCfg: {
                api: {
                    read: "/administration/listPreferences",
       			 	create: "/administration/addCopyPreferenceSubmit",
        			update: "/administration/updatePreference",
        			destroy: "/administration/deletePreferences"
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
				reader: {
					root: 'rows'
				}
            }
        });
        this.callParent(arguments);
    }
});
Ext.define('Ozone.components.admin.user.UserEditPropertiesTab', {
    extend: 'Ozone.components.PropertiesPanel',
    alias: ['widget.usereditproperties',
            'widget.usereditpropertiestab',
            'widget.Ozone.components.admin.user.UserEditPropertiesTab'],
        
    cls: 'usereditpropertiestab',
    
    initComponent: function () {
        //get widget to launch
        Ext.apply(this,{
            title: 'Properties',
            iconCls: 'properties-tab',
            items: [{
                xtype: 'textfield',
                name: 'username',
                fieldLabel: Ozone.util.createRequiredLabel('User Name'),
                disabledCls: 'properties-field-disabled',
                maxLength: 200,
                allowBlank: false,
                disable: function(silent) {
                    var me = this;

                    if (me.rendered) {
                        me.el.addCls(me.disabledCls);
  //                      me.el.dom.disabled = true;
                        me.onDisable();
                    }

                    me.disabled = true;

                    if (silent !== true) {
                        me.fireEvent('disable', me);
                    }

                    return me;
                },
                itemId: 'username'
            }, {
                xtype: 'textfield',
                fieldLabel: Ozone.util.createRequiredLabel('Full Name'),
                name: 'userRealName',
                itemId: 'userRealName',
                allowBlank: false,
                maxLength: 200
            }, {
                xtype: 'textfield',
                allowBlank: true,
                fieldLabel: 'Email',
                name: 'email',
                itemId: 'email',
                vtype: 'email',
                maxLength: 200
            }]
        });
        this.callParent(arguments);
    },
    
    initFieldValues: function(record) {
        var component = this;
        var data = record ? record.data : record;
        
        if (data) {
			var username = component.getComponent('username'),
			    userRealName = component.getComponent('userRealName'),
				email = component.getComponent('email');
			
            username.setValue(data.username).originalValue = data.username;
            username.setDisabled(true);
            userRealName.setValue(data.userRealName).originalValue = data.userRealName;
            email.setValue(data.email).originalValue = data.email;
        }
    }
});
Ext.define('Ozone.components.admin.user.UserEditGroupsTab', {
    extend: 'Ozone.components.admin.GroupsTabPanel',
    alias: [
        'widget.usereditgroups',
        'widget.usereditgroupstab',
        'widget.Ozone.components.admin.user.UserEditGroupsTab'
    ],

    cls: 'usereditgroupstab',

    initComponent: function() {
        Ext.applyIf(this, {
            layout: 'fit',
            padding: 5,
            itemId: 'tabGroups',
            iconCls: 'groups-tab',
            editor: 'User',
            componentId: 'user_id',
            title: 'Groups',
            //userRecord: null,
            storeCfg: {
                api: {
                    read: '/group',
                    create: '/user',
                    update: '/group',
                    destroy: '/user'
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
            },
            addFilter: {
                automatic: false
            }
        });

        this.callParent();
    },
    initBaseParams: function(record) {
        this.baseParams = {
            user_id:record.data.id
        };
        this.applyFilter();
    }
});
Ext.define('Ozone.components.admin.user.UserEditStacksTab', {
  extend: 'Ozone.components.admin.StacksTabPanel',
  alias: ['widget.usereditstacks',
    'widget.usereditstackstab',
    'widget.Ozone.components.admin.user.UserEditStacksTab'],

  cls: 'usereditstackstab',

  initComponent: function () {
    Ext.apply(this, {
      padding: 5,
      iconCls: 'stacks-tab',
      editor: 'Stack',
      componentId: 'user_id',
      title: 'Stacks',
      storeCfg: {
                api: {
                    read: '/stack',
                    create: '/user',
                    update: '/stack',
                    destroy: '/user'
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
      user_id: record.data.id
    };
    this.applyFilter();
  }

});
Ext.define('Ozone.components.admin.user.UserEditWidgetsTab', {
    extend: 'Ozone.components.admin.grid.WidgetsTabPanel',
    alias: ['widget.usereditwidgets',
            'widget.usereditwidgetstab',
            'widget.Ozone.components.admin.user.UserEditWidgetsTab'],

    cls: 'usereditwidgetstab',
    	    
    initComponent: function () {
        //get widget to launch
        var self = this;
        Ext.applyIf(this,{
            layout: 'fit',
            itemId: 'tabWidgets',
            title: 'Widgets',
            iconCls: 'widgets-tab',
            editor: 'User',
            componentId: 'user_id',
            storeCfg: {
                api: {
                    read: '/widget',
                    create: '/user',
                    update: '/widget',
                    destroy: '/user'
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
Ext.define('Ozone.components.admin.user.UserEditPanel', {
    extend: 'Ext.panel.Panel',
    alias: ['widget.useredit','widget.usereditpanel','widget.Ozone.components.admin.user.UserEditPanel'],

    mixins: ['Ozone.components.WidgetAlerts'],

    cls: 'usereditpanel',
	
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
                domain: 'User',
                channel: 'AdminChannel',
                store: Ext.create('Ozone.data.UserStore', {}),
                items: [
                    {
                        xtype: 'usereditproperties',
                        itemId: 'usereditproperties',
                        editPanel: self
                    },
                    {
                        xtype: 'usereditgroups',
                        itemId: 'usereditgroups',
                        editPanel: self
                    },
                    {
                        xtype: 'usereditwidgets',
                        itemId: 'usereditwidgets',
                        editPanel: self
                    },
                    {
                        xtype: 'usereditdashboards',
                        itemId: 'usereditdashboards',
                        editPanel: self
                    },
                    {
                        xtype: 'usereditstacks',
                        itemId: 'usereditstacks',
                        editPanel: self
                    },
                    {
                        xtype: 'usereditpreferences',
                        itemId: 'usereditpreferences',
                        editPanel: self
                    }
                ]
            }]
        });
        this.callParent(arguments);
    }
});
