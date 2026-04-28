# STATE · estado atual da operação

> **LEIA PRIMEIRO em qualquer sessão** (Cowork ou Claude Code)
> Atualize ANTES de fechar a sessão · este arquivo é a fonte de verdade

---

## Fase atual

**Fase 0 — Fundação**

Estrutura inicial criada. Nada rodando ainda. Próximo marco: VPS provisionada e bootstrap rodado.

---

## Última atualização

**Quando:** 2026-04-28
**Por quem:** Cowork (Claude na sessão do Augusto)
**O quê:** Estrutura inicial do repo · README, docs, infra (templates), gitignore

---

## Em progresso (alguém mexendo agora)

Nada. Repo limpo.

> Quando começar a trabalhar: adicione bloco aqui com formato:
> `- [Cowork|ClaudeCode] · arquivo X · iniciado HH:MM`
> Quando terminar, remove o bloco.

---

## Done

- ✅ Repo `qg-escritorio` criado no GitHub (privado · github.com/augustomirandaa/qg-escritorio)
- ✅ Pablo (`pablobianchids@gmail.com`) e Matheus (`Matheusdesousa07@gmail.com`) precisam ser adicionados como collaborators (Augusto faz)
- ✅ Estrutura de pastas: `docs/`, `infra/`, `agents/`, `mcps/`, `scripts/`
- ✅ Documentação base: README, ARCHITECTURE, HANDOFF, STATE
- ✅ Infra templates: `bootstrap.sh`, `docker-compose.yml`, `Caddyfile`, `.env.example`

---

## Próximo (em ordem)

### 1. Augusto adiciona Pablo e Matheus como collaborators
- GitHub → Settings → Collaborators → Add people
- Permissão: **Write** pros 2

### 2. Matheus provisiona a VPS
- Hostinger KVM 2 · Ubuntu 24.04 LTS · sem painel
- Hardening básico:
  - Criar usuário não-root (`adduser augusto` e `adduser matheus`, com sudo)
  - Adicionar suas chaves SSH em `~/.ssh/authorized_keys`
  - Desabilitar login root via SSH (`/etc/ssh/sshd_config`: `PermitRootLogin no`)
  - Desabilitar password auth (`PasswordAuthentication no`)
  - UFW firewall (allow 22, 80, 443)
  - fail2ban
  - `unattended-upgrades`
- Confirma com SSH key dele que entra: `ssh matheus@<IP>`
- Compra/aponta domínio: `qg.<dominio>.com` → IP da VPS
- Atualiza este STATE.md com o IP da VPS e o domínio

### 3. Claude Code roda bootstrap.sh na VPS
- Matheus abre Claude Code na máquina dele apontando pra esse repo
- Claude Code SSH na VPS, clona o repo em `/opt/qg-escritorio/`
- Copia `infra/.env.example` para `infra/.env` e preenche com valores reais
- Roda `./infra/bootstrap.sh`
- Atualiza este STATE.md confirmando: serviços de pé, Anything LLM acessível em `https://qg.<dominio>`

### 4. Cowork escreve sync Notion → vector DB
- Script Python que lê páginas do Notion via API, gera embeddings, insere no pgvector
- Ativa via cron diário

### 5. Cowork escreve primeiro agente · Documentador
- System prompt já existe em `/03-Agentes/documentador.md` no Workspace local
- Implementação no Anything LLM como workspace dedicado com system prompt

### 6. Cowork escreve MCP WhatsApp Business
- Em `mcps/whatsapp/`
- Claude Code deploya na VPS
- Atualiza STATE.md com webhook URL

---

## Decisões pendentes

| Decisão | Impacto | Quem decide | Quando |
|---|---|---|---|
| Plataforma de chat: Anything LLM vs Open WebUI vs LibreChat | médio | Augusto + Matheus | antes da Fase 1 |
| Domínio principal: registrar novo ou usar existente | baixo | Augusto | antes de TLS |
| Conta Anthropic API: pessoal Augusto ou criar org | baixo | Augusto | antes de subir Anything LLM |
| Provedor de embeddings: Anthropic, OpenAI, ou local | baixo | Matheus | antes do sync Notion |

---

## Bloqueios atuais

Nenhum. Próxima ação está com o Augusto (adicionar collaborators) e Matheus (VPS).

---

## Logs de erro / coisas que travaram

Nada ainda.

> Formato quando aparecer:
> ```
> ### YYYY-MM-DD · descrição
> Onde: arquivo / serviço
> O que tentou: ...
> Erro: ...
> Último estado bom conhecido: ...
> Próximo passo: ...
> ```
