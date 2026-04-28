# QG · Escritório Virtual

Operação multi-usuário de IA self-hosted dos sócios Augusto Miranda, Pablo Bianchi e Matheus de Sousa.

## O que é

Plataforma rodando em VPS própria onde:

- **Augusto, Pablo e Matheus** logam separadamente (cada um seu workspace)
- **21 agentes IA** especializados rodam como serviços (CEO, Estrategista, Documentador, Brand Voice, etc.)
- **Banco de conhecimento compartilhado** alimenta os agentes (RAG sobre playbooks, dossiês, decisões)
- **MCPs custom** integram WhatsApp Business, Notion, Drive, Calendar
- **Notion** continua sendo o workspace humano · sincronização bidirecional com este sistema

## Arquitetura em uma frase

Notion = onde humanos escrevem · VPS = onde agentes rodam · Vector DB no VPS é alimentado pelo conteúdo do Notion via sync periódico.

Detalhe completo em [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Estrutura do repo

```
qg-escritorio/
├── README.md           ← você está aqui
├── docs/
│   ├── STATE.md        ← estado atual · LEIA PRIMEIRO em qualquer sessão
│   ├── ARCHITECTURE.md ← desenho técnico
│   └── HANDOFF.md      ← protocolo Cowork ↔ Claude Code
├── infra/              ← scripts e configs de infraestrutura
│   ├── bootstrap.sh
│   ├── docker-compose.yml
│   ├── Caddyfile
│   └── .env.example
├── agents/             ← código dos 21 agentes (specs em `/03-Agentes/` do Workspace)
├── mcps/               ← MCPs custom
└── scripts/            ← automações operacionais
```

## Quem trabalha aqui

| Pessoa | Papel | Acesso |
|---|---|---|
| Augusto Miranda | CCO · lead estratégico | admin · todas as áreas |
| Matheus de Sousa | CTO · constrói os agentes | admin · foco em tec/agentes |
| Pablo Bianchi | CMO · lead marketing | escrita em marca/F · leitura em tec |

Operação humana e mapa de permissões detalhado vivem no Notion (workspace `Augusto Miranda's Space` → página `QG`).

## Stack

- **VPS:** Hostinger KVM 2 (Ubuntu 24.04 LTS · sem painel)
- **Containerização:** Docker + Docker Compose
- **Reverse proxy + TLS:** Caddy
- **Chat platform:** Anything LLM (multi-user, RAG, plugins MCP)
- **Banco:** Postgres 16 + pgvector
- **Filas/locks:** Redis 7
- **LLM:** Claude API (Anthropic)
- **Linguagens:** Python 3.12 · Node.js 22 LTS

## Status

**Fase 0 — Fundação.** Estrutura inicial. VPS ainda não provisionada. Nenhum serviço rodando.

Status detalhado em [`docs/STATE.md`](./docs/STATE.md).

## Como começar (próxima sessão)

1. Lê [`docs/STATE.md`](./docs/STATE.md) — estado atual
2. Lê [`docs/HANDOFF.md`](./docs/HANDOFF.md) — protocolo de coordenação
3. Faz seu trabalho
4. Atualiza `STATE.md` antes de fechar

Princípio operacional: **STATE.md é a única fonte de verdade entre sessões**. Se não está lá, não aconteceu.
