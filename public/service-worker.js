const e = require("express");

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/public/css/styles.css",
    "/public/js/index.js",
    "/public/js/db.js",
    "/public/icons",
    "/public/icons/icon-192x192.png",
    "/public/icons/icon-512x512.png",
    // bootstrap CSS & JS
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"


];

// cache name 
const CACHE_NAME = 'static-cache-v1';
// data cache name
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(FILES_TO_CACHE);
    })());
});


// activate

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (CACHE_NAME) {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key);
                    };

                })
            );
        })
    );
    self.clients.claim();
});


// fetch

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes("/api/") && e.request.method === "GET") {
        e.respondWith((async () => {
            const r = await caches.match(e.request);
            console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
            if (r) { return r; }
            const response = await fetch(e.request);
            const cache = await caches.open(CACHE_NAME);
            console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
        }).catch(() => {return cache.match(e.request);})
    }).catch((err) => console.log(err));   

    return;
    e.respondWith(
    caches.match(e.request).then((response) => {
        return response || fetch(e.request);
    })
});
