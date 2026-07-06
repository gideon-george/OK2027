import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zones, pilotStates } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Pilot network",
  description:
    "The OK2027 pilot covers the Federal Capital Territory and Anambra State — explore the zones, states, and local government areas.",
};

export default function NetworkPage() {
  const totalLgas = pilotStates.reduce((n, s) => n + s.lgas.length, 0);
  const totalWards = pilotStates.reduce(
    (n, s) => n + s.lgas.reduce((m, l) => m + l.wards.length, 0),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        The network
      </h1>
      <p className="max-w-2xl pt-2 text-muted-foreground">
        Nigeria organises its elections through six geopolitical zones, 36
        states plus the FCT, 774 local government areas, and over 176,000
        polling units. OK2027&apos;s pilot starts small on purpose: the Federal
        Capital Territory and Anambra State.
      </p>

      <section className="pt-10">
        <h2 className="font-display pb-4 text-xl font-semibold">
          Zones &amp; states
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <Card key={zone.code}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {zone.name}
                  <Badge variant="secondary">{zone.code}</Badge>
                </CardTitle>
                <CardDescription>
                  {zone.code === "DIASPORA"
                    ? "Nigerians abroad — community spaces by country."
                    : zone.states.join(" · ")}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-12">
        <div className="flex flex-wrap items-center gap-3 pb-1">
          <h2 className="font-display text-xl font-semibold">Pilot coverage</h2>
          <Badge className="bg-primary">
            {pilotStates.length} states · {totalLgas} LGAs · {totalWards} wards
          </Badge>
        </div>
        <p className="max-w-2xl pb-4 text-sm text-muted-foreground">
          LGA names below are real. Ward-level entries are placeholder data
          until the official INEC register is imported — they show the shape of
          the network, not the final map.
        </p>
        <Tabs defaultValue={pilotStates[0]?.code}>
          <TabsList>
            {pilotStates.map((state) => (
              <TabsTrigger key={state.code} value={state.code}>
                {state.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {pilotStates.map((state) => (
            <TabsContent key={state.code} value={state.code}>
              <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {state.lgas.map((lga) => (
                  <Card key={lga.code}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{lga.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {lga.wards.length} wards
                      {lga.wards.some((w) => w.placeholder) && " (placeholder)"}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
