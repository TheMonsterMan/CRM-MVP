# CRM MVP (Next.js 14 + Prisma + postgreSQL)

A minimal, working CRM scaffold focused on **Deals → Stages (Kanban) → Activities** with a simple UI and server actions.

## Features in this MVP
- Data model: Pipeline → Stages → Deals (+ Accounts/Contacts skeletons).
- Server-rendered Kanban board by Stage.
- Create a deal, move deals between stages (left/right buttons).
- postgreSQL via NEON and Prisma; seed script creates a default pipeline & sample data.
- No auth yet (single-tenant dev mode).

## Quick start

## Getting Started
1) Copy `.env.example` → `.env` and set `DATABASE_URL`
2) Install: `npm install`
3) Prisma: `npx prisma generate && npx prisma migrate deploy`
4) Dev: `npm run dev`
