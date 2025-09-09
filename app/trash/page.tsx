export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function TrashPage() {
  const [deals, accounts, contacts, activities] = await Promise.all([
    prisma.deal.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } }),
    prisma.account.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } }),
    prisma.contact.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } }),
    prisma.activity.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } }),
  ]);

  return (
    <main>
      <h1>Trash</h1>

      <div className="panel" style={{marginBottom:16}}>
        <h2>Deals</h2>
        {deals.length === 0 && <div className="small">No deleted deals</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {deals.map(d => (
            <div key={d.id} className="card">
              <h3>{d.name}</h3>
              <div className="small">Deleted {d.deletedAt?.toLocaleString?.() ?? ''}</div>
              <div className="row" style={{gap:8, marginTop:8}}>
                <form method="post" action="/api/deals/restore">
                  <input type="hidden" name="dealId" value={d.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button>Restore</button>
                </form>
                <form method="post" action="/api/deals/purge">
                  <input type="hidden" name="dealId" value={d.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button style={{ background:'#7f1d1d', borderColor:'#7f1d1d' }}>Purge</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <h2>Accounts</h2>
        {accounts.length === 0 && <div className="small">No deleted accounts</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {accounts.map(a => (
            <div key={a.id} className="card">
              <h3>{a.name}</h3>
              <div className="small">Deleted {a.deletedAt?.toLocaleString?.() ?? ''}</div>
              <div className="row" style={{gap:8, marginTop:8}}>
                <form method="post" action="/api/accounts/restore">
                  <input type="hidden" name="accountId" value={a.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button>Restore</button>
                </form>
                <form method="post" action="/api/accounts/purge">
                  <input type="hidden" name="accountId" value={a.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button style={{ background:'#7f1d1d', borderColor:'#7f1d1d' }}>Purge</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <h2>Contacts</h2>
        {contacts.length === 0 && <div className="small">No deleted contacts</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {contacts.map(c => (
            <div key={c.id} className="card">
              <h3>{c.firstName} {c.lastName}</h3>
              <div className="small">Deleted {c.deletedAt?.toLocaleString?.() ?? ''}</div>
              <div className="row" style={{gap:8, marginTop:8}}>
                <form method="post" action="/api/contacts/restore">
                  <input type="hidden" name="contactId" value={c.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button>Restore</button>
                </form>
                <form method="post" action="/api/contacts/purge">
                  <input type="hidden" name="contactId" value={c.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button style={{ background:'#7f1d1d', borderColor:'#7f1d1d' }}>Purge</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Activities</h2>
        {activities.length === 0 && <div className="small">No deleted activities</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {activities.map(a => (
            <div key={a.id} className="card">
              <h3>Activity</h3>
              <div className="small">Type: {a.type} · Deleted {a.deletedAt?.toLocaleString?.() ?? ''}</div>
              <div className="small">Body: {a.body}</div>
              <div className="row" style={{gap:8, marginTop:8}}>
                <form method="post" action="/api/activities/restore">
                  <input type="hidden" name="activityId" value={a.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button>Restore</button>
                </form>
                <form method="post" action="/api/activities/purge">
                  <input type="hidden" name="activityId" value={a.id} />
                  <input type="hidden" name="returnTo" value="/trash" />
                  <button style={{ background:'#7f1d1d', borderColor:'#7f1d1d' }}>Purge</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
