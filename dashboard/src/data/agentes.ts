import type { Agente, AreaKey } from "./types";

export const AGENTES: Agente[] = [
  // Diretoria
  { id: "ceo", nome: "CEO", area: "diretoria", funcao: "Síntese executiva semanal, priorização entre modelos, decisões irreversíveis", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3","B","C","D","E","F"] },
  { id: "estrategista", nome: "Estrategista", area: "diretoria", funcao: "Análises de trade-off, planos 30/60/90, sparring partner pra grandes decisões", fase: "ativo", prioridade: 1, modelos: ["C","D","F"] },
  { id: "auditor", nome: "Auditor", area: "diretoria", funcao: "Red team antes de decisões importantes, checagem de premissas", fase: "ativo", prioridade: 1, modelos: ["D"] },

  // Marca & Marketing
  { id: "conteudo", nome: "Conteúdo", area: "marca", funcao: "Roteiros, copywriting, ideação (foco em F + apoia A/A2/A3)", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3","E","F"] },
  { id: "brand-voice", nome: "Brand Voice", area: "marca", funcao: "Mantém narrativa consistente do Augusto", fase: "ativo", prioridade: 1, modelos: ["A","C","F"] },
  { id: "trafego", nome: "Tráfego", area: "marca", funcao: "Apoio Bryan · monitora campanhas, gera relatórios automáticos, alerta gargalos, cria briefings", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3"] },
  { id: "calendario-editorial", nome: "Calendário Editorial", area: "marca", funcao: "Coordena cadência, gerencia pauta dos 3 pilares", fase: "ativo", prioridade: 1, modelos: ["F"] },
  { id: "mentor", nome: "Mentor", area: "marca", funcao: "Só ativa pós-saída · roteiriza conteúdo educacional", fase: "futuro", modelos: ["E"] },

  // Comercial
  { id: "pre-venda", nome: "Pré-venda", area: "comercial", funcao: "Qualifica leads, BANT/SPIN, agenda calls", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3","B"] },
  { id: "fechamento", nome: "Fechamento", area: "comercial", funcao: "Scripts high ticket EUA + BR, objeções, propostas", fase: "ativo", prioridade: 2, modelos: ["B"] },
  { id: "crm-follow-up", nome: "CRM & Follow-up", area: "comercial", funcao: "Pipeline, automações, tempo de resposta", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3","B","C"] },

  // Operações Internacionais
  { id: "logistica-paciente", nome: "Logística do Paciente", area: "ops", funcao: "Hotel, traslado, jornada (B + D)", fase: "ativo", prioridade: 2, modelos: ["B","D"] },
  { id: "eua", nome: "EUA", area: "ops", funcao: "Context expert mercado americano (clínicas, pacientes, regulação)", fase: "ativo", prioridade: 2, modelos: ["A","A2","A3","D"] },
  { id: "brasil", nome: "Brasil", area: "ops", funcao: "Context expert mercado brasileiro (parceiros, providers, regulação CFM/CFO)", fase: "ativo", prioridade: 2, modelos: ["B","D"] },

  // Tecnologia & IA
  { id: "construtor", nome: "Construtor", area: "tec", funcao: "Cria/itera os outros agentes (meta)", fase: "ativo", prioridade: 1, modelos: ["D"] },
  { id: "automacao", nome: "Automação", area: "tec", funcao: "n8n, MCPs, integrações (CRM, WhatsApp)", fase: "ativo", prioridade: 1, modelos: ["A","A2","A3","D"] },
  { id: "dados", nome: "Dados", area: "tec", funcao: "Dashboards, KPIs por modelo", fase: "ativo", prioridade: 2, modelos: ["A","A2","A3","C","D"] },

  // Conhecimento + Fin/Jur
  { id: "curador", nome: "Curador", area: "conhecimento", funcao: "Mantém workspace, dossiês, decisões atualizados", fase: "ativo", prioridade: 1, modelos: ["C","E"] },
  { id: "documentador", nome: "Documentador", area: "conhecimento", funcao: "Extrai playbooks da cabeça do Augusto (urgente: Lumina + variantes A2/A3)", fase: "ativo", prioridade: 1, modelos: ["A2","C"] },
  { id: "financeiro", nome: "Financeiro", area: "conhecimento", funcao: "Caixa, comissões, projeções, pricing", fase: "dormente", modelos: ["A","A2","A3","B","C","D"] },
  { id: "juridico", nome: "Jurídico", area: "conhecimento", funcao: "Contratos, validações (sinaliza quando precisa advogado humano)", fase: "dormente", modelos: ["D"] },
];

export const AGENTES_POR_AREA: Record<AreaKey, Agente[]> = {
  diretoria: AGENTES.filter(a => a.area === "diretoria"),
  marca: AGENTES.filter(a => a.area === "marca"),
  comercial: AGENTES.filter(a => a.area === "comercial"),
  ops: AGENTES.filter(a => a.area === "ops"),
  tec: AGENTES.filter(a => a.area === "tec"),
  conhecimento: AGENTES.filter(a => a.area === "conhecimento"),
};

export const TOTAL_AGENTES = AGENTES.length;
export const ATIVOS_FASE_0 = AGENTES.filter(a => a.fase === "ativo" && a.prioridade === 1).length;
