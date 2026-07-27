import { nationalBaseline, stateBaselines } from "./baseline";
import { stateSlug, statesByCode } from "./geo";
import { generalElection } from "./site";

/**
 * The arithmetic of victory.
 *
 * A projection engine, not a forecast and not a poll. It answers one question:
 * if turnout reaches X and the movement's candidates take Y of the votes cast,
 * how many actual human beings is that, and where do they have to live?
 *
 * WHAT IT IS BUILT ON. Only the two facts this platform holds for every state
 * and can defend: the 2023 register and 2023 accreditation, from the Nigeria
 * 2.0 collation. Nothing here uses per-party vote counts — those are excluded
 * from this repository on purpose (see docs/TODO-real-data.md), and a model
 * that leaned on them would inherit their transcription error.
 *
 * WHAT IT IS NOT. It contains no assumption about who anybody votes for. The
 * share input is a target the user sets, not a prediction the platform makes.
 * Every output is a division sum performed on the register, so any figure on
 * the page can be re-derived by hand from the baseline table.
 *
 * The point of it is deflationary. "Win Nigeria" is a slogan nobody can act
 * on. "Bola Ward needs 214 more voters than it produced in 2023" is a Saturday
 * morning's work, and it is the same sentence.
 */

/** Nigeria's 2023 register held by this platform, for reference in copy. */
export const modelBasis = {
  register2023: nationalBaseline.registered,
  voted2023: nationalBaseline.accredited,
  turnout2023: nationalBaseline.turnoutPct,
  pollingUnits: nationalBaseline.pollingUnits,
  wards: nationalBaseline.wards,
  lgas: nationalBaseline.lgas,
  states: stateBaselines.length,
} as const;

export interface Scenario {
  /** Share of the projected register that turns out, nationally. */
  turnoutPct: number;
  /** Share of the votes cast that the movement's candidates must take. */
  sharePct: number;
  /** New registrants added to the roll before 2027, in millions. */
  newRegistrantsM: number;
}

export const scenarioBounds = {
  turnoutPct: { min: 20, max: 70, step: 0.5 },
  sharePct: { min: 25, max: 70, step: 0.5 },
  newRegistrantsM: { min: 0, max: 15, step: 0.5 },
} as const;

/**
 * The opening position is deliberately unflattering: 2023's own turnout, a
 * plurality-sized share, and not one new voter registered. Every improvement
 * on the page has to be earned by moving a slider, which is the honest way
 * round — the movement's work is the thing that moves the numbers.
 */
export const defaultScenario: Scenario = {
  turnoutPct: nationalBaseline.turnoutPct,
  sharePct: 40,
  newRegistrantsM: 0,
};

export const presets: { key: string; label: string; blurb: string; scenario: Scenario }[] = [
  {
    key: "repeat",
    label: "2023 repeats itself",
    blurb: "Same turnout, nobody new on the roll.",
    scenario: { turnoutPct: nationalBaseline.turnoutPct, sharePct: 40, newRegistrantsM: 0 },
  },
  {
    key: "plan",
    label: "The plan",
    blurb: "Turnout back to 40%, five million new PVCs.",
    scenario: { turnoutPct: 40, sharePct: 40, newRegistrantsM: 5 },
  },
  {
    key: "surge",
    label: "The surge",
    blurb: "1999-level turnout and a decisive majority.",
    scenario: { turnoutPct: 55, sharePct: 50, newRegistrantsM: 10 },
  },
];

export function clampScenario(s: Scenario): Scenario {
  const clamp = (v: number, b: { min: number; max: number }) =>
    Number.isFinite(v) ? Math.min(b.max, Math.max(b.min, v)) : b.min;
  return {
    turnoutPct: clamp(s.turnoutPct, scenarioBounds.turnoutPct),
    sharePct: clamp(s.sharePct, scenarioBounds.sharePct),
    newRegistrantsM: clamp(s.newRegistrantsM, scenarioBounds.newRegistrantsM),
  };
}

