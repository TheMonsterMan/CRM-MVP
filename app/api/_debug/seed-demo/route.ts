import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

// tiny helpers
function pick<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)] }
function randi(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min }
function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") }
function money(min=1500,max=250000){ return Math.round((Math.random()*(max-min)+min)/100)*100 }
function recent(days=200){ const now=Date.now(); return new Date(now - randi(0,days)*86400000) }

const FIRST = ["Ava","Liam","Noah","Olivia","Emma","Amelia","Sophia","Isabella","Mia","Charlotte","James","Benjamin","Lucas","Henry","Alexander","Elijah","William","Michael","Ethan","Daniel","Sebastian","Jack","Aiden","Logan","Matthew","Jackson","Levi","David","Joseph","Samuel","Carter","Owen","Wyatt","Dylan","Evelyn","Harper","Abigail","Emily","Ella","Elizabeth","Sofia","Avery","Mila","Scarlett","Eleanor","Luna","Hazel","Aria","Chloe","Penelope","Layla","Nora"];
const LAST  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];
const COS   = ["Acme","Globex","Initech","Umbrella","Stark","Wayne","Oscorp","Soylent","Wonka","Hooli","Tyrell","Cyberdyne","Pied Piper","Aperture","Black Mesa","Monarch","Blue Sun","Hyperion","Nakatomi","Zorg","Dunder Mifflin","Octan","Duff","Planet Express"];
const TOPIC = ["Subscription","Implementation","Renewal","Upgrade","Pilot","POC","Annual","Multi-Year","Cross-Sell","Upsell"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reset  = url.searchParams.get("reset") === "1" || url.searchParams.get("reset") === "true";
  const NA = parseInt(url.searchParams.get("accounts") ?? "50", 10);
  const NC = parseInt(url.searchParams.get("contacts") ?? "120", 10);
  const ND = parseInt(url.searchParams.get("deals") ?? "160", 10);
  const MA = parseInt(url.searchParams.get("maxActs") ?? "3", 10);
  const NONCE = Date.now().toString(36).slice(-5);

  try {
    if (reset) {
      await prisma.activity.deleteMany({});
      await prisma.deal.deleteMany({});
      await prisma.contact.deleteMany({});
      await prisma.account.deleteMany({});
    }

    // Ensure pipeline & stages
    let pipeline = await prisma.pipeline.findFirst();
    if (!pipeline) {
      pipeline = await prisma.pipeline.create({ data: { name: "Default" } });
      const names = ["New","Qualified","Proposal","Negotiation","Closed Won","Closed Lost"];
      for (let i=0;i<names.length;i++) {
        await prisma.stage.create({ data: { name:names[i], order:i, pipelineId:pipeline.id } });
      }
    }
    const stages = await prisma.stage.findMany({ where: { pipelineId: pipeline.id }, orderBy: { order: "asc" }});

    // Accounts
    const accRows:any[] = [];
    for (let i=0;i<NA;i++){
      const name = `${pick(COS)} ${i%5===0 ? "LLC" : "Inc"}`.trim();
      accRows.push({ name, domain: `${slug(name)}-${i}-${NONCE}.example.com`, createdAt: recent(365) });
    }
    try { await prisma.account.createMany({ data: accRows }); } catch { for (const r of accRows){ try{ await prisma.account.create({ data:r }) } catch{} } }
    const accounts = await prisma.account.findMany({ select:{ id:true, name:true, domain:true } });

    // Contacts
    const ctRows:any[] = [];
    for (let i=0;i<NC;i++){
      const first = pick(FIRST), last = pick(LAST);
      const acc = Math.random() < 0.82 ? pick(accounts) : null;
      ctRows.push({
        firstName:first, lastName:last,
        email: `${slug(`${first}.${last}`)}-${i}-${NONCE}@${acc?acc.domain:"example.com"}`,
        phone: Math.random()<0.6 ? `${randi(200,999)}-${randi(200,999)}-${randi(1000,9999)}` : null,
        accountId: acc?acc.id:null,
        createdAt: recent(300)
      });
    }
    try { await prisma.contact.createMany({ data: ctRows }); } catch { for (const r of ctRows){ try{ await prisma.contact.create({ data:r }) } catch{} } }
    const contacts = await prisma.contact.findMany({ select:{ id:true, accountId:true } });

    // Deals
    const dlRows:any[] = [];
    for (let i=0;i<ND;i++){
      const s = pick(stages);
      const acc = Math.random()<0.85 ? pick(accounts) : null;
      let ct:any = null;
      if (acc){
        const pool = contacts.filter(c=>c.accountId===acc.id);
        ct = pool.length ? pick(pool) : (Math.random()<0.4 ? pick(contacts) : null);
      } else {
        ct = Math.random()<0.6 ? pick(contacts) : null;
      }
      dlRows.push({
        name: `${pick(TOPIC)} - ${(acc?.name || pick(COS)).split(" ")[0]} #${1000+i}`,
        amount: Math.random()<0.85 ? money() : null,
        stageId: s.id,
        pipelineId: pipeline.id,
        accountId: acc?acc.id:null,
        contactId: ct?ct.id:null,
        createdAt: recent(240)
      });
    }
    try { await prisma.deal.createMany({ data: dlRows }); } catch { for (const r of dlRows){ try{ await prisma.deal.create({ data:r }) } catch{} } }

    // Activities (lightweight)
    const deals = await prisma.deal.findMany({ select:{id:true} });
    const actTypes = ["note","call","email","meeting"];
    const acts:any[] = [];
    for (const d of deals){
      const k = randi(0, MA);
      for (let i=0;i<k;i++){
        acts.push({ dealId:d.id, type:pick(actTypes), body:`Auto ${pick(actTypes)} ${i+1}`, createdBy: Math.random()<0.5 ? pick(["Rep A","Rep B","AE","SDR"]) : null, createdAt: recent(180) });
      }
      if (acts.length > 800){ try{ await prisma.activity.createMany({ data: acts }) }catch{ for (const r of acts){ try{ await prisma.activity.create({ data:r }) }catch{} } } acts.length = 0; }
    }
    if (acts.length){ try{ await prisma.activity.createMany({ data: acts }) }catch{ for (const r of acts){ try{ await prisma.activity.create({ data:r }) }catch{} } } }

    const [pipelines, stagesCount, accountsCount, contactsCount, dealsCount, activitiesCount] = await prisma.$transaction([
      prisma.pipeline.count(), prisma.stage.count(), prisma.account.count(), prisma.contact.count(), prisma.deal.count(), prisma.activity.count()
    ]);

    return Response.json({ reset, created:{ accounts:NA, contacts:NC, deals:ND, maxActivitiesPerDeal:MA }, summary:{ pipelines, stages:stagesCount, accounts:accountsCount, contacts:contactsCount, deals:dealsCount, activities:activitiesCount } });
  } catch (e:any) {
    return new Response(String(e?.message || e), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
