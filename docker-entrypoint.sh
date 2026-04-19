#!/bin/sh
set -e
echo "[sagaha] Prisma migrate deploy…"
i=0
until npx prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -gt 45 ]; then
    echo "[sagaha] Échec migrate après 45 tentatives — vérifiez Postgres et DATABASE_URL."
    exit 1
  fi
  echo "[sagaha] Postgres pas prêt, nouvel essai dans 2s ($i/45)…"
  sleep 2
done
echo "[sagaha] Démarrage Next.js…"
exec npm run start
