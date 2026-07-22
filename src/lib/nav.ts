export interface NavLink {
  href: string;
  label: string;
  description: string;
  /** Shown in the compact desktop bar as well as the mobile sheet. */
  primary?: boolean;
}

export const navLinks: NavLink[] = [
  {
    href: "/structure",
    label: "Structure",
    description: "National, zonal and state offices — filled and vacant.",
    primary: true,
  },
  {
    href: "/vacancies",
    label: "Vacancies",
    description: "Open posts across the movement, and how to apply.",
  },
  {
    href: "/baseline",
    label: "2023 baseline",
    description:
      "Every polling unit, the register, and the voters still to be mobilised.",
    primary: true,
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
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "How states and LGAs are performing.",
  },
  {
    href: "/pvc",
    label: "PVC drive",
    description: "Get your PVC and track the movement's progress.",
    primary: true,
  },
  {
    href: "/learn",
    label: "Learn",
    description: "Civic education, from getting a PVC to reading a result sheet.",
    primary: true,
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
    href: "/diaspora",
    label: "Diaspora",
    description: "Country chapters for Nigerians abroad.",
  },
  {
    href: "/about",
    label: "About",
    description: "What the movement is and how it operates.",
  },
];

export const primaryNav = navLinks.filter((l) => l.primary);
