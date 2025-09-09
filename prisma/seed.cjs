/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');

const prisma = new PrismaClient();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function slugify(str) { return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function randomId(prefix='') { return prefix + crypto.randomUUID().replace(/-/g, '').slice(0, 16); }

const FIRST = ['Ava','Liam','Noah','Olivia','Emma','Amelia','Sophia','Isabella','Mia','Charlotte','James','Benjamin','Lucas','Henry','Alexander','Elijah','William','Michael','Ethan','Daniel','Sebastian','Jack','Aiden','Logan','Matthew','Jackson','Levi','David','Joseph','Samuel','Carter','Owen','Wyatt','Dylan','Evelyn','Harper','Abigail','Emily','Ella','Elizabeth','Sofia','Avery','Mila','Scarlett','Eleanor','Luna','Hazel','Aria','Chloe','Penelope','Layla','Nora'];
const LAST  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];
const COMPANIES = ['Acme','Globex','Initech','Umbrella','Stark','Wayne','Oscorp','Soylent','Wonka','Hooli','Massive Dynamic','Tyrell','Cyberdyne','Pied Piper','Gringotts','Aperture','Black Mesa','Monarch','Blue Sun','Hyperion','Nakatomi','Oceanic','Virtucon','Zorg','Dunder Mifflin','Prestige Worldwide','Octan','Yoyodyne','Duff','MomCorp','Gekko & Co','Planet Express','Paper Street','Good Burger','Los Pollos Hermanos'];
const INDUSTRIES = ['SaaS','Healthcare','Finance','Retail','Manufacturing','Energy','Media','Education','Hospitality','Transportation','Real Estate','Insurance'];
const DEAL_TOPICS = ['Subscription','Implementation','Renewal','Upgrade','Pilot','POC','Annual','Multi-Year','Cross-Sell','Upsell'];

function randPhone() {
  const a = randInt(200, 999), b = randInt(200, 999), c = randInt(1000, 9999);
  return `${a}-${b}-${c}`;
}
function randMoney(min=1000, max=250000) {
  const val = Math.round((Math.random() * (max - min) + min) / 100) * 100;
  return val;
}
function randRecentDate(days=180) {
  const now = Date.now();
  const past = now - randInt(0, days) * 24 * 3600 * 1000;
  return new Date(past);
}

async function main() {
  const RESET = String(process.env.SEED_RESET || '').toLowerCase() === 'true';

  const NUM_ACCOUNTS = parseInt(process.env.SEED_ACCOUNTS || '150', 10);
  const NUM_CONTACTS = parseInt(process.env.SEED_CONTACTS || '300', 10);
  const NUM_DEALS    = parseInt(process.env.SEED_DEALS    || '400', 10);
  const MAX_ACTS     = parseInt(process.env.SEED_MAX_ACTIVITIES || '5', 10);

  console.log('Seed start');
  console.log({ RESET, NUM_ACCOUNTS, NUM_CONTACTS, NUM_DEALS, MAX_ACTS });

  if (RESET) {
    console.log('Resetting (soft-delete friendly): clearing Activities, Deals, Contacts, Accounts');
    await prisma.activity.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.account.deleteMany({});
  }

  // Ensure a pipeline with canonical 6 stages exists
  let pipeline = await prisma.pipeline.findFirst();
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({ data: { name: 'Default' } });
    const names = ['New','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'];
    for (let i = 0; i < names.length; i++) {
      await prisma.stage.create({ data: { name: names[i], order: i, pipelineId: pipeline.id } });
    }
  }
  const stages = await prisma.stage.findMany({ where: { pipelineId: pipeline.id }, orderBy: { order: 'asc' } });

  // Accounts
  const accountRows = [];
  const usedDomains = new Set();
  for (let i = 0; i < NUM_ACCOUNTS; i++) {
    const company = pick(COMPANIES) + ' ' + (i % 7 === 0 ? pick(INDUSTRIES) : '');
    const base = slugify(company || ('co' + i));
    let domain = `${base || 'company'}${i}.example.com`;
    if (usedDomains.has(domain)) domain = `${base}${i}-${randInt(10,99)}.example.com`;
    usedDomains.add(domain);
    accountRows.push({
      // rely on default cuid id
      name: company.trim() || `Company ${i+1}`,
      domain,
      createdAt: randRecentDate(365),
      // soft-delete fields intentionally omitted (null)
    });
  }
  await prisma.account.createMany({ data: accountRows, skipDuplicates: true });
  const accounts = await prisma.account.findMany({}); // with ids

  // Contacts
  const contactRows = [];
  for (let i = 0; i < NUM_CONTACTS; i++) {
    const first = pick(FIRST), last = pick(LAST);
    const acc = Math.random() < 0.82 ? pick(accounts) : null;
    const emailLocal = slugify(`${first}.${last}`);
    const emailDomain = acc ? (acc.domain || 'example.com') : 'example.com';
    const email = `${emailLocal}${i % 5 === 0 ? randInt(1,99) : ''}@${emailDomain}`;
    contactRows.push({
      firstName: first,
      lastName: last,
      email,
      phone: Math.random() < 0.6 ? randPhone() : null,
      accountId: acc ? acc.id : null,
      createdAt: randRecentDate(300),
    });
  }
  await prisma.contact.createMany({ data: contactRows, skipDuplicates: true });
  const contacts = await prisma.contact.findMany({}); // get ids + accountId

  // Deals
  const dealRows = [];
  for (let i = 0; i < NUM_DEALS; i++) {
    const s = pick(stages);
    const topic = pick(DEAL_TOPICS);
    const acc = Math.random() < 0.85 ? pick(accounts) : null;

    // Prefer a contact from same account; else any contact
    let ct = null;
    if (acc) {
      const pool = contacts.filter(c => c.accountId === acc.id);
      ct = pool.length ? pick(pool) : pick(contacts);
    } else {
      ct = Math.random() < 0.6 ? pick(contacts) : null;
    }

    dealRows.push({
      name: `${topic} - ${acc ? (acc.name.split(' ')[0]) : pick(COMPANIES)} #${1000 + i}`,
      amount: Math.random() < 0.85 ? randMoney(1500, 250000) : null,
      stageId: s.id,
      pipelineId: pipeline.id,
      accountId: acc ? acc.id : null,
      contactId: ct ? ct.id : null,
      createdAt: randRecentDate(240),
    });
  }
  await prisma.deal.createMany({ data: dealRows });

  const deals = await prisma.deal.findMany({ select: { id: true } });

  // Activities
  const actTypes = ['note','call','email','meeting'];
  const activityRows = [];
  for (const d of deals) {
    const k = randInt(0, MAX_ACTS); // per deal
    for (let i = 0; i < k; i++) {
      activityRows.push({
        dealId: d.id,
        type: pick(actTypes),
        body: `Auto-generated ${pick(actTypes)} ${i+1}`,
        createdBy: Math.random() < 0.5 ? pick(['Rep A','Rep B','Rep C','AE','SDR']) : null,
        createdAt: randRecentDate(200),
      });
    }
    // Insert in chunks to avoid payload limits
    if (activityRows.length > 1000) {
      await prisma.activity.createMany({ data: activityRows });
      activityRows.length = 0;
    }
  }
  if (activityRows.length) {
    await prisma.activity.createMany({ data: activityRows });
  }

  // Summary
  const summary = {
    pipelines: await prisma.pipeline.count(),
    stages: await prisma.stage.count(),
    deals: await prisma.deal.count(),
    accounts: await prisma.account.count(),
    contacts: await prisma.contact.count(),
    activities: await prisma.activity.count(),
  };
  console.log('Seed summary:', summary);
  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
