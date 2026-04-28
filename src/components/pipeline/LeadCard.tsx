import { UserRound } from "lucide-react";
import type { PipelineLead } from "./types";
import { scoreBadgeClasses } from "./constants";

export function LeadCard({ lead }: { lead: PipelineLead }) {
  return (
    <article className="rounded-lg border border-light-grey/80 bg-white p-5 shadow-[0_2px_15px_rgba(10,22,40,0.02)] hover:shadow-[0_6px_18px_rgba(10,22,40,0.06)] transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-navy truncate">{lead.name}</div>
          <div className="mt-1 text-sm text-medium-grey">{lead.budgetLabel}</div>
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

