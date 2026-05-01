"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { parseBudgetInput, formatBudget } from "@/lib/budget";

/** Optional override e.g. http://144.91.117.236:3001/api/leads — defaults to same-origin /api/leads. */
function leadsPostUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LEADS_API_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api/leads`;
  return "/api/leads";
}

const SOURCES: { value: string; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "referral", label: "Referral" },
  { value: "broker", label: "Broker" },
  { value: "website_form", label: "Website form" },
  { value: "website_voice", label: "Website voice" },
  { value: "website_game", label: "Website game" },
  { value: "social_media", label: "Social media" },
];

const UNITS: { value: string; label: string }[] = [
  { value: "", label: "Not specified" },
  { value: "two_bed", label: "2-bedroom suite" },
  { value: "three_bed", label: "3-bedroom suite" },
  { value: "three_bed_large", label: "3-bedroom large" },
  { value: "four_bed_duplex", label: "4-bedroom duplex" },
  { value: "penthouse", label: "Penthouse" },
];

const VIEWS: { value: string; label: string }[] = [
  { value: "", label: "Not specified" },
  { value: "sea", label: "Arabian Sea" },
  { value: "golf", label: "Golf course" },
  { value: "city", label: "City skyline" },
  { value: "dual", label: "Sea & golf" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "immediate", label: "Immediate" },
] as const;

type UrgencyValue = (typeof URGENCY_OPTIONS)[number]["value"];

type CreateLeadResponse = { data?: { id?: string } };

function errorMessageFromJson(json: unknown): string {
  if (!json || typeof json !== "object" || !("error" in json)) {
    return "Could not create prospect.";
  }
  const err = (json as { error?: unknown }).error;
  if (!err || typeof err !== "object") return "Could not create prospect.";
  const e = err as { message?: string; details?: unknown };
  const message = typeof e.message === "string" ? e.message : "Request failed.";
  const details = e.details;
  if (!details || typeof details !== "object") return message;
  const d = details as {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
  const lines: string[] = [message];
  for (const fe of d.formErrors ?? []) {
    if (fe) lines.push(fe);
  }
  for (const [field, msgs] of Object.entries(d.fieldErrors ?? {})) {
    if (msgs?.length) lines.push(`${field}: ${msgs.join(", ")}`);
  }
  return lines.join("\n");
}

export function RegisterProspectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("walk_in");
  const [budgetInput, setBudgetInput] = useState("");
  const [preferredUnit, setPreferredUnit] = useState("");
  const [preferredView, setPreferredView] = useState("");
  const [urgency, setUrgency] = useState<UrgencyValue>("medium");
  const [saving, setSaving] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function guardForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    void handleSave();
  }

  async function handleSave() {
    console.log("SAVE CLICKED");
    console.log("Saving...");

    setSuccessMsg(null);
    setErrorMsg(null);
    setRedirecting(false);

    if (!name.trim()) {
      setErrorMsg("Failed to save prospect: Name is required.");
      return;
    }

    const budgetTrim = budgetInput.trim();
    const parsedBudget = budgetTrim ? parseBudgetInput(budgetTrim) : null;
    if (budgetTrim && (!parsedBudget || (parsedBudget.budgetMin == null && parsedBudget.budgetMax == null))) {
      setErrorMsg("Failed to save prospect: Please enter budget like 3 crore or 10-12 crore.");
      return;
    }

    const urgencyPayload: UrgencyValue = URGENCY_OPTIONS.some((o) => o.value === urgency)
      ? urgency
      : "medium";

    const formData: Record<string, unknown> = {
      name: name.trim(),
      source,
      urgency: urgencyPayload,
    };

    const phoneTrim = phone.trim();
    if (phoneTrim) formData.phone = phoneTrim;

    const emailTrim = email.trim();
    if (emailTrim) formData.email = emailTrim;

    if (parsedBudget?.budgetMin != null) formData.budgetMin = Number(parsedBudget.budgetMin);
    if (parsedBudget?.budgetMax != null) formData.budgetMax = Number(parsedBudget.budgetMax);

    if (preferredUnit) formData.preferredUnit = preferredUnit;
    if (preferredView) formData.preferredView = preferredView;

    const url = leadsPostUrl();
    console.log("Submitting lead", formData, "→", url);
    setSaving(true);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("POST status", res.status);

      const data: unknown = await res.json().catch(() => null);
      console.log("Saved:", data);

      if (!res.ok) {
        setErrorMsg(`Failed to save prospect: ${errorMessageFromJson(data)}`);
        return;
      }

      const parsed = data as CreateLeadResponse;
      const id = parsed?.data?.id;
      if (typeof id !== "string" || id.length === 0) {
        setErrorMsg("Failed to save prospect: Missing id in response.");
        return;
      }

      setSuccessMsg("You’ll be taken to the pipeline in a moment.");
      setRedirecting(true);
      setTimeout(() => {
        router.push("/pipeline");
      }, 1400);
    } catch (err) {
      console.error("Save failed:", err);
      const detail =
        err instanceof TypeError && (err.message === "Failed to fetch" || err.message === "Load failed")
          ? "Could not reach the server."
          : err instanceof Error
            ? err.message
            : "Network error";
      setErrorMsg(`Failed to save prospect: ${detail}`);
    } finally {
      setSaving(false);
    }
  }

  const fieldDisabled = saving || redirecting;
  const fieldClass =
    "mt-2 w-full rounded-lg border border-light-grey bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const statusBanner =
    saving ? (
      <div
        className="mb-6 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy"
        role="status"
        aria-live="polite"
      >
        Saving…
      </div>
    ) : successMsg ? (
      <div
        className="mb-6 rounded-lg border border-success/50 bg-success/10 px-4 py-3 text-sm text-navy shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="font-semibold text-navy">Prospect saved</div>
        <p className="mt-1 text-medium-grey leading-snug">{successMsg}</p>
      </div>
    ) : errorMsg ? (
      <div className="mb-6 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-navy whitespace-pre-line">
        {errorMsg}
      </div>
    ) : null;

  return (
    <div className="max-w-2xl">
      <form onSubmit={guardForm} className="space-y-0" noValidate>
        {statusBanner}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="sm:col-span-2 block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">
              Full name <span className="text-gold">*</span>
            </span>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              name="prospectName"
              disabled={fieldDisabled}
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Phone</span>
            <input
              className={fieldClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              name="prospectPhone"
              disabled={fieldDisabled}
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Email</span>
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              name="prospectEmail"
              disabled={fieldDisabled}
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Source</span>
            <select
              className={fieldClass}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              name="prospectSource"
              disabled={fieldDisabled}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Urgency</span>
            <select
              className={fieldClass}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyValue)}
              name="prospectUrgency"
              disabled={fieldDisabled}
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">
              Budget
            </span>
            <input
              className={fieldClass}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="e.g. 3 crore, 10-12 crore, 80-150 crore"
              name="prospectBudget"
              disabled={fieldDisabled}
            />
            <span className="mt-1 block text-[11px] text-medium-grey/80">
              Saved as:{" "}
              {(() => {
                const t = budgetInput.trim();
                if (!t) return "Not set";
                const p = parseBudgetInput(t);
                if (p.budgetMin == null && p.budgetMax == null) return "—";
                return formatBudget(p.budgetMin, p.budgetMax);
              })()}
            </span>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Unit preference</span>
            <select
              className={fieldClass}
              value={preferredUnit}
              onChange={(e) => setPreferredUnit(e.target.value)}
              name="prospectUnit"
              disabled={fieldDisabled}
            >
              {UNITS.map((u) => (
                <option key={u.value === "" ? "__empty" : u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">View preference</span>
            <select
              className={fieldClass}
              value={preferredView}
              onChange={(e) => setPreferredView(e.target.value)}
              name="prospectView"
              disabled={fieldDisabled}
            >
              {VIEWS.map((v) => (
                <option key={v.value === "" ? "__empty" : v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || redirecting}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-white bg-[linear-gradient(135deg,#C9A84C,#A6862E)] shadow-gold hover:shadow-[0_0_28px_rgba(201,168,76,0.22)] transition-shadow disabled:opacity-50"
          >
            {redirecting ? "Redirecting…" : saving ? "Saving…" : "Save prospect"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <Link
          href="/leads"
          className="text-sm font-medium text-medium-grey hover:text-navy transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
