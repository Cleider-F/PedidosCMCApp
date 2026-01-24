const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

const TELEGRAM_TOKEN = "8229775934:AAEEIKF5ffP_rVvbosRilvPyb3wZ0fVBFLU";
const CHAT_ID = "-1003671947511";

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {

    const p = snap.data();
    if (!p) return null;

    /* ======================
       1️⃣ TELEGRAM
    ====================== */

    const texto = `
📦 *NOVO PEDIDO DE PEÇAS*

👤 *Solicitante:* ${p.nome}
🔧 *Manutenção:* ${p.manutencao}
🏷 *GO:* ${p.go || "-"}

🧾 *Peças:*
${p.pecas.map(x => `• ${x.descricao} (${x.quantidade})`).join("\n")}

🕒 *Data:* ${new Date().toLocaleString("pt-BR")}
`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: texto,
        parse_mode: "Markdown"
      })
    });

    /* ======================
       2️⃣ PUSH NOTIFICATION
    ====================== */

    // Buscar tokens dos admins
    const adminsSnap = await admin.firestore()
      .collection("usuarios")
      .where("perfil", "==", "admin")
      .get();

    const tokens = [];

    adminsSnap.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (tokens.length === 0) return null;

    const payload = {
      notification: {
        title: "Novo pedido de peças",
        body: `${p.nome} solicitou ${p.pecas.length} item(ns)`
      },
      data: {
        tipo: "novo_pedido",
        pedidoId: context.params.pedidoId
      }
    };

    const response = await admin.messaging().sendToDevice(tokens, payload);

    // Limpar tokens inválidos
    const tokensInvalidos = [];
    response.results.forEach((result, index) => {
      if (result.error) {
        const code = result.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          tokensInvalidos.push(tokens[index]);
        }
      }
    });

    // (Opcional) remover tokens inválidos do Firestore
    // Recomendo fazer depois, se quiser eu implemento

    return null;
  });
