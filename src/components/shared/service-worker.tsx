"use client";

import { useEffect } from "react";
import { basePath } from "@/lib/site";

/**
 * Registers the service worker.
 *
 * Registration waits for `load` so it never competes with the first render on
 * a slow connection — the point is to make the second visit cheap, not to slow
 * the first one down.
 *
 * Skipped entirely in development: a service worker caching a dev build is a
 * reliable way to spend an afternoon debugging a page that was fixed an hour
 * ago.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
        .catch(() => {
          /* offline support is an enhancement; the site works without it */
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
