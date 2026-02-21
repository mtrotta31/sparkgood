// ResourceCard component for light theme
// Displays a single resource listing as a card with category-specific information

"use client";

import Link from "next/link";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type AcceleratorDetails,
  type GrantDetails,
  type SBADetails,
  type CoworkingDetails,
} from "@/types/resources";
import { formatHours } from "@/lib/formatHours";
import { formatDescription } from "@/lib/format-description";
import { formatAmount, formatAmountRange } from "@/lib/format-amount";

// Safely convert eligibility to a lowercase string for searching
// Handles: string, array, object, null/undefined
function getEligibilityString(eligibility: unknown): string {
  if (!eligibility) return "";
  if (typeof eligibility === "string") return eligibility.toLowerCase();
  if (Array.isArray(eligibility)) return eligibility.join(" ").toLowerCase();
  if (typeof eligibility === "object") return JSON.stringify(eligibility).toLowerCase();
  return String(eligibility).toLowerCase();
}

interface Props {
  listing: ResourceListing;
  variant?: "grid" | "list"; // Reserved for future layout variants
}

// Star rating component
function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}

// Price level display ($-$$$$)
function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-sm font-medium text-gray-700">
      {"$".repeat(Math.min(level, 4))}
      <span className="text-gray-300">{"$".repeat(Math.max(0, 4 - level))}</span>
    </span>
  );
}