export interface StateProjection {
  code: string;
  name: string;
  slug: string | null;
  /** 2023, as held by this platform. */
  register2023: number;
  voted2023: number;
  nonVoters2023: number;
  pollingUnits: number;
  wards: number;
  /** 2023 register plus this state's pro-rata share of new registrants. */
  projectedRegister: number;
  /** projectedRegister x turnout. */
  projectedVotesCast: number;
  /** One quarter of the votes cast here — the constitutional spread test. */
  quarterThreshold: number;
  /** The movement's own target in this state at the chosen share. */
  target: number;
  /** How many more people must vote here than voted in 2023. */
  extraVoters: number;
  /** 2023 non-voters plus new registrants — everyone not already counted. */
  pool: number;
  /** The target as a share of that pool. Over 100 means the pool is too small. */
  poolPct: number;
  /** Target divided by the state's polling units. */
  perPollingUnit: number;
}

export interface SpreadReading {
  key: "fct-as-state" | "fct-mandatory";
  label: string;
  requirement: string;
  /** How many of the 37 must clear one quarter under this reading. */
  count: number;
  /** The cheapest set that satisfies it, in ascending order of cost. */
  states: StateProjection[];
  /** Sum of the quarter thresholds across that set. */
  cost: number;
  /** The most expensive state in the set — the one that sets the bar. */
  marginal: StateProjection | null;
}

export interface Ladder {
  perState: number;
  perLga: number;
  perWard: number;
  perPollingUnit: number;
  /** One member who brings ten is eleven votes. This many such members. */
  membersBringingTen: number;
  /** Those members spread over every polling unit in the federation. */
  teamsPerPollingUnit: number;
}

export interface Projection {
  scenario: Scenario;
  states: StateProjection[];
  /** Whole federation. */
  projectedRegister: number;
  projectedVotesCast: number;
  /** The national number the movement's candidates must reach. */
  nationalTarget: number;
  /** Votes cast beyond 2023's accreditation — new people through the door. */
  extraVoters: number;
  /** Everyone on the projected roll who did not vote in 2023. */
  nationalPool: number;
  nationalPoolPct: number;
  /** States where the target exceeds the whole available pool. */
  overstretched: StateProjection[];
  readings: SpreadReading[];
  ladder: Ladder;
}

function round(n: number): number {
  return Math.round(n);
}

/**
 * Runs the model.
 *
 * New registrants are spread pro rata across states — every state grows by the
 * same multiplier. That is a stated simplification, not a claim: registration
 * drives do not land evenly, and a state-by-state registration forecast is not
 * something this platform can defend today. It is the most neutral assumption
 * available, and it is disclosed on the page rather than buried here.
 */
