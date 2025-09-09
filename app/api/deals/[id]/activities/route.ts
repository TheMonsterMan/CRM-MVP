import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const dealId = ctx.params.id;
  if (!dealId) return NextResponse.json({ error: "Missing deal id" }, { status: 400 });

  let payload: { type?: string; body?: string; createdBy?: string | null } = {};
  try { payload = await req.json(); } catch {}

  const type = (payload.type || "note").toLowerCase();
  const body = (payload.body || "").trim();
  const createdBy = payload.createdBy ?? null;

  if (!body) return NextResponse.json({ error: "Activity body is required" }, { status: 400 });

  const exists = await prisma.deal.findUnique({ where: { id: dealId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const activity = await prisma.activity.create({
    data: { dealId, type, body, createdBy },
  });

  return NextResponse.json({ ok: true, activityId: activity.id });
}
