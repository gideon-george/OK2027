"use client";

import { useEffect, useState } from "react";
import { basePath } from "@/lib/site";
import type { Lga, StateGeography, Ward } from "@/lib/geo";

/**
 * LGAs and wards for one state, fetched on demand.
 *
 * One state is 6–25 kB; the full national register is 576 kB. Wave 4 added
 * three more places that need a ward picker, so the fetch lives here rather
 * than being copied into each of them.
 */
export function useStateGeography(stateCode: string | undefined) {
  const [geography, setGeography] = useState<StateGeography | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!stateCode) {
      setGeography(null);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch(`${basePath}/geo/${stateCode}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StateGeography | null) => {
        if (cancelled) return;
        setGeography(data);
        setFailed(data === null);
      })
      .catch(() => {
        if (cancelled) return;
        setGeography(null);
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateCode]);

  return { geography, loading, failed };
}

export function wardsForLga(
  geography: StateGeography | null,
  lgaCode: string | undefined
): Ward[] | null {
  if (!geography || !lgaCode) return null;
  return geography.lgas.find((l) => l.code === lgaCode)?.wards ?? null;
}

export function lgasOf(geography: StateGeography | null): Lga[] | null {
  return geography?.lgas ?? null;
}
