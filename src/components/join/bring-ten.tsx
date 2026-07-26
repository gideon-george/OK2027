"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ShareCard } from "@/components/shared/share-card";
import { WhatsAppGlyph } from "@/components/shared/brand-icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { siteUrl } from "@/lib/site";

/** Milestones worth celebrating. Ten is the ask; the rest keep it going. */
const MILESTONES = [1, 5, 10, 25, 50, 100];

interface Standing {
  brought: number;
  wardRank: number | null;
  wardTotal: number | null;
  lgaRank: number | null;
}

function nextMilestone(brought: number): number {
  return MILESTONES.find((m) => m > brought) ?? brought;
}

/**
 * "Each One Bring Ten".
 *
 * Ranks the member inside their own ward first. A national leaderboard is
 * demotivating to everyone outside the top twenty; a ward leaderboard is
 * winnable by anybody, which is the point — the movement needs a hundred
 * thousand people who each brought ten, not ten people who each brought a
 * thousand.
 */
export function BringTen() {
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState("");
  const [standing, setStanding] = useState<Standing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Remember the code so a returning member does not retype it.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nokm.referralCode");
      if (saved) setCode(saved);
    } catch {
      /* private browsing */
    }
  }, []);

  const link = `${siteUrl.replace(/\/+$/, "")}/join?ref=${encodeURIComponent(checked || code)}`;
  const shareText = `I'm bringing ten people into the National OK Movement. Join through me and let's turn out our own ward:`;

  async function look() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);

    try {
      window.localStorage.setItem("nokm.referralCode", trimmed);
    } catch {
      /* private browsing */
    }

    if (!isSupabaseConfigured) {
      setChecked(trimmed);
      setStanding(null);
      setError(
        "Your count goes live with the member database. Your code and link work for sharing now — anyone who joins through them is recorded against you once it is switched on."
      );
      setLoading(false);
      return;
    }

    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const supabase = await getSupabase();

      const { data: mine, error: mineError } = await supabase
        .from("referral_counts")
        .select("referral_code, ward_code, brought")
        .eq("referral_code", trimmed)
        .maybeSingle();
      if (mineError) throw mineError;

      if (!mine) {
        setError("We do not recognise that code. Check it against your registration message.");
        setStanding(null);
        setChecked("");
        return;
      }

      // Rank inside the member's own ward.
      const { data: neighbours } = await supabase
        .from("referral_counts")
        .select("referral_code, brought")
        .eq("ward_code", mine.ward_code)
        .order("brought", { ascending: false });

      const list = neighbours ?? [];
      const wardRank = list.findIndex((r) => r.referral_code === trimmed) + 1;

      setChecked(trimmed);
      setStanding({
        brought: mine.brought ?? 0,
        wardRank: wardRank > 0 ? wardRank : null,
        wardTotal: list.length || null,
        lgaRank: null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not look that up.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy — select the link and copy it by hand.");
    }
  }

  const brought = standing?.brought ?? 0;
  const target = nextMilestone(brought);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-5">
        <Label htmlFor="ref-code">Your referral code</Label>
        <p className="text-muted-foreground pt-1 pb-3 text-sm leading-relaxed">
          It was shown to you when you registered. It is how the movement knows
          the ten people you bring are yours.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            id="ref-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. NOKM-4F2A"
            className="max-w-[16rem] font-mono"
          />
          <Button onClick={look} disabled={loading || !code.trim()}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Show my count
          </Button>
        </div>
        {error && (
          <p className="text-muted-foreground pt-3 text-sm leading-relaxed">
            {error}
          </p>
        )}
        <p className="text-muted-foreground pt-3 text-xs">
          Not registered yet?{" "}
          <Link href="/join" className="underline">
            Register and get your code
          </Link>
          .
        </p>
      </div>

      {checked && (
        <>
          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <Users className="text-brand-green size-5" />
              <h2 className="font-display text-xl font-bold">
                {standing ? `${brought} brought in` : "Your link is ready"}
              </h2>
            </div>

            {standing && (
              <>
                <Progress
                  value={Math.min(100, (brought / target) * 100)}
                  className="mt-4"
                />
                <p className="text-muted-foreground pt-2 text-sm">
                  {brought >= 10
                    ? `You have passed ten. Next milestone: ${target}.`
                    : `${Math.max(0, 10 - brought)} more to reach ten.`}
                </p>
                {standing.wardRank && standing.wardTotal && (
                  <p className="pt-3 text-sm">
                    <strong className="font-semibold">
                      #{standing.wardRank}
                    </strong>{" "}
                    of {standing.wardTotal} in your ward.
                  </p>
                )}
              </>
            )}

            <div className="pt-5">
              <Label htmlFor="ref-link" className="text-xs">
                Your link
              </Label>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <Input
                  id="ref-link"
                  readOnly
                  value={link}
                  className="min-w-[14rem] flex-1 text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
                  {copied ? (
                    <Check className="text-brand-green size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span className="sr-only">Copy your referral link</span>
                </Button>
                <Button asChild className="bg-brand-green hover:bg-brand-green/90 text-white">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppGlyph className="size-4" /> Send it
                  </a>
                </Button>
              </div>
            </div>

            <QrPanel link={link} />
          </div>

          <ShareCard
            fileName={`nokm-bring-ten-${checked}`}
            shareText={`${shareText} ${link}`}
            content={{
              eyebrow: "Each one bring ten",
              headline: standing
                ? `I have brought ${brought} into the movement.`
                : "I'm bringing ten into the movement.",
              figure: standing ? String(brought) : "10",
              figureLabel: standing ? "and counting" : "is the ask",
              lines: [`Join through my code: ${checked}`],
              footer: "Each one bring ten.",
            }}
          />
        </>
      )}
    </div>
  );
}

/**
 * QR for the referral link.
 *
 * Loaded on demand — the encoder is ~45 kB and only matters to someone
 * standing at a rally with a phone in their hand.
 */
function QrPanel({ link }: { link: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    (async () => {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(link, {
        margin: 1,
        width: 512,
        color: { dark: "#1a3a8f", light: "#ffffff" },
      });
      if (!cancelled) setDataUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [link, show]);

  if (!show) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 -ml-3"
        onClick={() => setShow(true)}
      >
        Show a QR code for rallies
      </Button>
    );
  }

  return (
    <div className="pt-5 text-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="QR code linking to your referral registration page"
          className="mx-auto size-44 rounded-lg border bg-white p-2"
        />
      ) : (
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      )}
      <p className="text-muted-foreground pt-2 text-xs">
        Let people scan this at meetings and rallies.
      </p>
    </div>
  );
}
