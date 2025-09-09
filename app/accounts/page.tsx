
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Pagination from '@/app/components/Pagination';

type SP = Record<string, string | undefined>;

function toInt(v: string | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : d;
}

export default async function AccountsPage({ searchParams }: { searchParams?: SP }) {
  const q = (searchParams?.q ?? '').trim();
  const sort = (searchParams?.sort ?? 'name_asc').trim();
  const perPage = toInt(searchParams?.perPage, 20);
  const page = Math.max(1, toInt(searchParams?.page, 1));
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: any = { deletedAt: null };

if (q) {
  where.OR = [
    { name:   { contains: q, mode: 'insensitive' } },
    { domain: { contains: q, mode: 'insensitive' } },
  ];
}

  let orderBy: any = { name: 'asc' };
  if (sort === 'name_desc') orderBy = { name: 'desc' };
  if (sort === 'created_desc') orderBy = { createdAt: 'desc' };
  if (sort === 'created_asc') orderBy = { createdAt: 'asc' };

  const [total, rows] = await Promise.all([
    prisma.account.count({ where }),
    prisma.account.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { _count: { select: { contacts: true, deals: true } } },
    }),
  ]);

  const basePath = '/accounts';

  return (
    <main>
      <h1>Accounts</h1>

      <div className="panel" style={{marginBottom:16}}>
        <h2>Search & Filters</h2>
        <form method="get" action={basePath} className="row" style={{flexWrap:'wrap', gap:8}}>
          <input name="q" defaultValue={q} placeholder="Search name or domain" style={{minWidth:220}} />
          <select name="sort" defaultValue={sort}>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
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
        {rows.length === 0 && <div className="small">No accounts found</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {rows.map(acc => (
            <div key={acc.id} className="card">
              <h3><Link href={`/accounts/${acc.id}`}>{acc.name}</Link></h3>
              <div className="small">Domain: {acc.domain ?? '—'}</div>
              <div className="small">Contacts: {acc._count.contacts} · Deals: {acc._count.deals}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <Pagination total={total} page={page} perPage={perPage} basePath={basePath} searchParams={searchParams} />
        </div>
      </div>
    </main>
  );
}
