#!/usr/bin/env bash
#
# bootstrap.sh · setup inicial da VPS QG
#
# Pré-requisitos:
#   - Ubuntu 24.04 LTS instalado
#   - Usuário não-root com sudo (ex: matheus)
#   - SSH key auth funcionando · password auth desligado
#   - UFW e fail2ban já configurados (recomendação no STATE.md)
#
# Uso:
#   1. SSH na VPS como o user (ex: ssh matheus@<IP>)
#   2. Clone o repo: git clone https://github.com/augustomirandaa/qg-escritorio.git
#   3. cd qg-escritorio
#   4. Copie o env: cp infra/.env.example infra/.env
#   5. Edite infra/.env com os valores reais (NUNCA commit este arquivo)
#   6. Execute: sudo ./infra/bootstrap.sh
#
# Tempo estimado: 10 a 20 minutos
#
# Idempotente · rodar de novo é seguro

set -euo pipefail

# ─── cores e helpers ────────────────────────────────────────────────────────

readonly C_GREEN='\033[0;32m'
readonly C_YELLOW='\033[1;33m'
readonly C_RED='\033[0;31m'
readonly C_BLUE='\033[0;34m'
readonly C_RESET='\033[0m'

log()    { echo -e "${C_BLUE}▸${C_RESET} $*"; }
ok()     { echo -e "${C_GREEN}✓${C_RESET} $*"; }
warn()   { echo -e "${C_YELLOW}⚠${C_RESET} $*"; }
err()    { echo -e "${C_RED}✗${C_RESET} $*" >&2; }
fatal()  { err "$*"; exit 1; }

require_root() {
  [[ "$EUID" -eq 0 ]] || fatal "Roda com sudo: sudo $0"
}

require_ubuntu_24() {
  if ! grep -q "Ubuntu 24" /etc/os-release; then
    warn "Não é Ubuntu 24 · pode dar problema"
    read -rp "Continuar mesmo assim? [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]] || fatal "Abortado"
  fi
}

require_env_file() {
  local env_file="$(dirname "$(realpath "$0")")/.env"
  if [[ ! -f "$env_file" ]]; then
    fatal "Falta infra/.env · copie de .env.example e preencha"
  fi
}

# ─── etapa 1 · pacotes do sistema ──────────────────────────────────────────

install_system_packages() {
  log "Atualizando apt..."
  apt-get update -qq
  apt-get upgrade -y -qq

  log "Instalando pacotes essenciais..."
  apt-get install -y -qq \
    ca-certificates \
    curl \
    git \
    gnupg \
    htop \
    jq \
    lsb-release \
    rsync \
    tmux \
    ufw \
    unzip \
    vim \
    wget \
    fail2ban \
    unattended-upgrades

  ok "Pacotes do sistema instalados"
}

# ─── etapa 2 · firewall ────────────────────────────────────────────────────

setup_firewall() {
  log "Configurando UFW..."

  ufw --force reset >/dev/null 2>&1 || true
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp comment 'SSH'
  ufw allow 80/tcp comment 'HTTP'
  ufw allow 443/tcp comment 'HTTPS'
  ufw --force enable

  ok "UFW ativo · 22, 80, 443 abertos"
}

# ─── etapa 3 · auto-updates de segurança ───────────────────────────────────

setup_unattended_upgrades() {
  log "Configurando unattended-upgrades..."

  cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

  systemctl enable --now unattended-upgrades >/dev/null 2>&1 || true

  ok "Auto-updates de segurança ativos"
}

# ─── etapa 4 · Docker ──────────────────────────────────────────────────────

install_docker() {
  if command -v docker &>/dev/null; then
    ok "Docker já instalado · pulando"
    return
  fi

  log "Instalando Docker..."

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

  systemctl enable --now docker

  # Adiciona o user invocador ao grupo docker
  if [[ -n "${SUDO_USER:-}" && "$SUDO_USER" != "root" ]]; then
    usermod -aG docker "$SUDO_USER"
    log "Usuário '$SUDO_USER' adicionado ao grupo docker · faça logout/login pra valer"
  fi

  ok "Docker instalado e ativo"
}

# ─── etapa 5 · estrutura de diretórios ─────────────────────────────────────

setup_directories() {
  log "Criando estrutura em /opt/qg/..."

  mkdir -p /opt/qg/{data,backups,logs}
  mkdir -p /opt/qg/data/{anythingllm,postgres,redis,caddy}

  if [[ -n "${SUDO_USER:-}" ]]; then
    chown -R "$SUDO_USER:$SUDO_USER" /opt/qg
  fi

  ok "Diretórios criados em /opt/qg/"
}

# ─── etapa 6 · sobe os serviços ────────────────────────────────────────────

start_services() {
  log "Subindo containers (Anything LLM, Postgres, Redis, Caddy)..."

  local repo_dir
  repo_dir="$(dirname "$(dirname "$(realpath "$0")")")"

  cd "$repo_dir/infra"

  # Carrega env
  if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi

  docker compose pull
  docker compose up -d

  ok "Containers no ar"

  log "Aguardando saúde dos serviços (30s)..."
  sleep 30

  docker compose ps
}

# ─── main ──────────────────────────────────────────────────────────────────

main() {
  echo
  echo "=========================================="
  echo " QG · bootstrap"
  echo "=========================================="
  echo

  require_root
  require_ubuntu_24
  require_env_file

  install_system_packages
  setup_firewall
  setup_unattended_upgrades
  install_docker
  setup_directories
  start_services

  echo
  ok "Bootstrap completo!"
  echo
  log "Próximos passos:"
  echo "  1. Aponte o domínio (DNS A record) pro IP desta VPS"
  echo "  2. Acesse https://qg.<seu-dominio> e crie a primeira conta (admin)"
  echo "  3. Atualize docs/STATE.md confirmando deploy"
  echo "  4. Convide os outros sócios via email no Anything LLM admin"
  echo
}

main "$@"
