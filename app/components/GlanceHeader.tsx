'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export default function GlanceHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // In some build/type combos, Next types this as URLSearchParams | null.
  // Provide a safe fallback so TS is happy during SSR builds.
  const search = useSearchParams();
  const searchStr = search?.toString() ?? '';
  const spInitial = React.useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const today = new Date().toISOString().slice(0, 10);
  const date = spInitial.get('date') ?? today;
  const view = spInitial.get('view') ?? 'daily'; // 'daily' | 'weekly'

  function setParam(key: string, value: string) {
    const sp = new URLSearchParams(search?.toString() ?? '');
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setDate(d: string) {
    setParam('date', d);
  }

  function setView(v: 'daily' | 'weekly') {
    setParam('view', v);
  }

  return (
    <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <strong>Glance</strong>

      <div className="spacer" />

      <div className="button-group" role="tablist" aria-label="Glance range">
        <button
          className={`button ${view === 'daily' ? 'primary' : ''}`}
          role="tab"
          aria-selected={view === 'daily'}
          onClick={() => setView('daily')}
        >
          Daily
        </button>
        <button
          className={`button ${view === 'weekly' ? 'primary' : ''}`}
          role="tab"
          aria-selected={view === 'weekly'}
          onClick={() => setView('weekly')}
        >
          Weekly
        </button>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.currentTarget.value || today)}
        className="input"
        style={{ marginLeft: 8 }}
        aria-label="Choose date"
      />
    </div>
  );
}
