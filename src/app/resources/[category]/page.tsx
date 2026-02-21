// SparkLocal Resource Directory - Category Page (Light Theme)
// Lists all resources in a category with enhanced filters and pagination
// Also handles city hub pages when param is a location slug (e.g., austin-tx)

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type ResourceLocation,
} from "@/types/resources";
import ResourceCard from "@/components/resources/ResourceCard";
import CategoryFiltersLight from "@/components/resources/CategoryFiltersLight";
import CityHubContent from "@/components/resources/CityHubContent";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    state?: string;
    city?: string;
    subcategory?: string;
    remote?: string;
    sort?: string;
    page?: string;
    open?: string;
    amount_min?: string;
    amount_max?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

// Slug normalization map - maps common URL variations to canonical slugs
// This allows /resources/grants, /resources/grant, /resources/sba-resources, etc.
const SLUG_ALIASES: Record<string, ResourceCategory> = {
  // Grant variations
  grants: "grant",
  grant: "grant",
  funding: "grant",

  // Coworking variations
  coworking: "coworking",
  "coworking-spaces": "coworking",
  "coworking-space": "coworking",
  workspace: "coworking",
  workspaces: "coworking",

  // Accelerator variations
  accelerator: "accelerator",
  accelerators: "accelerator",
  "startup-accelerator": "accelerator",
  "startup-accelerators": "accelerator",

  // Incubator variations
  incubator: "incubator",
  incubators: "incubator",
  "startup-incubator": "incubator",
  "startup-incubators": "incubator",

  // SBA variations
  sba: "sba",
  "sba-resources": "sba",
  "sba-resource": "sba",
  sbdc: "sba",
  score: "sba",

  // Mentorship variations
  mentorship: "mentorship",
  mentors: "mentorship",
  mentor: "mentorship",
};

// Normalize a slug to its canonical form
function normalizeSlug(slug: string): ResourceCategory | null {
  // First check if it's already a valid category
  if (slug in CATEGORY_INFO) {
    return slug as ResourceCategory;
  }
  // Then check aliases
  const normalized = SLUG_ALIASES[slug.toLowerCase()];
  return normalized || null;
}

