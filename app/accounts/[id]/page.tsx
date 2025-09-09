export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ConfirmDelete from '@/app/components/ConfirmDelete';
import BulkRemoveConfirm from '@/app/components/BulkRemoveConfirm';
import SelectAll from '@/app/components/SelectAll';

type Params = { params: { id: string } };

export default async function AccountDetail({ params }: Params) {
  const account = await prisma.account.findUnique({
    where: { id: params.id },
    include: {
      contacts: { where: { deletedAt: null }, orderBy: { lastName: 'asc' } },
      deals:    { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
    }
  });

  if (!account || (account as any).deletedAt) {
    return <main><h1>Account not found</h1></main>
  }

  const formId = `remove-many-${account.id}`;

  return (
    <main>
      <h1>{account.name}</h1>
      <div className="small" style={{marginBottom:12}}>Domain: {account.domain ?? '—'}</div>

      <div className="panel" style={{marginBottom:16}}>
        <h2>Add Contact to this Account</h2>
        <form method="post" action="/api/contacts/create" className="row" style={{flexWrap:'wrap', gap:8}}>
          <input name="firstName" placeholder="First name" required />
          <input name="lastName" placeholder="Last name" required />
          <input name="email" type="email" placeholder="Email (optional)" />
          <input name="phone" placeholder="Phone (optional)" />
          <input type="hidden" name="accountId" value={account.id} />
          <button className="primary" type="submit">Add Contact</button>
        </form>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
          <h2>Contacts</h2>
          <div className="row" style={{gap:8}}>
            <SelectAll formId={formId} />
            <BulkRemoveConfirm formId={formId} />
          </div>
        </div>

        {account.contacts.length === 0 && <div className="small">No contacts</div>}

        <form id={formId} method="post" action="/api/accounts/remove-contacts">
          <input type="hidden" name="accountId" value={account.id} />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            {account.contacts.map(c => (
              <label key={c.id} className="card" style={{display:'block'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:8}}>
                  <div>
                    <h3 style={{marginBottom:4}}>
                      <input type="checkbox" name="contactId" value={c.id} style={{marginRight:8}} />
                      <Link href={`/contacts/${c.id}`}>{c.firstName} {c.lastName}</Link>
                    </h3>
                    <div className="small">Email: {c.email ?? '—'}</div>
                    <div className="small">Phone: {c.phone ?? '—'}</div>
                  </div>
                  {/* Single remove with confirm modal (no typing required) */}
                  <ConfirmDelete
                    formAction="/api/accounts/remove-contact"
                    hiddenFields={{ accountId: account.id, contactId: c.id }}
                    title="Remove contact from account?"
                    body="This will unlink the contact from this account (not delete)."
                    buttonLabel="Remove"
                    confirmWord=""
                  />
                </div>
              </label>
            ))}
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Deals</h2>
        {account.deals.length === 0 && <div className="small">No deals</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {account.deals.map(d => (
            <div key={d.id} className="card">
              <h3><Link href={`/deals/${d.id}`}>{d.name}</Link></h3>
              <div className="small">Amount: {typeof d.amount === 'number'
                ? Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(d.amount)
                : '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
