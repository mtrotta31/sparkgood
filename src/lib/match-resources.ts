// Match Resources for Deep Dive
// Queries Supabase to find relevant resources based on user's location and business type

import { createClient } from "@/lib/supabase/server";
import type { UserProfile, Idea } from "@/types";
import type { ResourceCategory, CoworkingDetails, GrantDetails, AcceleratorDetails, SBADetails } from "@/types/resources";

// Types for matched resources returned by this function
export interface MatchedResource {
  id: string;
  name: string;
  slug: string;
  category: ResourceCategory;
  city: string | null;
  state: string | null;
  website: string | null;
  rating?: number;
  is_nationwide: boolean;
  short_description?: string;
  // Category-specific details
  details: {
    // Coworking
    price_monthly_min?: number;
    price_monthly_max?: number;
    amenities?: string[];
    // Grant
    amount_min?: number;
    amount_max?: number;
    deadline?: string;
    eligibility?: string;
    application_url?: string;
    // Accelerator
    duration_weeks?: number;
    equity_taken?: number;
    funding_provided?: number;
    next_deadline?: string;
    // SBA
    sba_type?: string;
    services?: string[];
  };
}

export interface MatchedResources {
  coworking: MatchedResource[];
  grants: MatchedResource[];
  accelerators: MatchedResource[];
  sba: MatchedResource[];
  totalMatched: number;
}

/**
 * Match resources based on user's location and business profile
 *
 * Returns:
 * - Top 3 coworking spaces (sorted by rating, filtered by location)
 * - Up to 5 grants (local + nationwide)
 * - Up to 3 accelerators (local + nationwide)
 * - Up to 3 SBA resources (by state)
 */
export async function matchResources(
  profile: UserProfile,
  _idea: Idea
): Promise<MatchedResources> {
  const supabase = await createClient();

  const city = profile.location?.city;
  const state = profile.location?.state;

  // Default empty results
  const emptyResults: MatchedResources = {
    coworking: [],
    grants: [],
    accelerators: [],
    sba: [],
    totalMatched: 0,
  };

  // If no location, return empty results
  if (!city || !state) {
    return emptyResults;
  }

  try {
    // Run all queries in parallel for performance
    const [coworkingResult, grantsResult, acceleratorsResult, sbaResult] = await Promise.all([
      // 1. Local coworking spaces (sorted by rating)
      supabase
        .from("resource_listings")
        .select("id, name, slug, category, city, state, website, is_nationwide, short_description, details")
        .eq("category", "coworking")
        .eq("city", city)
        .eq("state", state)
        .eq("is_active", true)
        .order("details->rating", { ascending: false, nullsFirst: false })
        .limit(3),

      // 2. Grants (local + nationwide)
      supabase
        .from("resource_listings")
        .select("id, name, slug, category, city, state, website, is_nationwide, short_description, details")
        .eq("category", "grant")
        .eq("is_active", true)
        .or(`and(city.eq.${city},state.eq.${state}),is_nationwide.eq.true`)
        .limit(5),

      // 3. Accelerators (local + nationwide)
      supabase
        .from("resource_listings")
        .select("id, name, slug, category, city, state, website, is_nationwide, short_description, details")
        .eq("category", "accelerator")
        .eq("is_active", true)
        .or(`and(city.eq.${city},state.eq.${state}),is_nationwide.eq.true`)
        .limit(3),

      // 4. SBA resources (by state)
      supabase
        .from("resource_listings")
        .select("id, name, slug, category, city, state, website, is_nationwide, short_description, details")
        .eq("category", "sba")
        .eq("state", state)
        .eq("is_active", true)
        .limit(3),
    ]);

    // Transform results to MatchedResource format
    const transformResource = (resource: {
      id: string;
      name: string;
      slug: string;
      category: string;
      city: string | null;
      state: string | null;
      website: string | null;
      is_nationwide: boolean;
      short_description: string | null;
      details: Record<string, unknown> | null;
    }): MatchedResource => {
      const details = resource.details || {};
      const coworkingDetails = details as CoworkingDetails;
      const grantDetails = details as GrantDetails;
      const acceleratorDetails = details as AcceleratorDetails;
      const sbaDetails = details as SBADetails;

      return {
        id: resource.id,
        name: resource.name,
        slug: resource.slug,
        category: resource.category as ResourceCategory,
        city: resource.city,
        state: resource.state,
        website: resource.website,
        is_nationwide: resource.is_nationwide,
        short_description: resource.short_description || undefined,
        rating: coworkingDetails.rating,
        details: {
          // Coworking details
          price_monthly_min: coworkingDetails.price_monthly_min,
          price_monthly_max: coworkingDetails.price_monthly_max,
          amenities: coworkingDetails.amenities,
          // Grant details
          amount_min: grantDetails.amount_min,
          amount_max: grantDetails.amount_max,
          deadline: grantDetails.deadline,
          eligibility: grantDetails.eligibility,
          application_url: grantDetails.application_url,
          // Accelerator details
          duration_weeks: acceleratorDetails.duration_weeks,
          equity_taken: acceleratorDetails.equity_taken,
          funding_provided: acceleratorDetails.funding_provided,
          next_deadline: acceleratorDetails.next_deadline,
          // SBA details
          sba_type: sbaDetails.sba_type,
          services: sbaDetails.services,
        },
      };
    };

    const coworking = (coworkingResult.data || []).map(transformResource);
    const grants = (grantsResult.data || []).map(transformResource);
    const accelerators = (acceleratorsResult.data || []).map(transformResource);
    const sba = (sbaResult.data || []).map(transformResource);

    return {
      coworking,
      grants,
      accelerators,
      sba,
      totalMatched: coworking.length + grants.length + accelerators.length + sba.length,
    };
  } catch (error) {
    console.error("Error matching resources:", error);
    return emptyResults;
  }
}

