// Copies the per-LGA 2023 baseline into public/ so client components can fetch
// one state at a time.
//
// data/baseline-lga/ stays the single source of truth — it is what
// build-geography.mjs writes and what the server-rendered pages read. This
// script only mirrors it, because "Gaps near me" and the adoption flow need
// the same figures in the browser, and serialising all 37 files into page
// props would put ~184 kB on a route that should cost ~5 kB per lookup.
//
// Runs from `prebuild`, so a fresh clone never has to remember it.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "data", "baseline-lga");
const target = path.join(root, "public", "baseline-lga");

if (!fs.existsSync(source)) {
  console.error(`[sync-public-data] missing ${source}`);
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });

const files = fs.readdirSync(source).filter((f) => f.endsWith(".json"));
let bytes = 0;

for (const file of files) {
  // Re-serialised without whitespace: these are fetched over mobile data.
  const parsed = JSON.parse(fs.readFileSync(path.join(source, file), "utf-8"));
  const out = JSON.stringify(parsed);
  fs.writeFileSync(path.join(target, file), out);
  bytes += Buffer.byteLength(out);
}

console.log(
  `[sync-public-data] ${files.length} state files → public/baseline-lga ` +
    `(${Math.round(bytes / 1024)} kB total, ~${Math.round(bytes / files.length / 1024)} kB each)`
);
