"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Idea, UserProfile } from "@/types";
import type { ResourceListing } from "@/types/resources";
import { CATEGORY_INFO } from "@/types/resources";

interface ScoredListing extends ResourceListing {
  match_score: number;
  match_reasons: string[];
}

interface MatchedResourcesProps {
  idea: Idea;
  profile: UserProfile;
}

// Categories shown in the matched resources section
type MatchCategory = "grant" | "accelerator" | "coworking" | "sba";

// Map API categories to display order
const CATEGORY_ORDER: MatchCategory[] = ["grant", "accelerator", "coworking", "sba"];

// Category metadata for display
const CATEGORY_DISPLAY = {
  grant: {
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: "bg-green-500/20",
    title: "Grants & Funding",
    subtitle: "Foundation and government grants",
  },
  accelerator: {
    icon: (
      <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bgColor: "bg-spark/20",
    title: "Accelerators",
    subtitle: "Programs to help you grow faster",
  },
  coworking: {
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bgColor: "bg-purple-500/20",
    title: "Coworking Spaces",
    subtitle: "Work and meeting spaces near you",
  },
  sba: {
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    bgColor: "bg-blue-500/20",
    title: "SBA Resources",
    subtitle: "Free government business support",
  },
};

export default function MatchedResources({ idea, profile }: MatchedResourcesProps) {
  const [matches, setMatches] = useState<Record<string, ScoredListing[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/resources/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cause_areas: idea.causeAreas || [],
            location: profile.location || undefined,
            commitment_level: profile.commitment || undefined,
            venture_type: profile.ventureType || undefined,
            budget_level: profile.budget || undefined,
          }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          setMatches(data.data.matches);
        } else {
          setError(data.error || "Failed to load resources");
        }
      } catch (err) {
        console.error("Error fetching matched resources:", err);
        setError("Unable to load resources. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [idea.causeAreas, profile.location, profile.commitment, profile.ventureType, profile.budget]);

  // Get location display string for a listing
  const getLocationString = (listing: ScoredListing) => {
    if (listing.is_nationwide) return "Nationwide";
    if (listing.is_remote) return "Remote";
    if (listing.city && listing.state) return `${listing.city}, ${listing.state}`;
    if (listing.state) return listing.state;
    return "Various locations";
  };

  // Render a single resource card
  const ResourceCard = ({ listing }: { listing: ScoredListing }) => (
    <div className="bg-charcoal-dark/70 rounded-xl p-4 border border-warmwhite/5 hover:border-warmwhite/10 transition-colors">
      <div className="flex items-start gap-3">
        {/* Logo or placeholder */}
        <div className="w-10 h-10 rounded-lg bg-charcoal flex items-center justify-center flex-shrink-0 overflow-hidden">
          {listing.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logo_url}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-warmwhite-dim text-lg">
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and location */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-warmwhite text-sm leading-tight line-clamp-1">
              {listing.name}
            </h4>
            <span className="text-xs text-warmwhite-dim whitespace-nowrap flex-shrink-0">
              {getLocationString(listing)}
            </span>
          </div>

          {/* Description */}
          <p className="text-warmwhite-muted text-xs line-clamp-2 mb-3">
            {listing.short_description}
          </p>

          {/* Match reasons */}
          {listing.match_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.match_reasons.slice(0, 2).map((reason, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-spark/10 text-spark"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-spark hover:text-spark-400 transition-colors"
              >
                Visit Website
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <Link
              href={`/resources/listing/${listing.slug}`}
              className="flex items-center gap-1 text-xs text-warmwhite-muted hover:text-warmwhite transition-colors"
            >
              View Details
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Render a category section
  const CategorySection = ({ category }: { category: MatchCategory }) => {
    const display = CATEGORY_DISPLAY[category];
    const categoryInfo = CATEGORY_INFO[category];
    const categoryMatches = matches?.[category] || [];

    return (
      <div className="bg-charcoal-dark rounded-xl p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg ${display.bgColor} flex items-center justify-center`}>
            {display.icon}
          </div>
          <div>
            <h3 className="font-medium text-warmwhite">{display.title}</h3>
            <p className="text-xs text-warmwhite-dim">{display.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 text-warmwhite-dim text-sm py-4">
            <div className="w-2 h-2 rounded-full bg-spark animate-pulse" />
            Matching resources...
          </div>
        ) : categoryMatches.length > 0 ? (
          <div className="space-y-3">
            {categoryMatches.map((listing) => (
              <ResourceCard key={listing.id} listing={listing} />
            ))}
            {/* Browse all link */}
            <Link
              href={`/resources/${category}`}
              className="flex items-center justify-center gap-1 py-2 text-xs text-warmwhite-muted hover:text-warmwhite transition-colors"
            >
              Browse all {categoryInfo.plural.toLowerCase()}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-warmwhite-muted text-sm mb-2">
              No matches in your area
            </p>
            <Link
              href={`/resources/${category}`}
              className="inline-flex items-center gap-1 text-spark text-sm hover:text-spark-400 transition-colors"
            >
              Browse all {categoryInfo.plural.toLowerCase()}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-warmwhite">Resources That Can Help</h2>
          <p className="text-warmwhite-dim text-sm">
            {profile.location
              ? `Matched to your idea and ${profile.location.city}, ${profile.location.state}`
              : "Matched to your idea and cause areas"}
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-spark text-sm mt-2 hover:text-spark-400 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Category grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORY_ORDER.map((category) => (
          <CategorySection key={category} category={category} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-warmwhite/10">
        <div className="flex items-center justify-between">
          <p className="text-warmwhite-dim text-xs">
            Resources matched based on your cause area, location, and venture type
          </p>
          <Link
            href="/resources"
            className="text-spark text-xs hover:text-spark-400 transition-colors flex items-center gap-1"
          >
            Explore all resources
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
