OWF=window.OWF?window.OWF:{};(function(b,a,c){OWF.IntentsContainer=function(){var e="_intents",g="_intents_receive",h={onRoute:[],onIntentsReady:[]},i={},f={};function d(o,j,n,s){var l=c;var m={send:OWF.IntentsContainer.send,addListener:OWF.IntentsContainer.addListener,removeListener:OWF.IntentsContainer.removeListener,callback:this.callback};var k=[];for(var p=0,q=h.onRoute.length;p<q;p++){var r=h.onRoute[p].fn.call(h.onRoute[p].scope,o,j,n,s,m);if(r!=null){if(l==null){l=[]}l=l.concat(r)}if(!h.onRoute[p].single){k.push(h.onRoute[p])}}h.onRoute=k;return l}return{init:function(j){f=j||{};if(f.onRoute!=null){h.onRoute=h.onRoute.concat(f.onRoute)}Ozone.eventing.Container.registerHandler(e,d);Ozone.eventing.Container.registerHandler(g,function(o,p){if(i[p]==null){i[p]={}}i[p][owfdojo.toJson(o)]=true;var l=h.onIntentsReady.slice(0);for(var m=0,k=l.length;m<k;m++){l[m].fn.call(l[m].scope,o,p);if(l[m].single){var n=h.onIntentsReady.indexOf(l[m]);if(n>-1){h.onIntentsReady.splice(n,1)}}}return true})},onRoute:function(k,j,l){this.addListener("onRoute",k,j,l)},onIntentsReady:function(k,j,l){this.addListener("onIntentsReady",k,j,l)},send:function(l,q,p,n,j){var m=[].concat(j);var o=0;for(var k=0;k<m.length;k++){if(i[m[k]]!=null&&i[m[k]][owfdojo.toJson(q)]){Ozone.eventing.Container.send(m[k],e,n,l,q,p);o++}}return o==m.length},addListener:function(l,k,j,m){if(h[l]!=null){h[l].push({fn:k,scope:j,single:m})}},removeListener:function(n,m,l){if(h[n]!=null){for(var k=0;k<h[n].length;k++){var j=h[n][k];if(j.fn==m&&j.scope==l){h[n].splice(k,1)}}}},clearListeners:function(j){if(h[j]!=null){h[j]=[]}},clearAllListeners:function(){h={onRoute:[]}}}}()}(window,document));