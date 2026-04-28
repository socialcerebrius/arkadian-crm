import { prisma } from "@/lib/prisma";
import { getLeadById, type DemoLead } from "@/lib/demo-data";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function budgetLabel(min?: bigint | null, max?: bigint | null) {
  if (!min && !max) return "PKR —";
  const toCr = (n: bigint) => Number(n) / 10_000_000;
  const minCr = min ? toCr(min) : undefined;
  const maxCr = max ? toCr(max) : undefined;
  if (minCr != null && maxCr != null) return `PKR ${minCr.toFixed(0)}–${maxCr.toFixed(0)}Cr`;
  if (maxCr != null) return `Up to PKR ${maxCr.toFixed(0)}Cr`;
  return `From PKR ${minCr?.toFixed(0)}Cr`;
}

/**
 * Load a single lead for the detail page or API. Avoids HTTP self-fetch from
 * Server Components (fixes "Failed to fetch" on localhost / Turbopack on Windows).
 */
export async function getLeadDetailById(id: string): Promise<DemoLead | null> {
  if (!hasDatabase()) {
    return getLeadById(id) ?? null;
  }

  const lead = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
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

  if (!lead) return null;

  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone ?? undefined,
    email: lead.email ?? undefined,
    source: lead.source,
    status: lead.status,
    score: lead.score,
    budgetLabel: budgetLabel(lead.budgetMin, lead.budgetMax),
    preferredUnit: lead.preferredUnit ?? undefined,
    preferredView: lead.preferredView ?? undefined,
    urgency: lead.urgency,
    language: lead.language,
    updatedLabel: "Recently",
  };
}
