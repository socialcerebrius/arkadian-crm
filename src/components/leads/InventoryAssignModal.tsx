"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function roleIsAdmin(role: string | null | undefined) {
  return (role ?? "").toLowerCase() === "admin";
}

type InventoryStatus =
  | "interested"
  | "viewing"
  | "deposit_secured"
  | "payment_secured"
  | "sold_assigned"
  | "available";

type InventorySelectMessage = {
  type: "arkadians_inventory_select";
  unit?: {
    id: string;
    tower: string;
    flatNumber: string;
    type: string;
    viewCategory: string;
  };
};

function stripInventoryLines(notes: string) {
  const lines = notes.split(/\r?\n/);
  const kept: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const isInventoryLine =
      /^flat\s+/i.test(line) ||
      /^tower\s+/i.test(line) ||
      /^type:\s*/i.test(line) ||
      /^view:\s*/i.test(line) ||
      /^client stage:\s*/i.test(line) ||
      /^deposit:\s*/i.test(line) ||
      /^instal+ment:\s*/i.test(line) ||
      /^installment:\s*/i.test(line) ||
      /^assigned flat\s+/i.test(line) ||
      /^interest\/viewing logged for flat\s+/i.test(line);

    if (!isInventoryLine) kept.push(raw);
  }

  return kept.join("\n").trim();
}

function buildInventoryBlock(args: {
  status: Exclude<InventoryStatus, "available">;
  flatNumber: string;
  tower: string;
  flatType: string;
  viewCategory: string;
}) {
  const stage =
    args.status === "sold_assigned"
      ? "Sold / Assigned"
      : args.status === "payment_secured"
        ? "Payment secured"
        : args.status === "deposit_secured"
          ? "Deposit secured"
          : args.status === "viewing"
            ? "Viewing"
            : "Interested";
  const deposit = args.status === "deposit_secured" || args.status === "payment_secured" || args.status === "sold_assigned" ? "Deposit secured" : "Pending";
  const instalment = args.status === "payment_secured" || args.status === "sold_assigned" ? "Instalment secured" : "Not started";

  const bits = [
    `Flat ${args.flatNumber}`,
    args.tower ? `Tower ${args.tower}` : null,
    args.flatType ? `Type: ${args.flatType}` : null,
    args.viewCategory ? `View: ${args.viewCategory}` : null,
    `Client stage: ${stage}`,
    `Deposit: ${deposit}`,
    `Instalment: ${instalment}`,
  ].filter(Boolean);

  return bits.join("\n");
}

export function InventoryAssignModal({
  leadId,
  existingNotes,
  sessionRole,
}: {
  leadId: string;
  existingNotes: string | null;
  sessionRole: string | null;
}) {
  const isAdmin = roleIsAdmin(sessionRole);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [unitId, setUnitId] = useState<string | null>(null);
  const [flatNumber, setFlatNumber] = useState("");
  const [tower, setTower] = useState("");
  const [flatType, setFlatType] = useState("");
  const [viewCategory, setViewCategory] = useState("");
  const [status, setStatus] = useState<InventoryStatus>("interested");

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as InventorySelectMessage | null;
      if (!data || typeof data !== "object") return;
      if (data.type !== "arkadians_inventory_select") return;
      if (!data.unit) return;
      if (!isAdmin) return;
      setUnitId(data.unit.id);
      setFlatNumber(data.unit.flatNumber);
      setTower(data.unit.tower);
      setFlatType(data.unit.type);
      setViewCategory(data.unit.viewCategory);

      // When user is scrolled down inside the inventory iframe,
      // make the selected panel visible immediately.
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isAdmin]);

  const canSubmit = useMemo(() => {
    if (status === "available") return true;
    return flatNumber.trim().length > 0;
  }, [status, flatNumber]);

  async function save() {
    if (!canSubmit) return;
    setSaving(true);
    setMsg(null);
    try {
      if (unitId) {
        await fetch("/api/inventory/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            leadId,
            unitId,
            status,
            customerName: null,
          }),
        });
      }

      const base = stripInventoryLines(existingNotes ?? "");
      const next =
        status === "available"
          ? base
          : [
              base,
              buildInventoryBlock({
                status,
                flatNumber: flatNumber.trim(),
                tower: tower.trim(),
                flatType: flatType.trim(),
                viewCategory: viewCategory.trim(),
              }),
            ]
              .filter((x) => x && x.trim().length > 0)
              .join("\n\n")
              .trim();

      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ notes: next }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          json && typeof json === "object" && "error" in json
            ? (json as { error?: { message?: string } }).error?.message
            : null;
        setMsg(message ?? "Could not update inventory assignment.");
        return;
      }

      window.location.reload();
    } catch {
      setMsg("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) return null;

  const hasSelection = Boolean(unitId) && Boolean(flatNumber.trim());

  return (
    <div ref={rootRef} className="rounded-xl border border-light-grey bg-white shadow-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">Inventory assignment</div>
          <div className="mt-2 font-(--font-display) text-lg text-navy">Select a flat from the list</div>
          <p className="mt-2 text-sm text-medium-grey max-w-2xl">
            Use the inventory table below and click <span className="font-semibold">Select</span>. Then assign the correct status here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUnitId(null);
            setFlatNumber("");
            setTower("");
            setFlatType("");
            setViewCategory("");
            setStatus("interested");
            setMsg(null);
          }}
          className="h-10 rounded-lg border border-light-grey bg-white px-4 text-xs font-semibold tracking-[0.15em] uppercase text-navy hover:border-gold hover:bg-cream/40 transition-colors disabled:opacity-50"
          disabled={saving || !hasSelection}
        >
          Clear selection
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-light-grey bg-cream/25 p-4">
          <div className="text-xs tracking-widest uppercase text-medium-grey">Selected flat</div>
          <div className="mt-2 text-sm font-semibold text-navy">
            {hasSelection ? flatNumber : "None selected"}
          </div>
          <div className="mt-1 text-xs text-medium-grey">
            {tower ? `Tower ${tower}` : ""}
            {flatType ? `${tower ? " · " : ""}${flatType}` : ""}
            {viewCategory ? `${tower || flatType ? " · " : ""}${viewCategory}` : ""}
          </div>
        </div>

        <label className="block">
          <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">Status</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InventoryStatus)}
            disabled={saving || !hasSelection}
            className="mt-2 h-11 w-full rounded-lg border border-light-grey bg-white px-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60"
          >
            <option value="interested">Interested</option>
            <option value="viewing">Viewing</option>
            <option value="deposit_secured">Deposit secured</option>
            <option value="payment_secured">Payment / instalment secured</option>
            <option value="sold_assigned">Sold / assigned</option>
            <option value="available">Remove from lead (back to available)</option>
          </select>
        </label>
      </div>

      {msg ? <div className="mt-4 text-sm text-warning">{msg}</div> : null}

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !hasSelection}
          className="h-11 rounded-lg border border-navy/20 bg-navy px-5 text-xs font-semibold tracking-[0.2em] uppercase text-white hover:shadow-[0_4px_15px_rgba(10,22,40,0.22)] transition-shadow disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save status"}
        </button>
      </div>
    </div>
  );
}

