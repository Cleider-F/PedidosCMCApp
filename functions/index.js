const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

const TELEGRAM_TOKEN = "8229775934:AAEEIKF5ffP_rVvbosRilvPyb3wZ0fVBFLU";
const CHAT_ID = "-1003671947511";

/**
 * 📦 Notificação de novo pedido (Telegram + Push)
 */
exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    const p = snap.data();

    if (!p) {
      return null;
    }

    /* ======================
       1️⃣ TELEGRAM
    ====================== */

    const listaPecas = Array.isArray(p.pecas)
      ? p.pecas
          .map((x) => `• ${x.descricao} (${x.quantidade})`)
          .join("\n")
      : "—";

    const texto = `
📦 *NOVO PEDIDO DE PEÇAS*

👤 *Solicitante:* ${p.nome || "-"}
🔧 *Manutenção:* ${p.manutencao || "-"}
🏷 *GO:* ${p.go || "-"}

🧾 *Peças:*
${listaPecas}

🕒 *Data:* ${new Date().toLocaleString("pt-BR")}
`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: texto,
        parse_mode: "Markdown",
      }),
    });

    /* ======================
       2️⃣ PUSH NOTIFICATION
    ====================== */

    const adminsSnap = await db
      .collection("usuarios")
      .where("perfil", "==", "admin")
      .get();

    const tokens = [];

    adminsSnap.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (!tokens.length) {
      return null;
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: "📦 Novo pedido de peças",
        body: `${p.nome || "Usuário"} solicitou ${
          Array.isArray(p.pecas) ? p.pecas.length : 0
        } item(ns)`,
      },
      data: {
        tipo: "novo_pedido",
        pedidoId: context.params.pedidoId,
      },
    });

    /* ======================
       3️⃣ LIMPAR TOKENS INVÁLIDOS
    ====================== */

    const tokensInvalidos = [];

    response.responses.forEach((r, i) => {
      if (!r.success) {
        tokensInvalidos.push(tokens[i]);
      }
    });

    if (tokensInvalidos.length) {
      const snapTokens = await db
        .collection("usuarios")
        .where("perfil", "==", "admin")
        .get();

      const batch = db.batch();

      snapTokens.forEach((doc) => {
        const data = doc.data();
        if (!Array.isArray(data.fcmTokens)) {
          return;
        }

        const tokensValidos = data.fcmTokens.filter(
          (t) => !tokensInvalidos.includes(t),
        );

        if (tokensValidos.length !== data.fcmTokens.length) {
          batch.update(doc.ref, { fcmTokens: tokensValidos });
        }
      });

      await batch.commit();
    }

    return null;
  });
