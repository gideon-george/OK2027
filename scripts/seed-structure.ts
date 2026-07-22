// Seeds NOkM offices and appointments from data/nokm-structure.json.
//
// IMPORTANT: this script seeds names and roles only. Officer phone numbers are
// never stored in this repository. Load them separately into officer_contacts
// with scripts/import-officer-contacts.ts, which reads an uncommitted local
// file. See docs/nokm-framework.md §7.
//
// Usage:
//   npm run db:seed:structure              -- seeds against .env.local credentials
//   npm run db:seed:structure -- --dry-run -- validates and prints counts only
//
// Falls back to a dry run automatically when credentials are absent, so it
// never silently no-ops.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

try {
  process.loadEnvFile(path.join(projectRoot, ".env.local"));
} catch {
  // No .env.local -- dry run below.
}

interface Office {
  slug: string;
  title: string;
  shortTitle: string;
  scopeLevel: string;
  rank: number;
  mandate: string;
  duties: string[];
  kpis: string[];
  frameworkAddendum?: boolean;
}

interface RawAppointment {
  office: string;
  scopeType: "national" | "zone" | "state" | "diaspora";
  scopeCode: string;
  holderName: string | null;
  status: string;
}

interface StructureData {
  _meta: Record<string, string>;
  offices: Office[];
  appointments: RawAppointment[];
}

const ZONE_CODES = ["NC", "NE", "NW", "SE", "SS", "SW"];

const STATE_CODES = [
  "AB", "AD", "AK", "AN", "BA", "BY", "BE", "BO", "CR", "DE",
  "EB", "ED", "EK", "EN", "FC", "GO", "IM", "JI", "KD", "KN",
  "KT", "KE", "KO", "KW", "LA", "NA", "NI", "OG", "ON", "OS",
  "OY", "PL", "RI", "SO", "TA", "YO", "ZA",
];

function load(): StructureData {
  const raw = fs.readFileSync(
    path.join(projectRoot, "data", "nokm-structure.json"),
    "utf-8"
  );
  return JSON.parse(raw) as StructureData;
}

function appointmentSlug(
  officeSlug: string,
  scopeType: string,
  scopeCode: string
): string {
  if (scopeType === "national" || scopeType === "diaspora") return officeSlug;
  return `${officeSlug}-${scopeCode.toLowerCase()}`;
}

/**
 * Every zone and state has a coordinator post whether or not anyone holds it.
 * Generating the vacant ones is what makes /vacancies work — a post that does
 * not exist cannot be applied for.
 */
function buildAppointments(data: StructureData): RawAppointment[] {
  const seeded = data.appointments;
  const seen = new Set(
    seeded.map((a) => appointmentSlug(a.office, a.scopeType, a.scopeCode))
  );
  const generated: RawAppointment[] = [];

  for (const code of ZONE_CODES) {
    const slug = appointmentSlug("zonal-coordinator", "zone", code);
    if (!seen.has(slug)) {
      generated.push({
        office: "zonal-coordinator",
        scopeType: "zone",
        scopeCode: code,
        holderName: null,
        status: "vacant",
      });
    }
  }

  for (const code of STATE_CODES) {
    const slug = appointmentSlug("state-coordinator", "state", code);
    if (!seen.has(slug)) {
      generated.push({
        office: "state-coordinator",
        scopeType: "state",
        scopeCode: code,
        holderName: null,
        status: "vacant",
      });
    }
  }

  return [...seeded, ...generated];
}

async function seedForReal(data: StructureData, appointments: RawAppointment[]) {
  const supabase: SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  console.log("[seed-structure] Seeding offices...");
  const officeRows = data.offices.map((o) => ({
    slug: o.slug,
    title: o.title,
    short_title: o.shortTitle,
    scope_level: o.scopeLevel,
    rank: o.rank,
    mandate: o.mandate,
    duties: o.duties,
    kpi_defs: o.kpis,
    framework_addendum: o.frameworkAddendum ?? false,
  }));

  const { error: officeError } = await supabase
    .from("offices")
    .upsert(officeRows, { onConflict: "slug" });
  if (officeError) {
    throw new Error(`Upsert into offices failed: ${officeError.message}`);
  }

  const { data: officeIdRows, error: officeFetchError } = await supabase
    .from("offices")
    .select("id, slug");
  if (officeFetchError) {
    throw new Error(`Fetching offices failed: ${officeFetchError.message}`);
  }
  const officeIds = new Map(
    (officeIdRows ?? []).map((r: { id: string; slug: string }) => [r.slug, r.id])
  );

  console.log("[seed-structure] Seeding appointments...");
  const appointmentRows = appointments.map((a) => ({
    slug: appointmentSlug(a.office, a.scopeType, a.scopeCode),
    office_id: officeIds.get(a.office),
    // The JSON says "zone"; the office_scope_level enum member is "zonal".
    scope_type: a.scopeType === "zone" ? "zonal" : a.scopeType,
    // National posts have no geographic scope.
    scope_code: a.scopeType === "national" ? null : a.scopeCode,
    holder_name: a.holderName,
    status: a.status,
  }));

  const { error: appointmentError } = await supabase
    .from("appointments")
    .upsert(appointmentRows, { onConflict: "slug" });
  if (appointmentError) {
    throw new Error(
      `Upsert into appointments failed: ${appointmentError.message}`
    );
  }

  return { offices: officeRows.length, appointments: appointmentRows.length };
}

function printDryRun(
  data: StructureData,
  appointments: RawAppointment[],
  reason: string
) {
  const filled = appointments.filter((a) => a.holderName).length;
  const vacant = appointments.length - filled;

  console.log(`\n[seed-structure] DRY RUN (${reason}) -- no database touched.\n`);
  console.log("Would seed:");
  console.log(`  offices:       ${data.offices.length}`);
  console.log(`  appointments:  ${appointments.length}`);
  console.log(`    filled:      ${filled}`);
  console.log(`    vacant:      ${vacant}`);
  console.log(`\nSource note (data/nokm-structure.json _meta):`);
  for (const [k, v] of Object.entries(data._meta)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(
    "\n⚠️  Officer phone numbers are NOT in this repository and are NOT seeded here."
  );
  console.log(
    "   Load them into officer_contacts from a local, uncommitted file.\n"
  );
}

async function main() {
  const data = load();
  const appointments = buildAppointments(data);

  const explicitDryRun = process.argv.includes("--dry-run");
  const hasCredentials = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (explicitDryRun || !hasCredentials) {
    printDryRun(
      data,
      appointments,
      explicitDryRun ? "--dry-run flag" : "no Supabase credentials in .env.local"
    );
    return;
  }

  const counts = await seedForReal(data, appointments);
  console.log("\n[seed-structure] Done. Seeded:", counts);
}

main().catch((err) => {
  console.error("[seed-structure] Failed:", err);
  process.exit(1);
});
