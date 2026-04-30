import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SEED_USER_PASSWORD } from "../src/lib/seed-auth";

const prisma = new PrismaClient();

/** Only leads with this email domain are removed and re-created on each seed run (idempotent demo data). */
const SEED_EMAIL_DOMAIN = "seed.arkadians.local";

async function main() {
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10);

  await prisma.lead.deleteMany({
    where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } },
  });

  const user = await prisma.user.upsert({
    where: { email: "ahmad@arkadians.local" },
    update: {
      name: "Ahmad Raza",
      role: "manager",
      status: "active",
      passwordHash,
    },
    create: {
      name: "Ahmad Raza",
      email: "ahmad@arkadians.local",
      passwordHash,
      role: "manager",
      status: "active",
    },
  });

  const salesRep = await prisma.user.upsert({
    where: { email: "sara@arkadians.local" },
    update: {
      name: "Sara Malik",
      role: "sales_rep",
      status: "active",
      passwordHash,
    },
    create: {
      name: "Sara Malik",
      email: "sara@arkadians.local",
      passwordHash,
      role: "sales_rep",
      status: "active",
    },
  });

  const leadInsert = await prisma.lead.createMany({
    data: [
      {
        name: "Zara Ali",
        email: `zara.ali@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 321 400 1001",
        score: 64,
        status: "new",
        source: "referral",
        budgetMin: BigInt(100_000_000),
        budgetMax: BigInt(300_000_000),
        preferredUnit: "two_bed",
        preferredView: "city",
        urgency: "low",
        ownerId: salesRep.id,
        notes: "Referral from existing resident; early stage.",
      },
      {
        name: "Omar Raza",
        email: `omar.raza@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 333 222 1100",
        score: 78,
        status: "contacted",
        source: "website_form",
        budgetMin: BigInt(300_000_000),
        budgetMax: BigInt(500_000_000),
        preferredUnit: "three_bed",
        preferredView: "city",
        urgency: "medium",
        ownerId: user.id,
        notes: "Asked about payment plan and city-facing tiers.",
      },
      {
        name: "Ahmed Khan",
        email: `ahmed.khan@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 300 123 4567",
        score: 95,
        status: "contacted",
        source: "website_voice",
        budgetMin: BigInt(800_000_000),
        budgetMax: BigInt(1_500_000_000),
        preferredUnit: "penthouse",
        preferredView: "sea",
        urgency: "high",
        ownerId: user.id,
        notes: "Penthouse focus; schedule private viewing.",
      },
      {
        name: "Hassan Malik",
        email: `hassan.malik@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 301 555 8899",
        score: 71,
        status: "contacted",
        source: "phone",
        budgetMin: BigInt(220_000_000),
        budgetMax: BigInt(350_000_000),
        preferredUnit: "two_bed",
        preferredView: "city",
        urgency: "medium",
        ownerId: user.id,
        notes: "Price sensitivity; instalment clarity needed.",
      },
      {
        name: "Fatima Syed",
        email: `fatima.syed@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 300 987 6543",
        score: 88,
        status: "viewing_booked",
        source: "website_game",
        budgetMin: BigInt(500_000_000),
        budgetMax: BigInt(800_000_000),
        preferredUnit: "four_bed_duplex",
        preferredView: "dual",
        urgency: "high",
        ownerId: salesRep.id,
        notes: "Sea + dual aspect; payment plan requested twice.",
      },
      {
        name: "Aisha Noor",
        email: `aisha.noor@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 302 777 1122",
        score: 72,
        status: "viewing_booked",
        source: "walk_in",
        budgetMin: BigInt(400_000_000),
        budgetMax: BigInt(600_000_000),
        preferredUnit: "three_bed_large",
        preferredView: "golf",
        urgency: "medium",
        ownerId: salesRep.id,
        notes: "Walk-in; prefers golf course outlook.",
      },
      {
        name: "Sara Khan",
        email: `sara.khan@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 303 888 3344",
        score: 91,
        status: "negotiating",
        source: "referral",
        budgetMin: BigInt(600_000_000),
        budgetMax: BigInt(900_000_000),
        preferredUnit: "four_bed_duplex",
        preferredView: "dual",
        urgency: "immediate",
        ownerId: user.id,
        notes: "Decision window this week; concierge follow-up.",
      },
      {
        name: "Bilal Farooq",
        email: `bilal.farooq@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 304 999 5566",
        score: 84,
        status: "negotiating",
        source: "broker",
        budgetMin: BigInt(550_000_000),
        budgetMax: BigInt(750_000_000),
        preferredUnit: "three_bed",
        preferredView: "sea",
        urgency: "high",
        ownerId: salesRep.id,
        notes: "Broker-introduced; comparing towers.",
      },
      {
        name: "Kamran Siddiqui",
        email: `kamran.siddiqui@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 305 111 7788",
        score: 76,
        status: "closed_won",
        source: "referral",
        budgetMin: BigInt(450_000_000),
        budgetMax: BigInt(500_000_000),
        preferredUnit: "three_bed_large",
        preferredView: "sea",
        urgency: "high",
        ownerId: user.id,
        notes: "Signed; handover scheduled.",
      },
      {
        name: "Nadia Sheikh",
        email: `nadia.sheikh@${SEED_EMAIL_DOMAIN}`,
        phone: "+92 306 222 9900",
        score: 42,
        status: "closed_lost",
        source: "website_form",
        budgetMin: BigInt(80_000_000),
        budgetMax: BigInt(120_000_000),
        preferredUnit: "two_bed",
        preferredView: "city",
        urgency: "low",
        ownerId: salesRep.id,
        notes: "Budget misaligned; may revisit next quarter.",
        lostReason: "Budget",
      },
    ],
  });

  const created = await prisma.lead.findMany({
    where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } },
    select: { id: true, email: true, name: true },
  });

  const byEmail = Object.fromEntries(created.map((l) => [l.email, l])) as Record<
    string,
    { id: string; email: string; name: string }
  >;

  const g = (localPart: string) => byEmail[`${localPart}@${SEED_EMAIL_DOMAIN}`]!;

  await prisma.call.createMany({
    data: [
      {
        leadId: g("fatima.syed").id,
        direction: "outbound",
        durationSeconds: 222,
        sentiment: "positive",
        summary: "Confirmed interest; requested updated payment plan.",
        transcript:
          "Agent: Hello Fatima, thank you for your time.\nCaller: I’d like the payment plan again.\nAgent: Certainly — I’ll send it immediately.",
      },
      {
        leadId: g("hassan.malik").id,
        direction: "inbound",
        durationSeconds: 318,
        sentiment: "neutral",
        summary: "Pricing questions; asked about instalment schedule.",
        transcript:
          "Caller: Can you confirm the instalment schedule?\nAgent: Yes — let me walk you through it.",
      },
      {
        leadId: g("sara.khan").id,
        direction: "outbound",
        durationSeconds: 175,
        sentiment: "positive",
        summary: "Negotiation progressed; requested a private viewing slot.",
        transcript:
          "Agent: We can reserve a private viewing.\nCaller: Tomorrow evening would be ideal.\nAgent: Consider it arranged.",
      },
      {
        leadId: g("ahmed.khan").id,
        direction: "inbound",
        durationSeconds: 402,
        sentiment: "positive",
        summary: "Penthouse options and sea-facing terraces discussed.",
        transcript:
          "Caller: I want the best sea-facing layout.\nAgent: I’ll prepare two penthouse briefs for your review.",
      },
      {
        leadId: g("omar.raza").id,
        direction: "inbound",
        durationSeconds: 241,
        sentiment: "neutral",
        summary: "City view vs sea view trade-offs.",
        transcript:
          "Caller: Is city view significantly quieter?\nAgent: I can share decibel and orientation notes.",
      },
    ],
  });

  const now = new Date();
  await prisma.activity.createMany({
    data: [
      {
        leadId: g("ahmed.khan").id,
        userId: user.id,
        type: "follow_up",
        title: "Follow up Ahmed Khan",
        notes: "High intent; ensure payment plan + viewing options are ready.",
        dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: "pending",
        priority: "urgent",
      },
      {
        leadId: g("fatima.syed").id,
        userId: salesRep.id,
        type: "email",
        title: "Send payment plan to Fatima Syed",
        notes: "She asked twice; include updated availability.",
        dueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        status: "in_progress",
        priority: "high",
      },
      {
        leadId: g("sara.khan").id,
        userId: user.id,
        type: "viewing",
        title: "Private viewing with Sara Khan",
        notes: "Prepare duplex + penthouse comparison deck.",
        dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: "pending",
        priority: "high",
      },
      {
        leadId: g("zara.ali").id,
        userId: salesRep.id,
        type: "task",
        title: "Qualify Zara Ali — referral intro call",
        notes: "Understand timeline and financing.",
        dueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: "pending",
        priority: "medium",
      },
    ],
  });

  console.log("Seed complete.", {
    demoLeadsInserted: leadInsert.count,
    leadsInDb: created.length,
    seedDomain: SEED_EMAIL_DOMAIN,
  });
}

main()
  .catch((err) => {
    console.error("Seed failed.", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
