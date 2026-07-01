var CACHE_NAME = "my-recipes-v1";
var APP_ASSETS = [
  "./",
  "./index.html",
  "./add.html",
  "./detail.html",
  "./pantry.html",
  "./can-cook.html",
  "./css/styles.css",
  "./js/storage.js",
  "./js/app.js",
  "./js/index.js",
  "./js/add.js",
  "./js/detail.js",
  "./js/pantry.js",
  "./js/can-cook.js",
  "./manifest.json",
  "./assets/placeholder.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        var responseClone = response.clone();

        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
