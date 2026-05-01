import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads } from "@/lib/demo-data";
import { formatBudget } from "@/lib/budget";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    if (!hasDatabase()) {
      const leads = [...demoLeads].sort((a, b) => b.score - a.score).slice(0, 5);
      return NextResponse.json({ data: leads });
    }

    const leads = await prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        source: true,
        status: true,
        score: true,
        budgetMin: true,
        budgetMax: true,
        preferredUnit: true,
        preferredView: true,
        urgency: true,
        language: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: leads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone ?? undefined,
        email: l.email ?? undefined,
        source: l.source,
        status: l.status,
        score: l.score,
        budgetLabel: formatBudget(l.budgetMin, l.budgetMax),
        preferredUnit: l.preferredUnit ?? undefined,
        preferredView: l.preferredView ?? undefined,
        urgency: l.urgency,
        language: l.language,
        updatedLabel: "Recently",
      })),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "HOT_LEADS_FAILED", message: "Unable to load hot leads." } },
      { status: 500 },
    );
  }
}
