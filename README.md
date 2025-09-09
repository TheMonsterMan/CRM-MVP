# CRM MVP (Next.js 14 + Prisma + SQLite)

A minimal, working CRM scaffold focused on **Deals → Stages (Kanban) → Activities** with a simple UI and server actions.

## Features in this MVP
- Data model: Pipeline → Stages → Deals (+ Accounts/Contacts skeletons).
- Server-rendered Kanban board by Stage.
- Create a deal, move deals between stages (left/right buttons).
- SQLite via Prisma; seed script creates a default pipeline & sample data.
- No auth yet (single-tenant dev mode).

## Quick start

1) **Install dependencies**
```bash
npm i
```

2) **Set up the DB**
```bash
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run seed
```

3) **Run the app**
```bash
npm run dev
```

Visit http://localhost:3000

## Project structure
```
app/
  layout.tsx
  page.tsx          # Kanban board & create-deal form
  actions.ts        # Server actions for create/move
lib/
  prisma.ts         # Prisma client singleton
prisma/
  schema.prisma
  seed.cjs
```

## Next steps
- Add auth (Clerk, Auth0, or NextAuth) + orgs/roles.
- Activities & Tasks UI (notes, calls, meetings).
- Search & filters; saved views.
- Audit log; soft delete.
- Import/export CSV.
- Email/calendar integrations (Google/Microsoft).

If you want, we can extend this with Accounts/Contacts pages, activity timelines, and basic reporting.
