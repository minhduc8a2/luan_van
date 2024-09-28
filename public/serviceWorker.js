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
    if (event.request.url.includes("/files")) {
        event.respondWith(
            caches.open("dynamic-cache").then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("Serving from cache:", event.request.url);
                        // Update the cache in the background
                        event.waitUntil(
                            fetch(event.request)
                                .then((networkResponse) => {
                                    console.log(
                                        "Updating cache:",
                                        event.request.url
                                    );
                                    cache.put(
                                        event.request,
                                        networkResponse.clone()
                                    );
                                })
                                .catch((err) => {
                                    console.error("Failed to fetch:", err);
                                })
                        );
                        return cachedResponse;
                    } else {
                        console.log(
                            "Fetching from network:",
                            event.request.url
                        );
                        return fetch(event.request)
                            .then((networkResponse) => {
                                console.log(
                                    "Caching new data:",
                                    event.request.url
                                );
                                cache.put(
                                    event.request,
                                    networkResponse.clone()
                                );
                                return networkResponse;
                            })
                            .catch((err) => {
                                console.error("Network fetch failed:", err);
                            });
                    }
                });
            })
        );
    } else if (event.request.url.includes("/storage")) {
        event.respondWith(
            caches.open("static-cache").then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("Serving from cache:", event.request.url);
                        return cachedResponse;
                    } else {
                        return fetch(event.request)
                            .then((networkResponse) => {
                                console.log(
                                    "Caching new data:",
                                    event.request.url
                                );
                                cache.put(
                                    event.request,
                                    networkResponse.clone()
                                );
                                return networkResponse;
                            })
                            .catch((err) => {
                                console.error("Network fetch failed:", err);
                            });
                    }
                });
            })
        );
    }
});
