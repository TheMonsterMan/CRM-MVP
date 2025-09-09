import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const form = await req.formData();
  const firstName = String(form.get('firstName') ?? '').trim();
  const lastName  = String(form.get('lastName') ?? '').trim();
  const emailRaw  = String(form.get('email') ?? '').trim();
  const phone     = String(form.get('phone') ?? '').trim();
  const accountId = String(form.get('accountId') ?? '').trim();

  if (!firstName || !lastName) {
    return NextResponse.redirect(new URL('/contacts', req.url));
  }

  try {
    if (emailRaw) {
      await prisma.contact.upsert({
        where: { email: emailRaw },
        update: { firstName, lastName, phone, accountId: accountId || null },
        create: { firstName, lastName, email: emailRaw, phone, accountId: accountId || null },
      });
    } else {
      await prisma.contact.create({
        data: { firstName, lastName, phone, accountId: accountId || null },
      });
    }
  } catch (e) {
    // ignore for MVP
  }

  // Prefer redirect back to referer if present
  return NextResponse.redirect(new URL('/contacts', req.url));
}
