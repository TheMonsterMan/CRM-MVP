import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get('name') ?? '').trim();
  const domainRaw = String(form.get('domain') ?? '').trim();

  if (!name) {
    return NextResponse.redirect(new URL('/accounts', req.url));
  }

  try {
    if (domainRaw) {
      await prisma.account.upsert({
        where: { domain: domainRaw },
        update: { name },
        create: { name, domain: domainRaw },
      });
    } else {
      await prisma.account.create({ data: { name } });
    }
  } catch (e) {
    // ignore for MVP
  }

  return NextResponse.redirect(new URL('/accounts', req.url));
}
