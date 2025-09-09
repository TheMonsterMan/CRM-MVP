'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Segment = 'progress' | 'completed' | 'both';

export default function SegmentTabs({
  progressCount,
  completedCount,
  defaultSegment = 'progress',
}: {
  progressCount: number;
  completedCount: number;
  defaultSegment?: Segment;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [segment, setSegment] = React.useState<Segment>(() => {
    const fromUrl = (search.get('segment') || '').toLowerCase();
    const fromStorage = (typeof window !== 'undefined' ? localStorage.getItem('crm:segment') : null) as Segment | null;
    if (fromUrl === 'progress' || fromUrl === 'completed' || fromUrl === 'both') return fromUrl;
    if (fromStorage === 'progress' || fromStorage === 'completed' || fromStorage === 'both') return fromStorage;
    return defaultSegment;
  });

  React.useEffect(() => {
    try { localStorage.setItem('crm:segment', segment); } catch {}
    const sp = new URLSearchParams(search.toString());
    if (segment === defaultSegment) sp.delete('segment'); else sp.set('segment', segment);
    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  function Tab({
    id, label, active, onClick, count
  }: { id: Segment; label: string; active: boolean; onClick: () => void; count?: number }) {
    return (
      <button
        role="tab"
        aria-selected={active}
        aria-controls={`panel-${id}`}
        id={`tab-${id}`}
        onClick={onClick}
        className={active ? 'primary' : ''}
        style={{ padding: '8px 12px', borderRadius: 999, fontWeight: 700 }}
      >
        {label}{typeof count === 'number' ? ` (${count.toLocaleString()})` : ''}
      </button>
    );
  }

  return (
    <nav aria-label="Deal segments" role="tablist" className="panel" style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
      <Tab id="progress" label="In Progress" active={segment === 'progress'} onClick={() => setSegment('progress')} count={progressCount} />
      <Tab id="completed" label="Completed" active={segment === 'completed'} onClick={() => setSegment('completed')} count={completedCount} />
      <button
        onClick={() => setSegment(segment === 'both' ? 'progress' : 'both')}
        title="Toggle show both sections"
        style={{ marginLeft: 'auto' }}
      >
        {segment === 'both' ? 'Show tabs' : 'Show both'}
      </button>
    </nav>
  );
}
