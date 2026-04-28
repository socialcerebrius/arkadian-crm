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
  budgetLabel: string;
  unitLabel?: string;
  viewLabel?: string;
  daysInStage: number;
  ownerLabel?: string;
  stage: PipelineStage;
};

