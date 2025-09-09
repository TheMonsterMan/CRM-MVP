import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const contactId = String(form.get("contactId") ?? "").trim();
  const confirm = String(form.get("confirm") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "/contacts").trim();
  const by = String(form.get("by") ?? "").trim() || null;

  const url = new URL(req.url);
  const back = new URL(`/contacts/${contactId}`, url.origin);

  if (!contactId) return NextResponse.redirect(new URL("/contacts", url.origin));
  if (confirm !== "DELETE") return NextResponse.redirect(back);

  const now = new Date();
  try { await prisma.contact.update({ where: { id: contactId }, data: { deletedAt: now, deletedBy: by } }); } catch {}

  const dest = new URL(returnTo, url.origin);
  dest.searchParams.set("undo", `contact:${contactId}`);
  return NextResponse.redirect(dest);
}
