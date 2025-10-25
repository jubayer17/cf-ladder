// public/sw.js
const CACHE_NAME = "cf-cache-v1";
const PROBLEMS_URL = "/api/problems";

self.addEventListener("install", (ev) => {
  ev.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  try {
    const url = new URL(req.url);

    // Intercept same-origin GET /api/problems only
    if (req.method === "GET" && url.pathname === PROBLEMS_URL) {
      ev.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
          const cached = await cache.match(req);
          if (cached) {
            // background refresh (don't block)
            ev.waitUntil(
              fetch(req)
                .then((networkResp) => {
                  if (networkResp && networkResp.ok) {
                    cache.put(req, networkResp.clone()).catch(() => {});
                  }
                })
                .catch(() => {})
            );
            return cached;
          }

          // no cache: fetch and cache
          try {
            const net = await fetch(req);
            if (net && net.ok) {
              cache.put(req, net.clone()).catch(() => {});
            }
            return net;
          } catch (err) {
            // if network fails, return 503 JSON fallback
            return new Response(JSON.stringify({ error: "offline" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          }
        })
      );
      return;
    }
  } catch (e) {
    // if URL constructor fails, continue with default fetch
  }

  // default: passthrough
  return;
});
