// Seeds the NOkM geographic hierarchy, group spaces, civic education lessons,
// and badge catalog.
//
// NATIONAL SCOPE: zones, all 36 states + FCT, all 774 LGAs and all 8,874 wards
// are seeded from public/geo/<CODE>.json, which is built by
// scripts/build-geography.mjs from INEC's polling-unit register.
//
// Polling units (176,379 of them) are NOT seeded here. They are not needed for
// registration -- /join places members down to ward level -- and they would add
// ~176k rows plus a group space each. Seed them separately if and when unit
// level organising begins.
//
// Usage:
//   npm run db:seed              -- seeds against NEXT_PUBLIC_SUPABASE_URL /
//                                    SUPABASE_SERVICE_ROLE_KEY from .env.local
//   npm run db:seed -- --dry-run -- parses/validates data and prints counts
//                                    without touching a database
//
// If Supabase credentials are not present in the environment, the script
// automatically falls back to --dry-run so it never silently no-ops.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

try {
  // Node 20.6+: loads KEY=VALUE pairs into process.env without a dependency.
  process.loadEnvFile(path.join(projectRoot, ".env.local"));
} catch {
  // No .env.local present -- fine, we'll fall back to dry-run below.
}

interface GeoWard {
  name: string;
  code: string;
}

interface GeoLga {
  name: string;
  code: string;
  wards: GeoWard[];
}

interface GeoState {
  name: string;
  code: string;
  lgas: GeoLga[];
}

const ZONES = [
  { name: "North Central", code: "NC" },
  { name: "North East", code: "NE" },
  { name: "North West", code: "NW" },
  { name: "South East", code: "SE" },
  { name: "South South", code: "SS" },
  { name: "South West", code: "SW" },
  { name: "Diaspora", code: "DIASPORA" },
] as const;

const STATES: { name: string; code: string; zoneCode: string }[] = [
  { name: "Benue", code: "BE", zoneCode: "NC" },
  { name: "Kogi", code: "KO", zoneCode: "NC" },
  { name: "Kwara", code: "KW", zoneCode: "NC" },
  { name: "Nasarawa", code: "NA", zoneCode: "NC" },
  { name: "Niger", code: "NI", zoneCode: "NC" },
  { name: "Plateau", code: "PL", zoneCode: "NC" },
  { name: "Federal Capital Territory", code: "FC", zoneCode: "NC" },

  { name: "Adamawa", code: "AD", zoneCode: "NE" },
  { name: "Bauchi", code: "BA", zoneCode: "NE" },
  { name: "Borno", code: "BO", zoneCode: "NE" },
  { name: "Gombe", code: "GO", zoneCode: "NE" },
  { name: "Taraba", code: "TA", zoneCode: "NE" },
  { name: "Yobe", code: "YO", zoneCode: "NE" },

  { name: "Jigawa", code: "JI", zoneCode: "NW" },
  { name: "Kaduna", code: "KD", zoneCode: "NW" },
  { name: "Kano", code: "KN", zoneCode: "NW" },
  { name: "Katsina", code: "KT", zoneCode: "NW" },
  { name: "Kebbi", code: "KE", zoneCode: "NW" },
  { name: "Sokoto", code: "SO", zoneCode: "NW" },
  { name: "Zamfara", code: "ZA", zoneCode: "NW" },

  { name: "Abia", code: "AB", zoneCode: "SE" },
  { name: "Anambra", code: "AN", zoneCode: "SE" },
  { name: "Ebonyi", code: "EB", zoneCode: "SE" },
  { name: "Enugu", code: "EN", zoneCode: "SE" },
  { name: "Imo", code: "IM", zoneCode: "SE" },

  { name: "Akwa Ibom", code: "AK", zoneCode: "SS" },
  { name: "Bayelsa", code: "BY", zoneCode: "SS" },
  { name: "Cross River", code: "CR", zoneCode: "SS" },
  { name: "Delta", code: "DE", zoneCode: "SS" },
  { name: "Edo", code: "ED", zoneCode: "SS" },
  { name: "Rivers", code: "RI", zoneCode: "SS" },

  { name: "Ekiti", code: "EK", zoneCode: "SW" },
  { name: "Lagos", code: "LA", zoneCode: "SW" },
  { name: "Ogun", code: "OG", zoneCode: "SW" },
  { name: "Ondo", code: "ON", zoneCode: "SW" },
  { name: "Osun", code: "OS", zoneCode: "SW" },
  { name: "Oyo", code: "OY", zoneCode: "SW" },
];

const GEO_DIR = path.join(projectRoot, "public", "geo");

