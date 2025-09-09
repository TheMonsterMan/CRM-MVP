import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const activityId = String(form.get("activityId") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "/").trim();
  const by = String(form.get("by") ?? "").trim() || null;

  const url = new URL(req.url);
  if (!activityId) return NextResponse.redirect(new URL("/", url.origin));

  const now = new Date();
  try { await prisma.activity.update({ where: { id: activityId }, data: { deletedAt: now, deletedBy: by } }); } catch {}

  const dest = new URL(returnTo || "/", url.origin);
  dest.searchParams.set("undo", `activity:${activityId}`);
  return NextResponse.redirect(dest);
}
