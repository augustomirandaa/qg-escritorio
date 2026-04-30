import type { ProjetoId } from "./types";

export type Saude = "ok" | "alerta" | "critico" | "inerte" | "dormente";

export interface ProjetoMeta {
  id: ProjetoId;
  letra: string;
  apelido: string;
  status: string;
  statusBadge: "ativo" | "cauteloso" | "incubando" | "dormente";
  saude: Saude;
  receita: string;
  agentesAtivos: number;
  agentesTotal: number;
  ultimaAtividade: string;
  ultimaAtividadeAutor: string;
  proximaAcao: string;
  proximaAcaoLink?: string;
  acaoLabel?: string;
  acaoLink?: string;
  showCliente: boolean;
}

export const META_PROJETOS: Record<string, ProjetoMeta> = {
  A: {
    id: "A", letra: "A", apelido: "Lumina · EUA",
    status: "Validado · com ressalvas", statusBadge: "ativo",
    saude: "ok",
    receita: "$2k+10%/proc · única receita real",
    agentesAtivos: 10, agentesTotal: 10,
    ultimaAtividade: "há 2 min", ultimaAtividadeAutor: "Pré-venda",
    proximaAcao: "Call 14h Cynthia (Pré-venda)",
    acaoLabel: "Aprovar resposta →", acaoLink: "/escritorio",
    showCliente: true,
  },
  A2: {
    id: "A2", letra: "A2", apelido: "Avak Dental",
    status: "Em estruturação", statusBadge: "cauteloso",
    saude: "alerta",
    receita: "growth partner · contrato a definir",
    agentesAtivos: 6, agentesTotal: 8,
    ultimaAtividade: "há 1 d", ultimaAtividadeAutor: "Documentador",
    proximaAcao: "Fechar contrato Dr. Gayanne",
    showCliente: false,
  },
  A3: {
    id: "A3", letra: "A3", apelido: "@drstephsouza",
    status: "Em estruturação", statusBadge: "cauteloso",
    saude: "alerta",
    receita: "growth partner · contrato a definir",
    agentesAtivos: 4, agentesTotal: 6,
    ultimaAtividade: "há 2 d", ultimaAtividadeAutor: "Curador",
    proximaAcao: "Mapear ticket e geografia",
    showCliente: false,
  },
  B: {
    id: "B", letra: "B", apelido: "Capilar BR",
    status: "Piloto · 1 caso/2sem", statusBadge: "cauteloso",
    saude: "alerta",
    receita: "20% por caso direcionado",
    agentesAtivos: 7, agentesTotal: 9,
    ultimaAtividade: "há 2 d", ultimaAtividadeAutor: "Brasil",
    proximaAcao: "⚠ Cássio parado · ativar Logística?",
    acaoLabel: "Decidir Cássio →", acaoLink: "/escritorio",
    showCliente: true,
  },
  C: {
    id: "C", letra: "C", apelido: "Projeto C",
    status: "Incubando · leads via Goiânia", statusBadge: "incubando",
    saude: "inerte",
    receita: "sem receita ativa",
    agentesAtivos: 8, agentesTotal: 8,
    ultimaAtividade: "há 22 min", ultimaAtividadeAutor: "Curador",
    proximaAcao: "Curador atualizou dossiê",
    showCliente: false,
  },
  D: {
    id: "D", letra: "D", apelido: "Aesthetica",
    status: "Estratégia ativa · 2 fases", statusBadge: "ativo",
    saude: "critico",
    receita: "turismo médico · retainer + fees",
    agentesAtivos: 11, agentesTotal: 11,
    ultimaAtividade: "há 1 h", ultimaAtividadeAutor: "Auditor (Stark Law)",
    proximaAcao: "🔴 Stark Law · análise pronta",
    acaoLabel: "Ler análise →", acaoLink: "/escritorio",
    showCliente: true,
  },
  E: {
    id: "E", letra: "E", apelido: "Pós-saída",
    status: "Ativa pós-saída", statusBadge: "dormente",
    saude: "dormente",
    receita: "futuro · educacional",
    agentesAtivos: 1, agentesTotal: 4,
    ultimaAtividade: "nunca", ultimaAtividadeAutor: "—",
    proximaAcao: "Mentor aguarda ativação",
    acaoLabel: "Ativar →",
    showCliente: false,
  },
  F: {
    id: "F", letra: "F", apelido: "Marca pessoal",
    status: "Em desenvolvimento · 2 fases", statusBadge: "ativo",
    saude: "ok",
    receita: "indireta · alimenta A/B/C/E",
    agentesAtivos: 5, agentesTotal: 5,
    ultimaAtividade: "há 12 min", ultimaAtividadeAutor: "Conteúdo",
    proximaAcao: "3 posts gerados · revisar",
    acaoLabel: "Revisar 3 posts →", acaoLink: "/escritorio/feed",
    showCliente: false,
  },
};

export const ORDEM_PROJETOS: ProjetoId[] = ["A", "B", "C", "D", "E", "F"];

export const SAUDE_COR: Record<Saude, string> = {
  ok: "#16a34a",
  alerta: "#d97706",
  critico: "#dc2626",
  inerte: "#9aa0a6",
  dormente: "#9aa0a6",
};

export const SAUDE_LABEL: Record<Saude, string> = {
  ok: "Ok",
  alerta: "Cuidado",
  critico: "Crítico",
  inerte: "Inerte",
  dormente: "Dormente",
};

export const STATUS_BADGE_CLASS: Record<ProjetoMeta["statusBadge"], string> = {
  ativo: "s-success",
  cauteloso: "s-warning",
  incubando: "s-neutral",
  dormente: "s-neutral",
};

// papel/avatar kind por humano (mapeia nosso "tipo" → kind do escritório)
export const KIND_HUMANO: Record<string, "nucleo" | "exec" | "orbit" | "client"> = {
  augusto: "nucleo",
  pablo: "nucleo",
  matheus: "nucleo",
  antonio: "exec",
  bryan: "exec",
  well: "exec",
  andressa: "orbit",
  cynthia: "client",
  rey: "client",
  cassio: "client",
  thomas: "client",
  gayanne: "client",
  stephsouza: "client",
};

// status simulado (online/busy/offline) — fase 0, sem backend
export const STATUS_HUMANO: Record<string, "online" | "busy" | "offline"> = {
  augusto: "online",
  pablo: "online",
  matheus: "busy",
  antonio: "online",
  bryan: "offline",
  well: "busy",
  andressa: "online",
  cynthia: "offline",
  rey: "offline",
  cassio: "offline",
  thomas: "busy",
  gayanne: "offline",
  stephsouza: "offline",
};

// status agentes (running/idle/dormente)
export const STATUS_AGENTE: Record<string, "running" | "idle" | "dormente"> = {
  "ceo": "idle",
  "estrategista": "idle",
  "auditor": "running",
  "conteudo": "running",
  "brand-voice": "idle",
  "trafego": "running",
  "calendario-editorial": "running",
  "mentor": "dormente",
  "pre-venda": "running",
  "fechamento": "idle",
  "crm-follow-up": "running",
  "logistica-paciente": "idle",
  "eua": "idle",
  "brasil": "idle",
  "construtor": "idle",
  "automacao": "running",
  "dados": "idle",
  "curador": "running",
  "documentador": "running",
  "financeiro": "dormente",
  "juridico": "dormente",
};
