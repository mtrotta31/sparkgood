import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the right SparkLocal plan for your business. Free idea generation, or unlock Deep Dives and Launch Kits with Spark ($14.99/mo) or Ignite ($29.99/mo) subscriptions.",
  keywords: [
    "SparkLocal pricing",
    "business planning subscription",
    "startup tools pricing",
    "deep dive pricing",
    "launch kit pricing",
  ],
  openGraph: {
    title: "Pricing | SparkLocal",
    description:
      "Unlock AI-powered business planning tools. Free tier available, or subscribe for unlimited Deep Dives and Launch Kits.",
    url: "https://sparklocal.co/pricing",
  },
  alternates: {
    canonical: "https://sparklocal.co/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
