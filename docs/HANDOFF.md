# HANDOFF · protocolo Cowork ↔ Claude Code

> Como dois agentes IA colaboram no mesmo repo sem se atropelarem
> LEIA antes de qualquer sessão

---

## Os 2 agentes

**Cowork (Claude no app Cowork do Augusto)**
- Acessa: file tools no Mac do Augusto, Notion MCP, Chrome MCP, Bash sandbox isolado, computer-use Mac
- NÃO tem: SSH na VPS, persistência entre sessões
- Bom em: design, arquitetura, escrever scripts/configs/code, mexer no Notion, mexer no Mac do Augusto
- Limitação: cada sessão começa zerada · só sabe o que está no repo + Workspace local + system prompt

**Claude Code (CLI na máquina do Matheus)**
- Acessa: shell completo do Mac do Matheus, SSH na VPS (com chave dele), git, builds longos, deploy
- NÃO tem: tools do Cowork, acesso direto ao Notion via API (a não ser que configure)
- Bom em: executar scripts longos, deploys, builds, testes ao vivo
- Limitação: Matheus precisa estar na máquina dele

---

## Fonte única de verdade

**Este repositório Git.** Tudo que importa vive aqui.

Coisas que NÃO vivem aqui:
- Secrets (vão em `.env` na VPS, gitignored)
- Conteúdo do Notion (sincronizado via vector DB, mas Notion é a fonte)
- Workspace local do Augusto (`/Claude Workspace/`) · contém contexto pessoal dele, não compartilhado

---

## Regras de coordenação

### 1. Sempre ler `docs/STATE.md` PRIMEIRO

Toda sessão (Cowork ou Claude Code) começa lendo STATE.md.

Se STATE.md não está atualizado, pergunte antes de fazer qualquer coisa.

### 2. Marcar trabalho em progresso

Antes de começar a editar um arquivo ou serviço, atualize a seção `## Em progresso` do STATE.md:

```
- Cowork · escrevendo mcps/whatsapp/index.py · iniciado 14:32
```

Outro agente vê isso e NÃO toca naquele arquivo até o bloco sair.

### 3. Sempre commitar antes de fechar a sessão

Trabalho não commitado = trabalho perdido (Cowork zera a cada sessão · Claude Code pode ter pane).

Mensagem de commit clara:
- `infra: bootstrap.sh com Docker e Caddy`
- `agents: Documentador v0.5 · system prompt`
- `mcps: WhatsApp inicial · webhook handler`

### 4. Atualizar STATE.md ao terminar

Move o trabalho de `## Em progresso` pra `## Done`. Atualiza `## Próximo` se mudou.

### 5. Decisões arquiteturais sempre em ARCHITECTURE.md

Se está mudando arquitetura · atualiza ARCHITECTURE.md no MESMO commit que fez a mudança. Sem decisão silenciosa.

### 6. Bloqueios e erros documentados

Se travou em algo, documenta em STATE.md > `## Logs de erro / coisas que travaram`. Ajuda o próximo agente saber o que evitar.

### 7. Secrets NUNCA no repo

Se você está prestes a commitar uma chave de API, senha, token · pare. Vai em `.env` na VPS.

---

## Divisão de trabalho típica

| Tipo de trabalho | Quem faz | Por quê |
|---|---|---|
| Design / arquitetura | Cowork | Pensar e escrever |
| Scripts shell · `infra/bootstrap.sh` | Cowork escreve · Claude Code executa | Cowork não tem shell na VPS |
| Docker compose · Caddyfile | Cowork escreve · Claude Code aplica | Mesma razão |
| Código de agente / MCP | Cowork escreve · Claude Code testa em VPS | Cowork pra escrita, Claude Code pra runtime |
| Deploy | Claude Code | SSH na VPS é dele |
| Notion ops | Cowork | Notion MCP carregado |
| Conteúdo / dossiê / playbook | Cowork | Foco em escrita |
| Build longo / migration | Claude Code | Persistente |
| Debug ao vivo / logs | Claude Code | SSH ativo |

---

## Fluxo padrão de uma feature

Exemplo: adicionar MCP WhatsApp.

1. **Cowork** lê STATE.md · vê que tarefa é "implementar MCP WhatsApp"
2. **Cowork** marca `## Em progresso`: `Cowork · escrevendo mcps/whatsapp/`
3. **Cowork** escreve código completo em `mcps/whatsapp/`
4. **Cowork** atualiza STATE.md: `Done: MCP WhatsApp escrito · Next: Claude Code deploya`
5. **Cowork** commita: `mcps: WhatsApp v0.1 · webhook + send`
6. **Augusto** dá `git push` (ou Cowork via Chrome MCP)
7. **Matheus** abre Claude Code · lê STATE.md · vê próximo passo
8. **Claude Code** marca `## Em progresso`: `ClaudeCode · deployando WhatsApp MCP`
9. **Claude Code** SSH na VPS · `git pull` · `docker compose up -d whatsapp`
10. **Claude Code** testa webhook · funciona
11. **Claude Code** atualiza STATE.md: `Done: WhatsApp MCP no ar em api.qg.X.com/webhooks/whatsapp`
12. **Claude Code** commita: `infra: WhatsApp MCP deployado`
13. **Próxima sessão** começa de novo do passo 1

