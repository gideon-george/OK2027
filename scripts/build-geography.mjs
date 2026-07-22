// Builds NOkM geography and 2023 baseline data from the Nigeria 2.0
// "2023 Electoral Sheets Collation" dataset.
//
//   node scripts/build-geography.mjs <path-to-extracted-dataset-dir>
//
// Produces:
//   data/geo-index.json            national index: states, LGA/ward/PU counts, register
//   data/baseline-2023.json        national + per-state turnout and sheet coverage
//   data/baseline-lga/<CODE>.json  per-LGA breakdown (server-side pages only)
//   public/geo/<CODE>.json         LGAs + wards for one state (fetched by /join)
//
// IMPORTANT — what this script deliberately does NOT emit:
//
// The source CSVs carry per-party vote columns (APC, LP, PDP, NNPP). They are
// an incomplete volunteer transcription: nationally 76-102% of official INEC
// figures, and in some states barely 2% of sheets were validated. Publishing
// them would put numbers on the site that are trivially disprovable. Party
// columns are read only to be ignored. Do not add them.
//
// What IS emitted is the solid part: the polling-unit register (names, codes,
// hierarchy), registered and accredited voters, and how many result sheets
// were validated / flagged unsure / not found.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const STATE_CODES = {
  ABIA: "AB", ADAMAWA: "AD", "AKWA IBOM": "AK", ANAMBRA: "AN", BAUCHI: "BA",
  BAYELSA: "BY", BENUE: "BE", BORNO: "BO", "CROSS RIVER": "CR", DELTA: "DE",
  EBONYI: "EB", EDO: "ED", EKITI: "EK", ENUGU: "EN", FCT: "FC", GOMBE: "GO",
  IMO: "IM", JIGAWA: "JI", KADUNA: "KD", KANO: "KN", KATSINA: "KT",
  KEBBI: "KE", KOGI: "KO", KWARA: "KW", LAGOS: "LA", NASARAWA: "NA",
  NIGER: "NI", OGUN: "OG", ONDO: "ON", OSUN: "OS", OYO: "OY", PLATEAU: "PL",
  RIVERS: "RI", SOKOTO: "SO", TARABA: "TA", YOBE: "YO", ZAMFARA: "ZA",
};

/**
 * CSV parser over a whole document.
 *
 * Must not be line-based: several hundred polling-unit names in this dataset
 * contain literal newlines inside quoted fields, and splitting on \n first
 * shreds those records (441 units went missing that way).
 */
function parseCsv(text) {
  const records = [];
  let record = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ",") {
      record.push(cur);
      cur = "";
    } else if (ch === "\r") {
      // handled by the \n branch
    } else if (ch === "\n") {
      record.push(cur);
      cur = "";
      if (record.some((f) => f !== "")) records.push(record);
      record = [];
    } else cur += ch;
  }

  record.push(cur);
  if (record.some((f) => f !== "")) records.push(record);
  return records;
}

/** Source data has irregular internal spacing, e.g. "ACHINA   I". */
function tidy(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function titleCase(value) {
  return tidy(value)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(I{1,3}|IV|V|VI{0,3}|IX|X)\b/gi, (m) => m.toUpperCase());
}

