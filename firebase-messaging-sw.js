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

/* 🔢 CONTADOR REAL DE PEDIDOS */
async function contarPedidosPendentes() {
  try {
    const res = await fetch(
      "https://firestore.googleapis.com/v1/projects/pedidos-almoxarifado/databases/(default)/documents/pedidos"
    );

    const data = await res.json();
    if (!data.documents) return 0;

    return data.documents.filter(doc =>
      doc.fields?.status?.stringValue === "Pendente"
    ).length;

  } catch (e) {
    console.error("[SW] Erro ao contar pedidos:", e);
    return 0;
  }
}

/* 🔔 PUSH EM BACKGROUND */
messaging.onBackgroundMessage(async (payload) => {
  console.log("[SW] Push recebido:", payload);

  let title = "📦 Pedidos";
  let body  = "Há novos pedidos aguardando ação.";

  if (payload.data?.type === "NOVO_PEDIDO") {
    const total = await contarPedidosPendentes();

    title = "📦 Pedidos pendentes";
    body  = total === 1
      ? "Você tem 1 pedido aguardando aprovação."
      : `Você tem ${total} pedidos aguardando aprovação.`;
  }

  if (payload.data?.type === "PEDIDO_APROVADO") {
    title = "✅ Pedido aprovado";
    body  = "Um pedido foi aprovado.";
  }

  self.registration.showNotification(title, {
    body,
    icon: "/PedidosCMCApp/icon-192.png",
    badge: "/PedidosCMCApp/icon-192.png",

    // 🔑 SEMPRE UMA ÚNICA NOTIFICAÇÃO
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
