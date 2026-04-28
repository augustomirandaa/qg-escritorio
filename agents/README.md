# Agents · código dos 21 agentes IA

Aqui vive o **código de implementação** dos agentes. As **specs** (system prompts, missão, anti-goals) vivem no Workspace local em `00-Contexto-Augusto/.../03-Agentes/` e serão importadas pra cá conforme cada agente for implementado.

## Modelo de implementação

No QG, cada agente é implementado de uma das três formas, dependendo da complexidade:

### Tipo A · Workspace no Anything LLM (mais simples)

Pra agentes conversacionais simples (CEO Agent, Estrategista, Auditor, Brand Voice).

- Configuração: workspace dedicado no Anything LLM com:
  - System prompt customizado (do arquivo de spec)
  - Documentos relevantes do Notion via RAG
  - LLM provider: Claude API
- Implementação: arquivo de configuração + script de setup que cria o workspace via API do Anything LLM
- Localização: `agents/<nome>/config.json` + `agents/<nome>/system-prompt.md`

### Tipo B · MCP custom + workspace

Pra agentes que precisam de tools externas (Documentador grava em Notion, CRM lê pipeline).

- Configuração: igual Tipo A mais um MCP custom em `mcps/<nome>/`
- Workspace no Anything LLM consome o MCP via plugin
- Localização: `agents/<nome>/` (config) + `mcps/<agent-mcp>/` (código)

### Tipo C · Serviço autônomo

Pra agentes que rodam em background sem interação humana direta (Curador faz sweep diário, Tráfego processa relatórios).

- Container Docker próprio, em `agents/<nome>/`
- Cron ou trigger via webhook
- Escreve resultado em Postgres ou Notion

## Estado atual

Nenhum agente implementado ainda. Specs prontas em `/Claude Workspace/00-Contexto-Augusto/.../03-Agentes/` (10 agentes P1):

1. Documentador
2. Curador
3. CEO Agent
4. Estrategista
5. Auditor
6. Brand Voice
7. Conteúdo
8. Calendário Editorial
9. CRM & Follow-up
10. Tráfego

## Ordem sugerida de implementação

1. **Documentador** (Tipo B · destrava Modelo C · sessions com Augusto via WhatsApp)
2. **Curador** (Tipo C · mantém workspace organizado)
3. **CEO Agent** (Tipo A · síntese semanal)
4. **Estrategista** + **Auditor** (Tipo A · suporte a decisão Aesthetica)
5. **Brand Voice** + **Conteúdo** + **Calendário Editorial** (Tipo A/B · acelera Modelo F)
6. **CRM & Follow-up** + **Tráfego** (Tipo C · operacional Lumina)

## Convenção de pastas

```
agents/
├── documentador/
│   ├── README.md           ← descrição, dependências, uso
│   ├── system-prompt.md    ← prompt do agente
│   ├── config.json         ← config Anything LLM (workspace settings)
│   └── (eventual: src/, Dockerfile, etc)
├── curador/
│   └── ...
└── ...
```
