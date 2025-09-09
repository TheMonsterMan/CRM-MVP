'use client';
import React, { useRef, useState } from 'react';

type Props = {
  formAction: string;
  hiddenFields: Record<string, string>;
  title: string;
  body: string;
  buttonLabel?: string;
  confirmWord?: string;
};

export default function ConfirmDelete({
  formAction,
  hiddenFields,
  title,
  body,
  buttonLabel = 'Delete',
  confirmWord = 'DELETE',
}: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [input, setInput] = useState('');
  const needsConfirm = !!confirmWord;

  return (
    <>
      <button type="button" onClick={() => dlg.current?.showModal()} style={{ background: '#7f1d1d', borderColor: '#7f1d1d' }}>
        {buttonLabel}
      </button>
      <dialog ref={dlg}>
        <form method="post" action={formAction} onSubmit={() => dlg.current?.close()}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          <p>{body}</p>

          {needsConfirm && (
            <div style={{ marginTop: 8 }}>
              <p className="small">Type <code>{confirmWord}</code> to confirm:</p>
              <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={confirmWord} />
            </div>
          )}

          {Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="hidden" name="confirm" value={input} />

          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button type="button" onClick={() => dlg.current?.close()}>Cancel</button>
            <button type="submit" style={{ background: '#7f1d1d', borderColor: '#7f1d1d' }} disabled={needsConfirm && input !== confirmWord}>Confirm</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
