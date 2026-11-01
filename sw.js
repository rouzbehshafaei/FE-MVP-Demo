/* FE Dashboard — service worker (FE MVP 1.0.4)
   کش آفلاین: صفحه از کش خوانده می‌شود و در پس‌زمینه از اینترنت به‌روز می‌شود (stale-while-revalidate).
   نسخهٔ جدید بعد از یک‌بار بستن و بازکردن برنامه فعال می‌شود. */
const VERSION = 'fe-dashboard-1.0.4';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fe-dashboard-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
    const network = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    return (await network) || new Response('آفلاین هستید و این صفحه هنوز روی دستگاه ذخیره نشده است.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
