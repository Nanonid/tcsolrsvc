Ext.define("Ozone.components.focusable.CircularFocus",{focusAndPrevent:function(a,b){a.preventDefault();b.focus()},setupFocus:function(b,c,h,d){var f=this;if(!b){b=f.getEl()}if(!c){c=f.getEl()}function e(i){if(i.keyCode===Ext.EventObject.TAB&&i.shiftKey===true&&document.activeElement===f.getEl().dom){if(d){d()}f.focusAndPrevent(i,c)}}function g(i){if(i.keyCode===Ext.EventObject.TAB&&i.shiftKey===true){if(d){d()}f.focusAndPrevent(i,c)}}function a(i){if(i.keyCode===Ext.EventObject.TAB&&i.shiftKey===false){if(h){h()}f.focusAndPrevent(i,b)}}f.mon(f.getFocusEl(),{keydown:e,keypress:e});f.mon(b,{keydown:g,keypress:g});f.mon(c,{keydown:a,keypress:a});f.tearDownCircularFocus=function(){f.mun(f.getFocusEl(),{keydown:e,keypress:e});f.mun(b,{keydown:g,keypress:g});f.mun(c,{keydown:a,keypress:a})}},tearDownCircularFocus:Ext.emptyFn});