function toInt(value) {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function slugify(value) {
  return tidy(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main() {
  const sourceDir = process.argv[2];
  if (!sourceDir || !fs.existsSync(sourceDir)) {
    console.error(
      "Usage: node scripts/build-geography.mjs <path-to-extracted-dataset-dir>"
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => f.toLowerCase().endsWith(".csv"));

  if (files.length === 0) {
    console.error(`No CSV files found in ${sourceDir}`);
    process.exit(1);
  }

  // stateCode -> { name, lgas: Map<lgaName, { wards: Map<wardName, ward>, ... }> }
  const states = new Map();
  const seenPu = new Set();
  let duplicatePu = 0;
  let unknownState = 0;

  for (const file of files) {
    const category = path.basename(file).replace(/\.csv$/i, "").split("_").pop();
    if (!["crosschecked", "unsure", "notfound"].includes(category)) continue;

    const text = fs.readFileSync(path.join(sourceDir, file), "utf-8");
    const records = parseCsv(text);
    if (records.length === 0) continue;
    const header = records[0].map((h) => h.trim());
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));

    for (let i = 1; i < records.length; i++) {
      const row = records[i];

      const stateName = tidy(row[idx["State"]]).toUpperCase();
      const code = STATE_CODES[stateName];
      if (!code) {
        unknownState++;
        continue;
      }

      const puCode = tidy(row[idx["PU-Code"]]);
      if (!puCode) continue;
      if (seenPu.has(puCode)) {
        duplicatePu++;
        continue;
      }
      seenPu.add(puCode);

      if (!states.has(code)) {
        states.set(code, { code, name: titleCase(stateName), lgas: new Map() });
      }
      const state = states.get(code);

      const lgaName = titleCase(row[idx["LGA"]]);
      if (!lgaName) continue;
      if (!state.lgas.has(lgaName)) {
        state.lgas.set(lgaName, {
          name: lgaName,
          code: `${code}-${slugify(lgaName)}`,
          wards: new Map(),
          registered: 0,
          accredited: 0,
          pollingUnits: 0,
          validated: 0,
          unsure: 0,
          notFound: 0,
        });
      }
      const lga = state.lgas.get(lgaName);

      const wardName = titleCase(row[idx["Ward"]]);
      if (wardName && !lga.wards.has(wardName)) {
        lga.wards.set(wardName, {
          name: wardName,
          code: `${lga.code}-${slugify(wardName)}`,
          pollingUnits: 0,
          registered: 0,
        });
      }
      const ward = wardName ? lga.wards.get(wardName) : null;

      // "notfound" rows carry zeros because no sheet was located — they are
      // missing data, not a polling unit with no voters. Counting their zeros
      // would understate every register figure on the site.
      const isNotFound = category === "notfound";
      const registered = isNotFound ? 0 : toInt(row[idx["Registered_Voters"]]);
      const accredited = isNotFound ? 0 : toInt(row[idx["Accredited_Voters"]]);

      lga.pollingUnits++;
      lga.registered += registered;
      lga.accredited += accredited;
      if (category === "crosschecked") lga.validated++;
      else if (category === "unsure") lga.unsure++;
      else lga.notFound++;

      if (ward) {
        ward.pollingUnits++;
        ward.registered += registered;
      }
    }
  }

  // --- emit -------------------------------------------------------------

  const geoDir = path.join(projectRoot, "public", "geo");
  const lgaDir = path.join(projectRoot, "data", "baseline-lga");
  fs.mkdirSync(geoDir, { recursive: true });
  fs.mkdirSync(lgaDir, { recursive: true });

  const index = [];
  const baselineStates = [];

  for (const [code, state] of [...states.entries()].sort()) {
    const lgas = [...state.lgas.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const totals = lgas.reduce(
      (acc, l) => ({
        registered: acc.registered + l.registered,
        accredited: acc.accredited + l.accredited,
        pollingUnits: acc.pollingUnits + l.pollingUnits,
        wards: acc.wards + l.wards.size,
        validated: acc.validated + l.validated,
        unsure: acc.unsure + l.unsure,
        notFound: acc.notFound + l.notFound,
      }),
      { registered: 0, accredited: 0, pollingUnits: 0, wards: 0, validated: 0, unsure: 0, notFound: 0 }
    );

    index.push({
      code,
      name: state.name,
      lgas: lgas.length,
      wards: totals.wards,
      pollingUnits: totals.pollingUnits,
      registered: totals.registered,
    });

    baselineStates.push({
      code,
      name: state.name,
      ...totals,
      turnoutPct:
        totals.registered > 0
          ? Math.round((totals.accredited / totals.registered) * 1000) / 10
          : null,
      validatedPct:
        totals.pollingUnits > 0
          ? Math.round((totals.validated / totals.pollingUnits) * 1000) / 10
          : null,
    });

    // Client-fetched by /join: LGA and ward names only, no statistics.
    fs.writeFileSync(
      path.join(geoDir, `${code}.json`),
      JSON.stringify({
        code,
        name: state.name,
        lgas: lgas.map((l) => ({
          name: l.name,
          code: l.code,
          wards: [...l.wards.values()]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((w) => ({ name: w.name, code: w.code })),
        })),
      })
    );

    // Server-side only: per-LGA baseline for /baseline/[state].
    fs.writeFileSync(
      path.join(lgaDir, `${code}.json`),
      JSON.stringify({
        code,
        name: state.name,
        lgas: lgas.map((l) => ({
          name: l.name,
          code: l.code,
          wards: l.wards.size,
          pollingUnits: l.pollingUnits,
          registered: l.registered,
          accredited: l.accredited,
          validated: l.validated,
          unsure: l.unsure,
          notFound: l.notFound,
        })),
      })
    );
  }

  const national = baselineStates.reduce(
    (acc, s) => ({
      registered: acc.registered + s.registered,
      accredited: acc.accredited + s.accredited,
      pollingUnits: acc.pollingUnits + s.pollingUnits,
      wards: acc.wards + s.wards,
      lgas: acc.lgas + 0,
      validated: acc.validated + s.validated,
      unsure: acc.unsure + s.unsure,
      notFound: acc.notFound + s.notFound,
    }),
    { registered: 0, accredited: 0, pollingUnits: 0, wards: 0, lgas: 0, validated: 0, unsure: 0, notFound: 0 }
  );
  national.lgas = index.reduce((n, s) => n + s.lgas, 0);
  national.turnoutPct =
    Math.round((national.accredited / national.registered) * 1000) / 10;

  fs.writeFileSync(
    path.join(projectRoot, "data", "geo-index.json"),
    JSON.stringify(
      {
        _meta: {
          source:
            "Nigeria 2.0 — 2023 General Election Electoral Sheets Collation (https://forensic.nigeria2.com)",
          derivedFrom:
            "Polling-unit result sheets published on INEC's IReV portal, transcribed and cross-checked by Nigeria 2.0 volunteers.",
          note: "Polling-unit names, codes and the ward/LGA hierarchy come from INEC's own register and are reliable. Per-party vote counts in the source are an incomplete transcription and are deliberately NOT included here.",
          builtBy: "scripts/build-geography.mjs",
        },
        states: index,
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(projectRoot, "data", "baseline-2023.json"),
    JSON.stringify(
      {
        _meta: {
          source:
            "Nigeria 2.0 — 2023 General Election Electoral Sheets Collation (https://forensic.nigeria2.com)",
          attribution: "Nigeria 2.0 · Techies for a Better Nigeria",
          resultsPortal: "https://nigeria2.com/elections/results/",
          coverage:
            "Registered and accredited voter figures are summed from polling units where a result sheet was located. Units whose sheet was not found contribute no voters, so state registers here read slightly below INEC's official totals.",
          excluded:
            "Per-party vote counts are NOT published. The source transcription ranges from roughly 76% to over 100% of official national party totals, and in several states under 5% of sheets were validated.",
        },
        national,
        states: baselineStates.sort((a, b) => b.registered - a.registered),
      },
      null,
      2
    )
  );

  console.log("[build-geography] Done.");
  console.log(`  states:         ${index.length}`);
  console.log(`  LGAs:           ${national.lgas}`);
  console.log(`  wards:          ${national.wards}`);
  console.log(`  polling units:  ${national.pollingUnits.toLocaleString()}`);
  console.log(`  registered:     ${national.registered.toLocaleString()}`);
  console.log(`  accredited:     ${national.accredited.toLocaleString()}`);
  console.log(`  turnout:        ${national.turnoutPct}%`);
  console.log(
    `  sheets:         ${national.validated.toLocaleString()} validated · ${national.unsure.toLocaleString()} unsure · ${national.notFound.toLocaleString()} not found`
  );
  if (duplicatePu) console.log(`  duplicate PU codes skipped: ${duplicatePu}`);
  if (unknownState) console.log(`  rows with unrecognised state: ${unknownState}`);
}

main();
