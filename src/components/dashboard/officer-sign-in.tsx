"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { phoneSchema } from "@/lib/validators/forms";

/**
 * Phone one-time-code sign-in. There is no password anywhere in the movement's
 * systems — nothing to leak, nothing to reuse, nothing to phish.
 */
export function OfficerSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the number.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.replace(/^0/, "+234"),
    });
    setBusy(false);
    if (error) {
      setError("We couldn't send the code. Check the number and try again.");
      return;
    }
    setStep("code");
  }

  async function verify() {
    setBusy(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/^0/, "+234"),
      token: code,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      setError("That code didn't match. Request a new one and try again.");
      return;
    }
    onSignedIn();
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border p-6">
      <h2 className="font-display text-xl font-semibold">Officer sign-in</h2>
      <p className="text-muted-foreground pt-1 text-sm">
        Sign in with the phone number recorded against your appointment.
      </p>

      {step === "phone" ? (
        <div className="space-y-3 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="officer-phone">Phone number</Label>
            <Input
              id="officer-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08031234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={sendCode} disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="officer-code">6-digit code</Label>
            <Input
              id="officer-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-[0.4em]"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            onClick={verify}
            disabled={busy || code.length < 6}
            className="w-full"
          >
            {busy ? "Verifying…" : "Sign in"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
          >
            Use a different number
          </Button>
        </div>
      )}
    </div>
  );
}
