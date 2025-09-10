# CRM MVP

Next.js (App Router) + Prisma + Neon Postgres.

## Getting Started
1) Copy \.env.example\ → \.env\ and set:
   \\\
   DATABASE_URL="postgres://USER:PASSWORD@ep-xxxx.neon.tech/neondb?sslmode=require&pgbouncer=true"
   \\\
2) Install:
   \\\
   npm ci
   \\\
3) Prisma:
   \\\
   npx prisma generate
   npx prisma migrate deploy   # or \
px prisma migrate dev\ in dev
   \\\
4) Dev:
   \\\
   npm run dev
   \\\

## Deploy (Netlify)
- Add env var \DATABASE_URL\ in Site settings → Environment
- Netlify reads \
etlify.toml\ (runs Prisma generate + migrate + build)
