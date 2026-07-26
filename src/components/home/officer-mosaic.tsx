"use client";

import { PhotoProvider, useAllPhotos } from "@/components/shared/photo-provider";
import { useDataLight } from "@/components/shared/data-light";

/**
 * A wall of the movement's faces, drifting behind the wordmark.
 *
 * Purely decorative and aria-hidden — every officer it shows is already listed
 * as text on /leadership and /structure. Renders nothing at all until real
 * approved portraits exist, because a mosaic of placeholder squares would say
 * "nobody is here", which is the opposite of the point.
 */
function Mosaic() {
  const photos = useAllPhotos();
  const { lite } = useDataLight();

  // Below this it reads as a handful of stray tiles rather than a crowd.
  if (lite || photos.length < 12) return null;

  // Two rows, each duplicated so the marquee can loop seamlessly.
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)];

  return (
    <div
      aria-hidden
      className="relative overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex w-max gap-2 pb-2 motion-safe:animate-[mosaic-drift_60s_linear_infinite]"
          style={{
            animationDirection: i === 1 ? "reverse" : "normal",
            animationDuration: i === 1 ? "78s" : "60s",
          }}
        >
          {[...row, ...row].map((photo, j) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${photo.url}-${j}`}
              src={photo.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-16 shrink-0 rounded-md object-cover opacity-60 sm:w-20"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function OfficerMosaic() {
  return (
    <PhotoProvider>
      <Mosaic />
    </PhotoProvider>
  );
}
