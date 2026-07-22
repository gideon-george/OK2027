import structureData from "../../data/nokm-structure.json";
import {
  states,
  statesByCode,
  zones,
  stateSlug,
  type NgState,
  type ZoneCode,
} from "./geo";

export type ScopeLevel =
  | "national"
  | "zonal"
  | "state"
  | "lga"
  | "ward"
  | "unit"
  | "diaspora";

export type AppointmentStatus =
  | "vacant"
  | "advertised"
  | "acting"
  | "confirmed"
  | "vetted"
  | "suspended";

export interface Office {
  slug: string;
  title: string;
  shortTitle: string;
  scopeLevel: ScopeLevel;
  rank: number;
  mandate: string;
  duties: string[];
  kpis: string[];
  frameworkAddendum?: boolean;
}

/**
 * A post in the movement's structure. A vacancy is simply an appointment with
 * no holder — the org chart and the vacancy board read from the same list.
 */
export interface Appointment {
  /** Stable identifier, also the /structure/[slug] route segment. */
  slug: string;
  office: Office;
  scopeType: "national" | "zone" | "state" | "diaspora";
  scopeCode: string;
  /** Human-readable scope: "National", "South East", "Kaduna". */
  scopeLabel: string;
  holderName: string | null;
  status: AppointmentStatus;
  filled: boolean;
}

export const offices: Office[] = (structureData.offices as Office[])
  .slice()
  .sort((a, b) => a.rank - b.rank);

const officesBySlug = new Map(offices.map((o) => [o.slug, o]));

export function officeBySlug(slug: string): Office | undefined {
  return officesBySlug.get(slug);
}

interface RawAppointment {
  office: string;
  scopeType: Appointment["scopeType"];
  scopeCode: string;
  holderName: string | null;
  status: AppointmentStatus;
}

const rawAppointments = structureData.appointments as RawAppointment[];

function scopeLabelFor(
  scopeType: Appointment["scopeType"],
  scopeCode: string
): string {
  switch (scopeType) {
    case "national":
      return "National";
    case "diaspora":
      return "Diaspora";
    case "zone":
      return zones.find((z) => z.code === scopeCode)?.name ?? scopeCode;
    case "state":
      return statesByCode.get(scopeCode)?.name ?? scopeCode;
  }
}

function appointmentSlug(
  office: Office,
  scopeType: Appointment["scopeType"],
  scopeCode: string
): string {
  // National and diaspora offices are unique, so the office slug alone is a
  // stable URL. Zonal and state posts repeat per scope and need qualifying.
  if (scopeType === "national" || scopeType === "diaspora") return office.slug;
  return `${office.slug}-${scopeCode.toLowerCase()}`;
}

function build(
  office: Office,
  scopeType: Appointment["scopeType"],
  scopeCode: string,
  holderName: string | null,
  status: AppointmentStatus
): Appointment {
  return {
    slug: appointmentSlug(office, scopeType, scopeCode),
    office,
    scopeType,
    scopeCode,
    scopeLabel: scopeLabelFor(scopeType, scopeCode),
    holderName,
    status,
    filled: Boolean(holderName),
  };
}

const seeded: Appointment[] = rawAppointments.flatMap((raw) => {
  const office = officesBySlug.get(raw.office);
  if (!office) return [];
  return [build(office, raw.scopeType, raw.scopeCode, raw.holderName, raw.status)];
});

const seededKeys = new Set(seeded.map((a) => a.slug));

// Every zone and every state has a coordinator post whether or not anyone
// holds it. Posts with no seeded holder are generated as vacant so they appear
// on /vacancies rather than silently not existing.
const zonalOffice = officesBySlug.get("zonal-coordinator")!;
const stateOffice = officesBySlug.get("state-coordinator")!;

const generated: Appointment[] = [];

for (const zone of zones) {
  if (zone.code === "DIASPORA") continue;
  const candidate = build(zonalOffice, "zone", zone.code, null, "vacant");
  if (!seededKeys.has(candidate.slug)) generated.push(candidate);
}

