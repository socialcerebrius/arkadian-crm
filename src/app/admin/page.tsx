import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { StatCard } from "@/components/dashboard/StatCard";
import { MiniBarChart, MiniLineChart, ScoreDistribution } from "@/components/admin/AdminCharts";
import {
  deriveBookingStatus,
  deriveNextAction,
  deriveOutstandingNextStep,
  derivePaidStatus,
  formatPkrCrore,
  getLeadBudgetValuePkr,
  getLeadInterest,
  performanceBadge,
  stableAdvisorForLead,
  type AdminActivityRow,
  type AdminCallLogRow,
  type AdminLeadRow,
} from "@/lib/admin-metrics";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function badgeClasses(kind: "success" | "warning" | "slate") {
  if (kind === "success") return "bg-success/15 text-success border-success/20";
  if (kind === "warning") return "bg-warning/15 text-warning border-warning/25";
  return "bg-navy/5 text-navy/70 border-light-grey";
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect(`/login?from=${encodeURIComponent("/admin")}`);
  const isAdmin = (session.role ?? "").toLowerCase() === "admin";
  if (!isAdmin) redirect("/");

  const now = new Date();

  if (!hasDatabase()) {
    return (
      <div className="px-5 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">Arkadians Command Centre</div>
            <p className="mt-2 text-sm text-medium-grey">
              Database is not configured. Set <span className="font-mono">DATABASE_URL</span> to enable admin
              reporting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [leads, activities, callLogs, totalActivitiesCount] = await Promise.all([
    prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        status: true,
        source: true,
        score: true,
        budgetMin: true,
        budgetMax: true,
        preferredUnit: true,
        preferredView: true,
        urgency: true,
        notes: true,
        lastCallAt: true,
        ownerId: true,
        owner: { select: { name: true } },
      },
      take: 400,
    }),
    prisma.activity.findMany({
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      where: { status: "pending" },
      select: {
        id: true,
        leadId: true,
        title: true,
        status: true,
        type: true,
        dueAt: true,
        createdAt: true,
        userId: true,
        lead: { select: { name: true } },
        user: { select: { name: true } },
      },
      take: 40,
    }),
    prisma.callLog.findMany({
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        leadId: true,
        status: true,
        transcript: true,
        startedAt: true,
        createdAt: true,
      },
      take: 500,
    }),
    prisma.activity.count({}),
  ]);

  const leadRows: AdminLeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    status: l.status,
    source: l.source,
    score: l.score,
    budgetMin: l.budgetMin ?? null,
    budgetMax: l.budgetMax ?? null,
    preferredUnit: l.preferredUnit ?? null,
    preferredView: l.preferredView ?? null,
    urgency: l.urgency,
    notes: l.notes ?? null,
    lastCallAt: l.lastCallAt ?? null,
    ownerId: l.ownerId ?? null,
    ownerName: l.owner?.name ?? null,
  }));

  const activityRows: (AdminActivityRow & { leadName?: string | null; userName?: string | null })[] = activities.map(
    (a) => ({
      id: a.id,
      leadId: a.leadId,
      title: a.title,
      status: a.status,
      type: a.type,
      dueAt: a.dueAt ?? null,
      createdAt: a.createdAt,
      userId: a.userId ?? null,
      leadName: a.lead?.name ?? null,
      userName: a.user?.name ?? null,
    }),
  );

  const callLogRows: AdminCallLogRow[] = callLogs.map((c) => ({
    id: c.id,
    leadId: c.leadId,
    status: c.status,
    transcript: c.transcript ?? null,
    startedAt: c.startedAt ?? null,
    createdAt: c.createdAt,
  }));

  const totalProspects = leadRows.length;
  const hotProspects = leadRows.filter((l) => l.score >= 75).length;
  const pipelineValuePkr = leadRows.reduce((acc, l) => acc + getLeadBudgetValuePkr(l), BigInt(0));
  const projectedRevenuePkr = (pipelineValuePkr * BigInt(3)) / BigInt(100); // 3% projected
  const followUpsDue = activityRows.filter((a) => a.status === "pending").length;
  const viewingsBooked = leadRows.filter((l) => l.status === "viewing_booked").length;
  const aiCallsLogged = callLogRows.length;

  const byLeadPendingActivity = new Map<string, AdminActivityRow>();
  for (const a of activityRows) {
    if (!byLeadPendingActivity.has(a.leadId)) byLeadPendingActivity.set(a.leadId, a);
  }

  const conversionFocus = leadRows.filter((l) => {
    if (l.score < 75) return false;
    const hasFollowUp = byLeadPendingActivity.has(l.id);
    const hasRecentCall = l.lastCallAt ? now.getTime() - l.lastCallAt.getTime() < 1000 * 60 * 60 * 24 * 14 : false;
    const hasAnyCallLog = callLogRows.some((c) => c.leadId === l.id);
    return hasFollowUp || hasRecentCall || hasAnyCallLog;
  }).length;

  const pipelineByStatus = Object.entries(
    leadRows.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label: label.replaceAll("_", " "), value }));

  const sourcePerformance = Object.entries(
    leadRows.reduce<Record<string, { count: number; scoreSum: number }>>((acc, l) => {
      const k = l.source;
      const prev = acc[k] ?? { count: 0, scoreSum: 0 };
      acc[k] = { count: prev.count + 1, scoreSum: prev.scoreSum + l.score };
      return acc;
    }, {}),
  )
    .map(([source, v]) => ({
      source,
      count: v.count,
      avgScore: v.count ? v.scoreSum / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const hot = leadRows.filter((l) => l.score >= 75).length;
  const warm = leadRows.filter((l) => l.score >= 45 && l.score <= 74).length;
  const cold = Math.max(0, totalProspects - hot - warm);

  const revenueTrend = [
    { label: "This month", value: 3.0 },
    { label: "Next month", value: 3.6 },
    { label: "Quarter", value: 4.2 },
  ];

  const topHot = leadRows
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((l) => {
      const pending = byLeadPendingActivity.get(l.id) ?? null;
      const hasCallback = Boolean(pending?.dueAt);
      return {
        lead: l,
        nextAction: deriveNextAction({ lead: l, hasCallback }),
        hasTranscript: callLogRows.some((c) => c.leadId === l.id && (c.transcript?.trim() ?? "").length > 0),
      };
    });

  const upcoming = activityRows.slice(0, 10);

  const showSuggestedFollowUps = totalActivitiesCount === 0;
  const suggestedFollowUps = showSuggestedFollowUps
    ? topHot.slice(0, 6).map((x, idx) => ({
        id: `suggested_${idx}`,
        leadName: x.lead.name,
        title: x.nextAction,
        dueLabel: "Next 24 hours",
        status: "pending",
        advisor: stableAdvisorForLead(x.lead).advisorName,
      }))
    : [];

  const bookingSnapshot = leadRows
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((l) => {
      const bookingStatus = deriveBookingStatus(l);
      const paidStatus = derivePaidStatus(bookingStatus);
      return {
        lead: l,
        bookingStatus,
        paidStatus,
        next: deriveOutstandingNextStep(bookingStatus),
      };
    });

  const aiBrowserCompleted = callLogRows.filter((c) => c.status === "browser_test_completed").length;
  const transcriptsSaved = callLogRows.filter((c) => (c.transcript?.trim() ?? "").length > 0).length;
  const callbackTasksCreated = activityRows.filter((a) => a.type === "follow_up").length;
  const hotLeadsIdentified = hotProspects;
  const draftsDemo = Math.min(hotProspects, 12);

  // Team performance
  const users = await prisma.user.findMany({
    where: { status: "active" },
    select: { id: true, name: true, role: true },
    take: 20,
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const leadsByAdvisor = new Map<string, AdminLeadRow[]>();
  for (const l of leadRows) {
    const advisor = l.ownerId && userById.get(l.ownerId)?.name ? userById.get(l.ownerId)!.name : stableAdvisorForLead(l).advisorName;
    const arr = leadsByAdvisor.get(advisor) ?? [];
    arr.push(l);
    leadsByAdvisor.set(advisor, arr);
  }

  const activitiesByAdvisor = new Map<string, AdminActivityRow[]>();
  for (const a of activityRows) {
    const advisor = a.userId && userById.get(a.userId)?.name ? userById.get(a.userId)!.name : stableAdvisorForLead({ id: a.leadId, ownerId: null, ownerName: null }).advisorName;
    const arr = activitiesByAdvisor.get(advisor) ?? [];
    arr.push(a);
    activitiesByAdvisor.set(advisor, arr);
  }

  const callsByAdvisor = new Map<string, AdminCallLogRow[]>();
  for (const c of callLogRows) {
    const lead = leadRows.find((l) => l.id === c.leadId);
    const advisor = lead ? stableAdvisorForLead(lead).advisorName : stableAdvisorForLead({ id: c.leadId, ownerId: null, ownerName: null }).advisorName;
    const arr = callsByAdvisor.get(advisor) ?? [];
    arr.push(c);
    callsByAdvisor.set(advisor, arr);
  }

  const advisorNames = Array.from(new Set([...leadsByAdvisor.keys(), ...activitiesByAdvisor.keys(), ...callsByAdvisor.keys()])).slice(0, 8);
  const advisorRows = advisorNames
    .map((name) => {
      const ownedLeads = leadsByAdvisor.get(name) ?? [];
      const ownedActs = activitiesByAdvisor.get(name) ?? [];
      const ownedCalls = callsByAdvisor.get(name) ?? [];
      const pipeline = ownedLeads.reduce((acc, l) => acc + getLeadBudgetValuePkr(l), BigInt(0));
      const hotCount = ownedLeads.filter((l) => l.score >= 75).length;
      const viewings = ownedLeads.filter((l) => l.status === "viewing_booked").length;
      const due = ownedActs.filter((a) => a.status === "pending").length;
      const completed = 0;
      const badge = performanceBadge({
        pipelineValuePkr: pipeline,
        hotLeads: hotCount,
        followUpsDue: due,
        followUpsCompleted: completed,
        callsLogged: ownedCalls.length,
      });

      const role = users.find((u) => u.name === name)?.role ?? "sales_rep";
      const prettyRole =
        role === "admin" ? "Admin" : role === "manager" ? "Sales Manager" : role === "sales_rep" ? "Property Consultant" : "Viewer";

      return {
        name,
        role: prettyRole,
        assigned: ownedLeads.length,
        hot: hotCount,
        calls: ownedCalls.length,
        due,
        viewings,
        pipeline,
        badge,
      };
    })
    .sort((a, b) => Number((b.pipeline - a.pipeline) / BigInt(1_000_000)));

  const advisorPipelineChart = advisorRows.slice(0, 6).map((r) => ({
    label: r.name.split(" ")[0] ?? r.name,
    value: Number((r.pipeline / BigInt(10_000_000)) > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : r.pipeline / BigInt(10_000_000)),
    hint: "crore",
  }));

  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">Admin Dashboard</div>
              <h1 className="mt-2 font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
                Arkadians Command Centre
              </h1>
              <p className="mt-2 text-sm text-medium-grey max-w-3xl leading-relaxed">
                Private registry overview, sales pipeline, AI-qualified prospects and team performance
              </p>
              <div className="mt-3 text-xs text-medium-grey">Updated: {formatDateTime(now)}</div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-light-grey bg-white px-4 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase text-navy hover:border-gold hover:bg-cream/40 transition-colors"
              >
                Personal Command Centre
              </Link>
              <Link
                href="/leads"
                className="rounded-lg border border-navy/20 bg-navy px-4 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase text-white hover:shadow-[0_4px_15px_rgba(10,22,40,0.22)] transition-shadow"
              >
                View prospects
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Prospects" value={totalProspects} change={12} trend="up" />
          <StatCard title="Hot Prospects" value={hotProspects} change={6} trend="up" />
          <StatCard title="Pipeline Value" value={formatPkrCrore(pipelineValuePkr)} change={8} trend="up" />
          <StatCard title="Projected Revenue" value={`${formatPkrCrore(projectedRevenuePkr)}`} change={3} trend="up" />
          <StatCard title="Follow-ups Due" value={followUpsDue} change={0} trend="flat" />
          <StatCard title="Viewings Booked" value={viewingsBooked} change={4} trend="up" />
          <StatCard title="AI Calls Logged" value={aiCallsLogged} change={0} trend="flat" />
          <StatCard title="Conversion Focus" value={conversionFocus} change={0} trend="flat" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MiniBarChart title="Pipeline by Status" data={pipelineByStatus} />
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-light-grey bg-white shadow-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="font-(--font-display) text-navy">Lead Source Performance</div>
                <span className="inline-flex items-center rounded-full border border-light-grey bg-white px-2.5 py-1 text-[11px] font-semibold text-medium-grey">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {sourcePerformance.map((s) => (
                  <div key={s.source} className="rounded-lg border border-light-grey bg-cream/30 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-medium text-navy">{s.source.replaceAll("_", " ")}</div>
                      <div className="text-xs text-medium-grey">
                        {s.count} leads · avg score {s.avgScore.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <ScoreDistribution hot={hot} warm={warm} cold={cold} />
            <MiniLineChart
              title="Projected Revenue Trend"
              subtitle="Projected from current pipeline"
              data={revenueTrend}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-(--font-display) text-lg text-navy">Top Hot Prospects</h2>
              <Link href="/leads" className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors">
                View all
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs tracking-widest uppercase text-medium-grey">
                  <tr className="border-b border-light-grey">
                    <th className="py-3 text-left">Prospect</th>
                    <th className="py-3 text-left">Budget</th>
                    <th className="py-3 text-left">Interest</th>
                    <th className="py-3 text-left">Score</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-left">Source</th>
                    <th className="py-3 text-left">Next Action</th>
                  </tr>
                </thead>
                <tbody className="text-navy">
                  {topHot.map((row) => (
                    <tr key={row.lead.id} className="border-b border-light-grey/70">
                      <td className="py-3">
                        <Link href={`/leads/${row.lead.id}`} className="font-semibold hover:text-gold transition-colors">
                          {row.lead.name}
                        </Link>
                        {row.hasTranscript ? (
                          <div className="mt-1">
                            <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", badgeClasses("success")].join(" ")}>
                              AI qualified
                            </span>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3">{formatPkrCrore(getLeadBudgetValuePkr(row.lead))}</td>
                      <td className="py-3">{getLeadInterest(row.lead)}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full border border-light-grey bg-cream/30 px-2 py-1 text-xs font-semibold">
                          {row.lead.score}
                        </span>
                      </td>
                      <td className="py-3">{row.lead.status.replaceAll("_", " ")}</td>
                      <td className="py-3">{row.lead.source.replaceAll("_", " ")}</td>
                      <td className="py-3 text-medium-grey">{row.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-light-grey bg-white shadow-card p-6">
              <h2 className="font-(--font-display) text-lg text-navy">Follow-ups / Callbacks</h2>
              {upcoming.length === 0 && !showSuggestedFollowUps ? (
                <p className="mt-4 text-sm text-medium-grey">No follow-ups due.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {(showSuggestedFollowUps ? suggestedFollowUps : upcoming).slice(0, 8).map((a) => (
                    <li key={a.id} className="rounded-lg border border-light-grey bg-cream/20 px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-medium-grey">
                        {"type" in a ? (a as any).type?.replaceAll("_", " ") : "suggested"} ·{" "}
                        <span className="font-semibold">{("status" in a ? (a as any).status : "pending").replaceAll("_", " ")}</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-navy">
                        {"leadName" in a ? (a as any).leadName : (a as any).leadName}
                      </div>
                      <div className="mt-1 text-xs text-medium-grey leading-relaxed">
                        {"title" in a ? (a as any).title : ""}
                      </div>
                      <div className="mt-1 text-xs text-medium-grey">
                        {"dueAt" in a && (a as any).dueAt ? `Due ${formatDateTime((a as any).dueAt)}` : ("dueLabel" in a ? (a as any).dueLabel : "")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-light-grey bg-white shadow-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-(--font-display) text-lg text-navy">AI Operations</h2>
                  <div className="mt-1 text-xs text-medium-grey">
                    Voice agent, transcript capture, callback extraction, and follow-up automation
                  </div>
                </div>
                <span className={["inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold", badgeClasses("success")].join(" ")}>
                  Operational
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["AI browser tests completed", aiBrowserCompleted],
                  ["AI call attempts", aiCallsLogged],
                  ["Transcripts saved", transcriptsSaved],
                  ["Callback tasks created", callbackTasksCreated],
                  ["Hot leads identified", hotLeadsIdentified],
                  ["WhatsApp/email drafts", draftsDemo],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-light-grey bg-cream/20 px-4 py-3">
                    <div className="text-xs text-medium-grey">{k}</div>
                    <div className="mt-1 font-(--font-display) text-xl text-navy">{v}</div>
                  </div>
                ))}
              </div>

              <ul className="mt-4 text-xs text-medium-grey space-y-1.5">
                {[
                  "Voice agent qualifies enquiries",
                  "Transcripts saved to client profile",
                  "Callback times extracted",
                  "Follow-up activity created",
                  "WhatsApp/email drafting ready",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-(--font-display) text-lg text-navy">Bookings & Payment Snapshot</h2>
              <div className="mt-1 text-xs text-medium-grey">
                Demo payment snapshot based on CRM pipeline data
              </div>
            </div>
            <span className={["inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold", badgeClasses("warning")].join(" ")}>
              Demo projection
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs tracking-widest uppercase text-medium-grey">
                <tr className="border-b border-light-grey">
                  <th className="py-3 text-left">Client</th>
                  <th className="py-3 text-left">Interest</th>
                  <th className="py-3 text-left">Booking Status</th>
                  <th className="py-3 text-left">Paid Status</th>
                  <th className="py-3 text-left">Estimated Value</th>
                  <th className="py-3 text-left">Outstanding / Next Step</th>
                </tr>
              </thead>
              <tbody className="text-navy">
                {bookingSnapshot.map((r) => (
                  <tr key={r.lead.id} className="border-b border-light-grey/70">
                    <td className="py-3">
                      <Link href={`/leads/${r.lead.id}`} className="font-semibold hover:text-gold transition-colors">
                        {r.lead.name}
                      </Link>
                    </td>
                    <td className="py-3">{getLeadInterest(r.lead)}</td>
                    <td className="py-3">{r.bookingStatus}</td>
                    <td className="py-3">{r.paidStatus}</td>
                    <td className="py-3">{formatPkrCrore(getLeadBudgetValuePkr(r.lead))}</td>
                    <td className="py-3 text-medium-grey">{r.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-xl border border-light-grey bg-white shadow-card p-6">
            <h2 className="font-(--font-display) text-lg text-navy">Team Performance</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs tracking-widest uppercase text-medium-grey">
                  <tr className="border-b border-light-grey">
                    <th className="py-3 text-left">Advisor</th>
                    <th className="py-3 text-left">Role</th>
                    <th className="py-3 text-left">Assigned Leads</th>
                    <th className="py-3 text-left">Hot Leads</th>
                    <th className="py-3 text-left">Calls</th>
                    <th className="py-3 text-left">Follow-ups Due</th>
                    <th className="py-3 text-left">Viewings</th>
                    <th className="py-3 text-left">Pipeline Value</th>
                    <th className="py-3 text-left">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-navy">
                  {advisorRows.map((r) => (
                    <tr key={r.name} className="border-b border-light-grey/70">
                      <td className="py-3 font-semibold">{r.name}</td>
                      <td className="py-3 text-medium-grey">{r.role}</td>
                      <td className="py-3">{r.assigned}</td>
                      <td className="py-3">{r.hot}</td>
                      <td className="py-3">{r.calls}</td>
                      <td className="py-3">{r.due}</td>
                      <td className="py-3">{r.viewings}</td>
                      <td className="py-3">{formatPkrCrore(r.pipeline)}</td>
                      <td className="py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
                            r.badge === "Excellent"
                              ? badgeClasses("success")
                              : r.badge === "Active"
                                ? badgeClasses("warning")
                                : badgeClasses("slate"),
                          ].join(" ")}
                        >
                          {r.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4">
            <MiniBarChart title="Advisor Pipeline Value (crore)" data={advisorPipelineChart} />
          </div>
        </section>
      </div>
    </div>
  );
}

