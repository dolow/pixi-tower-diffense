const VERSION = 1;
const CACHE_NAME = `cache-${VERSION}`;

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return fetch(event.request);
  }
console.log(event);
  const response = caches.open(CACHE_NAME).then((cache) => {
    return cache.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }
    });
  })

  event.respondWith(response);
});
