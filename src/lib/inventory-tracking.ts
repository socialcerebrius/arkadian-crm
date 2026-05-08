export type InventoryTracking = {
  flatNumber: string | null;
  tower: string | null;
  flatType: string | null;
  viewCategory: string | null;
  clientStage: string;
  depositStatus: string;
  instalmentStatus: string;
};

const EMPTY: InventoryTracking = {
  flatNumber: null,
  tower: null,
  flatType: null,
  viewCategory: null,
  clientStage: "No inventory signal",
  depositStatus: "Not started",
  instalmentStatus: "Not started",
};

export function parseInventoryTracking(notes: string | null | undefined): InventoryTracking {
  const text = (notes ?? "").trim();
  if (!text) return EMPTY;

  const normalized = text.replace(/\s+/g, " ");

  const flatNumber =
    normalized.match(/Flat\s+([A-Za-z0-9-]+)/i)?.[1] ??
    normalized.match(/flat\s+([A-Za-z0-9-]+)/i)?.[1] ??
    null;
  const tower = normalized.match(/Tower\s+([A-Za-z0-9-]+)/i)?.[1] ?? null;
  const flatType = normalized.match(/Type:\s*([^·\n]+)/i)?.[1]?.trim() ?? null;
  const viewCategory = normalized.match(/View:\s*([^·\n]+)/i)?.[1]?.trim() ?? null;
  const clientStage = normalized.match(/Client stage:\s*([^·\n]+)/i)?.[1]?.trim() ?? null;
  const deposit = normalized.match(/Deposit:\s*([^·\n]+)/i)?.[1]?.trim() ?? null;
  const instalment =
    normalized.match(/Instalment:\s*([^·\n]+)/i)?.[1]?.trim() ??
    normalized.match(/Installment:\s*([^·\n]+)/i)?.[1]?.trim() ??
    null;

  // Backward compatibility with previous inventory note lines
  if (!flatNumber && !clientStage) {
    const assignedMatch = text.match(/Assigned flat\s+([A-Za-z0-9-]+)/i);
    if (assignedMatch) {
      return {
        flatNumber: assignedMatch[1] ?? null,
        tower,
        flatType,
        viewCategory,
        clientStage: "Assigned / Reserved",
        depositStatus: "Deposit secured",
        instalmentStatus: "Pending",
      };
    }
    const interestMatch = text.match(/Interest\/viewing logged for flat\s+([A-Za-z0-9-]+)/i);
    if (interestMatch) {
      return {
        flatNumber: interestMatch[1] ?? null,
        tower,
        flatType,
        viewCategory,
        clientStage: "Interested / Viewing",
        depositStatus: "Pending",
        instalmentStatus: "Not started",
      };
    }
  }

  if (!flatNumber && !flatType && !viewCategory && !clientStage && !deposit && !instalment) {
    return EMPTY;
  }

  return {
    flatNumber,
    tower,
    flatType,
    viewCategory,
    clientStage: clientStage ?? "Interested",
    depositStatus: deposit ?? "Pending",
    instalmentStatus: instalment ?? "Not started",
  };
}

