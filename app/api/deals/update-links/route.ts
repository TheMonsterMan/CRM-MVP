import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const dealId = String(form.get("dealId") ?? "").trim();
  const accountId = String(form.get("accountId") ?? "").trim();
  const contactId = String(form.get("contactId") ?? "").trim();

  if (!dealId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const data: any = {};

  // Account
  if (accountId === "") {
    data.accountId = null;
  } else if (accountId) {
    const acc = await prisma.account.findUnique({ where: { id: accountId } });
    if (acc) data.accountId = acc.id;
  }

  // Contact
  if (contactId === "") {
    data.contactId = null;
  } else if (contactId) {
    const ct = await prisma.contact.findUnique({ where: { id: contactId } });
    if (ct) data.contactId = ct.id;
  }

  try {
    await prisma.deal.update({ where: { id: dealId }, data });
  } catch {}

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, url.origin));
}
