import { PrismaClient } from "@prisma/client";
import { scoreProspect } from "@/lib/prospect-scoring";
import { formatDateTime } from "@/lib/datetime";

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, score: 0 },
    select: {
      id: true,
      name: true,
      status: true,
      score: true,
      budgetMin: true,
      budgetMax: true,
      preferredUnit: true,
      preferredView: true,
      urgency: true,
      notes: true,
    },
    orderBy: [{ createdAt: "asc" }],
  });

  console.log(`Found ${leads.length} leads with score=0.`);

  let updated = 0;
  for (const lead of leads) {
    const [latestCallLog, latestActivity] = await Promise.all([
      prisma.callLog.findFirst({
        where: { leadId: lead.id },
        orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
        select: { summary: true, transcript: true },
      }),
      prisma.activity.findFirst({
        where: { leadId: lead.id },
        orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
        select: { title: true, status: true, dueAt: true },
      }),
    ]);

    const result = scoreProspect(
      {
        name: lead.name,
        status: lead.status,
        budgetMin: lead.budgetMin != null ? Number(lead.budgetMin) : null,
        budgetMax: lead.budgetMax != null ? Number(lead.budgetMax) : null,
        urgency: lead.urgency,
        preferredUnit: lead.preferredUnit,
        preferredView: lead.preferredView,
        notes: lead.notes,
      },
      latestCallLog,
      latestActivity
        ? {
            title: latestActivity.title,
            status: latestActivity.status,
            dueLabel: latestActivity.dueAt ? formatDateTime(latestActivity.dueAt) : null,
          }
        : null,
    );

    const nextScore = result.score;
    if (nextScore <= 0) continue;

    await prisma.lead.update({
      where: { id: lead.id },
      data: { score: nextScore },
    });

    updated += 1;
    console.log(`${lead.id} | ${lead.name}: ${lead.score} -> ${nextScore} (${result.label})`);
  }

  console.log(`Updated ${updated} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

