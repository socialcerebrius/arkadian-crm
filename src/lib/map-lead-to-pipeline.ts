import type { PipelineLead, PipelineStage } from "@/components/pipeline/types";

export type ApiLeadListItem = {
  id: string;
  name: string;
  status: string;
  score: number;
  budgetLabel: string;
  preferredUnit?: string;
  preferredView?: string;
  ownerLabel?: string;
  updatedLabel?: string;
};

function daysFromUpdatedLabel(label: string | undefined): number {
  if (!label) return 0;
  if (label === "Today" || label === "Recently") return 0;
  const m = label.match(/(\d+)\s*day/i);
  if (m) return Number(m[1]);
  return 0;
}

function isPipelineStage(s: string): s is PipelineStage {
  return (
    s === "new" ||
    s === "contacted" ||
    s === "viewing_booked" ||
    s === "negotiating" ||
    s === "closed_won" ||
    s === "closed_lost"
  );
}

const UNIT_LABELS: Record<string, string> = {
  two_bed: "2-Bed",
  three_bed: "3-Bed",
  three_bed_large: "3-Bed Large",
  four_bed_duplex: "4-Bed Duplex",
  penthouse: "Penthouse",
};

const VIEW_LABELS: Record<string, string> = {
  sea: "Sea",
  golf: "Golf",
  city: "City",
  dual: "Dual",
};

function formatUnitLabel(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return UNIT_LABELS[v] ?? v.replaceAll("_", " ");
}

function formatViewLabel(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return VIEW_LABELS[v] ?? v;
}

export function mapApiLeadToPipelineLead(raw: ApiLeadListItem): PipelineLead | null {
  if (!isPipelineStage(raw.status)) return null;
  return {
    id: raw.id,
    name: raw.name,
    score: raw.score,
    budgetLabel: raw.budgetLabel,
    unitLabel: formatUnitLabel(raw.preferredUnit),
    viewLabel: formatViewLabel(raw.preferredView),
    daysInStage: daysFromUpdatedLabel(raw.updatedLabel),
    ownerLabel: raw.ownerLabel,
    stage: raw.status,
  };
}
