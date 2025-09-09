import React from 'react';

export default function UndoBar({ undo }: { undo?: string }) {
  if (!undo) return null;
  const parts = undo.split(':', 2);
  if (parts.length < 2) return null;
  const [undoType, undoId] = parts as [string, string];
  const label = undoType ? undoType.charAt(0).toUpperCase() + undoType.slice(1) : '';

  let restoreAction = '/api/deals/restore';
  let idField = 'dealId';
  if (undoType === 'account') { restoreAction = '/api/accounts/restore'; idField = 'accountId'; }
  if (undoType === 'contact') { restoreAction = '/api/contacts/restore'; idField = 'contactId'; }
  if (undoType === 'activity') { restoreAction = '/api/activities/restore'; idField = 'activityId'; }

  return (
    <div className="card" style={{marginBottom:12, background:'#fff7ed', borderColor:'#fdba74'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
        <div><strong>{label} moved to Trash.</strong></div>
        <form method="post" action={restoreAction}>
          <input type="hidden" name={idField} value={undoId} />
          <button>Undo</button>
        </form>
      </div>
    </div>
  );
}
