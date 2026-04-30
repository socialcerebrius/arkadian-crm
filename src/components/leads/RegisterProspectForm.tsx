"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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

const CR_TO_PKR = 10_000_000;

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
  const [budgetMinCr, setBudgetMinCr] = useState("");
  const [budgetMaxCr, setBudgetMaxCr] = useState("");
  const [preferredUnit, setPreferredUnit] = useState("");
  const [preferredView, setPreferredView] = useState("");
  const [urgency, setUrgency] = useState<UrgencyValue>("medium");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    console.log("SUBMIT CLICKED");
    event.preventDefault();
    event.stopPropagation();

    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedMin = budgetMinCr.trim() === "" ? undefined : Number(budgetMinCr);
    const parsedMax = budgetMaxCr.trim() === "" ? undefined : Number(budgetMaxCr);
    if (parsedMin !== undefined && (Number.isNaN(parsedMin) || parsedMin < 0)) {
      setErrorMsg("Failed to save prospect: Budget min must be a valid crore amount.");
      return;
    }
    if (parsedMax !== undefined && (Number.isNaN(parsedMax) || parsedMax < 0)) {
      setErrorMsg("Failed to save prospect: Budget max must be a valid crore amount.");
      return;
    }

    const urgencyPayload: UrgencyValue = URGENCY_OPTIONS.some((o) => o.value === urgency)
      ? urgency
      : "medium";

    const body: Record<string, unknown> = {
      name: name.trim(),
      source,
      urgency: urgencyPayload,
    };

    const phoneTrim = phone.trim();
    if (phoneTrim) body.phone = phoneTrim;

    const emailTrim = email.trim();
    if (emailTrim) body.email = emailTrim;

    if (parsedMin !== undefined) body.budgetMin = Math.round(parsedMin * CR_TO_PKR);
    if (parsedMax !== undefined) body.budgetMax = Math.round(parsedMax * CR_TO_PKR);

    if (preferredUnit) body.preferredUnit = preferredUnit;
    if (preferredView) body.preferredView = preferredView;

    console.log("Submitting lead", body);
    setSaving(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("POST status", res.status);

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMsg(`Failed to save prospect: ${errorMessageFromJson(json)}`);
        return;
      }

      const parsed = json as CreateLeadResponse;
      const id = parsed?.data?.id;
      if (typeof id !== "string" || id.length === 0) {
        setErrorMsg("Failed to save prospect: Missing id in response.");
        return;
      }

      setSuccessMsg("Prospect saved successfully");
      setTimeout(() => {
        router.push(`/leads/${id}`);
      }, 800);
    } catch (err) {
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

  const fieldClass =
    "mt-2 w-full rounded-lg border border-light-grey bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40";

  const statusBanner =
    saving ? (
      <div className="mb-6 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
        Saving...
      </div>
    ) : successMsg ? (
      <div className="mb-6 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-navy">
        {successMsg}
      </div>
    ) : errorMsg ? (
      <div className="mb-6 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-navy whitespace-pre-line">
        {errorMsg}
      </div>
    ) : null;

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-0">
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
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Source</span>
            <select
              className={fieldClass}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              name="prospectSource"
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
              Budget min (PKR Cr)
            </span>
            <input
              className={fieldClass}
              inputMode="decimal"
              value={budgetMinCr}
              onChange={(e) => setBudgetMinCr(e.target.value)}
              placeholder="e.g. 3"
              name="prospectBudgetMin"
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">
              Budget max (PKR Cr)
            </span>
            <input
              className={fieldClass}
              inputMode="decimal"
              value={budgetMaxCr}
              onChange={(e) => setBudgetMaxCr(e.target.value)}
              placeholder="e.g. 8"
              name="prospectBudgetMax"
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Unit preference</span>
            <select
              className={fieldClass}
              value={preferredUnit}
              onChange={(e) => setPreferredUnit(e.target.value)}
              name="prospectUnit"
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
            >
              {VIEWS.map((v) => (
                <option key={v.value === "" ? "__empty" : v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 [&>button[type=submit]]:rounded-lg [&>button[type=submit]]:px-6 [&>button[type=submit]]:py-3 [&>button[type=submit]]:text-sm [&>button[type=submit]]:font-semibold [&>button[type=submit]]:text-white [&>button[type=submit]]:bg-[linear-gradient(135deg,#C9A84C,#A6862E)] [&>button[type=submit]]:shadow-gold [&>button[type=submit]]:hover:shadow-[0_0_28px_rgba(201,168,76,0.22)] [&>button[type=submit]]:transition-shadow">
          <button type="submit">Save prospect</button>
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
