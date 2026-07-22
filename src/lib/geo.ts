import lgaData from "../../data/inec-pilot.json";

export type ZoneCode = "NC" | "NE" | "NW" | "SE" | "SS" | "SW" | "DIASPORA";

export interface Zone {
  name: string;
  code: ZoneCode;
  /** Short line used on cards and in the structure drill-down. */
  blurb: string;
}

/** The six geopolitical zones plus the diaspora directorate. */
export const zones: Zone[] = [
  {
    name: "North Central",
    code: "NC",
    blurb: "Benue, Kogi, Kwara, Nasarawa, Niger, Plateau and the FCT.",
  },
  {
    name: "North East",
    code: "NE",
    blurb: "Adamawa, Bauchi, Borno, Gombe, Taraba and Yobe.",
  },
  {
    name: "North West",
    code: "NW",
    blurb: "Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto and Zamfara.",
  },
  {
    name: "South East",
    code: "SE",
    blurb: "Abia, Anambra, Ebonyi, Enugu and Imo.",
  },
  {
    name: "South South",
    code: "SS",
    blurb: "Akwa Ibom, Bayelsa, Cross River, Delta, Edo and Rivers.",
  },
  {
    name: "South West",
    code: "SW",
    blurb: "Ekiti, Lagos, Ogun, Ondo, Osun and Oyo.",
  },
  {
    name: "Diaspora",
    code: "DIASPORA",
    blurb: "Nigerians abroad, organised into country chapters.",
  },
];

export interface NgState {
  name: string;
  code: string;
  zone: ZoneCode;
}

/** All 36 states plus the Federal Capital Territory. */
export const states: NgState[] = [
  { name: "Abia", code: "AB", zone: "SE" },
  { name: "Adamawa", code: "AD", zone: "NE" },
  { name: "Akwa Ibom", code: "AK", zone: "SS" },
  { name: "Anambra", code: "AN", zone: "SE" },
  { name: "Bauchi", code: "BA", zone: "NE" },
  { name: "Bayelsa", code: "BY", zone: "SS" },
  { name: "Benue", code: "BE", zone: "NC" },
  { name: "Borno", code: "BO", zone: "NE" },
  { name: "Cross River", code: "CR", zone: "SS" },
  { name: "Delta", code: "DE", zone: "SS" },
  { name: "Ebonyi", code: "EB", zone: "SE" },
  { name: "Edo", code: "ED", zone: "SS" },
  { name: "Ekiti", code: "EK", zone: "SW" },
  { name: "Enugu", code: "EN", zone: "SE" },
  { name: "Federal Capital Territory", code: "FC", zone: "NC" },
  { name: "Gombe", code: "GO", zone: "NE" },
  { name: "Imo", code: "IM", zone: "SE" },
  { name: "Jigawa", code: "JI", zone: "NW" },
  { name: "Kaduna", code: "KD", zone: "NW" },
  { name: "Kano", code: "KN", zone: "NW" },
  { name: "Katsina", code: "KT", zone: "NW" },
  { name: "Kebbi", code: "KE", zone: "NW" },
  { name: "Kogi", code: "KO", zone: "NC" },
  { name: "Kwara", code: "KW", zone: "NC" },
  { name: "Lagos", code: "LA", zone: "SW" },
  { name: "Nasarawa", code: "NA", zone: "NC" },
  { name: "Niger", code: "NI", zone: "NC" },
  { name: "Ogun", code: "OG", zone: "SW" },
  { name: "Ondo", code: "ON", zone: "SW" },
  { name: "Osun", code: "OS", zone: "SW" },
  { name: "Oyo", code: "OY", zone: "SW" },
  { name: "Plateau", code: "PL", zone: "NC" },
  { name: "Rivers", code: "RI", zone: "SS" },
  { name: "Sokoto", code: "SO", zone: "NW" },
  { name: "Taraba", code: "TA", zone: "NE" },
  { name: "Yobe", code: "YO", zone: "NE" },
  { name: "Zamfara", code: "ZA", zone: "NW" },
];

export const statesByCode = new Map(states.map((s) => [s.code, s]));

export function statesInZone(zone: ZoneCode): NgState[] {
  return states.filter((s) => s.zone === zone);
}

export function zoneByCode(code: string): Zone | undefined {
  return zones.find((z) => z.code === code);
}

/** Slug used in /structure URLs, e.g. "cross-river". */
export function stateSlug(state: NgState): string {
  return state.name.toLowerCase().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// LGA / ward detail
//
// Only two states currently carry imported LGA data. The remaining 35 are
// pending the official INEC register — see docs/TODO-real-data.md. Nothing in
// the UI may imply coverage the movement does not have.
// ---------------------------------------------------------------------------

export interface Ward {
  name: string;
  code: string;
  placeholder?: boolean;
}

export interface Lga {
  name: string;
  code: string;
  wards: Ward[];
}

export interface StateGeography {
  name: string;
  code: string;
  lgas: Lga[];
}

export const statesWithLgaData: StateGeography[] = lgaData.states;

export const lgaDataMeta = lgaData._meta;

export function lgasForState(code: string): Lga[] | null {
  return statesWithLgaData.find((s) => s.code === code)?.lgas ?? null;
}

/** True when the repository holds LGA/ward records for a state. */
export function hasLgaData(code: string): boolean {
  return statesWithLgaData.some((s) => s.code === code);
}
