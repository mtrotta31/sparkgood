"use client";

import Link from "next/link";
import type { LocalResourcesData, LocalResourceItem } from "@/types";

interface LocalResourcesProps {
  data: LocalResourcesData;
  isLoading?: boolean;
}

// Category configuration: display properties for each category
const CATEGORY_CONFIG: Record<string, { bg: string; text: string; label: string; emoji: string; heading: string }> = {
  coworking: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Coworking", emoji: "🏢", heading: "Coworking Spaces Near You" },
  "virtual-office": { bg: "bg-indigo-500/10", text: "text-indigo-400", label: "Virtual Office", emoji: "💼", heading: "Virtual Office Solutions" },
  grant: { bg: "bg-green-500/10", text: "text-green-400", label: "Grant", emoji: "💵", heading: "Grants You May Qualify For" },
  accelerator: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Accelerator", emoji: "🚀", heading: "Accelerator Programs" },
  sba: { bg: "bg-red-500/10", text: "text-red-400", label: "SBA", emoji: "🏛️", heading: "Free SBA Mentorship" },
  "chamber-of-commerce": { bg: "bg-amber-500/10", text: "text-amber-400", label: "Chamber", emoji: "🤝", heading: "Chamber of Commerce" },
  "business-attorney": { bg: "bg-purple-500/10", text: "text-purple-400", label: "Attorney", emoji: "⚖️", heading: "Business Attorneys" },
  "business-consultant": { bg: "bg-cyan-500/10", text: "text-cyan-400", label: "Consultant", emoji: "📋", heading: "Business Consultants" },
  "business-insurance": { bg: "bg-teal-500/10", text: "text-teal-400", label: "Insurance", emoji: "🛡️", heading: "Business Insurance" },
  "marketing-agency": { bg: "bg-pink-500/10", text: "text-pink-400", label: "Marketing", emoji: "📣", heading: "Marketing Agencies" },
  accountant: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Accountant", emoji: "📊", heading: "Accountants & CPAs" },
  "commercial-real-estate": { bg: "bg-rose-500/10", text: "text-rose-400", label: "Real Estate", emoji: "🏬", heading: "Commercial Real Estate" },
};

// Category badge colors
function getCategoryBadge(category: string) {
  const config = CATEGORY_CONFIG[category];
  if (config) {
    return { bg: config.bg, text: config.text, label: config.label };
  }
  // Fallback for unknown categories
  const label = category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return { bg: "bg-warmwhite/10", text: "text-warmwhite", label };
}

// Get section info for a category
function getSectionInfo(category: string) {
  const config = CATEGORY_CONFIG[category];
  if (config) {
    return { emoji: config.emoji, heading: config.heading };
  }
  // Fallback for unknown categories
  const heading = category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return { emoji: "📌", heading };
}

// Resource Card Component
function ResourceCard({ resource }: { resource: LocalResourceItem }) {
  const badge = getCategoryBadge(resource.category);

  return (
    <Link
      href={`/resources/listing/${resource.slug}`}
      className="block bg-charcoal-light rounded-xl p-4 hover:bg-charcoal-light/80 transition-colors border border-warmwhite/5 hover:border-spark/30"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-medium text-warmwhite hover:text-spark transition-colors line-clamp-1">
          {resource.name}
        </h4>
        <span className={`${badge.bg} ${badge.text} text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap`}>
          {badge.label}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-warmwhite-muted mb-2">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {resource.isNationwide ? (
          <span>Nationwide</span>
        ) : (
          <span>{resource.city}, {resource.state}</span>
        )}
      </div>

      {/* Category-specific details */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Coworking & Virtual Office: Rating & Price */}
        {(resource.category === "coworking" || resource.category === "virtual-office") && (
          <>
            {resource.rating && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {resource.rating.toFixed(1)}
              </span>
            )}
            {resource.priceRange && (
              <span className="text-xs text-warmwhite-muted">{resource.priceRange}</span>
            )}
          </>
        )}

        {/* Grant: Amount & Deadline */}
        {resource.category === "grant" && (
          <>
            {resource.amountRange && (
              <span className="text-xs font-semibold text-green-400">{resource.amountRange}</span>
            )}
            {resource.deadline && (
              <span className="text-xs text-warmwhite-muted">Deadline: {resource.deadline}</span>
            )}
          </>
        )}

        {/* Accelerator: Funding & Deadline */}
        {resource.category === "accelerator" && (
          <>
            {resource.fundingAmount && (
              <span className="text-xs font-semibold text-orange-400">{resource.fundingAmount}</span>
            )}
            {resource.deadline && (
              <span className="text-xs text-warmwhite-muted">Next: {resource.deadline}</span>
            )}
          </>
        )}

        {/* SBA & Chamber: FREE badge & Services */}
        {(resource.category === "sba" || resource.category === "chamber-of-commerce") && (
          <>
            {resource.isFree && (
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded">FREE</span>
            )}
            {resource.services && resource.services.length > 0 && (
              <span className="text-xs text-warmwhite-muted">{resource.services.slice(0, 2).join(", ")}</span>
            )}
          </>
        )}

        {/* Professional Services: Specialty */}
        {["business-attorney", "business-consultant", "accountant", "marketing-agency", "business-insurance"].includes(resource.category) && (
          <>
            {resource.specialty && (
              <span className="text-xs text-warmwhite-muted">{resource.specialty}</span>
            )}
          </>
        )}

        {/* Commercial Real Estate: No specific details yet */}
      </div>

      {/* Relevance note */}
      <p className="text-sm text-warmwhite-muted line-clamp-2">{resource.relevanceNote}</p>
    </Link>
  );
}

