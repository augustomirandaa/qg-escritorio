# Briefing · Escritório virtual v2 (multi-tab)

Refatorar a rota `/escritorio` (atualmente um isométrico estático) para um **dashboard multi-tab funcional** que serve a operação AI-first do QG. Vai ser usado várias vezes ao dia por Augusto + sócios + executores + clientes — cada um com permissões diferentes.

---

## TL;DR pra implementação

1. Converter `/escritorio` em **navegação por abas** com 6 views (Decisões / Mission Control / Projetos / Equipe / Feed / Saúde).
2. Adicionar **camada de permissões** (Augusto / Pablo / Matheus / executores / cliente).
3. Adicionar **sistema de tarefas** atribuídas a humanos E a agentes IA.
4. Adicionar **feed de eventos** (atividade dos agentes + decisões geradas).
5. Implementar **hover-to-see-tasks** em qualquer card de pessoa/agente.
6. Criar rota dedicada de cliente: `/escritorio/cliente/[projeto]` filtrada.

**Referência visual:** `docs/escritorio-v2/mockup-referencia.html` — abre no browser, navega pelas 6 abas. É o destino final do design.

---

## 1. Estrutura de rotas

```
/escritorio                          → aba "Decisões" (default)
/escritorio/decisoes                 → mesmo que /escritorio (alias)
/escritorio/mission-control          → tela densa Bloomberg-style
/escritorio/projetos                 → grid de project cards
/escritorio/equipe                   → escritório de pessoas (com hover de tarefas)
/escritorio/feed                     → stream/timeline conversacional
/escritorio/saude                    → health board (planilha)

/escritorio/cliente/[id]             → portal do cliente (só projeto dele · não requer login na fase 1, link único; fase 2 com auth)
/escritorio/projeto/[id]             → drill-down de um projeto específico
/escritorio/agente/[id]              → drill-down de um agente IA
/escritorio/pessoa/[id]              → drill-down de uma pessoa
```

Todas as abas compartilham o mesmo `Header` (nav existente da plataforma) + um sub-header com tabs específicas do `/escritorio`.

---

## 2. Modelo de dados novo

### 2.1 Tarefas (`src/data/tarefas-escritorio.ts`)

```ts
export interface Tarefa {
  id: string;
  title: string;
  description?: string;
  state: 'fazendo' | 'pendente' | 'planejando' | 'concluida' | 'critica';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  assignedTo: string;          // id da pessoa ou agente IA
  assignedKind: 'human' | 'agent';
  projectId: string;            // 'A' | 'B' | ... | 'F'
  createdAt: string;
  dueAt?: string;
  parentDecisionId?: string;    // se a tarefa veio de uma decisão pendente
}

export const TAREFAS: Tarefa[] = [
  // ver mockup-referencia.html · seção "Escritório de Pessoas" · cada hover popup mostra tarefas reais
  // popular com ~30-40 tarefas iniciais, espalhadas entre humanos e agentes IA
];
```

### 2.2 Decisões pendentes (`src/data/decisoes.ts`)

```ts
export interface Decisao {
  id: string;
  title: string;
  context: string;              // markdown OK
  priority: 'critica' | 'alta' | 'media' | 'baixa';
  triggeredBy: string;          // id do agente IA que gerou
  projectId?: string;
  createdAt: string;
  options: { label: string; action: string; primary?: boolean; danger?: boolean }[];
  resolvedAt?: string;
  resolution?: string;
  visibleTo: string[];          // ids de pessoas que podem decidir (ex: ['p-au'] ou ['p-au','p-pa'])
}

export const DECISOES: Decisao[] = [
  // ver mockup · 3 decisões iniciais: Stark Law (D, crítica) · Aprovar Cynthia (A, alta) · Cássio parado (B, média)
];
```

### 2.3 Feed (`src/data/feed.ts`)