// Calculate days until deadline
function getDeadlineInfo(deadline: string): { text: string; urgent: boolean } | null {
  if (!deadline || deadline.toLowerCase() === "rolling" || deadline.toLowerCase().includes("rolling")) {
    return { text: "Rolling", urgent: false };
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return { text: deadline, urgent: false };
  }

  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Closed", urgent: true };
  } else if (diffDays === 0) {
    return { text: "Closes today", urgent: true };
  } else if (diffDays <= 7) {
    return { text: `${diffDays} days left`, urgent: true };
  } else if (diffDays <= 30) {
    return { text: `${diffDays} days left`, urgent: true };
  } else {
    return { text: `Closes ${deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, urgent: false };
  }
}


export default function ResourceCard({ listing, variant: _variant = "grid" }: Props) {
  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const details = listing.details as AcceleratorDetails & GrantDetails & SBADetails & CoworkingDetails;

  // Format location
  const location = listing.is_nationwide
    ? "Nationwide"
    : listing.is_remote
    ? "Remote"
    : listing.city && listing.state
    ? `${listing.city}, ${listing.state}`
    : null;

  // Get the category-specific accent color CSS
  const getCategoryColor = () => {
    switch (listing.category) {
      case "grant": return { border: "#16A34A", bg: "#F0FDF4", text: "#16A34A" };
      case "coworking": return { border: "#2563EB", bg: "#EFF6FF", text: "#2563EB" };
      case "accelerator": return { border: "#EA580C", bg: "#FFF7ED", text: "#EA580C" };
      case "sba": return { border: "#DC2626", bg: "#FEF2F2", text: "#DC2626" };
      case "incubator": return { border: "#059669", bg: "#ECFDF5", text: "#059669" };
      default: return { border: "#6B7280", bg: "#F9FAFB", text: "#6B7280" };
    }
  };

  const categoryColor = getCategoryColor();

  // Render coworking-specific content
  const renderCoworkingContent = () => (
    <>
      {/* Rating */}
      {details.rating && (
        <div className="mb-2">
          <StarRating rating={details.rating} reviewCount={details.review_count} />
        </div>
      )}

      {/* Price and hours row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
        {details.price_level && <PriceLevel level={details.price_level} />}
        {details.price_monthly_min && (
          <span className="font-medium text-gray-800">
            From ${details.price_monthly_min}/mo
          </span>
        )}
        {details.hours && formatHours(details.hours) && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatHours(details.hours)}
          </span>
        )}
      </div>

      {/* Amenities */}
      {details.amenities && details.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {details.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {amenity}
            </span>
          ))}
          {details.amenities.length > 4 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{details.amenities.length - 4} more
            </span>
          )}
        </div>
      )}
    </>
  );

  // Render grant-specific content
  const renderGrantContent = () => {
    const deadlineInfo = details.deadline ? getDeadlineInfo(details.deadline) : null;
    const amountDisplay = formatAmountRange(details.amount_min, details.amount_max);

    return (
      <>
        {/* Amount and deadline row */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {amountDisplay && (
            <span className="text-lg font-bold text-green-600">
              {amountDisplay}
            </span>
          )}
          {deadlineInfo && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              deadlineInfo.urgent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {deadlineInfo.text}
            </span>
          )}
        </div>

        {/* Eligibility tags */}
        {(() => {
          const eligibilityStr = getEligibilityString(details.eligibility);
          const hasEligibilityTags = eligibilityStr.includes("women") ||
                                     eligibilityStr.includes("minority") ||
                                     eligibilityStr.includes("veteran") ||
                                     details.grant_type;
          if (!hasEligibilityTags) return null;
          return (
            <div className="flex flex-wrap gap-1.5">
              {eligibilityStr.includes("women") && (
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs font-medium">Women</span>
              )}
              {eligibilityStr.includes("minority") && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">Minority</span>
              )}
              {eligibilityStr.includes("veteran") && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Veteran</span>
              )}
              {details.grant_type && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                  {details.grant_type}
                </span>
              )}
            </div>
          );
        })()}
      </>
    );
  };

  // Render accelerator-specific content
  const renderAcceleratorContent = () => {
    const deadlineInfo = details.next_deadline ? getDeadlineInfo(details.next_deadline) : null;
    const fundingDisplay = formatAmount(details.funding_provided);

    return (
      <>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {fundingDisplay && (
            <span className="text-lg font-bold text-orange-600">
              {fundingDisplay}
            </span>
          )}
          {typeof details.equity_taken === "number" && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              details.equity_taken === 0
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {details.equity_taken === 0 ? "No equity" : `${details.equity_taken}% equity`}
            </span>
          )}
          {details.duration_weeks && (
            <span className="text-sm text-gray-600">
              {details.duration_weeks} weeks
            </span>
          )}
        </div>

        {/* Deadline badge */}
        {deadlineInfo && (
          <div className="mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              deadlineInfo.urgent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {deadlineInfo.text}
            </span>
          </div>
        )}

        {/* Focus areas */}
        {listing.subcategories && listing.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.subcategories.slice(0, 3).map((sub) => (
              <span
                key={sub}
                className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs"
              >
                {sub.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </span>
            ))}
          </div>
        )}
      </>
    );
  };

  // Render SBA-specific content
  const renderSBAContent = () => (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {details.sba_type && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded font-semibold text-xs">
            {details.sba_type}
          </span>
        )}
        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded font-semibold text-xs">
          Free
        </span>
      </div>

      {/* Services */}
      {details.services && details.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {details.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {service}
            </span>
          ))}
          {details.services.length > 3 && (
            <span className="text-xs text-gray-500">+{details.services.length - 3} more</span>
          )}
        </div>
      )}

      {/* Contact info */}
      {listing.phone && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          {listing.phone}
        </div>
      )}
    </>
  );

  // Render category-specific content
  const renderCategoryContent = () => {
    switch (listing.category) {
      case "coworking":
        return renderCoworkingContent();
      case "grant":
        return renderGrantContent();
      case "accelerator":
      case "incubator":
        return renderAcceleratorContent();
      case "sba":
        return renderSBAContent();
      default:
        return null;
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
      style={{ borderLeft: `4px solid ${categoryColor.border}` }}
    >
      <Link href={`/resources/listing/${listing.slug}`} className="block p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
              >
                {categoryInfo?.name || listing.category}
              </span>
              {listing.is_featured && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
              {listing.name}
            </h3>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {location}
              </div>
            )}
          </div>

          {/* Logo placeholder */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {listing.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.logo_url}
                alt={listing.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: categoryColor.text }}
              >
                {listing.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {(() => {
          const cleanedDescription = formatDescription(listing.short_description, {
            category: listing.category,
            city: listing.city || undefined,
            state: listing.state || undefined,
          });
          return cleanedDescription ? (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {cleanedDescription}
            </p>
          ) : null;
        })()}

        {/* Category-specific content */}
        {renderCategoryContent()}

        {/* Footer with website link */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">View details</span>
          {listing.website && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(listing.website!, "_blank", "noopener,noreferrer");
              }}
              className="text-sm font-medium hover:underline cursor-pointer"
              style={{ color: categoryColor.text }}
            >
              Visit website →
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
