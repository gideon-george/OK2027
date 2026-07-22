/** Single source of truth for movement identity and standing legal copy. */

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/OK2027";

export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://gideon-george.github.io/OK2027";

/**
 * Origin without the base path.
 *
 * `metadataBase` must be the bare origin: Next prepends `basePath` itself when
 * resolving metadata image URLs, so passing the full site URL produces a
 * doubled path like /OK2027/OK2027/opengraph-image.png.
 */
export const siteOrigin = new URL(siteUrl).origin;

export const site = {
  name: "NOkM",
  fullName: "National OK Movement",
  longName: "NDC National OK Movement (NOkM)",
  tagline: "One Nation. One Voice. One Future.",
  motto: "Structure. Mobilize. Secure. Grow. Lead. Deliver.",
  rallyingCry: "A New Nigeria Is Possible.",
  description:
    "The National OK Movement is an independent grassroots support movement mobilising for Peter Obi and Rabiu Kwankwaso in Nigeria's 2027 general election. Register, find your structure, and organise peacefully.",
} as const;

export const principals = [
  {
    name: "Peter Obi",
    office: "President",
    initials: "PO",
    letter: "O",
  },
  {
    name: "Rabiu Kwankwaso",
    office: "Vice President",
    initials: "RK",
    letter: "K",
  },
] as const;

/**
 * Standing disclaimer. Required in the footer of every page and above the
 * submit button on /join. Do not reword without the National Legal Adviser.
 */
export const independenceDisclaimer =
  "The National OK Movement is an independent support group. It is not an organ of the Nigeria Democratic Congress, is not funded by the party, and does not issue party directives. It complements official party structures and never replaces them.";

export const conductDisclaimer =
  "All NOkM activity is peaceful, lawful and within INEC regulations. Nothing here encourages confrontation with any person or institution.";

export const inecDisclaimer =
  "NOkM is not affiliated with INEC. Always confirm registration and election details on official INEC channels.";

export const currentPolicyVersion = "2026-07-22";
