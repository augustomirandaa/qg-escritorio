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

// Argumentos na ordem das colunas do PROJETO_IDS: A, A2, A3, B, C, D, E, F
const cells = (
  a: string, a2: string, a3: string,
  b: string, c: string, d: string, e: string, f: string
): Record<ProjetoId, CelulaMatriz> => ({
  A: parse(a), A2: parse(a2), A3: parse(a3),
  B: parse(b), C: parse(c), D: parse(d), E: parse(e), F: parse(f),
});

function parse(s: string): CelulaMatriz {
  if (s === "a") return "ativo";
  if (s === "d") return "dormente";
  return "vazio";
}

// Convenção pra A2/A3 (variantes de A · growth partner):
//   - Agentes que tocam A (Lumina) tipicamente tocam A2 (Avak: ativo) e A3 (Steph: dormente,
//     ainda em estruturação) · exceções: Brand Voice (específico Augusto), Calendário Editorial F
export const MATRIZ: BlocoMatriz[] = [
  {
    area: "Diretoria",
    linhas: [
      // A   A2  A3  B   C   D   E   F
      { agente: "CEO",          celulas: cells("a","a","a","a","a","a","a","a") },
      { agente: "Estrategista", celulas: cells("_","_","_","_","a","a","_","a") },
      { agente: "Auditor",      celulas: cells("_","_","_","_","_","a","_","_") },
    ],
  },
  {
    area: "Marca & marketing",
    linhas: [
      { agente: "Conteúdo",            celulas: cells("a","a","d","_","_","_","d","a") },
      { agente: "Brand Voice",         celulas: cells("a","_","_","_","a","_","_","a") },
      { agente: "Tráfego",             celulas: cells("a","a","d","_","_","_","_","_") },
      { agente: "Calendário Editorial",celulas: cells("_","_","_","_","_","_","_","a") },
    ],
  },
  {
    area: "Comercial",
    linhas: [
      { agente: "Pré-venda",       celulas: cells("a","a","d","a","_","_","_","_") },
      { agente: "Fechamento",      celulas: cells("_","_","_","a","_","_","_","_") },
      { agente: "CRM & Follow-up", celulas: cells("a","a","d","a","a","_","_","_") },
    ],
  },
  {
    area: "Operações Internacionais",
    linhas: [
      { agente: "Logística do Paciente", celulas: cells("_","_","_","a","_","a","_","_") },
      { agente: "EUA",                   celulas: cells("a","a","d","_","_","a","_","_") },
      { agente: "Brasil",                celulas: cells("_","_","_","a","_","a","_","_") },
    ],
  },
  {
    area: "Tecnologia & IA",
    linhas: [
      { agente: "Construtor", celulas: cells("_","_","_","_","_","a","_","_") },
      { agente: "Automação",  celulas: cells("a","a","d","_","_","a","_","_") },
      { agente: "Dados",      celulas: cells("a","a","d","_","a","a","_","_") },
    ],
  },
  {
    area: "Conhecimento + Fin/Jur",
    linhas: [
      { agente: "Curador",      celulas: cells("_","_","_","_","a","_","d","_") },
      { agente: "Documentador", celulas: cells("_","d","_","_","a","_","_","_") },
      { agente: "Financeiro",   celulas: cells("a","a","a","a","a","a","_","_") },
      { agente: "Jurídico",     celulas: cells("_","_","_","_","_","d","_","_") },
    ],
  },
  {
    area: "Marca · futuro",
    linhas: [
      { agente: "Mentor", celulas: cells("_","_","_","_","_","_","d","_") },
    ],
  },
];
