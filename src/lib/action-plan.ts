import planData from "../../data/nokm-action-plan.json";
import { officeBySlug, type Office } from "./structure";

export interface ActionPhase {
  slug: string;
  name: string;
  verb: string;
  pillar: string;
  weeks: string;
  summary: string;
}

export interface ActionItem {
  phase: string;
  week: number;
  title: string;
  deliverable: string;
  ownerOffice: string;
}

export interface ActionItemWithOwner extends ActionItem {
  owner: Office | undefined;
}

export const actionPlanMeta = planData._meta;

export const actionPhases: ActionPhase[] = planData.phases;

export const actionItems: ActionItemWithOwner[] = (
  planData.items as ActionItem[]
)
  .slice()
  .sort((a, b) => a.week - b.week)
  .map((item) => ({ ...item, owner: officeBySlug(item.ownerOffice) }));

export function itemsForPhase(phaseSlug: string): ActionItemWithOwner[] {
  return actionItems.filter((i) => i.phase === phaseSlug);
}

export const totalWeeks = Math.max(...actionItems.map((i) => i.week));
