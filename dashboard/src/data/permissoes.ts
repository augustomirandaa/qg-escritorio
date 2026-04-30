import type { ProjetoId } from "./types";

export type Papel = "admin" | "socio" | "diretor" | "executor" | "cliente";

export interface Usuario {
  id: string;
  nome: string;
  iniciais: string;
  papel: Papel;
  projetosVisiveis: ProjetoId[] | ["*"];
  podeAprovar: boolean;
  podeEditar: boolean;
  ativo?: boolean;
}

export const USUARIOS: Record<string, Usuario> = {
  augusto: { id: "augusto", nome: "Augusto", iniciais: "AU", papel: "admin",   projetosVisiveis: ["*"],            podeAprovar: true,  podeEditar: true,  ativo: true },
  pablo:   { id: "pablo",   nome: "Pablo",   iniciais: "PA", papel: "diretor", projetosVisiveis: ["A","A2","A3","C","F"], podeAprovar: true,  podeEditar: true,  ativo: true },
  matheus: { id: "matheus", nome: "Matheus", iniciais: "MA", papel: "diretor", projetosVisiveis: ["D"],            podeAprovar: true,  podeEditar: true,  ativo: true },
  antonio: { id: "antonio", nome: "Antonio", iniciais: "AT", papel: "executor",projetosVisiveis: ["A","F"],        podeAprovar: false, podeEditar: false, ativo: true },
  well:    { id: "well",    nome: "Well",    iniciais: "WE", papel: "executor",projetosVisiveis: ["A","B","F"],    podeAprovar: false, podeEditar: false, ativo: false },
  bryan:   { id: "bryan",   nome: "Bryan",   iniciais: "BR", papel: "executor",projetosVisiveis: ["A"],            podeAprovar: false, podeEditar: false, ativo: false },
  andressa:{ id: "andressa",nome: "Andressa",iniciais: "AN", papel: "executor",projetosVisiveis: ["A"],            podeAprovar: false, podeEditar: false, ativo: true },
  cynthia: { id: "cynthia", nome: "Dra. Cynthia", iniciais: "CY", papel: "cliente", projetosVisiveis: ["A"],       podeAprovar: false, podeEditar: false, ativo: true },
  rey:     { id: "rey",     nome: "Dr. Rey", iniciais: "RE", papel: "cliente", projetosVisiveis: ["A"],            podeAprovar: false, podeEditar: false, ativo: true },
  cassio:  { id: "cassio",  nome: "Dr. Cássio", iniciais: "CA", papel: "cliente", projetosVisiveis: ["B"],         podeAprovar: false, podeEditar: false, ativo: true },
  thomas:  { id: "thomas",  nome: "Thomas",  iniciais: "TH", papel: "cliente", projetosVisiveis: ["D"],            podeAprovar: false, podeEditar: false, ativo: true },
};

export const SELETOR_USUARIOS: { id: string; label: string }[] = [
  { id: "augusto", label: "Augusto · acesso total" },
  { id: "pablo",   label: "Pablo · marketing + A/C/F" },
  { id: "matheus", label: "Matheus · dev + D" },
  { id: "antonio", label: "Antonio · executor (A, F)" },
  { id: "cynthia", label: "Dra. Cynthia · cliente (vê só A)" },
];

export function podeVerProjeto(usuario: Usuario, projetoId: ProjetoId): boolean {
  return usuario.projetosVisiveis.includes("*") || (usuario.projetosVisiveis as string[]).includes(projetoId);
}

export function projetosVisiveisIds(usuario: Usuario, todos: ProjetoId[]): ProjetoId[] {
  if (usuario.projetosVisiveis.includes("*")) return todos;
  return todos.filter((id) => (usuario.projetosVisiveis as string[]).includes(id));
}
