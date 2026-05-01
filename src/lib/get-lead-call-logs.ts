import { prisma } from "@/lib/prisma";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export type LeadCallLogRow = {
  id: string;
  direction: string;
  status: string;
  outcome: string | null;
  summary: string | null;
  vapiCallId: string | null;
  atLabel: string;
};

export async function getLeadCallLogs(leadId: string): Promise<LeadCallLogRow[]> {
  if (!hasDatabase()) return [];

  const rows = await prisma.callLog.findMany({
    where: { leadId },
    orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
    take: 25,
    select: {
      id: true,
      direction: true,
      status: true,
      outcome: true,
      summary: true,
      vapiCallId: true,
      startedAt: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    direction: r.direction,
    status: r.status,
    outcome: r.outcome,
    summary: r.summary,
    vapiCallId: r.vapiCallId,
    atLabel: (r.startedAt ?? r.createdAt).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  }));
}
