import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { appointments } from "@/lib/structure";
import { lessons } from "@/lib/lessons";
import { states, stateSlug } from "@/lib/geo";

// Required by `output: "export"` — metadata routes must be static.
export const dynamic = "force-static";

const staticRoutes = [
  { path: "", priority: 1 },
  { path: "/coverage", priority: 0.95 },
  { path: "/join", priority: 0.9 },
  { path: "/coverage/adopt", priority: 0.9 },
  { path: "/structure", priority: 0.9 },
  { path: "/leadership", priority: 0.85 },
  { path: "/aspirants", priority: 0.85 },
  { path: "/aspirants/ballot", priority: 0.85 },
  { path: "/support", priority: 0.85 },
  { path: "/vacancies", priority: 0.8 },
  { path: "/baseline", priority: 0.8 },
  { path: "/pvc", priority: 0.8 },
  { path: "/bring-ten", priority: 0.75 },
  { path: "/action-plan", priority: 0.7 },
  { path: "/learn", priority: 0.7 },
  { path: "/coverage/champions", priority: 0.6 },
  { path: "/leaderboard", priority: 0.6 },
  { path: "/about", priority: 0.6 },
  { path: "/aspirants/submit", priority: 0.5 },
  { path: "/support/ledger", priority: 0.5 },
  { path: "/rhythm", priority: 0.5 },
  { path: "/market", priority: 0.5 },
  { path: "/diaspora", priority: 0.5 },
  { path: "/store", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      priority: route.priority,
    })),
    ...appointments.map((appointment) => ({
      url: `${siteUrl}/structure/${appointment.slug}`,
      lastModified: now,
      priority: 0.5,
    })),
    ...lessons.map((lesson) => ({
      url: `${siteUrl}/learn/${lesson.slug}`,
      lastModified: now,
      priority: 0.5,
    })),
    ...states.map((state) => ({
      url: `${siteUrl}/baseline/${stateSlug(state)}`,
      lastModified: now,
      priority: 0.6,
    })),
    // One indexed, shareable page per state — a state coordinator sends their
    // own state's gap into their WhatsApp group, not the national page.
    ...states.map((state) => ({
      url: `${siteUrl}/coverage/${stateSlug(state)}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];
}
