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
import DirectoryBuilderCTA from "@/components/resources/DirectoryBuilderCTA";

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
    images: [
      {
        url: "https://sparklocal.co/og-default.png",
        width: 1200,
        height: 630,
        alt: "SparkLocal - Business Resources Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Resources Directory | SparkLocal",
    description:
      "Find grants, accelerators, SBA resources, and more for entrepreneurs.",
    images: ["https://sparklocal.co/og-default.png"],
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

// Additional categories from expansion
const MORE_CATEGORIES = [
  {
    slug: "business-attorney" as ResourceCategory,
    name: "Business Attorneys",
    description: "Legal counsel for incorporation and contracts",
    color: "bg-violet-600",
    lightColor: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
      </svg>
    ),
  },
  {
    slug: "accountant" as ResourceCategory,
    name: "Accountants & CPAs",
    description: "Financial services and tax planning",
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
      </svg>
    ),
  },
  {
    slug: "marketing-agency" as ResourceCategory,
    name: "Marketing Agencies",
    description: "Digital marketing and branding services",
    color: "bg-pink-600",
    lightColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    slug: "commercial-real-estate" as ResourceCategory,
    name: "Commercial Real Estate",
    description: "Office, retail, and industrial space",
    color: "bg-sky-600",
    lightColor: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    slug: "business-insurance" as ResourceCategory,
    name: "Business Insurance",
    description: "Liability and property coverage",
    color: "bg-lime-600",
    lightColor: "bg-lime-50",
    textColor: "text-lime-700",
    borderColor: "border-lime-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    slug: "chamber-of-commerce" as ResourceCategory,
    name: "Chambers of Commerce",
    description: "Local business networking organizations",
    color: "bg-rose-600",
    lightColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    slug: "virtual-office" as ResourceCategory,
    name: "Virtual Offices",
    description: "Professional business addresses",
    color: "bg-fuchsia-600",
    lightColor: "bg-fuchsia-50",
    textColor: "text-fuchsia-700",
    borderColor: "border-fuchsia-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    slug: "business-consultant" as ResourceCategory,
    name: "Business Consultants",
    description: "Strategy and growth advisory",
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
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
  const allCategories = [...MAIN_CATEGORIES, ...MORE_CATEGORIES];
  const categoryCountPromises = allCategories.map(async (category) => {
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

            {/* More Categories */}
            {MORE_CATEGORIES.filter((c) => categoryCounts[c.slug] > 0).length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-xl font-bold text-slate-700 mb-4 text-center">
                  More Resources
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {MORE_CATEGORIES.filter((c) => categoryCounts[c.slug] > 0).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/resources/${category.slug}`}
                      className={`group flex flex-col items-center p-4 rounded-xl bg-white border ${category.borderColor} hover:border-spark/30 transition-all shadow-warm hover:shadow-warm-md hover:-translate-y-0.5`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg ${category.lightColor} flex items-center justify-center ${category.textColor} mb-2`}
                      >
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-700 text-center group-hover:text-spark transition-colors">
                        {category.name}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        {categoryCounts[category.slug]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
              <DirectoryBuilderCTA
                pageType="directory_home"
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
              </DirectoryBuilderCTA>
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
