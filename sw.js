var VER="v3";
var APP_CACHE="sopralluogo-app-"+VER;
var TILE_CACHE="sopralluogo-tiles-v1";

self.addEventListener("install",function(e){ self.skipWaiting(); });

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){
      if(k!==APP_CACHE && k!==TILE_CACHE) return caches.delete(k);
    }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch",function(e){
  var url=e.request.url;
  // Map tiles: cache-first (for offline maps)
  if(url.indexOf("tile.openstreetmap.org")>-1 || url.indexOf("server.arcgisonline.com")>-1){
    e.respondWith(caches.open(TILE_CACHE).then(function(c){
      return c.match(e.request).then(function(hit){
        return hit || fetch(e.request).then(function(r){try{c.put(e.request,r.clone())}catch(_){}return r;}).catch(function(){return hit;});
      });
    }));
    return;
  }
  // App shell: NETWORK-FIRST so an updated page is always used when online;
  // fall back to cache only when offline.
  if(e.request.method!=="GET"){ return; }
  e.respondWith(
    fetch(e.request).then(function(r){
      caches.open(APP_CACHE).then(function(c){try{c.put(e.request,r.clone())}catch(_){}});
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || (e.request.mode==="navigate" ? caches.match("./index.html") : undefined);
      });
    })
  );
});
