import declared from "../../data/nokm-coverage-declared.json";
import { nationalGeo, states, zones } from "./geo";
import { appointments, offices } from "./structure";

/**
 * Declared national coverage.
 *
 * Wave 4 introduced figures that leadership reports but that the roster in this
 * repository cannot yet prove — 544 LGA coordinators are declared, and none are
 * named here. The movement's rule is "never invent a number", and this module
 * keeps that rule by refusing to blur the two categories together:
 *
 *   declared — reported by National Coordination, carrying a source and a date
 *   named    — an actual appointment record in data/nokm-structure.json
 *
 * Both are shown wherever they differ. Neither is averaged into the other, and
 * the flattering one is never picked. See docs/TODO-real-data.md.
 */

export type CoverageKey =
  | "national"
  | "diaspora"
  | "zone"
  | "state"
  | "lga"
  | "ward"
  | "unit";

interface RawLevel {
  key: string;
  label: string;
  shortLabel: string;
  declared: number;
  universe: number | null;
  universeLabel: string;
  universeSource: string | null;
  rosterKey: string | null;
  note?: string;
}

export interface CoverageLevel {
  key: CoverageKey;
  label: string;
  shortLabel: string;
  /** Reported by National Coordination. */
  declared: number;
  /** The whole of Nigeria at this level, where one exists. */
  universe: number | null;
  universeLabel: string;
  universeSource: string | null;
  /** Posts actually named in the public roster, where the roster covers them. */
  named: number | null;
  /** universe - declared. Null where there is no fixed universe. */
  gap: number | null;
  /** declared / universe as a percentage, one decimal. Null with no universe. */
  pct: number | null;
  /** declared - named. Positive means leadership reports more than is named. */
  unnamed: number | null;
  note?: string;
}

export const coverageMeta = declared._meta;

// ---------------------------------------------------------------------------
// Named counts, read from the roster rather than restated
// ---------------------------------------------------------------------------

function filledWhere(predicate: (a: (typeof appointments)[number]) => boolean) {
  return appointments.filter((a) => predicate(a) && a.filled).length;
}

const namedByRosterKey: Record<string, number> = {
  national: filledWhere((a) => a.scopeType === "national"),
  diaspora: filledWhere((a) => a.scopeType === "diaspora"),
  zone: filledWhere((a) => a.scopeType === "zone"),
  state: filledWhere(
    (a) => a.scopeType === "state" && a.office.slug === "state-coordinator"
  ),
};

// ---------------------------------------------------------------------------
// The real universe, taken from the loaded INEC register — never restated
// ---------------------------------------------------------------------------

const realUniverse: Partial<Record<CoverageKey, number>> = {
  national: offices.length,
  zone: zones.filter((z) => z.code !== "DIASPORA").length,
  state: states.length,
  lga: nationalGeo.lgas,
  unit: nationalGeo.pollingUnits,
  // `ward` is deliberately absent: the declared file uses INEC's official
  // 8,809 while the loaded register lists 8,874 ward names, ~65 of which are
  // believed to be spelling variants. Cross-checking would fail on a known and
  // documented discrepancy rather than on an error.
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const levels: CoverageLevel[] = (declared.levels as RawLevel[]).map((raw) => {
  const key = raw.key as CoverageKey;

  // A declared figure larger than the number of polling units in Nigeria is a
  // data-entry error, not a fact. Fail the build rather than publish it.
  if (raw.universe !== null && raw.declared > raw.universe) {
    throw new Error(
      `[coverage] Declared "${raw.label}" (${raw.declared}) exceeds its universe ` +
        `(${raw.universe}). Correct data/nokm-coverage-declared.json — the ` +
        `platform will not publish a figure larger than the country.`
    );
  }

  const expected = realUniverse[key];
  if (expected !== undefined && raw.universe !== expected) {
    throw new Error(
      `[coverage] Universe for "${raw.label}" is ${raw.universe} in ` +
        `data/nokm-coverage-declared.json but the loaded register says ` +
        `${expected}. One of the two is wrong; fix it rather than shipping both.`
    );
  }

  const named = raw.rosterKey ? (namedByRosterKey[raw.rosterKey] ?? null) : null;

  return {
    key,
    label: raw.label,
    shortLabel: raw.shortLabel,
    declared: raw.declared,
    universe: raw.universe,
    universeLabel: raw.universeLabel,
    universeSource: raw.universeSource,
    named,
    gap: raw.universe === null ? null : raw.universe - raw.declared,
    pct: raw.universe === null ? null : round1((raw.declared / raw.universe) * 100),
    unnamed: named === null ? null : raw.declared - named,
    note: raw.note,
  };
});

export const coverageLevels: CoverageLevel[] = levels;

const byKey = new Map(levels.map((l) => [l.key, l]));

export function coverageLevel(key: CoverageKey): CoverageLevel | undefined {
  return byKey.get(key);
}

/** The polling units with no NOkM presence recorded — the headline gap. */
export const darkUnits = coverageLevel("unit")?.gap ?? 0;

/** Levels where leadership reports more people than the roster names. */
export const unreconciled = levels.filter((l) => (l.unnamed ?? 0) > 0);

/** Formats a whole number the way the rest of the site does. */
export function fmt(n: number): string {
  return n.toLocaleString("en-NG");
}
