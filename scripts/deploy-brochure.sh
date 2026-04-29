#!/usr/bin/env bash
# Deploy do brochure estático na VPS Hostinger.
# Uso: bash scripts/deploy-brochure.sh
#
# Pré-requisitos:
#   - Node + nvm carregado (source ~/.nvm/nvm.sh)
#   - Alias SSH 'qg-vps' configurado em ~/.ssh/config (host 177.7.45.10, key ~/.ssh/qg_vps)
#   - Caddy já rodando na VPS escutando :3000 servindo /var/www/qg-brochure/
#
# Esse deploy é da Fase 0 (brochure mode estático). Quando a Fase 2 entrar
# (Matheus rodando bootstrap.sh com Postgres + Anything LLM + SSR), esse script
# fica obsoleto — substituído por deploy via Docker / git pull no VPS.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DASHBOARD_DIR="$REPO_ROOT/dashboard"
CADDYFILE_LOCAL="$REPO_ROOT/infra/Caddyfile.brochure"
VPS_HOST="qg-vps"
VPS_PATH="/var/www/qg-brochure/"
VPS_CADDYFILE="/etc/caddy/Caddyfile"

echo "→ Sincronizando Caddyfile (se mudou)"
CADDY_CHANGED=$(rsync -avzc --dry-run "$CADDYFILE_LOCAL" "$VPS_HOST:$VPS_CADDYFILE" | grep -c "Caddyfile" || true)
if [[ "$CADDY_CHANGED" -gt 0 ]]; then
  rsync -avz "$CADDYFILE_LOCAL" "$VPS_HOST:$VPS_CADDYFILE"
  ssh "$VPS_HOST" "caddy validate --config $VPS_CADDYFILE && systemctl reload caddy"
  echo "  Caddy config atualizada e recarregada."
else
  echo "  Caddyfile já está sincronizado · sem reload."
fi

echo "→ Build do Astro"
cd "$DASHBOARD_DIR"
npm run build

echo "→ Sincronizando dist/ pra $VPS_HOST:$VPS_PATH"
rsync -avz --delete dist/ "$VPS_HOST:$VPS_PATH"

echo "→ Ajustando owner pra www-data"
ssh "$VPS_HOST" "chown -R www-data:www-data $VPS_PATH"

echo "→ Verificando saúde"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://177.7.45.10:3000/)
if [[ "$HTTP" == "200" ]]; then
  echo "✓ Deploy ok · http://177.7.45.10:3000/"
else
  echo "✗ Deploy retornou HTTP $HTTP — verificar"
  exit 1
fi
