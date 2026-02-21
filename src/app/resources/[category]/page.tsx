// SparkLocal Resource Directory - Category Page
// Lists all resources in a category with filters

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
} from "@/types/resources";
import ResourceListingCard from "@/components/resources/ResourceListingCard";
import CategoryFilters from "@/components/resources/CategoryFilters";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import Footer from "@/components/ui/Footer";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ state?: string; subcategory?: string; remote?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const info = CATEGORY_INFO[category as ResourceCategory];

  if (!info) {
    return { title: "Not Found" };
  }

  const supabase = await createClient();

  // Get count of listings in this category
  const { count } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category);

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
      url: `https://sparklocal.co/resources/${category}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://sparklocal.co/resources/${category}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const filters = await searchParams;
  const categoryInfo = CATEGORY_INFO[category as ResourceCategory];

  if (!categoryInfo) {
    notFound();
  }

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .order("is_featured", { ascending: false })
    .order("name");

  // Apply filters
  if (filters.state) {
    query = query.eq("state", filters.state);
  }
  if (filters.subcategory) {
    query = query.contains("subcategories", [filters.subcategory]);
  }
  if (filters.remote === "true") {
    query = query.eq("is_remote", true);
  }

  const { data: listings } = await query;

  // Get unique states and subcategories for filters
  const { data: allListings } = await supabase
    .from("resource_listings")
    .select("state, subcategories")
    .eq("is_active", true)
    .eq("category", category);

  const states = Array.from(
    new Set(allListings?.map((l) => l.state).filter(Boolean) || [])
  ).sort() as string[];
  const subcategories = Array.from(
    new Set(allListings?.flatMap((l) => l.subcategories || []) || [])
  ).sort() as string[];

  // Get popular locations
  const { data: locations } = await supabase
    .from("resource_category_locations")
    .select("*, location:resource_locations(*)")
    .eq("category", category)
    .order("listing_count", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/90 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
                <span className="text-sm">✦</span>
              </div>
              <span className="font-display text-warmwhite font-semibold">
                SparkLocal
              </span>
            </Link>
            <span className="text-warmwhite-dim">/</span>
            <Link
              href="/resources"
              className="text-warmwhite-muted hover:text-warmwhite transition-colors"
            >
              Resources
            </Link>
          </div>
          <Link
            href="/builder"
            className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
          >
            Start Building
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-warmwhite-muted hover:text-warmwhite transition-colors mb-4"
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
          <h1 className="font-display text-4xl md:text-5xl font-bold text-warmwhite mb-4">
            {categoryInfo.plural}
          </h1>
          <p className="text-warmwhite-muted text-lg max-w-2xl">
            {categoryInfo.description}. Browse {listings?.length || 0} listings
            to find the right fit for your venture.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFilters
            category={category}
            states={states}
            subcategories={subcategories}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Popular Locations */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                <h3 className="font-display text-lg font-bold text-warmwhite mb-4">
                  Browse by Location
                </h3>
                <div className="space-y-2">
                  {locations?.map((loc) => (
                    <Link
                      key={loc.id}
                      href={`/resources/${category}/${loc.location?.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-warmwhite/5 hover:border-spark/20 transition-all group"
                    >
                      <span className="text-warmwhite group-hover:text-spark transition-colors">
                        {loc.location?.city}, {loc.location?.state}
                      </span>
                      <span className="text-warmwhite-dim text-sm">
                        {loc.listing_count}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20">
                  <h4 className="font-display text-warmwhite font-semibold mb-2">
                    Get Matched
                  </h4>
                  <p className="text-warmwhite-dim text-sm mb-4">
                    Let SparkLocal recommend the best resources for your specific
                    idea and location.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-spark text-sm font-semibold hover:text-spark-400 transition-colors"
                  >
                    Start Building
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-6">
                  <NewsletterSignup category={categoryInfo.name.toLowerCase()} />
                </div>
              </div>
            </aside>

            {/* Listings */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {listings && listings.length > 0 ? (
                <div className="grid gap-4">
                  {listings.map((listing) => (
                    <ResourceListingCard
                      key={listing.id}
                      listing={listing as ResourceListing}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-warmwhite-muted text-lg">
                    No {categoryInfo.plural.toLowerCase()} found with these
                    filters.
                  </p>
                  <Link
                    href={`/resources/${category}`}
                    className="mt-4 inline-block text-spark hover:text-spark-400 transition-colors"
                  >
                    Clear filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
