// Resource Matching API
// POST /api/resources/match
// Matches resources to a user's idea based on cause areas, location, and venture type
// This is the critical endpoint for the Deep Dive "Start Here" tab

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ResourceListing, ResourceCategory } from "@/types/resources";

interface MatchRequest {
  cause_areas: string[];
  location?: {
    city: string;
    state: string;
  };
  commitment_level?: "weekend" | "steady" | "all_in";
  venture_type?: "project" | "nonprofit" | "business" | "hybrid";
  budget_level?: "zero" | "low" | "medium" | "high";
}

interface ScoredListing extends ResourceListing {
  match_score: number;
  match_reasons: string[];
}

// Categories to match
const MATCH_CATEGORIES: ResourceCategory[] = ["grant", "accelerator", "sba", "coworking"];

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();
    const { cause_areas = [], location, commitment_level, venture_type, budget_level } = body;

    const supabase = await createClient();

    // Fetch all active listings in target categories
    const { data: allListings, error } = await supabase
      .from("resource_listings")
      .select("*")
      .eq("is_active", true)
      .in("category", MATCH_CATEGORIES);

    if (error) {
      console.error("Match fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch resources" },
        { status: 500 }
      );
    }

    // Score and filter listings
    const scoredListings: ScoredListing[] = (allListings || []).map((listing) => {
      let score = 0;
      const reasons: string[] = [];

      // Location matching
      if (location) {
        if (listing.is_nationwide) {
          score += 3;
          reasons.push("Available nationwide");
        } else if (listing.is_remote) {
          score += 3;
          reasons.push("Available remotely");
        } else if (listing.state === location.state) {
          score += 5;
          if (listing.city === location.city) {
            score += 3;
            reasons.push(`Located in ${location.city}`);
          } else {
            reasons.push(`Available in ${location.state}`);
          }
        }
      } else {
        // If no location provided, prefer nationwide/remote
        if (listing.is_nationwide || listing.is_remote) {
          score += 2;
        }
      }

      // Cause area matching
      if (cause_areas.length > 0 && listing.cause_areas) {
        const matchingCauses = cause_areas.filter((c) =>
          listing.cause_areas.includes(c)
        );
        if (matchingCauses.length > 0) {
          score += matchingCauses.length * 4;
          reasons.push(`Supports ${matchingCauses.join(", ").replace(/_/g, " ")}`);
        }
      }

      // Subcategory matching based on venture type
      if (venture_type && listing.subcategories) {
        const subcats = listing.subcategories as string[];
        if (venture_type === "nonprofit" && subcats.includes("nonprofit")) {
          score += 3;
          reasons.push("Supports nonprofits");
        }
        if (venture_type === "business" && (subcats.includes("tech") || subcats.includes("small-business"))) {
          score += 2;
        }
        if (subcats.includes("social-impact")) {
          score += 3;
          reasons.push("Social impact focus");
        }
      }

      // Budget/commitment matching for accelerators
      if (listing.category === "accelerator") {
        const details = listing.details as Record<string, unknown>;

        // Prefer no-equity programs for low budget
        if (budget_level === "zero" || budget_level === "low") {
          if (details?.equity_taken === 0) {
            score += 4;
            reasons.push("No equity required");
          }
        }

        // Match commitment level to program intensity
        if (commitment_level === "all_in" && details?.duration_weeks && (details.duration_weeks as number) >= 12) {
          score += 2;
        }
        if (commitment_level === "weekend" && listing.is_remote) {
          score += 2;
          reasons.push("Flexible remote program");
        }

        // Funding provided is a big plus
        if (details?.funding_provided && (details.funding_provided as number) > 0) {
          score += 3;
          reasons.push(`$${((details.funding_provided as number) / 1000).toFixed(0)}K funding`);
        }
      }

      // Grant-specific scoring
      if (listing.category === "grant") {
        const details = listing.details as Record<string, unknown>;

        // Higher amounts get more score
        if (details?.amount_max) {
          const amount = details.amount_max as number;
          if (amount >= 50000) score += 3;
          else if (amount >= 10000) score += 2;
          else score += 1;
          reasons.push(`Up to $${(amount / 1000).toFixed(0)}K available`);
        }

        // Matching eligibility to venture type
        const subcats = listing.subcategories as string[];
        if (subcats) {
          if (venture_type === "nonprofit" && subcats.includes("nonprofit")) {
            score += 2;
          }
          if (subcats.includes("women-owned") || subcats.includes("minority-owned") || subcats.includes("veteran")) {
            score += 1; // Boost diverse founder grants
          }
        }
      }

      // SBA resources are always relevant
      if (listing.category === "sba") {
        score += 2; // Base score for free government resources
        const details = listing.details as Record<string, unknown>;
        if (details?.sba_type === "SCORE") {
          reasons.push("Free mentorship");
          score += 1;
        }
        if (details?.sba_type === "SBDC") {
          reasons.push("Free business counseling");
          score += 1;
        }
      }

      // Featured listings get a boost
      if (listing.is_featured) {
        score += 2;
      }

      return {
        ...listing,
        match_score: score,
        match_reasons: reasons.slice(0, 3), // Limit reasons
      } as ScoredListing;
    });

    // Group by category and get top 3 per category
    const matchedResources: Record<string, ScoredListing[]> = {};

    for (const category of MATCH_CATEGORIES) {
      const categoryListings = scoredListings
        .filter((l) => l.category === category)
        .filter((l) => l.match_score > 0) // Only include items with some relevance
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 3);

      if (categoryListings.length > 0) {
        matchedResources[category] = categoryListings;
      }
    }

    // If some categories are empty, fill with top nationwide options
    for (const category of MATCH_CATEGORIES) {
      if (!matchedResources[category] || matchedResources[category].length === 0) {
        const fallbackListings = scoredListings
          .filter((l) => l.category === category)
          .filter((l) => l.is_nationwide || l.is_remote || l.is_featured)
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 3);

        if (fallbackListings.length > 0) {
          matchedResources[category] = fallbackListings;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        matches: matchedResources,
        filters_applied: {
          cause_areas,
          location,
          commitment_level,
          venture_type,
          budget_level,
        },
      },
    });
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
