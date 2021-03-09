const FILES_TO_CACHE = [
    "./js/idb.js",
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/db.js",
    "./icons",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "./manifest.json",
    // bootstrap CSS & JS
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"


];

// customized 
const VERSION = "-version_01";
const APP_NAME = "MyBudgetTracker"
const DATA_NAME = "TransactionData"
// cache & data name
const CACHE_NAME = APP_NAME + VERSION;
const DATA_CACHE_NAME = DATA_NAME + VERSION;

// install

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// activate

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
                return Promise.all(keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key)
                    }
                }))
            })
            
    );
    self.clients.claim();
});

// fetch

self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(e.request).then((response) => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch((err) => {
                        return cache.match(e.request);
                    });
                })
                .catch((err) => console.log(err))   
        );
        return;
    }


    e.respondWith(
        fetch(e.request).catch(function () {
            return caches.match(e.request).then(function (cachedRes) {
                if (cachedRes) {
                    return cachedRes;
                } else if (e.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                }
            });
        })
        
    );

});
