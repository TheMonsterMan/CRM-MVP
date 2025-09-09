export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ConfirmDelete from '@/app/components/ConfirmDelete';

type Params = { params: { id: string } };

export default async function ContactDetail({ params }: Params) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      account: true,
      deals: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!contact || (contact as any).deletedAt) {
    return <main><h1>Contact not found</h1><Link href="/contacts">&larr; Back to Contacts</Link></main>;
  }

  const accounts = await prisma.account.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  });

  return (
    <main>
      <h1>{contact.firstName} {contact.lastName}</h1>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Edit Contact</h2>
        <form method="post" action="/api/contacts/update" className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input type="hidden" name="contactId" value={contact.id} />
          <input type="hidden" name="returnTo" value={`/contacts/${contact.id}`} />
          <input name="firstName" defaultValue={contact.firstName} placeholder="First name" required />
          <input name="lastName" defaultValue={contact.lastName} placeholder="Last name" required />
          <input name="email" type="email" defaultValue={contact.email ?? ''} placeholder="Email (optional)" />
          <input name="phone" defaultValue={contact.phone ?? ''} placeholder="Phone (optional)" />
          <select name="accountId" defaultValue={contact.accountId ?? ''}>
            <option value="">— No account —</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button className="primary" type="submit">Save</button>
        </form>
      </div>

      <div className="panel">
        <h2>Deals</h2>
        {contact.deals.length === 0 && <div className="small">No deals</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {contact.deals.map(d => (
            <div key={d.id} className="card">
              <h3><Link href={`/deals/${d.id}`}>{d.name}</Link></h3>
              <div className="small">Amount: {typeof d.amount === 'number'
                ? Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(d.amount)
                : '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <h2>Danger Zone</h2>
        <p className="small">Deleting a contact will unlink it from all related deals.</p>
        <ConfirmDelete
          formAction="/api/contacts/delete"
          hiddenFields={{ contactId: contact.id, returnTo: "/contacts" }}
          title="Delete Contact?"
          body={`This will unlink related deals, then delete “${contact.firstName} ${contact.lastName}”.`}
          buttonLabel="Delete Contact"
          confirmWord="DELETE"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/contacts">&larr; Back to Contacts</Link>
      </div>
    </main>
  );
}
