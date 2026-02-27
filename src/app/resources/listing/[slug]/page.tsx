// SparkLocal Resource Directory - Individual Listing Page (Light Theme)
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
  type CoworkingDetails,
  type ListingEnrichmentData,
} from "@/types/resources";
import ResourceCard from "@/components/resources/ResourceCard";
import ResourceStructuredData from "@/components/seo/ResourceStructuredData";
import CopyButton from "@/components/resources/CopyButton";
import DirectoryBuilderCTA from "@/components/resources/DirectoryBuilderCTA";
import { formatHours } from "@/lib/formatHours";
import { formatDescription } from "@/lib/format-description";
import { formatAmount, formatAmountRange } from "@/lib/format-amount";

// Safely format eligibility for display
// Handles: string, array, object, null/undefined
function formatEligibility(eligibility: unknown): string | null {
  if (!eligibility) return null;
  if (typeof eligibility === "string") return eligibility;
  if (Array.isArray(eligibility)) return eligibility.join(", ");
  if (typeof eligibility === "object") {
    // Try to extract meaningful text from object
    const values = Object.values(eligibility).filter(Boolean);
    return values.length > 0 ? values.join(", ") : null;
  }
  return String(eligibility);
}

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
    .select("name, short_description, description, category, city, state, is_nationwide, logo_url")
    .eq("slug", slug)
    .single();

  if (!listing) {
    return { title: "Not Found" };
  }

  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const categoryName = categoryInfo?.name || "Resource";

  // Build location string
  const locationStr = listing.is_nationwide
    ? "nationwide"
    : listing.city && listing.state
    ? `in ${listing.city}, ${listing.state}`
    : "";

  const title = `${listing.name} | ${categoryName} for Entrepreneurs`;

  // Build unique, keyword-rich description under 160 chars
  // Format: "{name} - {category} in {city}, {state}. {snippet}. Find details on SparkLocal."
  const snippet = listing.short_description || listing.description || "";
  const truncatedSnippet = snippet.length > 80
    ? snippet.slice(0, 77).trim() + "..."
    : snippet;

  const description = truncatedSnippet
    ? `${listing.name} — ${categoryName.toLowerCase()} ${locationStr}. ${truncatedSnippet} Details on SparkLocal.`
    : `${listing.name} — ${categoryName.toLowerCase()} ${locationStr} for entrepreneurs. Find hours, contact info, and how to apply on SparkLocal.`;

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
      siteName: "SparkLocal",
      url: `https://sparklocal.co/resources/listing/${slug}`,
      images: listing.logo_url
        ? [
            {
              url: listing.logo_url,
              width: 200,
              height: 200,
              alt: listing.name,
            },
          ]
        : [
            {
              url: "https://sparklocal.co/og-default.png",
              width: 1200,
              height: 630,
              alt: "SparkLocal - Business Resources Directory",
            },
          ],
    },
    twitter: {
      card: listing.logo_url ? "summary" : "summary_large_image",
      title: listing.name,
      description,
      images: [listing.logo_url || "https://sparklocal.co/og-default.png"],
    },
    alternates: {
      canonical: `https://sparklocal.co/resources/listing/${slug}`,
    },
  };
}

