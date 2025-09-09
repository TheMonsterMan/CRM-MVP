'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type Stage = { id: string; name: string; order?: number };

export default function StageChangeWithActivity({
  dealId,
  currentStageId,
  stages,
}: {
  dealId: string;
  currentStageId: string;
  stages: Stage[];
}) {
  const router = useRouter();
  const [stageId, setStageId] = React.useState(currentStageId);
  const [fromStageName, setFromStageName] = React.useState<string | null>(null);
  const [toStageName, setToStageName] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const typeRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      setTimeout(() => textRef.current?.focus(), 10);
    }
    if (!open && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open]);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const toStageId = e.target.value;
    if (!toStageId || toStageId === stageId) return;

    setErr(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/change-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStageId }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to change stage');
      }
      const data = await res.json();
      setStageId(toStageId);
      setFromStageName(data.fromStageName ?? null);
      setToStageName(data.toStageName ?? null);
      setOpen(true);
      router.refresh();
    } catch (e:any) {
      console.error(e);
      setErr(String(e?.message || e));
      e.target.value = stageId;
    }
  }

  async function submitActivity(ev: React.FormEvent) {
    ev.preventDefault();
    if (!textRef.current) return;
    const body = textRef.current.value.trim();
    const type = typeRef.current?.value || 'note';
    if (!body) { setErr('Please add a short note.'); return; }

    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, body }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create activity');
      }
      setOpen(false);
      router.refresh();
    } catch (e:any) {
      console.error(e);
      setErr(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  function skipActivity() {
    if (confirm('Skip adding an activity for this stage change?')) setOpen(false);
  }

  const defaultNote = fromStageName && toStageName
    ? `Moved stage: ${fromStageName} → ${toStageName}`
    : 'Stage changed';

  return (
    <>
      <label className="small" htmlFor="stageSelect">Stage</label>
      <select id="stageSelect" value={stageId} onChange={handleChange}>
        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {err && <div className="small" style={{ color:'crimson' }}>{err}</div>}

      <dialog ref={dialogRef} onClose={() => setOpen(false)}>
        <form method="dialog" onSubmit={submitActivity} style={{ minWidth: 420 }}>
          <h3 style={{ marginTop: 0 }}>Add activity for stage change</h3>
          <div className="small" style={{ marginBottom: 8, color: '#555' }}>
            {fromStageName && toStageName
              ? <>You changed the stage from <strong>{fromStageName}</strong> to <strong>{toStageName}</strong>.</>
              : <>A stage change was recorded.</>
            } Please log what led to this change.
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
            placeholder="E.g., Call with buyer; sent pricing; got verbal; waiting on PO…"
            defaultValue={defaultNote}
            style={{ width: '100%', marginBottom: 8 }}
          />

          {err && <div className="small" style={{ color:'crimson', marginBottom: 8 }}>{err}</div>}

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={skipActivity}>Skip</button>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save activity'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
