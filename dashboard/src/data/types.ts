export type ProjetoId = "A" | "B" | "C" | "D" | "E" | "F";

export type AreaKey =
  | "diretoria"
  | "marca"
  | "comercial"
  | "ops"
  | "tec"
  | "conhecimento";

export type StatusClass = "success" | "warning" | "info" | "neutral" | "danger";

export type AvatarType = "socio" | "hibrida" | "executor" | "network" | "cliente";

export type StatusTarefa = "pendente" | "em-progresso" | "feita";
export type PrioridadeTarefa = "alta" | "normal";

export interface Tarefa {
  titulo: string;
  responsavelId: string;
  status: StatusTarefa;
  porQue?: string;
  notas?: string;
  prazo?: string;          // ISO date YYYY-MM-DD
  prioridade?: PrioridadeTarefa; // default 'normal' se não informada
}

export interface Briefing {
  contexto: string;
  objetivo: string;
  momento: string;
}

export type TipoConexao =
  | "whatsapp"
  | "instagram"
  | "meta-ads"
  | "google-ads"
  | "email"
  | "drive"
  | "notion"
  | "crm"
  | "calendar"
  | "mcp"
  | "planilha"
  | "site"
  | "outra";

export type StatusConexao = "conectado" | "pendente" | "planejado" | "desconectado";

export interface Conexao {
  tipo: TipoConexao;
  nome: string;
  descricao: string;
  status: StatusConexao;
  responsavelId?: string;
}

export const TIPO_CONEXAO_LABEL: Record<TipoConexao, { sigla: string; nome: string }> = {
  whatsapp: { sigla: "WA", nome: "WhatsApp" },
  instagram: { sigla: "IG", nome: "Instagram" },
  "meta-ads": { sigla: "MA", nome: "Meta Ads" },
  "google-ads": { sigla: "GA", nome: "Google Ads" },
  email: { sigla: "EM", nome: "Email" },
  drive: { sigla: "DR", nome: "Drive" },
  notion: { sigla: "NT", nome: "Notion" },
  crm: { sigla: "CR", nome: "CRM" },
  calendar: { sigla: "CL", nome: "Calendar" },
  mcp: { sigla: "MCP", nome: "MCP custom" },
  planilha: { sigla: "PL", nome: "Planilha" },
  site: { sigla: "ST", nome: "Site" },
  outra: { sigla: "—", nome: "Outra" },
};

export interface PessoaRef {
  iniciais: string;
  tipo: AvatarType;
  nome: string;
  papel: string;
}

export interface AgenteRef {
  nome: string;
  area: AreaKey;
  funcao: string;
  dormente?: boolean;
}

export interface Projeto {
  id: ProjetoId;
  titulo: string;
  apelido: string;
  meta: string;
  status: string;
  statusClass: StatusClass;
  tip: string;
  briefing?: Briefing;
  humanos: PessoaRef[];
  agentes: AgenteRef[];
  conexoes?: Conexao[];
  tarefas: Tarefa[];
  riscos: string[];
  relatorioPath?: string;
  secreto?: boolean;
}

export interface Pessoa {
  id: string;
  iniciais: string;
  tipo: AvatarType;
  nome: string;
  papel: string;
  descricao: string;
  custoMensal?: string;
  saberContextoMacro: boolean;
  modelos: ProjetoId[];
}

export interface Agente {
  id: string;
  nome: string;
  area: AreaKey;
  funcao: string;
  fase: "ativo" | "dormente" | "futuro";
  prioridade?: 1 | 2 | 3;
  modelos: ProjetoId[];
}

export const AREA_NOMES: Record<AreaKey, string> = {
  diretoria: "Diretoria",
  marca: "Marca & Marketing",
  comercial: "Comercial",
  ops: "Operações Internacionais",
  tec: "Tecnologia & IA",
  conhecimento: "Conhecimento + Fin/Jur",
};

export const AREA_NOMES_CURTO: Record<AreaKey, string> = {
  diretoria: "Diretoria",
  marca: "Marca",
  comercial: "Comercial",
  ops: "Ops Intl",
  tec: "Tec & IA",
  conhecimento: "Conhec/FinJur",
};
