import type { DemoLead } from "@/lib/demo-data";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`/api/leads/${id}`, { cache: "no-store" });
  const json: unknown = res.ok ? await res.json() : null;
  const data =
    json && typeof json === "object" && "data" in json
      ? (json as { data?: unknown }).data
      : null;
  const lead: DemoLead | null = isDemoLead(data) ? data : null;

  if (!lead) {
    return (
      <div className="px-5 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">
              Prospect not found
            </div>
            <p className="mt-2 text-medium-grey text-sm">
              This demo record does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">
              Prospect Profile
            </div>
            <h1 className="mt-2 font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
              {lead.name}
            </h1>
            <div className="mt-2 text-sm text-medium-grey">
              {(lead.phone ?? "Phone pending") +
                " • " +
                (lead.email ?? "Email pending")}
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg px-5 py-3 text-sm font-semibold text-white bg-[linear-gradient(135deg,#C9A84C,#A6862E)] shadow-gold hover:shadow-[0_0_28px_rgba(201,168,76,0.22)] transition-shadow"
          >
            Edit Prospect
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr] gap-6">
          <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">
              Lead Profile
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["Source", lead.source.replaceAll("_", " ")],
                ["Status", lead.status.replaceAll("_", " ")],
                ["Budget", lead.budgetLabel],
                [
                  "Preferred",
                  `${lead.preferredUnit ?? "TBD"} • ${lead.preferredView ?? "TBD"} view`,
                ],
                ["Urgency", lead.urgency?.replaceAll("_", " ") ?? "medium"],
                ["Language", lead.language ?? "EN"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-light-grey bg-cream/30 p-4">
                  <div className="text-xs tracking-widest uppercase text-medium-grey">
                    {k}
                  </div>
                  <div className="mt-2 text-sm font-medium text-navy">{v}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-light-grey bg-white shadow-card p-6">
            <div className="font-(--font-display) text-lg text-navy">
              Activity Timeline
            </div>
            <div className="mt-5 border-l border-gold pl-5 space-y-5">
              {[
                ["Private Viewing", "Scheduled for Thursday 4:00 PM"],
                ["Call", "Asked about payment plan and sea-facing options"],
                ["AI Summary", "High intent detected; recommend direct outreach"],
              ].map(([title, note]) => (
                <div key={title} className="relative">
                  <div className="absolute left-[-29px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold shadow-gold" />
                  <div className="text-sm font-medium text-navy">{title}</div>
                  <div className="mt-1 text-sm text-medium-grey">{note}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gold/30 bg-white shadow-card p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
            <div className="font-(--font-display) text-lg text-navy">
              AI Panel
            </div>
            <div className="mt-5 space-y-4 relative z-10">
              <div className="rounded-lg border border-light-grey bg-cream/30 p-4">
                <div className="text-xs tracking-widest uppercase text-medium-grey">
                  Summary
                </div>
                <div className="mt-2 text-sm text-medium-grey leading-relaxed">
                  PROFILE: Ultra-luxury buyer focused on sea-facing residences.
                  INTEREST: Hot. NEXT ACTION: Offer a private viewing within 72
                  hours.
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded-lg border border-gold/40 px-4 py-3 text-sm font-semibold tracking-wide text-navy hover:bg-gold/10 transition-colors"
              >
                Regenerate Summary
              </button>
              <div className="rounded-lg border border-light-grey bg-white p-4">
                <div className="text-xs tracking-widest uppercase text-medium-grey">
                  Follow-up Draft (WhatsApp)
                </div>
                <textarea
                  className="mt-2 w-full min-h-[140px] rounded-lg border border-light-grey p-3 text-sm text-navy bg-cream/20 focus:outline-none focus:ring-2 focus:ring-gold/40"
                  defaultValue={
                    "Ahmed, thank you again for your time. Based on your preference for a sea-facing penthouse at The Arkadians, I can arrange a discreet private viewing this week. Would Thursday afternoon suit you?"
                  }
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[linear-gradient(135deg,#C9A84C,#A6862E)] shadow-gold hover:shadow-[0_0_28px_rgba(201,168,76,0.22)] transition-shadow"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-gold/40 px-4 py-2 text-sm font-semibold text-navy hover:bg-gold/10 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function isDemoLead(value: unknown): value is DemoLead {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.source === "string" &&
    typeof v.status === "string" &&
    typeof v.score === "number" &&
    typeof v.budgetLabel === "string" &&
    typeof v.updatedLabel === "string"
  );
}

