import type { SocialLink } from "@/lib/site";

/**
 * Simple monochrome glyphs for the social platforms.
 *
 * This version of lucide-react ships no brand icons, and hand-copying official
 * logo artwork would mean shipping trademarked marks we cannot verify. These
 * are deliberately plain geometric stand-ins built from basic shapes —
 * recognisable in a footer row, and honest about being generic. Each is
 * always paired with a text label for screen readers.
 */

type GlyphProps = { className?: string };

function Instagram({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M15 8h-1.5A1.5 1.5 0 0 0 12 9.5V21" strokeLinecap="round" />
      <path d="M9.5 13h5" strokeLinecap="round" />
    </svg>
  );
}

function XMark({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </svg>
  );
}

function Telegram({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M21 4L3 11l5.5 2L21 4z" strokeLinejoin="round" />
      <path d="M21 4l-3 15-6.5-6L21 4z" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedIn({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8.2" r="1.1" fill="currentColor" stroke="none" />
      <path d="M8 11v6" strokeLinecap="round" />
      <path d="M12 17v-3.4a2.1 2.1 0 0 1 4.2 0V17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YouTube({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTok({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="8.5" cy="16.5" r="3.5" />
      <path d="M12 16.5V4c.7 2.6 2.4 4 5 4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.2c0 3 2.3 5.3 5.3 5.3l.9-1.4-1.9-.9-.8.8a4.4 4.4 0 0 1-2-2l.8-.8-.9-1.9-1.4.9z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export const socialGlyphs: Record<
  SocialLink["platform"],
  (props: GlyphProps) => React.ReactElement
> = {
  Instagram,
  Facebook,
  X: XMark,
  Telegram,
  LinkedIn,
  YouTube,
  TikTok,
  "WhatsApp Channel": WhatsAppGlyph,
};

export { WhatsAppGlyph };
