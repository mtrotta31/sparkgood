// SparkGood Resource Directory - Individual Listing Page
// Detailed view of a single resource

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type AcceleratorDetails,
  type GrantDetails,
  type SBADetails,
} from "@/types/resources";
import ResourceListingCard from "@/components/resources/ResourceListingCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("resource_listings")
    .select("name, short_description, category, city, state, is_nationwide, logo_url")
    .eq("slug", slug)
    .single();

  if (!listing) {
    return { title: "Not Found" };
  }

  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const categoryName = categoryInfo?.name.toLowerCase() || "resource";

  // Build location string
  const location = listing.is_nationwide
    ? "nationwide"
    : listing.city && listing.state
    ? `in ${listing.city}, ${listing.state}`
    : "";

  const title = `${listing.name} | ${categoryInfo?.name || "Resource"} for Entrepreneurs | SparkGood`;

  const description = listing.short_description ||
    `${listing.name} is a ${categoryName} ${location} for entrepreneurs. Learn about eligibility, how to apply, and more.`;

  return {
    title,
    description,
    keywords: [
      listing.name,
      categoryInfo?.plural.toLowerCase() || "",
      listing.city || "",
      listing.state || "",
      "small business resources",
      "entrepreneur support",
    ].filter(Boolean),
    openGraph: {
      title: listing.name,
      description,
      type: "website",
      siteName: "SparkGood",
      url: `https://sparkgood.io/resources/listing/${slug}`,
      ...(listing.logo_url && {
        images: [
          {
            url: listing.logo_url,
            width: 200,
            height: 200,
            alt: listing.name,
          },
        ],
      }),
    },
    twitter: {
      card: listing.logo_url ? "summary" : "summary",
      title: listing.name,
      description,
      ...(listing.logo_url && { images: [listing.logo_url] }),
    },
    alternates: {
      canonical: `https://sparkgood.io/resources/listing/${slug}`,
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get the listing
  const { data: listing } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!listing) {
    notFound();
  }

  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const details = listing.details as AcceleratorDetails & GrantDetails & SBADetails;

  // Get related listings (same category, different listing)
  const { data: relatedListings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .eq("category", listing.category)
    .neq("id", listing.id)
    .order("is_featured", { ascending: false })
    .limit(4);

  // Format location
  const location = listing.is_nationwide
    ? "Nationwide"
    : listing.is_remote
    ? "Remote"
    : listing.city && listing.state
    ? `${listing.city}, ${listing.state}`
    : null;

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
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-warmwhite-muted">
            <Link href="/resources" className="hover:text-warmwhite">
              Resources
            </Link>
            <span>/</span>
            <Link
              href={`/resources/${listing.category}`}
              className="hover:text-warmwhite"
            >
              {categoryInfo.plural}
            </Link>
            <span>/</span>
            <span className="text-warmwhite truncate">{listing.name}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="pt-6 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-charcoal border border-warmwhite/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {listing.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.logo_url}
                  alt={listing.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span
                  className={`text-3xl font-bold ${categoryInfo?.color || "text-spark"}`}
                >
                  {listing.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-xs font-medium ${categoryInfo?.color || "text-spark"} bg-charcoal px-3 py-1 rounded-full`}
                >
                  {categoryInfo?.name || listing.category}
                </span>
                {listing.is_featured && (
                  <span className="text-xs text-spark flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-2">
                {listing.name}
              </h1>
              {listing.short_description && (
                <p className="text-warmwhite-muted text-lg">
                  {listing.short_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {listing.description && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    About
                  </h2>
                  <p className="text-warmwhite-muted leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Category-specific details */}
              {listing.category === "accelerator" && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    Program Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {details.duration_weeks && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Duration
                        </p>
                        <p className="text-warmwhite font-semibold">
                          {details.duration_weeks} weeks
                        </p>
                      </div>
                    )}
                    {typeof details.funding_provided === "number" && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Funding
                        </p>
                        <p className="text-spark font-bold text-lg">
                          ${details.funding_provided.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {typeof details.equity_taken === "number" && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Equity
                        </p>
                        <p className="text-warmwhite font-semibold">
                          {details.equity_taken === 0
                            ? "No equity taken"
                            : `${details.equity_taken}%`}
                        </p>
                      </div>
                    )}
                    {details.batch_size && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Batch Size
                        </p>
                        <p className="text-warmwhite font-semibold">
                          ~{details.batch_size} companies
                        </p>
                      </div>
                    )}
                  </div>
                  {details.notable_alumni && details.notable_alumni.length > 0 && (
                    <div className="mt-4">
                      <p className="text-warmwhite-dim text-sm mb-2">
                        Notable Alumni
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {details.notable_alumni.map((alumni) => (
                          <span
                            key={alumni}
                            className="px-3 py-1 bg-charcoal-light rounded-full text-sm text-warmwhite"
                          >
                            {alumni}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {listing.category === "grant" && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    Grant Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(details.amount_min || details.amount_max) && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Grant Amount
                        </p>
                        <p className="text-spark font-bold text-lg">
                          {details.amount_min && details.amount_max
                            ? `$${details.amount_min.toLocaleString()} - $${details.amount_max.toLocaleString()}`
                            : details.amount_max
                            ? `Up to $${details.amount_max.toLocaleString()}`
                            : `$${details.amount_min?.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                    {details.deadline && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Deadline
                        </p>
                        <p className="text-warmwhite font-semibold">
                          {details.deadline}
                        </p>
                      </div>
                    )}
                    {details.grant_type && (
                      <div className="p-4 rounded-lg bg-charcoal-light">
                        <p className="text-warmwhite-dim text-sm mb-1">
                          Grant Type
                        </p>
                        <p className="text-warmwhite font-semibold capitalize">
                          {details.grant_type}
                        </p>
                      </div>
                    )}
                  </div>
                  {details.eligibility && (
                    <div className="mt-4">
                      <p className="text-warmwhite-dim text-sm mb-2">
                        Eligibility
                      </p>
                      <p className="text-warmwhite">{details.eligibility}</p>
                    </div>
                  )}
                </div>
              )}

              {listing.category === "sba" && details.services && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    Services Offered
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {details.services.map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-charcoal-light rounded-full text-sm text-warmwhite"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories / Focus Areas */}
              {listing.subcategories && listing.subcategories.length > 0 && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    Focus Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.subcategories.map((sub: string) => (
                      <span
                        key={sub}
                        className="px-3 py-1 bg-spark/10 text-spark rounded-full text-sm"
                      >
                        {sub
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cause Areas */}
              {listing.cause_areas && listing.cause_areas.length > 0 && (
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h2 className="font-display text-xl font-bold text-warmwhite mb-4">
                    Impact Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.cause_areas.map((cause: string) => (
                      <span
                        key={cause}
                        className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm"
                      >
                        {cause
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* CTA Card */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20">
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-colors mb-4"
                    >
                      Visit Website
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
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  )}

                  {details.application_url && (
                    <a
                      href={details.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-charcoal hover:bg-charcoal-light text-warmwhite font-semibold rounded-full transition-colors border border-warmwhite/10"
                    >
                      Apply Now
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
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Details Card */}
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h3 className="font-display text-lg font-bold text-warmwhite mb-4">
                    Details
                  </h3>
                  <dl className="space-y-4">
                    {location && (
                      <div>
                        <dt className="text-warmwhite-dim text-sm">Location</dt>
                        <dd className="text-warmwhite">{location}</dd>
                      </div>
                    )}
                    {listing.phone && (
                      <div>
                        <dt className="text-warmwhite-dim text-sm">Phone</dt>
                        <dd>
                          <a
                            href={`tel:${listing.phone}`}
                            className="text-spark hover:text-spark-400 transition-colors"
                          >
                            {listing.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {listing.email && (
                      <div>
                        <dt className="text-warmwhite-dim text-sm">Email</dt>
                        <dd>
                          <a
                            href={`mailto:${listing.email}`}
                            className="text-spark hover:text-spark-400 transition-colors break-all"
                          >
                            {listing.email}
                          </a>
                        </dd>
                      </div>
                    )}
                    {listing.address && (
                      <div>
                        <dt className="text-warmwhite-dim text-sm">Address</dt>
                        <dd className="text-warmwhite">
                          {listing.address}
                          {listing.city && listing.state && (
                            <>
                              <br />
                              {listing.city}, {listing.state} {listing.zip}
                            </>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* SparkGood CTA */}
                <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
                  <h4 className="font-display text-warmwhite font-semibold mb-2">
                    Need help applying?
                  </h4>
                  <p className="text-warmwhite-dim text-sm mb-4">
                    SparkGood can help you build a business plan, pitch deck,
                    and application materials.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-spark text-sm font-semibold hover:text-spark-400 transition-colors"
                  >
                    Build Your Launch Plan
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
          </div>
        </div>
      </section>

      {/* Related Listings */}
      {relatedListings && relatedListings.length > 0 && (
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-warmwhite mb-6">
              Similar {categoryInfo?.plural || "Resources"}
            </h2>
            <div className="grid gap-4">
              {relatedListings.map((related) => (
                <ResourceListingCard
                  key={related.id}
                  listing={related as ResourceListing}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/resources/${listing.category}`}
                className="text-spark hover:text-spark-400 transition-colors"
              >
                View all {categoryInfo?.plural.toLowerCase() || "resources"} →
              </Link>
            </div>
          </div>
        </section>
      )}

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
