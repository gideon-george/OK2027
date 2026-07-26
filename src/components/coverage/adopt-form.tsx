"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PartyPopper } from "lucide-react";
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
import { ShareCard } from "@/components/shared/share-card";
import { ContactActions } from "@/components/shared/contact-actions";
import { useStateGeography, wardsForLga } from "@/hooks/use-state-geography";
import { adoptSchema, type AdoptInput } from "@/lib/validators/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentPolicyVersion, independenceDisclaimer } from "@/lib/site";
import { states } from "@/lib/geo";

const DRAFT_KEY = "nokm.adoptDraft";

export function AdoptForm() {
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState<AdoptInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AdoptInput>({
    resolver: zodResolver(adoptSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      stateCode: params.get("state") ?? "",
      lgaCode: params.get("lga") ?? "",
      wardCode: params.get("ward") ?? "",
      puLabel: "",
      pledgeNote: "",
      consent: false as unknown as true,
    },
  });

  const stateCode = form.watch("stateCode");
  const lgaCode = form.watch("lgaCode");
  const wardCode = form.watch("wardCode");

  const { geography, loading } = useStateGeography(stateCode || undefined);
  const wards = wardsForLga(geography, lgaCode || undefined);

  // A dropped signal mid-form should cost a reload, not the claim.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) form.reset({ ...form.getValues(), ...JSON.parse(saved) });
    } catch {
      /* ignore a corrupt draft */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      try {
        // Consent is never restored from a draft — it must be given freshly,
        // in this session, by this person. NDPA 2023.
        const rest = { ...values };
        delete rest.consent;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } catch {
        /* private browsing */
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: AdoptInput) {
    setError(null);
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const supabase = await getSupabase();
      const { error: insertError } = await supabase
        .from("polling_unit_adoptions")
        .insert({
          state_code: values.stateCode,
          lga_code: values.lgaCode,
          ward_code: values.wardCode,
          pu_label: values.puLabel.trim(),
          full_name: values.fullName.trim(),
          phone: values.phone.trim(),
          pledge_note: values.pledgeNote?.trim() || null,
          consent_version: currentPolicyVersion,
          status: "claimed",
        });

      if (insertError) {
        // The partial unique indexes are the movement's rules, surfaced.
        if (insertError.code === "23505") {
          setError(
            "That polling unit has already been claimed, or you already hold a claim. One person, one unit — talk to your LGA Coordinator if this looks wrong."
          );
          return;
        }
        throw insertError;
      }

      window.localStorage.removeItem(DRAFT_KEY);
      // Lets the home page offer the next step rather than this one again.
      try {
        window.localStorage.setItem("nokm.adopted", "1");
      } catch {
        /* private browsing */
      }
      setSubmitted(values);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your claim. Try again on a better connection."
      );
    }
  }

  // ------------------------------------------------------------- claimed
  if (submitted) {
    const state = states.find((s) => s.code === submitted.stateCode);
    const lga = geography?.lgas.find((l) => l.code === submitted.lgaCode);
    const ward = wards?.find((w) => w.code === submitted.wardCode);
    const firstName = submitted.fullName.trim().split(/\s+/)[0];

    return (
      <div className="space-y-6">
        <div className="border-brand-green/40 bg-brand-green/5 rounded-xl border p-6">
          <PartyPopper className="text-brand-green size-7" />
          <h2 className="font-display pt-3 text-2xl font-bold">
            {firstName}, that unit is yours.
          </h2>
          <p className="text-muted-foreground pt-2 leading-relaxed">
            {submitted.puLabel} in {ward?.name}, {lga?.name}, {state?.name}. Your
            LGA Coordinator will confirm it and get in touch. Until then, you are
            recorded as the person standing for that unit.
          </p>
        </div>

        <ShareCard
          fileName={`nokm-champion-${submitted.wardCode}`}
          shareText={`I am standing for my polling unit — ${submitted.puLabel}, ${ward?.name ?? ""}, ${lga?.name ?? ""}. Take yours:`}
          content={{
            eyebrow: "Polling unit champion",
            headline: `I am standing for ${submitted.puLabel}.`,
            lines: [
              `${ward?.name ?? ""} ward`,
              `${lga?.name ?? ""} LGA, ${state?.name ?? ""}`,
              firstName,
            ].filter(Boolean),
            footer: "Take your own polling unit.",
          }}
        />

        <div className="rounded-xl border p-5">
          <h3 className="font-display font-bold">Now bring ten</h3>
          <p className="text-muted-foreground pt-1.5 text-sm leading-relaxed">
            One person cannot turn out a polling unit alone. Register as a
            member to get your referral code, and bring ten people from your own
            street.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button asChild size="sm">
              <Link href="/join">Register and get my code</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/coverage/champions">See the wall of champions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------ not live
  if (!isSupabaseConfigured) {
    return (
      <BackendNotice
        action="Adopting a polling unit"
        contactMessage="I want to stand for my polling unit for NOkM. Please record my details."
      />
    );
  }

  const selectedLga = geography?.lgas.find((l) => l.code === lgaCode);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* ------------------------------------------------------------ place */}
      <fieldset className="space-y-4">
        <legend className="font-display pb-1 font-semibold">
          Which unit are you taking?
        </legend>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="adopt-state">State</Label>
            <Select
              value={stateCode}
              onValueChange={(v) => {
                form.setValue("stateCode", v);
                form.setValue("lgaCode", "");
                form.setValue("wardCode", "");
              }}
            >
              <SelectTrigger id="adopt-state" className="mt-1.5 w-full">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="adopt-lga">LGA</Label>
            <Select
              value={lgaCode}
              onValueChange={(v) => {
                form.setValue("lgaCode", v);
                form.setValue("wardCode", "");
              }}
              disabled={!geography}
            >
              <SelectTrigger id="adopt-lga" className="mt-1.5 w-full">
                <SelectValue placeholder={loading ? "Loading…" : "Select"} />
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
            <Label htmlFor="adopt-ward">Ward</Label>
            <Select
              value={wardCode}
              onValueChange={(v) => form.setValue("wardCode", v)}
              disabled={!wards}
            >
              <SelectTrigger id="adopt-ward" className="mt-1.5 w-full">
                <SelectValue placeholder="Select" />
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

        <div>
          <Label htmlFor="adopt-pu">
            Your polling unit, as it is written at the unit
          </Label>
          <Input
            id="adopt-pu"
            {...form.register("puLabel")}
            placeholder="e.g. 004 — Central Primary School"
            className="mt-1.5"
          />
          <p className="text-muted-foreground pt-1.5 text-xs leading-relaxed">
            The name or number on the board at your polling unit, or on your
            PVC.{" "}
            {selectedLga
              ? `${selectedLga.name} has ${selectedLga.wards} wards on the register.`
              : ""}{" "}
            We record what you type and your LGA Coordinator confirms it.
          </p>
          {form.formState.errors.puLabel && (
            <p role="alert" className="text-destructive pt-1 text-sm">
              {form.formState.errors.puLabel.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* -------------------------------------------------------------- you */}
      <fieldset className="space-y-4">
        <legend className="font-display pb-1 font-semibold">You</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="adopt-name">Full name</Label>
            <Input id="adopt-name" {...form.register("fullName")} className="mt-1.5" />
            {form.formState.errors.fullName && (
              <p role="alert" className="text-destructive pt-1 text-sm">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="adopt-phone">Phone</Label>
            <Input
              id="adopt-phone"
              inputMode="tel"
              {...form.register("phone")}
              placeholder="08031234567"
              className="mt-1.5"
            />
            {form.formState.errors.phone && (
              <p role="alert" className="text-destructive pt-1 text-sm">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="adopt-note">
            What will you do at this unit? <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="adopt-note"
            {...form.register("pledgeNote")}
            rows={3}
            maxLength={500}
            placeholder="e.g. I will register 50 new voters and check that everyone on my street has collected their PVC."
            className="mt-1.5"
          />
        </div>
      </fieldset>

      {/* ---------------------------------------------------------- consent */}
      <div className="bg-muted/40 rounded-lg border p-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          {independenceDisclaimer}
        </p>
        <div className="flex items-start gap-3 pt-3">
          <Checkbox
            id="adopt-consent"
            checked={form.watch("consent") === true}
            onCheckedChange={(v) =>
              form.setValue("consent", (v === true) as true, {
                shouldValidate: true,
              })
            }
            className="mt-0.5"
          />
          <Label htmlFor="adopt-consent" className="text-sm leading-relaxed font-normal">
            I agree to NOkM holding my name and phone number so my LGA
            Coordinator can reach me about this polling unit. I have read the{" "}
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
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
          )}
          I&apos;ll take this unit
        </Button>
        <ContactActions
          size="sm"
          variant="secondary"
          message="I want to stand for my polling unit for NOkM."
        />
      </div>
    </form>
  );
}
