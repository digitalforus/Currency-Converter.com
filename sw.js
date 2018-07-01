const cacheName = 'v1';

// Default files to cache
let cacheFiles = [
    './',
    './index.html',
    './js/currencyAPI.js',
    './js/idb.js',
    './img/bg1.jpg',
    './img/bg2.jpg',
    './js/jquery-3.2.1.min.js',
    './css/formStyle.css'
]


//get the assets needed from the network and create a cache for them
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installed');

    // event.waitUntil Delays the event until the Promise is resolved
    event.waitUntil(

        // Open the cache
        caches.open(cacheName).then(cache => {

            // Add all the default files to the cache
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    ); // end event.waitUntil
});


//makes the new service worker become active by clearing old cache
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');

    event.waitUntil(

        // Get all the cache keys (cacheName)
        caches.keys().then(cacheNames => Promise.all(cacheNames.map(thisCacheName => {

            // If a cached item is saved under a previous cacheName
            if (thisCacheName !== cacheName) {

                // Delete that cached file
                console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                return caches.delete(thisCacheName);
            }
        })))
    ); // end event.waitUntil
});


//fetch a cached event
self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);

    // event.respondWidth Responds to the fetch event
    event.respondWith(

        // Check in cache for the request being made
        caches.match(event.request)
            .then(response => {

                // If the request is in the cache
                if (response) {
                    console.log("[ServiceWorker] Found in Cache", event.request.url, response);
                    // Return the cached version
                    return response;
                }

                // If the request is NOT in the cache, fetch and cache

                const requestClone = event.request.clone();
                return fetch(requestClone)
                    .then(response => {

                        if (!response) {
                            console.log("[ServiceWorker] No response from fetch ")
                            return response;
                        }

                        const responseClone = response.clone();

                        //  Open the cache
                        caches.open(cacheName).then(cache => {

                            // Put the fetched response in the cache
                            cache.put(event.request, responseClone);
                            console.log('[ServiceWorker] New Data Cached', event.request.url);

                            // Return the response
                            return response;

                        }); // end caches.open

                    })
                    .catch(err => {
                        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                    });


            }) // end caches.match(event.request)
    ); // end event.respondWith
});