import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const dealId = String(form.get("dealId") ?? "").trim();
  const confirm = String(form.get("confirm") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "/").trim();
  const by = String(form.get("by") ?? "").trim() || null;

  const url = new URL(req.url);
  const back = new URL(`/deals/${dealId}`, url.origin);

  if (!dealId) return NextResponse.redirect(new URL("/", url.origin));
  if (confirm !== "DELETE") return NextResponse.redirect(back);

  const now = new Date();
  try {
    await prisma.activity.updateMany({ where: { dealId, deletedAt: null }, data: { deletedAt: now, deletedBy: by } });
  } catch {}
  try {
    await prisma.deal.update({ where: { id: dealId }, data: { deletedAt: now, deletedBy: by } });
  } catch {}

  const dest = new URL(returnTo || "/", url.origin);
  dest.searchParams.set("undo", `deal:${dealId}`);
  return NextResponse.redirect(dest);
}
