"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, RotateCcw, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShareBar } from "@/components/shared/share-bar";
import { StatTile } from "@/components/shared/stat-tile";
import {
  daysToElection,
  defaultScenario,
  modelBasis,
  presets,
  project,
  scenarioBounds,
  scenarioFromQuery,
  scenarioToQuery,
  type Scenario,
  type StateProjection,
} from "@/lib/arithmetic";
import { generalElection } from "@/lib/site";
import { cn } from "@/lib/utils";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-NG");
}

/** Millions to one decimal — the register is easier to hold in mind that way. */
function millions(n: number): string {
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function Dial({
  label,
  hint,
  value,
  display,
  bounds,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  display: string;
  bounds: { min: number; max: number; step: number };
  onChange: (v: number) => void;
}) {
  const id = `dial-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-display text-brand-blue text-2xl font-extrabold tabular-nums">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-brand-blue mt-3 h-2 w-full cursor-pointer"
      />
      <p className="text-muted-foreground pt-2 text-xs leading-relaxed">{hint}</p>
    </div>
  );
}

/**
 * The model, driven.
 *
 * Everything here is a division sum over the 2023 register. The component holds
 * no opinion about who wins — the share is the user's input, and the page says
 * so. What it is for is turning a national abstraction into a number a ward
 * secretary can act on before Saturday.
 */
export function VictoryModel() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [reading, setReading] = useState<"fct-as-state" | "fct-mandatory">(
    "fct-as-state"
  );
  const [days, setDays] = useState<number | null>(null);

  // Read a forwarded scenario, and put the clock on the browser rather than the
  // build, so a page cached by the service worker never shows a stale countdown.
  useEffect(() => {
    const fromUrl = scenarioFromQuery(window.location.search);
    if (fromUrl) setScenario(fromUrl);
    setDays(daysToElection(new Date()));
  }, []);

  // Keep the address bar in step so any scenario can be copied and forwarded.
  useEffect(() => {
    const query = scenarioToQuery(scenario);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  }, [scenario]);

  const p = useMemo(() => project(scenario), [scenario]);
  const spread = p.readings.find((r) => r.key === reading) ?? p.readings[0];
  const chosen = new Set(spread.states.map((s) => s.code));
  const fct = p.states.find((s) => s.code === "FC") ?? null;

  // Whether the disputed sentence actually changes anything. Under a uniform
  // turnout the FCT is one of the least demanding units in the federation, so
  // the cheapest qualifying path picks it up whether or not it is compulsory —
  // and the argument that consumed the 2023 petitions turns out to make no
  // operational difference at all. That is worth saying out loud.
  const other = p.readings.find((r) => r.key !== reading);
  const readingsAgree = Boolean(
    other &&
      other.states.length === spread.states.length &&
      other.states.every((s) => chosen.has(s.code))
  );
  const board = [...p.states].sort(
    (a, b) => a.quarterThreshold - b.quarterThreshold || a.name.localeCompare(b.name)
  );

  const byTarget = [...p.states].sort((a, b) => b.target - a.target);
  const perDay = days && days > 0 ? Math.ceil(p.extraVoters / days) : null;

  const set = (patch: Partial<Scenario>) =>
    setScenario((s) => ({ ...s, ...patch }));

  const activePreset = presets.find(
    (preset) =>
      preset.scenario.turnoutPct === scenario.turnoutPct &&
      preset.scenario.sharePct === scenario.sharePct &&
      preset.scenario.newRegistrantsM === scenario.newRegistrantsM
  );

  const shareMessage =
    `At ${scenario.turnoutPct}% turnout, winning ${scenario.sharePct}% of the votes cast in 2027 ` +
    `means ${fmt(p.nationalTarget)} Nigerians — about ${fmt(p.ladder.perPollingUnit)} per polling unit. ` +
    `Run the numbers yourself:`;

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      <section className="pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h2 className="font-display text-2xl font-bold">Set the scenario</h2>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setScenario(preset.scenario)}
                title={preset.blurb}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activePreset?.key === preset.key
                    ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                    : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setScenario(defaultScenario)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Dial
            label="Turnout"
            display={`${scenario.turnoutPct}%`}
            value={scenario.turnoutPct}
            bounds={scenarioBounds.turnoutPct}
            onChange={(v) => set({ turnoutPct: v })}
            hint={`Share of the register that actually votes. 2023 was ${modelBasis.turnout2023}% — the lowest since 1999.`}
          />
          <Dial
            label="Our share of the vote"
            display={`${scenario.sharePct}%`}
            value={scenario.sharePct}
            bounds={scenarioBounds.sharePct}
            onChange={(v) => set({ sharePct: v })}
            hint="A target you set, not a prediction this site makes. Nigeria's presidency needs a plurality — no run-off, no fifty percent."
          />
          <Dial
            label="New PVCs by 2027"
            display={`+${scenario.newRegistrantsM.toFixed(1)}M`}
            value={scenario.newRegistrantsM}
            bounds={scenarioBounds.newRegistrantsM}
            onChange={(v) => set({ newRegistrantsM: v })}
            hint="Added to the roll before polling day and spread across states pro rata. This is what the PVC drive is for."
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-10">
        <div className="border-brand-blue/30 bg-brand-blue/5 relative overflow-hidden rounded-xl border p-6 sm:p-8">
          <span className="tricolor absolute inset-x-0 top-0 h-1" aria-hidden />
          <p className="eyebrow text-muted-foreground/80">The number</p>
          <p className="text-gradient-blue font-display pt-2 text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">
            {fmt(p.nationalTarget)}
          </p>
          <p className="font-display pt-2 text-lg font-bold">
            Nigerians must mark a ballot for the O and the K
          </p>
          <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
            At {scenario.turnoutPct}% turnout on a register of{" "}
            {millions(p.projectedRegister)}, {millions(p.projectedVotesCast)} votes
            are cast nationwide and {scenario.sharePct}% of them is the figure
            above.{" "}
            {p.extraVoters > 0 ? (
              <>
                That is{" "}
                <strong className="text-foreground font-medium">
                  {fmt(p.extraVoters)} more people through the door than in 2023
                </strong>
                {perDay !== null && days !== null && days > 0 ? (
                  <>
                    {" "}
                    — {fmt(perDay)} newly committed voters every day for the{" "}
                    {fmt(days)} days left before the expected polling day.
                  </>
                ) : (
                  "."
                )}
              </>
            ) : (
              <>
                That asks{" "}
                <strong className="text-foreground font-medium">
                  no more people through the door than voted in 2023
                </strong>
                . On this scenario the whole result has to come out of share
                rather than turnout — every vote won is a vote taken from
                somebody else. Raising the turnout dial is the cheaper route.
              </>
            )}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-10">
        <h2 className="font-display text-2xl font-bold">Is there room for it?</h2>
        <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
          The pool is everyone on the projected register who did not vote in 2023
          — {millions(p.nationalPool)} people. If the target is a small slice of
          that pool, it can be met without persuading a single 2023 voter to
          switch. When it climbs past the pool, the movement is no longer only
          mobilising; it is converting.
        </p>

        <div className="bg-card mt-5 rounded-xl border p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              Target as a share of the unmobilised pool
            </p>
            <p
              className={cn(
                "font-display text-2xl font-extrabold tabular-nums",
                p.nationalPoolPct > 100 ? "text-brand-red" : "text-brand-green"
              )}
            >
              {p.nationalPoolPct}%
            </p>
          </div>
          <Progress value={Math.min(100, p.nationalPoolPct)} className="mt-3 h-2" />
          <p className="text-muted-foreground pt-3 text-xs leading-relaxed">
            {fmt(p.nationalTarget)} of {fmt(p.nationalPool)} people who did not
            vote in 2023 or are not yet on the roll.
          </p>
        </div>

        {p.overstretched.length > 0 && (
          <div className="border-brand-red/30 bg-brand-red/5 mt-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-brand-red mt-0.5 size-5 shrink-0" />
              <div className="text-sm">
                <p className="font-display font-semibold">
                  {p.overstretched.length}{" "}
                  {p.overstretched.length === 1 ? "state has" : "states have"} no
                  room left in the pool
                </p>
                <p className="text-muted-foreground pt-1.5 leading-relaxed">
                  In {p.overstretched.map((s) => s.name).join(", ")}, this scenario
                  asks for more votes than there are non-voters and new
                  registrants combined. The arithmetic still closes, but only by
                  winning people who already voted in 2023 — a different and
                  harder kind of work than turnout.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">The spread test</h2>
        <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
          A Nigerian president is not elected by the largest pile of votes alone.
          Section 134 of the Constitution also requires at least one quarter of
          the votes cast in two-thirds of the states of the federation and the
          Federal Capital Territory. That single sentence has two readings, and
          which one applies was litigated all the way to the Supreme Court after
          2023. This platform shows both and never picks the flattering one.
        </p>

        <div className="flex flex-wrap gap-2 pt-5">
          {p.readings.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setReading(r.key)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                reading === r.key
                  ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                  : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <p className="text-muted-foreground max-w-3xl pt-3 text-sm leading-relaxed">
          {spread.requirement}
        </p>

        {readingsAgree && fct && (
          <p className="text-muted-foreground max-w-3xl pt-3 text-sm leading-relaxed">
            <strong className="text-foreground font-medium">
              On this scenario both readings pick the same 25.
            </strong>{" "}
            A quarter of the FCT&apos;s votes is {fmt(fct.quarterThreshold)} — one
            of the smallest thresholds in the federation — so the cheapest
            qualifying path sweeps the FCT up whether or not it is compulsory.
            The question that consumed the 2023 petitions changes nothing about
            what has to be done on the ground.
          </p>
        )}

        <div className="grid gap-3 pt-5 sm:grid-cols-3">
          <StatTile
            tone="blue"
            value={fmt(spread.cost)}
            label="Votes on the cheapest qualifying path"
            hint={`One quarter in each of the ${spread.count} least demanding`}
          />
          <StatTile
            value={spread.marginal ? spread.marginal.name : "—"}
            label="The state that sets the bar"
            hint={
              spread.marginal
                ? `${fmt(spread.marginal.quarterThreshold)} votes needed there`
                : undefined
            }
          />
          <StatTile
            tone="green"
            value={`${Math.round((spread.cost / Math.max(1, p.nationalTarget)) * 100)}%`}
            label="Of the national target"
            hint="Spread costs less than the plurality — the plurality is the binding constraint"
          />
        </div>

        <p className="text-muted-foreground pt-6 pb-3 text-xs">
          All 37, cheapest quarter first. Highlighted rows are the ones this
          reading would use.{" "}
          <strong className="text-foreground font-medium">
            This is an arithmetic floor, not a strategy.
          </strong>{" "}
          NOkM organises in every state and the FCT, and a state left out of the
          cheapest path still elects senators, a governor and a house of assembly.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {board.map((s, i) => {
            const included = chosen.has(s.code);
            const compulsory = reading === "fct-mandatory" && s.code === "FC";
            return (
              <div
                key={s.code}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  included
                    ? "border-brand-green/40 bg-brand-green/5"
                    : "bg-card opacity-60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px] tabular-nums">
                    {i + 1}
                  </span>
                  {included && <Check className="text-brand-green size-3.5" />}
                </div>
                <p className="truncate pt-1 text-sm font-medium" title={s.name}>
                  {s.name}
                </p>
                <p className="font-display pt-0.5 text-base font-bold tabular-nums">
                  {fmt(s.quarterThreshold)}
                </p>
                {compulsory && (
                  <p className="text-brand-red pt-1 text-[11px] font-medium">
                    Compulsory on this reading
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">
          The same number, made small enough to carry
        </h2>
        <p className="text-muted-foreground max-w-3xl pt-2 text-sm leading-relaxed">
          {fmt(p.nationalTarget)} is not a number anyone can act on. Divided
          through the structure the movement already has, it becomes one.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile value={fmt(p.ladder.perState)} label="Per state" hint="37" />
          <StatTile value={fmt(p.ladder.perLga)} label="Per LGA" hint="774" />
          <StatTile
            tone="blue"
            value={fmt(p.ladder.perWard)}
            label="Per ward"
            hint={fmt(modelBasis.wards)}
          />
          <StatTile
            tone="green"
            value={fmt(p.ladder.perPollingUnit)}
            label="Per polling unit"
            hint={fmt(modelBasis.pollingUnits)}
          />
          <StatTile
            tone="red"
            value={fmt(p.ladder.teamsPerPollingUnit)}
            label="Bring-ten teams per unit"
            hint="One member plus ten is eleven votes"
          />
        </div>

        <div className="bg-muted/40 mt-5 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-brand-green mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="font-display font-semibold">
                {fmt(p.ladder.membersBringingTen)} members who each bring ten
              </p>
              <p className="text-muted-foreground pt-1.5 leading-relaxed">
                One person who votes and brings ten others is eleven votes. Spread
                over {fmt(modelBasis.pollingUnits)} polling units, that is{" "}
                {fmt(p.ladder.teamsPerPollingUnit)} such{" "}
                {p.ladder.teamsPerPollingUnit === 1 ? "person" : "people"} in every
                unit in Nigeria. Not a movement of millions of strangers — a
                movement of neighbours, counted.
              </p>
              <div className="flex flex-wrap gap-2 pt-3">
                <Button asChild size="sm">
                  <Link href="/bring-ten">Get your referral code</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/coverage/adopt">Adopt your polling unit</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="font-display text-2xl font-bold">State by state</h2>
        <p className="text-muted-foreground pt-1 pb-5 text-sm">
          Ranked by the votes this scenario asks of each state. &ldquo;Per
          unit&rdquo; is that target divided by the state&apos;s own polling
          units — the number an agent is actually responsible for.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Votes cast</TableHead>
                <TableHead className="text-right">¼ threshold</TableHead>
                <TableHead className="text-right">Our target</TableHead>
                <TableHead className="text-right">Per unit</TableHead>
                <TableHead className="text-right">Of pool</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byTarget.map((s: StateProjection) => (
                <TableRow key={s.code}>
                  <TableCell className="font-medium">
                    {s.slug ? (
                      <Link href={`/baseline/${s.slug}`} className="hover:underline">
                        {s.name}
                      </Link>
                    ) : (
                      s.name
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmt(s.projectedVotesCast)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {fmt(s.quarterThreshold)}
                  </TableCell>
                  <TableCell className="text-brand-blue text-right font-medium tabular-nums">
                    {fmt(s.target)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmt(s.perPollingUnit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      s.poolPct > 100 ? "text-brand-red font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.poolPct}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-brand-blue/40 text-brand-blue">
            Scenario saved in the address bar
          </Badge>
          {!generalElection.confirmed && (
            <Badge variant="outline">Polling day expected, not published</Badge>
          )}
        </div>
        <ShareBar
          className="mt-5"
          title="Forward this scenario"
          message={shareMessage}
          path={`/arithmetic?${scenarioToQuery(scenario)}`}
        />
      </section>
    </div>
  );
}
