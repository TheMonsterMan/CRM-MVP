import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const dealId = ctx.params.id;
  if (!dealId) return NextResponse.json({ error: "Missing deal id" }, { status: 400 });

  let payload: { toStageId?: string; createdBy?: string | null } = {};
  try { payload = await req.json(); } catch {}

  const toStageId = payload?.toStageId;
  const createdBy = payload?.createdBy ?? null;
  if (!toStageId) return NextResponse.json({ error: "Missing toStageId" }, { status: 400 });

  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: { stage: true } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  if (deal.stageId === toStageId) {
    return NextResponse.json({
      ok: true,
      dealId,
      fromStageId: deal.stageId,
      fromStageName: deal.stage?.name ?? null,
      toStageId,
      toStageName: deal.stage?.name ?? null,
      unchanged: true,
    });
  }

  const toStage = await prisma.stage.findUnique({ where: { id: toStageId } });
  if (!toStage) return NextResponse.json({ error: "Target stage not found" }, { status: 400 });

  // Update stage
  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: { stageId: toStageId },
    include: { stage: true },
  });

  // Log stage change
  await prisma.dealStageChange.create({
    data: {
      dealId,
      fromStageId: deal.stageId,
      toStageId: toStageId,
      createdBy: createdBy,
    },
  });

  return NextResponse.json({
    ok: true,
    dealId,
    fromStageId: deal.stageId,
    fromStageName: deal.stage?.name ?? null,
    toStageId: updated.stageId,
    toStageName: updated.stage?.name ?? null,
  });
}
