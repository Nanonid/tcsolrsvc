Ozone=Ozone||{};Ozone.components=Ozone.components||{};Ozone.components.keys=Ozone.components.keys||{};Ozone.components.keys.createKeyEventSender=function(b){var d="_keyEvent",c=gadgets.rpc,a=c.call;c.register("_focus_widget_window",function(){try{window.focus()}catch(f){}});a("..","_widget_iframe_ready",null,b.getWidgetId());owfdojo.connect(document,"on"+Ozone.components.keys.EVENT_NAME,this,function(e){var h=Ozone.components.keys.HotKeys,f,i=false;for(var g in h){f=h[g];if(f.key===e.keyCode&&f.alt===e.altKey&&f.shift===e.shiftKey){if(f.focusParent===true){parent.focus()}a("..","_key_eventing",null,b.getWidgetId(),{keyCode:e.keyCode,altKey:e.altKey,shiftKey:e.shiftKey,focusParent:f.focusParent});i=true;break}}if(i===true){return}h=Ozone.components.keys.MoveHotKeys;for(var g in h){f=h[g];if(f.key===e.keyCode&&f.ctrl===e.ctrlKey&&f.alt===e.altKey&&f.shift===e.shiftKey){a("..","_key_eventing",null,b.getWidgetId(),{keyCode:e.keyCode,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey,focusParent:f.focusParent});break}}});owfdojo.connect(document,"onkeydown",this,function(e){var h=Ozone.components.keys.MoveHotKeys,f;for(var g in h){f=h[g];if(f.key===e.keyCode&&f.ctrl===e.ctrlKey&&f.alt===e.altKey&&f.shift===e.shiftKey){a("..","_key_eventing",null,b.getWidgetId(),{keyCode:e.keyCode,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey,keydown:true,focusParent:f.focusParent});break}}})};