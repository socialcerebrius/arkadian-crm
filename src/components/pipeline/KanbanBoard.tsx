"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  type DropResult,
} from "@hello-pangea/dnd";
import { PIPELINE_STAGES } from "./constants";
import type { PipelineLead, PipelineStage } from "./types";
import { KanbanColumn } from "./KanbanColumn";
import {
  mapApiLeadToPipelineLead,
  type ApiLeadListItem,
} from "@/lib/map-lead-to-pipeline";

function groupByStage(leads: PipelineLead[]) {
  const map: Record<PipelineStage, PipelineLead[]> = {
    new: [],
    contacted: [],
    viewing_booked: [],
    negotiating: [],
    closed_won: [],
    closed_lost: [],
  };

  for (const lead of leads) map[lead.stage].push(lead);
  return map;
}

/** Rebuild flat list from column groups after a drag (cross-column or reorder). */
function rebuildLeadsAfterDrag(leads: PipelineLead[], result: DropResult): PipelineLead[] | null {
  const { destination, source, draggableId } = result;
  if (!destination) return null;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return null;
  }

  const fromStage = source.droppableId as PipelineStage;
  const toStage = destination.droppableId as PipelineStage;

  const grouped = groupByStage(leads);
  const fromList = [...grouped[fromStage]];
  const fromIdx = fromList.findIndex((l) => l.id === draggableId);
  if (fromIdx < 0) return null;
  const [moved] = fromList.splice(fromIdx, 1);
  if (!moved) return null;

  if (fromStage === toStage) {
    fromList.splice(destination.index, 0, moved);
    grouped[fromStage] = fromList;
  } else {
    grouped[fromStage] = fromList;
    const toList = [...grouped[toStage]];
    toList.splice(destination.index, 0, { ...moved, stage: toStage });
    grouped[toStage] = toList;
  }

  return PIPELINE_STAGES.flatMap((s) => grouped[s.key]);
}

export function KanbanBoard() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/leads?limit=100&page=1", { cache: "no-store" });
      if (!res.ok) {
        setFetchError("Unable to load pipeline.");
        setLeads([]);
        return;
      }
      const json: unknown = await res.json();
      const data =
        json && typeof json === "object" && "data" in json
          ? (json as { data?: unknown }).data
          : undefined;
      if (!Array.isArray(data)) {
        setFetchError("Invalid pipeline response.");
        setLeads([]);
        return;
      }
      const mapped = data.map((row) => mapApiLeadToPipelineLead(row as ApiLeadListItem));
      setLeads(mapped);
    } catch {
      setFetchError("Unable to load pipeline.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const grouped = useMemo(() => groupByStage(leads), [leads]);

  async function onDragEnd(result: DropResult) {
    setSaveError(null);
    const previous = leads;
    const next = rebuildLeadsAfterDrag(leads, result);
    if (!next) return;

    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStage = source.droppableId as PipelineStage;
    const toStage = destination.droppableId as PipelineStage;
    const stageChanged = fromStage !== toStage;

    setLeads(next);

    if (!stageChanged) return;

    const res = await fetch(`/api/leads/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: toStage }),
    });

    if (res.ok || res.status === 501) return;

    setSaveError("Could not save stage. Reverted.");
    setLeads(previous);
    void loadLeads();
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-light-grey bg-white shadow-card p-10 text-center text-medium-grey">
        Loading pipeline…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-light-grey bg-white p-8 text-center">
        <p className="text-medium-grey">{fetchError}</p>
        <button
          type="button"
          onClick={() => void loadLeads()}
          className="mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-white bg-[linear-gradient(135deg,#0A1628,#1a2c4e)]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-light-grey bg-white shadow-card p-12 text-center">
        <p className="text-navy font-medium">No leads in the pipeline yet</p>
        <p className="mt-2 text-sm text-medium-grey max-w-md mx-auto">
          New prospects appear here after you register them. Use &quot;Register Prospect&quot; above to add
          one; they start in the <strong>New</strong> column.
        </p>
      </div>
    );
  }

  return (
    <div>
      {saveError ? (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-navy">
          {saveError}
        </div>
      ) : null}

      <DragDropContext onDragEnd={(r) => void onDragEnd(r)}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage.key}
                title={stage.label}
                topBorderClass={stage.topBorderClass}
                leads={grouped[stage.key]}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
