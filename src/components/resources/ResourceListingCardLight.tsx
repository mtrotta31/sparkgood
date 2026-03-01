// Resource Listing Card component (Light Theme)
// Displays a single resource in a warm, light-themed card format

import Link from "next/link";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type AcceleratorDetails,
  type GrantDetails,
  type SBADetails,
} from "@/types/resources";
import { formatAmount } from "@/lib/format-amount";

// Category accent colors for light theme
const CATEGORY_LIGHT_COLORS: Record<
  ResourceCategory,
  { bg: string; text: string; border: string }
> = {
  grant: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  coworking: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  accelerator: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  sba: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  incubator: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  event_space: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  pitch_competition: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  mentorship: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  legal: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  accounting: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  marketing: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  investor: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  // New expansion categories
  "business-attorney": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  accountant: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  "marketing-agency": {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  "print-shop": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  "commercial-real-estate": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  "business-insurance": {
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-200",
  },
  "chamber-of-commerce": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  "virtual-office": {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  "business-consultant": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
};

interface Props {
  listing: ResourceListing;
  compact?: boolean;
}

export default function ResourceListingCardLight({ listing, compact }: Props) {
  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const categoryColors =
    CATEGORY_LIGHT_COLORS[listing.category as ResourceCategory];
  const details = listing.details as AcceleratorDetails &
    GrantDetails &
    SBADetails;

  // Format location
  const location = listing.is_nationwide
    ? "Nationwide"
    : listing.is_remote
    ? "Remote"
    : listing.city && listing.state
    ? `${listing.city}, ${listing.state}`
    : null;

  // Get key detail based on category
  const keyDetail = (() => {
    switch (listing.category) {
      case "grant":
        if (details.amount_max) {
          const formatted = formatAmount(details.amount_max, { prefix: "Up to " });
          return formatted;
        }
        break;
      case "accelerator":
        // Only show funding if it's a positive value
        if (details.funding_provided && details.funding_provided > 0) {
          const formatted = formatAmount(details.funding_provided);
          return formatted ? `${formatted} funding` : null;
        }
        if (details.equity_taken === 0) {
          return "No equity";
        }
        break;
      case "sba":
        if (details.sba_type) {
          return details.sba_type;
        }
        break;
    }
    return null;
  })();

  if (compact) {
    return (
      <Link
        href={`/resources/listing/${listing.slug}`}
        className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-spark/40 hover:shadow-warm-md transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 overflow-hidden">
          {listing.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logo_url}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className={`text-lg font-bold ${categoryColors.text}`}>
              {listing.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-800 group-hover:text-spark transition-colors line-clamp-2">
            {listing.name}
          </h4>
          {location && <p className="text-slate-500 text-sm">{location}</p>}
        </div>
        {keyDetail && (
          <span className="text-spark text-sm font-semibold flex-shrink-0">
            {keyDetail}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/resources/listing/${listing.slug}`}
      className="group block p-6 rounded-2xl bg-white border border-slate-200 hover:border-spark/30 transition-all shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
    >
      <div className="flex gap-5">
        {/* Logo / Icon */}
        <div
          className={`w-14 h-14 rounded-xl ${categoryColors.bg} flex items-center justify-center flex-shrink-0 overflow-hidden`}
        >
          {listing.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logo_url}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className={`text-2xl font-bold ${categoryColors.text}`}>
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-xs font-medium ${categoryColors.text} ${categoryColors.bg} px-2.5 py-1 rounded-full`}
                >
                  {categoryInfo.name}
                </span>
                {listing.is_featured && (
                  <span className="text-xs text-spark flex items-center gap-1 font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800 group-hover:text-spark transition-colors line-clamp-2">
                {listing.name}
              </h3>
            </div>
            {keyDetail && (
              <span className="text-spark font-bold whitespace-nowrap">
                {keyDetail}
              </span>
            )}
          </div>

          {/* Description */}
          {listing.short_description && (
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">
              {listing.short_description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {location && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-slate-400"
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
                {location}
              </span>
            )}

            {/* Category-specific details */}
            {listing.category === "accelerator" && details.duration_weeks && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {details.duration_weeks} weeks
              </span>
            )}

            {listing.category === "accelerator" &&
              typeof details.equity_taken === "number" && (
                <span>
                  {details.equity_taken === 0
                    ? "No equity"
                    : `${details.equity_taken}% equity`}
                </span>
              )}

            {listing.category === "grant" && details.deadline && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-slate-400"
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
                {details.deadline}
              </span>
            )}

            {/* Subcategories */}
            {listing.subcategories &&
              listing.subcategories.slice(0, 2).map((sub) => (
                <span
                  key={sub}
                  className="px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600"
                >
                  {sub
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </span>
              ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-slate-300 group-hover:text-spark transition-colors">
          <svg
            className="w-5 h-5"
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
        </div>
      </div>
    </Link>
  );
}
