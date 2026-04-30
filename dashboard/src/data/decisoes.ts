import type { ProjetoId } from "./types";

export type DecisaoPrioridade = "critica" | "alta" | "media" | "baixa";

export interface DecisaoOpcao {
  label: string;
  action: string;
  primary?: boolean;
  danger?: boolean;
}

export interface Decisao {
  id: string;
  title: string;
  context: string;
  priority: DecisaoPrioridade;
  triggeredBy: string;
  triggeredByLabel: string;
  projectId: ProjetoId;
  createdAt: string;
  ageLabel: string;
  options: DecisaoOpcao[];
  visibleTo: string[];
}

export const DECISOES: Decisao[] = [
  {
    id: "d-stark",
    title: "Decidir: pausar Modelo D após análise de Stark Law",
    context:
      "Auditor flagou que a intermediadora BR proposta pelo Thomas pode caracterizar referral fee. Continuar como Country Manager BR sem ajuste expõe risco regulatório e financeiro.",
    priority: "critica",
    triggeredBy: "auditor",
    triggeredByLabel: "Auditor",
    projectId: "D",
    createdAt: "2026-04-30T09:30",
    ageLabel: "há 1 h",
    options: [
      { label: "Pausar D", action: "pause-d", primary: true },
      { label: "Continuar", action: "continue-d" },
      { label: "Adiar 24h", action: "snooze" },
    ],
    visibleTo: ["augusto", "matheus"],
  },
  {
    id: "d-cynthia-resposta",
    title: "Aprovar resposta de Pré-venda à Cynthia (Lumina)",
    context:
      "Lead de procedimento facial em Miami. BANT 8/10. Resposta sugerida foca em diferenciação clínica. SLA da Lumina: responder em 15 min.",
    priority: "alta",
    triggeredBy: "pre-venda",
    triggeredByLabel: "Pré-venda",
    projectId: "A",
    createdAt: "2026-04-30T10:28",
    ageLabel: "há 2 min",
    options: [
      { label: "Aprovar e enviar", action: "approve-send", primary: true },
      { label: "Editar", action: "edit" },
    ],
    visibleTo: ["augusto", "pablo"],
  },
  {
    id: "d-cassio",
    title: "Cássio (B) parado há 2 semanas — ativar Logística ou pausar?",
    context:
      "Pipeline B tá com 1 caso/2sem. CRM já fez 3 follow-ups. Estrategista sugere 3 cenários: ativar Logística (custo $400/mês), reduzir prioridade, ou pausar e rever em 30d.",
    priority: "media",
    triggeredBy: "estrategista",
    triggeredByLabel: "Estrategista",
    projectId: "B",
    createdAt: "2026-04-30T04:00",
    ageLabel: "há 6 h",
    options: [
      { label: "Ativar Logística", action: "activate-logistica", primary: true },
      { label: "Pausar", action: "pause-b" },
      { label: "Ver cenários", action: "view-scenarios" },
    ],
    visibleTo: ["augusto"],
  },
];

export function decisoesParaUsuario(userId: string): Decisao[] {
  return DECISOES.filter((d) => d.visibleTo.includes(userId));
}
