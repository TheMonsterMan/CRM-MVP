export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ConfirmDelete from "@/app/components/ConfirmDelete";
import StageChangeWithActivity from "@/app/components/StageChangeWithActivity"; // ← add this

type Params = { params: { id: string } };

export default async function DealDetail({ params }: Params) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: {
      stage: true,
      account: true,
      contact: true,
      activities: { orderBy: { createdAt: "desc" } },
      // You already pull the pipeline with ordered stages here:
      pipeline: { include: { stages: { orderBy: { order: "asc" } } } },
    },
  });

  if (!deal) {
    return (
      <main>
        <h1>Deal not found</h1>
        <Link href="/">Back to Pipeline</Link>
      </main>
    );
  }

  // Stages are already available on the loaded pipeline
  const stages = deal.pipeline.stages;

  const [accounts, contacts] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.contact.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  return (
    <main>
      <h1>{deal.name}</h1>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Basics</h2>
        <form method="post" action="/api/deals/update-basic" className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="dealId" value={deal.id} />
          <input name="name" defaultValue={deal.name} placeholder="Deal name" required />
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            defaultValue={typeof deal.amount === "number" ? String(deal.amount) : ""}
          />
          <button className="primary" type="submit">Save</button>
        </form>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Stage</h2>

        {/* Replace your old form with the activity-prompting selector */}
        <StageChangeWithActivity
          dealId={deal.id}
          currentStageId={deal.stageId}
          stages={stages.map(s => ({ id: s.id, name: s.name, order: s.order }))}
        />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Related Links</h2>
        <form method="post" action="/api/deals/update-links" className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="dealId" value={deal.id} />
          <select name="accountId" defaultValue={deal.accountId ?? ""}>
            <option value="">— No account —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select name="contactId" defaultValue={deal.contactId ?? ""}>
            <option value="">— No contact —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.lastName}, {c.firstName}</option>
            ))}
          </select>
          <button className="primary" type="submit">Update Links</button>
        </form>

        <div className="small" style={{ marginTop: 8 }}>
          Account: {deal.account ? <Link href={`/accounts/${deal.account.id}`}>{deal.account.name}</Link> : "—"} ·{" "}
          Contact: {deal.contact ? <Link href={`/contacts/${deal.contact.id}`}>{deal.contact.firstName} {deal.contact.lastName}</Link> : "—"}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Add Activity</h2>
        <form method="post" action="/api/activities/create" className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <select name="type" defaultValue="note">
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
          <input name="createdBy" placeholder="Your name (optional)" />
          <input type="hidden" name="dealId" value={deal.id} />
          <input name="body" placeholder="Write a note..." style={{ flex: 1, minWidth: 240 }} required />
          <button className="primary" type="submit">Add</button>
        </form>
      </div>

      <div className="panel">
        <h2>Activity Timeline</h2>
        {deal.activities.length === 0 && <div className="small">No activity yet</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {deal.activities.map((a) => (
            <div key={a.id} className="card">
              <div className="small" style={{ marginBottom: 4 }}>
                [{a.type}] {new Date(a.createdAt).toLocaleString()} {a.createdBy ? `· ${a.createdBy}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>{a.body}</div>
                <ConfirmDelete
                  formAction="/api/activities/delete"
                  hiddenFields={{ activityId: a.id, returnTo: `/deals/${deal.id}` }}
                  title="Delete Activity?"
                  body="This will permanently remove this activity."
                  buttonLabel="🗑️"
                  confirmWord=""  // no type-to-confirm for single items
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Danger Zone</h2>
        <ConfirmDelete
          formAction="/api/deals/delete"
          hiddenFields={{ dealId: deal.id, returnTo: "/" }}
          title="Delete Deal?"
          body={`This will permanently delete “${deal.name}” and all its activities.`}
          buttonLabel="Delete Deal"
          confirmWord="DELETE"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/">&larr; Back to Pipeline</Link>
      </div>
    </main>
  );
}
