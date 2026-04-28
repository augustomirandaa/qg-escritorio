# ARCHITECTURE · desenho técnico do QG

> Versão 0.1 · 28 abr 2026
> Mudanças significativas precisam de discussão entre os 3 sócios antes de commit

---

## Princípio fundamental

**Notion = onde humanos escrevem · VPS = onde agentes rodam.**

Os dois sistemas se conectam via sync de conteúdo Notion → vector DB no VPS, alimentando os agentes com contexto fresco.

Isso evita o anti-padrão de duplicar onde escrever as coisas.

---

## Topologia

```
┌──────────────────────────────────────────────────────────┐
│                       NOTION                             │
│  Workspace QG · 6 seções                                 │
│  Augusto, Pablo, Matheus escrevem aqui                   │
│  Decisões, playbooks, dossiês, briefings, tarefas        │
└──────────────────────────┬───────────────────────────────┘
                           │
                  cron · sync notion → vector
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│           VPS HOSTINGER · KVM 2 · Ubuntu 24.04           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │             Caddy (reverse proxy + TLS)            │ │
│  │    qg.<dominio>.com → Anything LLM                 │ │
│  │    api.qg.<dominio>.com → MCPs / webhooks          │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │       Anything LLM (chat multi-usuário · 3000)     │ │
│  │    - Augusto · login                               │ │
│  │    - Pablo · login                                 │ │
│  │    - Matheus · login                               │ │
│  │    - Workspace compartilhado: "QG"                 │ │
│  │    - 21 agentes como personas + system prompts     │ │
│  │    - RAG sobre documents + vector DB               │ │
│  │    - Conexão: Claude API (Anthropic)               │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│        ┌──────────────┼──────────────┐                   │
│        ▼              ▼              ▼                   │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Postgres │  │   Redis 7    │  │  MCPs custom     │   │
│  │   16 +   │  │ (filas/locks)│  │  - WhatsApp Biz  │   │
│  │ pgvector │  └──────────────┘  │  - Notion sync   │   │
│  │ (5432)   │                    │  - (futuros)     │   │
│  └──────────┘                    └──────────────────┘   │
└──────────────────────────────────────────────────────────┘
                           ▲
                           │ webhooks
                           │
                  ┌────────┴────────┐
                  │ WhatsApp Cloud  │
                  │ Notion API      │
                  │ Drive · Calendar│
                  └─────────────────┘
```

---

## Componentes

### Caddy
**Por que:** reverse proxy + TLS automático via Let's Encrypt · zero config pra HTTPS.

**Config:** `infra/Caddyfile`

**Domínios:**
- `qg.<dominio>.com` → Anything LLM (chat web)
- `api.qg.<dominio>.com` → endpoints de webhooks dos MCPs

### Anything LLM
**Por que:** plataforma open source de chat IA multi-usuário com RAG nativo, suporte a múltiplas LLMs, plugins MCP, deploy via Docker. Alternativa avaliada: Open WebUI · decisão pendente.

**Modelo de uso:**
- Cada sócio cria conta na primeira vez que entra
- Workspace compartilhado "QG" com documentos sincronizados do Notion
- 21 agentes implementados como **system prompts customizados** (Anything LLM permite criar workspaces/threads com personas específicas)
- LLM provider: **Claude API** (Anthropic) · `claude-sonnet-4-6` ou `claude-opus-4-6` dependendo do agente

### Postgres 16 + pgvector
**Por que:** base relacional pro Anything LLM e extensão `pgvector` pra embeddings (RAG sobre Notion).

**Schemas:**
- `anythingllm` · gerenciado pela própria app
- `qg` · estado custom dos agentes (memória, sessões, decisões)
- `vectors` · embeddings dos documentos do Notion

### Redis 7
**Por que:** filas pra jobs assíncronos (sync Notion, processamento de embeddings) e locks distribuídos entre agentes que escrevem na mesma fonte.

### MCPs custom
**Onde vivem:** `mcps/`

**Lista:**
- `mcps/whatsapp/` · MCP do WhatsApp Business Cloud API · receber e enviar mensagens
- `mcps/notion-sync/` · sync periódico Notion → vector DB · pode usar API do Notion direto
- (futuros conforme demanda)

**Por que MCP:** padrão aberto, permite que qualquer cliente compatível (Anything LLM, Claude Code, Cowork) consuma.

---

## Fluxos críticos

### Conversa típica de um sócio com agente

1. Augusto abre `qg.<dominio>.com` no navegador, loga
2. Escolhe workspace "QG", começa thread com agente `Estrategista`
3. Anything LLM monta o prompt: `system_prompt_estrategista` + RAG sobre documentos relevantes (busca em pgvector) + histórico da thread + mensagem do Augusto
4. Chama Claude API com o prompt completo
5. Resposta volta · Augusto vê, responde · loop

