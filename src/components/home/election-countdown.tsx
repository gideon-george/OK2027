"use client";

import { useEffect, useState } from "react";
import { generalElection } from "@/lib/site";
import { cn } from "@/lib/utils";

function daysUntil(iso: string): number | null {
  const target = new Date(`${iso}T08:00:00+01:00`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

/**
 * Days to polling day.
 *
 * Renders nothing until mounted: the number depends on today's date, and a
 * statically exported page would otherwise ship whatever "today" was at build
 * time and show a stale figure for months.
 *
 * Always says EXPECTED while `generalElection.confirmed` is false. INEC has not
 * published the 2027 timetable, and a movement telling Nigerians a polling date
 * that INEC has not announced would be the exact kind of confident wrong number
 * this platform exists to avoid.
 */
export function ElectionCountdown({ className }: { className?: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(generalElection.expectedDate));
    // Re-check hourly so a phone left open overnight rolls over.
    const timer = setInterval(
      () => setDays(daysUntil(generalElection.expectedDate)),
      3_600_000
    );
    return () => clearInterval(timer);
  }, []);

  if (days === null) return null;

  const label = new Date(
    `${generalElection.expectedDate}T00:00:00Z`
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <span
      className={cn(
        "bg-background/70 inline-flex items-baseline gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur",
        className
      )}
    >
      <span className="font-display text-brand-red text-base font-extrabold tabular-nums">
        {days.toLocaleString("en-NG")}
      </span>
      <span className="text-xs font-medium">
        days to polling day
        <span className="text-muted-foreground">
          {" · "}
          {generalElection.confirmed ? label : `${label} (expected)`}
        </span>
      </span>
    </span>
  );
}
