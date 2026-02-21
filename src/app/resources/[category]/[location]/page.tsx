// SparkLocal Resource Directory - Category + Location Page (Light Theme)
// Lists resources in a specific category and location (e.g., /resources/grant/austin-tx)

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
} from "@/types/resources";
import ResourceCard from "@/components/resources/ResourceCard";
import CategoryFiltersLight from "@/components/resources/CategoryFiltersLight";

interface PageProps {
  params: Promise<{ category: string; location: string }>;
  searchParams: Promise<{
    state?: string;
    subcategory?: string;
    remote?: string;
    sort?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, location } = await params;
  const categoryInfo = CATEGORY_INFO[category as ResourceCategory];

  if (!categoryInfo) {
    return { title: "Not Found" };
  }

  const supabase = await createClient();

  // Get location details
  const { data: locationData } = await supabase
    .from("resource_locations")
    .select("city, state, state_full, seo_title, seo_description")
    .eq("slug", location)
    .single();

  if (!locationData) {
    return { title: "Not Found" };
  }

  // Get count of listings in this location
  const { count } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category)
    .or(`and(city.eq.${locationData.city},state.eq.${locationData.state}),is_nationwide.eq.true,is_remote.eq.true`);

  const listingCount = count || 0;
  const cityState = `${locationData.city}, ${locationData.state}`;
  const cityStateFull = `${locationData.city}, ${locationData.state_full || locationData.state}`;

  // Generate SEO-optimized title
  const title = locationData.seo_title ||
    `${categoryInfo.name === "Grant" ? "Small Business Grants" : categoryInfo.plural} in ${cityState} | SparkLocal`;

  // Generate SEO-optimized description with count
  const description = locationData.seo_description ||
    `Find ${listingCount} ${categoryInfo.plural.toLowerCase()} for ${category === "grant" ? "small businesses" : "entrepreneurs"} in ${cityStateFull}. ${categoryInfo.description}. Compare options and apply today.`;

  return {
    title,
    description,
    keywords: [
      `${categoryInfo.plural.toLowerCase()} ${locationData.city}`,
      `${categoryInfo.name.toLowerCase()} ${locationData.state}`,
      `small business ${categoryInfo.plural.toLowerCase()}`,
      `${locationData.city} business resources`,
      categoryInfo.plural.toLowerCase(),
    ],
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "SparkLocal",
      url: `https://sparklocal.co/resources/${category}/${location}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://sparklocal.co/resources/${category}/${location}`,
    },
  };
}

// Get category-specific hero background gradient
function getCategoryHeroStyle(category: string) {
  switch (category) {
    case "grant":
      return "from-green-50 to-white";
    case "coworking":
      return "from-blue-50 to-white";
    case "accelerator":
      return "from-orange-50 to-white";
    case "sba":
      return "from-red-50 to-white";
    case "incubator":
      return "from-emerald-50 to-white";
    default:
      return "from-gray-50 to-white";
  }
}

