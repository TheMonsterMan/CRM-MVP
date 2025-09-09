// app/api/deals/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const amountRaw = form.get("amount");
    const stageId = String(form.get("stageId") ?? "").trim();
    const pipelineId = String(form.get("pipelineId") ?? "").trim();
    const accountId = String(form.get("accountId") ?? "").trim();
    const contactId = String(form.get("contactId") ?? "").trim();

    if (!name || !stageId || !pipelineId) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const amount =
        amountRaw !== null && amountRaw !== undefined && String(amountRaw).trim() !== ""
            ? Number(amountRaw)
            : undefined;

    // Minimal sanity checks (MVP)
    const stage = await prisma.stage.findUnique({ where: { id: stageId } });
    if (!stage || stage.pipelineId !== pipelineId) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    await prisma.deal.create({
        data: {
            name,
            amount,
            stageId,
            pipelineId,
            accountId: accountId || null,
            contactId: contactId || null
        }
    });

    return NextResponse.redirect(new URL("/", req.url));
}