```ts
export interface FeedItem {
  id: string;
  type: 'agent_output' | 'human_action' | 'decision' | 'financial' | 'system';
  authorId: string;             // id do agente ou pessoa
  authorKind: 'agent' | 'human' | 'system';
  projectId?: string;
  timestamp: string;
  text: string;                 // markdown OK · pode incluir @menções
  awaitingFrom?: string[];      // ids de pessoas que precisam reagir
  metadata?: Record<string, unknown>;
}

export const FEED: FeedItem[] = [
  // ver mockup · seção Stream · ~10-15 itens iniciais
];
```

### 2.4 Permissões (`src/data/permissoes.ts`)

```ts
export type Papel = 'admin' | 'socio' | 'diretor' | 'executor' | 'cliente';

export interface Usuario {
  id: string;
  papel: Papel;
  projetosVisiveis: string[];   // letras A..F · ['*'] = todos
  podeAprovar: boolean;
  podeEditar: boolean;
}

export const USUARIOS: Record<string, Usuario> = {
  'p-au': { id:'p-au', papel:'admin',    projetosVisiveis:['*'],     podeAprovar:true,  podeEditar:true },
  'p-pa': { id:'p-pa', papel:'diretor',  projetosVisiveis:['A','C','F'], podeAprovar:true,  podeEditar:true },
  'p-ma': { id:'p-ma', papel:'diretor',  projetosVisiveis:['D'],     podeAprovar:true,  podeEditar:true },

  // 1ª fase
  'p-at': { id:'p-at', papel:'executor', projetosVisiveis:['A','F'], podeAprovar:false, podeEditar:false },

  // 2ª fase (já mapeados, login bloqueado por enquanto)
  'p-we': { id:'p-we', papel:'executor', projetosVisiveis:['A','B','F'], podeAprovar:false, podeEditar:false, _ativo:false },
  'p-br': { id:'p-br', papel:'executor', projetosVisiveis:['A'],     podeAprovar:false, podeEditar:false, _ativo:false },
  'p-an': { id:'p-an', papel:'executor', projetosVisiveis:['A'],     podeAprovar:false, podeEditar:false, _ativo:false },
  'p-renan': { id:'p-renan', papel:'executor', projetosVisiveis:[], podeAprovar:false, podeEditar:false, _ativo:false },
  'p-lucas': { id:'p-lucas', papel:'executor', projetosVisiveis:[], podeAprovar:false, podeEditar:false, _ativo:false },

  // Clientes (acesso restrito ao próprio projeto)
  'p-cy': { id:'p-cy', papel:'cliente',  projetosVisiveis:['A'], podeAprovar:false, podeEditar:false },
  'p-re': { id:'p-re', papel:'cliente',  projetosVisiveis:['A'], podeAprovar:false, podeEditar:false },
  'p-ca': { id:'p-ca', papel:'cliente',  projetosVisiveis:['B'], podeAprovar:false, podeEditar:false },
  'p-th': { id:'p-th', papel:'cliente',  projetosVisiveis:['D'], podeAprovar:false, podeEditar:false },
};

// helper
export function podeVerProjeto(usuario: Usuario, projetoLetra: string): boolean {
  return usuario.projetosVisiveis.includes('*') || usuario.projetosVisiveis.includes(projetoLetra);
}
```

### 2.5 Sessão / "Ver como" (fase 1: client-side)

Fase 1: simular usuário ativo via dropdown no topo (selectbox que escreve `localStorage.qg_user_view`).
Fase 2: auth real (Astro middleware + cookie), JWT ou similar. Pode ficar pra depois.

```ts
// src/lib/sessao.ts
export function getUsuarioAtual(): Usuario {
  if (typeof window === 'undefined') return USUARIOS['p-au']; // SSR default
  const id = localStorage.getItem('qg_user_view') || 'p-au';
  return USUARIOS[id] || USUARIOS['p-au'];
}
```

---

## 3. Componentes a criar

