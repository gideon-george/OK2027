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

## Source documents held

Two photographed NOkM letters on official headed paper, supplied 26 July 2026.

| Document | Date | Ref |
|---|---|---|
| Letter of Introduction to the NDC National Secretariat | 3 July 2026 | NDC/NOKM/001/2026 |
| Letter of Request for Registration as an Official Support Group | 17 July 2026 | — |

**What they confirm and add:**

- National Secretariat address: **No. 10 Centenary City, A1, Ebonyi State**. Now
  in `officialContact.secretariat` and in the `PostalAddress` structured data.
- Official email `nokm2026@gmail.com` — matches what was already published.
- NOkM strapline: *"Mobilizing Minds · Inspiring Hope · Building a New Nigeria
  for All"*. Now `site.strapline`.
- NDC motto: *"Service to the People"*.
- Registration application submitted **17 July 2026**, stamped received by the
  NDC Directorate of Support Groups on **22 July 2026**.

**Party affiliation status — stated precisely.** The stamp is an
acknowledgement of receipt, not an approval. `partyAffiliation` records
`acknowledgedByParty` with `recognitionGranted: null`. The site must not say
NOkM is a registered support group until a letter of recognition exists. Even
then, the independence disclaimer stands: a registered support group is still
not an organ of the party.

### Conflicts these documents create — UNRESOLVED

**1. Named officeholders.** The letters are signed by people the roster does
not have in those seats:

| Office | Roster (`data/nokm-structure.json`) | Letter signatory, July 2026 |
|---|---|---|
| National Secretary | Emmanuel Chigoziri Okorie | Comrd. Nathaniel Adepoju |
| National Legal Adviser | Amb. Chief Bar. Victor Opurum | *(name not legible in the photograph)* |

Not changed. A named officeholder is not overwritten on the strength of a
photograph — either the roster is stale or the signatory was acting.
**Action: National Secretary to confirm which is current, and from what date.**

**2. Coverage figures.** The 3 July letter and the 26 July declaration disagree,
and the earlier document claims *more*:

| Level | Letter, 3 July 2026 | Declared, 26 July 2026 |
|---|---|---|
| National executives | 28 | 28 ✓ |
| Zonal leaders | 6 | 6 ✓ |
| State coordinators | "36 + FCT" | 26 |
| LGA coordinators | 774 | 544 |
| Members | "over 5k+" | not declared |

**Resolved as a presentation decision, 26 July 2026: show both, labelled.**

The letter figures are held in an `organisedFor` field on the `state` and `lga`
levels, with their own source and date, and render beneath the declared count
as *"774 organised to cover — NOkM letter to the NDC, 3 July 2026"*. They are
never substituted into `declared`, never used for the gap arithmetic, and never
drive the map. The same build guard applies to them: an `organisedFor` figure
larger than the country fails the build.

The reading behind the labels — that the letter describes the structure the
movement is organised to cover while the declaration counts posts actually
filled — is still an inference. **Action: National Secretariat to confirm.**

**Membership: deliberately not published.** The 3 July letter mentions "over
5k+ members". It is not on the site and no membership figure is, because 5,000
members cannot sit alongside 124,258 polling-unit canvassers — one of those two
numbers means something other than it appears to. **Action: leadership to
confirm what the membership figure counts and as of when.** Until then the site
shows no national membership total.

**National Secretary and Legal Adviser: left as the roster has them**, pending
confirmation from the Secretariat.

## Declared coverage vs the named roster — Wave 4

National Coordination declared the movement's national footprint on
**26 July 2026**. Those figures live in `data/nokm-coverage-declared.json` and
are rendered through `DeclaredFigure`, which always prints the source, the date
and — where they differ — the count actually named on the public roster.

| Level | Declared | Named on the roster | Unnamed |
|---|---:|---:|---:|
| National executives | 28 | 24 | **4** |
| Diaspora coordinators | 3 | 1 | **2** |
| Zonal coordinators | 6 | 4 | **2** |
| State coordinators | 26 | 14 | **12** |
| LGA coordinators | 544 | 0 | **544** |
| Ward executives | 6,191 | 0 | **6,191** |
| Polling unit canvassers | 124,258 | 0 | **124,258** |

Both columns are true statements about different things. The declared figure is
the movement's own operational count; the roster figure is how many people are
named in `data/nokm-structure.json`. **Neither is ever averaged into the other,
and the flattering one is never shown alone.**

