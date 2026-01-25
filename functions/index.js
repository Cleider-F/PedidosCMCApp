const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");
const fetch = require("node-fetch");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

const TELEGRAM_TOKEN = "8229775934:AAEEIKF5ffP_rVvbosRilvPyb3wZ0fVBFLU";
const CHAT_ID = "-1003671947511";

/* ======================================================
   TELEGRAM – NOVO PEDIDO
====================================================== */
exports.notificarNovoPedido = onDocumentCreated(
  {
    document: "pedidos/{pedidoId}",
    region: "southamerica-east1"
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const p = snap.data();

    const texto = `
📦 *NOVO PEDIDO DE PEÇAS*

👤 *Solicitante:* ${p.nome || "-"}
🔧 *Manutenção:* ${p.manutencao || "-"}
🏷 *GO:* ${p.go || "-"}

🧾 *Peças:*
${Array.isArray(p.pecas)
  ? p.pecas.map(x => `• ${x.descricao} (${x.quantidade})`).join("\n")
  : "-"}
`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: texto,
        parse_mode: "Markdown"
      })
    });
  }
);

/* ======================================================
   PUSH – NOVO PEDIDO
====================================================== */
/*exports.pushNovoPedido = onDocumentCreated(
  {
    document: "pedidos/{pedidoId}",
    region: "southamerica-east1"
  },
  async () => {
    const snap = await db.collection("admin_push_tokens").get();
    if (snap.empty) return;

    const tokens = [];

    snap.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (!tokens.length) return;

    await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: "📦 Novo pedido",
        body: "Um novo pedido foi criado no sistema"
      }
    });
  }
);
*/
/* ======================================================
   PUSH – STATUS DO PEDIDO
====================================================== */
/*exports.pushStatusPedido = onDocumentUpdated(
  {
    document: "pedidos/{pedidoId}",
    region: "southamerica-east1"
  },
  async (event) => {
    const antes = event.data.before.data();
    const depois = event.data.after.data();

    if (!antes || !depois) return;
    if (antes.status === depois.status) return;

    const snap = await db.collection("admin_push_tokens").get();
    if (snap.empty) return;

    const tokens = [];

    snap.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (!tokens.length) return;

    await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: `📋 Pedido ${depois.status}`,
        body: `Pedido de ${depois.nome || "-"}`
      }
    });*/
  }
);

