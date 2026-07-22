# Placeholder data — what is real and what still is not

Nothing in the UI is presented as fact unless it is one. This file records
exactly where the line sits.

## Geography — now real

The full INEC polling-unit register is loaded, derived from the
[Nigeria 2.0 2023 Electoral Sheets Collation](https://forensic.nigeria2.com/).

| Item | Status | Notes |
|---|---|---|
| 36 states + FCT | **Real** | Names, codes, zone assignments. |
| LGAs | **Real** | **774** — exactly Nigeria's official count. |
| Wards | **Real** | 8,874. Official figure is ~8,809; the ~65 extra are almost certainly spelling variants of the same ward appearing as distinct entries. |
| Polling units | **Real** | 176,379 unique PU codes. |
| Registered voters | **Real (2023)** | 86,511,582 across units whose sheet was located. INEC's official 2023 register was ~93.4M; the gap is the 13,317 units with no sheet found. |

**Confidence checks that passed:** LGA count is exactly 774; national turnout
computes to 26.9% against INEC's official 27.1%; the validated-sheet count
(123,918) matches the source's own published figure exactly.

**Remaining action:** de-duplicate the ~65 ward-name variants against an
authoritative INEC ward list. Low priority — it does not affect any count shown
to users, only the ward dropdown on `/join`.

## Party vote counts — deliberately excluded

The source CSVs contain `APC`, `LP`, `PDP` and `NNPP` columns. **They are not
published on this site and must not be added.**

| Party | Dataset | Official 2023 | Coverage |
|---|---|---|---|
| APC | 7,236,892 | 8,794,726 | 82% |
| LP | 5,309,609 | 6,101,533 | 87% |
| PDP | 5,291,517 | 6,984,520 | 76% |
| NNPP | 1,532,290 | 1,496,687 | **102%** |

Coverage is also wildly uneven by state — Lagos had 11,911 sheets validated,
Zamfara 70 out of 3,529 (about 2%). NNPP exceeding 100% shows transcription
noise on top of incompleteness.

Republishing these as "2023 results" on a movement website would put numbers in
circulation that are trivially disproved, and would break the movement's own
rule that facts are marked verified or unverified and never confused.
`scripts/build-geography.mjs` reads the columns only to discard them.

For official results, INEC is the source.

## Roster

| Item | Status | Notes |
|---|---|---|
| National executives | **Real, names only** | 25 from the framework circular + National Youth Leader from the unveiling. |
| Officer phone numbers | **Not stored** | Deliberately absent from the repository. Load into `officer_contacts` in Supabase via a private admin import. |
| Zonal coordinators | **Real** | 4 of 6 filled; North-West and North-East open. |
| State coordinators | **Real** | 14 of 37 filled. Abia was blank in the unveiling and is recorded vacant. |
| LGA / ward / unit officers | **None yet** | Appointed by each State Coordinator. |

## Framework reconciliation

The circular numbers **25** national offices; the unveiling also names a
**National Youth Leader**. It is seeded with `frameworkAddendum: true` and shown
with a "Framework addendum" badge rather than silently resolved.

**Action:** confirm with the National Secretary whether it becomes office 26.

Two offices have overlapping mandates and should be confirmed distinct:
**#9 Director of Mobilization, Elections & Campaign Strategy** (vacant) and
**#24 Director of Contacts & Adhoc/PUA** (filled).

## Content

| Item | Status | Notes |
|---|---|---|
| 6-Month Victory Action Plan | **Structure real, dates illustrative** | Four phases and pillars are from the official artwork. Week milestones are a working plan, not ratified dates. |
| Weekly rhythm | **Real** | The movement's published Mon–Sun schedule. |
| Merchandise ordering contact | **Absent** | `/store` shows "ordering contact not yet published" rather than an invented number. |
| Market/Trade board | **Real mechanism** | Listings carry the poster's own contact; the movement publishes no central number. |
| Civic lessons | **Real** | Eight lessons, unchanged. |

## Numbers shown in the UI

Every membership, PVC and coverage count comes from the database or the roster
file. **None are hard-coded.** Before Supabase is provisioned these render as
honest empty states ("no members registered yet"), never as a placeholder
figure. 2023 baseline figures are computed at build time from the dataset.

## Configuration that does not follow the base path

`public/manifest.json` is static JSON and cannot read the environment, so its
`start_url`, `scope` and icon paths hard-code `/OK2027`. Update by hand for a
custom domain. Everything else follows `NEXT_PUBLIC_BASE_PATH`.

## Known budget exception

`/join` builds to ~195 kB of first-load JS, above the ~150 kB target — it is
`react-hook-form` + `zod` + the Radix select/checkbox primitives the
registration form needs. Every other route is at or under budget. Per-state
geography is fetched on demand (6–25 kB) rather than bundled, which is what
keeps it from being far worse.