```
src/components/escritorio/
├── EscritorioTabs.astro         # Sub-nav com as 6 abas + seletor "Ver como"
├── HoverTasks.astro             # Componente de popup com lista de tarefas (usado em todos os cards de pessoa/agente)
├── tabs/
│   ├── DecisoesPendentes.astro  # Aba 1 (default)
│   ├── MissionControl.astro     # Aba 2
│   ├── ProjectCards.astro       # Aba 3
│   ├── EscritorioPessoas.astro  # Aba 4 (escritório de pessoas com hover)
│   ├── StreamFeed.astro         # Aba 5
│   └── HealthBoard.astro        # Aba 6
├── PersonaCard.astro            # Card reutilizável de pessoa/agente · expõe `<HoverTasks />`
├── ProjectCard.astro            # Card reutilizável de projeto · usado em vários lugares
└── ClientePortal.astro          # Vista filtrada pra cliente (rota /cliente/[id])
```

---

## 4. Comportamento por aba

### 4.1 Decisões Pendentes (default)
- Lista de decisões (de `DECISOES`) filtrada por `visibleTo` do usuário atual.
- Cada item tem: prioridade colorida (crítica/alta/média), título, contexto, ações.
- Ao clicar numa ação: marca decisão como resolvida + adiciona ao feed.
- Quando vazio: card cinza "tudo rolando sozinho · sem decisões pendentes".

### 4.2 Mission Control
- Faixa de alertas no topo (decisões críticas + projetos em risco).
- Grid 3×2 de cards de projeto (filtrar por permissão).
- Lateral direita: feed ao vivo (últimos 7 itens).
- Rodapé: 4 KPIs (agentes ativos / rodando agora / receita / humanos online).

### 4.3 Project Cards
- Grid de cards grandes (1 por projeto visível ao usuário).
- Cada card: header (letra+nome+status+receita), tarefas em andamento (top 3-4), time (avatares com hover), ações (Abrir / + Tarefa / Convidar cliente).
- Botão "Convidar cliente" só aparece pra `papel: admin | diretor`.

### 4.4 Escritório de Pessoas
- Substitui o isométrico atual.
- Zonas agrupadas por papel: Núcleo (sócios) · Executores Marketing · Agentes IA Marketing · Comercial · Dev & IA · Biblioteca · Clientes.
- Cada pessoa/agente é um card.
- **Hover** = popup escuro com 5 tarefas mais relevantes + "Ver todas →".
- Status dot ao vivo (online/busy/offline pra humanos; running/idle/dormente pra agentes).
- Renan e Lucas aparecem opacidade 0.55 com badge "+ pendente · 2ª fase".

### 4.5 Stream / Feed
- Lista vertical de `FEED` (ordenada desc, separadores por dia).
- Filtros laterais: por projeto, por tipo (decisão / output IA / humano / financeiro).
- Cada item: avatar + nome + tag de projeto + timestamp + texto + ações inline (aprovar/editar/responder).
- Itens com `awaitingFrom` que inclui o usuário atual ficam destacados (fundo amarelo claro).

### 4.6 Health Board
- Tabela principal: 1 linha por projeto, colunas Saúde / Status / Receita / Agentes (X/Y) / Tarefas / Equipe (mini avatares) / Última atividade / Ação.
- Tabela secundária 1: Agentes IA · status / projetos / tarefas / sucesso.
- Tabela secundária 2: Humanos · status / tarefas hoje / próxima.
- Tudo sortable e filtrável.
- Tudo respeita permissões.

---

## 5. Hover de tarefas (recurso central)

Componente reutilizável `<HoverTasks />`:

```astro
---
import { TAREFAS } from '../data/tarefas-escritorio';
interface Props { ownerId: string; ownerKind: 'human' | 'agent'; }
const { ownerId, ownerKind } = Astro.props;
const tarefas = TAREFAS.filter(t => t.assignedTo === ownerId).slice(0, 5);
---
<div class="hover-tasks-pop">
  <h6>{tarefas.length} tarefas</h6>
  <ul>
    {tarefas.map(t => (
      <li>
        <span class={`pri ${t.priority}`}>{t.priority === 'critica' ? '!' : '·'}</span>
        <div>
          <b>{t.title}</b>
          {t.parentDecisionId && <div class="from">de uma decisão pendente</div>}
        </div>
      </li>
    ))}
  </ul>
  <a class="more" href={`/escritorio/${ownerKind === 'human' ? 'pessoa' : 'agente'}/${ownerId}`}>Ver todas →</a>
</div>
```

