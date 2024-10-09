
self.addEventListener("fetch", (event) => {
   
    if (event.request.url.includes("/storage")) {
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
