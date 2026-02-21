// SparkLocal Resource Directory - Home Page
// Premium, warm, light-themed directory homepage
// "Find everything you need to start a business in your city"

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO, type ResourceCategory } from "@/types/resources";
import DirectoryNav from "@/components/resources/DirectoryNav";
import DirectoryFooter from "@/components/resources/DirectoryFooter";
import CitySearch from "@/components/resources/CitySearch";
import AnimatedCounter from "@/components/resources/AnimatedCounter";
import NewsletterSignupLight from "@/components/resources/NewsletterSignupLight";

export const metadata: Metadata = {
  title: "Business Resources Directory | Find Grants, Coworking & More",
  description:
    "Find 2,400+ business resources across 275 cities. Browse grants, coworking spaces, accelerators, and free SBA mentorship to launch your business.",
  keywords: [
    "small business grants",
    "startup accelerators",
    "SBA resources",
    "SBDC near me",
    "SCORE mentors",
    "business grants for women",
    "minority business grants",
    "coworking spaces",
    "business resources directory",
  ],
  openGraph: {
    title: "Business Resources Directory | SparkLocal",
    description:
      "Find 2,400+ resources across 275 cities. Grants, coworking spaces, accelerators, and free mentorship.",
    type: "website",
    siteName: "SparkLocal",
    url: "https://sparklocal.co/resources",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Resources Directory | SparkLocal",
    description:
      "Find grants, accelerators, SBA resources, and more for entrepreneurs.",
  },
  alternates: {
    canonical: "https://sparklocal.co/resources",
  },
};

// Category colors and icons for the 4 main categories
const MAIN_CATEGORIES = [
  {
    slug: "grant" as ResourceCategory,
    name: "Grants",
    description: "Funding that doesn't need to be repaid",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: (
      <svg
        className="w-7 h-7"
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
    ),
  },
  {
    slug: "coworking" as ResourceCategory,
    name: "Coworking Spaces",
    description: "Flexible workspace for entrepreneurs",
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: (
      <svg
        className="w-7 h-7"
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
    ),
  },
  {
    slug: "accelerator" as ResourceCategory,
    name: "Accelerators",
    description: "Intensive programs to fast-track your startup",
    color: "bg-orange-600",
    lightColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: (
      <svg
        className="w-7 h-7"
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
    ),
  },
  {
    slug: "sba" as ResourceCategory,
    name: "SBA Resources",
    description: "Free government business assistance",
    color: "bg-red-600",
    lightColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: (
      <svg
        className="w-7 h-7"
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
    ),
  },
];

// City card component
function CityCard({
  city,
  state,
  slug,
  categoryCounts,
}: {
  city: string;
  state: string;
  slug: string;
  categoryCounts: { grant: number; coworking: number; accelerator: number; sba: number };
}) {
  // Calculate total from local category counts for consistency
  const localTotal = categoryCounts.grant + categoryCounts.coworking + categoryCounts.accelerator + categoryCounts.sba;

  return (
    <Link
      href={`/resources/${slug}`}
      className="group block p-5 rounded-2xl bg-white border border-slate-200 hover:border-spark/30 transition-all shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-800 group-hover:text-spark transition-colors">
            {city}
          </h3>
          <p className="text-slate-500 text-sm">{state}</p>
        </div>
        <span className="text-2xl font-bold text-spark">{localTotal}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categoryCounts.grant > 0 && (
          <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            {categoryCounts.grant} {categoryCounts.grant === 1 ? "grant" : "grants"}
          </span>
        )}
        {categoryCounts.coworking > 0 && (
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
            {categoryCounts.coworking} {categoryCounts.coworking === 1 ? "coworking space" : "coworking"}
          </span>
        )}
        {categoryCounts.accelerator > 0 && (
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">
            {categoryCounts.accelerator} {categoryCounts.accelerator === 1 ? "accelerator" : "accelerators"}
          </span>
        )}
        {categoryCounts.sba > 0 && (
          <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">
            {categoryCounts.sba} SBA
          </span>
        )}
      </div>
    </Link>
  );
}

// Category card component
function CategoryCard({
  category,
  count,
}: {
  category: (typeof MAIN_CATEGORIES)[number];
  count: number;
}) {
  return (
    <Link
      href={`/resources/${category.slug}`}
      className={`group block p-6 rounded-2xl bg-white border ${category.borderColor} hover:border-spark/30 transition-all shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-xl ${category.lightColor} flex items-center justify-center ${category.textColor}`}
        >
          {category.icon}
        </div>
        <span className="text-slate-500 text-sm font-medium">
          {count.toLocaleString()} listings
        </span>
      </div>
      <h3 className="font-display text-xl font-bold text-slate-800 mb-2 group-hover:text-spark transition-colors">
        {category.name}
      </h3>
      <p className="text-slate-600 text-sm">{category.description}</p>
    </Link>
  );
}

