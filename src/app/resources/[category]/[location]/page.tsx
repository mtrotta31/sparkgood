// SparkGood Resource Directory - Category + Location Page
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
import ResourceListingCard from "@/components/resources/ResourceListingCard";

interface PageProps {
  params: Promise<{ category: string; location: string }>;
}

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
    `${categoryInfo.name === "Grant" ? "Small Business Grants" : categoryInfo.plural} in ${cityState} | SparkGood`;

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
      siteName: "SparkGood",
      url: `https://sparkgood.io/resources/${category}/${location}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://sparkgood.io/resources/${category}/${location}`,
    },
  };
}

export default async function CategoryLocationPage({ params }: PageProps) {
  const { category, location } = await params;
  const categoryInfo = CATEGORY_INFO[category as ResourceCategory];

  if (!categoryInfo) {
    notFound();
  }

  const supabase = await createClient();

  // Get location details
  const { data: locationData } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", location)
    .single();

  if (!locationData) {
    notFound();
  }

  // Get listings for this category in this location
  // Include: local listings + nationwide + remote
  const { data: listings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .or(
      `and(city.eq.${locationData.city},state.eq.${locationData.state}),is_nationwide.eq.true,is_remote.eq.true`
    )
    .order("is_featured", { ascending: false })
    .order("name");

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

  // Get other locations for this category
  const { data: otherLocations } = await supabase
    .from("resource_category_locations")
    .select("*, location:resource_locations(*)")
    .eq("category", category)
    .neq("location_id", locationData.id)
    .order("listing_count", { ascending: false })
    .limit(6);

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
                SparkGood
              </span>
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

      {/* Breadcrumbs */}
      <section className="pt-28 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-warmwhite-muted">
            <Link href="/resources" className="hover:text-warmwhite">
              Resources
            </Link>
            <span>/</span>
            <Link
              href={`/resources/${category}`}
              className="hover:text-warmwhite"
            >
              {categoryInfo.plural}
            </Link>
            <span>/</span>
            <span className="text-warmwhite">
              {locationData.city}, {locationData.state}
            </span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="pt-6 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-warmwhite mb-4">
            {categoryInfo.plural} in{" "}
            <span className="text-spark">{locationData.city}</span>
          </h1>
          <p className="text-warmwhite-muted text-lg max-w-2xl">
            Find {categoryInfo.plural.toLowerCase()} near you in{" "}
            {locationData.city}, {locationData.state_full || locationData.state}
            . Includes {localListings.length} local{" "}
            {localListings.length === 1 ? "listing" : "listings"} plus{" "}
            {nationwideListings.length} nationwide options.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-8">
                {/* Other Locations */}
                {otherLocations && otherLocations.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-warmwhite mb-4">
                      Other Locations
                    </h3>
                    <div className="space-y-2">
                      {otherLocations.map((loc) => (
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
                    <Link
                      href={`/resources/${category}`}
                      className="inline-block mt-4 text-spark text-sm hover:text-spark-400 transition-colors"
                    >
                      View all locations →
                    </Link>
                  </div>
                )}

                {/* CTA */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20">
                  <h4 className="font-display text-warmwhite font-semibold mb-2">
                    Based in {locationData.city}?
                  </h4>
                  <p className="text-warmwhite-dim text-sm mb-4">
                    Get personalized resource recommendations for your social
                    venture idea.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-spark text-sm font-semibold hover:text-spark-400 transition-colors"
                  >
                    Build Your Plan
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
              </div>
            </aside>

            {/* Listings */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
              {/* Local Listings */}
              {localListings.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-spark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
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
                    In {locationData.city}
                  </h2>
                  <div className="grid gap-4">
                    {localListings.map((listing) => (
                      <ResourceListingCard
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
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-spark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                    Nationwide & Remote
                  </h2>
                  <div className="grid gap-4">
                    {nationwideListings.map((listing) => (
                      <ResourceListingCard
                        key={listing.id}
                        listing={listing as ResourceListing}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {localListings.length === 0 && nationwideListings.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-warmwhite-muted text-lg mb-4">
                    No {categoryInfo.plural.toLowerCase()} found in{" "}
                    {locationData.city}, {locationData.state}.
                  </p>
                  <Link
                    href={`/resources/${category}`}
                    className="text-spark hover:text-spark-400 transition-colors"
                  >
                    Browse all {categoryInfo.plural.toLowerCase()}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-warmwhite/10 bg-charcoal-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
                <span className="text-sm">✦</span>
              </div>
              <span className="font-display text-warmwhite font-semibold">
                SparkGood
              </span>
            </Link>
            <p className="text-warmwhite-dim text-sm">© 2026 SparkGood</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
