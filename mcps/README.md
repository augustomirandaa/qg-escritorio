# MCPs · servidores Model Context Protocol custom

Aqui vivem MCPs próprios que estendem o Anything LLM (e qualquer outro cliente compatível) com integrações específicas do QG.

## O que é MCP

[Model Context Protocol](https://modelcontextprotocol.io) é um padrão aberto pra conectar LLMs a ferramentas e fontes de dados. Funciona como API mas com semântica específica de "tools" que o agente pode chamar.

## MCPs planejados

### `whatsapp/` · WhatsApp Business Cloud API
- **Função:** receber mensagens via webhook, enviar mensagens, gerenciar templates
- **Cliente principal:** Documentador (sessões com Augusto), Atendimento Lumina (futuro), CRM (notificações)
- **Status:** não implementado · prioridade alta
- **Tarefa relacionada:** task #21 do TaskList do Augusto

### `notion-sync/` · sincronização Notion → vector DB
- **Função:** ler páginas do workspace QG no Notion via API, gerar embeddings, indexar no pgvector
- **Frequência:** cron diário (3am UTC)
- **Cliente principal:** todos os agentes que fazem RAG sobre conhecimento da operação
- **Status:** não implementado · prioridade alta (pré-requisito de qualquer agente útil)

### Futuros (sem prioridade ainda)
- `drive-sync/` · sincronização de docs do Google Drive
- `gmail/` · ler/responder email da operação
- `calendar/` · gerenciar eventos do Google Calendar
- `crm-lumina/` · integração com sistema interno da Lumina

## Convenção de pastas

```
mcps/
├── whatsapp/
│   ├── README.md
│   ├── package.json (Node) ou pyproject.toml (Python)
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts (ou main.py)
│   │   ├── webhook.ts
│   │   └── send.ts
│   └── tests/
├── notion-sync/
│   └── ...
```

## Stack recomendada

- **TypeScript** se for Node · usar `@modelcontextprotocol/sdk`
- **Python** se preferir · usar `mcp` package oficial
- Cada MCP em container próprio, exposto via Caddy quando precisar de webhook externo
- DB compartilhado: Postgres do stack principal (cada MCP tem seu schema)

## Como adicionar novo MCP

1. Cria pasta `mcps/<nome>/`
2. Implementa servidor MCP (siga template de algum existente)
3. Adiciona service no `infra/docker-compose.yml`
4. Se precisa de webhook externo: adiciona handler no `infra/Caddyfile`
5. Adiciona variáveis no `.env.example`
6. Conecta no Anything LLM via plugin
7. Atualiza `STATE.md` e commita
