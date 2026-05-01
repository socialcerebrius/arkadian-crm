import Link from "next/link";
import { OutboundAiCallButton } from "@/components/leads/OutboundAiCallButton";
import { VapiBrowserTestButton } from "@/components/leads/VapiBrowserTestButton";
import type { DemoLead } from "@/lib/demo-data";
import { getLatestBrowserTestForLead, getLeadCallLogs } from "@/lib/get-lead-call-logs";
import { cleanBrowserTranscriptLines, parseStoredBrowserTranscript } from "@/lib/vapi/parse-web-transcript-message";
import { buildVapiLeadContext } from "@/lib/vapi-lead-context";
import { getRecentActivitiesForLead } from "@/lib/get-lead-activities";
import { getLeadDetailById } from "@/lib/get-lead-detail";

const LEAD_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const [lead, activities, callLogs, latestBrowserTest] = await Promise.all([
    getLeadDetailById(id),
    getRecentActivitiesForLead(id, 12),
    getLeadCallLogs(id),
    getLatestBrowserTestForLead(id),
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

  return (
    <LeadDetailContent
      lead={lead}
      activities={activities}
      callLogs={callLogs}
      latestBrowserTest={latestBrowserTest}
    />
  );
}

function LeadDetailContent({
  lead,
  activities,
  callLogs,
  latestBrowserTest,
}: {
  lead: DemoLead;
  activities: Awaited<ReturnType<typeof getRecentActivitiesForLead>>;
  callLogs: Awaited<ReturnType<typeof getLeadCallLogs>>;
  latestBrowserTest: Awaited<ReturnType<typeof getLatestBrowserTestForLead>>;
}) {
  const created =
    lead.createdAtLabel ?? lead.updatedLabel ?? "—";
  const updated = lead.updatedAtLabel ?? lead.updatedLabel ?? "—";
  const isDbLead = LEAD_UUID_RE.test(lead.id);
  const hasPhone = Boolean(lead.phone?.trim());
  const canOutboundAi = isDbLead && hasPhone;
  const vapiCtx = buildVapiLeadContext({
    id: lead.id,
    name: lead.name,
    budgetMin: lead.budgetMin ?? null,
    budgetMax: lead.budgetMax ?? null,
    preferredUnit: lead.preferredUnit ?? null,
    preferredView: lead.preferredView ?? null,
    urgency: lead.urgency ?? null,
  });
  const ctxBits = [vapiCtx.propertyInterest, vapiCtx.budgetText].filter(Boolean);
  const outboundDisabledReason = !isDbLead
    ? "AI outbound calls are only available for prospects saved in the database."
    : !hasPhone
      ? "Add a phone number to this prospect to place a call."
      : undefined;

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
          <div className="flex flex-col gap-4 shrink-0 w-full sm:w-auto sm:items-end">
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <OutboundAiCallButton
                leadId={lead.id}
                disabled={!canOutboundAi}
                disabledReason={outboundDisabledReason}
              />
              <VapiBrowserTestButton
                lead={lead}
                persistCallLog={isDbLead}
                vapiPublicKey={
                  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.trim() ||
                  process.env.VAPI_PUBLIC_KEY?.trim() ||
                  null
                }
                vapiAssistantId={
                  process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID?.trim() ||
                  process.env.VAPI_ASSISTANT_ID?.trim() ||
                  null
                }
              />
              {ctxBits.length > 0 ? (
                <span className="text-[11px] text-medium-grey">
                  Using CRM context: {ctxBits.join(", ")}
                </span>
              ) : null}
              <Link
                href={`/leads/${lead.id}/edit`}
                className="rounded-lg border border-light-grey bg-white px-4 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase text-navy hover:border-gold hover:bg-cream/40 transition-colors"
              >
                Edit Prospect
              </Link>
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
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-8 min-w-0">
            <section id="profile" className="rounded-xl border border-light-grey bg-white shadow-card p-6">
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

            <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
              <h2 className="font-(--font-display) text-lg text-navy">Call history</h2>
              {callLogs.length === 0 ? (
                <p className="mt-4 text-sm text-medium-grey leading-relaxed">
                  No logged calls yet. Outbound AI calls will appear here after you start them.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {callLogs.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-light-grey bg-cream/20 px-4 py-3 text-sm"
                    >
                      <div className="text-xs text-medium-grey">{c.atLabel}</div>
                      <div className="mt-1 font-medium text-navy">
                        {c.direction.replaceAll("_", " ")} · {c.status}
                      </div>
                      {(c.summary || c.outcome) && (
                        <div className="mt-1 text-xs text-medium-grey leading-relaxed">
                          {c.summary ?? c.outcome}
                        </div>
                      )}
                      {c.vapiCallId ? (
                        <div className="mt-1 text-[11px] font-mono text-medium-grey/80 break-all">
                          Vapi {c.vapiCallId}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {isDbLead && latestBrowserTest ? (
            <section className="rounded-xl border border-light-grey bg-white shadow-card p-6 h-fit">
              <h2 className="font-(--font-display) text-lg text-navy">Latest AI browser test</h2>
              <div className="mt-2 text-xs text-medium-grey space-y-0.5">
                <div>{latestBrowserTest.startedAtLabel}</div>
                {latestBrowserTest.endedAtLabel ? <div>Ended {latestBrowserTest.endedAtLabel}</div> : null}
                <div className="font-medium text-navy">
                  {latestBrowserTest.status.replaceAll("_", " ")}
                  {latestBrowserTest.durationSeconds != null
                    ? ` · ${latestBrowserTest.durationSeconds}s`
                    : ""}
                </div>
              </div>
              {latestBrowserTest.summary ? (
                <p className="mt-3 text-xs text-medium-grey leading-relaxed">{latestBrowserTest.summary}</p>
              ) : null}
              <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-light-grey bg-cream/20 p-3 text-xs text-navy leading-relaxed space-y-2">
                {(() => {
                  const parsed = parseStoredBrowserTranscript(latestBrowserTest.transcript);
                  const lines = parsed ? cleanBrowserTranscriptLines(parsed) : null;
                  if (lines && lines.length > 0) {
                    return lines.map((line, i) => (
                      <p key={`${line.role}-${i}`}>
                        <span className="font-semibold text-medium-grey">
                          {line.role === "assistant" ? "Assistant:" : "Prospect:"}
                        </span>{" "}
                        {line.text}
                      </p>
                    ));
                  }
                  if (latestBrowserTest.transcript?.trim()) {
                    return (
                      <p className="text-medium-grey whitespace-pre-wrap wrap-break-word">
                        {latestBrowserTest.transcript.slice(0, 8000)}
                        {latestBrowserTest.transcript.length > 8000 ? "…" : ""}
                      </p>
                    );
                  }
                  return (
                    <p className="text-medium-grey">
                      No transcript lines were stored yet. Run another browser test or check that the assistant
                      emits client messages.
                    </p>
                  );
                })()}
              </div>
            </section>
          ) : null}

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