CSS no mockup: `.ep-tasks-pop` (fundo escuro #1a1a18, branco, popover position absolute).

Aplicar em **todos** os cards de pessoa/agente em qualquer aba (Mission Control, Cards, Pessoas, Health, Stream).

---

## 6. Portal do cliente

Rota `/escritorio/cliente/[id]` (id do cliente, ex: `p-cy`):

- Sem o Header global do QG (interface limpa, focada).
- Header próprio: "Olá, Dra. Cynthia · Modelo A · Lumina".
- Conteúdo: 1 Project Card grande do projeto dele + Stream filtrado SÓ desse projeto + KPIs do projeto.
- Sem decisões, sem health board, sem outras abas.
- Fase 1: link público `/escritorio/cliente/p-cy?token=XXX` (token simples). Fase 2: magic link via email.
- Botões "Falar com a equipe" → abre WhatsApp com Andressa.

---

## 7. Manter / migrar

- ✅ Manter o atual `escritorio.astro` mas renomear pra `escritorio-isometrico.astro` (vira página secundária acessível em `/escritorio/planta`, usuário pode preferir essa vista lúdica em momentos casuais).
- ✅ Manter os dados existentes de `AGENTS` e `PEOPLE` (estão bons, apenas adicionar tarefas + decisões).
- ❌ Remover do nav principal o link "Escritório virtual" e substituir por dropdown/menu se virar muitas sub-rotas. Ou manter o mesmo link e ele leva pra `/escritorio` (que é Decisões por default).
- ✅ Atualizar `Header.astro` se necessário (verificar se a aba Escritório virtual ainda combina).

---

## 8. Checklist de aceitação

Quando estiver pronto, validar:

- [ ] `/escritorio` abre direto na aba Decisões Pendentes
- [ ] Sub-nav de 6 abas funciona
- [ ] Seletor "Ver como" no topo direito troca a perspectiva sem reload
- [ ] Como Augusto: vê todos os 6 projetos
- [ ] Como Pablo: vê só A, C, F (os outros somem em todas as abas)
- [ ] Como cliente Cynthia: vê só A, e idealmente é redirecionado pra `/escritorio/cliente/p-cy`
- [ ] Hover em qualquer card de pessoa/agente mostra popup de tarefas
- [ ] Click em decisão dispara ação (ainda que stub, console.log + adicionar ao feed)
- [ ] Build (`npm run build`) passa sem erro
- [ ] Mobile: pelo menos uma aba (Decisões) funciona em < 600px
- [ ] Layout consistente com a plataforma (Tailwind, tokens existentes em `global.css`)

---

## 9. Stack a usar

Tudo que já tá no projeto:

- **Astro** (estático)
- **Tailwind 4** com tokens em `src/styles/global.css` (`bg-canvas`, `bg-muted`, `text-soft`, `bg-info-bg`, etc — usar esses!)
- TypeScript em `src/data/`
- Componentes em `src/components/escritorio/`
- Sem novas dependências externas idealmente.

Pra interatividade (tabs, hover, "ver como"), Astro `<script>` inline é OK. Não precisa framework.

---

## 10. Comando que o Augusto vai colar no Claude Code

```
Ler docs/escritorio-v2/BRIEFING.md.

Usar docs/escritorio-v2/mockup-referencia.html como referência visual exata
do destino final (abrir no browser pra ver as 6 abas + hover de tarefas).

Implementar a refatoração do /escritorio conforme o briefing. Manter o atual
escritorio.astro como /escritorio/planta (renomear para escritorio-isometrico.astro).

Commitar em commits pequenos e bem descritos. Rodar npm run build após cada mudança
relevante pra garantir que nada quebra. Quando concluir, rodar
bash scripts/deploy-brochure.sh pra subir na VPS.
```
