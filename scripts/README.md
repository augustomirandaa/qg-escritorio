# Scripts · automações operacionais

Scripts utilitários pra rodar tarefas pontuais ou agendadas.

## Convenção

- **Bash** pra orquestração · **Python** pra lógica complexa
- Idempotentes sempre que possível
- Loggar em stdout · cron captura

## Scripts planejados

### `sync-notion.sh`
Dispara o MCP de sync Notion → vector DB. Rodado por cron diário.

### `backup.sh`
Backup do Postgres (pg_dump) + volumes do Anything LLM · sobe pra Drive ou S3 via rclone.

### `health-check.sh`
Verifica se todos os containers estão saudáveis · alerta se algum cair.

### `deploy.sh`
Pull do repo + restart dos containers afetados · usado em manutenção.

## Cron jobs típicos (na VPS)

```
# Sync Notion · diário 3am UTC
0 3 * * * /opt/qg/scripts/sync-notion.sh >> /opt/qg/logs/sync-notion.log 2>&1

# Backup · diário 4am UTC
0 4 * * * /opt/qg/scripts/backup.sh >> /opt/qg/logs/backup.log 2>&1

# Health check · a cada 15 min
*/15 * * * * /opt/qg/scripts/health-check.sh >> /opt/qg/logs/health.log 2>&1
```

## Status

Nada implementado ainda. Templates virão conforme cada feature for ativada.