for (const state of states) {
  const candidate = build(stateOffice, "state", state.code, null, "vacant");
  if (!seededKeys.has(candidate.slug)) generated.push(candidate);
}

/** Every post in the movement's structure, filled or vacant. */
export const appointments: Appointment[] = [...seeded, ...generated];

const appointmentsBySlug = new Map(appointments.map((a) => [a.slug, a]));

export function appointmentBySlug(slug: string): Appointment | undefined {
  return appointmentsBySlug.get(slug);
}

function byRankThenScope(a: Appointment, b: Appointment): number {
  if (a.office.rank !== b.office.rank) return a.office.rank - b.office.rank;
  return a.scopeLabel.localeCompare(b.scopeLabel);
}

/** National executive roster, in framework rank order. */
export const nationalRoster: Appointment[] = appointments
  .filter((a) => a.scopeType === "national" || a.scopeType === "diaspora")
  .sort(byRankThenScope);

/** The six zonal coordinator posts, in the zone order used across the site. */
export const zonalRoster: Appointment[] = zones
  .filter((z) => z.code !== "DIASPORA")
  .map((z) => appointments.find((a) => a.scopeType === "zone" && a.scopeCode === z.code)!)
  .filter(Boolean);

/** All state-level posts (coordinators and any state officers), by state name. */
export const stateRoster: Appointment[] = appointments
  .filter((a) => a.scopeType === "state")
  .sort(byRankThenScope);

export function appointmentsForState(stateCode: string): Appointment[] {
  return stateRoster.filter((a) => a.scopeCode === stateCode);
}

export function stateCoordinator(stateCode: string): Appointment | undefined {
  return stateRoster.find(
    (a) => a.scopeCode === stateCode && a.office.slug === "state-coordinator"
  );
}

export function zonalCoordinator(zoneCode: ZoneCode): Appointment | undefined {
  return zonalRoster.find((a) => a.scopeCode === zoneCode);
}

/** Open posts, most senior first. */
export const vacancies: Appointment[] = appointments
  .filter((a) => a.status === "vacant" || a.status === "advertised")
  .sort(byRankThenScope);

export interface Coverage {
  statesTotal: number;
  statesFilled: number;
  zonesTotal: number;
  zonesFilled: number;
  nationalTotal: number;
  nationalFilled: number;
  vacanciesTotal: number;
}

export const coverage: Coverage = {
  statesTotal: states.length,
  statesFilled: states.filter((s) => stateCoordinator(s.code)?.filled).length,
  zonesTotal: zonalRoster.length,
  zonesFilled: zonalRoster.filter((a) => a.filled).length,
  nationalTotal: nationalRoster.length,
  nationalFilled: nationalRoster.filter((a) => a.filled).length,
  vacanciesTotal: vacancies.length,
};

export interface ZoneCoverage {
  code: ZoneCode;
  name: string;
  blurb: string;
  coordinator: Appointment | undefined;
  states: Array<{ state: NgState; slug: string; coordinator: Appointment | undefined }>;
  statesFilled: number;
  statesTotal: number;
}

/** Zone-by-zone view used by /structure. */
export const zoneCoverage: ZoneCoverage[] = zones
  .filter((z) => z.code !== "DIASPORA")
  .map((zone) => {
    const inZone = states.filter((s) => s.zone === zone.code);
    return {
      code: zone.code,
      name: zone.name,
      blurb: zone.blurb,
      coordinator: zonalCoordinator(zone.code),
      states: inZone.map((state) => ({
        state,
        slug: stateSlug(state),
        coordinator: stateCoordinator(state.code),
      })),
      statesFilled: inZone.filter((s) => stateCoordinator(s.code)?.filled).length,
      statesTotal: inZone.length,
    };
  });

export const statusLabels: Record<AppointmentStatus, string> = {
  vacant: "Vacant",
  advertised: "Open — accepting applications",
  acting: "Acting",
  confirmed: "Confirmed",
  vetted: "Vetted",
  suspended: "Suspended",
};
