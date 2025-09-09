export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StageVisibility from '@/app/components/StageVisibility';
import SegmentTabs from '@/app/components/SegmentTabs';
import BoardDnD from '@/app/components/BoardDnD';

type SP = { [key: string]: string | string[] | undefined };

function getParam(params: SP | undefined, key: string): string | undefined {
  const v = params?.[key];
  if (Array.isArray(v)) return v.join(',');
  return v as string | undefined;
}

function parseStagesParam(v?: string) {
  if (!v) return [];
  return v.split(',').map(x => x.trim()).filter(Boolean);
}

export default async function PipelinePage({ searchParams }: { searchParams?: SP }) {
  const pipeline = await prisma.pipeline.findFirst();
  const stages = pipeline
    ? await prisma.stage.findMany({ where: { pipelineId: pipeline.id }, orderBy: { order: 'asc' } })
    : [];

  const allDealsFull = pipeline
    ? await prisma.deal.findMany({
        where: { pipelineId: pipeline.id, deletedAt: null },
        include: {
          account: { select: { id: true, name: true, deletedAt: true } },
          contact: { select: { id: true, firstName: true, lastName: true, deletedAt: true } },
          stage: true,
        },
        orderBy: [{ createdAt: 'desc' }],
      })
    : [];

  const deals = allDealsFull.map(d => ({
    id: d.id,
    name: d.name,
    amount: typeof d.amount === 'number' ? d.amount : null,
    stageId: d.stageId,
    account: d.account && !d.account.deletedAt ? { id: d.account.id, name: d.account.name } : null,
    contact: d.contact && !d.contact.deletedAt ? { id: d.contact.id, firstName: d.contact.firstName, lastName: d.contact.lastName } : null,
  }));

  const counts = new Map<string, number>();
  for (const s of stages) counts.set(s.id, 0);
  for (const d of deals) counts.set(d.stageId, (counts.get(d.stageId) ?? 0) + 1);

  const requested = parseStagesParam(getParam(searchParams, 'stages'));
  const selectedIds = requested.length ? requested : stages.map(s => s.id);
  const selectedSet = new Set(selectedIds);
  const visibleStages = stages.filter(s => selectedSet.has(s.id));

  const lname = (s: { name: string }) => s.name.trim().toLowerCase();
  const hasClosed = stages.some(s => lname(s).startsWith('closed'));
  const maxOrder = stages.length ? Math.max(...stages.map(s => s.order ?? 0)) : 0;
  const completedSetByOrder = new Set(stages.filter(s => (s.order ?? 0) >= (maxOrder - 1)).map(s => s.id));
  function isCompleted(s: { id: string; name: string }) {
    if (hasClosed) return lname(s).startsWith('closed');
    return completedSetByOrder.has(s.id);
  }

  const progressStages = visibleStages.filter(s => !isCompleted(s));
  const completedStages = visibleStages.filter(isCompleted);

  const segmentRaw = (getParam(searchParams, 'segment') || '').toLowerCase();
  const segment = (segmentRaw === 'completed' || segmentRaw === 'both') ? segmentRaw : 'progress';

  const progressCount = deals.filter(d => progressStages.some(s => s.id === d.stageId)).length;
  const completedCount = deals.filter(d => completedStages.some(s => s.id === d.stageId)).length;

  return (
    <main>
      <h1>CRM MVP — Pipeline</h1>

      <SegmentTabs progressCount={progressCount} completedCount={completedCount} defaultSegment="progress" />

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Link href="/glance/daily"><button>Daily Glance</button></Link>
          <Link href="/glance/weekly"><button>Weekly Glance</button></Link>
        </div>
      </div>

      <StageVisibility
        stages={stages.map(s => ({ id: s.id, name: s.name, order: s.order, count: counts.get(s.id) ?? 0 }))}
        totalCount={deals.length}
      />

      {stages.length === 0 && <div className="panel"><div className="small">No stages found</div></div>}

      <BoardDnD
        stages={stages.map(s => ({ id: s.id, name: s.name, order: s.order }))}
        progressStageIds={progressStages.map(s => s.id)}
        completedStageIds={completedStages.map(s => s.id)}
        dealsInitial={deals}
        segment={segment as any}
      />
    </main>
  );
}
