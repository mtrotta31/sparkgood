// Resource Listing Card component
// Displays a single resource in a card format

import Link from "next/link";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type AcceleratorDetails,
  type GrantDetails,
  type SBADetails,
} from "@/types/resources";

interface Props {
  listing: ResourceListing;
  compact?: boolean;
}

export default function ResourceListingCard({ listing, compact }: Props) {
  const categoryInfo = CATEGORY_INFO[listing.category as ResourceCategory];
  const details = listing.details as AcceleratorDetails & GrantDetails & SBADetails;

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
          return `Up to $${(details.amount_max / 1000).toFixed(0)}K`;
        }
        break;
      case "accelerator":
        if (details.funding_provided) {
          return `$${(details.funding_provided / 1000).toFixed(0)}K funding`;
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
        className="group flex items-center gap-3 p-3 rounded-lg bg-charcoal border border-warmwhite/5 hover:border-spark/20 transition-all"
      >
        <div className="w-10 h-10 rounded-lg bg-charcoal-light flex items-center justify-center flex-shrink-0 overflow-hidden">
          {listing.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logo_url}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className={`text-lg ${categoryInfo.color}`}>
              {listing.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-warmwhite group-hover:text-spark transition-colors truncate">
            {listing.name}
          </h4>
          {location && (
            <p className="text-warmwhite-dim text-sm">{location}</p>
          )}
        </div>
        {keyDetail && (
          <span className="text-spark text-sm font-medium flex-shrink-0">
            {keyDetail}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/resources/listing/${listing.slug}`}
      className="group block p-6 rounded-xl bg-charcoal border border-warmwhite/10 hover:border-spark/30 transition-all hover:shadow-lg hover:shadow-spark/5"
    >
      <div className="flex gap-4">
        {/* Logo / Icon */}
        <div className="w-14 h-14 rounded-xl bg-charcoal-light flex items-center justify-center flex-shrink-0 overflow-hidden">
          {listing.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logo_url}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className={`text-2xl font-bold ${categoryInfo.color}`}>
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${categoryInfo.color} bg-charcoal-light px-2 py-0.5 rounded-full`}
                >
                  {categoryInfo.name}
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
              <h3 className="font-display text-lg font-bold text-warmwhite group-hover:text-spark transition-colors">
                {listing.name}
              </h3>
            </div>
            {keyDetail && (
              <span className="text-spark font-semibold whitespace-nowrap">
                {keyDetail}
              </span>
            )}
          </div>

          {/* Description */}
          {listing.short_description && (
            <p className="text-warmwhite-muted text-sm mb-3 line-clamp-2">
              {listing.short_description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-warmwhite-dim">
            {location && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                  className="px-2 py-0.5 bg-charcoal-light rounded-full text-xs"
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
        <div className="flex items-center text-warmwhite-dim group-hover:text-spark transition-colors">
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
