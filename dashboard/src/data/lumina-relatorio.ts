export type MesAbrev =
  | "jan" | "fev" | "mar" | "abr" | "mai" | "jun"
  | "jul" | "ago" | "set" | "out" | "nov" | "dez";

export interface MetricaMensal {
  mes: MesAbrev;
  ano: number;
  investimento: number;     // gasto em ads (USD)
  leads: number;             // leads gerados
  custoPorLead: number;      // CPL (USD) — pode ser derivado, mas mantemos do source
  consultasOnline: number;
  consultasPresenciais: number;
  fechamentos: number;
  faturamento: number;       // receita do mês (USD)
}

export const LUMINA_2026: MetricaMensal[] = [
  {
    mes: "fev",
    ano: 2026,
    investimento: 792.19,
    leads: 139,
    custoPorLead: 5.70,
    consultasOnline: 0,
    consultasPresenciais: 3,
    fechamentos: 1,
    faturamento: 12000,
  },
  {
    mes: "mar",
    ano: 2026,
    investimento: 1091.93,
    leads: 163,
    custoPorLead: 6.70,
    consultasOnline: 0,
    consultasPresenciais: 1,
    fechamentos: 1,
    faturamento: 6000,
  },
  {
    mes: "abr",
    ano: 2026,
    investimento: 922.44,
    leads: 137,
    custoPorLead: 6.73,
    consultasOnline: 5,
    consultasPresenciais: 6,
    fechamentos: 1,
    faturamento: 10000,
  },
];

export const MES_NOME: Record<MesAbrev, string> = {
  jan: "Janeiro", fev: "Fevereiro", mar: "Março", abr: "Abril",
  mai: "Maio", jun: "Junho", jul: "Julho", ago: "Agosto",
  set: "Setembro", out: "Outubro", nov: "Novembro", dez: "Dezembro",
};

export interface MetricaDerivada {
  totalConsultas: number;             // online + presenciais
  taxaLeadConsulta: number;           // consultas / leads
  taxaConsultaFechamento: number;     // fechamentos / consultas
  taxaLeadFechamento: number;         // fechamentos / leads
  ticketMedio: number;                // faturamento / fechamentos
  roas: number;                       // faturamento / investimento
}

export function calcularDerivadas(m: MetricaMensal): MetricaDerivada {
  const totalConsultas = m.consultasOnline + m.consultasPresenciais;
  return {
    totalConsultas,
    taxaLeadConsulta: m.leads > 0 ? totalConsultas / m.leads : 0,
    taxaConsultaFechamento: totalConsultas > 0 ? m.fechamentos / totalConsultas : 0,
    taxaLeadFechamento: m.leads > 0 ? m.fechamentos / m.leads : 0,
    ticketMedio: m.fechamentos > 0 ? m.faturamento / m.fechamentos : 0,
    roas: m.investimento > 0 ? m.faturamento / m.investimento : 0,
  };
}

export function delta(atual: number, anterior: number): { abs: number; pct: number } | null {
  if (anterior === 0) return null;
  return { abs: atual - anterior, pct: (atual - anterior) / anterior };
}
