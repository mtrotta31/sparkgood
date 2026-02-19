// SparkGood Resource Directory - Home Page
// SEO-optimized directory of grants, accelerators, SBA resources, and more

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO, type ResourceCategory } from "@/types/resources";
import ResourceSearch from "@/components/resources/ResourceSearch";
import SearchResults from "@/components/resources/SearchResults";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export const metadata: Metadata = {
  title: "Business Resources Directory | SparkGood",
  description:
    "Find grants, accelerators, SBA resources, coworking spaces, and more to launch your social venture. Free directory of business resources for entrepreneurs.",
  keywords: [
    "small business grants",
    "startup accelerators",
    "SBA resources",
    "SBDC near me",
    "SCORE mentors",
    "business grants for women",
    "minority business grants",
    "coworking spaces",
  ],
};

// Category card component
function CategoryCard({
  category,
  count,
}: {
  category: ResourceCategory;
  count: number;
}) {
  const info = CATEGORY_INFO[category];

  return (
    <Link
      href={`/resources/${category}`}
      className="group p-6 rounded-2xl bg-charcoal border border-warmwhite/10 hover:border-spark/30 transition-all hover:shadow-lg hover:shadow-spark/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-charcoal-light flex items-center justify-center ${info.color}`}
        >
          <CategoryIcon category={category} />
        </div>
        <span className="text-warmwhite-dim text-sm">{count} listings</span>
      </div>
      <h3 className="font-display text-lg font-bold text-warmwhite mb-2 group-hover:text-spark transition-colors">
        {info.plural}
      </h3>
      <p className="text-warmwhite-muted text-sm">{info.description}</p>
    </Link>
  );
}

// Icon component for categories
function CategoryIcon({ category }: { category: ResourceCategory }) {
  const icons: Record<ResourceCategory, JSX.Element> = {
    grant: (
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
    ),
    accelerator: (
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
    ),
    incubator: (
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
    ),
    coworking: (
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
    ),
    event_space: (
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
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
    sba: (
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
    ),
    pitch_competition: (
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
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    ),
    mentorship: (
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
    ),
    legal: (
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
          d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
        />
      </svg>
    ),
    accounting: (
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
          d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
        />
      </svg>
    ),
    marketing: (
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
          d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
        />
      </svg>
    ),
    investor: (
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
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  };

  return icons[category] || null;
}

// Featured listing component
function FeaturedListing({
  listing,
}: {
  listing: {
    name: string;
    slug: string;
    short_description: string;
    category: ResourceCategory;
    logo_url?: string;
    city?: string;
    state?: string;
    is_nationwide: boolean;
  };
}) {
  const categoryInfo = CATEGORY_INFO[listing.category];

  return (
    <Link
      href={`/resources/listing/${listing.slug}`}
      className="group flex gap-4 p-4 rounded-xl bg-charcoal-light border border-warmwhite/5 hover:border-spark/20 transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-charcoal flex items-center justify-center flex-shrink-0 overflow-hidden">
        {listing.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.logo_url}
            alt={listing.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className={categoryInfo.color}>
            <CategoryIcon category={listing.category} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium ${categoryInfo.color} bg-charcoal px-2 py-0.5 rounded-full`}
          >
            {categoryInfo.name}
          </span>
          {listing.is_nationwide && (
            <span className="text-xs text-warmwhite-dim">Nationwide</span>
          )}
        </div>
        <h4 className="font-display text-warmwhite font-semibold group-hover:text-spark transition-colors truncate">
          {listing.name}
        </h4>
        <p className="text-warmwhite-dim text-sm line-clamp-1">
          {listing.short_description}
        </p>
      </div>
    </Link>
  );
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const { search: searchQuery } = await searchParams;
  const supabase = await createClient();

  // Get category counts
  const { data: listings } = await supabase
    .from("resource_listings")
    .select("category")
    .eq("is_active", true);

  const categoryCounts: Record<string, number> = {};
  listings?.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  // Get featured listings
  const { data: featuredListings } = await supabase
    .from("resource_listings")
    .select(
      "name, slug, short_description, category, logo_url, city, state, is_nationwide"
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(6);

  // Categories to display (only those with listings)
  const activeCategories = Object.keys(CATEGORY_INFO).filter(
    (cat) => categoryCounts[cat] > 0
  ) as ResourceCategory[];

  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/90 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <span className="font-display text-warmwhite font-semibold">
              SparkGood
            </span>
          </Link>
          <Link
            href="/builder"
            className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
          >
            Start Building
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-warmwhite mb-4">
          Business{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
            Resources
          </span>
        </h1>
        <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto mb-8">
          Find grants, accelerators, mentors, and free resources to help launch
          your social venture. Everything you need in one place.
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <ResourceSearch initialQuery={searchQuery} />
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && <SearchResults initialQuery={searchQuery} />}

      {/* Categories Grid */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-warmwhite mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCategories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                count={categoryCounts[category] || 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings && featuredListings.length > 0 && (
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-warmwhite">
                Featured Resources
              </h2>
              <span className="text-spark text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Editor&apos;s picks
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredListings.map((listing) => (
                <FeaturedListing
                  key={listing.slug}
                  listing={listing as Parameters<typeof FeaturedListing>[0]["listing"]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warmwhite mb-4">
              Not sure where to start?
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-xl mx-auto mb-8">
              SparkGood matches you with the right resources based on your idea,
              location, and budget. Get a personalized launch plan in minutes.
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20"
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
            <p className="text-warmwhite-dim text-sm text-center md:text-right">
              Free resources for entrepreneurs making a difference.
              <br className="md:hidden" />
              <span className="hidden md:inline"> • </span>© 2026 SparkGood
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
