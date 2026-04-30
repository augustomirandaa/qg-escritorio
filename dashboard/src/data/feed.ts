import type { ProjetoId } from "./types";

export type TipoFeedItem = "agent_output" | "human_action" | "decision" | "financial" | "system";
export type AuthorKind = "agent" | "human" | "system";

export interface FeedAction {
  label: string;
  action: string;
  primary?: boolean;
  danger?: boolean;
}

export interface FeedItem {
  id: string;
  type: TipoFeedItem;
  authorId: string;
  authorLabel: string;
  authorKind: AuthorKind;
  authorAvatarKind: "agent" | "nucleo" | "exec" | "orbit" | "client";
  projectId?: ProjetoId;
  timestamp: string;
  dayLabel: string;
  timeLabel: string;
  text: string;
  awaitingFrom?: string[];
  awaitingLabel?: string;
  priority?: "critica" | "alta" | "media" | "baixa";
  actions?: FeedAction[];
}

export const FEED: FeedItem[] = [
  {
    id: "f-1",
    type: "agent_output",
    authorId: "pre-venda",
    authorLabel: "Pré-venda",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "A",
    timestamp: "2026-04-30T10:28",
    dayLabel: "hoje",
    timeLabel: "há 2 min",
    text: "<b>Cynthia qualificada</b> · BANT 8/10 · indica clínica de procedimento facial em Miami. Resposta sugerida pronta — você aprova o envio?",
    awaitingFrom: ["augusto"],
    awaitingLabel: "aguarda Augusto",
    priority: "alta",
    actions: [
      { label: "✓ Aprovar e enviar", action: "approve-send", primary: true },
      { label: "Editar resposta", action: "edit" },
      { label: "Ver contexto", action: "context" },
    ],
  },
  {
    id: "f-2",
    type: "agent_output",
    authorId: "conteudo",
    authorLabel: "Conteúdo",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "F",
    timestamp: "2026-04-30T10:18",
    dayLabel: "hoje",
    timeLabel: "há 12 min",
    text: "Gerei 3 posts pra cadência da semana (saída, autoridade, expansão). Aguarda revisão Pablo.",
    awaitingFrom: ["pablo"],
    actions: [
      { label: "Ver posts", action: "view-posts" },
      { label: "Marcar Pablo", action: "ping" },
    ],
  },
  {
    id: "f-3",
    type: "decision",
    authorId: "auditor",
    authorLabel: "Auditor",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "D",
    timestamp: "2026-04-30T09:30",
    dayLabel: "hoje",
    timeLabel: "há 1 h",
    text: "<b>Risco Stark Law / Anti-Kickback Florida.</b> A intermediadora BR proposta pelo Thomas pode caracterizar referral fee. Análise completa no painel — recomendo <i>pausa</i> antes de avançar como Country Manager.",
    awaitingFrom: ["augusto"],
    priority: "critica",
    actions: [
      { label: "Ler análise", action: "read-analysis", primary: true },
      { label: "Pausar D", action: "pause-d", danger: true },
    ],
  },
  {
    id: "f-4",
    type: "agent_output",
    authorId: "crm-follow-up",
    authorLabel: "CRM/Follow-up",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "A",
    timestamp: "2026-04-30T09:52",
    dayLabel: "hoje",
    timeLabel: "há 38 min",
    text: 'Movi 4 leads de "novo" pra "qualificado". Tempo médio de resposta: 8 min (meta: 15). Andressa cobriu 3 deles.',
  },
  {
    id: "f-5",
    type: "human_action",
    authorId: "andressa",
    authorLabel: "Andressa",
    authorKind: "human",
    authorAvatarKind: "orbit",
    projectId: "A",
    timestamp: "2026-04-30T08:30",
    dayLabel: "hoje",
    timeLabel: "há 2 h",
    text: "Respondi 4 leads do WhatsApp Business da Cynthia. Um quer agendar avaliação presencial em Miami semana que vem.",
  },
  {
    id: "f-6",
    type: "agent_output",
    authorId: "trafego",
    authorLabel: "Tráfego",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "A",
    timestamp: "2026-04-30T06:30",
    dayLabel: "hoje",
    timeLabel: "há 4 h",
    text: "Campanha IG ontem · ROI 2.3x · CPM caiu 18%. Briefing pro Bryan pra escalar audiência lookalike.",
  },
  {
    id: "f-7",
    type: "agent_output",
    authorId: "estrategista",
    authorLabel: "Estrategista",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "B",
    timestamp: "2026-04-30T04:00",
    dayLabel: "hoje",
    timeLabel: "há 6 h",
    text: "Cássio (B) parado · 3 cenários gerados (ativar Logística · reduzir prioridade · pausar). Decisão pendente.",
    awaitingFrom: ["augusto"],
    actions: [{ label: "Ver cenários", action: "scenarios" }],
  },
  {
    id: "f-8",
    type: "human_action",
    authorId: "pablo",
    authorLabel: "Pablo",
    authorKind: "human",
    authorAvatarKind: "nucleo",
    projectId: "A",
    timestamp: "2026-04-29T17:42",
    dayLabel: "ontem",
    timeLabel: "17:42",
    text: "Aprovei copy da landing page A · subiu pra produção.",
  },
  {
    id: "f-9",
    type: "agent_output",
    authorId: "calendario-editorial",
    authorLabel: "Cal. Editorial",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "F",
    timestamp: "2026-04-29T16:00",
    dayLabel: "ontem",
    timeLabel: "16:00",
    text: "Cadência semanal F atualizada · 3 posts pra próxima semana já no calendário.",
  },
  {
    id: "f-10",
    type: "agent_output",
    authorId: "documentador",
    authorLabel: "Documentador",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "A",
    timestamp: "2026-04-29T11:00",
    dayLabel: "ontem",
    timeLabel: "11:00",
    text: "Capturei 4 perguntas-base do playbook Lumina. Augusto pra responder em sessão dedicada.",
    awaitingFrom: ["augusto"],
  },
  {
    id: "f-11",
    type: "human_action",
    authorId: "matheus",
    authorLabel: "Matheus",
    authorKind: "human",
    authorAvatarKind: "nucleo",
    projectId: "D",
    timestamp: "2026-04-29T09:00",
    dayLabel: "ontem",
    timeLabel: "09:00",
    text: "Subi PR do Construtor v2 · review pendente.",
  },
  {
    id: "f-12",
    type: "financial",
    authorId: "financeiro",
    authorLabel: "Financeiro",
    authorKind: "agent",
    authorAvatarKind: "agent",
    projectId: "A",
    timestamp: "2026-04-28T08:00",
    dayLabel: "anteontem",
    timeLabel: "08:00",
    text: "Receita Lumina abr → $2.000 fixos + 2 procedimentos = $2.000 + ~$X em 10%.",
  },
];

export function feedParaUsuario(userId: string, projetosVisiveisIds: string[]): FeedItem[] {
  return FEED.filter((f) => {
    if (!f.projectId) return true;
    return projetosVisiveisIds.includes(f.projectId);
  });
}

export function contagemPorTipo(items: FeedItem[]): Record<TipoFeedItem, number> {
  const acc: Record<TipoFeedItem, number> = {
    agent_output: 0,
    human_action: 0,
    decision: 0,
    financial: 0,
    system: 0,
  };
  items.forEach((i) => {
    acc[i.type]++;
  });
  return acc;
}