const LESSONS = [
  {
    slug: "getting-your-pvc",
    title: "Getting Your PVC",
    order_index: 1,
    body_md:
      "# Getting Your PVC\n\nYour Permanent Voter's Card (PVC) is what lets you vote. Learn where to register, what documents you need, and how to check your registration status with INEC.",
  },
  {
    slug: "how-elections-work",
    title: "How INEC Elections Work",
    order_index: 2,
    body_md:
      "# How INEC Elections Work\n\nAn overview of Nigeria's election cycle: who INEC is, what BVAS does, how results move from the polling unit to the final collation.",
  },
  {
    slug: "your-polling-unit-explained",
    title: "Your Polling Unit, Explained",
    order_index: 3,
    body_md:
      "# Your Polling Unit, Explained\n\nWhat a polling unit is, how to find yours, and why knowing it matters for both voting and organizing with neighbors.",
  },
  {
    slug: "how-to-vote-on-election-day",
    title: "How to Vote on Election Day",
    order_index: 4,
    body_md:
      "# How to Vote on Election Day\n\nA step-by-step walkthrough of accreditation, thumbprinting, and casting your ballot -- so nothing on the day catches you off guard.",
  },
  {
    slug: "understanding-bvas-and-results",
    title: "Understanding BVAS and Result Verification",
    order_index: 5,
    body_md:
      "# Understanding BVAS and Result Verification\n\nWhat the Bimodal Voter Accreditation System does, how results (Form EC8A) are uploaded, and how to read a result sheet.",
  },
  {
    slug: "peaceful-observation",
    title: "Peaceful Observation: What You Can (and Can't) Do",
    order_index: 6,
    body_md:
      "# Peaceful Observation: What You Can (and Can't) Do\n\nHow to document what you see at your polling unit calmly and lawfully: photos, timestamps, and staying safe. This app never encourages confrontation.",
  },
  {
    slug: "organizing-your-ward",
    title: "Organizing Your Ward: From Chat to Action",
    order_index: 7,
    body_md:
      "# Organizing Your Ward: From Chat to Action\n\nHow to use your ward's group space to plan meetups, share civic education, and turn conversation into participation.",
  },
  {
    slug: "election-day-safety",
    title: "Election Day Safety and De-escalation",
    order_index: 8,
    body_md:
      "# Election Day Safety and De-escalation\n\nHow to stay safe, avoid confrontation, and de-escalate tense moments at or near a polling unit.",
  },
];

const BADGES = [
  {
    slug: "verified-voter",
    name: "Verified Voter",
    emoji: "✅",
    description: "Verified your PVC with OK2027.",
  },
  {
    slug: "pu-champion",
    name: "PU Champion",
    emoji: "🛡️",
    description: "Claimed and represents a polling unit.",
  },
  {
    slug: "recruiter",
    name: "Recruiter",
    emoji: "📣",
    description: "Brought new members into the community.",
  },
  {
    slug: "civic-scholar",
    name: "Civic Scholar",
    emoji: "🎓",
    description: "Completed all civic education lessons.",
  },
  {
    slug: "day-one",
    name: "Day-One",
    emoji: "🌱",
    description: "Joined during the pilot phase.",
  },
  {
    slug: "election-day-hero",
    name: "Election-Day Hero",
    emoji: "🦸",
    description: "Actively participated on election day.",
  },
];

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function loadGeography(): GeoState[] {
  if (!fs.existsSync(GEO_DIR)) {
    throw new Error(
      `Missing ${GEO_DIR}. Run: node scripts/build-geography.mjs <dataset-dir>`
    );
  }
  return fs
    .readdirSync(GEO_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(GEO_DIR, f), "utf-8")) as GeoState)
    .sort((a, b) => a.code.localeCompare(b.code));
}

interface Counts {
  zones: number;
  states: number;
  lgas: number;
  wards: number;
  groupSpaces: number;
  lessons: number;
  badges: number;
}

function computeCounts(geo: GeoState[]): Counts {
  const lgaCount = geo.reduce((n, s) => n + s.lgas.length, 0);
  const wardCount = geo.reduce(
    (n, s) => n + s.lgas.reduce((m, l) => m + l.wards.length, 0),
    0
  );
  return {
    zones: ZONES.length,
    states: STATES.length,
    lgas: lgaCount,
    wards: wardCount,
    groupSpaces: ZONES.length + STATES.length + lgaCount + wardCount,
    lessons: LESSONS.length,
    badges: BADGES.length,
  };
}

