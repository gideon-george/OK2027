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

/**
 * The National Coordinator. Held as its own export rather than read out of the
 * roster because the office is part of the movement's public identity — it
 * appears in metadata, on the home page and in structured data, all of which
 * need the full title verbatim.
 */
export const nationalCoordinator = {
  name: "Hon. Agom Augustine",
  title: "National Coordinator, Convener & Mobilizer",
  organisation: "National OK Movement (NOkM)",
  /** Matches the appointment slug in data/nokm-structure.json. */
  appointmentSlug: "national-coordinator",
  initials: "AA",
  /**
   * A signed statement from the Coordinator. Null until one is supplied — the
   * movement's rallying cry stands in rather than an invented quotation.
   * See docs/TODO-real-data.md.
   */
  statement: null as string | null,
} as const;

/** Credit for the people who built the platform. Shown in the site footer. */
export const builtBy = {
  name: "Comrd. Gideon George",
  role: "Platform Developer",
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
 * The movement's published channels of contact.
 *
 * This is the ONE exception to the rule in README.md that no phone number
 * enters this repository. It is a published organisational contact line, not
 * an entry in an officer directory, and it is only populated with the
 * Coordinator's explicit consent. Every other officer's number belongs in
 * `officer_contacts` in Supabase, behind row-level security. Never add a
 * second number here.
 */
export const officialContact = {
  email: "nokm2026@gmail.com",
  /**
   * International format, digits only, no leading "+". Null until supplied
   * with consent — every call site falls back to email.
   */
  whatsapp: null as string | null,
  whatsappLabel: "National Coordinator — direct line",
} as const;

export interface SocialLink {
  platform:
    | "Instagram"
    | "Facebook"
    | "X"
    | "Telegram"
    | "LinkedIn"
    | "YouTube"
    | "TikTok"
    | "WhatsApp Channel";
  handle: string;
  url: string;
}

/**
 * Official social accounts.
 *
 * Deliberately empty. A handle must never be guessed from the movement's name:
 * a constructed URL can point at a stranger's account or at an impersonator,
 * and the movement would be sending its own members there. Entries are added
 * only when leadership supplies the exact URL. See docs/TODO-real-data.md.
 */
export const socials: SocialLink[] = [];

/**
 * WhatsApp deep link with an optional prefilled message.
 *
 * Returns null when no number is configured, so callers can fall back to email
 * rather than rendering a dead link.
 */
export function waLink(message?: string): string | null {
  if (!officialContact.whatsapp) return null;
  const base = `https://wa.me/${officialContact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** `mailto:` for the official address, with an optional subject. */
export function mailLink(subject?: string): string {
  const base = `mailto:${officialContact.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

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