export default async function ResourcesPage() {
  const supabase = await createClient();

  // Get all locations for the search autocomplete
  const { data: allLocations } = await supabase
    .from("resource_locations")
    .select("id, city, state, slug, listing_count")
    .gt("listing_count", 0)
    .order("listing_count", { ascending: false });

  // Get top 12 cities for the grid
  const topCities = (allLocations || []).slice(0, 12);

  // Get total listing count (using count query to avoid row limits)
  const { count: totalListingCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get category counts using individual count queries to avoid Supabase's 1000 row limit
  // Each category query uses count: "exact" with head: true for accurate counts
  const categoryCountPromises = MAIN_CATEGORIES.map(async (category) => {
    const { count } = await supabase
      .from("resource_listings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", category.slug);
    return { slug: category.slug, count: count || 0 };
  });

  const categoryCountResults = await Promise.all(categoryCountPromises);
  const categoryCounts: Record<string, number> = {};
  categoryCountResults.forEach((result) => {
    categoryCounts[result.slug] = result.count;
  });


  // Fetch LOCAL listings for all top cities
  // We query each city individually to ensure accurate counts matching city hub pages
  const localListingCounts: Record<string, { grant: number; coworking: number; accelerator: number; sba: number }> = {};

  // Initialize counts for all cities
  topCities.forEach((city) => {
    localListingCounts[city.id] = { grant: 0, coworking: 0, accelerator: 0, sba: 0 };
  });

  // Query listings for each city to get accurate counts per category
  // This matches the exact query used by city hub pages
  await Promise.all(
    topCities.map(async (city) => {
      const categories = ["grant", "coworking", "accelerator", "sba"] as const;
      await Promise.all(
        categories.map(async (cat) => {
          const { count: catCount } = await supabase
            .from("resource_listings")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .eq("city", city.city)
            .eq("state", city.state)
            .eq("is_remote", false)
            .or("is_nationwide.eq.false,is_nationwide.is.null")
            .eq("category", cat);
          localListingCounts[city.id][cat] = catCount || 0;
        })
      );
    })
  );

  // Use the accurate counts
  const cityCategoryCounts = localListingCounts;


  // Calculate totals
  const totalListings = totalListingCount || 0;
  const totalCities = allLocations?.length || 0;
  const totalCategories = Object.keys(CATEGORY_INFO).filter(
    (cat) => categoryCounts[cat] > 0
  ).length;

  return (
    <>
      <DirectoryNav />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Warm gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-cream to-cream pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-spark/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                Find everything you need to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
                  start a business
                </span>{" "}
                in your city
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10">
                {totalListings.toLocaleString()}+ resources across{" "}
                {totalCities.toLocaleString()} cities — coworking spaces,
                grants, accelerators, and free mentorship.
              </p>

              {/* City Search */}
              <CitySearch
                locations={allLocations || []}
                placeholder="Search your city..."
                className="max-w-xl mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-slate-800">
                  <AnimatedCounter end={totalListings} suffix="+" />
                </div>
                <p className="text-slate-500 mt-1">Resources</p>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-slate-800">
                  <AnimatedCounter end={totalCities} />
                </div>
                <p className="text-slate-500 mt-1">Cities</p>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-slate-800">
                  <AnimatedCounter end={totalCategories} />
                </div>
                <p className="text-slate-500 mt-1">Categories</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Cities Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                Explore top cities
              </h2>
              <p className="text-slate-600">
                Browse business resources in your city
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topCities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city.city}
                  state={city.state}
                  slug={city.slug}
                  categoryCounts={cityCategoryCounts[city.id]}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-slate-500">
                Don&apos;t see your city?{" "}
                <span className="text-slate-600">
                  Search above to find resources anywhere.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-cream-dark">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                Browse by category
              </h2>
              <p className="text-slate-600">
                Find the right resources for your business stage
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MAIN_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.slug}
                  category={category}
                  count={categoryCounts[category.slug] || 0}
                />
              ))}
            </div>

            {/* Show other categories link */}
            <div className="text-center mt-8">
              <p className="text-slate-500">
                Also browse:{" "}
                {Object.entries(CATEGORY_INFO)
                  .filter(
                    ([slug]) =>
                      !MAIN_CATEGORIES.some((c) => c.slug === slug) &&
                      categoryCounts[slug] > 0
                  )
                  .slice(0, 4)
                  .map(([slug, info], i, arr) => (
                    <span key={slug}>
                      <Link
                        href={`/resources/${slug}`}
                        className="text-spark hover:text-spark-600 transition-colors"
                      >
                        {info.plural}
                      </Link>
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
              </p>
            </div>
          </div>
        </section>

        {/* Builder CTA Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 text-center shadow-warm-xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Not sure what business to start?
              </h2>
              <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
                SparkLocal helps you discover the perfect business idea based on
                your skills, budget, and location — then matches you with the
                right resources to make it happen.
              </p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-spark hover:bg-spark-400 text-white font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/30 hover:shadow-xl hover:shadow-spark/40"
              >
                Build Your Launch Plan
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

        {/* Newsletter Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-cream-dark">
          <div className="max-w-3xl mx-auto">
            <NewsletterSignupLight variant="hero" />
          </div>
        </section>
      </main>

      <DirectoryFooter />
    </>
  );
}