**Action for leadership:** supply names for the 4 unnamed national executives,
the 2 diaspora coordinators and the 12 state coordinators so the roster can be
reconciled. LGA, ward and unit officers are appointed locally and will arrive
through the database rather than the seed file.

**Build-time guard.** `src/lib/coverage.ts` throws if a declared figure exceeds
its universe, or if a universe in the JSON disagrees with the loaded INEC
register. A count larger than the number of polling units in Nigeria is a
data-entry error, not a fact.

**The `asOf` date** is when the figures were *received*, not a confirmed census
date. Leadership to confirm when each count was actually taken.

**Ward universe.** The declared file uses INEC's official **8,809** wards rather
than the 8,874 ward names in the loaded register, so the gap is not understated
by ~65 suspected spelling variants. That level is exempted from the universe
cross-check, with a comment saying why.

## Polling unit identities — a real gap

**The register in this repository carries polling-unit *counts*, not polling-unit
*identities*.**

- `data/baseline-lga/*.json` → `pollingUnits: 485` for Bwari.
- `public/geo/*.json` → state → LGA → ward, and stops.
- INEC's unit-by-unit list, with codes and names, **is not here.**

Consequences, all handled rather than papered over:

| Feature | How it copes |
|---|---|
| Adopt a polling unit | Anchored to a **ward** from the register, plus a unit label the member types as it is written at their own unit. Stored unverified until an LGA Coordinator confirms it. |
| Gaps near me | Shows real LGA figures and the LGA's **average** units per ward, explicitly labelled as an average, never as a count for the selected ward. |
| Coverage map | Colours by things that ARE known. Below state level it renders "not yet reported" rather than an assumed absence. |

**Action:** obtain INEC's polling-unit register with codes. Then unit adoption
can validate against it and `pu_label` becomes a foreign key.

## Constituency delimitation — the aspirants blocker

`data/constituencies.json` separates two kinds of fact:

| Known and reliable | Not loaded |
|---|---|
| 1 President, 36 Governors (the FCT has a Minister, not a Governor) | Names of the 109 senatorial districts |
| 3 senators per state + 1 for the FCT = 109 (Constitution s.48) | Names of the 360 federal constituencies |
| 360 Reps (s.49), 993 Assembly seats (s.91) | Names of the 993 state constituencies |
| | The LGA grouping under every one of them |

Each race carries a `confidence` field and the UI reads it. "Your Ballot 2027"
names the President and Governor races, tells a Kano voter they are in one of
Kano's three senatorial districts, and for Reps and Assembly says the
delimitation is not loaded rather than guessing. **A wrong federal constituency
on a political website is worse than an absent one.**

**Action:** obtain INEC's delimitation publications. Until then
`aspirants.constituency_ref` is free text supplied by the aspirant and flagged
unverified.

## Waiting on leadership — Wave 4 inputs

| Input | Blocks | Current state |
|---|---|---|
| Official social handles (exact URLs) | Footer, `/about`, `sameAs` structured data | `socials` ships **empty**. A handle guessed from the movement's name can point at an impersonator. |
| National Coordinator's WhatsApp number **with consent to publish** | `officialContact.whatsapp`, the floating contact button | `null`. Every call site falls back to the official email. |
| A signed statement from the Coordinator | The home page and `/leadership` quote block | Falls back to the movement's rallying cry, attributed to the office, not to a person. |
| Officer photographs + consent | `/structure` gallery, `/leadership`, the home mosaic | Initials avatars. The mosaic renders nothing below 12 approved portraits. |
| Payment account in the movement's registered name | The cash path on `/support` | `cashSupport.enabled = false`. In-kind is live. |
| Nigerian election lawyer's review of the donation copy | The cash path on `/support` | Same. |
| INEC's official 2027 timetable | The home page countdown | `generalElection.confirmed = false`; the date shows as **(expected)**. |

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

**Resolved in Wave 4.** `public/manifest.json` used to hard-code `/OK2027` in
`start_url`, `scope` and every icon path. It is now generated by
`src/app/manifest.ts`, which reads `basePath` like everything else, so moving to
a custom domain is a one-line environment change with nothing left to edit by
hand.

## Known budget exception

`/join` builds to ~195 kB of first-load JS, above the ~150 kB target — it is
`react-hook-form` + `zod` + the Radix select/checkbox primitives the
registration form needs. Every other route is at or under budget. Per-state
geography is fetched on demand (6–25 kB) rather than bundled, which is what
keeps it from being far worse.
