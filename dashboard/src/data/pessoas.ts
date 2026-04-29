import type { Pessoa } from "./types";

export const NUCLEO: Pessoa[] = [
  {
    id: "augusto",
    iniciais: "AU",
    tipo: "socio",
    nome: "Augusto Miranda",
    papel: "CEO · cliente final de 5 das 6 áreas",
    descricao: "Liderança estratégica · relacionamento high-touch (Cintia, Cássio, Thomas) · operações internacionais · curadoria do conhecimento · direção editorial da marca pessoal.",
    saberContextoMacro: true,
    modelos: ["A", "B", "C", "D", "E", "F"],
  },
  {
    id: "pablo",
    iniciais: "PA",
    tipo: "socio",
    nome: "Pablo Bianchi",
    papel: "Diretor de Marca & Marketing · sócio potencial",
    descricao: "Lidera Marca & Marketing · co-responsável Lumina · canal de leads pra Modelo C via evento Goiânia. Direciona Antonio em Lumina marketing — NÃO no perfil pessoal do Augusto.",
    saberContextoMacro: true,
    modelos: ["A", "C", "F"],
  },
  {
    id: "matheus",
    iniciais: "MA",
    tipo: "socio",
    nome: "Matheus de Sousa",
    papel: "Diretor de Tecnologia & IA · sócio potencial",
    descricao: "Lidera Tec & IA · constrói os agentes (via Construtor) · MCP WhatsApp, dashboards, automações, futura plataforma D. Pouco contato com cliente — opera nos bastidores.",
    saberContextoMacro: true,
    modelos: ["D"],
  },
];

export const EXECUTORES: Pessoa[] = [
  {
    id: "antonio",
    iniciais: "AT",
    tipo: "executor",
    nome: "Antonio",
    papel: "Social Media · executor",
    descricao: "Recebe pauta pré-aprovada. No perfil F: Augusto comanda direto, Pablo apoia. Em Lumina: Pablo direciona. NÃO sabe do macro.",
    custoMensal: "R$ 1.000",
    saberContextoMacro: false,
    modelos: ["A", "F"],
  },
  {
    id: "well",
    iniciais: "WE",
    tipo: "executor",
    nome: "Well",
    papel: "Videomaker · executor + parceiro de network",
    descricao: "Edição de vídeo (Lumina + F do Augusto + futuras necessidades). Dupla relação aprovada (Primordialle terceirizado + Lumina + QG). Origem do Modelo B (apresentou Cássio).",
    custoMensal: "R$ 1.600 (8 vídeos)",
    saberContextoMacro: false,
    modelos: ["A", "B", "F"],
  },
  {
    id: "bryan",
    iniciais: "BR",
    tipo: "executor",
    nome: "Bryan",
    papel: "Gestor de tráfego · executor",
    descricao: "Operação de paid ads. Apoiado pelo agente Tráfego (cobre gap de proatividade). Quando Augusto sair, decide se Bryan vem junto.",
    custoMensal: "R$ 1.500",
    saberContextoMacro: false,
    modelos: ["A"],
  },
];

export const NETWORK: Pessoa[] = [
  {
    id: "andressa",
    iniciais: "AN",
    tipo: "hibrida",
    nome: "Andressa",
    papel: "Atendimento Lumina + liderada interna",
    descricao: "Caso especial: dupla função (interna do grupo + freelancer Lumina pelo Augusto). Uma das pessoas mais costuradas pra trazer junto na saída.",
    custoMensal: "R$ 2.500",
    saberContextoMacro: false,
    modelos: ["A"],
  },
];

export const CLIENTES: Pessoa[] = [
  {
    id: "cynthia",
    iniciais: "CY",
    tipo: "cliente",
    nome: "Dra. Cynthia Lumina",
    papel: "Cliente · Modelo A · clínica EUA",
    descricao: "Cliente high-touch do Modelo A (Lumina). Sócia do Dr. Rey na clínica. Contrato: $2.000 USD fixos + 10% por procedimento. Conversa de migração de contrato pré-saída ainda pendente.",
    saberContextoMacro: false,
    modelos: ["A"],
  },
  {
    id: "rey",
    iniciais: "RE",
    tipo: "cliente",
    nome: "Dr. Rey",
    papel: "Cliente · Modelo A · sócio da Dra. Cynthia",
    descricao: "Sócio da Dra. Cynthia Lumina na clínica EUA. Cliente do Modelo A junto com ela. Relacionamento direto com Augusto via WhatsApp.",
    saberContextoMacro: false,
    modelos: ["A"],
  },
  {
    id: "cassio",
    iniciais: "CA",
    tipo: "cliente",
    nome: "Dr. Cássio",
    papel: "Cliente · Modelo B · clínica capilar BR",
    descricao: "Cliente do Modelo B. 20% por caso direcionado. Origem da relação: Well apresentou. Pipeline atual: 1 caso em 2 semanas — modelo ainda não validado em volume.",
    saberContextoMacro: false,
    modelos: ["B"],
  },
  {
    id: "thomas",
    iniciais: "TH",
    tipo: "cliente",
    nome: "Thomas · Aesthetica",
    papel: "Cliente · Modelo D · turismo médico",
    descricao: "Único contato Aesthetica hoje · concentração de relacionamento. Sinalizou problema legal (Stark Law / Anti-Kickback Florida) e propôs intermediadora BR. Augusto seria Country Manager BR.",
    saberContextoMacro: false,
    modelos: ["D"],
  },
];

export const TODAS_PESSOAS = [...NUCLEO, ...EXECUTORES, ...NETWORK, ...CLIENTES];

export function pessoaById(id: string): Pessoa | undefined {
  return TODAS_PESSOAS.find((p) => p.id === id);
}

export const TIPO_LABELS: Record<Pessoa["tipo"], string> = {
  socio: "Sócio · núcleo macro",
  hibrida: "Híbrida · dupla função",
  executor: "Executor · escopo limitado",
  network: "Network · parceiro externo",
  cliente: "Cliente · relação externa",
};