/**
 * Format matched resources for inclusion in prompts
 */
export function formatResourcesForPrompt(resources: MatchedResources): string {
  if (resources.totalMatched === 0) {
    return "No local resources matched. Provide general guidance.";
  }

  let formatted = "## Matched Local Resources\n\n";

  // Coworking spaces
  if (resources.coworking.length > 0) {
    formatted += "### Workspace Options\n";
    resources.coworking.forEach((r) => {
      const price = r.details.price_monthly_min
        ? `$${r.details.price_monthly_min}${r.details.price_monthly_max ? `-${r.details.price_monthly_max}` : ""}/month`
        : "Price varies";
      const rating = r.rating ? ` (${r.rating}★)` : "";
      formatted += `- **${r.name}**${rating}: ${price}`;
      if (r.website) formatted += ` — ${r.website}`;
      formatted += "\n";
    });
    formatted += "\n";
  }

  // Grants
  if (resources.grants.length > 0) {
    formatted += "### Available Grants\n";
    resources.grants.forEach((r) => {
      const amount = formatAmountRange(r.details.amount_min, r.details.amount_max);
      const scope = r.is_nationwide ? "(Nationwide)" : `(${r.city}, ${r.state})`;
      formatted += `- **${r.name}** ${scope}`;
      if (amount) formatted += `: ${amount}`;
      if (r.details.deadline) formatted += ` — Deadline: ${r.details.deadline}`;
      if (r.website) formatted += ` — ${r.website}`;
      formatted += "\n";
    });
    formatted += "\n";
  }

  // Accelerators
  if (resources.accelerators.length > 0) {
    formatted += "### Accelerator Programs\n";
    resources.accelerators.forEach((r) => {
      const funding = r.details.funding_provided
        ? `$${(r.details.funding_provided / 1000).toFixed(0)}K funding`
        : "";
      const equity = r.details.equity_taken ? `${r.details.equity_taken}% equity` : "";
      const terms = [funding, equity].filter(Boolean).join(", ");
      const scope = r.is_nationwide ? "(Nationwide)" : `(${r.city}, ${r.state})`;
      formatted += `- **${r.name}** ${scope}`;
      if (terms) formatted += `: ${terms}`;
      if (r.details.next_deadline) formatted += ` — Next deadline: ${r.details.next_deadline}`;
      if (r.website) formatted += ` — ${r.website}`;
      formatted += "\n";
    });
    formatted += "\n";
  }

  // SBA Resources
  if (resources.sba.length > 0) {
    formatted += "### Free SBA Resources\n";
    resources.sba.forEach((r) => {
      const type = r.details.sba_type ? `(${r.details.sba_type})` : "";
      formatted += `- **${r.name}** ${type}`;
      if (r.details.services && r.details.services.length > 0) {
        formatted += `: ${r.details.services.slice(0, 3).join(", ")}`;
      }
      if (r.website) formatted += ` — ${r.website}`;
      formatted += "\n";
    });
    formatted += "\n";
  }

  return formatted;
}

/**
 * Helper to format grant amount ranges
 */
function formatAmountRange(min?: number, max?: number): string | null {
  if (!min && !max) return null;

  const formatK = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  if (min && max) {
    return `${formatK(min)} - ${formatK(max)}`;
  }
  if (max) {
    return `Up to ${formatK(max)}`;
  }
  if (min) {
    return `From ${formatK(min)}`;
  }
  return null;
}
