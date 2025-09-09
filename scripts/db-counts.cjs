/* scripts/db-counts.cjs */
const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  const [pipelines, stages, accounts, contacts, deals, activities] =
    await p.$transaction([
      p.pipeline.count(),
      p.stage.count(),
      p.account.count(),
      p.contact.count(),
      p.deal.count(),
      p.activity.count(),
    ]);
  console.log({ DATABASE_URL: process.env.DATABASE_URL, pipelines, stages, accounts, contacts, deals, activities });
  await p.$disconnect();
})().catch(e => (console.error(e), process.exit(1)));
