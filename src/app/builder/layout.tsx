import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Business Idea Builder",
  description:
    "Generate personalized business ideas based on your skills, budget, and location. Get a complete deep dive with market research, financial projections, and a launch checklist.",
  keywords: [
    "business idea generator",
    "AI business planning",
    "startup ideas",
    "business plan generator",
    "entrepreneur tools",
  ],
  openGraph: {
    title: "AI Business Idea Builder | SparkLocal",
    description:
      "Generate personalized business ideas and get a complete launch plan with market research, financials, and local resources.",
    url: "https://sparklocal.co/builder",
  },
  alternates: {
    canonical: "https://sparklocal.co/builder",
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
