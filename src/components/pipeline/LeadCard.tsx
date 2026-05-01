import Link from "next/link";
import { UserRound } from "lucide-react";
import { PIPELINE_STAGES, scoreBadgeClasses } from "./constants";
import type { PipelineLead } from "./types";
import { formatBudget } from "@/lib/budget";

export function LeadCard({ lead }: { lead: PipelineLead }) {
  const budgetExtra =
    lead.budgetMin != null || lead.budgetMax != null
      ? formatBudget(
          lead.budgetMin != null ? BigInt(lead.budgetMin) : null,
          lead.budgetMax != null ? BigInt(lead.budgetMax) : null,
        )
      : null;
  const contact = [lead.phone, lead.email].filter(Boolean).join(" · ");
  const stageLabel =
    PIPELINE_STAGES.find((s) => s.key === lead.stage)?.label ??
    lead.stage.replaceAll("_", " ");

  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block flex-1 min-w-0 p-5 hover:bg-cream/25 transition-colors"
    >
      <article className="pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium text-navy truncate">{lead.name}</div>
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

        <div className="mt-1 text-xs font-medium text-navy/70">Stage: {stageLabel}</div>

        {contact ? (
          <div className="mt-2 text-xs text-medium-grey wrap-break-word">{contact}</div>
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
    </Link>
  );
}
