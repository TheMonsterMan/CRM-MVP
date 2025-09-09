'use client';

import React from 'react';

type Mode = 'hc-light' | 'hc-dark';

export default function ThemeSwitch() {
  const [mode, setMode] = React.useState<Mode>(() => {
    if (typeof window === 'undefined') return 'hc-dark';
    return (localStorage.getItem('crm:theme') as Mode) || 'hc-dark';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('crm:theme', mode); } catch {}
  }, [mode]);

  const checked = mode === 'hc-dark';

  return (
    <div className="sideFooter" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
      <span className="small">Theme</span>
      <label style={{ display:'inline-flex', alignItems:'center', gap:10, cursor:'pointer' }}>
        <span className="small">{checked ? 'Dark' : 'Light'}</span>
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => setMode(e.target.checked ? 'hc-dark' : 'hc-light')}
          style={{ position:'absolute', opacity:0, width:0, height:0 }}
        />
        <span
          aria-hidden="true"
          style={{
            width: 46, height: 28, borderRadius: 999,
            border: '2px solid var(--border)', background: checked ? 'var(--primary)' : 'var(--card)',
            display: 'inline-flex', alignItems: 'center', padding: 2
          }}
        >
          <span
            style={{
              width: 20, height: 20, borderRadius: '999px',
              background: checked ? 'var(--on-primary)' : 'var(--text)',
              marginLeft: checked ? 18 : 0
            }}
          />
        </span>
      </label>
    </div>
  );
}
