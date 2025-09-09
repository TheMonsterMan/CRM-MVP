import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const contactId = String(form.get("contactId") ?? "").trim();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName  = String(form.get("lastName") ?? "").trim();
  const email     = String(form.get("email") ?? "").trim();
  const phone     = String(form.get("phone") ?? "").trim();
  const accountId = String(form.get("accountId") ?? "").trim();
  const returnTo  = String(form.get("returnTo") ?? "").trim();

  if (!contactId) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/contacts", url.origin));
  }

  let accountData: { accountId?: string | null } = {};
  if (accountId === "") {
    accountData.accountId = null;
  } else if (accountId) {
    const acc = await prisma.account.findUnique({ where: { id: accountId } });
    if (acc) accountData.accountId = acc.id;
  }

  try {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: firstName || undefined,
        lastName:  lastName  || undefined,
        email:     email     || null,
        phone:     phone     || null,
        ...accountData,
      },
    });
  } catch {}

  const url = new URL(req.url);
  const dest = returnTo || `/contacts/${contactId}`;
  return NextResponse.redirect(new URL(dest, url.origin));
}
