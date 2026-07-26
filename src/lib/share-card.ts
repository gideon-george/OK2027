/**
 * Share cards, drawn in the browser.
 *
 * These exist because distribution for this movement is a WhatsApp forward and
 * a WhatsApp Status post, and both are images. A card that names a real place
 * and a real person is shared; a link is not.
 *
 * Drawn on a canvas at request time rather than generated at build: there are
 * 176,379 possible polling units and 8,874 wards, so pre-rendering is not an
 * option, and a static export has no server to render on.
 */

export type CardShape = "square" | "story";

export interface CardContent {
  /** Small label above the headline, e.g. "POLLING UNIT CHAMPION". */
  eyebrow: string;
  /** The line that carries the message. Wraps. */
  headline: string;
  /** Up to four supporting lines, e.g. the ward, LGA and state. */
  lines?: string[];
  /** Large figure shown under the headline, e.g. "485 units". */
  figure?: string;
  figureLabel?: string;
  /** Overrides the default call to action at the foot of the card. */
  footer?: string;
}

const SIZES: Record<CardShape, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
};

const BRAND_RED = "#d1232a";
const BRAND_GREEN = "#0b7a3b";

/**
 * next/font generates a hashed family name. Reading it off the document keeps
 * the card in the site's typeface; the fallback keeps it legible if the font
 * has not finished loading.
 */
function fontStack(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function drawCard(
  canvas: HTMLCanvasElement,
  content: CardContent,
  shape: CardShape
): void {
  const { w, h } = SIZES[shape];
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const display = fontStack("--font-display", "system-ui, sans-serif");
  const body = fontStack("--font-body", "system-ui, sans-serif");
  const pad = 88;
  const contentWidth = w - pad * 2;

  // ------------------------------------------------------------- background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#16307b");
  bg.addColorStop(0.55, "#1a3a8f");
  bg.addColorStop(1, "#0b1a45");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.85, 0, 0, w * 0.85, 0, w * 0.9);
  glow.addColorStop(0, "rgba(255,255,255,0.16)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // The tricolor keel, top and bottom.
  const stripe = 14;
  const thirds = [BRAND_RED, "#4a72d8", BRAND_GREEN];
  thirds.forEach((colour, i) => {
    ctx.fillStyle = colour;
    ctx.fillRect((w / 3) * i, 0, w / 3, stripe);
    ctx.fillRect((w / 3) * i, h - stripe, w / 3, stripe);
  });

  // ---------------------------------------------------------------- wordmark
  let y = pad + 34;
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 54px ${display}`;
  const marks: Array<[string, string]> = [
    ["N", "#ffffff"],
    ["O", "#ff8f92"],
    ["k", "#ffffff"],
    ["M", "#a9c0ff"],
  ];
  let x = pad;
  for (const [char, colour] of marks) {
    ctx.fillStyle = colour;
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width;
  }
  ctx.font = `600 22px ${body}`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("NATIONAL OK MOVEMENT", pad + 4, y + 34);

  // ----------------------------------------------------------------- eyebrow
  y += shape === "story" ? 220 : 130;
  ctx.font = `700 26px ${body}`;
  ctx.fillStyle = "#ff8f92";
  ctx.fillText(content.eyebrow.toUpperCase(), pad, y);

  // ---------------------------------------------------------------- headline
  y += 34;
  const headlineSize = shape === "story" ? 96 : 82;
  ctx.font = `800 ${headlineSize}px ${display}`;
  ctx.fillStyle = "#ffffff";
  for (const line of wrap(ctx, content.headline, contentWidth)) {
    y += headlineSize + 6;
    ctx.fillText(line, pad, y);
  }

  // ------------------------------------------------------------------ figure
  if (content.figure) {
    y += shape === "story" ? 110 : 80;
    const figureSize = shape === "story" ? 150 : 120;
    ctx.font = `800 ${figureSize}px ${display}`;
    ctx.fillStyle = "#8fe0ac";
    ctx.fillText(content.figure, pad, y);
    if (content.figureLabel) {
      y += 44;
      ctx.font = `600 32px ${body}`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(content.figureLabel, pad, y);
    }
  }

  // ------------------------------------------------------------------- lines
  if (content.lines?.length) {
    y += shape === "story" ? 92 : 66;
    ctx.font = `500 36px ${body}`;
    for (const line of content.lines.slice(0, 4)) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("•", pad, y);
      for (const wrapped of wrap(ctx, line, contentWidth - 44)) {
        ctx.fillText(wrapped, pad + 44, y);
        y += 52;
      }
      y += 8;
    }
  }

  // ------------------------------------------------------------------ footer
  ctx.font = `700 34px ${display}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    content.footer ?? "A New Nigeria Is Possible.",
    pad,
    h - pad - 46
  );
  ctx.font = `500 28px ${body}`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Join at the National OK Movement", pad, h - pad - 4);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not render the card."))),
      "image/png"
    );
  });
}
