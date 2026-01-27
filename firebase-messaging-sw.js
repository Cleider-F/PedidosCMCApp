importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCAJPyQ7-a4Efxxh5yTXQ_326hn22OYAuc",
  authDomain: "pedidos-almoxarifado.firebaseapp.com",
  projectId: "pedidos-almoxarifado",
  messagingSenderId: "443882865992",
  appId: "1:443882865992:web:1afcc37c29bd8800eedf7d"
});

const messaging = firebase.messaging();

/**
 * 🔔 PUSH EM BACKGROUND
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Push recebido:", payload);

  const title = payload.notification?.title || "Novo aviso";
  const body  = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png"
  });
});