function printDryRunReport(geo: GeoState[], counts: Counts, reason: string) {
  console.log(`\n[seed-geo] DRY RUN (${reason}) -- no database was touched.\n`);
  console.log("Would seed:");
  console.log(`  zones:          ${counts.zones}`);
  console.log(`  states:         ${counts.states}`);
  console.log(`  lgas:           ${counts.lgas}`);
  console.log(`  wards:          ${counts.wards}`);
  console.log(`  group_spaces:   ${counts.groupSpaces}`);
  console.log(`  lessons:        ${counts.lessons}`);
  console.log(`  badges:         ${counts.badges}`);
  console.log(`\n  states with geography loaded: ${geo.length}`);
  console.log(
    "\nGeography is derived from INEC's polling-unit register via the Nigeria 2.0"
  );
  console.log(
    "2023 collation. Polling units themselves are not seeded -- see the header."
  );
  console.log(
    "\nTo run for real: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then run `npm run db:seed`.\n"
  );
}

async function upsert(
  supabase: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
) {
  for (const batch of chunk(rows, 500)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) {
      throw new Error(`Upsert into ${table} failed: ${error.message}`);
    }
  }
}

async function fetchIdMap(
  supabase: SupabaseClient,
  table: string,
  keyColumn: string
): Promise<Map<string, string>> {
  const { data, error } = (await supabase.from(table).select(`id, ${keyColumn}`)) as unknown as {
    data: Record<string, string>[] | null;
    error: { message: string } | null;
  };
  if (error) {
    throw new Error(`Fetching ${table} failed: ${error.message}`);
  }
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row[keyColumn], row.id);
  }
  return map;
}

async function seedForReal(geo: GeoState[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log("[seed-geo] Seeding zones...");
  await upsert(supabase, "zones", [...ZONES], "code");
  const zoneIds = await fetchIdMap(supabase, "zones", "code");

  console.log("[seed-geo] Seeding states...");
  await upsert(
    supabase,
    "states",
    STATES.map((s) => ({ name: s.name, code: s.code, zone_id: zoneIds.get(s.zoneCode) })),
    "code"
  );
  const stateIds = await fetchIdMap(supabase, "states", "code");

  console.log(`[seed-geo] Seeding LGAs (${geo.length} states)...`);
  const lgaRows = geo.flatMap((s) =>
    s.lgas.map((l) => ({ name: l.name, code: l.code, state_id: stateIds.get(s.code) }))
  );
  await upsert(supabase, "lgas", lgaRows, "code");
  const lgaIds = await fetchIdMap(supabase, "lgas", "code");

  console.log("[seed-geo] Seeding wards...");
  const wardRows = geo.flatMap((s) =>
    s.lgas.flatMap((l) =>
      l.wards.map((w) => ({ name: w.name, code: w.code, lga_id: lgaIds.get(l.code) }))
    )
  );
  await upsert(supabase, "wards", wardRows, "code");

  console.log("[seed-geo] Creating group spaces...");
  const groupSpaceRows: { scope_type: string; scope_id: string; name: string }[] = [];
  for (const z of ZONES) {
    groupSpaceRows.push({ scope_type: "zone", scope_id: zoneIds.get(z.code)!, name: z.name });
  }
  for (const s of STATES) {
    groupSpaceRows.push({ scope_type: "state", scope_id: stateIds.get(s.code)!, name: s.name });
  }
  const wardIds = await fetchIdMap(supabase, "wards", "code");
  for (const s of geo) {
    for (const l of s.lgas) {
      groupSpaceRows.push({ scope_type: "lga", scope_id: lgaIds.get(l.code)!, name: l.name });
      for (const w of l.wards) {
        groupSpaceRows.push({ scope_type: "ward", scope_id: wardIds.get(w.code)!, name: w.name });
      }
    }
  }
  await upsert(supabase, "group_spaces", groupSpaceRows, "scope_type,scope_id");

  console.log("[seed-geo] Seeding lessons...");
  await upsert(supabase, "lessons", LESSONS, "slug");

  console.log("[seed-geo] Seeding badges...");
  await upsert(supabase, "badges", BADGES, "slug");

  return computeCounts(geo);
}

async function main() {
  const geo = loadGeography();
  const counts = computeCounts(geo);

  const explicitDryRun = process.argv.includes("--dry-run");
  const hasCredentials = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (explicitDryRun || !hasCredentials) {
    printDryRunReport(
      geo,
      counts,
      explicitDryRun ? "--dry-run flag" : "no Supabase credentials in .env.local"
    );
    return;
  }

  const finalCounts = await seedForReal(geo);
  console.log("\n[seed-geo] Done. Seeded:");
  console.log(finalCounts);
}

main().catch((err) => {
  console.error("[seed-geo] Failed:", err);
  process.exit(1);
});
