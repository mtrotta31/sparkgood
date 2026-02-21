// Resources Directory Layout
// Applies light theme to all /resources pages while keeping /builder dark

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Business Resources Directory | SparkLocal",
    template: "%s | SparkLocal",
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream text-slate-dark">
      {children}
    </div>
  );
}
