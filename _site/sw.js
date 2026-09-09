const CACHE='eke-static-80fda4d26468';
const ASSETS=["./","./index.html","./manifest.webmanifest","./assets/logo.8a416c3282a0.png","./vendor/bootstrap/bootstrap.min.css","./vendor/bootstrap/bootstrap.bundle.min.js","./assets/app.b559a2dd0360.css","./assets/mobile.78594d89e027.css","./assets/config.293736670e5c.js","./assets/gas-shim.1f295770fbe0.js","./assets/runtime.768618465b1f.js","./assets/core.715bff83645a.js","./assets/attendance.e56d410a1d66.js","./assets/absence.4477882a1342.js","./assets/admin.485ced46e2b9.js","./assets/exports.98f10f271201.js"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('eke-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==self.location.origin)return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res;}).catch(()=>caches.match('./index.html')));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
