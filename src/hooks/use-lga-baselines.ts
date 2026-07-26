"use client";

import { useEffect, useState } from "react";
import { basePath } from "@/lib/site";

/** One LGA's 2023 baseline. Mirrors data/baseline-lga/<CODE>.json. */
export interface LgaBaselineRow {
  name: string;
  code: string;
  wards: number;
  pollingUnits: number;
  registered: number;
  accredited: number;
  validated: number;
  unsure: number;
  notFound: number;
}

/**
 * Per-LGA 2023 figures for one state, fetched on demand from the copy written
 * into public/ by scripts/sync-public-data.mjs. About 5 kB per state against
 * ~184 kB for the whole federation.
 */
export function useLgaBaselines(stateCode: string | undefined) {
  const [lgas, setLgas] = useState<LgaBaselineRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stateCode) {
      setLgas(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`${basePath}/baseline-lga/${stateCode}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { lgas: LgaBaselineRow[] } | null) => {
        if (!cancelled) setLgas(data?.lgas ?? null);
      })
      .catch(() => {
        if (!cancelled) setLgas(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateCode]);

  return { lgas, loading };
}
