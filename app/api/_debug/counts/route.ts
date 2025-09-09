import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [pipelines, stages, accounts, contacts, deals, activities] = await prisma.$transaction([
      prisma.pipeline.count(),
      prisma.stage.count(),
      prisma.account.count(),
      prisma.contact.count(),
      prisma.deal.count(),
      prisma.activity.count(),
    ]);
    return Response.json({ pipelines, stages, accounts, contacts, deals, activities });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