---

## Convenções

### Branches

**Estrutura de branches do projeto:**

- `main` · estado integrado · o que vai pra VPS quando deploy estiver de pé · merges chegam via tag (release) ou via PR
- `augusto/work` · branch contínua do Cowork na máquina do Augusto · recebe push direto a cada "sobe pro git" · sem tags, sem alerta pro Matheus
- `matheus/work` · branch contínua do Claude Code na máquina do Matheus · recebe push direto a cada parada de trabalho dele
- `feat/xxx` / `fix/xxx` · branches efêmeros pra features pontuais · merge em main quando prontas

**Fluxo Augusto (Cowork):**

1. **"sobe pro git" / "salva":** commit em `augusto/work` + push origin · não toca em main
2. **"cria versão" / "manda pro Matheus":** rebase `augusto/work` em cima de `main` atualizado · merge em main · tag (vMAJOR.MINOR.PATCH) · push main + tag · realinha `augusto/work`

**Fluxo Matheus (Claude Code):**

1. Trabalha em `matheus/work` · push contínuo
2. Quando feature está estável (schema, auth, deploy etc.), rebase em `main` atualizado · merge · tag se aplicável

**Regra única que evita conflitos:**

- Antes de QUALQUER push: `git pull --rebase origin <branch-atual>` + checar `STATE.md` em "Em progresso"
- Antes de QUALQUER merge em `main`: rebase em cima de `main` atualizado, resolve conflitos local, depois merge

**Divisão de território (soft, não enforced — se precisar invadir, sinaliza no STATE.md):**

| Augusto (Cowork edita) | Matheus (Claude Code edita) | Compartilhado |
|---|---|---|
| `dashboard/src/data/*.ts` | `infra/*` | `docs/STATE.md` (alta freq.) |
| `dashboard/src/pages/*.astro` (UI) | `dashboard/src/lib/db/*` | `docs/ARCHITECTURE.md` (rara) |
| `dashboard/src/components/*.astro` | `dashboard/src/lib/auth/*` | `dashboard/astro.config.mjs` |
| `dashboard/src/styles/*.css` | `dashboard/src/pages/api/*` | `dashboard/package.json` |
| Conteúdo dos relatórios | Schema SQL · migrações | |
| Adicionar pessoas, projetos, tarefas | Deploy, secrets, env | |

**Quando precisar invadir território do outro** (ex.: Matheus migrando dados pra DB toca arquivos do Augusto): faz na branch própria, sinaliza em `STATE.md > ## Em progresso` antes de começar, e merge em main quando pronto.

### Commits

Formato: `<área>: <descrição imperativa>`

- `infra:` mudanças em infra (bootstrap, docker, caddy)
- `agents:` mudanças em código de agentes
- `mcps:` mudanças em MCPs custom
- `scripts:` automações
- `docs:` documentação
- `chore:` manutenção (.gitignore, README, etc)

Exemplos bons:
- `agents: Documentador v0.5 · system prompt completo`
- `infra: corrige porta do Postgres no compose`
- `docs: ARCHITECTURE atualizado com decisão Anything LLM`

Exemplos ruins:
- `update`
- `fix`
- `wip`

### Arquivos-chave que NÃO se editam casualmente

- `docs/ARCHITECTURE.md` · só com discussão entre sócios
- `infra/.env.example` · template · mudanças aqui afetam todos os deploys
- `.gitignore` · perigoso vazar secrets

---

## Quando o protocolo falhar

Vai falhar uma hora. Quando falhar:

1. **Conflito de edição:** alguém commitou em cima do trabalho do outro · resolve via `git revert` ou merge manual · documenta em STATE.md
2. **Arquivo deletado por engano:** `git checkout HEAD~1 -- arquivo`
3. **STATE.md não foi atualizado:** próxima sessão para tudo · pergunta ao humano (Augusto/Matheus) o que está rodando
4. **Push rejeitado por divergência:** `git pull --rebase` antes de push · resolve conflitos local

Nenhum estrago é irreversível com Git. Calma.

---

## Pergunta do humano: "qual sessão devo abrir?"

| Tarefa | Abrir | Por quê |
|---|---|---|
| Mudar conteúdo no Notion | **Cowork** | Notion MCP |
| Escrever spec de agente novo | **Cowork** | Trabalho de escrita |
| Deploy ou aplicar mudança na VPS | **Claude Code** | SSH |
| Investigar erro nos logs da VPS | **Claude Code** | SSH |
| Refinar arquitetura · pensar | **Cowork** | Não precisa runtime |
| Build longo de um MCP novo | **Claude Code** ou ambos | Cowork escreve, Code testa |
| Coordenar entre sessões | nenhuma · use STATE.md | Source of truth |

---

## Resumo em 5 frases

1. Tudo passa pelo repo. Nada combinado por fora.
2. STATE.md é a fonte de verdade do estado entre sessões.
3. Cowork pensa e escreve. Claude Code executa.
4. Commit antes de fechar. Sempre.
5. Secrets nunca no repo.
