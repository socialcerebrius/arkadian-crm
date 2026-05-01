"use client";

import type { DemoLead } from "@/lib/demo-data";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

type UiPhase = "idle" | "starting" | "connected" | "ending" | "ended" | "error";

function unitLabel(u: string | undefined) {
  if (!u) return "";
  return u.includes("_") ? u.replaceAll("_", " ") : u;
}

function buildVariableValues(lead: DemoLead): Record<string, string> {
  const preferredParts = [unitLabel(lead.preferredUnit), lead.preferredView ? `${unitLabel(lead.preferredView)} view` : ""]
    .filter(Boolean)
    .join(" · ");
  return {
    leadId: lead.id,
    name: lead.name,
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    budget: lead.budgetLabel,
    budgetMin: lead.budgetMin != null ? String(lead.budgetMin) : "",
    budgetMax: lead.budgetMax != null ? String(lead.budgetMax) : "",
    preferred: preferredParts || "—",
    preferredUnit: lead.preferredUnit ?? "",
    preferredView: lead.preferredView ?? "",
    urgency: lead.urgency ?? "medium",
    language: lead.language ?? "en",
    source: lead.source,
    trigger: "browser_test",
  };
}

function formatSdkError(err: unknown): string {
  if (err == null) return "Unknown error.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error.";
  }
}

export function VapiBrowserTestButton({
  lead,
  /** From server env (e.g. VAPI_PUBLIC_KEY) — publishable key only, never VAPI_PRIVATE_KEY. */
  vapiPublicKey: vapiPublicKeyProp,
  /** From server env (e.g. VAPI_ASSISTANT_ID) — same assistant as outbound. */
  vapiAssistantId: vapiAssistantIdProp,
}: {
  lead: DemoLead;
  vapiPublicKey?: string | null;
  vapiAssistantId?: string | null;
}) {
  const publicKey = useMemo(() => {
    const fromProp = vapiPublicKeyProp?.trim();
    if (fromProp) return fromProp;
    return process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.trim() ?? "";
  }, [vapiPublicKeyProp]);

  const assistantId = useMemo(() => {
    const fromProp = vapiAssistantIdProp?.trim();
    if (fromProp) return fromProp;
    return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID?.trim() ?? "";
  }, [vapiAssistantIdProp]);

  const configured = Boolean(publicKey && assistantId);

  const vapiRef = useRef<Vapi | null>(null);
  const [phase, setPhase] = useState<UiPhase>("idle");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const teardown = useCallback(async () => {
    const v = vapiRef.current;
    vapiRef.current = null;
    if (!v) return;
    try {
      v.removeAllListeners();
    } catch {
      /* ignore */
    }
    try {
      await v.stop();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      void teardown();
    };
  }, [teardown]);

  const onStart = useCallback(async () => {
    if (!configured || phase === "starting" || phase === "connected" || phase === "ending") return;
    setErrorText(null);
    setStatusText("Starting browser test...");
    setPhase("starting");

    await teardown();

    if (!publicKey || !assistantId) {
      setErrorText("Vapi browser test is not configured.");
      setPhase("error");
      setStatusText(null);
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      setPhase("connected");
      setStatusText("Connected");
    };
    const onCallEnd = () => {
      setPhase("ended");
      setStatusText("Ended");
      void teardown();
    };
    const onError = (err: unknown) => {
      setErrorText(formatSdkError(err));
      setPhase("error");
      setStatusText(null);
      void teardown();
    };
    const onStartFailed = (ev: { error?: string }) => {
      setErrorText(ev?.error ?? "Call start failed.");
      setPhase("error");
      setStatusText(null);
      void teardown();
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);
    vapi.on("call-start-failed", onStartFailed);

    try {
      const overrides = { variableValues: buildVariableValues(lead) };
      const call = await vapi.start(assistantId, overrides);
      if (!call) {
        setErrorText("Browser test could not start (no call returned).");
        setPhase("error");
        setStatusText(null);
        await teardown();
      }
    } catch (e) {
      setErrorText(formatSdkError(e));
      setPhase("error");
      setStatusText(null);
      await teardown();
    }
  }, [assistantId, configured, lead, phase, publicKey, teardown]);

  const onStop = useCallback(async () => {
    if (phase !== "connected" && phase !== "starting") return;
    setPhase("ending");
    setStatusText("Ending…");
    await teardown();
    setPhase("ended");
    setStatusText("Ended");
  }, [phase, teardown]);

  const disabledReason = !configured
    ? "Set VAPI_PUBLIC_KEY (publishable) and VAPI_ASSISTANT_ID, or NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID. Never use VAPI_PRIVATE_KEY in the browser."
    : undefined;

  const statusLine =
    phase === "error" && errorText ? (
      <span className="text-sm text-error">{errorText}</span>
    ) : statusText ? (
      <span className="text-sm text-medium-grey">{statusText}</span>
    ) : null;

  return (
    <div className="flex flex-col gap-2 items-start sm:items-end">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onStart()}
          disabled={!configured || phase === "starting" || phase === "connected" || phase === "ending"}
          title={disabledReason}
          className={[
            "rounded-lg border border-light-grey bg-white px-5 py-3 text-sm font-semibold text-navy shadow-card transition-shadow",
            "hover:border-gold hover:bg-cream/40",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          ].join(" ")}
        >
          Test AI Agent in Browser
        </button>
        {(phase === "connected" || phase === "starting" || phase === "ending") && (
          <button
            type="button"
            onClick={() => void onStop()}
            disabled={phase === "ending"}
            className="rounded-lg border border-navy/20 bg-navy px-5 py-3 text-sm font-semibold text-white hover:shadow-[0_4px_15px_rgba(10,22,40,0.22)] transition-shadow disabled:opacity-50"
          >
            End browser test
          </button>
        )}
      </div>
      {statusLine}
    </div>
  );
}
