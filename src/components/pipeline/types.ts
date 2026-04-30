export type PipelineStage =
  | "new"
  | "contacted"
  | "viewing_booked"
  | "negotiating"
  | "closed_won"
  | "closed_lost";

export type PipelineLead = {
  id: string;
  name: string;
  score: number;
  source: string;
  budgetLabel: string;
  budgetMin?: number;
  budgetMax?: number;
  phone?: string;
  email?: string;
  unitLabel?: string;
  viewLabel?: string;
  daysInStage: number;
  ownerLabel?: string;
  stage: PipelineStage;
};

