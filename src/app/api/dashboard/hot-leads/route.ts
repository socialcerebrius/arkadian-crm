import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads } from "@/lib/demo-data";

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
        budgetLabel: budgetLabel(l.budgetMin, l.budgetMax),
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

function budgetLabel(min?: bigint | null, max?: bigint | null) {
  if (!min && !max) return "PKR —";
  const toCr = (n: bigint) => Number(n) / 10_000_000;
  const minCr = min ? toCr(min) : undefined;
  const maxCr = max ? toCr(max) : undefined;
  if (minCr != null && maxCr != null) return `PKR ${minCr.toFixed(0)}–${maxCr.toFixed(0)}Cr`;
  if (maxCr != null) return `Up to PKR ${maxCr.toFixed(0)}Cr`;
  return `From PKR ${minCr?.toFixed(0)}Cr`;
}

