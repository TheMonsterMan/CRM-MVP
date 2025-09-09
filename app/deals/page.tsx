
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Pagination from "@/app/components/Pagination";

type SP = Record<string, string | undefined>;

function toInt(v: string | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : d;
}

function toFloat(v: string | undefined) {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function DealsIndex({ searchParams }: { searchParams?: SP }) {
  const q = (searchParams?.q ?? "").trim();
  const stageId = (searchParams?.stageId ?? "").trim();
  const accountId = (searchParams?.accountId ?? "").trim();
  const contactId = (searchParams?.contactId ?? "").trim();
  const amountMin = toFloat(searchParams?.amountMin);
  const amountMax = toFloat(searchParams?.amountMax);
  const sort = (searchParams?.sort ?? "created_desc").trim();
  const perPage = toInt(searchParams?.perPage, 20);
  const page = Math.max(1, toInt(searchParams?.page, 1));
  const skip = (page - 1) * perPage;
  const take = perPage;

  const pipeline = await prisma.pipeline.findFirst();
  const stages = pipeline
    ? await prisma.stage.findMany({ where: { pipelineId: pipeline.id }, orderBy: { order: "asc" } })
    : [];

  const accounts = await prisma.account.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    take: 200,
    select: { id: true, name: true },
  });

  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
    select: { id: true, firstName: true, lastName: true },
  });

  const where: any = { deletedAt: null };
  if (stageId) where.stageId = stageId;
  if (accountId) where.accountId = accountId;
  if (contactId) where.contactId = contactId;
  if (typeof amountMin === "number") where.amount = { ...(where.amount || {}), gte: amountMin };
  if (typeof amountMax === "number") where.amount = { ...(where.amount || {}), lte: amountMax };
if (q) {
  where.OR = [
    { name:    { contains: q, mode: 'insensitive' } },
    { account: { name: { contains: q, mode: 'insensitive' } } },
    { contact: { firstName: { contains: q, mode: 'insensitive' } } },
    { contact: { lastName:  { contains: q, mode: 'insensitive' } } },
  ];
}

  let orderBy: any = { createdAt: "desc" };
  if (sort === "created_asc") orderBy = { createdAt: "asc" };
  if (sort === "amount_desc") orderBy = [{ amount: "desc" }, { createdAt: "desc" }];
  if (sort === "amount_asc") orderBy = [{ amount: "asc" }, { createdAt: "desc" }];
  if (sort === "name_asc") orderBy = { name: "asc" };
  if (sort === "name_desc") orderBy = { name: "desc" };

  const [total, rows] = await Promise.all([
    prisma.deal.count({ where }),
    prisma.deal.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        stage: true,
        account: { select: { id: true, name: true, deletedAt: true } },
        contact: { select: { id: true, firstName: true, lastName: true, deletedAt: true } },
      },
    }),
  ]);

  const basePath = "/deals";

  return (
    <main>
      <h1>Deals</h1>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Filters</h2>
        <form method="get" action={basePath} className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <input name="q" defaultValue={q} placeholder="Search deals, account/contact…" style={{ minWidth: 220 }} />

          <select name="stageId" defaultValue={stageId}>
            <option value="">All stages</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select name="accountId" defaultValue={accountId}>
            <option value="">All accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select name="contactId" defaultValue={contactId}>
            <option value="">All contacts</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.lastName}, {c.firstName}</option>)}
          </select>

          <input name="amountMin" type="number" step="1" placeholder="Min $" defaultValue={searchParams?.amountMin ?? ""} />
          <input name="amountMax" type="number" step="1" placeholder="Max $" defaultValue={searchParams?.amountMax ?? ""} />

          <select name="sort" defaultValue={sort}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="amount_desc">Amount ↓</option>
            <option value="amount_asc">Amount ↑</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </select>

          <select name="perPage" defaultValue={String(perPage)}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>

          <input type="hidden" name="page" value="1" />
          <button className="primary" type="submit">Apply</button>
          <Link href={basePath}><button type="button">Reset</button></Link>
        </form>
      </div>

      <div className="panel">
        <h2>Results</h2>
        {rows.length === 0 && <div className="small">No deals found</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {rows.map(d => {
            const amount = typeof d.amount === "number" ? Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(d.amount) : "—";
            const acct = d.account && !d.account.deletedAt ? d.account : null;
            const cont = d.contact && !d.contact.deletedAt ? d.contact : null;
            return (
              <div key={d.id} className="card">
                <h3><Link href={`/deals/${d.id}`}>{d.name}</Link></h3>
                <div className="small">Amount: {amount}</div>
                <div className="small">Stage: {d.stage?.name ?? "—"}</div>
                <div className="small">Account: {acct ? <Link href={`/accounts/${acct.id}`}>{acct.name}</Link> : "—"}</div>
                <div className="small">Contact: {cont ? <Link href={`/contacts/${cont.id}`}>{cont.firstName} {cont.lastName}</Link> : "—"}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12 }}>
          <Pagination total={total} page={page} perPage={perPage} basePath={basePath} searchParams={searchParams} />
        </div>
      </div>
    </main>
  );
}
