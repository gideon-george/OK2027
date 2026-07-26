import {
  baselineForState,
  stateBaselines,
  untappedVoters,
  type StateBaseline,
} from "./baseline";
import { geoForState, states, stateSlug, zones, type ZoneCode } from "./geo";
import { stateCoordinator, zonalCoordinator } from "./structure";

/**
 * Penetration — where the movement is present, and where it is not.
 *
 * Two dimensions, kept apart on purpose because only one of them is knowable
 * today:
 *
 *   PRESENCE    Where NOkM has people. Known from the roster down to state
 *               level. Below that, nothing has been reported into this
 *               platform yet, and "unreported" is rendered as its own state
 *               rather than being coloured as if it were an absence.
 *
 *   OPPORTUNITY How many registered voters did not vote in 2023. Real,
 *               complete, and available at state and LGA level right now. It
 *               is the reason coverage matters, and it is what makes the gap
 *               actionable before a single report is filed.
 *
 * A green tile must never mean "we assume". See docs/TODO-real-data.md.
 */

export type PresenceStatus =
  /** A post is named at this level. */
  | "covered"
  /** Some structures below are named, not all. */
  | "partial"
  /** The post exists and nobody holds it. */
  | "dark"
  /** No report has reached this platform. Not the same as nobody being there. */
  | "unreported";

export const presenceLabels: Record<PresenceStatus, string> = {
  covered: "Covered",
  partial: "Partly covered",
  dark: "No one in post",
  unreported: "Not yet reported",
};

export interface PlaceCoverage {
  code: string;
  name: string;
  slug: string;
  zone: ZoneCode;
  presence: PresenceStatus;
  /** Who holds the coordinating post, when the roster names one. */
  holderName: string | null;
  lgas: number;
  wards: number;
  pollingUnits: number;
  registered: number;
  accredited: number;
  /** Registered voters who did not turn out in 2023 — the pool to mobilise. */
  nonVoters: number;
  /** Share of the 2023 register that did not vote, as a percentage. */
  nonVoterPct: number;
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function buildState(baseline: StateBaseline): PlaceCoverage {
  const state = states.find((s) => s.code === baseline.code)!;
  const geo = geoForState(baseline.code);
  const coordinator = stateCoordinator(baseline.code);
  const nonVoters = untappedVoters(baseline);

  return {
    code: baseline.code,
    name: state.name,
    slug: stateSlug(state),
    zone: state.zone,
    presence: coordinator?.filled ? "covered" : "dark",
    holderName: coordinator?.holderName ?? null,
    lgas: geo?.lgas ?? 0,
    wards: geo?.wards ?? baseline.wards,
    pollingUnits: baseline.pollingUnits,
    registered: baseline.registered,
    accredited: baseline.accredited,
    nonVoters,
    nonVoterPct: pct(nonVoters, baseline.registered),
  };
}

/** All 37 states with their presence and their 2023 opportunity. */
export const statePenetration: PlaceCoverage[] = stateBaselines
  .map(buildState)
  .sort((a, b) => a.name.localeCompare(b.name));

const stateByCode = new Map(statePenetration.map((s) => [s.code, s]));
const stateBySlug = new Map(statePenetration.map((s) => [s.slug, s]));

export function penetrationForState(code: string): PlaceCoverage | undefined {
  return stateByCode.get(code);
}

export function penetrationBySlug(slug: string): PlaceCoverage | undefined {
  return stateBySlug.get(slug);
}

export interface ZonePenetration {
  code: ZoneCode;
  name: string;
  blurb: string;
  presence: PresenceStatus;
  holderName: string | null;
  states: PlaceCoverage[];
  statesCovered: number;
  statesTotal: number;
  lgas: number;
  wards: number;
  pollingUnits: number;
  registered: number;
  nonVoters: number;
  nonVoterPct: number;
}

export const zonePenetration: ZonePenetration[] = zones
  .filter((z) => z.code !== "DIASPORA")
  .map((zone) => {
    const inZone = statePenetration.filter((s) => s.zone === zone.code);
    const coordinator = zonalCoordinator(zone.code);
    const covered = inZone.filter((s) => s.presence === "covered").length;
    const totals = inZone.reduce(
      (acc, s) => ({
        lgas: acc.lgas + s.lgas,
        wards: acc.wards + s.wards,
        pollingUnits: acc.pollingUnits + s.pollingUnits,
        registered: acc.registered + s.registered,
        nonVoters: acc.nonVoters + s.nonVoters,
      }),
      { lgas: 0, wards: 0, pollingUnits: 0, registered: 0, nonVoters: 0 }
    );

    let presence: PresenceStatus;
    if (!coordinator?.filled) presence = "dark";
    else if (covered === inZone.length) presence = "covered";
    else presence = "partial";

    return {
      code: zone.code,
      name: zone.name,
      blurb: zone.blurb,
      presence,
      holderName: coordinator?.holderName ?? null,
      states: inZone,
      statesCovered: covered,
      statesTotal: inZone.length,
      ...totals,
      nonVoterPct: pct(totals.nonVoters, totals.registered),
    };
  });

/** The single largest pools of unmobilised voters, nationally. */
export const biggestOpportunities: PlaceCoverage[] = [...statePenetration]
  .sort((a, b) => b.nonVoters - a.nonVoters)
  .slice(0, 6);

/** States with no coordinator named, ordered by how much is at stake. */
export const darkStates: PlaceCoverage[] = statePenetration
  .filter((s) => s.presence !== "covered")
  .sort((a, b) => b.nonVoters - a.nonVoters);

export const nationalPenetration = {
  registered: statePenetration.reduce((a, s) => a + s.registered, 0),
  accredited: statePenetration.reduce((a, s) => a + s.accredited, 0),
  nonVoters: statePenetration.reduce((a, s) => a + s.nonVoters, 0),
  pollingUnits: statePenetration.reduce((a, s) => a + s.pollingUnits, 0),
  statesCovered: statePenetration.filter((s) => s.presence === "covered").length,
  statesTotal: statePenetration.length,
};

/**
 * Heat band for the opportunity view, 0–4. Thresholds are quantiles of the
 * real distribution rather than round numbers, so the map does not render as
 * one flat colour with two outliers.
 */
export function opportunityBand(nonVoters: number, max: number): number {
  if (max <= 0) return 0;
  const share = nonVoters / max;
  if (share >= 0.7) return 4;
  if (share >= 0.45) return 3;
  if (share >= 0.25) return 2;
  if (share >= 0.1) return 1;
  return 0;
}

export const maxStateNonVoters = Math.max(
  ...statePenetration.map((s) => s.nonVoters)
);

export { baselineForState };
