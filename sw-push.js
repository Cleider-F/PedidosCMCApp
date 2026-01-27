self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("message", event => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;

    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    });
  }
});
