import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const dealId = String(form.get("dealId") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const amountRaw = form.get("amount");

  if (!dealId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const amount =
    amountRaw !== null && amountRaw !== undefined && String(amountRaw).trim() !== ""
      ? Number(amountRaw)
      : null;

  try {
    await prisma.deal.update({
      where: { id: dealId },
      data: { name: name || undefined, amount: amount },
    });
  } catch {}

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
}
