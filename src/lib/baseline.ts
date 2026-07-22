import baselineData from "../../data/baseline-2023.json";

/**
 * 2023 general election baseline, derived from the Nigeria 2.0 collation of
 * polling-unit result sheets published on INEC's IReV portal.
 *
 * What this carries: the polling-unit register, registered and accredited
 * voters, and how many result sheets were validated, flagged unsure, or never
 * found.
 *
 * What it deliberately does not carry: per-party vote counts. The source
 * transcription runs from roughly 76% to over 100% of official national party
 * totals, and in states like Zamfara under 3% of sheets were validated.
 * Publishing those figures would put easily-disproved numbers on the site and
 * would breach the movement's own rule that facts are marked verified or
 * unverified and never confused. See scripts/build-geography.mjs.
 */

export interface StateBaseline {
  code: string;
  name: string;
  registered: number;
  accredited: number;
  pollingUnits: number;
  wards: number;
  validated: number;
  unsure: number;
  notFound: number;
  turnoutPct: number | null;
  validatedPct: number | null;
}

export interface NationalBaseline {
  registered: number;
  accredited: number;
  pollingUnits: number;
  wards: number;
  lgas: number;
  validated: number;
  unsure: number;
  notFound: number;
  turnoutPct: number;
}

export const baselineMeta = baselineData._meta;

export const nationalBaseline: NationalBaseline = baselineData.national;

export const stateBaselines: StateBaseline[] = baselineData.states;

const byCode = new Map(stateBaselines.map((s) => [s.code, s]));

export function baselineForState(code: string): StateBaseline | undefined {
  return byCode.get(code);
}

/** Share of 2023 registered voters who did not turn out — the pool to mobilise. */
export function untappedVoters(state: StateBaseline): number {
  return Math.max(0, state.registered - state.accredited);
}

export const nationalUntapped =
  nationalBaseline.registered - nationalBaseline.accredited;

/**
 * Sheet documentation coverage. Describes the completeness of the 2023 public
 * record for a state — not an allegation about any person or party.
 */
export function documentationCoverage(state: StateBaseline) {
  const total = state.pollingUnits || 1;
  return {
    validatedPct: Math.round((state.validated / total) * 1000) / 10,
    unsurePct: Math.round((state.unsure / total) * 1000) / 10,
    notFoundPct: Math.round((state.notFound / total) * 1000) / 10,
  };
}
