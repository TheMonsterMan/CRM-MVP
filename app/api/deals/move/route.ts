import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const form = await req.formData();
    const dealId = String(form.get("dealId") ?? "").trim();
    const nextStageId = String(form.get("nextStageId") ?? "").trim();

    if (!dealId || !nextStageId) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const [deal, nextStage] = await Promise.all([
        prisma.deal.findUnique({ where: { id: dealId } }),
        prisma.stage.findUnique({ where: { id: nextStageId } })
    ]);

    if (!deal || !nextStage) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    if (deal.pipelineId !== nextStage.pipelineId) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    await prisma.deal.update({
        where: { id: dealId },
        data: { stageId: nextStageId }
    });

    return NextResponse.redirect(new URL("/", req.url));
}
