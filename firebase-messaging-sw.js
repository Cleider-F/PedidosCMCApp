importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

/* 🔥 Firebase */
firebase.initializeApp({
  apiKey: "AIzaSyCAJPyQ7-a4Efxxh5yTXQ_326hn22OYAuc",
  authDomain: "pedidos-almoxarifado.firebaseapp.com",
  projectId: "pedidos-almoxarifado",
  messagingSenderId: "443882865992",
  appId: "1:443882865992:web:1afcc37c29bd8800eedf7d"
});

const messaging = firebase.messaging();

/* 🔔 PUSH EM BACKGROUND */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Push recebido:", payload);

  const title = payload.notification?.title || "Novo aviso";
  const body  = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/PedidosCMCApp/icon-192.png",
    badge: "/PedidosCMCApp/icon-192.png",

    // 🔑 ISSO É O MAIS IMPORTANTE
    data: {
      url: payload.data?.url || "/PedidosCMCApp/admin.html"
    }
  });
});

/* 👉 CLIQUE NA NOTIFICAÇÃO */
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url = event.notification.data?.url || "/PedidosCMCApp/admin.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {

        // 🔹 Se já existir uma aba aberta, apenas foca
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }

        // 🔹 Senão, abre uma nova aba
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
