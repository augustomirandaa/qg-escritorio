import type { Tarefa, PrioridadeTarefa } from "./types";

/**
 * Calcula a diferença em dias inteiros (date - hoje).
 * Negativo = passado, 0 = hoje, positivo = futuro.
 */
function diasAte(prazoISO: string, hojeISO: string): number {
  const prazo = new Date(prazoISO + "T00:00:00");
  const hoje = new Date(hojeISO + "T00:00:00");
  return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export interface PrazoFormatado {
  label: string;
  urgencia: "atrasada" | "hoje" | "amanha" | "proxima-semana" | "futuro";
}

export function formatarPrazo(prazoISO: string | undefined, hojeISO: string): PrazoFormatado | null {
  if (!prazoISO) return null;
  const dias = diasAte(prazoISO, hojeISO);
  if (dias < 0) {
    const abs = Math.abs(dias);
    return { label: `atrasada · ${abs} dia${abs !== 1 ? "s" : ""}`, urgencia: "atrasada" };
  }
  if (dias === 0) return { label: "hoje", urgencia: "hoje" };
  if (dias === 1) return { label: "amanhã", urgencia: "amanha" };
  if (dias <= 7) return { label: `em ${dias} dias`, urgencia: "proxima-semana" };
  return { label: `em ${dias} dias`, urgencia: "futuro" };
}

const PRIORIDADE_PESO: Record<PrioridadeTarefa, number> = { alta: 0, normal: 1 };

/**
 * Ordena tarefas: alta prioridade primeiro, depois por prazo asc (sem prazo no fim),
 * depois alfabético.
 */
export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    const pa = PRIORIDADE_PESO[a.prioridade ?? "normal"];
    const pb = PRIORIDADE_PESO[b.prioridade ?? "normal"];
    if (pa !== pb) return pa - pb;

    if (a.prazo && b.prazo) return a.prazo < b.prazo ? -1 : a.prazo > b.prazo ? 1 : 0;
    if (a.prazo && !b.prazo) return -1;
    if (!a.prazo && b.prazo) return 1;

    return a.titulo.localeCompare(b.titulo, "pt-BR");
  });
}

/** Hoje em ISO date (UTC-naive). Útil pra renderizar prazos relativos no SSR. */
export function hojeISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
