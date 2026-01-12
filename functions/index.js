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

    const texto = `
📦 *NOVO PEDIDO DE PEÇAS*

👤 *Solicitante:* ${p.nome}
🔧 *Manutenção:* ${p.manutencao}
🏷 *GO:* ${p.go || "-"}

🧾 *Peças:*
${p.pecas.map(x => `• ${x.descricao} (${x.quantidade})`).join("\n")}

🕒 *Data:* ${new Date().toLocaleString("pt-BR")}
`;

    const url = `https://api.telegram.org/bot${8229775934:AAEEIKF5ffP_rVvbosRilvPyb3wZ0fVBFLU}/sendMessage`;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: -1003671947511,
        text: texto,
        parse_mode: "Markdown"
      })
    });

    return null;
  });
