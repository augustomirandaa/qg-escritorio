import "dotenv/config";
import express from "express";
import type { ZApiWebhookPayload, Conversation } from "./types";
import { sendText, fetchChats, fetchMessages } from "./zapi";
import { analyzeMessage, suggestReply } from "./agent";
import { loadConversations, saveConversations } from "./persistence";

const app = express();
app.use(express.json());

// CORS — permite o virtual office (porta 3000/3100) buscar os dados
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Preflight CORS para POST com JSON
app.options("*", (_req, res) => { res.status(204).send(""); });

// Conversas persistidas em disco (carregadas na inicialização)
const conversations = loadConversations();

const RENAN_PHONE = process.env.HANDOFF_PHONE ?? "";

// ─── Webhook Z-API ────────────────────────────────────────────────────────────
app.post("/webhook/zapi", async (req, res) => {
  res.status(200).json({ ok: true });

  const payload = req.body as ZApiWebhookPayload;

  if (payload.fromMe || payload.isGroup) return;
  if (!payload.text?.message) return;

  const phone = payload.phone;
  const text = payload.text.message.trim();
  const name = payload.senderName ?? phone;

  let conv = conversations.get(phone);
  if (!conv) {
    conv = {
      phone,
      name,
      messages: [],
      firstAt: Date.now(),
      lastAt: Date.now(),
      renanAlerted: false,
    };
    conversations.set(phone, conv);
  }

  conv.lastAt = Date.now();
  conv.messages.push({ role: "user", content: text, at: Date.now() });
  saveConversations(conversations);

  // Analisa com Claude e alerta Renan se necessário
  try {
    const alert = await analyzeMessage(conv, text);
    if (alert && RENAN_PHONE) {
      conv.renanAlerted = true;
      conv.lastAlert = alert;
      saveConversations(conversations);
      await sendText(RENAN_PHONE, `🔔 *Primordialle — Lead ativo*\n\n${alert}`);
    }
  } catch (err) {
    console.error("[webhook] erro ao analisar mensagem:", err);
  }
});

// ─── Enviar mensagem (Renan responde pelo dashboard) ─────────────────────────
app.post("/send", async (req, res) => {
  const { phone, text } = req.body as { phone?: string; text?: string };
  if (!phone || !text?.trim()) {
    res.status(400).json({ ok: false, error: "phone e text obrigatórios" });
    return;
  }
  const conv = conversations.get(phone);
  if (!conv) {
    // Cria conversa se não existir (para iniciar contato)
    const newConv = {
      phone,
      name: phone,
      messages: [],
      firstAt: Date.now(),
      lastAt: Date.now(),
      renanAlerted: false,
    };
    conversations.set(phone, newConv);
  }
  const c = conversations.get(phone)!;
  try {
    await sendText(phone, text.trim());
    c.messages.push({ role: "assistant", content: text.trim(), at: Date.now() });
    c.lastAt = Date.now();
    saveConversations(conversations);
    res.json({ ok: true });
  } catch (err) {
    console.error("[send] erro:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── Sugestão de resposta por IA ─────────────────────────────────────────────
app.post("/suggest", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone) {
    res.status(400).json({ ok: false, error: "phone obrigatório" });
    return;
  }
  const conv = conversations.get(phone);
  if (!conv) {
    res.status(404).json({ ok: false, error: "conversa não encontrada" });
    return;
  }
  try {
    const suggestion = await suggestReply(conv);
    res.json({ ok: true, suggestion });
  } catch (err) {
    console.error("[suggest] erro:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── Listar conversas (pra dashboard) ────────────────────────────────────────
app.get("/conversations", (_req, res) => {
  const list = Array.from(conversations.values()).map((c) => ({
    phone: c.phone,
    name: c.name,
    messageCount: c.messages.length,
    lastMessage: c.messages.at(-1)?.content ?? "",
    lastAt: c.lastAt,
    firstAt: c.firstAt,
    renanAlerted: c.renanAlerted,
    lastAlert: c.lastAlert ?? null,
    messages: c.messages.map((m, i) => ({
      id: `${c.phone}-${i}`,
      at: m.at,
      content: m.content,
      role: m.role,
    })),
  }));

  // Ordena pela mais recente primeiro
  list.sort((a, b) => b.lastAt - a.lastAt);

  res.json({ ok: true, conversations: list, total: list.length });
});

// ─── Sincronizar histórico completo da Z-API ──────────────────────────────────
app.post("/sync", async (_req, res) => {
  try {
    console.log("[sync] iniciando importação de histórico...");
    const chats = await fetchChats();
    console.log(`[sync] ${chats.length} chats encontrados`);

    let imported = 0;
    let skipped = 0;

    for (const chat of chats) {
      const phone = chat.phone;

      // Busca mensagens deste chat (pode retornar [] em instâncias multi-device)
      const msgs = await fetchMessages(phone);

      // Pega ou cria a conversa — mesmo sem mensagens, o contato deve aparecer
      let conv = conversations.get(phone);
      if (!conv) {
        conv = {
          phone,
          name: chat.name ?? phone,
          messages: [],
          firstAt: chat.lastMessageTime ?? Date.now(),
          lastAt: chat.lastMessageTime ?? Date.now(),
          renanAlerted: false,
        };
        conversations.set(phone, conv);
      }

      // Filtra só mensagens de texto
      const textMsgs = msgs.filter((m) => m.text?.message && !m.isGroup);
      if (textMsgs.length === 0) {
        // Sem histórico de mensagens (multi-device ou chat vazio) —
        // o stub já foi criado acima, conta como importado
        imported++;
        continue;
      }

      // Constrói set dos IDs já existentes (evita duplicatas)
      const existingSet = new Set(conv.messages.map((m) => m.at));

      // Adiciona mensagens novas ordenadas por tempo
      const sorted = textMsgs.sort((a, b) => a.momment - b.momment);
      for (const m of sorted) {
        if (existingSet.has(m.momment)) continue; // já existe
        conv.messages.push({
          role: m.fromMe ? "assistant" : "user",
          content: m.text!.message,
          at: m.momment,
        });
      }

      // Reordena por timestamp (mistura webhook + histórico)
      conv.messages.sort((a, b) => a.at - b.at);

      // Atualiza metadados
      if (conv.messages.length > 0) {
        conv.firstAt = conv.messages[0].at;
        conv.lastAt = conv.messages[conv.messages.length - 1].at;
      }
      if (chat.name && chat.name !== phone) conv.name = chat.name;

      imported++;
    }

    saveConversations(conversations);
    console.log(`[sync] concluído: ${imported} importados, ${skipped} ignorados`);

    res.json({
      ok: true,
      imported,
      skipped,
      total: conversations.size,
    });
  } catch (err) {
    console.error("[sync] erro:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    conversations: conversations.size,
    alertsSent: Array.from(conversations.values()).filter((c) => c.renanAlerted).length,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3200;
app.listen(PORT, () => {
  console.log(`[whatsapp-mcp] rodando em http://localhost:${PORT}`);
  console.log(`  Webhook:       POST /webhook/zapi`);
  console.log(`  Conversas:     GET  /conversations`);
  console.log(`  Health:        GET  /health`);
});
