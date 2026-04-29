import type { ProjetoId } from "./types";

export type CelulaMatriz = "ativo" | "dormente" | "vazio";

export interface LinhaMatriz {
  agente: string;
  celulas: Record<ProjetoId, CelulaMatriz>;
}

export interface BlocoMatriz {
  area: string;
  linhas: LinhaMatriz[];
}

const cells = (a: string, b: string, c: string, d: string, e: string, f: string): Record<ProjetoId, CelulaMatriz> => ({
  A: parse(a), B: parse(b), C: parse(c), D: parse(d), E: parse(e), F: parse(f),
});

function parse(s: string): CelulaMatriz {
  if (s === "a") return "ativo";
  if (s === "d") return "dormente";
  return "vazio";
}

export const MATRIZ: BlocoMatriz[] = [
  {
    area: "Diretoria",
    linhas: [
      { agente: "CEO", celulas: cells("a","a","a","a","a","a") },
      { agente: "Estrategista", celulas: cells("_","_","a","a","_","a") },
      { agente: "Auditor", celulas: cells("_","_","_","a","_","_") },
    ],
  },
  {
    area: "Marca & marketing",
    linhas: [
      { agente: "Conteúdo", celulas: cells("a","_","_","_","d","a") },
      { agente: "Brand Voice", celulas: cells("a","_","a","_","_","a") },
      { agente: "Tráfego", celulas: cells("a","_","_","_","_","_") },
      { agente: "Calendário Editorial", celulas: cells("_","_","_","_","_","a") },
    ],
  },
  {
    area: "Comercial",
    linhas: [
      { agente: "Pré-venda", celulas: cells("a","a","_","_","_","_") },
      { agente: "Fechamento", celulas: cells("_","a","_","_","_","_") },
      { agente: "CRM & Follow-up", celulas: cells("a","a","a","_","_","_") },
    ],
  },
  {
    area: "Operações Internacionais",
    linhas: [
      { agente: "Logística do Paciente", celulas: cells("_","a","_","a","_","_") },
      { agente: "EUA", celulas: cells("a","_","_","a","_","_") },
      { agente: "Brasil", celulas: cells("_","a","_","a","_","_") },
    ],
  },
  {
    area: "Tecnologia & IA",
    linhas: [
      { agente: "Construtor", celulas: cells("_","_","_","a","_","_") },
      { agente: "Automação", celulas: cells("a","_","_","a","_","_") },
      { agente: "Dados", celulas: cells("a","_","a","a","_","_") },
    ],
  },
  {
    area: "Conhecimento + Fin/Jur",
    linhas: [
      { agente: "Curador", celulas: cells("_","_","a","_","d","_") },
      { agente: "Documentador", celulas: cells("_","_","a","_","_","_") },
      { agente: "Financeiro", celulas: cells("a","a","a","a","_","_") },
      { agente: "Jurídico", celulas: cells("_","_","_","d","_","_") },
    ],
  },
  {
    area: "Marca · futuro",
    linhas: [
      { agente: "Mentor", celulas: cells("_","_","_","_","d","_") },
    ],
  },
];
