/**
 * The movement's published weekly operating cycle.
 * Source: docs/nokm-framework.md §6.
 */
export interface RhythmDay {
  /** JavaScript day index, so Date.getDay() maps directly. */
  index: number;
  day: string;
  focus: string;
  detail: string;
  /** What a lead officer is expected to produce that day. */
  deliverable: string;
}

export const weeklyRhythm: RhythmDay[] = [
  {
    index: 1,
    day: "Monday",
    focus: "Politics and marketing our movement",
    detail:
      "Strategising and outreach. Set the week's message and push it through every platform.",
    deliverable: "Message of the week circulated to all levels.",
  },
  {
    index: 2,
    day: "Tuesday",
    focus: "Strategies to win all polling units",
    detail:
      "Unit-level planning for Peter Obi and Rabiu Kwankwaso. Which units are covered, which are not, and who is closing the gap.",
    deliverable: "Polling-unit coverage gaps named, with an owner for each.",
  },
  {
    index: 3,
    day: "Wednesday",
    focus: "State coverage update",
    detail:
      "How far the movement has covered in each state. Coordinators report progress and blockers.",
    deliverable: "State-by-state progress review recorded.",
  },
  {
    index: 4,
    day: "Thursday",
    focus: "PVC verification",
    detail:
      "Knowing and checking how many members have their PVC, and planning for the rest.",
    deliverable: "Updated PVC counts by ward.",
  },
  {
    index: 5,
    day: "Friday",
    focus: "Member business marketing",
    detail:
      "Members promote their own trades and businesses on the Market/Trade board. The movement looks after its own.",
    deliverable: "New listings reviewed and approved.",
  },
  {
    index: 6,
    day: "Saturday",
    focus: "Politics and news trending",
    detail:
      "Current affairs analysis. What moved this week and what it means for the movement.",
    deliverable: "Weekly news brief shared with the structure.",
  },
  {
    index: 0,
    day: "Sunday",
    focus: "Checking upon ourselves",
    detail:
      "Community support and solidarity. Welfare of members comes before the work.",
    deliverable: "Welfare cases identified and passed to the Welfare office.",
  },
];

/** Monday-first ordering, which is how the movement publishes it. */
export const rhythmInWeekOrder: RhythmDay[] = [
  ...weeklyRhythm.filter((d) => d.index !== 0),
  ...weeklyRhythm.filter((d) => d.index === 0),
];

export function dayFor(dayIndex: number): RhythmDay | undefined {
  return weeklyRhythm.find((d) => d.index === dayIndex);
}
