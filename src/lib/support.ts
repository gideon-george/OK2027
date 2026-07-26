/**
 * Support for the movement.
 *
 * The cash path is deliberately switched off in code, not just left
 * unconfigured. It cannot open until three things exist, and none of them are
 * a programming task:
 *
 *   1. A payment account in the movement's REGISTERED name — never an
 *      individual's personal account.
 *   2. The National Treasurer and National Financial Secretary named as
 *      accountable for it.
 *   3. A Nigerian election lawyer's sign-off on the copy. NOkM is neither a
 *      party nor a candidate, which is exactly why the boundary has to be
 *      written down: the Electoral Act 2022 regulates contributions to parties
 *      and candidates, and the movement must not become a route around those
 *      rules.
 *
 * Flip `cashSupport.enabled` only when all three are true. See
 * docs/nokm-wave4-prompt.md Part 2 §4.
 */

export const cashSupport = {
  enabled: false,
  /** Hosted checkout URL on the processor's own domain. Never a form here. */
  checkoutUrl: null as string | null,
  /** Published only when the account is in the movement's registered name. */
  bankDetails: null as {
    accountName: string;
    bankName: string;
    accountNumber: string;
  } | null,
  processor: null as "Paystack" | "Flutterwave" | null,
} as const;

export interface PledgeCategory {
  value: string;
  label: string;
  examples: string;
}

/**
 * In-kind support. Live immediately — it needs no processor, no legal entity
 * and no review beyond ordinary care, and at this stage of a Nigerian
 * grassroots movement it is frequently worth more than the cash.
 */
export const pledgeCategories: PledgeCategory[] = [
  {
    value: "venue",
    label: "Venue space",
    examples: "A hall for ward meetings, an office, a shop front on market day.",
  },
  {
    value: "vehicles_fuel",
    label: "Vehicles and fuel",
    examples: "A bus for a PVC drive, a car for LGA visits, fuel.",
  },
  {
    value: "printing_materials",
    label: "Printing and materials",
    examples: "Posters, forms, banners, notebooks, printing services.",
  },
  {
    value: "airtime_data",
    label: "Airtime and data",
    examples: "Data bundles for ward officers filing weekly reports.",
  },
  {
    value: "food",
    label: "Food for events",
    examples: "Feeding volunteers at a rally, water at a registration drive.",
  },
  {
    value: "professional_services",
    label: "Professional services",
    examples: "Legal, medical, media, design, accounting, IT.",
  },
  {
    value: "logistics",
    label: "Logistics and coordination",
    examples: "Storage, dispatch, crowd stewarding, first aid cover.",
  },
  {
    value: "volunteer_hours",
    label: "Volunteer hours",
    examples: "Your own time — door to door, phone banking, data entry.",
  },
  {
    value: "pvc_transport",
    label: "PVC drive transport",
    examples: "Moving people to INEC offices to register or collect cards.",
  },
  {
    value: "other",
    label: "Something else",
    examples: "Tell us what you have and where you are.",
  },
];

export const pledgeCategoryLabels = new Map(
  pledgeCategories.map((c) => [c.value, c.label])
);

/**
 * The rules on money, stated to the giver before they give. Reviewed copy —
 * do not reword without the National Legal Adviser.
 */
export const supportRules = [
  "NOkM is an independent support group. It is not a political party and not a candidate. A contribution to NOkM is not a donation to a candidate or to the Nigeria Democratic Congress.",
  "Contributions are not tax-deductible.",
  "The movement does not accept anonymous contributions, contributions from foreign sources, or public funds.",
  "No contribution buys any position, appointment, endorsement or influence within the movement.",
  "Membership is free and always will be. Nobody has to give anything to belong.",
];