// Get category accent color
function getCategoryColor(category: string) {
  switch (category) {
    case "grant": return { text: "text-green-600", bg: "bg-green-100", border: "border-green-600" };
    case "coworking": return { text: "text-blue-600", bg: "bg-blue-100", border: "border-blue-600" };
    case "accelerator": return { text: "text-orange-600", bg: "bg-orange-100", border: "border-orange-600" };
    case "sba": return { text: "text-red-600", bg: "bg-red-100", border: "border-red-600" };
    case "incubator": return { text: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-600" };
    default: return { text: "text-gray-600", bg: "bg-gray-100", border: "border-gray-600" };
  }
}

// FAQ structured data component
function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

// Breadcrumb structured data component
function BreadcrumbStructuredData({
  category,
  categoryName,
  citySlug,
  cityName,
  listingName,
}: {
  category: string;
  categoryName: string;
  citySlug?: string;
  cityName?: string;
  listingName: string;
}) {
  const items: Array<{
    "@type": string;
    position: number;
    name: string;
    item?: string;
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Resources",
      item: "https://sparklocal.co/resources",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: categoryName,
      item: `https://sparklocal.co/resources/${category}`,
    },
  ];

  if (citySlug && cityName) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: cityName,
      item: `https://sparklocal.co/resources/${citySlug}`,
    });
    items.push({
      "@type": "ListItem",
      position: 4,
      name: listingName,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: listingName,
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

// Star rating component
function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star-listing">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path fill="url(#half-star-listing)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-lg font-semibold text-gray-900">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-gray-500">({reviewCount.toLocaleString()} reviews)</span>
      )}
    </div>
  );
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
  const categoryColor = getCategoryColor(listing.category);
  const details = listing.details as AcceleratorDetails & GrantDetails & SBADetails & CoworkingDetails;

  // Get similar listings (same category and city/state)
  const { data: similarListings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true)
    .eq("category", listing.category)
    .neq("id", listing.id)
    .or(listing.city && listing.state
      ? `and(city.eq.${listing.city},state.eq.${listing.state}),is_nationwide.eq.true`
      : "is_nationwide.eq.true"
    )
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

  // Build breadcrumb path
  const breadcrumbLocation = listing.city && listing.state
    ? `${listing.city}, ${listing.state}`
    : null;

  // Build city slug for structured data
  const citySlug = listing.city && listing.state
    ? `${listing.city.toLowerCase().replace(/\s+/g, "-")}-${listing.state.toLowerCase()}`
    : undefined;

  // Get enrichment data
  const enrichmentData = listing.enrichment_data as ListingEnrichmentData | undefined;

  return (
    <main className="min-h-screen bg-white">
      {/* Schema.org Structured Data */}
      <ResourceStructuredData listing={listing as ResourceListing} />

      {/* Breadcrumb Schema */}
      <BreadcrumbStructuredData
        category={listing.category}
        categoryName={categoryInfo.plural}
        citySlug={citySlug}
        cityName={breadcrumbLocation || undefined}
        listingName={listing.name}
      />

      {/* FAQ Schema (only if FAQs exist) */}
      {enrichmentData?.ai_faqs && enrichmentData.ai_faqs.length > 0 && (
        <FAQStructuredData faqs={enrichmentData.ai_faqs} />
      )}

      {/* Breadcrumbs */}
      <section className="pt-20 px-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/resources" className="hover:text-gray-700 transition-colors">
              Resources
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href={`/resources/${listing.category}`}
              className="hover:text-gray-700 transition-colors"
            >
              {categoryInfo.plural}
            </Link>
            {breadcrumbLocation && (
              <>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 truncate max-w-[200px]">
                  {breadcrumbLocation}
                </span>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {listing.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.logo_url}
                  alt={listing.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className={`text-4xl font-bold ${categoryColor.text}`}>
                  {listing.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor.bg} ${categoryColor.text}`}>
                  {categoryInfo?.name || listing.category}
                </span>
                {listing.is_featured && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
                {listing.category === "sba" && details.sba_type && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    {details.sba_type}
                  </span>
                )}
                {listing.category === "sba" && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Free
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {listing.name}
              </h1>

              {/* Rating (for coworking) */}
              {listing.category === "coworking" && details.rating && (
                <div className="mb-3">
                  <StarRating rating={details.rating} reviewCount={details.review_count} />
                </div>
              )}

              {/* Location */}
              {location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{location}</span>
                </div>
              )}

              {/* Short description */}
              {(() => {
                const cleanedDescription = formatDescription(listing.short_description, {
                  category: listing.category,
                  city: listing.city || undefined,
                  state: listing.state || undefined,
                });
                return cleanedDescription ? (
                  <p className="text-gray-600 mt-3 text-lg">
                    {cleanedDescription}
                  </p>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description / About Section */}
              {(() => {
                const cleanedAbout = formatDescription(listing.description, {
                  category: listing.category,
                  city: listing.city || undefined,
                  state: listing.state || undefined,
                });
                const isDescriptionShort = !cleanedAbout || cleanedAbout.length < 100;
                const hasAiDescription = enrichmentData?.ai_description && enrichmentData.ai_description.length > 0;

                // Show AI description as main content if original is short/empty
                // Otherwise show original, with AI as supplementary if available
                if (!cleanedAbout && !hasAiDescription) return null;

                return (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                      About
                    </h2>
                    {isDescriptionShort && hasAiDescription ? (
                      // AI description is the main content
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {enrichmentData.ai_description}
                      </p>
                    ) : (
                      // Original description is primary
                      <>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {cleanedAbout}
                        </p>
                        {hasAiDescription && (
                          <p className="text-gray-600 leading-relaxed whitespace-pre-line mt-4">
                            {enrichmentData.ai_description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Accelerator Details */}
              {listing.category === "accelerator" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Program Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {details.duration_weeks && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Duration</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {details.duration_weeks} weeks
                        </p>
                      </div>
                    )}
                    {typeof details.funding_provided === "number" && details.funding_provided > 0 && (
                      <div className="p-4 rounded-lg bg-orange-50">
                        <p className="text-gray-500 text-sm mb-1">Funding</p>
                        <p className="text-orange-600 font-bold text-xl">
                          {formatAmount(details.funding_provided)}
                        </p>
                      </div>
                    )}
                    {/* AI funding as fallback */}
                    {!(typeof details.funding_provided === "number" && details.funding_provided > 0) && enrichmentData?.ai_key_details?.funding && (
                      <div className="p-4 rounded-lg bg-orange-50">
                        <p className="text-gray-500 text-sm mb-1">Funding</p>
                        <p className="text-orange-600 font-bold text-xl">
                          {enrichmentData.ai_key_details.funding}
                        </p>
                      </div>
                    )}
                    {typeof details.equity_taken === "number" && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Equity</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {details.equity_taken === 0 ? "No equity taken" : `${details.equity_taken}%`}
                        </p>
                      </div>
                    )}
                    {details.batch_size && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Batch Size</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          ~{details.batch_size} companies
                        </p>
                      </div>
                    )}
                    {/* AI-generated key details */}
                    {enrichmentData?.ai_key_details?.program_type && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Program Type</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.program_type}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.focus && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Focus</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.focus}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.best_for && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Best For</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.best_for}
                        </p>
                      </div>
                    )}
                  </div>
                  {details.notable_alumni && details.notable_alumni.length > 0 && (
                    <div className="mt-6">
                      <p className="text-gray-500 text-sm mb-2">Notable Alumni</p>
                      <div className="flex flex-wrap gap-2">
                        {details.notable_alumni.map((alumni) => (
                          <span
                            key={alumni}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {alumni}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grant Details */}
              {listing.category === "grant" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Grant Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(details.amount_min || details.amount_max) && formatAmountRange(details.amount_min, details.amount_max) && (
                      <div className="p-4 rounded-lg bg-green-50">
                        <p className="text-gray-500 text-sm mb-1">Grant Amount</p>
                        <p className="text-green-600 font-bold text-xl">
                          {formatAmountRange(details.amount_min, details.amount_max)}
                        </p>
                      </div>
                    )}
                    {/* AI funding range as fallback if no amount data */}
                    {!details.amount_min && !details.amount_max && enrichmentData?.ai_key_details?.funding_range && (
                      <div className="p-4 rounded-lg bg-green-50">
                        <p className="text-gray-500 text-sm mb-1">Funding Range</p>
                        <p className="text-green-600 font-bold text-xl">
                          {enrichmentData.ai_key_details.funding_range}
                        </p>
                      </div>
                    )}
                    {details.deadline && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Deadline</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {details.deadline}
                        </p>
                      </div>
                    )}
                    {details.grant_type && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Grant Type</p>
                        <p className="text-gray-900 font-semibold text-lg capitalize">
                          {details.grant_type}
                        </p>
                      </div>
                    )}
                    {/* AI grant type as fallback */}
                    {!details.grant_type && enrichmentData?.ai_key_details?.grant_type && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Grant Type</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.grant_type}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.application_type && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Application Cycle</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.application_type}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.best_for && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Best For</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.best_for}
                        </p>
                      </div>
                    )}
                  </div>
                  {details.eligibility && formatEligibility(details.eligibility) && (
                    <div className="mt-6">
                      <p className="text-gray-500 text-sm mb-2">Eligibility</p>
                      <p className="text-gray-700">{formatEligibility(details.eligibility)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Coworking Details */}
              {listing.category === "coworking" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Space Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {(details.price_monthly_min || details.price_monthly_max) && (
                      <div className="p-4 rounded-lg bg-blue-50">
                        <p className="text-gray-500 text-sm mb-1">Monthly Price</p>
                        <p className="text-blue-600 font-bold text-xl">
                          {details.price_monthly_min && details.price_monthly_max
                            ? `$${details.price_monthly_min} - $${details.price_monthly_max}`
                            : details.price_monthly_min
                            ? `From $${details.price_monthly_min}`
                            : `Up to $${details.price_monthly_max}`}
                        </p>
                      </div>
                    )}
                    {details.day_pass_price && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Day Pass</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          ${details.day_pass_price}
                        </p>
                      </div>
                    )}
                    {details.hours && formatHours(details.hours) && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Hours</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {formatHours(details.hours)}
                        </p>
                      </div>
                    )}
                    {/* AI-generated key details */}
                    {enrichmentData?.ai_key_details?.workspace_type && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Workspace Type</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.workspace_type}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.best_for && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Best For</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.best_for}
                        </p>
                      </div>
                    )}
                    {enrichmentData?.ai_key_details?.neighborhood && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm mb-1">Neighborhood</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {enrichmentData.ai_key_details.neighborhood}
                        </p>
                      </div>
                    )}
                  </div>
                  {details.amenities && details.amenities.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-sm mb-3">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {details.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SBA Services */}
              {listing.category === "sba" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Services Offered
                  </h2>
                  {/* AI-generated key details for SBA */}
                  {(enrichmentData?.ai_key_details?.program_type || enrichmentData?.ai_key_details?.cost || enrichmentData?.ai_key_details?.best_for) && (
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {enrichmentData?.ai_key_details?.program_type && (
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="text-gray-500 text-sm mb-1">Program Type</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {enrichmentData.ai_key_details.program_type}
                          </p>
                        </div>
                      )}
                      {enrichmentData?.ai_key_details?.cost && (
                        <div className="p-4 rounded-lg bg-green-50">
                          <p className="text-gray-500 text-sm mb-1">Cost</p>
                          <p className="text-green-600 font-bold text-lg">
                            {enrichmentData.ai_key_details.cost}
                          </p>
                        </div>
                      )}
                      {enrichmentData?.ai_key_details?.services && (
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="text-gray-500 text-sm mb-1">Services</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {enrichmentData.ai_key_details.services}
                          </p>
                        </div>
                      )}
                      {enrichmentData?.ai_key_details?.best_for && (
                        <div className="p-4 rounded-lg bg-gray-50">
                          <p className="text-gray-500 text-sm mb-1">Best For</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {enrichmentData.ai_key_details.best_for}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {details.services && details.services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {details.services.map((service: string) => (
                        <span
                          key={service}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Focus Areas / Subcategories */}
              {listing.subcategories && listing.subcategories.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Focus Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.subcategories.map((sub: string) => (
                      <span
                        key={sub}
                        className={`px-3 py-1.5 rounded-full text-sm ${categoryColor.bg} ${categoryColor.text}`}
                      >
                        {sub.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cause Areas */}
              {listing.cause_areas && listing.cause_areas.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Impact Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.cause_areas.map((cause: string) => (
                      <span
                        key={cause}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                      >
                        {cause.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {enrichmentData?.ai_faqs && enrichmentData.ai_faqs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {enrichmentData.ai_faqs.map((faq, i) => (
                      <details
                        key={i}
                        className="group border-b border-gray-200 last:border-0"
                      >
                        <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-gray-900 font-medium hover:text-gray-700 transition-colors">
                          <span className="pr-4">{faq.question}</span>
                          <svg
                            className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <p className="pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* CTA Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full py-3 ${categoryColor.bg} ${categoryColor.text} font-bold rounded-xl transition-colors hover:opacity-90 mb-4`}
                      style={{ backgroundColor: getCategoryColorHex(listing.category) }}
                    >
                      <span className="text-white">Visit Website</span>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}

                  {details.application_url && (
                    <a
                      href={details.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                      Apply Now
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Contact Details Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <dl className="space-y-4">
                    {listing.address && (
                      <div>
                        <dt className="text-gray-500 text-sm mb-1">Address</dt>
                        <dd className="text-gray-900 flex items-start">
                          <span className="flex-1">
                            {listing.address}
                            {listing.city && listing.state && (
                              <>
                                <br />
                                {listing.city}, {listing.state} {listing.zip}
                              </>
                            )}
                          </span>
                          <CopyButton
                            text={`${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`}
                            label="address"
                          />
                        </dd>
                      </div>
                    )}
                    {listing.phone && (
                      <div>
                        <dt className="text-gray-500 text-sm mb-1">Phone</dt>
                        <dd className="flex items-center">
                          <a
                            href={`tel:${listing.phone}`}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {listing.phone}
                          </a>
                          <CopyButton text={listing.phone} label="phone" />
                        </dd>
                      </div>
                    )}
                    {listing.email && (
                      <div>
                        <dt className="text-gray-500 text-sm mb-1">Email</dt>
                        <dd className="flex items-center">
                          <a
                            href={`mailto:${listing.email}`}
                            className="text-blue-600 hover:text-blue-700 transition-colors break-all"
                          >
                            {listing.email}
                          </a>
                          <CopyButton text={listing.email} label="email" />
                        </dd>
                      </div>
                    )}
                    {location && !listing.address && (
                      <div>
                        <dt className="text-gray-500 text-sm mb-1">Location</dt>
                        <dd className="text-gray-900">{location}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* SparkLocal CTA */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                  <h4 className="font-display text-gray-900 font-semibold mb-2">
                    Planning to use this resource?
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Build your complete business plan with SparkLocal and get matched
                    with more resources like this one.
                  </p>
                  <DirectoryBuilderCTA
                    pageType="listing"
                    category={listing.category}
                    city={listing.city || undefined}
                    className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors"
                  >
                    Get Started Free
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </DirectoryBuilderCTA>
                </div>

                {/* More in {City} Links */}
                {listing.city && listing.state && citySlug && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-display text-gray-900 font-semibold mb-3">
                      More in {listing.city}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link
                          href={`/resources/${citySlug}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Browse all resources in {listing.city}, {listing.state} →
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={`/resources/${citySlug}#${listing.category}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          More {categoryInfo?.plural.toLowerCase() || "resources"} in {listing.city} →
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/resources"
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Explore all cities →
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Last Updated Timestamp */}
      {(listing.updated_at || listing.last_enriched_at) && (
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-400">
            Last updated:{" "}
            {new Date(
              Math.max(
                listing.updated_at ? new Date(listing.updated_at).getTime() : 0,
                listing.last_enriched_at ? new Date(listing.last_enriched_at).getTime() : 0
              )
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Similar Resources */}
      {similarListings && similarListings.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              Similar {categoryInfo?.plural || "Resources"} Nearby
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarListings.map((related) => (
                <ResourceCard
                  key={related.id}
                  listing={related as ResourceListing}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/resources/${listing.category}`}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                View all {categoryInfo?.plural.toLowerCase() || "resources"} →
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// Helper function to get hex color for buttons
function getCategoryColorHex(category: string): string {
  switch (category) {
    case "grant": return "#16A34A";
    case "coworking": return "#2563EB";
    case "accelerator": return "#EA580C";
    case "sba": return "#DC2626";
    case "incubator": return "#059669";
    default: return "#6B7280";
  }
}
