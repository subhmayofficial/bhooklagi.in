// Minimal Service Worker to enable PWA installability

self.addEventListener("install", (event) => {
  console.log("[SW] Install Event Processing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activate Event Processing");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch to fulfill PWA requirement
  // We can add advanced caching later if needed
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push Received.");
  let title = "Bhook Lagi?";
  let options = {
    body: "You have a new message.",
    icon: "/favicon_io/android-chrome-192x192.png",
    badge: "/favicon_io/android-chrome-192x192.png"
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      options.body = payload.body || options.body;
      if (payload.icon) options.icon = payload.icon;
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
