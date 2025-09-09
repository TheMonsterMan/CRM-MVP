'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Stage = { id: string; name: string; order: number };
type Deal = {
  id: string;
  name: string | null;
  amount: number | null;
  stageId: string;
  account?: { id: string; name: string | null } | null;
  contact?: { id: string; firstName: string | null; lastName: string | null } | null;
};

type Segment = 'progress' | 'completed' | 'both';

export default function BoardDnD({
  stages,
  progressStageIds,
  completedStageIds,
  dealsInitial,
  segment = 'both',
}: {
  stages: Stage[];
  progressStageIds: string[];
  completedStageIds: string[];
  dealsInitial: Deal[];
  segment?: Segment;
}) {
  const router = useRouter();
  const [deals, setDeals] = React.useState<Deal[]>(dealsInitial);
  const [dragOverStage, setDragOverStage] = React.useState<string | null>(null);

  const [modal, setModal] = React.useState<{
    open: boolean;
    dealId?: string;
    fromStageName?: string | null;
    toStageName?: string | null;
  }>({ open: false });
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const typeRef = React.useRef<HTMLSelectElement>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (modal.open && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
    if (!modal.open && dialogRef.current?.open) dialogRef.current.close();
  }, [modal.open]);

  function stageById(id: string) { return stages.find(s => s.id === id); }

  function onDragStart(e: React.DragEvent, deal: Deal) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dealId: deal.id, fromStageId: deal.stageId }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  }
  function onDragLeave(_e: React.DragEvent, stageId: string) {
    if (dragOverStage === stageId) setDragOverStage(null);
  }

  async function onDrop(e: React.DragEvent, toStageId: string) {
    e.preventDefault();
    setDragOverStage(null);
    let payload: { dealId?: string; fromStageId?: string } = {};
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch {}
    const dealId = payload.dealId;
    if (!dealId) return;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stageId === toStageId) return;

    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: toStageId } : d));

    try {
      const res = await fetch(`/api/deals/${dealId}/change-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStageId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setModal({
        open: true,
        dealId,
        fromStageName: data.fromStageName ?? stageById(payload.fromStageId || '')?.name ?? null,
        toStageName: data.toStageName ?? stageById(toStageId)?.name ?? null,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: payload.fromStageId || d.stageId } : d));
      alert('Failed to move deal.');
    }
  }

  async function saveActivity(e: React.FormEvent) {
    e.preventDefault();
    const body = (textRef.current?.value || '').trim();
    const type = typeRef.current?.value || 'note';
    const dealId = modal.dealId;
    if (!dealId) return;
    if (!body) { setModal(prev => ({ ...prev, open: false })); return; }

    try {
      const res = await fetch(`/api/deals/${dealId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, body }),
      });
      if (!res.ok) throw new Error(await res.text());
      setModal({ open: false });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save activity.');
    }
  }

  const defaultNote = modal.fromStageName && modal.toStageName
    ? `Moved stage: ${modal.fromStageName} → ${modal.toStageName}`
    : 'Stage changed';

  function amountFmt(n: number | null) {
    return typeof n === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '—';
  }

  function StageColumn({ stageId }: { stageId: string }) {
    const stage = stages.find(s => s.id === stageId)!;
    const items = deals.filter(d => d.stageId === stageId);
    const isOver = dragOverStage === stageId;

    return (
      <section
        className="stageCol"
        onDragOver={(e) => onDragOver(e, stageId)}
        onDragLeave={(e) => onDragLeave(e, stageId)}
        onDrop={(e) => onDrop(e, stageId)}
        style={{ outline: isOver ? '3px dashed var(--primary)' : 'none', borderRadius: 12, transition: 'outline 80ms' }}
      >
        <div className="stageHeader">
          <h2>{stage.name}</h2>
          <div className="small" style={{ color: '#666', marginBottom: 6 }}>
            {items.length.toLocaleString()} deals
          </div>
        </div>

        {items.length === 0 && <div className="small">No deals</div>}

        <div className="cards">
          {items.map((d) => (
            <article key={d.id} className="card" draggable onDragStart={(e) => onDragStart(e, d)}>
              <h3><Link href={`/deals/${d.id}`}>{d.name ?? 'Untitled deal'}</Link></h3>
              <div className="small">Amount: {amountFmt(d.amount)}</div>
              <div className="small">
                Account: {d.account ? <Link href={`/accounts/${d.account.id}`}>{d.account.name || '—'}</Link> : '—'}
              </div>
              <div className="small">
                Contact: {d.contact ? <Link href={`/contacts/${d.contact.id}`}>{(d.contact.firstName || '') + ' ' + (d.contact.lastName || '')}</Link> : '—'}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const progressStages = stages.filter(s => progressStageIds.includes(s.id));
  const completedStages = stages.filter(s => completedStageIds.includes(s.id));

  const progressDeals = deals.filter(d => progressStageIds.includes(d.stageId));
  const completedDeals = deals.filter(d => completedStageIds.includes(d.stageId));

  const showProgress = segment === 'progress' || segment === 'both';
  const showCompleted = segment === 'completed' || segment === 'both';

  return (
    <>
      {showProgress && (
        <>
          <div className="panel" style={{ marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ margin: 0 }}>In Progress</h2>
              <div className="small" style={{ color: '#666' }}>{progressDeals.length.toLocaleString()} deals</div>
            </div>
          </div>
          <div className="panel">
            <div className="boardGrid">
              {progressStages.map(s => <StageColumn key={s.id} stageId={s.id} />)}
            </div>
          </div>
        </>
      )}

      {showCompleted && (
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0 }}>Completed</h2>
            <span className="small" style={{ color: '#666' }}>{completedDeals.length.toLocaleString()} deals</span>
          </div>
          <div className="hr" />
          <div className="boardGrid" style={{ marginTop: 12 }}>
            {completedStages.map(s => <StageColumn key={s.id} stageId={s.id} />)}
          </div>
        </div>
      )}

      <dialog ref={dialogRef} onClose={() => setModal({ open: false })}>
        <form method="dialog" onSubmit={saveActivity} style={{ minWidth: 420 }}>
          <h3 style={{ marginTop: 0 }}>Add activity for stage change</h3>
          <div className="small" style={{ marginBottom: 8, color: '#555' }}>
            {defaultNote}
          </div>

          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <label className="small" htmlFor="activityType">Type</label>
            <select id="activityType" ref={typeRef} defaultValue="note">
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <textarea
            ref={textRef}
            rows={5}
            placeholder="E.g., Spoke to buyer; sent proposal; waiting on PO…"
            defaultValue={defaultNote}
            style={{ width: '100%', marginBottom: 8 }}
          />

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => setModal({ open: false })}>Skip</button>
            <button type="submit" className="primary">Save activity</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
