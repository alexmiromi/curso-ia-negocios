var CACHE = 'ia-negocios-v2';
var ASSETS = ['./','index.html','app.css','app.js','conteudo.js','widgets.js','manifest.webmanifest',
  'icons/icon-192.png','icons/icon-512.png','icons/icon-180.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        var copia=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        return res;
      }).catch(function(){ return caches.match('index.html'); });
    })
  );
});
