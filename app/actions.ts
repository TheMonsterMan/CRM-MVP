"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDeal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const amountRaw = formData.get("amount");
  const stageId = String(formData.get("stageId") ?? "").trim();
  const pipelineId = String(formData.get("pipelineId") ?? "").trim();

  if (!name || !stageId || !pipelineId) return;

  const amount =
    amountRaw !== null && amountRaw !== undefined && String(amountRaw).trim() !== "" ? Number(amountRaw) : undefined;

  // Ensure stage belongs to pipeline (defensive)
  const stage = await prisma.stage.findUnique({ where: { id: stageId } });
  if (!stage || stage.pipelineId !== pipelineId) return;

  await prisma.deal.create({
    data: { name, amount, stageId, pipelineId }
  });

  revalidatePath("/");
}

export async function moveDeal(dealId: string, nextStageId: string) {
  if (!dealId || !nextStageId) return;

  const [deal, nextStage] = await Promise.all([
    prisma.deal.findUnique({ where: { id: dealId } }),
    prisma.stage.findUnique({ where: { id: nextStageId } })
  ]);
  if (!deal || !nextStage) return;
  if (deal.pipelineId !== nextStage.pipelineId) return; // cross-pipeline guard

  await prisma.deal.update({
    where: { id: dealId },
    data: { stageId: nextStageId }
  });

  revalidatePath("/");
}
