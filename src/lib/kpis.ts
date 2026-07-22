/**
 * The ten general executive KPIs. Every officer is evaluated against these
 * quarterly, in addition to the KPIs specific to their office.
 *
 * Source: docs/nokm-framework.md §5.
 */
export interface GeneralKpi {
  slug: string;
  label: string;
  description: string;
  /** Where the score comes from once the database is live. */
  source: "reports" | "members" | "structure" | "manual";
  /** Minimum acceptable score, where the framework sets one. */
  threshold?: number;
}

export const generalKpis: GeneralKpi[] = [
  {
    slug: "membership_growth",
    label: "Membership drive growth",
    description: "New members registered in your scope this quarter.",
    source: "members",
  },
  {
    slug: "structural_expansion",
    label: "Structural expansion drive",
    description: "Posts filled below you — LGAs, wards and polling units.",
    source: "structure",
  },
  {
    slug: "programme_delivery",
    label: "Programme delivery",
    description: "Programmes and events delivered against those planned.",
    source: "reports",
  },
  {
    slug: "meeting_attendance",
    label: "Meeting attendance",
    description:
      "Attendance at movement meetings. The framework sets a minimum of 90%.",
    source: "reports",
    threshold: 90,
  },
  {
    slug: "reporting_compliance",
    label: "Reporting compliance",
    description: "Weekly reports submitted on time out of those due.",
    source: "reports",
  },
  {
    slug: "communication_responsiveness",
    label: "Communication responsiveness",
    description: "Directives acknowledged and messages answered promptly.",
    source: "reports",
  },
  {
    slug: "financial_accountability",
    label: "Financial accountability",
    description: "Funds handled at your level accounted for and reconciled.",
    source: "manual",
  },
  {
    slug: "conflict_resolution",
    label: "Conflict resolution effectiveness",
    description: "Disputes in your scope resolved without escalation.",
    source: "manual",
  },
  {
    slug: "leadership_performance",
    label: "Leadership performance",
    description: "Assessed by the supervising office each quarter.",
    source: "manual",
  },
  {
    slug: "ethical_compliance",
    label: "Ethical compliance",
    description:
      "Adherence to the code of conduct and the movement's core values.",
    source: "manual",
  },
];

export const kpiBySlug = new Map(generalKpis.map((k) => [k.slug, k]));

/** Simple unweighted mean, rounded to one decimal. */
export function compositeScore(scores: Record<string, number>): number | null {
  const values = generalKpis
    .map((k) => scores[k.slug])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(mean * 10) / 10;
}
