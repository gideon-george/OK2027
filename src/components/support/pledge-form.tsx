"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandHeart, Loader2 } from "lucide-react";
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
import { useStateGeography } from "@/hooks/use-state-geography";
import { pledgeCategories } from "@/lib/support";
import { pledgeSchema, type PledgeInput } from "@/lib/validators/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentPolicyVersion } from "@/lib/site";
import { states } from "@/lib/geo";

export function PledgeForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PledgeInput>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      category: "",
      description: "",
      quantity: "",
      stateCode: "",
      lgaCode: "",
      availableNote: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      consent: false as unknown as true,
    },
  });

  const stateCode = form.watch("stateCode");
  const category = form.watch("category");
  const { geography } = useStateGeography(stateCode || undefined);

  const selected = pledgeCategories.find((c) => c.value === category);

  async function onSubmit(values: PledgeInput) {
    setError(null);
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const supabase = await getSupabase();
      const { error: insertError } = await supabase
        .from("support_pledges")
        .insert({
          category: values.category,
          description: values.description.trim(),
          quantity: values.quantity?.trim() || null,
          state_code: values.stateCode,
          lga_code: values.lgaCode || null,
          available_note: values.availableNote?.trim() || null,
          contact_name: values.contactName.trim(),
          contact_phone: values.contactPhone.trim(),
          contact_email: values.contactEmail?.trim() || null,
          consent_version: currentPolicyVersion,
          status: "offered",
        });
      if (insertError) throw insertError;
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not send your offer. Try again, or reach us on WhatsApp."
      );
    }
  }

  if (done) {
    return (
      <div className="border-brand-green/40 bg-brand-green/5 rounded-xl border p-6">
        <HandHeart className="text-brand-green size-7" />
        <h3 className="font-display pt-3 text-xl font-bold">Thank you.</h3>
        <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
          The National Director of Welfare and the National Treasurer are the
          only people who can see this offer. One of them will call you. If you
          would rather move faster, message us directly.
        </p>
        <ContactActions
          className="pt-4"
          size="sm"
          message="I have offered in-kind support to NOkM through the website and would like to follow up."
          subject="In-kind support follow-up"
        />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <BackendNotice
        action="Recording an offer of support"
        contactMessage="I want to support NOkM in kind. Here is what I can offer:"
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="pledge-category">What can you offer?</Label>
        <Select
          value={category}
          onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}
        >
          <SelectTrigger id="pledge-category" className="mt-1.5 w-full">
            <SelectValue placeholder="Choose a kind of support" />
          </SelectTrigger>
          <SelectContent>
            {pledgeCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <p className="text-muted-foreground pt-1.5 text-xs">
            {selected.examples}
          </p>
        )}
        {form.formState.errors.category && (
          <p role="alert" className="text-destructive pt-1 text-sm">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="pledge-description">Describe it</Label>
        <Textarea
          id="pledge-description"
          {...form.register("description")}
          rows={3}
          placeholder="e.g. A 14-seater bus with a driver, free on Saturdays, for PVC collection runs."
          className="mt-1.5"
        />
        {form.formState.errors.description && (
          <p role="alert" className="text-destructive pt-1 text-sm">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pledge-quantity">
            How much or how many{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="pledge-quantity"
            {...form.register("quantity")}
            placeholder="e.g. 2 vehicles, 500 posters, 10 hours a week"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="pledge-when">
            When is it available{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="pledge-when"
            {...form.register("availableNote")}
            placeholder="e.g. weekends, from October"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pledge-state">Where are you?</Label>
          <Select
            value={stateCode}
            onValueChange={(v) => {
              form.setValue("stateCode", v, { shouldValidate: true });
              form.setValue("lgaCode", "");
            }}
          >
            <SelectTrigger id="pledge-state" className="mt-1.5 w-full">
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
          <Label htmlFor="pledge-lga">
            LGA <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Select
            value={form.watch("lgaCode")}
            onValueChange={(v) => form.setValue("lgaCode", v)}
            disabled={!geography}
          >
            <SelectTrigger id="pledge-lga" className="mt-1.5 w-full">
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
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="pb-1.5 text-sm font-medium">
          How should we reach you?
        </legend>
        <div>
          <Label htmlFor="pledge-name">Name</Label>
          <Input id="pledge-name" {...form.register("contactName")} className="mt-1.5" />
          {form.formState.errors.contactName && (
            <p role="alert" className="text-destructive pt-1 text-sm">
              {form.formState.errors.contactName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="pledge-phone">Phone</Label>
          <Input
            id="pledge-phone"
            inputMode="tel"
            {...form.register("contactPhone")}
            placeholder="08031234567"
            className="mt-1.5"
          />
          {form.formState.errors.contactPhone && (
            <p role="alert" className="text-destructive pt-1 text-sm">
              {form.formState.errors.contactPhone.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="pledge-email">
            Email <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="pledge-email"
            type="email"
            {...form.register("contactEmail")}
            className="mt-1.5"
          />
        </div>
      </fieldset>

      <div className="bg-muted/40 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="pledge-consent"
            checked={form.watch("consent") === true}
            onCheckedChange={(v) =>
              form.setValue("consent", (v === true) as true, { shouldValidate: true })
            }
            className="mt-0.5"
          />
          <Label htmlFor="pledge-consent" className="text-sm leading-relaxed font-normal">
            I agree to NOkM holding these details so the Director of Welfare or
            the National Treasurer can contact me about this offer. I have read
            the{" "}
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

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Offer this support
      </Button>
    </form>
  );
}
