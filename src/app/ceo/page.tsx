import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatPkrCrore, getLeadBudgetValuePkr } from "@/lib/admin-metrics";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export default async function CeoPage() {
  const session = await getSession();
  if (!session) redirect(`/login?from=${encodeURIComponent("/ceo")}`);
  const isCeo = (session.role ?? "").toLowerCase() === "ceo";
  if (!isCeo) redirect("/");

  if (!hasDatabase()) {
    return (
      <div className="px-5 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">CEO Profile</div>
            <p className="mt-2 text-sm text-medium-grey">
              Database is not configured. Set <span className="font-mono">DATABASE_URL</span> to enable pipeline
              reporting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    select: { status: true, score: true, budgetMin: true, budgetMax: true },
    take: 1000,
  });

  const totalProspects = leads.length;
  const hotProspects = leads.filter((l) => l.score >= 75).length;
  const viewingsBooked = leads.filter((l) => l.status === "viewing_booked").length;
  const pipelineValuePkr = leads.reduce((acc, l) => acc + getLeadBudgetValuePkr({ budgetMin: l.budgetMin, budgetMax: l.budgetMax }), BigInt(0));
  const projectedRevenuePkr = (pipelineValuePkr * BigInt(3)) / BigInt(100);

  const kpis = [
    { title: "Total Prospects", value: String(totalProspects), badge: "Live registry" },
    { title: "Hot Prospects", value: String(hotProspects), badge: "AI-qualified focus" },
    { title: "Pipeline Value", value: formatPkrCrore(pipelineValuePkr), badge: "Overall" },
    { title: "Projected Revenue", value: formatPkrCrore(projectedRevenuePkr), badge: "Projected" },
    { title: "Viewings Booked", value: String(viewingsBooked), badge: "Active" },
  ];

  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">Profile</div>
            <h1 className="mt-2 font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
              CEO Profile
            </h1>
            <p className="mt-2 text-medium-grey max-w-2xl">
              {session.name} · {session.email}
            </p>
          </div>
          <Link
            href="/pipeline"
            className="rounded px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-white bg-[linear-gradient(135deg,#0A1628,#1a2c4e)] hover:shadow-[0_4px_15px_rgba(10,22,40,0.30)] transition-shadow inline-block text-center"
          >
            View overall pipeline
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((k) => (
            <div key={k.title} className="rounded-xl border border-light-grey bg-white shadow-card p-5">
              <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">{k.title}</div>
              <div className="mt-2 text-2xl font-semibold text-navy">{k.value}</div>
              <div className="mt-2 text-xs text-medium-grey">{k.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

