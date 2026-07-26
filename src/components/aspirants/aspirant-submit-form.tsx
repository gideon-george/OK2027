"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackendNotice } from "@/components/shared/backend-notice";
import { ContactActions } from "@/components/shared/contact-actions";
import { races } from "@/lib/races";
import { states } from "@/lib/geo";
import { aspirantSchema, type AspirantInput } from "@/lib/validators/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AspirantSubmitForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AspirantInput>({
    resolver: zodResolver(aspirantSchema),
    defaultValues: {
      fullName: "",
      race: "",
      stateCode: "",
      constituencyRef: "",
      party: "",
      manifesto: "",
      contact: "",
      consent: false as unknown as true,
    },
  });

  const raceKey = form.watch("race");
  const isPresidential = raceKey === "president";

  async function onSubmit(values: AspirantInput) {
    setError(null);
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const supabase = await getSupabase();

      const bullets = values.manifesto
        .split("\n")
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 5);

      const { error: insertError } = await supabase.from("aspirants").insert({
        full_name: values.fullName.trim(),
        race: values.race,
        state_code: values.race === "president" ? null : values.stateCode,
        constituency_ref: values.constituencyRef?.trim() || null,
        party: values.party?.trim() || null,
        manifesto: bullets.length > 0 ? bullets : null,
        verification: "self_declared",
        status: "pending",
        consent_recorded_at: new Date().toISOString(),
        consent_contact: values.contact.trim(),
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not send that. Try again."
      );
    }
  }

  if (done) {
    return (
      <div className="border-brand-green/40 bg-brand-green/5 rounded-xl border p-6">
        <CheckCircle2 className="text-brand-green size-7" />
        <h2 className="font-display pt-3 text-xl font-bold">Request received</h2>
        <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
          A national officer will review it. Nothing appears on the public
          directory until then, and appearing there is not an endorsement.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/aspirants">Back to the directory</Link>
        </Button>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <BackendNotice
        action="Requesting a listing in the aspirants directory"
        contactMessage="I am contesting a seat in 2027 and would like to be listed in the NOkM aspirants directory."
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="asp-name">Full name</Label>
          <Input id="asp-name" {...form.register("fullName")} className="mt-1.5" />
          {form.formState.errors.fullName && (
            <p role="alert" className="text-destructive pt-1 text-sm">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="asp-race-select">Which seat?</Label>
          <Select
            value={raceKey}
            onValueChange={(v) => form.setValue("race", v, { shouldValidate: true })}
          >
            <SelectTrigger id="asp-race-select" className="mt-1.5 w-full">
              <SelectValue placeholder="Select a race" />
            </SelectTrigger>
            <SelectContent>
              {races.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.race && (
            <p role="alert" className="text-destructive pt-1 text-sm">
              {form.formState.errors.race.message}
            </p>
          )}
        </div>
      </div>

      {!isPresidential && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="asp-state-select">State</Label>
            <Select
              value={form.watch("stateCode")}
              onValueChange={(v) =>
                form.setValue("stateCode", v, { shouldValidate: true })
              }
            >
              <SelectTrigger id="asp-state-select" className="mt-1.5 w-full">
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
            {form.formState.errors.stateCode && (
              <p role="alert" className="text-destructive pt-1 text-sm">
                {form.formState.errors.stateCode.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="asp-constituency">
              Constituency{" "}
              <span className="text-muted-foreground font-normal">
                (as INEC names it)
              </span>
            </Label>
            <Input
              id="asp-constituency"
              {...form.register("constituencyRef")}
              className="mt-1.5"
            />
            <p className="text-muted-foreground pt-1.5 text-xs leading-relaxed">
              We cannot yet check this against INEC&apos;s delimitation, so it
              is shown as unverified until an officer confirms it.
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="asp-party">
          Party <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input id="asp-party" {...form.register("party")} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="asp-manifesto">
          Five things you will do, one per line
        </Label>
        <Textarea
          id="asp-manifesto"
          {...form.register("manifesto")}
          rows={5}
          placeholder={"Fix the Ikeja–Agege road\nStaff every primary school in the constituency\n…"}
          className="mt-1.5"
        />
        <p className="text-muted-foreground pt-1.5 text-xs">
          Five lines maximum, in your own words. Anything beyond five is
          dropped.
        </p>
        {form.formState.errors.manifesto && (
          <p role="alert" className="text-destructive pt-1 text-sm">
            {form.formState.errors.manifesto.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="asp-contact">Contact for verification</Label>
        <Input
          id="asp-contact"
          {...form.register("contact")}
          placeholder="Phone or email the vetting officer can reach you on"
          className="mt-1.5"
        />
        <p className="text-muted-foreground pt-1.5 text-xs">
          Not published. Used only to confirm the listing is genuinely yours.
        </p>
        {form.formState.errors.contact && (
          <p role="alert" className="text-destructive pt-1 text-sm">
            {form.formState.errors.contact.message}
          </p>
        )}
      </div>

      <div className="bg-muted/40 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="asp-consent"
            checked={form.watch("consent") === true}
            onCheckedChange={(v) =>
              form.setValue("consent", (v === true) as true, { shouldValidate: true })
            }
            className="mt-0.5"
          />
          <Label htmlFor="asp-consent" className="text-sm leading-relaxed font-normal">
            I am this person, or I have their written agreement. I consent to
            this information appearing in the public NOkM aspirants directory,
            and I understand that being listed is not an endorsement by the
            movement. I have read the{" "}
            <Link href="/privacy" className="underline">
              privacy notice
            </Link>
            .
          </Label>
        </div>
        {form.formState.errors.consent && (
          <p role="alert" className="text-destructive pt-2 text-sm">
            {form.formState.errors.consent.message}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Send for review
        </Button>
        <ContactActions
          size="sm"
          variant="secondary"
          message="I am contesting a seat in 2027 and want to be listed in the NOkM aspirants directory."
        />
      </div>
    </form>
  );
}
