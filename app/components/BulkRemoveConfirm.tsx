'use client';
import React, { useRef } from 'react';

export default function BulkRemoveConfirm({
  formId,
  title = 'Remove selected contacts?',
  body = 'This will unlink the selected contacts from this account. They will not be deleted.',
  buttonLabel = 'Remove selected',
}: {
  formId: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
}) {
  const dlg = useRef<HTMLDialogElement>(null);

  function hasSelection() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return false;
    return form.querySelectorAll('input[name="contactId"]:checked').length > 0;
  }

  function open() {
    if (!hasSelection()) {
      alert('Select at least one contact to remove.');
      return;
    }
    dlg.current?.showModal();
  }

  function confirm() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    dlg.current?.close();
    form.submit();
  }

  return (
    <>
      <button type="button" onClick={open}>{buttonLabel}</button>
      <dialog ref={dlg}>
        <h3 style={{marginTop:0}}>{title}</h3>
        <p>{body}</p>
        <div className="row" style={{gap:8, marginTop:12}}>
          <button type="button" onClick={() => dlg.current?.close()}>Cancel</button>
          <button type="button" onClick={confirm} style={{ background: '#7f1d1d', borderColor: '#7f1d1d' }}>Confirm</button>
        </div>
      </dialog>
    </>
  );
}
