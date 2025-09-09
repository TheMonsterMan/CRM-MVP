'use client';
import React from 'react';

export default function SelectAll({
  formId,
  targetName = 'contactId',
  label = 'Select all',
}: {
  formId: string;
  targetName?: string;
  label?: string;
}) {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    form.querySelectorAll(`input[name="${targetName}"]`).forEach((el) => {
      const box = el as HTMLInputElement;
      box.checked = e.target.checked;
    });
  }
  return (
    <label className="small" style={{display:'flex', alignItems:'center', gap:6}}>
      <input type="checkbox" onChange={onChange} /> {label}
    </label>
  );
}
