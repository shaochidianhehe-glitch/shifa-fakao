# -*- coding: utf-8 -*-
"""拾法 PWA 构建脚本（仓库内正式版）
用法：python tools/build_pwa.py
作用：
  1. 扫描 index.html 中的 tiku/*.js 引用，生成 sw.js 预缓存清单（逐字一致）
  2. 生成 manifest.json（应用名/图标/主题色）
  3. 把 sw.js / manifest.json / icons/ 同步到 Desktop/shifa-fakao-v2 镜像
新增题库批次（三处注册）之后运行一次，用户下次联网打开即自动换新缓存。
"""
import re, os, json, shutil, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)                      # Desktop/拾法-github
V2   = os.path.join(os.path.dirname(REPO), "shifa-fakao-v2")

html = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
tiku = sorted(set(re.findall(r'src="(tiku/[^"]+)"', html)))
VER  = "sw-" + datetime.date.today().strftime("%Y%m%d")

missing = [t for t in tiku if not os.path.exists(os.path.join(REPO, t.split("?")[0]))]
assert not missing, f"index.html 引用了不存在的文件: {missing}"

tiku_js = ",\n  ".join(json.dumps(t) for t in tiku)

sw = f"""/* 拾法 Service Worker —— 由 tools/build_pwa.py 生成，勿手改 */
const VER   = "{VER}";
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
  {tiku_js}
];

self.addEventListener("install", e => {{
  e.waitUntil((async () => {{
    const c = await caches.open(CACHE);
    for (const u of CORE_URLS.concat(TIKU_URLS)) {{
      try {{ await c.add(u); }} catch (err) {{ console.warn("precache miss", u); }}
    }}
    await self.skipWaiting();
  }})());
}});

self.addEventListener("activate", e => {{
  e.waitUntil((async () => {{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("shifa-") && k !== CACHE)
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  }})());
}});

self.addEventListener("fetch", e => {{
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // Google Fonts 等跨域走浏览器默认缓存
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {{
      if (res && res.ok) {{
        const cl = res.clone();
        caches.open(CACHE).then(c => c.put(req, cl));
      }}
      return res;
    }}).catch(() => {{
      if (req.mode === "navigate") return caches.match("./index.html");
    }}))
  );
}});
"""

manifest = {
    "name": "拾法 · 法考修行",
    "short_name": "拾法",
    "description": "法考备考平台：真题、题库、知识点、法条词典、智能组卷，离线可用",
    "lang": "zh-CN",
    "start_url": "./index.html",
    "scope": "./",
    "display": "standalone",
    "orientation": "portrait",
    "theme_color": "#a63d2f",
    "background_color": "#f4efe3",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}

with open(os.path.join(REPO, "sw.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write(sw)
with open(os.path.join(REPO, "manifest.json"), "w", encoding="utf-8", newline="\n") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

os.makedirs(os.path.join(V2, "icons"), exist_ok=True)
shutil.copy(os.path.join(REPO, "sw.js"), os.path.join(V2, "sw.js"))
shutil.copy(os.path.join(REPO, "manifest.json"), os.path.join(V2, "manifest.json"))
for f_ in os.listdir(os.path.join(REPO, "icons")):
    shutil.copy(os.path.join(REPO, "icons", f_), os.path.join(V2, "icons", f_))

print(f"VER={VER}  tiku清单={len(tiku)}个  缺失=0")
print("sw.js / manifest.json 已生成；icons 已同步到 shifa-fakao-v2")
