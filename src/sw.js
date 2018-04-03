const currentCacheName = 'v1';

self.addEventListener('install', event => {
	// precache
  event.waitUntil(
    caches.open(currentCacheName).then(cache =>
			cache.addAll([
        './log.js',
        './assets/default.json'
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
	// list current clients
	self.clients.matchAll({includeUncontrolled: true}).then(clientList => {
    console.log('SW clients:', clientList.map(client => client.url).join(', '));
  });
	// remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.
				filter(cacheName => cacheName !== currentCacheName).
				map(cacheName => caches.delete(cacheName)))
    ).then(() => self.clients.claim())
  );
});

let fromClient = null, counter = 'Not initialized yet';

self.addEventListener('fetch', event => {
	console.log('SW fetch:', event.request.method, event.request.url, event.request);
	if (/\/data\.json$/.test(event.request.url)) {
		return event.respondWith(new Response(JSON.stringify({
			text: 'I came from the service worker!',
			fromClient: fromClient,
			counter: counter,
			cache: currentCacheName
		}), {
			headers: {'content-type': 'application/json'}
		}));
	}
	if (/\/replacement\.json$/.test(event.request.url)) {
		return event.respondWith(caches.open(currentCacheName).then(cache =>
			cache.match('./assets/default.json')));
	}
	if (/\/server\.json$/.test(event.request.url)) {
		return event.respondWith(fetch(event.request).catch(() =>
			caches.open(currentCacheName).then(cache =>
				cache.match('./assets/default.json'))));
	}
	// return event.respondWith(fetch(event.request));
  event.respondWith(caches.open(currentCacheName).then(cache =>
		cache.match(event.request).then(response =>
			response || fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        return response;
      })
		).catch(() => cache.match('./assets/default.json')))
	);
});

self.addEventListener('message', event => {
	fromClient = event.source.id;
	counter = event.data;
});
