self.addEventListener("install", (event) => {
    // event.waitUntil(
    //     caches.open(CACHE_NAME).then((cache) => {
    //         return cache.addAll(urlsToCache);
    //     })
    // );
});
// self.addEventListener("activate", (event) => {
//     const cacheWhitelist = ["static-cache", "dynamic-cache"];

//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames.map((cacheName) => {
//                     if (!cacheWhitelist.includes(cacheName)) {
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         })
//     );
// });
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/files/workspaces") ) {
        event.respondWith(
            caches.open("dynamic-cache").then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("Serving from cache:", event.request.url);
                    } else {
                        console.log(
                            "Fetching from network:",
                            event.request.url
                        );
                    }

                    const fetchPromise = fetch(event.request).then(
                        (networkResponse) => {
                            console.log("Caching new data:", event.request.url);
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        }
                    );

                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
});
