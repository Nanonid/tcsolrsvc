Ext.namespace("Ozone.app");Ozone.app.App=function(b,a){Ext.apply(this,a);this.scope=b;this.addEvents({ready:true,beforeunload:true,sessionexpire:true});Ext.onReady(this.initApp,this)};Ext.extend(Ozone.app.App,Ext.util.Observable,{isReady:false,startMenu:null,modules:null,getStartConfig:Ext.emptyFn,initApp:function(){this.startConfig=this.startConfig||this.getStartConfig();this.desktop=new Ozone.layout.Desktop(this,this.scope);this.launcher=this.desktop.taskbar.startMenu;this.modules=this.getModules();if(this.modules){this.initModules(this.modules)}this.init();Ext.EventManager.on(window,"beforeunload",this.onUnload,this);this.fireEvent("ready",this);this.isReady=true},getModules:Ext.emptyFn,init:Ext.emptyFn,initModules:function(c){for(var d=0,b=c.length;d<b;d++){var a=c[d];this.launcher.add(a.launcher);a.app=this}},getModule:function(c){var b=this.getModules();for(var d=0,a=b.length;d<a;d++){if(b[d].launcher.windowId==c){b[d].app=this;return b[d]}}return""},onReady:function(b,a){if(!this.isReady){this.on("ready",b,a)}else{b.call(a,this)}},getDesktop:function(){return this.desktop},onUnload:function(a){if(this.fireEvent("beforeunload",this)===false){a.stopEvent()}}});