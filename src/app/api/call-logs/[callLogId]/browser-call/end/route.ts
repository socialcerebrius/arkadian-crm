import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ActivityStatus, ActivityType, CallLogDirection, LeadStatus, Priority, UnitType, Urgency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  cleanBrowserTranscriptLines,
  parseStoredBrowserTranscript,
  serializeBrowserTranscript,
  type BrowserTranscriptLine,
} from "@/lib/vapi/parse-web-transcript-message";

const bodySchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["completed", "failed", "ended"]).default("completed"),
  transcript: z.string().max(500_000).optional(),
  summary: z.string().max(20_000).optional().nullable(),
  vapiCallId: z.string().max(200).optional().nullable(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function extractNameFromTranscript(lines: BrowserTranscriptLine[]): string | null {
  const joined = lines.map((l) => l.text).join("\n");
  const patterns: RegExp[] = [
    /\bmera\s+naam\s+([A-Za-z][A-Za-z\s.'-]{1,40})/i,
    /\bmy\s+name\s+is\s+([A-Za-z][A-Za-z\s.'-]{1,40})/i,
    /\bI\s+am\s+([A-Za-z][A-Za-z\s.'-]{1,40})/i,
    /\bnaam\s+([A-Za-z][A-Za-z\s.'-]{1,40})\b/i,
  ];
  for (const re of patterns) {
    const m = joined.match(re);
    if (m?.[1]) {
      const n = normalizeText(m[1]).replace(/[.,!?]+$/g, "");
      if (n.length >= 2 && n.length <= 60) return n;
    }
  }
  return null;
}

type CroreBudget = { min: number; max: number; text: string };

function parseCroreBudget(lines: BrowserTranscriptLine[]): CroreBudget | null {
  const joined = lines.map((l) => l.text).join(" ");
  const t = joined.toLowerCase();
  const croreWord = "(?:crore|crores|cror|karor|cr)";
  const range = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:-|to|–)\\s*(\\d+(?:\\.\\d+)?)\\s*${croreWord}`, "i");
  const single = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${croreWord}`, "i");
  const rm = t.match(range);
  if (rm?.[1] && rm?.[2]) {
    const a = Number(rm[1]);
    const b = Number(rm[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b >= a) {
      return { min: Math.round(a * 10_000_000), max: Math.round(b * 10_000_000), text: `${a}-${b} crore` };
    }
  }
  const sm = t.match(single);
  if (sm?.[1]) {
    const a = Number(sm[1]);
    if (Number.isFinite(a) && a > 0) {
      const v = Math.round(a * 10_000_000);
      return { min: v, max: v, text: `${a} crore` };
    }
  }
  return null;
}

function detectPreferredUnit(lines: BrowserTranscriptLine[]): UnitType | null {
  const t = lines.map((l) => l.text).join(" ").toLowerCase();
  if (t.includes("penthouse")) return UnitType.penthouse;
  if (/\b4\s*(bed|bedroom)\b/.test(t) || t.includes("four bedroom") || t.includes("4 bedroom")) return UnitType.four_bed_duplex;
  if (t.includes("duplex")) return UnitType.four_bed_duplex;
  if (t.includes("three bedroom") || /\b3\s*(bed|bedroom)\b/.test(t) || t.includes("3 bedroom")) {
    if (t.includes("large")) return UnitType.three_bed_large;
    return UnitType.three_bed;
  }
  if (t.includes("two bedroom") || /\b2\s*(bed|bedroom)\b/.test(t) || t.includes("2 bedroom")) return UnitType.two_bed;
  return null;
}

function detectBuyingIntent(lines: BrowserTranscriptLine[]): { intent: string | null; urgency: Urgency | null; status: LeadStatus | null } {
  const t = lines.map((l) => l.text).join(" ").toLowerCase();
  const soonish = ["jaldi", "asap", "immediate", "purchase soon", "buying soon", "this week", "iss haftay", "is haftay"];
  const early = ["dekh", "browse", "browsing", "initial", "soch", "planning", "abhi", "sirf dekh"];
  if (soonish.some((k) => t.includes(k))) {
    return { intent: "buying soon", urgency: Urgency.high, status: LeadStatus.contacted };
  }
  if (early.some((k) => t.includes(k))) {
    return { intent: "browsing", urgency: Urgency.medium, status: null };
  }
  return { intent: null, urgency: null, status: null };
}

function extractCallbackTime(lines: BrowserTranscriptLine[]): string | null {
  const t = lines.map((l) => l.text).join(" ").toLowerCase();
  const patterns: RegExp[] = [
    /\b(tomorrow|today|tonight)\b[^.?!]{0,40}/i,
    /\b(kal|aaj)\b[^.?!]{0,40}/i,
    /\b(morning|evening|afternoon|shaam|subah)\b[^.?!]{0,40}/i,
    /\b(\d{1,2}\s*(?:am|pm))\b/i,
    /\b(\d{1,2}:\d{2})\b/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[0]) {
      const s = normalizeText(m[0]);
      if (s.length >= 3) return s;
    }
  }
  return null;
}

function detectWhatsappConfirmed(lines: BrowserTranscriptLine[]): boolean | null {
  const t = lines.map((l) => l.text).join(" ").toLowerCase();
  if (!t.includes("whatsapp") && !t.includes("what's app") && !t.includes("wa")) return null;
  const yes = ["yes", "haan", "han", "ok", "theek", "send", "kar dein", "kardein", "confirm"];
  const no = ["no", "nahi", "nahin", "mat", "dont", "don't"];
  if (yes.some((k) => t.includes(k))) return true;
  if (no.some((k) => t.includes(k))) return false;
  return null;
}

function isGenericLeadName(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return true;
  return ["prospect", "lead", "unknown", "demo", "test"].some((k) => n === k || n.includes(k));
}

function buildDeterministicSummary(parts: {
  name?: string | null;
  propertyInterest?: string | null;
  budgetText?: string | null;
  intent?: string | null;
  callbackTime?: string | null;
  whatsappConfirmed?: boolean | null;
}): string {
  const name = parts.name?.trim() || "Prospect";
  const property = parts.propertyInterest?.trim() || "a unit";
  const budget = parts.budgetText?.trim() || "not specified";
  const intent = parts.intent?.trim() || "unknown";
  const callback = parts.callbackTime?.trim() || "not specified";
  const wa =
    parts.whatsappConfirmed == null ? "unknown" : parts.whatsappConfirmed ? "yes" : "no";
  return `${name} is interested in ${property}. Budget: ${budget}. Intent: ${intent}. Callback: ${callback}. WhatsApp confirmation: ${wa}.`;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ callLogId: string }> },
) {
  const { callLogId } = await params;

  try {
    if (!hasDatabase()) {
      return NextResponse.json(
        {
          error: {
            code: "DATABASE_NOT_CONFIGURED",
            message: "DATABASE_URL is not configured for write operations.",
          },
        },
        { status: 501 },
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Request body must be JSON." } },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input.",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const existing = await prisma.callLog.findFirst({
      where: {
        id: callLogId,
        leadId: body.leadId,
        direction: CallLogDirection.OUTBOUND,
        status: { startsWith: "browser_test" },
      },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: "CALL_LOG_NOT_FOUND", message: "Call log not found for this lead." } },
        { status: 404 },
      );
    }

    const endedAt = new Date();
    const dbStatus = body.status === "failed" ? "browser_test_failed" : "browser_test_completed";

    const storedLines = body.transcript ? parseStoredBrowserTranscript(body.transcript) : null;
    const cleanedLines = storedLines ? cleanBrowserTranscriptLines(storedLines) : null;
    const cleanedTranscript = cleanedLines ? serializeBrowserTranscript(cleanedLines) : body.transcript;

    const extractedName = cleanedLines ? extractNameFromTranscript(cleanedLines) : null;
    const budget = cleanedLines ? parseCroreBudget(cleanedLines) : null;
    const preferredUnit = cleanedLines ? detectPreferredUnit(cleanedLines) : null;
    const intent = cleanedLines ? detectBuyingIntent(cleanedLines) : { intent: null, urgency: null, status: null };
    const callbackTime = cleanedLines ? extractCallbackTime(cleanedLines) : null;
    const whatsappConfirmed = cleanedLines ? detectWhatsappConfirmed(cleanedLines) : null;

    const propertyInterest = preferredUnit ? preferredUnit.replaceAll("_", " ") : null;
    const budgetText = budget ? budget.text : null;

    const deterministicSummary = buildDeterministicSummary({
      name: extractedName,
      propertyInterest,
      budgetText,
      intent: intent.intent,
      callbackTime,
      whatsappConfirmed,
    });

    const lead = await prisma.lead.findFirst({
      where: { id: body.leadId, deletedAt: null },
      select: { id: true, name: true, notes: true, budgetMin: true, budgetMax: true, preferredUnit: true, urgency: true, status: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.callLog.update({
        where: { id: callLogId },
        data: {
          status: dbStatus,
          endedAt,
          transcript: cleanedTranscript === undefined ? undefined : cleanedTranscript,
          summary: deterministicSummary,
          vapiCallId: body.vapiCallId === undefined ? undefined : body.vapiCallId,
          durationSeconds: body.durationSeconds === undefined ? undefined : body.durationSeconds,
        },
      });

      if (lead) {
        const leadUpdates: Record<string, unknown> = {
          lastCallAt: endedAt,
        };

        if (extractedName && isGenericLeadName(lead.name)) {
          leadUpdates.name = extractedName;
        }

        if (budget) {
          // Only set if not already present, to avoid overwriting real CRM inputs.
          if (lead.budgetMin == null) leadUpdates.budgetMin = BigInt(budget.min);
          if (lead.budgetMax == null) leadUpdates.budgetMax = BigInt(budget.max);
        }

        if (preferredUnit && lead.preferredUnit == null) {
          leadUpdates.preferredUnit = preferredUnit;
        }

        if (intent.urgency) {
          leadUpdates.urgency = intent.urgency;
        }
        if (intent.status) {
          leadUpdates.status = intent.status;
        }

        const noteLine = `AI browser test: ${deterministicSummary}`;
        const existingNotes = lead.notes?.trim();
        leadUpdates.notes = existingNotes ? `${existingNotes}\n${noteLine}` : noteLine;

        await tx.lead.update({
          where: { id: body.leadId },
          data: leadUpdates,
        });

        const activityNotesParts: string[] = [];
        if (propertyInterest) activityNotesParts.push(`Property: ${propertyInterest}`);
        if (budgetText) activityNotesParts.push(`Budget: ${budgetText}`);
        if (intent.intent) activityNotesParts.push(`Intent: ${intent.intent}`);
        if (callbackTime) activityNotesParts.push(`Callback: ${callbackTime}`);
        if (whatsappConfirmed != null) activityNotesParts.push(`WhatsApp: ${whatsappConfirmed ? "yes" : "no"}`);
        const activityNotes = activityNotesParts.join(" · ") || deterministicSummary;

        const activityStatus = callbackTime ? ActivityStatus.pending : ActivityStatus.completed;
        const activityTitle = `Follow up with ${extractedName ?? lead.name}`;

        await tx.activity.create({
          data: {
            leadId: body.leadId,
            type: ActivityType.follow_up,
            status: activityStatus,
            priority: intent.urgency === Urgency.high ? Priority.high : Priority.medium,
            title: activityTitle,
            notes: activityNotes,
            dueAt: null,
            completedAt: activityStatus === ActivityStatus.completed ? endedAt : null,
          },
        });
      }
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "BROWSER_CALL_END_FAILED", message: "Could not update browser call log." } },
      { status: 500 },
    );
  }
}
