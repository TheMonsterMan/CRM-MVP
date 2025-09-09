'use client';

import React from 'react';

type Mode = 'hc-light' | 'hc-dark';

export default function ThemeToggle() {
  const [mode, setMode] = React.useState<Mode>(() => {
    if (typeof window === 'undefined') return 'hc-light';
    return (localStorage.getItem('crm:theme') as Mode) || 'hc-light';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('crm:theme', mode); } catch {}
  }, [mode]);

  return (
    <div className="row" style={{ gap: 6 }}>
      <label className="small" htmlFor="themeSel">Theme</label>
      <select id="themeSel" value={mode} onChange={e => setMode(e.target.value as Mode)}>
        <option value="hc-light">High Contrast (Light)</option>
        <option value="hc-dark">High Contrast (Dark)</option>
      </select>
    </div>
  );
}
