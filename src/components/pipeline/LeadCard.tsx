import Link from "next/link";
import { UserRound } from "lucide-react";
import type { PipelineLead } from "./types";
import { scoreBadgeClasses } from "./constants";

const CR = 10_000_000;

function budgetDetail(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) => `${(n / CR).toFixed(0)} Cr`;
  if (min != null && max != null) return `PKR ${fmt(min)} – ${fmt(max)}`;
  if (max != null) return `Up to PKR ${fmt(max)}`;
  if (min != null) return `From PKR ${fmt(min)}`;
  return null;
}

export function LeadCard({ lead }: { lead: PipelineLead }) {
  const budgetExtra = budgetDetail(lead.budgetMin, lead.budgetMax);
  const contact = [lead.phone, lead.email].filter(Boolean).join(" · ");

  return (
    <article className="rounded-lg border border-light-grey/80 bg-white p-5 shadow-[0_2px_15px_rgba(10,22,40,0.02)] hover:shadow-[0_6px_18px_rgba(10,22,40,0.06)] transition-shadow cursor-grab active:cursor-grabbing">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium text-navy truncate">
              <Link
                href={`/leads/${lead.id}`}
                className="hover:text-gold transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.name}
              </Link>
            </div>
            <div className="mt-1 text-sm text-medium-grey">{lead.budgetLabel}</div>
            {budgetExtra ? (
              <div className="mt-0.5 text-xs text-medium-grey/90">{budgetExtra}</div>
            ) : null}
          </div>
          <div
            className={[
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              scoreBadgeClasses(lead.score),
            ].join(" ")}
          >
            {lead.score}
          </div>
        </div>

        <div className="mt-2 text-sm text-medium-grey">
          <span className="font-medium text-navy/80">Source:</span> {lead.source}
        </div>

        {contact ? (
          <div className="mt-2 text-xs text-medium-grey break-words">{contact}</div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-medium-grey">
          {lead.unitLabel ? <span>{lead.unitLabel}</span> : null}
          {lead.unitLabel && lead.viewLabel ? (
            <span className="text-medium-grey/40">•</span>
          ) : null}
          {lead.viewLabel ? <span>{lead.viewLabel} view</span> : null}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-medium-grey">
          <div>{lead.daysInStage} days in stage</div>
          <div className="flex items-center gap-1.5">
            <UserRound className="w-4 h-4 text-medium-grey/70" />
            <span className="truncate max-w-[120px]">{lead.ownerLabel ?? "Unassigned"}</span>
          </div>
        </div>
    </article>
  );
}
