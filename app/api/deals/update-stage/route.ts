import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const dealId = String(form.get("dealId") ?? "").trim();
  const stageId = String(form.get("stageId") ?? "").trim();

  if (!dealId || !stageId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/deals/${dealId || ""}`, url.origin));
  }

  const [deal, stage] = await Promise.all([
    prisma.deal.findUnique({ where: { id: dealId } }),
    prisma.stage.findUnique({ where: { id: stageId } }),
  ]);

  if (!deal || !stage) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
  }

  // Ensure stage is in the same pipeline as the deal
  if (deal.pipelineId !== stage.pipelineId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
  }

  await prisma.deal.update({
    where: { id: dealId },
    data: { stageId },
  });

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
}