// Get category icon
function getCategoryIcon(category: string) {
  switch (category) {
    case "grant":
      return (
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "coworking":
      return (
        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "accelerator":
      return (
        <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      );
    case "sba":
      return (
        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
  }
}

export default async function CategoryLocationPage({ params, searchParams }: PageProps) {
  const { category, location } = await params;
  const filters = await searchParams;
  const categoryInfo = CATEGORY_INFO[category as ResourceCategory];

  if (!categoryInfo) {
    notFound();
  }

  const supabase = await createClient();
  const currentPage = parseInt(filters.page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get location details
  const { data: locationData } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", location)
    .single();

  if (!locationData) {
    notFound();
  }

  // Build query for listings in this category and location
  let query = supabase
    .from("resource_listings")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("category", category)
    .or(
      `and(city.eq.${locationData.city},state.eq.${locationData.state}),is_nationwide.eq.true,is_remote.eq.true`
    );

  // Apply filters
  if (filters.subcategory) {
    query = query.contains("subcategories", [filters.subcategory]);
  }

  // Apply sorting
  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "rating":
      query = query.order("details->rating", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("name");
  }

  // Apply pagination
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: listings, count: totalCount } = await query;

  // Separate local vs nationwide/remote
  const localListings =
    listings?.filter(
      (l) =>
        l.city === locationData.city &&
        l.state === locationData.state &&
        !l.is_nationwide
    ) || [];
  const nationwideListings =
    listings?.filter((l) => l.is_nationwide || l.is_remote) || [];

  // Get unique subcategories for filters
  const { data: allListings } = await supabase
    .from("resource_listings")
    .select("subcategories")
    .eq("is_active", true)
    .eq("category", category)
    .or(
      `and(city.eq.${locationData.city},state.eq.${locationData.state}),is_nationwide.eq.true,is_remote.eq.true`
    );

  const subcategories = Array.from(
    new Set(allListings?.flatMap((l) => l.subcategories || []) || [])
  ).sort() as string[];

  // Get other locations for this category
  const { data: otherLocations } = await supabase
    .from("resource_category_locations")
    .select("*, location:resource_locations(*)")
    .eq("category", category)
    .neq("location_id", locationData.id)
    .order("listing_count", { ascending: false })
    .limit(8);

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);
  const showPagination = totalPages > 1;

  // Build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.sort) params.set("sort", filters.sort);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return `/resources/${category}/${location}${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`pt-24 pb-10 px-4 bg-gradient-to-b ${getCategoryHeroStyle(category)}`}>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/resources" className="hover:text-gray-700 transition-colors">
              Resources
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href={`/resources/${category}`}
              className="hover:text-gray-700 transition-colors"
            >
              {categoryInfo.plural}
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">
              {locationData.city}, {locationData.state}
            </span>
          </nav>

          {/* Hero content */}
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              {getCategoryIcon(category)}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {categoryInfo.plural} in{" "}
                <span className="text-amber-600">{locationData.city}</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Find {categoryInfo.plural.toLowerCase()} near you in{" "}
                {locationData.city}, {locationData.state_full || locationData.state}.
                Includes {localListings.length} local{" "}
                {localListings.length === 1 ? "listing" : "listings"} plus{" "}
                {nationwideListings.length} nationwide options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <section className="sticky top-16 z-40 bg-gray-50 border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFiltersLight
            category={category}
            states={[]}
            cities={[]}
            subcategories={subcategories}
            totalCount={totalCount || 0}
            filteredCount={totalCount || 0}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-48 space-y-8">
                {/* Other Locations */}
                {otherLocations && otherLocations.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
                      Other Locations
                    </h3>
                    <div className="space-y-2">
                      {otherLocations.map((loc) => (
                        <Link
                          key={loc.id}
                          href={`/resources/${category}/${loc.location?.slug}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                        >
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {loc.location?.city}, {loc.location?.state}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {loc.listing_count}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/resources/${category}`}
                      className="inline-block mt-4 text-amber-600 text-sm hover:text-amber-700 font-medium transition-colors"
                    >
                      View all locations →
                    </Link>
                  </div>
                )}

                {/* CTA */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <h4 className="font-display text-gray-900 font-semibold mb-2">
                    Based in {locationData.city}?
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Get personalized resource recommendations for your
                    business idea.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors"
                  >
                    Build Your Plan
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Listings */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
              {/* Local Listings */}
              {localListings.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    In {locationData.city}
                  </h2>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {localListings.map((listing) => (
                      <ResourceCard
                        key={listing.id}
                        listing={listing as ResourceListing}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Nationwide / Remote */}
              {nationwideListings.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Nationwide & Remote
                  </h2>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {nationwideListings.map((listing) => (
                      <ResourceCard
                        key={listing.id}
                        listing={listing as ResourceListing}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {showPagination && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of {totalCount?.toLocaleString()} results
                  </p>
                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={getPaginationUrl(currentPage - 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </Link>
                    )}
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Link
                        href={getPaginationUrl(currentPage + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {localListings.length === 0 && nationwideListings.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">
                    No {categoryInfo.plural.toLowerCase()} found in{" "}
                    {locationData.city}, {locationData.state}.
                  </p>
                  <Link
                    href={`/resources/${category}`}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Browse all {categoryInfo.plural.toLowerCase()}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
