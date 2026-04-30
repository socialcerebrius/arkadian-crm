import Link from "next/link";
import type { DemoLead } from "@/lib/demo-data";
import { getRecentActivitiesForLead } from "@/lib/get-lead-activities";
import { getLeadDetailById } from "@/lib/get-lead-detail";

function scoreClass(score: number) {
  if (score >= 90) return "bg-success ring-2 ring-gold text-white";
  if (score >= 70) return "bg-gold text-navy";
  if (score >= 40) return "bg-warning text-white";
  return "bg-light-grey text-navy";
}

function unitLabel(u: string | undefined) {
  if (!u) return "—";
  return u.includes("_") ? u.replaceAll("_", " ") : u;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities] = await Promise.all([
    getLeadDetailById(id),
    getRecentActivitiesForLead(id, 12),
  ]);

  if (!lead) {
    return (
      <div className="px-5 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <Link
            href="/pipeline"
            className="text-sm font-medium text-medium-grey hover:text-navy transition-colors"
          >
            ← Back to pipeline
          </Link>
          <div className="mt-6 rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">Prospect not found</div>
            <p className="mt-2 text-medium-grey text-sm">
              This lead does not exist or was removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <LeadDetailContent lead={lead} activities={activities} />;
}

function LeadDetailContent({
  lead,
  activities,
}: {
  lead: DemoLead;
  activities: Awaited<ReturnType<typeof getRecentActivitiesForLead>>;
}) {
  const created =
    lead.createdAtLabel ?? lead.updatedLabel ?? "—";
  const updated = lead.updatedAtLabel ?? lead.updatedLabel ?? "—";

  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-2 text-sm font-medium text-medium-grey hover:text-navy transition-colors"
        >
          <span aria-hidden>←</span> Back to pipeline
        </Link>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">Prospect</div>
            <h1 className="mt-2 font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
              {lead.name}
            </h1>
            <div className="mt-3 text-sm text-medium-grey space-y-1">
              <div>{lead.phone ?? "Phone not set"}</div>
              <div>{lead.email ?? "Email not set"}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span
              className={[
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
                scoreClass(lead.score),
              ].join(" ")}
            >
              Score {lead.score}
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <h2 className="font-(--font-display) text-lg text-navy">Profile</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Status", lead.status.replaceAll("_", " ")],
                ["Source", lead.source.replaceAll("_", " ")],
                ["Budget", lead.budgetLabel],
                ["Urgency", lead.urgency?.replaceAll("_", " ") ?? "medium"],
                ["Preferred unit", unitLabel(lead.preferredUnit)],
                ["Preferred view", lead.preferredView ? `${unitLabel(lead.preferredView)} view` : "—"],
                ["Language", lead.language ?? "en"],
                ["Created", created],
                ["Last updated", updated],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-light-grey bg-cream/30 p-4">
                  <div className="text-xs tracking-widest uppercase text-medium-grey">{k}</div>
                  <div className="mt-2 text-sm font-medium text-navy">{v}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-light-grey bg-white shadow-card p-6 h-fit">
            <h2 className="font-(--font-display) text-lg text-navy">Activity & follow-up</h2>
            {activities.length === 0 ? (
              <div className="mt-5 text-sm text-medium-grey leading-relaxed">
                <p>No activities logged for this lead yet.</p>
                <p className="mt-3 text-xs text-medium-grey/90">
                  Deeper activity tracking and task assignments are coming next.
                </p>
              </div>
            ) : (
              <ul className="mt-5 border-l border-gold pl-4 space-y-4">
                {activities.map((a) => (
                  <li key={a.id} className="relative">
                    <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-gold shadow-gold" />
                    <div className="text-xs uppercase tracking-wider text-medium-grey">
                      {a.type} · {a.status}
                    </div>
                    <div className="mt-1 text-sm font-medium text-navy">{a.title}</div>
                    <div className="mt-1 text-xs text-medium-grey">Logged {a.createdLabel}</div>
                    {a.dueLabel ? (
                      <div className="mt-0.5 text-xs text-medium-grey">Due {a.dueLabel}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