// Note: isValidCategory was replaced by normalizeSlug which handles aliases

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: paramValue } = await params;

  // Try to normalize the slug to a valid category
  const normalizedCategory = normalizeSlug(paramValue);

  // Check if this is a category (or alias)
  if (normalizedCategory) {
    const info = CATEGORY_INFO[normalizedCategory];
    const supabase = await createClient();

    // Get count of listings in this category
    const { count } = await supabase
      .from("resource_listings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", normalizedCategory);

    const listingCount = count || 0;

    const title = `${info.plural} for Entrepreneurs | SparkLocal Resources`;
    const description = `Browse ${listingCount} ${info.plural.toLowerCase()} to launch your business. ${info.description}. Compare options, eligibility, and apply.`;

    return {
      title,
      description,
      keywords: [
        info.plural.toLowerCase(),
        `${info.name.toLowerCase()} for small business`,
        "entrepreneur resources",
        "business support",
        "business funding",
      ],
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "SparkLocal",
        url: `https://sparklocal.co/resources/${normalizedCategory}`,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: `https://sparklocal.co/resources/${normalizedCategory}`,
      },
    };
  }

  // Otherwise, check if this is a location slug
  const supabase = await createClient();
  const { data: location } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", paramValue)
    .single();

  if (location) {
    const title = `Business Resources in ${location.city}, ${location.state} | Grants, Coworking & More`;
    const description = `Find ${location.listing_count} business resources in ${location.city}, ${location.state}. Browse coworking spaces, grants, accelerators, and free SBA mentorship to help launch your business.`;

    return {
      title,
      description,
      keywords: [
        `business resources ${location.city}`,
        `grants ${location.city} ${location.state}`,
        `coworking spaces ${location.city}`,
        `accelerators ${location.city}`,
        `SBA ${location.city}`,
        "small business help",
      ],
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "SparkLocal",
        url: `https://sparklocal.co/resources/${paramValue}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: `https://sparklocal.co/resources/${paramValue}`,
      },
    };
  }

  return { title: "Not Found" };
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
        <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "coworking":
      return (
        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "accelerator":
      return (
        <svg className="w-12 h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      );
    case "sba":
      return (
        <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: paramValue } = await params;
  const filters = await searchParams;

  // Try to normalize the slug to a valid category
  const normalizedCategory = normalizeSlug(paramValue);

  // Check if this is a valid category (or alias)
  if (normalizedCategory) {
    // Render category page with the normalized category
    return renderCategoryPage(normalizedCategory, filters);
  }

  // Otherwise, check if this is a location slug
  const supabase = await createClient();
  const { data: location } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", paramValue)
    .single();

  if (location) {
    // Render city hub page
    return <CityHubContent location={location as ResourceLocation} />;
  }

  // Neither category nor location - 404
  notFound();
}

// Separated category page rendering for cleaner code
async function renderCategoryPage(
  category: ResourceCategory,
  filters: {
    state?: string;
    city?: string;
    subcategory?: string;
    remote?: string;
    sort?: string;
    page?: string;
    open?: string;
    amount_min?: string;
    amount_max?: string;
  }
) {
  const categoryInfo = CATEGORY_INFO[category];

  const supabase = await createClient();
  const currentPage = parseInt(filters.page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query
  let query = supabase
    .from("resource_listings")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("category", category);

  // Apply filters
  if (filters.state) {
    query = query.eq("state", filters.state);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.subcategory) {
    query = query.contains("subcategories", [filters.subcategory]);
  }
  if (filters.remote === "true") {
    query = query.or("is_remote.eq.true,is_nationwide.eq.true");
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

  // Get total count without filters for comparison
  const { count: unfilteredCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category);

  // Get unique states, cities, and subcategories for filters
  const { data: allListings } = await supabase
    .from("resource_listings")
    .select("state, city, subcategories")
    .eq("is_active", true)
    .eq("category", category);

  const states = Array.from(
    new Set(allListings?.map((l) => l.state).filter(Boolean) || [])
  ).sort() as string[];

  const cities = Array.from(
    new Set(allListings?.map((l) => l.city).filter(Boolean) || [])
  ).sort() as string[];

  const subcategories = Array.from(
    new Set(allListings?.flatMap((l) => l.subcategories || []) || [])
  ).sort() as string[];

  // Get popular locations with ACCURATE local-only counts
  // Query listings directly to exclude nationwide/remote from per-city counts
  const { data: localListingsForCounts } = await supabase
    .from("resource_listings")
    .select("city, state")
    .eq("is_active", true)
    .eq("category", category)
    .eq("is_nationwide", false)
    .eq("is_remote", false)
    .not("city", "is", null);

  // Count listings per city
  const cityCountMap = new Map<string, { city: string; state: string; count: number }>();
  localListingsForCounts?.forEach((listing) => {
    if (listing.city && listing.state) {
      const key = `${listing.city}-${listing.state}`;
      const existing = cityCountMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        cityCountMap.set(key, { city: listing.city, state: listing.state, count: 1 });
      }
    }
  });

  // Get location slugs for the top cities
  const topCityCounts = Array.from(cityCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const { data: locationSlugs } = await supabase
    .from("resource_locations")
    .select("city, state, slug")
    .in("city", topCityCounts.map((c) => c.city));

  const slugMap = new Map(
    locationSlugs?.map((l) => [`${l.city}-${l.state}`, l.slug]) || []
  );

  // Build locations array with correct counts
  const locations = topCityCounts.map((c) => ({
    location: {
      city: c.city,
      state: c.state,
      slug: slugMap.get(`${c.city}-${c.state}`) || `${c.city.toLowerCase().replace(/\s+/g, "-")}-${c.state.toLowerCase()}`,
    },
    listing_count: c.count,
  }));

  // Get nationwide/remote count for this category
  const { count: nationwideCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category)
    .or("is_nationwide.eq.true,is_remote.eq.true");

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);
  const showPagination = totalPages > 1;

  // Build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.remote) params.set("remote", filters.remote);
    if (filters.sort) params.set("sort", filters.sort);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return `/resources/${category}${queryString ? `?${queryString}` : ""}`;
  };

  // Build breadcrumb if filtered to a city
  const showBreadcrumb = filters.city || filters.state;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`pt-24 pb-12 px-4 bg-gradient-to-b ${getCategoryHeroStyle(category)}`}>
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Resources
          </Link>

          {/* Breadcrumb if filtered */}
          {showBreadcrumb && (
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/resources" className="hover:text-gray-700">Resources</Link>
              <span>/</span>
              <Link href={`/resources/${category}`} className="hover:text-gray-700">{categoryInfo.plural}</Link>
              <span>/</span>
              <span className="text-gray-900">
                {filters.city || filters.state}
              </span>
            </nav>
          )}

          {/* Hero content */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {getCategoryIcon(category)}
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {categoryInfo.plural}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                {categoryInfo.description}. Browse {unfilteredCount || 0} listings
                to find the right fit for your venture.
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
            states={states}
            cities={cities}
            subcategories={subcategories}
            totalCount={unfilteredCount || 0}
            filteredCount={totalCount || 0}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Popular Locations */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-48">
                <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
                  Browse by Location
                </h3>
                <div className="space-y-2">
                  {/* Nationwide entry */}
                  {nationwideCount && nationwideCount > 0 && (
                    <Link
                      href={`/resources/${category}?remote=true`}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="text-blue-700 group-hover:text-blue-900 transition-colors font-medium">
                        Nationwide / Remote
                      </span>
                      <span className="text-blue-500 text-sm font-medium">
                        {nationwideCount}
                      </span>
                    </Link>
                  )}
                  {/* City entries */}
                  {locations?.map((loc) => (
                    <Link
                      key={`${loc.location?.city}-${loc.location?.state}`}
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

                {/* CTA */}
                <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <h4 className="font-display text-gray-900 font-semibold mb-2">
                    Get Matched
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Let SparkLocal recommend the best resources for your specific
                    idea and location.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors"
                  >
                    Start Building
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Listings Grid */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {listings && listings.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                      <ResourceCard
                        key={listing.id}
                        listing={listing as ResourceListing}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {showPagination && (
                    <div className="mt-8 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of {totalCount?.toLocaleString()} {categoryInfo.plural.toLowerCase()}
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
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">
                    No {categoryInfo.plural.toLowerCase()} found with these filters.
                  </p>
                  <Link
                    href={`/resources/${category}`}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Clear filters
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
