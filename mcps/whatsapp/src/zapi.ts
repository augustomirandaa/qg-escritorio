import axios from "axios";

const BASE_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Client-Token": process.env.ZAPI_CLIENT_TOKEN ?? "",
    "Content-Type": "application/json",
  },
});

export async function sendText(phone: string, message: string): Promise<void> {
  await client.post("/send-text", { phone, message });
}

// Marca mensagem como "digitando..." por alguns segundos antes de responder
export async function sendTyping(phone: string): Promise<void> {
  try {
    await client.post("/send-chat-state", { phone, chatState: "typing" });
  } catch {
    // ignora erro — não é crítico
  }
}

// ─── Histórico ────────────────────────────────────────────────────────────────

export interface ZApiChat {
  phone: string;
  name?: string;
  lastMessageTime?: number;
  isGroup?: boolean;
}

export interface ZApiMessage {
  messageId: string;
  phone: string;
  fromMe: boolean;
  momment: number; // timestamp unix ms
  text?: { message: string };
  senderName?: string;
  isGroup?: boolean;
  type?: string;
}

/** Lista todos os chats da instância (exclui grupos) */
export async function fetchChats(): Promise<ZApiChat[]> {
  const res = await client.get<ZApiChat[]>("/chats", {
    params: { pageSize: 200 },
  });
  const chats = Array.isArray(res.data) ? res.data : [];
  return chats.filter((c) => !c.isGroup && c.phone);
}

/** Busca histórico de mensagens de um chat específico.
 *  O endpoint /chat-messages/{phone} não funciona em instâncias multi-device.
 *  Captura o erro e retorna [] para não travar o /sync.
 */
export async function fetchMessages(phone: string): Promise<ZApiMessage[]> {
  try {
    const res = await client.get<ZApiMessage[] | { error: string }>(`/chat-messages/${phone}`, {
      params: { pageSize: 100 },
    });
    if (!Array.isArray(res.data)) {
      // Z-API retornou objeto de erro (ex: "Does not work in multi device version")
      const errMsg = (res.data as { error?: string }).error ?? JSON.stringify(res.data);
      console.warn(`[zapi] fetchMessages (${phone}) retornou erro: ${errMsg}`);
      return [];
    }
    return res.data;
  } catch (err: any) {
    // 4xx / 5xx do axios — captura e retorna vazio
    const apiErr = err?.response?.data?.error ?? err?.message ?? String(err);
    console.warn(`[zapi] fetchMessages (${phone}) falhou: ${apiErr}`);
    return [];
  }
}