### Sync Notion → vector DB

1. Cron (diário às 3am UTC) dispara `scripts/sync-notion.sh`
2. Script Python conecta na API do Notion, lista páginas do workspace QG, baixa conteúdo
3. Pra cada página: gera embedding (provider TBD · candidato Anthropic, OpenAI ou modelo local), insere no pgvector com metadata (página, última modificação, autor)
4. Páginas removidas do Notion: marcadas como deleted no vector DB
5. Log da execução em STATE.md ou arquivo de log dedicado

### WhatsApp recebe mensagem (após MCP rodando)

1. Paciente manda mensagem pro número Lumina
2. WhatsApp Cloud API faz POST em `api.qg.<dominio>.com/webhooks/whatsapp`
3. Caddy roteia pro container do MCP WhatsApp
4. MCP processa: salva mensagem em Postgres, dispara evento pro agente CRM ou Atendimento
5. Agente responde se autônomo, ou notifica Andressa via outra mensagem se humano necessário

---

## Decisões arquiteturais e por quê

### Por que VPS própria e não SaaS

- Custo: SaaS multi-usuário com IA fica $200-500/mês rapidamente
- Controle: dados de cliente (Lumina, futuros) ficam on-premise
- Customização: 21 agentes específicos não cabem em produtos prontos
- Modelo D · plataforma replicável: o que construímos pra nós eventualmente vira produto

### Por que Anything LLM e não custom

- Build from scratch: 6-12 semanas de Matheus
- Anything LLM: deploy em 1 dia, customização incremental
- Quando justifica custom: depois que validarmos uso real e plataforma D virar produto

### Por que Notion + VPS e não tudo no VPS

- Notion: melhor UX pra escrita colaborativa humana (comments, mentions, formatação)
- VPS: melhor pra computação dos agentes
- Sync resolve duplicação

### Por que Claude API e não modelo local

- Qualidade: Claude Opus/Sonnet ainda muito melhor que open source pra raciocínio
- Custo: ~$50-150/mês inicial · escala com volume real
- Migração futura: arquitetura permite trocar provider sem reescrever
- Trade-off aceito: dependência de Anthropic · risco mitigado por arquitetura modular

---

## Roadmap em fases

### Fase 0 · Fundação (atual)
- Repo, docs, infra templates
- Decisões pendentes em `STATE.md`

### Fase 1 · VPS + plataforma básica (1 a 2 semanas)
- VPS provisionada e bootstrap rodado
- Anything LLM operacional, 3 contas criadas
- Sync Notion → vector DB funcional
- Primeiro agente (Documentador) configurado e testado

### Fase 2 · Operacional crítica (2 a 4 semanas)
- MCP WhatsApp Business
- Agentes Curador, CEO, Estrategista, Auditor configurados
- Primeiras conversas reais entre sócios e agentes
- Documentação dos primeiros playbooks Lumina (módulo 1) extraídos pelo Documentador

### Fase 3 · Escala (4 a 8 semanas)
- Brand Voice, Conteúdo, Calendário Editorial · acelera Modelo F
- CRM & Follow-up integrado com Lumina
- Tráfego apoiando Bryan
- Métricas e dashboards

### Fase 4 · Plataforma D (3+ meses)
- Generalização da arquitetura pra clientes externos
- Multi-tenancy real
- Onboarding automatizado

---

## Variáveis ambientais

Detalhe em `infra/.env.example`. Resumo:

- `ANTHROPIC_API_KEY` · chave da API Claude
- `POSTGRES_PASSWORD` · senha do DB
- `REDIS_PASSWORD` · senha do Redis
- `DOMAIN` · domínio principal (ex: `qg.dominio.com`)
- `ANYTHINGLLM_AUTH_TOKEN` · token de autenticação app
- `NOTION_API_TOKEN` · token de integração do Notion (ler workspace QG)
- `NOTION_WORKSPACE_PAGE_ID` · ID da página QG no Notion
- `WHATSAPP_VERIFY_TOKEN` · token de verificação de webhook
- `WHATSAPP_ACCESS_TOKEN` · token de envio de mensagens

Secrets reais NUNCA vão pro Git. Vivem em `infra/.env` na VPS (gitignored) e em gerenciador de senhas dos sócios.

---

## Mudanças importantes

Quando alguém quer mudar arquitetura significativa:

1. Abre PR pra branch `arch-discuss-XXX`
2. Atualiza esse documento + STATE.md
3. Discussão entre os 3 sócios (WhatsApp ou Notion comments)
4. Aprovação registrada em commit message
5. Merge pra main

Não faz mudança de arquitetura silenciosa. Sempre via documento.
