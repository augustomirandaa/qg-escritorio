// =============================================================================
// WHATSAPP TAB — chat estilo WhatsApp com envio via Z-API e sugestão por IA
// =============================================================================
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useVOStore } from "../store";
import { WHATSAPP_THREADS, type WhatsAppThread } from "../connections";

// ─── Config ──────────────────────────────────────────────────────────────────
const WA_ZAPI_URL = "http://177.7.45.10:3200";   // Primordialle (Z-API)
const WA_META_URL = "http://177.7.45.10:3202";   // Aesthetica (Meta Cloud API)
const META_PROJECT_ID = "D";
const POLL_INTERVAL_MS = 10_000;

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface LiveMessage {
  id: string;
  at: number;
  content: string;
  role?: "user" | "assistant"; // user=lead, assistant=Renan/IA
}
interface LiveConv {
  phone: string;
  name: string;
  messageCount: number;
  lastMessage: string;
  lastAt: number;
  firstAt: number;
  renanAlerted: boolean;
  lastAlert: string | null;
  messages: LiveMessage[];
}
type FetchState = "idle" | "loading" | "ok" | "error";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min atrás`;
  if (diff < 86_400_000)
    return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function fmtPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 13) return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 5)} ${d.slice(5, 9)}-${d.slice(9)}`;
  return `+${d}`;
}
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Hook de polling ──────────────────────────────────────────────────────────
function useLiveConversations(mcpUrl: string) {
  const [convs, setConvs] = useState<LiveConv[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [lastSync, setLastSync] = useState<number | null>(null);

  const doFetch = useCallback(async () => {
    setState((s) => (s === "idle" ? "loading" : s));
    try {
      const res = await window.fetch(`${mcpUrl}/conversations`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConvs(data.conversations ?? []);
      setState("ok");
      setLastSync(Date.now());
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [doFetch]);

  // Atualização otimista — adiciona mensagem enviada antes do próximo poll
  const addSentMessage = useCallback((phone: string, text: string) => {
    setConvs((prev) =>
      prev.map((c) =>
        c.phone === phone
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `opt-${Date.now()}`, at: Date.now(), content: text, role: "assistant" as const },
              ],
              lastMessage: text,
              lastAt: Date.now(),
              messageCount: c.messageCount + 1,
            }
          : c,
      ),
    );
  }, []);

  return { convs, state, lastSync, refresh: doFetch, addSentMessage };
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export function WhatsAppTab() {
  const projectId = useVOStore((s) => s.currentProjectId);
  const mcpUrl = projectId === META_PROJECT_ID ? WA_META_URL : WA_ZAPI_URL;
  const provider = projectId === META_PROJECT_ID ? "meta" : "zapi";
  return <LiveMonitor mcpUrl={mcpUrl} provider={provider} />;
}

// ─── Monitor ao vivo (primordialle-oral) ─────────────────────────────────────
function LiveMonitor({ mcpUrl, provider }: { mcpUrl: string; provider: "zapi" | "meta" }) {
  const { convs, state, lastSync, refresh, addSentMessage } = useLiveConversations(mcpUrl);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await window.fetch(`${mcpUrl}/sync`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setSyncResult(`✓ ${data.imported} conversas importadas`);
        await refresh();
      } else {
        setSyncResult(`⚠️ ${data.error}`);
      }
    } catch {
      setSyncResult("⚠️ Falha ao conectar com MCP");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  }

  useEffect(() => {
    if (!selectedPhone && convs.length > 0) setSelectedPhone(convs[0].phone);
  }, [convs, selectedPhone]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return convs;
    return convs.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.phone.includes(t) ||
        c.lastMessage.toLowerCase().includes(t),
    );
  }, [convs, q]);

  const selected = convs.find((c) => c.phone === selectedPhone) ?? null;
  const alertCount = convs.filter((c) => c.renanAlerted).length;

  return (
    <div className="vo-wa-shell">
      {/* ── Sidebar de contatos ── */}
      <aside className="vo-wa-contacts">
        {/* Cabeçalho */}
        <div className="vo-wa-contacts-head">
          <div className="vo-wa-contacts-title">
            <span>WhatsApp {provider === "meta" ? "· Meta" : "· Z-API"}</span>
            <span className="vo-wa-live-dot">
              <span />
              ao vivo
            </span>
          </div>
          <div className="vo-wa-contacts-stats">
            <span title="Leads">{convs.length} 💬</span>
            {alertCount > 0 && <span title="Alertas" style={{ color: "#d97706" }}>🔔 {alertCount}</span>}
            <button onClick={refresh} className="vo-wa-refresh-btn" title="Atualizar agora">
              ↻ {lastSync ? fmtTime(lastSync) : "—"}
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="vo-wa-refresh-btn"
              title="Importar histórico completo do WhatsApp"
              style={{ background: syncing ? undefined : "#ede9fe", color: "#6d28d9" }}
            >
              {syncing ? "⏳" : "↓ histórico"}
            </button>
          </div>
          {syncResult && (
            <div style={{ fontSize: 11, padding: "4px 14px", background: "#f0fdf4", color: "#166534", borderTop: "1px solid #bbf7d0" }}>
              {syncResult}
            </div>
          )}
        </div>

        {/* Busca */}
        <div className="vo-wa-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contato…"
          />
        </div>

        {/* Lista de conversas */}
        <div className="vo-wa-contact-list">
          {state === "loading" && convs.length === 0 && (
            <div className="vo-wa-contact-empty">Conectando…</div>
          )}
          {state === "error" && convs.length === 0 && (
            <div className="vo-wa-contact-empty" style={{ color: "#e53e3e" }}>
              MCP offline
              <button onClick={refresh} style={{ display: "block", marginTop: 6, fontSize: 11 }}>Tentar novamente</button>
            </div>
          )}
          {state === "ok" && convs.length === 0 && (
            <div className="vo-wa-contact-empty">Aguardando mensagens…</div>
          )}
          {filtered.map((c) => {
            const isActive = c.phone === selectedPhone;
            const displayName = c.name !== c.phone ? c.name : fmtPhone(c.phone);
            return (
              <button
                key={c.phone}
                className={`vo-wa-contact-item ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedPhone(c.phone)}
              >
                <div className="vo-wa-contact-avatar">
                  {initials(displayName)}
                </div>
                <div className="vo-wa-contact-info">
                  <div className="vo-wa-contact-row">
                    <span className="vo-wa-contact-name">{displayName}</span>
                    <span className="vo-wa-contact-time">{fmtTime(c.lastAt)}</span>
                  </div>
                  <div className="vo-wa-contact-row">
                    <span className="vo-wa-contact-preview">{c.lastMessage || "—"}</span>
                    {c.renanAlerted && (
                      <span className="vo-wa-contact-alert" title="Renan foi alertado">🔔</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Área do chat ── */}
      <div className="vo-wa-chat-area">
        {selected ? (
          <ChatView
            conv={selected}
            onRefresh={refresh}
            onSentMessage={addSentMessage}
            mcpUrl={mcpUrl}
          />
        ) : (
          <div className="vo-wa-chat-empty">
            {state === "error" ? (
              <>
                <div style={{ fontSize: 40 }}>⚠️</div>
                <h3>MCP offline</h3>
                <p>Não foi possível conectar em <code>{mcpUrl}</code></p>
                <button onClick={refresh} className="vo-btn vo-btn-mini" style={{ marginTop: 12 }}>
                  Tentar novamente
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40 }}>💬</div>
                <h3>Selecione uma conversa</h3>
                <p>As mensagens do WhatsApp de Renan aparecem aqui em tempo real.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat de uma conversa ─────────────────────────────────────────────────────
function ChatView({
  conv,
  onRefresh,
  onSentMessage,
  mcpUrl,
}: {
  conv: LiveConv;
  onRefresh: () => void;
  onSentMessage: (phone: string, text: string) => void;
  mcpUrl: string;
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll ao receber mensagens novas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages.length]);

  // Limpa erro de envio após 4s
  useEffect(() => {
    if (!sendError) return;
    const t = setTimeout(() => setSendError(null), 4000);
    return () => clearTimeout(t);
  }, [sendError]);

  const displayName = conv.name !== conv.phone ? conv.name : fmtPhone(conv.phone);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setSendError(null);
    // Otimista — mostra imediatamente
    onSentMessage(conv.phone, trimmed);
    setInput("");
    setSuggestion(null);
    inputRef.current?.focus();
    try {
      const res = await window.fetch(`${mcpUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: conv.phone, text: trimmed }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSendError(d.error ?? `HTTP ${res.status}`);
      }
      // Atualiza estado real após envio
      setTimeout(onRefresh, 1500);
    } catch (err) {
      setSendError("Falha ao enviar. Verifique o MCP.");
    } finally {
      setSending(false);
    }
  }

  async function handleSuggest() {
    setLoadingSuggestion(true);
    setSuggestionError(null);
    setSuggestion(null);
    try {
      const res = await window.fetch(`${mcpUrl}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: conv.phone }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
      } else {
        setSuggestionError("Claude não gerou sugestão (lead pode já ter resposta ou conversa incompleta).");
      }
    } catch {
      setSuggestionError("Falha ao chamar IA. Verifique o ANTHROPIC_API_KEY.");
    } finally {
      setLoadingSuggestion(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  return (
    <div className="vo-wa-chat-inner">
      {/* ── Cabeçalho da conversa ── */}
      <div className="vo-wa-chat-header">
        <div className="vo-wa-chat-avatar">{initials(displayName)}</div>
        <div className="vo-wa-chat-contact">
          <div className="vo-wa-chat-name">{displayName}</div>
          <div className="vo-wa-chat-phone">{fmtPhone(conv.phone)}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {conv.renanAlerted && (
            <span className="vo-wa-alerted-badge">🔔 Renan alertado</span>
          )}
          <span style={{ fontSize: 11, color: "#bbb" }}>
            {conv.messageCount} msg · desde {fmtTime(conv.firstAt)}
          </span>
        </div>
      </div>

      {/* ── Mensagens ── */}
      <div className="vo-wa-messages">
        {conv.messages.length === 0 && (
          <div className="vo-wa-no-msgs">Nenhuma mensagem ainda.</div>
        )}
        {conv.messages.map((msg, i) => {
          const isSent = msg.role === "assistant";
          return (
            <div key={msg.id ?? i} className={`vo-wa-bubble-wrap ${isSent ? "sent" : "received"}`}>
              <div className={`vo-wa-bubble ${isSent ? "sent" : "received"}`}>
                <div className="vo-wa-bubble-text">{msg.content}</div>
                <div className="vo-wa-bubble-meta">
                  {isSent && <span className="vo-wa-bubble-who">Você</span>}
                  <span className="vo-wa-bubble-time">{fmtTime(msg.at)}</span>
                  {isSent && <span className="vo-wa-bubble-check">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Card de alerta Claude */}
        {conv.renanAlerted && conv.lastAlert && (
          <div className="vo-wa-alert-banner">
            <span className="vo-wa-alert-icon">🤖</span>
            <div>
              <strong>Claude analisou esta conversa</strong>
              <p>{conv.lastAlert}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sugestão IA ── */}
      {suggestion && (
        <div className="vo-wa-suggestion">
          <div className="vo-wa-suggestion-header">
            <span>✨ Sugestão Claude</span>
            <button className="vo-wa-suggestion-dismiss" onClick={() => setSuggestion(null)}>✕</button>
          </div>
          <p className="vo-wa-suggestion-text">{suggestion}</p>
          <div className="vo-wa-suggestion-actions">
            <button
              className="vo-wa-suggestion-btn secondary"
              onClick={() => { setInput(suggestion); setSuggestion(null); inputRef.current?.focus(); }}
            >
              Editar antes
            </button>
            <button
              className="vo-wa-suggestion-btn primary"
              onClick={() => handleSend(suggestion)}
              disabled={sending}
            >
              {sending ? "Enviando…" : "Enviar direto ↗"}
            </button>
          </div>
        </div>
      )}

      {suggestionError && (
        <div className="vo-wa-suggestion-err">⚠️ {suggestionError}</div>
      )}

      {sendError && (
        <div className="vo-wa-send-err">⚠️ {sendError}</div>
      )}

      {/* ── Barra de envio ── */}
      <div className="vo-wa-input-bar">
        <button
          className="vo-wa-ai-btn"
          onClick={handleSuggest}
          disabled={loadingSuggestion}
          title="Pedir sugestão ao Claude"
        >
          {loadingSuggestion ? (
            <span className="vo-wa-spinner" />
          ) : (
            <>✨ <span>IA</span></>
          )}
        </button>

        <textarea
          ref={inputRef}
          className="vo-wa-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem… (Enter envia, Shift+Enter nova linha)"
          rows={1}
          disabled={sending}
        />

        <button
          className={`vo-wa-send-btn ${!input.trim() || sending ? "disabled" : ""}`}
          onClick={() => handleSend(input)}
          disabled={!input.trim() || sending}
          title="Enviar mensagem"
        >
          {sending ? (
            <span className="vo-wa-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Histórico estático (outros projetos) ─────────────────────────────────────
const TAG_COLOR: Record<string, string> = {
  novo: "#3b82c4", qualificado: "#7c5cdb", negociando: "#d97706",
  fechado: "#3aa164", frio: "#94a3b8",
};

function StaticHistory({ projectId }: { projectId: string }) {
  const threads = WHATSAPP_THREADS[projectId] ?? [];
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return threads;
    return threads.filter(
      (th) =>
        th.contactName.toLowerCase().includes(t) ||
        th.preview.toLowerCase().includes(t) ||
        th.messages.some((m) => m.text.toLowerCase().includes(t)),
    );
  }, [q, threads]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  if (threads.length === 0) {
    return (
      <div className="vo-wa-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="vo-wa-chat-empty">
          <div style={{ fontSize: 40 }}>💬</div>
          <h3>WhatsApp ainda não conectado</h3>
          <p>
            Quando você conectar o WhatsApp Business desse projeto na aba{" "}
            <b>Conexões</b>, o histórico aparece aqui indexado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vo-wa-shell">
      <aside className="vo-wa-contacts">
        <div className="vo-wa-contacts-head">
          <div className="vo-wa-contacts-title">
            <span>WhatsApp</span>
            <span style={{ fontSize: 11, color: "#888" }}>histórico</span>
          </div>
          <div className="vo-wa-contacts-stats">
            <span>{threads.length} conv</span>
          </div>
        </div>
        <div className="vo-wa-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" />
        </div>
        <div className="vo-wa-contact-list">
          {filtered.map((th) => (
            <button
              key={th.id}
              className={`vo-wa-contact-item ${selectedId === th.id ? "is-active" : ""}`}
              onClick={() => setSelectedId(th.id)}
            >
              <div className="vo-wa-contact-avatar">{initials(th.contactName)}</div>
              <div className="vo-wa-contact-info">
                <div className="vo-wa-contact-row">
                  <span className="vo-wa-contact-name">{th.contactName}</span>
                  <span className="vo-wa-contact-time">{th.lastAt}</span>
                </div>
                <div className="vo-wa-contact-row">
                  <span className="vo-wa-contact-preview">{th.preview}</span>
                  {th.unread > 0 && <span className="vo-wa-contact-alert">{th.unread}</span>}
                </div>
                {th.tag && (
                  <span className="vo-wa-contact-tag" style={{ background: TAG_COLOR[th.tag] + "22", color: TAG_COLOR[th.tag] }}>
                    {th.tag}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="vo-wa-chat-area">
        {selected ? (
          <div className="vo-wa-chat-inner">
            <div className="vo-wa-chat-header">
              <div className="vo-wa-chat-avatar">{initials(selected.contactName)}</div>
              <div className="vo-wa-chat-contact">
                <div className="vo-wa-chat-name">{selected.contactName}</div>
                <div className="vo-wa-chat-phone">{selected.phone}</div>
              </div>
              {selected.tag && (
                <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 10px", borderRadius: 99, background: TAG_COLOR[selected.tag] + "22", color: TAG_COLOR[selected.tag] }}>
                  {selected.tag}
                </span>
              )}
            </div>
            <div className="vo-wa-messages">
              {selected.messages.map((m) => (
                <div key={m.id} className={`vo-wa-bubble-wrap ${m.from === "agent" ? "sent" : "received"}`}>
                  <div className={`vo-wa-bubble ${m.from === "agent" ? "sent" : "received"}`}>
                    <div className="vo-wa-bubble-text">{m.text}</div>
                    <div className="vo-wa-bubble-meta">
                      {m.from === "agent" && <span className="vo-wa-bubble-who">Agente</span>}
                      <span className="vo-wa-bubble-time">{m.at}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="vo-wa-input-bar" style={{ opacity: 0.5, pointerEvents: "none" }}>
              <div className="vo-wa-input" style={{ flex: 1, padding: "10px 14px", fontSize: 13, color: "#aaa" }}>
                🔒 Histórico indexado · envio requer conexão ativa
              </div>
            </div>
          </div>
        ) : (
          <div className="vo-wa-chat-empty">
            <div style={{ fontSize: 40 }}>💬</div>
            <p>Selecione uma conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
