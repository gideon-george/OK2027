"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { joinSchema, type JoinInput } from "@/lib/validators/forms";
import { currentPolicyVersion, independenceDisclaimer } from "@/lib/site";
import { hasLgaData, lgasForState, states } from "@/lib/geo";
import { stateCoordinator } from "@/lib/structure";

const DRAFT_KEY = "nokm:join-draft";

const pvcOptions = [
  { value: "yes", label: "Yes, I have my PVC" },
  { value: "no", label: "No, not registered yet" },
  { value: "in_progress", label: "Registered — waiting to collect it" },
] as const;

function makeReferralCode(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${initials || "NK"}-${suffix}`;
}

export function JoinForm() {
  const [step, setStep] = useState<"details" | "verify" | "done">("details");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");

  const form = useForm<JoinInput>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      stateCode: "",
      lgaCode: "",
      wardCode: "",
      referredBy: "",
    },
  });

  const stateCode = form.watch("stateCode");
  const lgaCode = form.watch("lgaCode");

  const lgas = useMemo(
    () => (stateCode ? lgasForState(stateCode) : null),
    [stateCode]
  );
  const wards = useMemo(
    () => lgas?.find((l) => l.code === lgaCode)?.wards ?? null,
    [lgas, lgaCode]
  );

  const coordinator = stateCode ? stateCoordinator(stateCode) : undefined;

  // Registrations happen on patchy mobile connections. Keeping a draft means a
  // dropped signal costs a reload, not a lost member.
  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        form.reset({ ...form.getValues(), ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    }
    // Referral links are the movement's main growth channel, so ?ref= is read
    // here rather than server-side — this is a static export with no server.
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && !form.getValues("referredBy")) {
      form.setValue("referredBy", ref.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const { ...rest } = values;
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <BackendNotice action="Member registration" />
        <p className="text-muted-foreground text-sm leading-relaxed">
          In the meantime, the fastest way to be counted is to contact your
          state coordinator through the structure directory — every office has a
          contact form that reaches it directly.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/structure">Find your state coordinator</Link>
        </Button>
      </div>
    );
  }

  async function sendCode(values: JoinInput) {
    setBusy(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      phone: values.phone.replace(/^0/, "+234"),
    });
    setBusy(false);
    if (error) {
      setError("We couldn't send the code. Check the number and try again.");
      return;
    }
    setStep("verify");
  }

  async function verifyAndRegister() {
    const values = form.getValues();
    setBusy(true);
    setError(null);

    const supabase = await getSupabase();
    const phone = values.phone.replace(/^0/, "+234");

    const { data, error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (otpError || !data.user) {
      setBusy(false);
      setError("That code didn't match. Request a new one and try again.");
      return;
    }

    const code = makeReferralCode(values.fullName);
    const { error: insertError } = await supabase.from("members").upsert(
      {
        id: data.user.id,
        full_name: values.fullName,
        state_code: values.stateCode,
        lga_code: values.lgaCode || null,
        ward_code: values.wardCode || null,
        has_pvc: values.pvcStatus === "yes",
        pvc_status: values.pvcStatus,
        referral_code: code,
        referred_by: values.referredBy || null,
        consent_version: currentPolicyVersion,
        consent_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    setBusy(false);
    if (insertError) {
      setError("Your number is verified but we couldn't save your details. Please try again.");
      return;
    }

    window.localStorage.removeItem(DRAFT_KEY);
    setReferralCode(code);
    setStep("done");
  }

  if (step === "done") {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?ref=${referralCode}`
        : "";
    return (
      <div className="space-y-5">
        <div className="border-brand-green/40 bg-brand-green/5 rounded-lg border p-5">
          <h2 className="font-display text-xl font-bold">
            You are registered.
          </h2>
          <p className="text-muted-foreground pt-1 text-sm">
            Welcome to the National OK Movement.
          </p>
        </div>

        {coordinator?.filled && (
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Your state coordinator
            </p>
            <p className="pt-1 font-semibold">{coordinator.holderName}</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={`/structure/${coordinator.slug}`}>
                Contact this office
              </Link>
            </Button>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Your referral code
          </p>
          <p className="font-display pt-1 text-2xl font-bold tracking-wider">
            {referralCode}
          </p>
          <p className="text-muted-foreground pt-2 text-sm">
            Share this link. Everyone who joins through it is credited to you
            and to your ward.
          </p>
          {shareUrl && (
            <Input readOnly value={shareUrl} className="mt-2 text-xs" />
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/learn">Start the civic lessons</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pvc">Check the PVC drive</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Enter your code
          </h2>
          <p className="text-muted-foreground pt-1 text-sm">
            We sent a 6-digit code by SMS to {form.getValues("phone")}.
          </p>
        </div>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
          aria-label="Verification code"
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={verifyAndRegister} disabled={busy || otp.length < 6}>
            {busy ? "Verifying…" : "Verify and join"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError(null);
            }}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(sendCode)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="08031234567"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We send a one-time code to confirm it is you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stateCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={(v) => {
                  field.onChange(v);
                  form.setValue("lgaCode", "");
                  form.setValue("wardCode", "");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {stateCode && !hasLgaData(stateCode) && (
          <p className="text-muted-foreground bg-muted/40 rounded-md border p-3 text-sm">
            The LGA and ward register for this state is still being imported.
            Register now — your state coordinator will place you in your ward as
            soon as the official list lands.
          </p>
        )}

        {lgas && (
          <FormField
            control={form.control}
            name="lgaCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local government area</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("wardCode", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your LGA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lgas.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {wards && wards.length > 0 && (
          <FormField
            control={form.control}
            name="wardCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your ward" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.code}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Ward names for this state are placeholders pending the
                  official INEC register.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="pvcStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your PVC</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="gap-2"
                >
                  {pvcOptions.map((option) => (
                    <label
                      key={option.value}
                      className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm"
                    >
                      <RadioGroupItem value={option.value} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                We never ask for your PVC or VIN number — only whether you have
                one.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referredBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Referral code{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="AB-X7K2P" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-muted/40 rounded-lg border p-4">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {independenceDisclaimer}
          </p>
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-sm leading-relaxed font-normal">
                  I consent to NOkM storing and processing these details to
                  register me as a member and organise me in my ward. I have
                  read the{" "}
                  <Link href="/privacy" className="text-primary underline">
                    privacy notice
                  </Link>
                  .
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Sending code…" : "Join the movement"}
        </Button>
      </form>
    </Form>
  );
}
