import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example Business Plan: Austin Pour Co. | SparkLocal",
  description:
    "See a complete AI-generated business launch plan. Market research, financial projections, step-by-step checklist, local resources, and AI advisor — all personalized for a real business idea.",
  keywords: [
    "AI business plan example",
    "business plan template",
    "mobile bar business plan",
    "startup checklist",
    "market research example",
    "financial projections template",
    "Austin small business",
    "event catering business",
  ],
  openGraph: {
    title: "Example Business Plan: Austin Pour Co. | SparkLocal",
    description:
      "See a complete AI-generated business launch plan. Market research, financial projections, step-by-step checklist, local resources, and AI advisor.",
    url: "https://sparklocal.co/builder/example",
    siteName: "SparkLocal",
    type: "website",
    images: [
      {
        url: "/og-example-deep-dive.png",
        width: 1200,
        height: 630,
        alt: "Austin Pour Co. - Example Deep Dive Business Plan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Example Business Plan: Austin Pour Co. | SparkLocal",
    description:
      "See a complete AI-generated business launch plan with market research, financial projections, and step-by-step checklist.",
    images: ["/og-example-deep-dive.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sparklocal.co/builder/example",
  },
};

export default function ExampleDeepDiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
