import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const accountId = String(form.get("accountId") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const domain = String(form.get("domain") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "").trim();

  if (!accountId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/", url.origin));
  }

  try {
    await prisma.account.update({
      where: { id: accountId },
      data: { name: name || undefined, domain: domain || null },
    });
  } catch {}

  const url = new URL(req.url);
  const dest = returnTo || `/accounts/${accountId}`;
  return NextResponse.redirect(new URL(dest, url.origin));
}
