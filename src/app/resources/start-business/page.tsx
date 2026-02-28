// State Business Guides Index Page
// Grid of all 50 US state business formation guides

import Link from "next/link";
import type { Metadata } from "next";
import { STATE_GUIDES } from "@/data/state-guides";

export const metadata: Metadata = {
  title: "How to Start a Business in Every US State",
  description:
    "Complete guides to starting a business in all 50 US states. Learn about state registration, taxes, licenses, permits, and key industries for each state.",
  keywords: [
    "how to start a business",
    "business registration by state",
    "state business guides",
    "LLC formation",
    "small business startup",
    "state business taxes",
  ],
  openGraph: {
    title: "How to Start a Business in Every US State",
    description:
      "Complete guides to starting a business in all 50 US states. Learn about state registration, taxes, licenses, and key industries.",
    type: "website",
    siteName: "SparkLocal",
    url: "https://sparklocal.co/resources/start-business",
    images: [
      {
        url: "https://sparklocal.co/og-default.png",
        width: 1200,
        height: 630,
        alt: "SparkLocal State Business Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Start a Business in Every US State",
    description:
      "Complete guides to starting a business in all 50 US states.",
    images: ["https://sparklocal.co/og-default.png"],
  },
  alternates: {
    canonical: "https://sparklocal.co/resources/start-business",
  },
};

export default function StartBusinessIndexPage() {
  // Sort states alphabetically
  const sortedStates = [...STATE_GUIDES].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            All Resources
          </Link>

          {/* Title */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                How to Start a Business in Every US State
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Comprehensive guides to business registration, state taxes, licenses, and key
                industries. Select your state to get started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* States Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedStates.map((state) => (
              <Link
                key={state.slug}
                href={`/resources/start-business/${state.slug}`}
                className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                    {state.abbreviation}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <h2 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                  {state.name}
                </h2>
                {state.cities.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {state.cities.length} {state.cities.length === 1 ? "city" : "cities"} with resources
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
            Need Personalized Guidance?
          </h2>
          <p className="text-gray-600 mb-6">
            Get a custom business plan, viability analysis, and matched resources tailored to your
            specific idea and location.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            Start Building Your Plan
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-600">50</div>
              <div className="text-sm text-gray-500">State Guides</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">
                {sortedStates.reduce((acc, s) => acc + s.cities.length, 0)}+
              </div>
              <div className="text-sm text-gray-500">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">
                {sortedStates.reduce((acc, s) => acc + s.faqs.length, 0)}+
              </div>
              <div className="text-sm text-gray-500">FAQs Answered</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
