const CACHE_NAME =  "microlearning-v4";

const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/pages/contact.html",
    "/pages/history.html",
    "/css/materialize.min.css",
    "/js/ui.js",
    "/js/materialize.min.js",
    "/images/background.jpg",
    "/images/history.jpg",
    "/images/icons/book.png",
    "/images/contact.jpg",
];

self.addEventListener("install", (event) => {
  console.log("Service worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service worker: caching files");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("service Worker: Deleting old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async function () {
      if (event.request.method !== "GET") {
        return fetch(event.request);
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error("Fetch failed, returning offline page:", error);
      }
    })()
  );
});
