import raw from "../../data/constituencies.json";
import { states, statesByCode, type NgState } from "./geo";

/**
 * The five races on a Nigerian ballot, and how much of each is actually known
 * to this platform.
 *
 * `confidence` is the important field:
 *
 *   complete            Every constituency in this race is identifiable here.
 *   seats-only          The number of seats per state is constitutionally
 *                       fixed and reliable; the district names are not loaded.
 *   national-total-only Only the national seat total is known.
 *
 * Nothing in this module invents a constituency name or an LGA grouping. A
 * wrong federal constituency on a political website is worse than an absent
 * one, and the UI is built to say "not loaded" rather than guess.
 */

export type RaceKey =
  | "president"
  | "governor"
  | "senate"
  | "reps"
  | "assembly";

export type RaceConfidence =
  | "complete"
  | "seats-only"
  | "national-total-only";

export interface Race {
  key: RaceKey;
  label: string;
  shortLabel: string;
  office: string;
  constituencyUnit: string;
  seats: number;
  confidence: RaceConfidence;
  scope: string;
  excludesFct?: boolean;
  seatsPerState?: number;
  fctSeats?: number;
  note?: string;
}

export const raceMeta = raw._meta;

export const races: Race[] = raw.races as Race[];

const raceByKey = new Map(races.map((r) => [r.key, r]));

export function race(key: RaceKey): Race | undefined {
  return raceByKey.get(key);
}

export const confidenceLabels: Record<RaceConfidence, string> = {
  complete: "Constituencies loaded",
  "seats-only": "Seat counts loaded, district names not yet",
  "national-total-only": "National total only",
};

/** True when a given state actually contests a given race. */
export function stateContests(raceKey: RaceKey, stateCode: string): boolean {
  const r = raceByKey.get(raceKey);
  if (!r) return false;
  if (r.excludesFct && stateCode === "FC") return false;
  return true;
}

export interface RaceInState {
  race: Race;
  /** Seats this state elects, where that is reliably known. Null otherwise. */
  seats: number | null;
  /** What we can honestly say about the constituency the voter is in. */
  constituency: string | null;
  contested: boolean;
}

/**
 * What the five races look like for one state.
 *
 * Returns nulls rather than estimates. "Your senatorial district is one of
 * Kano's three" is true and useful; naming it would not be.
 */
export function racesForState(stateCode: string): RaceInState[] {
  const state = statesByCode.get(stateCode);

  return races.map((r) => {
    const contested = stateContests(r.key, stateCode);
    let seats: number | null = null;

    if (!contested) {
      return { race: r, seats: null, constituency: null, contested };
    }

    switch (r.key) {
      case "president":
        seats = 1;
        break;
      case "governor":
        seats = 1;
        break;
      case "senate":
        // Constitutionally fixed, so this is a real number.
        seats = stateCode === "FC" ? (r.fctSeats ?? 1) : (r.seatsPerState ?? 3);
        break;
      default:
        // Reps and Assembly: per-state allocation is INEC delimitation and is
        // not loaded. Say so rather than dividing 360 by 37.
        seats = null;
    }

    let constituency: string | null = null;
    if (r.key === "president") constituency = "Nigeria";
    if (r.key === "governor") constituency = state?.name ?? null;

    return { race: r, seats, constituency, contested };
  });
}

/** States that elect a Governor — every state except the FCT. */
export const gubernatorialStates: NgState[] = states.filter(
  (s) => s.code !== "FC"
);

/** How complete this whole area of the platform is, for the honesty banner. */
export const constituencyDataLoaded = (
  raw.constituencies as unknown[]
).length;
