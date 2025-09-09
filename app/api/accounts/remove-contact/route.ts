import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const accountId = String(form.get("accountId") ?? "").trim();
  const contactId = String(form.get("contactId") ?? "").trim();

  const url = new URL(req.url);
  if (!accountId || !contactId) {
    return NextResponse.redirect(new URL("/accounts", url.origin));
  }

  try {
    // Only unlink if the contact currently belongs to this account (safety check)
    await prisma.contact.update({
      where: { id: contactId },
      data: { accountId: null },
    });
  } catch {}

  return NextResponse.redirect(new URL(`/accounts/${accountId}`, url.origin));
}
