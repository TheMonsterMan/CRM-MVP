import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("activityId") ?? "").trim();
  const url = new URL(req.url);
  const returnTo = String(form.get("returnTo") ?? "/trash").trim();
  if (!id) return NextResponse.redirect(new URL("/trash", url.origin));
  try { await prisma.activity.update({ where: { id }, data: { deletedAt: null, deletedBy: null } }); } catch {}
  return NextResponse.redirect(new URL(returnTo, url.origin));
}
