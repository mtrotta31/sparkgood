// City Hub Page Content
// Shows all resources for a specific city, grouped by category
// Used by /resources/[location] route

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type ResourceLocation,
} from "@/types/resources";
import DirectoryNav from "@/components/resources/DirectoryNav";
import DirectoryFooter from "@/components/resources/DirectoryFooter";
import ResourceListingCardLight from "@/components/resources/ResourceListingCardLight";
import NewsletterSignupLight from "@/components/resources/NewsletterSignupLight";

interface CityHubContentProps {
  location: ResourceLocation;
}

// Category section data
interface CategorySection {
  category: ResourceCategory;
  name: string;
  plural: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  count: number;
  listings: ResourceListing[];
  icon: JSX.Element;
}

// Get category icon
function getCategoryIcon(category: string) {
  switch (category) {
    case "grant":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "coworking":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      );
    case "accelerator":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      );
    case "sba":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
      );
    case "incubator":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      );
    case "mentorship":
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
          />
        </svg>
      );
  }
}

// Category colors for light theme
const CATEGORY_STYLES: Record<
  string,
  { bgColor: string; textColor: string; borderColor: string }
> = {
  grant: {
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  coworking: {
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  accelerator: {
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  sba: {
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  incubator: {
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
  },
  mentorship: {
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
  },
  default: {
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
  },
};

export default async function CityHubContent({ location }: CityHubContentProps) {
  const supabase = await createClient();

  // Get all listings for this city
  const { data: allListings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .eq("city", location.city)
    .eq("state", location.state)
    .order("is_featured", { ascending: false })
    .order("name");

  // Get nationwide/remote listings too
  const { data: nationwideListings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .or("is_nationwide.eq.true,is_remote.eq.true")
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(20);

  // Group listings by category
  const listingsByCategory: Record<string, ResourceListing[]> = {};
  allListings?.forEach((listing) => {
    if (!listingsByCategory[listing.category]) {
      listingsByCategory[listing.category] = [];
    }
    listingsByCategory[listing.category].push(listing as ResourceListing);
  });

  // Build category sections (only those with listings)
  const categorySections: CategorySection[] = Object.entries(listingsByCategory)
    .map(([category, listings]) => {
      const info = CATEGORY_INFO[category as ResourceCategory];
      const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
      return {
        category: category as ResourceCategory,
        name: info?.name || category,
        plural: info?.plural || category,
        bgColor: styles.bgColor,
        textColor: styles.textColor,
        borderColor: styles.borderColor,
        count: listings.length,
        listings: listings.slice(0, 6), // Show max 6 per category
        icon: getCategoryIcon(category),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Calculate totals
  const totalListings = allListings?.length || 0;

  // Build category summary string
  const categorySummary = categorySections
    .map((s) => `${s.count} ${s.count === 1 ? s.name : s.plural}`)
    .join(" • ");

  return (
    <>
      <DirectoryNav />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Warm gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-cream to-cream pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 md:pt-20 md:pb-16">
            {/* Back link */}
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
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
              All Cities
            </Link>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Business Resources in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
                {location.city}, {location.state}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl">
              Find {totalListings} local resources to help launch your business.
              {totalListings === 0
                ? " Browse nationwide resources below."
                : ""}
            </p>

            {/* Category Summary Bar */}
            {categorySummary && (
              <div className="flex flex-wrap gap-2">
                {categorySections.map((section) => (
                  <a
                    key={section.category}
                    href={`#${section.category}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${section.bgColor} ${section.textColor} border ${section.borderColor} hover:shadow-warm transition-all`}
                  >
                    {section.icon}
                    <span className="font-medium">
                      {section.count} {section.count === 1 ? section.name : section.plural}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Category Sections */}
        {categorySections.map((section) => (
          <section
            key={section.category}
            id={section.category}
            className="py-12 px-4 sm:px-6 border-t border-slate-200"
          >
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${section.bgColor} flex items-center justify-center ${section.textColor}`}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-800">
                      {section.plural}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {section.count} in {location.city}
                    </p>
                  </div>
                </div>
                {section.count > 6 && (
                  <Link
                    href={`/resources/${section.category}?city=${encodeURIComponent(location.city)}&state=${location.state}`}
                    className="text-spark hover:text-spark-600 font-medium text-sm transition-colors"
                  >
                    View all {section.count} →
                  </Link>
                )}
              </div>

              {/* Listings Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.listings.map((listing) => (
                  <ResourceListingCardLight
                    key={listing.id}
                    listing={listing}
                    compact
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Empty State - No Local Resources */}
        {totalListings === 0 && (
          <section className="py-16 px-4 sm:px-6 text-center">
            <div className="max-w-xl mx-auto">
              <svg
                className="w-16 h-16 text-slate-300 mx-auto mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <h3 className="font-display text-xl font-bold text-slate-800 mb-3">
                No local resources yet in {location.city}
              </h3>
              <p className="text-slate-600 mb-6">
                We&apos;re still building our directory for this area. In the
                meantime, check out nationwide resources below that can help you
                anywhere.
              </p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-spark hover:bg-spark-600 text-white font-semibold rounded-full transition-all"
              >
                Get Personalized Resources
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* Nationwide Resources Section */}
        {nationwideListings && nationwideListings.length > 0 && (
          <section className="py-12 px-4 sm:px-6 bg-cream-dark border-t border-slate-200">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-800">
                    Nationwide Resources
                  </h2>
                  <p className="text-slate-600">
                    These resources are available anywhere in the US
                  </p>
                </div>
                <Link
                  href="/resources?remote=true"
                  className="text-spark hover:text-spark-600 font-medium text-sm transition-colors hidden sm:inline"
                >
                  View all →
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {nationwideListings.slice(0, 8).map((listing) => (
                  <ResourceListingCardLight
                    key={listing.id}
                    listing={listing as ResourceListing}
                    compact
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Builder CTA Section */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 text-center shadow-warm-xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Starting a business in {location.city}?
              </h2>
              <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
                SparkLocal creates a personalized launch plan with the exact
                resources you need based on your business idea, budget, and
                goals.
              </p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-spark hover:bg-spark-400 text-white font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/30"
              >
                Create Your Launch Plan
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 px-4 sm:px-6 bg-cream-dark">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignupLight
              city={location.city}
              state={location.state}
              variant="card"
            />
          </div>
        </section>
      </main>

      <DirectoryFooter />
    </>
  );
}
