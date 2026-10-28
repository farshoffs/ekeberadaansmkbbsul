// Retire the previous Google Sheets PWA service worker.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys=await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('eke-static-')).map(k => caches.delete(k)));
    await self.registration.unregister();
    const tabs=await self.clients.matchAll({type:'window'});
    tabs.forEach(tab => tab.navigate(tab.url).catch(() => {}));
  })());
});
