export interface NavLink {
  href: string;
  label: string;
  description: string;
  /** Shown in the compact desktop bar as well as the mobile sheet. */
  primary?: boolean;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

/**
 * The navigation, grouped.
 *
 * Wave 4 added five routes to a flat list that was already at twelve. Grouping
 * keeps the mobile sheet scannable; the desktop bar stays at four so it does
 * not wrap on a laptop.
 */
export const navGroups: NavGroup[] = [
  {
    heading: "Movement",
    links: [
      {
        href: "/leadership",
        label: "Leadership",
        description: "The National Coordinator and the national executive.",
      },
      {
        href: "/structure",
        label: "Structure",
        description: "Every office — filled and vacant — from national to state.",
      },
      {
        href: "/vacancies",
        label: "Vacancies",
        description: "Open posts across the movement, and how to apply.",
      },
      {
        href: "/diaspora",
        label: "Diaspora",
        description: "Country chapters for Nigerians abroad.",
      },
    ],
  },
  {
    heading: "Coverage",
    links: [
      {
        href: "/coverage",
        label: "Coverage map",
        description: "Where we have people, and the units still dark.",
        primary: true,
      },
      {
        href: "/baseline",
        label: "2023 baseline",
        description:
          "Every polling unit, the register, and the voters still to be mobilised.",
      },
      {
        href: "/leaderboard",
        label: "Leaderboard",
        description: "How states and LGAs are performing.",
      },
      {
        href: "/action-plan",
        label: "Action plan",
        description: "The 6-Month Victory Action Plan, week by week.",
      },
      {
        href: "/rhythm",
        label: "Weekly rhythm",
        description: "What the movement works on each day of the week.",
      },
    ],
  },
  {
    heading: "Take part",
    links: [
      {
        href: "/join",
        label: "Join",
        description: "Register as a member, placed down to your ward.",
        primary: true,
      },
      {
        href: "/coverage/adopt",
        label: "Adopt a polling unit",
        description: "Claim the unit where you vote and stand for it.",
      },
      {
        href: "/support",
        label: "Support",
        description: "Give in cash or in kind, and see where it goes.",
        primary: true,
      },
      {
        href: "/pvc",
        label: "PVC drive",
        description: "Get your PVC and track the movement's progress.",
      },
      {
        href: "/learn",
        label: "Learn",
        description: "Civic education, from getting a PVC to reading a result sheet.",
        primary: true,
      },
    ],
  },
  {
    heading: "Community",
    links: [
      {
        href: "/aspirants",
        label: "Aspirants",
        description: "Who is contesting, in all five 2027 races.",
      },
      {
        href: "/market",
        label: "Market",
        description: "Member businesses — the Market/Trade advertisement board.",
      },
      {
        href: "/store",
        label: "Merchandise",
        description: "Official NOkM branded wear.",
      },
      {
        href: "/about",
        label: "About",
        description: "What the movement is and how it operates.",
      },
    ],
  },
];

/** Flat list, for anything that needs every route in one pass. */
export const navLinks: NavLink[] = navGroups.flatMap((g) => g.links);

export const primaryNav = navLinks.filter((l) => l.primary);
