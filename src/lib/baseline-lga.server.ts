import fs from "node:fs";
import path from "node:path";

/**
 * Per-LGA 2023 baseline, read from disk at build time.
 *
 * Server-only by design: 37 files totalling ~184 kB. Reading the one file a
 * page needs keeps them out of every other route's bundle. Never import this
 * from a client component.
 */

export interface LgaBaseline {
  name: string;
  code: string;
  wards: number;
  pollingUnits: number;
  registered: number;
  accredited: number;
  validated: number;
  unsure: number;
  notFound: number;
}

interface StateLgaFile {
  code: string;
  name: string;
  lgas: LgaBaseline[];
}

const dir = path.join(process.cwd(), "data", "baseline-lga");

export function lgaBaselineForState(code: string): LgaBaseline[] {
  const file = path.join(dir, `${code}.json`);
  if (!fs.existsSync(file)) return [];
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as StateLgaFile;
  return parsed.lgas;
}
