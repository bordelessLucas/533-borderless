#!/usr/bin/env bash
# Libera a porta do Next antes de subir o dev server (evita EADDRINUSE).
set -euo pipefail

PORT="${1:-3000}"

if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
  pids="$(lsof -ti tcp:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    kill ${pids} >/dev/null 2>&1 || true
  fi
fi

# Pequena espera para o SO liberar o bind
sleep 0.4
