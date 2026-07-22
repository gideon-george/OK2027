# Placeholder data — must be replaced before launch

Everything in this file is data the platform needs but does not yet have. It is
rendered as clearly-labelled placeholder, never as fact. Nothing here should be
treated as authoritative.

## Geography

| Item | Status | Notes |
|---|---|---|
| 36 states + FCT | **Real** | Names, codes and zone assignments are correct. |
| LGA names | **Partial** | Real for FCT (6) and Anambra (21) only. The other 35 states have no LGA records. Nigeria has 774 LGAs in total. |
| Ward names | **Placeholder** | Generated as "«LGA» Ward 01…" by `scripts/generate-inec-pilot-placeholder.mjs`. Flagged with `placeholder: true` and labelled in the UI. |
| Polling units | **Placeholder** | Generated at seed time. ~176,000 nationally. |

**Action:** import the official INEC register of LGAs, wards and polling units.
Until then `/join` tells members in the other 35 states that their ward list is
still being imported, rather than showing invented ward names.

## Roster

| Item | Status | Notes |
|---|---|---|
| National executives | **Real, names only** | 25 from the framework circular + National Youth Leader from the unveiling. |
| Officer phone numbers | **Not stored** | Deliberately absent from the repository. Load into `officer_contacts` in Supabase via a private admin import — see the note in `data/nokm-structure.json`. |
| Zonal coordinators | **Real** | 4 of 6 filled; North-West and North-East are open. |
| State coordinators | **Real** | 14 of 37 filled. Abia was listed blank in the unveiling and is recorded vacant. |
| LGA / ward / unit officers | **None** | Appointed by each State Coordinator; none recorded yet. |

## Framework reconciliation

The framework circular numbers **25** national offices. The official unveiling
also names a **National Youth Leader**, which the circular does not list. It is
seeded with `frameworkAddendum: true` and shown with a "Framework addendum"
badge so the discrepancy is visible rather than silently resolved.

**Action:** confirm with the National Secretary whether the Youth Leader post
should be formally added to the framework as office 26.

Two offices have overlapping mandates and should be confirmed as distinct:

- **#9 Director of Mobilization, Elections & Campaign Strategy** — currently
  vacant.
- **#24 Director of Contacts & Adhoc/PUA** — filled.

## Content

| Item | Status | Notes |
|---|---|---|
| 6-Month Victory Action Plan | **Structure real, dates placeholder** | The four pillars and four verbs come from the official artwork. Week-by-week milestones and due dates are illustrative until leadership sets them. |
| Weekly rhythm | **Real** | The Mon–Sun cycle is the movement's published schedule. |
| Merchandise ordering contact | **Placeholder** | `/store` needs the official WhatsApp ordering number. No number is shown until one is supplied. |
| Market/Trade board contact | **Placeholder** | Same — listings carry the poster's own contact, not a movement number. |
| Civic lessons | **Real** | Eight lessons carried over unchanged. |

## Numbers shown in the UI

Every membership, PVC and coverage count on the site is computed from the
database or from the roster file. **None are hard-coded.** Before Supabase is
provisioned these render as honest empty states ("no members registered yet"),
never as a placeholder figure.

## Configuration that does not follow the base path

`public/manifest.json` is static JSON and cannot read the environment, so its
`start_url`, `scope` and icon paths hard-code `/OK2027`. Update them by hand
when moving to a custom domain — everything else follows
`NEXT_PUBLIC_BASE_PATH`.

## Known budget exception

`/join` builds to ~193 kB of first-load JS, above the ~150 kB target. The
overage is `react-hook-form` + `zod` + the Radix select/checkbox primitives that
the registration form itself needs. Every other route is at or under budget.
Revisit if registration conversion looks poor on slow connections.
