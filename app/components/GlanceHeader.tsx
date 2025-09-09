'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function DailyHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const date = search.get('date') || new Date().toISOString().slice(0,10);

  function setDate(d: string) {
    const sp = new URLSearchParams(search.toString());
    if (d) sp.set('date', d); else sp.delete('date');
    router.replace(`${pathname}?${sp.toString()}`);
  }

  function shift(days: number) {
    const dt = new Date(date + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + days);
    setDate(dt.toISOString().slice(0,10));
  }

  return (
    <div className="row" style={{ alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <strong>Day:</strong>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button onClick={() => shift(-1)}>← Prev</button>
      <button onClick={() => setDate(new Date().toISOString().slice(0,10))}>Today</button>
      <button onClick={() => shift(1)}>Next →</button>
    </div>
  );
}

export function WeeklyHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const start = search.get('start') || (() => {
    const now = new Date();
    const day = now.getUTCDay(); // 0 Sun..6 Sat
    const diff = (day + 6) % 7; // days since Monday
    now.setUTCHours(0,0,0,0);
    now.setUTCDate(now.getUTCDate() - diff);
    return now.toISOString().slice(0,10);
  })();

  function setStart(d: string) {
    const sp = new URLSearchParams(search.toString());
    if (d) sp.set('start', d); else sp.delete('start');
    router.replace(`${pathname}?${sp.toString()}`);
  }

  function shift(weeks: number) {
    const dt = new Date(start + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + weeks*7);
    setStart(dt.toISOString().slice(0,10));
  }

  const end = (() => {
    const dt = new Date(start + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + 6);
    return dt.toISOString().slice(0,10);
  })();

  return (
    <div className="row" style={{ alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <strong>Week:</strong>
      <input type="date" value={start} onChange={e => setStart(e.target.value)} title="Week start (Mon)" />
      <span className="small">→ {end}</span>
      <button onClick={() => shift(-1)}>← Prev</button>
      <button onClick={() => setStart((() => {
        const now = new Date();
        const day = now.getUTCDay();
        const diff = (day + 6) % 7;
        now.setUTCHours(0,0,0,0);
        now.setUTCDate(now.getUTCDate() - diff);
        return now.toISOString().slice(0,10);
      })())}>This Week</button>
      <button onClick={() => shift(1)}>Next →</button>
    </div>
  );
}
