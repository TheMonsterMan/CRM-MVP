import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const dealId   = String(form.get("dealId") ?? "").trim();
  const type     = String(form.get("type") ?? "note").trim() || "note";
  const body     = String(form.get("body") ?? "").trim();
  const createdBy = String(form.get("createdBy") ?? "").trim() || null;

  if (!dealId || !body) {
    // redirect back to deal page
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/deals/${dealId || ""}`, url.origin));
  }

  await prisma.activity.create({
    data: { dealId, type, body, createdBy },
  });

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
}