export function project(input: Scenario): Projection {
  const scenario = clampScenario(input);
  const turnout = scenario.turnoutPct / 100;
  const share = scenario.sharePct / 100;
  const newRegistrants = scenario.newRegistrantsM * 1_000_000;
  const growth =
    modelBasis.register2023 > 0 ? newRegistrants / modelBasis.register2023 : 0;

  const states: StateProjection[] = stateBaselines.map((b) => {
    const ngState = statesByCode.get(b.code);
    const added = b.registered * growth;
    const projectedRegister = b.registered + added;
    const projectedVotesCast = projectedRegister * turnout;
    const target = projectedVotesCast * share;
    const nonVoters2023 = Math.max(0, b.registered - b.accredited);
    const pool = nonVoters2023 + added;

    return {
      code: b.code,
      name: ngState?.name ?? b.name,
      slug: ngState ? stateSlug(ngState) : null,
      register2023: b.registered,
      voted2023: b.accredited,
      nonVoters2023,
      pollingUnits: b.pollingUnits,
      wards: b.wards,
      projectedRegister: round(projectedRegister),
      projectedVotesCast: round(projectedVotesCast),
      quarterThreshold: Math.ceil(projectedVotesCast * 0.25),
      target: Math.ceil(target),
      extraVoters: round(projectedVotesCast - b.accredited),
      pool: round(pool),
      poolPct: pool > 0 ? Math.round((target / pool) * 1000) / 10 : 0,
      perPollingUnit: b.pollingUnits > 0 ? Math.ceil(target / b.pollingUnits) : 0,
    };
  });

  const projectedRegister = states.reduce((n, s) => n + s.projectedRegister, 0);
  const projectedVotesCast = states.reduce((n, s) => n + s.projectedVotesCast, 0);
  const nationalTarget = states.reduce((n, s) => n + s.target, 0);
  const nationalPool = states.reduce((n, s) => n + s.pool, 0);

  // Cheapest first. Ties break on name so the board never reshuffles between
  // two states that cost the same.
  const byCost = [...states].sort(
    (a, b) => a.quarterThreshold - b.quarterThreshold || a.name.localeCompare(b.name)
  );
  const fct = states.find((s) => s.code === "FC") ?? null;

  const asState = byCost.slice(0, 25);
  const mandatory = fct
    ? [fct, ...byCost.filter((s) => s.code !== "FC").slice(0, 24)].sort(
        (a, b) => a.quarterThreshold - b.quarterThreshold || a.name.localeCompare(b.name)
      )
    : byCost.slice(0, 25);

  const readings: SpreadReading[] = [
    {
      key: "fct-as-state",
      label: "FCT counted as a state",
      requirement:
        "One quarter of the votes cast in any 25 of the 37 — the FCT counting as one of them, with no separate requirement of its own.",
      count: 25,
      states: asState,
      cost: asState.reduce((n, s) => n + s.quarterThreshold, 0),
      marginal: asState[asState.length - 1] ?? null,
    },
    {
      key: "fct-mandatory",
      label: "FCT required on top",
      requirement:
        "One quarter of the votes cast in 24 states, and one quarter in the Federal Capital Territory as a separate, unavoidable condition.",
      count: 25,
      states: mandatory,
      cost: mandatory.reduce((n, s) => n + s.quarterThreshold, 0),
      marginal: mandatory[mandatory.length - 1] ?? null,
    },
  ];

  const ladder: Ladder = {
    perState: Math.ceil(nationalTarget / modelBasis.states),
    perLga: Math.ceil(nationalTarget / modelBasis.lgas),
    perWard: Math.ceil(nationalTarget / modelBasis.wards),
    perPollingUnit: Math.ceil(nationalTarget / modelBasis.pollingUnits),
    membersBringingTen: Math.ceil(nationalTarget / 11),
    teamsPerPollingUnit: Math.ceil(nationalTarget / 11 / modelBasis.pollingUnits),
  };

  return {
    scenario,
    states,
    projectedRegister: round(projectedRegister),
    projectedVotesCast: round(projectedVotesCast),
    nationalTarget,
    extraVoters: round(projectedVotesCast - modelBasis.voted2023),
    nationalPool: round(nationalPool),
    nationalPoolPct:
      nationalPool > 0 ? Math.round((nationalTarget / nationalPool) * 1000) / 10 : 0,
    overstretched: states.filter((s) => s.poolPct > 100),
    readings,
    ladder,
  };
}

/**
 * Days between now and the expected polling day.
 *
 * The date is EXPECTED, not published — see generalElection in site.ts. Callers
 * must render it as such. Computed from a caller-supplied "now" so the value
 * comes from the browser clock rather than being frozen at build time.
 */
export function daysToElection(now: Date): number {
  const poll = new Date(`${generalElection.expectedDate}T08:00:00+01:00`);
  const ms = poll.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** The scenario as URL search params, so a scenario can be forwarded intact. */
export function scenarioToQuery(s: Scenario): string {
  const params = new URLSearchParams({
    t: String(s.turnoutPct),
    s: String(s.sharePct),
    n: String(s.newRegistrantsM),
  });
  return params.toString();
}

export function scenarioFromQuery(query: string): Scenario | null {
  const params = new URLSearchParams(query);
  if (!params.has("t") && !params.has("s") && !params.has("n")) return null;
  return clampScenario({
    turnoutPct: Number(params.get("t") ?? defaultScenario.turnoutPct),
    sharePct: Number(params.get("s") ?? defaultScenario.sharePct),
    newRegistrantsM: Number(params.get("n") ?? defaultScenario.newRegistrantsM),
  });
}
