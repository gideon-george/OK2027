"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up the first time it scrolls into view.
 *
 * Renders the final value on the server and on first paint, so the static
 * export, search engines and anyone without JavaScript see the real figure.
 * The animation is a decoration applied afterwards, never the source of truth.
 */
export function CountUp({
  value,
  duration = 1100,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;
    let start: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        setDisplay(0);

        const step = (now: number) => {
          start ??= now;
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic: fast start, settles onto the real number.
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-NG")}
      {suffix}
    </span>
  );
}
