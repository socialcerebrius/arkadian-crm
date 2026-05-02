import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function stableIndex(id: string, mod: number) {
  let acc = 0;
  for (let i = 0; i < id.length; i++) acc = (acc + id.charCodeAt(i) * (i + 1)) % 10_000;
  return mod <= 0 ? 0 : acc % mod;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { status: "active", role: { in: ["manager", "sales_rep"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, role: true },
  });

  if (users.length === 0) {
    console.log("No active advisors found.");
    return;
  }

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, ownerId: null },
    orderBy: [{ createdAt: "asc" }],
    select: { id: true, name: true, createdAt: true },
  });

  console.log(`Found ${leads.length} unassigned leads.`);

  let updated = 0;
  for (const lead of leads) {
    const idx = stableIndex(lead.id, users.length);
    const u = users[idx]!;
    await prisma.lead.update({
      where: { id: lead.id },
      data: { ownerId: u.id },
    });
    updated += 1;
    console.log(`${lead.id} | ${lead.name} -> ${u.name}`);
  }

  console.log(`Assigned ${updated} leads across ${users.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

