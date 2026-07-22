import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { appointments } from "@/lib/structure";
import { lessons } from "@/lib/lessons";

// Required by `output: "export"` — metadata routes must be static.
export const dynamic = "force-static";

const staticRoutes = [
  { path: "", priority: 1 },
  { path: "/join", priority: 0.9 },
  { path: "/structure", priority: 0.9 },
  { path: "/vacancies", priority: 0.8 },
  { path: "/action-plan", priority: 0.7 },
  { path: "/pvc", priority: 0.8 },
  { path: "/learn", priority: 0.7 },
  { path: "/leaderboard", priority: 0.6 },
  { path: "/rhythm", priority: 0.5 },
  { path: "/market", priority: 0.5 },
  { path: "/store", priority: 0.4 },
  { path: "/diaspora", priority: 0.5 },
  { path: "/about", priority: 0.6 },
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
  ];
}
