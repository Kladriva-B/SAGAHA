# Déploiement production — SAGAHA SARL

## Vercel + GitHub

1. Projet Vercel lié au dépôt GitHub (racine = ce dossier `sagaha` si le repo ne contient que l’app).
2. **Branches** : `main` → Production, `develop` → Preview (réglage dans Vercel → Git → Production Branch).
3. **GitHub Actions** (`.github/workflows/ci.yml`) : lint, TypeScript, `npm audit` (blocage sur vulnérabilités **critiques** uniquement ; rapport **high+** sans faire échouer la pipeline), `prisma migrate deploy` sur Postgres éphémère, build Next.js.
4. **Déploiement Vercel depuis Actions** : job `deploy-vercel` avec `amondnet/vercel-action`. Secrets à créer dans GitHub → Settings → Secrets :
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`  
   Si vous préférez **uniquement** l’intégration Git native Vercel (sans Actions), supprimez le job `deploy-vercel` du workflow pour éviter les déploiements en double.

### Monorepo (dépôt parent contenant `sagaha/`)

Ajoutez `defaults.run.working-directory: sagaha` sur les jobs et `cache-dependency-path: sagaha/package-lock.json` sur `setup-node`.

## Variables d’environnement (Doppler / Vercel)

Voir `.env.example`. Alignement demandé :

| Variable | Usage |
|----------|--------|
| `DATABASE_URL` | PostgreSQL (Vercel Postgres, Neon, etc.) |
| `NEXTAUTH_SECRET` | Secret JWT (même valeur que `AUTH_SECRET` recommandé) |
| `AUTH_SECRET` | Lu par Auth.js en priorité si présent |
| `NEXTAUTH_URL` | URL canonique (ex. `https://www.sagaha.cm`) |
| `NEXT_PUBLIC_SITE_URL` | Même base pour SEO, sitemap, emails, liens absolus |
| `RESEND_API_KEY` | Envoi d’emails |
| `CLOUDINARY_URL` | Optionnel (images ; actuellement Vercel Blob + URLs externes) |
| `BLOB_READ_WRITE_TOKEN` | Upload fichiers / images |

Optionnel monitoring : `SENTRY_DSN` ou `NEXT_PUBLIC_SENTRY_DSN`, `ORDER_STATUS_WEBHOOK_URL`, etc.

## Prisma en production

```bash
npx prisma migrate deploy
```

La migration initiale est dans `prisma/migrations/`. Ne pas utiliser `db push` en prod une fois les migrations versionnées.

## Rotation des secrets (90 jours)

Dans Doppler : activer un rappel de rotation pour `AUTH_SECRET` / `NEXTAUTH_SECRET`, `DATABASE_URL` (mot de passe DB), `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, tokens Vercel/Sentry.

## Sauvegardes PostgreSQL

Automatiser hors application : **pg_dump** quotidien (cron sur serveur, ou backup managé Neon/Vercel Postgres / AWS RDS). Conserver chiffrement au repos + test de restauration trimestriel.

## Uptime (Better Stack / Better Uptime)

Créer un monitor HTTPS sur `https://votre-domaine/api/health` (ou page d’accueil) avec alerte email/Slack. Aucun fichier requis dans le repo.

## Analyse du bundle JS

```bash
npm run analyze
```

Ouvre un rapport interactif des chunks. Viser une **First Load JS** raisonnable (&lt; ~200 kB gzip pour le shell public si possible ; l’admin et Recharts sont plus lourds).

## CSP

Définie dans `next.config.mjs` : plus stricte en production (pas de `unsafe-eval`). Les domaines Vercel Analytics / Speed Insights et Sentry sont autorisés en prod.
