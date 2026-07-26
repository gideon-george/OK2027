"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareCard } from "@/components/shared/share-card";
import { useStateGeography, wardsForLga } from "@/hooks/use-state-geography";
import { useLgaBaselines } from "@/hooks/use-lga-baselines";
import { racesForState } from "@/lib/races";
import { states, statesByCode } from "@/lib/geo";

const SAVED_KEY = "nokm.myBallot";

interface Saved {
  stateCode: string;
  lgaCode: string;
  wardCode: string;
}

/**
 * "Your Ballot 2027".
 *
 * Most Nigerians cannot name their state constituency, and quite a few cannot
 * name their federal one. Showing someone all five races that decide their own
 * representation, in one screen, is genuinely useful — which is why it gets
 * shared.
 *
 * It is careful about what it claims. President and Governor resolve to a real
 * named constituency. Senate resolves to a real seat COUNT, because three
 * senators per state is in the Constitution. Reps and Assembly show the race
 * and say plainly that the delimitation is not loaded, with a link to help
 * supply it. Naming a wrong federal constituency would be worse than naming
 * none.
 */
export function YourBallot() {
  const [stateCode, setStateCode] = useState<string>("");
  const [lgaCode, setLgaCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [restored, setRestored] = useState(false);

  const { geography } = useStateGeography(stateCode || undefined);
  const { lgas: baselines } = useLgaBaselines(stateCode || undefined);
  const wards = wardsForLga(geography, lgaCode || undefined);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SAVED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Saved;
        setStateCode(parsed.stateCode ?? "");
        setLgaCode(parsed.lgaCode ?? "");
        setWardCode(parsed.wardCode ?? "");
      }
    } catch {
      /* ignore a corrupt saved ballot */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored || !stateCode) return;
    try {
      window.localStorage.setItem(
        SAVED_KEY,
        JSON.stringify({ stateCode, lgaCode, wardCode })
      );
    } catch {
      /* private browsing */
    }
  }, [restored, stateCode, lgaCode, wardCode]);

  const state = statesByCode.get(stateCode);
  const lga = geography?.lgas.find((l) => l.code === lgaCode);
  const ward = wards?.find((w) => w.code === wardCode);
  const lgaBaseline = baselines?.find((b) => b.code === lgaCode);
  const myRaces = stateCode ? racesForState(stateCode) : [];

  const nonVoters = lgaBaseline
    ? Math.max(0, lgaBaseline.registered - lgaBaseline.accredited)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <Vote className="text-brand-blue size-5" />
          <h2 className="font-display text-xl font-bold">Build your ballot</h2>
        </div>
        <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
          Tell us where you vote. We will show you every race that decides who
          represents you in 2027.
        </p>

        <div className="grid gap-3 pt-5 sm:grid-cols-3">
          <div>
            <label htmlFor="ballot-state" className="pb-1.5 block text-xs font-medium">
              State
            </label>
            <Select
              value={stateCode}
              onValueChange={(v) => {
                setStateCode(v);
                setLgaCode("");
                setWardCode("");
              }}
            >
              <SelectTrigger id="ballot-state" className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="ballot-lga" className="pb-1.5 block text-xs font-medium">
              LGA
            </label>
            <Select
              value={lgaCode}
              onValueChange={(v) => {
                setLgaCode(v);
                setWardCode("");
              }}
              disabled={!geography}
            >
              <SelectTrigger id="ballot-lga" className="w-full">
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {geography?.lgas.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="ballot-ward" className="pb-1.5 block text-xs font-medium">
              Ward
            </label>
            <Select value={wardCode} onValueChange={setWardCode} disabled={!wards}>
              <SelectTrigger id="ballot-ward" className="w-full">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {state && (
        <>
          <div className="bg-card overflow-hidden rounded-xl border">
            <div className="border-b px-5 py-4">
              <p className="eyebrow text-brand-red">Your ballot, 2027</p>
              <p className="font-display pt-1 text-lg font-bold">
                {ward ? `${ward.name}, ` : ""}
                {lga ? `${lga.name}, ` : ""}
                {state.name}
              </p>
            </div>

            <ul className="divide-y">
              {myRaces.map(({ race, seats, constituency, contested }) => (
                <li key={race.key} className="flex items-start gap-3 px-5 py-4">
                  {contested && constituency ? (
                    <CheckCircle2 className="text-brand-green mt-0.5 size-5 shrink-0" />
                  ) : (
                    <CircleDashed className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{race.label}</p>

                    {!contested ? (
                      <p className="text-muted-foreground pt-0.5 text-sm leading-relaxed">
                        {race.key === "governor"
                          ? "The FCT has no Governor — it is administered by a Minister appointed by the President."
                          : "The FCT has Area Councils rather than a State House of Assembly."}
                      </p>
                    ) : constituency ? (
                      <p className="text-muted-foreground pt-0.5 text-sm">
                        {constituency}
                      </p>
                    ) : seats ? (
                      <p className="text-muted-foreground pt-0.5 text-sm leading-relaxed">
                        One of {state.name}&apos;s {seats} senatorial districts.
                        The district names come from INEC&apos;s delimitation
                        and are not loaded here yet.
                      </p>
                    ) : (
                      <p className="text-muted-foreground pt-0.5 text-sm leading-relaxed">
                        Your {race.constituencyUnit.toLowerCase()} is set by
                        INEC delimitation, which is not loaded here yet. We will
                        not guess it.
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[0.65rem]">
                    {race.seats === 1 ? "1 seat" : `${race.seats} seats`}
                  </Badge>
                </li>
              ))}
            </ul>

            {lgaBaseline && (
              <div className="bg-accent/40 border-t px-5 py-4">
                <p className="text-sm leading-relaxed">
                  In {lgaBaseline.name},{" "}
                  <strong className="text-brand-red font-semibold tabular-nums">
                    {nonVoters.toLocaleString("en-NG")}
                  </strong>{" "}
                  registered voters did not vote in 2023, across{" "}
                  {lgaBaseline.pollingUnits.toLocaleString("en-NG")} polling
                  units.
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Button asChild size="sm">
                    <Link
                      href={{
                        pathname: "/coverage/adopt",
                        query: {
                          state: stateCode,
                          lga: lgaCode,
                          ...(wardCode ? { ward: wardCode } : {}),
                        },
                      }}
                    >
                      Adopt your polling unit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/coverage/${state.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      {state.name} coverage
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <ShareCard
            fileName={`nokm-ballot-${stateCode.toLowerCase()}`}
            shareText={`These are the five races that decide who represents me in 2027. Check yours:`}
            content={{
              eyebrow: "My ballot, 2027",
              headline: "Five races decide who speaks for me.",
              lines: [
                `President · Nigeria`,
                state.code === "FC"
                  ? "No governorship — the FCT has a Minister"
                  : `Governor · ${state.name}`,
                `Senate, House of Reps, State Assembly`,
                `${ward ? `${ward.name}, ` : ""}${lga?.name ?? state.name}`,
              ],
              footer: "Know your ballot. Take your polling unit.",
            }}
          />
        </>
      )}
    </div>
  );
}
