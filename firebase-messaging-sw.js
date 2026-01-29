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

  const type       = payload.data?.type;
  const pendentes  = Number(payload.data?.pendentes || 0);
  const aprovados  = Number(payload.data?.aprovados || 0);

  let title = "🔔 Atualização";
  let body  = "Há novas atualizações.";

  if (type === "NOVO_PEDIDO") {
    title = "📦 Pedidos pendentes";

    body = pendentes === 1
      ? "Você tem 1 pedido aguardando aprovação."
      : `Você tem ${pendentes} pedidos aguardando aprovação.`;
  }

  if (type === "PEDIDO_APROVADO") {
    title = "📦 Pedidos aguardando reserva";

    body = aprovados === 1
      ? "Você tem 1 pedido aprovado aguardando reserva."
      : `Você tem ${aprovados} pedidos aprovados aguardando reserva.`;
  }

  if (type === "PEDIDO_RESERVADO") {
    title = "📦 Reserva confirmada";

    body =
      `Pendentes: ${pendentes} • Aguardando reserva: ${aprovados}`;
  }

  self.registration.showNotification(title, {
    body,
    icon: "/PedidosCMCApp/icon-192.png",
    badge: "/PedidosCMCApp/icon-192.png",

    tag: "pedidos",
    renotify: true,

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
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