// Section Header
function SectionHeader({ emoji, title, count }: { emoji: string; title: string; count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{emoji}</span>
      <h3 className="font-display text-lg font-bold text-warmwhite">{title}</h3>
      <span className="text-xs text-warmwhite-muted bg-warmwhite/10 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-spark/10 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-warmwhite mb-2">
        Growing Our Directory
      </h3>
      <p className="text-warmwhite-muted mb-6 max-w-md mx-auto">
        We&apos;re expanding our local resource database. In the meantime, explore nationwide resources that can help your business.
      </p>
      <Link
        href="/resources"
        className="inline-flex items-center gap-2 px-6 py-3 bg-spark text-charcoal-dark font-semibold rounded-full hover:bg-spark-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Explore All Resources
      </Link>
    </div>
  );
}

export default function LocalResources({ data, isLoading }: LocalResourcesProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-3 border-spark border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-warmwhite-muted">Finding resources in your area...</p>
      </div>
    );
  }

  // If no resources matched
  if (data.totalMatched === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-spark/10 to-accent/10 rounded-2xl p-6 border border-spark/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📍</span>
          <h2 className="font-display text-xl font-bold text-warmwhite">
            Local Resources in {data.cityName}, {data.state}
          </h2>
        </div>
        <p className="text-warmwhite-muted">
          We found <span className="text-spark font-semibold">{data.totalMatched} resources</span> matched to your business and location.
        </p>
      </div>

      {/* Render all categories dynamically */}
      {(data.allCategories || Object.keys(data.byCategory || {})).map((category) => {
        const resources = data.byCategory?.[category] || [];
        if (resources.length === 0) return null;

        const { emoji, heading } = getSectionInfo(category);
        // Use 2-column grid for grants (more info), 3-column for others
        const gridCols = category === "grant" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

        return (
          <section key={category}>
            <SectionHeader emoji={emoji} title={heading} count={resources.length} />
            <div className={`grid gap-4 ${gridCols}`}>
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Fallback: Render legacy fields if byCategory is empty (backward compatibility) */}
      {(!data.byCategory || Object.keys(data.byCategory).length === 0) && (
        <>
          {data.coworking.length > 0 && (
            <section>
              <SectionHeader emoji="🏢" title="Coworking Spaces Near You" count={data.coworking.length} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.coworking.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
          {data.grants.length > 0 && (
            <section>
              <SectionHeader emoji="💵" title="Grants You May Qualify For" count={data.grants.length} />
              <div className="grid gap-4 md:grid-cols-2">
                {data.grants.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
          {data.accelerators.length > 0 && (
            <section>
              <SectionHeader emoji="🚀" title="Accelerator Programs" count={data.accelerators.length} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.accelerators.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
          {data.sba.length > 0 && (
            <section>
              <SectionHeader emoji="🏛️" title="Free SBA Mentorship" count={data.sba.length} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.sba.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Explore more link */}
      <div className="text-center pt-4">
        <Link
          href={`/resources/${data.citySlug}`}
          className="inline-flex items-center gap-2 text-spark hover:text-spark-400 font-medium transition-colors"
        >
          Explore all resources in {data.cityName}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
