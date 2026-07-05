// Generates data/inec-pilot.json for the FCT + Anambra pilot.
//
// LGA names are real (well-documented, low risk of error). Ward names are
// NOT sourced from INEC -- INEC's actual ward-level register was not
// available to pull from in this environment, so wards are generated
// placeholders (`"placeholder": true` on every ward) using a deterministic
// "<LGA> Ward NN" naming scheme, purely so the geographic hierarchy has
// something to seed.
//
// TODO(real-data): before opening signups nationally (or even for the FCT/
// Anambra pilot in earnest), replace the `wards` arrays below with the real
// INEC register of wards (and polling units) for these LGAs. Source: INEC's
// published polling unit register / delimitation of constituencies.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLACEHOLDER_WARDS_PER_LGA = 8;

function slugCode(...parts) {
  return parts
    .join("-")
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-");
}

const DIRECTIONS = new Set(["North", "South", "East", "West"]);

function lgaAbbreviation(lgaName) {
  const words = lgaName.split(" ");
  const last = words[words.length - 1];
  if (words.length > 1 && DIRECTIONS.has(last)) {
    const stem = words.slice(0, -1).join("").slice(0, 3);
    return `${stem}${last[0]}`;
  }
  return words.join("").slice(0, 4);
}

function assertUnique(label, values) {
  const seen = new Set();
  for (const v of values) {
    if (seen.has(v)) {
      throw new Error(`Duplicate ${label}: ${v}`);
    }
    seen.add(v);
  }
}

function makePlaceholderWards(lgaCode, lgaName) {
  const wards = [];
  for (let i = 1; i <= PLACEHOLDER_WARDS_PER_LGA; i++) {
    const num = String(i).padStart(2, "0");
    wards.push({
      name: `${lgaName} Ward ${num}`,
      code: slugCode(lgaCode, "W", num),
      placeholder: true,
    });
  }
  return wards;
}

const fctLgaNames = ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"];

const anambraLgaNames = [
  "Aguata",
  "Anambra East",
  "Anambra West",
  "Anaocha",
  "Awka North",
  "Awka South",
  "Ayamelum",
  "Dunukofia",
  "Ekwusigo",
  "Idemili North",
  "Idemili South",
  "Ihiala",
  "Njikoka",
  "Nnewi North",
  "Nnewi South",
  "Ogbaru",
  "Onitsha North",
  "Onitsha South",
  "Orumba North",
  "Orumba South",
  "Oyi",
];

function buildState(stateName, stateCode, lgaNames) {
  return {
    name: stateName,
    code: stateCode,
    lgas: lgaNames.map((lgaName) => {
      const lgaCode = slugCode(stateCode, lgaAbbreviation(lgaName));
      return {
        name: lgaName,
        code: lgaCode,
        wards: makePlaceholderWards(lgaCode, lgaName),
      };
    }),
  };
}

const data = {
  _meta: {
    generated_by: "scripts/generate-inec-pilot-placeholder.mjs",
    lga_names: "real",
    ward_names: "placeholder",
    polling_units: "generated at seed time, placeholder",
    todo: "Replace ward (and polling unit) data with the real INEC register before this pilot's data is treated as authoritative or before national rollout.",
  },
  states: [
    buildState("Federal Capital Territory", "FC", fctLgaNames),
    buildState("Anambra", "AN", anambraLgaNames),
  ],
};

assertUnique(
  "state code",
  data.states.map((s) => s.code)
);
assertUnique(
  "LGA code",
  data.states.flatMap((s) => s.lgas.map((l) => l.code))
);
assertUnique(
  "ward code",
  data.states.flatMap((s) => s.lgas.flatMap((l) => l.wards.map((w) => w.code)))
);

const outPath = path.join(__dirname, "..", "data", "inec-pilot.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${outPath}`);
console.log(
  `${data.states.length} states, ${data.states.reduce((n, s) => n + s.lgas.length, 0)} LGAs, ${data.states.reduce(
    (n, s) => n + s.lgas.reduce((m, l) => m + l.wards.length, 0),
    0
  )} placeholder wards`
);
