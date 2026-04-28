"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const URGENCY: { value: string; label: string }[] = [
  { value: "medium", label: "Standard" },
  { value: "low", label: "Exploring" },
  { value: "high", label: "Active" },
  { value: "immediate", label: "Immediate" },
];

const CR_TO_PKR = 10_000_000;

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
  const [urgency, setUrgency] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedMin = budgetMinCr.trim() === "" ? undefined : Number(budgetMinCr);
      const parsedMax = budgetMaxCr.trim() === "" ? undefined : Number(budgetMaxCr);
      if (parsedMin !== undefined && (Number.isNaN(parsedMin) || parsedMin < 0)) {
        setError("Budget min must be a valid crore amount.");
        setLoading(false);
        return;
      }
      if (parsedMax !== undefined && (Number.isNaN(parsedMax) || parsedMax < 0)) {
        setError("Budget max must be a valid crore amount.");
        setLoading(false);
        return;
      }

      const body: Record<string, unknown> = {
        name: name.trim(),
        source,
        urgency,
      };

      const phoneTrim = phone.trim();
      if (phoneTrim) body.phone = phoneTrim;

      const emailTrim = email.trim();
      if (emailTrim) body.email = emailTrim;

      if (parsedMin !== undefined) body.budgetMin = Math.round(parsedMin * CR_TO_PKR);
      if (parsedMax !== undefined) body.budgetMax = Math.round(parsedMax * CR_TO_PKR);

      if (preferredUnit) body.preferredUnit = preferredUnit;
      if (preferredView) body.preferredView = preferredView;

      const apiUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/leads`
          : "/api/leads";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });

      const json: unknown = await res.json().catch(() => null);

      if (res.status === 501) {
        setError(
          "Database is not configured on this deployment (DATABASE_URL). Add Postgres and redeploy to save prospects.",
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json
            ? (json as { error?: { message?: string } }).error?.message
            : null;
        setError(msg ?? "Could not create prospect. Check the form and try again.");
        setLoading(false);
        return;
      }

      const id =
        json && typeof json === "object" && "data" in json
          ? (json as { data?: { id?: string } }).data?.id
          : undefined;
      if (id) router.push(`/leads/${id}`);
      else router.push("/leads");
    } catch (err) {
      const failedFetch =
        err instanceof TypeError &&
        (err.message === "Failed to fetch" || err.message === "Load failed");
      setError(
        failedFetch
          ? "Could not reach the server. Confirm this site uses HTTPS, the deployment finished successfully, DATABASE_URL is set, and try again (some hosts block requests until the DB or region is healthy)."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-light-grey bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl">
      {error ? (
        <div className="mb-6 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-navy">
          {error}
        </div>
      ) : null}

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
          />
        </label>

        <label className="block">
          <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Phone</span>
          <input
            className={fieldClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
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
          />
        </label>

        <label className="block">
          <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Source</span>
          <select
            className={fieldClass}
            value={source}
            onChange={(e) => setSource(e.target.value)}
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
            onChange={(e) => setUrgency(e.target.value)}
          >
            {URGENCY.map((u) => (
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
          />
        </label>

        <label className="block">
          <span className="text-xs tracking-[0.2em] uppercase text-medium-grey">Unit preference</span>
          <select
            className={fieldClass}
            value={preferredUnit}
            onChange={(e) => setPreferredUnit(e.target.value)}
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
          >
            {VIEWS.map((v) => (
              <option key={v.value === "" ? "__empty" : v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white bg-[linear-gradient(135deg,#C9A84C,#A6862E)] shadow-gold hover:shadow-[0_0_28px_rgba(201,168,76,0.22)] transition-shadow disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save prospect"}
        </button>
        <Link
          href="/leads"
          className="text-sm font-medium text-medium-grey hover:text-navy transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
