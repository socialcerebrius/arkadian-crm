import type { LatestBrowserTestRow } from "@/lib/get-lead-call-logs";
import type { LeadActivityRow } from "@/lib/get-lead-activities";

type LeadLike = {
  name?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  urgency?: string | null;
  preferredUnit?: string | null;
  preferredView?: string | null;
  notes?: string | null;
};

export type ProspectScoreResult = {
  score: number;
  label: "Hot" | "Warm" | "Cold";
  reasons: string[];
  recommendedAction: string;
};

function includesAny(hay: string, needles: string[]): boolean {
  const t = hay.toLowerCase();
  return needles.some((n) => t.includes(n));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function scoreProspect(
  lead: LeadLike,
  latestCallLog?: Pick<LatestBrowserTestRow, "summary" | "transcript"> | null,
  latestActivity?: Pick<LeadActivityRow, "dueLabel" | "title" | "status"> | null,
): ProspectScoreResult {
  const reasons: string[] = [];
  let score = 0;

  const summary = latestCallLog?.summary ?? "";
  const transcript = latestCallLog?.transcript ?? "";
  const notes = lead.notes ?? "";
  const combinedText = `${summary}\n${transcript}\n${notes}`.toLowerCase();

  const hasBudget = lead.budgetMin != null || lead.budgetMax != null || combinedText.includes("budget:");
  if (hasBudget) {
    score += 20;
    reasons.push("Budget captured");
  }

  const intentSoon =
    (lead.urgency ?? "").toLowerCase() === "high" ||
    (lead.urgency ?? "").toLowerCase() === "immediate" ||
    includesAny(combinedText, ["buying soon", "jaldi lena", "jaldi purchase", "jaldi khareed"]);
  if (intentSoon) {
    score += 20;
    reasons.push("High buying intent");
  }

  const hasProperty = Boolean(lead.preferredUnit?.trim()) || includesAny(combinedText, ["penthouse", "bedroom", "3 bedroom", "2 bedroom"]);
  if (hasProperty) {
    score += 15;
    reasons.push("Property interest captured");
  }

  const hasCallback =
    Boolean(latestActivity?.dueLabel) ||
    includesAny(combinedText, ["callback confirmed", "ai callback confirmed", "callback:", "call kis waqt"]);
  if (hasCallback) {
    score += 15;
    reasons.push("Callback time confirmed");
  }

  const whatsappYes = includesAny(combinedText, ["whatsapp confirmation: yes", "whatsapp: yes", "whatsapp: true"]);
  if (whatsappYes) {
    score += 10;
    reasons.push("WhatsApp confirmation received");
  }

  const minBudget = typeof lead.budgetMin === "number" ? lead.budgetMin : null;
  if (minBudget != null && minBudget >= 50_000_000) {
    score += 10;
    reasons.push("Budget meets premium threshold");
  }

  const hasView = Boolean(lead.preferredView?.trim()) || includesAny(combinedText, ["sea view", "city view", "golf view"]);
  if (hasView) {
    score += 5;
    reasons.push("View preference captured");
  }

  score = clamp(score, 0, 100);

  const label: ProspectScoreResult["label"] = score >= 75 ? "Hot" : score >= 45 ? "Warm" : "Cold";

  const recommendedAction =
    label === "Hot"
      ? "Senior consultant should call at the confirmed callback time."
      : label === "Warm"
        ? "Send WhatsApp confirmation and follow up within 24 hours."
        : "Send project information and nurture.";

  // Keep reasons short (demo-friendly)
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 5);

  return { score, label, reasons: uniqueReasons, recommendedAction };
}

