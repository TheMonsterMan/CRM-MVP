import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const accountId = String(form.get("accountId") ?? "").trim();
  const idsRaw = form.getAll("contactId");

  const url = new URL(req.url);
  if (!accountId) {
    return NextResponse.redirect(new URL("/accounts", url.origin));
  }

  const ids = idsRaw.map(v => String(v)).filter(Boolean);

  if (ids.length > 0) {
    try {
      await prisma.contact.updateMany({
        where: { id: { in: ids }, accountId },
        data: { accountId: null },
      });
    } catch {}
  }

  return NextResponse.redirect(new URL(`/accounts/${accountId}`, url.origin));
}
