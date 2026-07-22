"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { rhythmInWeekOrder } from "@/lib/rhythm";

/**
 * Today is resolved on the client rather than at build time — a statically
 * exported page would otherwise freeze "today" to whenever the site was last
 * deployed.
 */
export function RhythmList() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  return (
    <ol className="space-y-3">
      {rhythmInWeekOrder.map((day) => {
        const isToday = today === day.index;
        return (
          <li
            key={day.day}
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              isToday && "border-brand-blue bg-brand-blue/5"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold">{day.day}</h2>
              {isToday && <Badge className="bg-brand-blue">Today</Badge>}
            </div>
            <p className="pt-1 font-medium text-balance">{day.focus}</p>
            <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
              {day.detail}
            </p>
            <p className="text-muted-foreground pt-2 text-sm">
              <span className="text-foreground font-medium">
                What the lead officer produces:
              </span>{" "}
              {day.deliverable}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
