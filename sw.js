const CACHE_NAME = "workhours-v1";
const urlsToCache = [
	"./",
	"./index.html",
	"./style.css",
	"./app.js",
	"./icon.svg",
	"./manifest.json",
];

// Встановлення - кешуємо файли
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(urlsToCache))
			.then(() => self.skipWaiting()),
	);
});

// Активація - видаляємо старий кеш
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							return caches.delete(cacheName);
						}
					}),
				);
			})
			.then(() => self.clients.claim()),
	);
});

// Перехоплення запитів - спочатку мережа, потім кеш
self.addEventListener("fetch", (event) => {
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Якщо отримали відповідь - оновлюємо кеш
				if (response.status === 200) {
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseClone);
					});
				}
				return response;
			})
			.catch(() => {
				// Якщо немає мережі - беремо з кешу
				return caches.match(event.request);
			}),
	);
});
