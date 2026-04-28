import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "ahmad@arkadians.local" },
    update: { name: "Ahmad", role: "manager", status: "active" },
    create: {
      name: "Ahmad",
      email: "ahmad@arkadians.local",
      passwordHash: "dev-only",
      role: "manager",
      status: "active",
    },
  });

  const [fatima, hassan, sara, , ahmed] = await Promise.all([
    upsertLead({
      email: "fatima@client.local",
      name: "Fatima Syed",
      score: 92,
      status: "viewing_booked",
      source: "website_form",
      budgetMin: BigInt("30000000"),
      budgetMax: BigInt("55000000"),
      preferredUnit: "three_bed",
      preferredView: "sea",
      urgency: "high",
      ownerId: user.id,
      notes: "Requested payment plan; prefers sea-facing tower.",
    }),
    upsertLead({
      email: "hassan@client.local",
      name: "Hassan Malik",
      score: 71,
      status: "contacted",
      source: "phone",
      budgetMin: BigInt("22000000"),
      budgetMax: BigInt("35000000"),
      preferredUnit: "two_bed",
      preferredView: "city",
      urgency: "medium",
      ownerId: user.id,
      notes: "Price sensitivity; wants clarity on instalments.",
    }),
    upsertLead({
      email: "sara@client.local",
      name: "Sara Khan",
      score: 88,
      status: "negotiating",
      source: "referral",
      budgetMin: BigInt("45000000"),
      budgetMax: BigInt("70000000"),
      preferredUnit: "four_bed_duplex",
      preferredView: "dual",
      urgency: "immediate",
      ownerId: user.id,
      notes: "Decision window this week; prioritise concierge follow-up.",
    }),
    upsertLead({
      email: "omar@client.local",
      name: "Omar Raza",
      score: 64,
      status: "new",
      source: "website_game",
      budgetMin: BigInt("60000000"),
      budgetMax: BigInt("120000000"),
      preferredUnit: "penthouse",
      preferredView: "sea",
      urgency: "medium",
      ownerId: user.id,
      notes: "Game signals penthouse interest; follow up for viewing.",
    }),
    upsertLead({
      email: "ahmed@client.local",
      name: "Ahmed Khan",
      score: 95,
      status: "contacted",
      source: "website_voice",
      budgetMin: BigInt("35000000"),
      budgetMax: BigInt("60000000"),
      preferredUnit: "three_bed_large",
      preferredView: "golf",
      urgency: "high",
      ownerId: user.id,
      notes: "High intent; no contact in 3 days.",
    }),
  ]);

  await prisma.call.createMany({
    data: [
      {
        leadId: fatima.id,
        direction: "outbound",
        durationSeconds: 222,
        sentiment: "positive",
        summary: "Confirmed interest; requested updated payment plan.",
        transcript: "Agent: Hello Fatima, thank you for your time.\nCaller: I’d like the payment plan again.\nAgent: Certainly — I’ll send it immediately.",
      },
      {
        leadId: hassan.id,
        direction: "inbound",
        durationSeconds: 318,
        sentiment: "neutral",
        summary: "Pricing questions; asked about instalment schedule.",
        transcript: "Caller: Can you confirm the instalment schedule?\nAgent: Yes — let me walk you through it.",
      },
      {
        leadId: sara.id,
        direction: "outbound",
        durationSeconds: 175,
        sentiment: "positive",
        summary: "Negotiation progressed; requested a private viewing slot.",
        transcript: "Agent: We can reserve a private viewing.\nCaller: Tomorrow evening would be ideal.\nAgent: Consider it arranged.",
      },
    ],
    skipDuplicates: true,
  });

  const now = new Date();
  await prisma.activity.createMany({
    data: [
      {
        leadId: ahmed.id,
        userId: user.id,
        type: "follow_up",
        title: "Follow up Ahmed Khan",
        notes: "High intent; ensure payment plan + viewing options are ready.",
        dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: "pending",
        priority: "urgent",
      },
      {
        leadId: fatima.id,
        userId: user.id,
        type: "email",
        title: "Send payment plan to Fatima Syed",
        notes: "She asked twice; include updated availability.",
        dueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        status: "in_progress",
        priority: "high",
      },
      {
        leadId: sara.id,
        userId: user.id,
        type: "viewing",
        title: "Private viewing with Sara Khan",
        notes: "Prepare duplex + penthouse comparison deck.",
        dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: "pending",
        priority: "high",
      },
    ],
    skipDuplicates: true,
  });

  return { userId: user.id };
}

async function upsertLead(input: {
  email: string;
  name: string;
  score: number;
  status:
    | "new"
    | "contacted"
    | "viewing_booked"
    | "negotiating"
    | "closed_won"
    | "closed_lost";
  source:
    | "website_voice"
    | "website_form"
    | "website_game"
    | "phone"
    | "referral"
    | "broker"
    | "walk_in"
    | "social_media";
  budgetMin?: bigint;
  budgetMax?: bigint;
  preferredUnit?: "two_bed" | "three_bed" | "three_bed_large" | "four_bed_duplex" | "penthouse";
  preferredView?: "sea" | "golf" | "city" | "dual";
  urgency?: "low" | "medium" | "high" | "immediate";
  ownerId: string;
  notes?: string;
}) {
  const existing = await prisma.lead.findFirst({
    where: { email: input.email, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    return prisma.lead.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        score: input.score,
        status: input.status,
        source: input.source,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        preferredUnit: input.preferredUnit,
        preferredView: input.preferredView,
        urgency: input.urgency ?? "medium",
        ownerId: input.ownerId,
        notes: input.notes,
      },
    });
  }

  return prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      score: input.score,
      status: input.status,
      source: input.source,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      preferredUnit: input.preferredUnit,
      preferredView: input.preferredView,
      urgency: input.urgency ?? "medium",
      ownerId: input.ownerId,
      notes: input.notes,
    },
  });
}

main()
  .then((result) => {
    console.log("Seed complete.", result);
  })
  .catch((err) => {
    console.error("Seed failed.", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

