'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Segment = 'progress' | 'completed' | 'both';

export default function SegmentTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Guard against null during SSR/type check
  const search = useSearchParams();
  const searchStr = search?.toString() ?? '';
  const initial = React.useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const [segment, setSegment] = React.useState<Segment>(() => {
    const fromUrl = (initial.get('segment') || '').toLowerCase() as Segment;
    const fromStorage =
      (typeof window !== 'undefined'
        ? (localStorage.getItem('crm:segment') as Segment | null)
        : null) ?? null;

    if (fromUrl === 'progress' || fromUrl === 'completed' || fromUrl === 'both') return fromUrl;
    if (fromStorage === 'progress' || fromStorage === 'completed' || fromStorage === 'both') return fromStorage;
    return 'progress';
  });

  function apply(newSeg: Segment) {
    setSegment(newSeg);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('crm:segment', newSeg);
    } catch {}
    const sp = new URLSearchParams(search?.toString() ?? '');
    if (newSeg === 'progress') sp.delete('segment'); // default
    else sp.set('segment', newSeg);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="button-group" role="tablist" aria-label="Pipeline segment">
      <button
        className={`button ${segment === 'progress' ? 'primary' : ''}`}
        role="tab"
        aria-selected={segment === 'progress'}
        onClick={() => apply('progress')}
      >
        In&nbsp;Progress
      </button>
      <button
        className={`button ${segment === 'completed' ? 'primary' : ''}`}
        role="tab"
        aria-selected={segment === 'completed'}
        onClick={() => apply('completed')}
      >
        Completed
      </button>
      <button
        className={`button ${segment === 'both' ? 'primary' : ''}`}
        role="tab"
        aria-selected={segment === 'both'}
        onClick={() => apply('both')}
      >
        Both
      </button>
    </div>
  );
}
