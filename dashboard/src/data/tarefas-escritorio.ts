import type { ProjetoId } from "./types";

export type EstadoTarefa = "fazendo" | "pendente" | "planejando" | "concluida" | "critica";
export type PrioridadeTarefa = "baixa" | "media" | "alta" | "critica";
export type AssignedKind = "human" | "agent";

export interface TarefaEscritorio {
  id: string;
  title: string;
  description?: string;
  state: EstadoTarefa;
  priority: PrioridadeTarefa;
  assignedTo: string;
  assignedKind: AssignedKind;
  projectId: ProjetoId;
  createdAt: string;
  dueAt?: string;
  parentDecisionId?: string;
}

export const TAREFAS_ESCRITORIO: TarefaEscritorio[] = [
  // === Augusto (admin) ===
  { id: "t-au-1", title: "Decidir Stark Law no D",                state: "critica",   priority: "critica", assignedTo: "augusto", assignedKind: "human", projectId: "D", createdAt: "2026-04-30T09:00", parentDecisionId: "d-stark" },
  { id: "t-au-2", title: "Aprovar resposta Cynthia (Lumina)",     state: "pendente",  priority: "alta",    assignedTo: "augusto", assignedKind: "human", projectId: "A", createdAt: "2026-04-30T10:28", parentDecisionId: "d-cynthia-resposta" },
  { id: "t-au-3", title: "Call 14h Cynthia",                       state: "planejando",priority: "media",   assignedTo: "augusto", assignedKind: "human", projectId: "A", createdAt: "2026-04-30T07:00", dueAt: "2026-04-30T14:00" },
  { id: "t-au-4", title: "Renegociar contrato pré-saída Lumina",  state: "fazendo",   priority: "alta",    assignedTo: "augusto", assignedKind: "human", projectId: "A", createdAt: "2026-04-25T10:00", dueAt: "2026-06-01" },
  { id: "t-au-5", title: "Documentar playbook Lumina",            state: "fazendo",   priority: "alta",    assignedTo: "augusto", assignedKind: "human", projectId: "A", createdAt: "2026-04-20T10:00", dueAt: "2026-05-15" },
  { id: "t-au-6", title: "Decidir Cássio (B): ativar Logística?", state: "pendente",  priority: "media",   assignedTo: "augusto", assignedKind: "human", projectId: "B", createdAt: "2026-04-30T04:00", parentDecisionId: "d-cassio" },

  // === Pablo (diretor) ===
  { id: "t-pa-1", title: "Revisar 3 posts F (Conteúdo gerou)",    state: "pendente",  priority: "media",   assignedTo: "pablo", assignedKind: "human", projectId: "F", createdAt: "2026-04-30T10:18" },
  { id: "t-pa-2", title: "Briefar Antonio sobre A",                state: "pendente",  priority: "baixa",   assignedTo: "pablo", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T15:00" },
  { id: "t-pa-3", title: "Validar campanha Q3 A",                  state: "planejando",priority: "media",   assignedTo: "pablo", assignedKind: "human", projectId: "A", createdAt: "2026-04-28T09:00" },

  // === Matheus (diretor) ===
  { id: "t-ma-1", title: "Configurar MCP WhatsApp Business",       state: "fazendo",   priority: "alta",    assignedTo: "matheus", assignedKind: "human", projectId: "D", createdAt: "2026-04-29T10:00", dueAt: "2026-05-02" },
  { id: "t-ma-2", title: "Deploy Construtor v2",                   state: "fazendo",   priority: "media",   assignedTo: "matheus", assignedKind: "human", projectId: "D", createdAt: "2026-04-29T08:00" },
  { id: "t-ma-3", title: "Review backend D",                       state: "pendente",  priority: "media",   assignedTo: "matheus", assignedKind: "human", projectId: "D", createdAt: "2026-04-28T16:00" },

  // === Antonio (executor) ===
  { id: "t-at-1", title: "Postar F · stories (3 unidades)",        state: "fazendo",   priority: "media",   assignedTo: "antonio", assignedKind: "human", projectId: "F", createdAt: "2026-04-30T08:00" },
  { id: "t-at-2", title: "Briefing com Pablo sobre A",             state: "pendente",  priority: "baixa",   assignedTo: "antonio", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T14:00" },

  // === Bryan (executor) ===
  { id: "t-br-1", title: "Briefing tráfego pago Q3",               state: "pendente",  priority: "baixa",   assignedTo: "bryan", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T11:00" },

  // === Well (executor) ===
  { id: "t-we-1", title: "Editar 2 vídeos Lumina",                 state: "fazendo",   priority: "media",   assignedTo: "well", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T09:00" },
  { id: "t-we-2", title: "Repurpose pra F (Conteúdo já organizou)",state: "pendente",  priority: "baixa",   assignedTo: "well", assignedKind: "human", projectId: "F", createdAt: "2026-04-28T14:00" },

  // === Andressa (atendimento) ===
  { id: "t-an-1", title: "Responder 3 leads Lumina",               state: "fazendo",   priority: "alta",    assignedTo: "andressa", assignedKind: "human", projectId: "A", createdAt: "2026-04-30T09:30" },
  { id: "t-an-2", title: "Confirmar avaliação presencial Miami",   state: "pendente",  priority: "media",   assignedTo: "andressa", assignedKind: "human", projectId: "A", createdAt: "2026-04-30T07:00" },
  { id: "t-an-3", title: "Follow-up agendamento Cynthia",          state: "pendente",  priority: "baixa",   assignedTo: "andressa", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T16:00" },
  { id: "t-an-4", title: "Update CRM (manual)",                    state: "pendente",  priority: "baixa",   assignedTo: "andressa", assignedKind: "human", projectId: "A", createdAt: "2026-04-29T08:00" },
  { id: "t-an-5", title: "Daily report do dia",                    state: "pendente",  priority: "baixa",   assignedTo: "andressa", assignedKind: "human", projectId: "A", createdAt: "2026-04-30T07:00" },

  // === Agentes IA · Marketing ===
  { id: "t-ag-conteudo-1",  title: "Gerar pauta saída F",          state: "fazendo",   priority: "media",   assignedTo: "conteudo", assignedKind: "agent", projectId: "F", createdAt: "2026-04-30T10:18" },
  { id: "t-ag-conteudo-2",  title: "Apoiar copy A landing",         state: "pendente",  priority: "media",   assignedTo: "conteudo", assignedKind: "agent", projectId: "A", createdAt: "2026-04-29T15:00" },
  { id: "t-ag-conteudo-3",  title: "Pauta autoridade próx semana",  state: "planejando",priority: "baixa",   assignedTo: "conteudo", assignedKind: "agent", projectId: "F", createdAt: "2026-04-28T09:00" },
  { id: "t-ag-bv-1",        title: "Verificar consistência F",      state: "fazendo",   priority: "media",   assignedTo: "brand-voice", assignedKind: "agent", projectId: "F", createdAt: "2026-04-30T08:00" },
  { id: "t-ag-bv-2",        title: "Revisar tom posts A",           state: "pendente",  priority: "baixa",   assignedTo: "brand-voice", assignedKind: "agent", projectId: "A", createdAt: "2026-04-29T15:00" },
  { id: "t-ag-trafego-1",   title: "Briefing Bryan · audiência LAL",state: "fazendo",   priority: "media",   assignedTo: "trafego", assignedKind: "agent", projectId: "A", createdAt: "2026-04-30T06:00" },
  { id: "t-ag-trafego-2",   title: "Relatório semanal A",           state: "pendente",  priority: "baixa",   assignedTo: "trafego", assignedKind: "agent", projectId: "A", createdAt: "2026-04-29T18:00" },
  { id: "t-ag-cale-1",      title: "Cadência semanal F",            state: "fazendo",   priority: "media",   assignedTo: "calendario-editorial", assignedKind: "agent", projectId: "F", createdAt: "2026-04-30T07:00" },

  // === Agentes IA · Comercial ===
  { id: "t-ag-prevenda-1",  title: "Qualificar Cynthia (BANT 8/10)",state: "concluida", priority: "alta",    assignedTo: "pre-venda", assignedKind: "agent", projectId: "A", createdAt: "2026-04-30T10:28" },
  { id: "t-ag-prevenda-2",  title: "Gerar resposta sugerida Cynthia",state: "pendente", priority: "alta",    assignedTo: "pre-venda", assignedKind: "agent", projectId: "A", createdAt: "2026-04-30T10:30", parentDecisionId: "d-cynthia-resposta" },
  { id: "t-ag-crm-1",       title: "Mover 4 leads · novo→qualificado", state: "concluida", priority: "media", assignedTo: "crm-follow-up", assignedKind: "agent", projectId: "A", createdAt: "2026-04-30T09:52" },
  { id: "t-ag-fechamento-1",title: "Script high-ticket BR",          state: "fazendo",   priority: "media",   assignedTo: "fechamento", assignedKind: "agent", projectId: "B", createdAt: "2026-04-29T13:00" },

  // === Agentes IA · Diretoria + Tec + Conhecimento ===
  { id: "t-ag-auditor-1",   title: "Análise Stark Law / Anti-Kickback",state: "critica", priority: "critica", assignedTo: "auditor", assignedKind: "agent", projectId: "D", createdAt: "2026-04-30T09:30", parentDecisionId: "d-stark" },
  { id: "t-ag-estrat-1",    title: "Cenários Cássio (B)",            state: "concluida", priority: "media",   assignedTo: "estrategista", assignedKind: "agent", projectId: "B", createdAt: "2026-04-30T04:00", parentDecisionId: "d-cassio" },
  { id: "t-ag-curador-1",   title: "Curar dossiê C",                 state: "fazendo",   priority: "media",   assignedTo: "curador", assignedKind: "agent", projectId: "C", createdAt: "2026-04-30T10:08" },
  { id: "t-ag-doc-1",       title: "Documentar playbook Lumina",     state: "fazendo",   priority: "alta",    assignedTo: "documentador", assignedKind: "agent", projectId: "A", createdAt: "2026-04-25T10:00" },
  { id: "t-ag-auto-1",      title: "Sincronia CRM ↔ WhatsApp",       state: "fazendo",   priority: "alta",    assignedTo: "automacao", assignedKind: "agent", projectId: "A", createdAt: "2026-04-30T00:00" },
  { id: "t-ag-dados-1",     title: "Dashboard Lumina · semana",      state: "pendente",  priority: "media",   assignedTo: "dados", assignedKind: "agent", projectId: "A", createdAt: "2026-04-29T20:00" },
  { id: "t-ag-mentor-1",    title: "Roteirizar conteúdo educacional",state: "planejando",priority: "baixa",   assignedTo: "mentor", assignedKind: "agent", projectId: "E", createdAt: "2026-04-15T10:00" },
];

export function tarefasDe(ownerId: string): TarefaEscritorio[] {
  return TAREFAS_ESCRITORIO.filter((t) => t.assignedTo === ownerId);
}

export function tarefasDoProjeto(projectId: ProjetoId): TarefaEscritorio[] {
  return TAREFAS_ESCRITORIO.filter((t) => t.projectId === projectId);
}

export function tarefasAbertasDoProjeto(projectId: ProjetoId): TarefaEscritorio[] {
  return tarefasDoProjeto(projectId).filter((t) => t.state !== "concluida");
}

export function totalTarefasAbertas(ownerId: string): number {
  return tarefasDe(ownerId).filter((t) => t.state !== "concluida").length;
}
