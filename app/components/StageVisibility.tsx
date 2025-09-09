'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type StageLite = { id: string; name: string; order: number; count?: number };

function parseParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

function serializeParam(ids: string[]): string | null {
  if (!ids.length) return null;
  return ids.join(',');
}

function useSelected(initialAllIds: string[]) {
  const search = useSearchParams();
  const [selected, setSelected] = React.useState<string[]>(() => {
    // 1) URL param
    const fromUrl = parseParam(search.get('stages'));
    if (fromUrl.length) return fromUrl;
    // 2) local storage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('crm:visibleStages');
        if (raw) {
          const arr = JSON.parse(raw) as string[];
          if (Array.isArray(arr) && arr.length) return arr;
        }
      } catch {}
    }
    // 3) default = all
    return initialAllIds;
  });

  // Keep localStorage in sync
  React.useEffect(() => {
    try { localStorage.setItem('crm:visibleStages', JSON.stringify(selected)); } catch {}
  }, [selected]);

  return [selected, setSelected] as const;
}

export default function StageVisibility({
  stages,
  totalCount,
}: {
  stages: StageLite[];
  totalCount?: number;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const allIds = React.useMemo(() => stages.map(s => s.id), [stages]);
  const [selected, setSelected] = useSelected(allIds);

  // When search params change (via back/forward), update selection
  React.useEffect(() => {
    const fromUrl = parseParam(search.get('stages'));
    if (fromUrl.length) setSelected(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.get('stages')]);

  function applySelection(nextIds: string[]) {
    const sp = new URLSearchParams(search.toString());
    if (nextIds.length === allIds.length) {
      sp.delete('stages');
    } else {
      const str = serializeParam(nextIds);
      if (str) sp.set('stages', str);
    }
    // Always reset pagination on board (if any)
    sp.delete('page');
    router.replace(`${pathname}?${sp.toString()}`);
    setSelected(nextIds);
  }

  function toggle(id: string, only = false, neighborhood = false) {
    if (only) {
      // single only
      return applySelection([id]);
    }
    if (neighborhood) {
      // include neighbors ±1 by order
      const idx = stages.findIndex(s => s.id === id);
      const ids = [stages[Math.max(0, idx - 1)]?.id, id, stages[Math.min(stages.length - 1, idx + 1)]?.id]
        .filter(Boolean) as string[];
      return applySelection(Array.from(new Set(ids)));
    }
    const set = new Set(selected);
    if (set.has(id)) set.delete(id); else set.add(id);
    if (set.size === 0) return applySelection(allIds); // never allow empty -> fallback to all
    applySelection(Array.from(set));
  }

  function all() { applySelection(allIds); }

  return (
    <div className="panel" style={{ position: 'sticky', top: 0, zIndex: 2, marginBottom: 12 }}>
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div className="row" style={{ alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong>Visible stages</strong>
          <button onClick={all} title="Show all stages">All</button>
          <span className="small" style={{ color: '#666' }}>
            Click to toggle · Shift=Only · Alt=±1
          </span>
        </div>
        {typeof totalCount === 'number' && (
          <div className="small">Total deals: {totalCount.toLocaleString()}</div>
        )}
      </div>

      <div className="row" style={{ gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {stages.map(s => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={(e) => toggle(s.id, e.shiftKey, e.altKey)}
              className={active ? 'primary' : ''}
              style={{ whiteSpace: 'nowrap' }}
              title={`Stage: ${s.name}${typeof s.count === 'number' ? ` · ${s.count} deals` : ''}`}
            >
              {s.name}{typeof s.count === 'number' ? ` (${s.count})` : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
