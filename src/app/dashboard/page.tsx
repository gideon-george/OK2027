import type { Metadata } from "next";
import { OfficerDashboard } from "@/components/dashboard/officer-dashboard";

export const metadata: Metadata = {
  title: "Officer dashboard",
  description:
    "Submit your weekly report, track your KPIs, and acknowledge directives.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <OfficerDashboard />
    </div>
  );
}
