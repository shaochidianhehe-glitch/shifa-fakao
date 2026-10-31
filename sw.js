/* 拾法 Service Worker —— 由 tools/build_pwa.py 生成，勿手改 */
const VER   = "sw-20261101";
const CACHE = "shifa-" + VER;
const CORE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png"
];
const TIKU_URLS = [
  "tiku/al031.js?v=20260907e",
  "tiku/al032.js?v=20260907e",
  "tiku/al033.js?v=20260907e",
  "tiku/fc002.js?v=20260907e",
  "tiku/fc003.js?v=20260907e",
  "tiku/fc004.js?v=20260907e",
  "tiku/fc005.js?v=20260907e",
  "tiku/fc006.js?v=20260907e",
  "tiku/fc007.js?v=20260907e",
  "tiku/fc008.js?v=20260907e",
  "tiku/fc009.js?v=20260907e",
  "tiku/ft035.js?v=20260907e",
  "tiku/ft036.js?v=20260907e",
  "tiku/ft037.js?v=20260907e",
  "tiku/ftz038.js?v=20260907e",
  "tiku/ftz039.js?v=20260907e",
  "tiku/mn034.js?v=20260907e",
  "tiku/qb010.js?v=20260907e",
  "tiku/qb011.js?v=20260907e",
  "tiku/qb012.js?v=20260907e",
  "tiku/qb013.js?v=20260907e",
  "tiku/qb014.js?v=20260907e",
  "tiku/qb015.js?v=20260907e",
  "tiku/qb016.js?v=20260907e",
  "tiku/qb017.js?v=20260907e",
  "tiku/qb018.js?v=20260907e",
  "tiku/qb019.js?v=20260907e",
  "tiku/qb020.js?v=20260907e",
  "tiku/qb021.js?v=20260907e",
  "tiku/qb022.js?v=20260907e",
  "tiku/qb023.js?v=20260907e",
  "tiku/qb024.js?v=20260907e",
  "tiku/qb025.js?v=20260907e",
  "tiku/qb026.js?v=20260907e",
  "tiku/qb027.js?v=20260907e",
  "tiku/qb028.js?v=20260907e",
  "tiku/qb029.js?v=20260907e",
  "tiku/qz030.js?v=20260907e",
  "tiku/tk062.js?v=20260907e",
  "tiku/tk063.js?v=20260907e",
  "tiku/tk064.js?v=20260907e",
  "tiku/tk065.js?v=20260907e",
  "tiku/tk066.js?v=20260907e",
  "tiku/tk067.js?v=20260907e",
  "tiku/tk068.js?v=20260907e",
  "tiku/tk069.js?v=20260907e",
  "tiku/tk070.js?v=20260907e",
  "tiku/tk071.js?v=20260907e",
  "tiku/tk072.js?v=20260907e",
  "tiku/tk073.js?v=20260907e",
  "tiku/tk074.js?v=20260907e",
  "tiku/tk075.js?v=20260907e",
  "tiku/tk076.js?v=20260907e",
  "tiku/tk077.js?v=20260907e",
  "tiku/tk078.js?v=20260907e",
  "tiku/tk079.js?v=20260907e",
  "tiku/tk080.js?v=20260907e",
  "tiku/tk081.js?v=20260907e",
  "tiku/tk082.js?v=20260907e",
  "tiku/tk083.js?v=20260907e",
  "tiku/tk084.js?v=20260907e",
  "tiku/tk085.js?v=20260922a",
  "tiku/zg000.js?v=20260907e",
  "tiku/zg001.js?v=20260907e",
  "tiku/zg002.js?v=20261018",
  "tiku/zs052.js?v=20260907e",
  "tiku/zs053.js?v=20260907e",
  "tiku/zs054.js?v=20260907e",
  "tiku/zs055.js?v=20260907e",
  "tiku/zs056.js?v=20260907e",
  "tiku/zs057.js?v=20260907e",
  "tiku/zs058.js?v=20260907e",
  "tiku/zs059.js?v=20260907e",
  "tiku/zs060.js?v=20260907e",
  "tiku/zs061.js?v=20260907e",
  "tiku/zt040.js?v=20260907e",
  "tiku/zt041.js?v=20260907e",
  "tiku/zt042.js?v=20260907e",
  "tiku/zt043.js?v=20260907e",
  "tiku/zt044.js?v=20260907e",
  "tiku/zt045.js?v=20260907e",
  "tiku/zt046.js?v=20260907e",
  "tiku/zt047.js?v=20260907e",
  "tiku/zt048.js?v=20260907e",
  "tiku/zt049.js?v=20260907e",
  "tiku/zt050.js?v=20260907e",
  "tiku/zt051.js?v=20260907e"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of CORE_URLS.concat(TIKU_URLS)) {
      try { await c.add(u); } catch (err) { console.warn("precache miss", u); }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("shifa-") && k !== CACHE)
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // Google Fonts 等跨域走浏览器默认缓存
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const cl = res.clone();
        caches.open(CACHE).then(c => c.put(req, cl));
      }
      return res;
    }).catch(() => {
      if (req.mode === "navigate") return caches.match("./index.html");
    }))
  );
});
