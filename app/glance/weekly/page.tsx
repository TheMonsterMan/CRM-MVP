export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { WeeklyHeader } from '@/app/components/GlanceHeader';

type SP = Record<string, string | undefined>;

function weekRangeUTC(startStr?: string) {
  // startStr is Monday (YYYY-MM-DD). If not provided, compute current week's Monday (UTC).
  let start: Date;
  if (startStr) {
    start = new Date(startStr + 'T00:00:00Z');
  } else {
    const now = new Date();
    const day = now.getUTCDay(); // 0 Sun..6 Sat
    const diff = (day + 6) % 7; // days since Monday
    now.setUTCHours(0,0,0,0);
    now.setUTCDate(now.getUTCDate() - diff);
    start = now;
  }
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7); // exclusive
  const label = start.toISOString().slice(0,10);
  return { start, end, label };
}

export default async function WeeklyGlance({ searchParams }: { searchParams?: SP }) {
  const { start, end, label } = weekRangeUTC(searchParams?.start);

  const [stageChanges, newDeals, activities, newAccounts, newContacts] = await Promise.all([
    prisma.dealStageChange.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: 'desc' },
      include: {
        deal: { select: { id: true, name: true } },
        fromStage: { select: { id: true, name: true } },
        toStage: { select: { id: true, name: true } },
      },
    }),
    prisma.deal.findMany({
      where: { createdAt: { gte: start, lt: end }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, amount: true },
    }),
    prisma.activity.findMany({
      where: { createdAt: { gte: start, lt: end }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { deal: { select: { id: true, name: true } } },
    }),
    prisma.account.findMany({
      where: { createdAt: { gte: start, lt: end }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, domain: true },
    }),
    prisma.contact.findMany({
      where: { createdAt: { gte: start, lt: end }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  return (
    <main>
      <h1>Weekly Glance</h1>
      <div className="panel" style={{ marginBottom: 12 }}>
        <WeeklyHeader />
        <div className="small" style={{ color:'#666', marginTop: 6 }}>UTC week starting: {label}</div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h2>New Deals ({newDeals.length})</h2>
        {newDeals.length === 0 && <div className="small">None</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {newDeals.map(d => (
            <div key={d.id} className="card">
              <h3><Link href={`/deals/${d.id}`}>{d.name}</Link></h3>
              <div className="small">Amount: {typeof d.amount === 'number' ? Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(d.amount) : '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h2>Stage Changes ({stageChanges.length})</h2>
        {stageChanges.length === 0 && <div className="small">None</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {stageChanges.map(sc => (
            <div key={sc.id} className="card">
              <div><Link href={`/deals/${sc.deal.id}`}><strong>{sc.deal.name}</strong></Link></div>
              <div className="small">Stage: {sc.fromStage?.name ?? '—'} → {sc.toStage?.name ?? '—'}</div>
              <div className="small">{new Date(sc.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h2>Activities ({activities.length})</h2>
        {activities.length === 0 && <div className="small">None</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {activities.map(a => (
            <div key={a.id} className="card">
              <div className="small" style={{ marginBottom: 4 }}>[{a.type}] {new Date(a.createdAt).toLocaleString()}</div>
              <div><Link href={`/deals/${a.deal.id}`}>{a.deal.name}</Link></div>
              <div>{a.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h2>New Accounts ({newAccounts.length})</h2>
        {newAccounts.length === 0 && <div className="small">None</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {newAccounts.map(a => (
            <div key={a.id} className="card">
              <h3><Link href={`/accounts/${a.id}`}>{a.name}</Link></h3>
              <div className="small">{a.domain || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>New Contacts ({newContacts.length})</h2>
        {newContacts.length === 0 && <div className="small">None</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {newContacts.map(c => (
            <div key={c.id} className="card">
              <h3><Link href={`/contacts/${c.id}`}>{c.firstName} {c.lastName}</Link></h3>
              <div className="small">{c.email || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
