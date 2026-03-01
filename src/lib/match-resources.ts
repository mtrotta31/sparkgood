// Match Resources for Deep Dive
// Queries Supabase to find relevant resources based on user's location and business type
// FUTURE-PROOF: Dynamically fetches all categories from the database

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
  // Category-specific details (flexible for any category)
  details: {
    // Coworking / Virtual Office
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
    // Generic fields for other categories
    specialty?: string;
    focus_areas?: string[];
  };
}

// Dynamic structure: key is category slug, value is array of resources
export interface MatchedResources {
  // Legacy fields for backward compatibility
  coworking: MatchedResource[];
  grants: MatchedResource[];
  accelerators: MatchedResource[];
  sba: MatchedResource[];
  // Dynamic categories - any category from the database
  byCategory: Record<string, MatchedResource[]>;
  allCategories: string[];
  totalMatched: number;
}

// Category configuration: how to query each category
// Local-only: only show resources in user's city (coworking, services)
// Local+Nationwide: show local plus nationwide resources (grants, accelerators)
// State-level: show resources by state (SBA, chamber)
type QueryStrategy = "local-only" | "local-and-nationwide" | "state-level";

const CATEGORY_CONFIG: Record<string, { strategy: QueryStrategy; limit: number }> = {
  // Workspace categories - local only, sorted by rating
  coworking: { strategy: "local-only", limit: 3 },
  "virtual-office": { strategy: "local-only", limit: 2 },

  // Funding categories - local + nationwide
  grant: { strategy: "local-and-nationwide", limit: 5 },
  accelerator: { strategy: "local-and-nationwide", limit: 3 },

  // Government/institutional - state level
  sba: { strategy: "state-level", limit: 3 },
  "chamber-of-commerce": { strategy: "state-level", limit: 2 },

  // Professional services - local only
  "business-attorney": { strategy: "local-only", limit: 2 },
  "business-consultant": { strategy: "local-only", limit: 2 },
  "business-insurance": { strategy: "local-only", limit: 2 },
  "marketing-agency": { strategy: "local-only", limit: 2 },
  accountant: { strategy: "local-only", limit: 2 },

  // Real estate - local only
  "commercial-real-estate": { strategy: "local-only", limit: 2 },
};

// Default config for any new category added to the database
const DEFAULT_CATEGORY_CONFIG = { strategy: "local-only" as QueryStrategy, limit: 2 };

/**
 * Match resources based on user's location and business profile
 * FUTURE-PROOF: Dynamically queries all categories from the database
 *
 * Returns resources organized by category, with legacy fields for backward compatibility
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
    byCategory: {},
    allCategories: [],
    totalMatched: 0,
  };

  // If no location, return empty results
  if (!city || !state) {
    return emptyResults;
  }

  try {
    // Step 1: Get all distinct categories from the database
    const { data: categoryData, error: categoryError } = await supabase
      .from("resource_listings")
      .select("category")
      .eq("is_active", true);

    if (categoryError) {
      console.error("Error fetching categories:", categoryError);
      return emptyResults;
    }

    const allCategories = Array.from(new Set(categoryData?.map((r) => r.category) || [])).sort();

    // Step 2: Query each category in parallel
    const categoryQueries = allCategories.map(async (category) => {
      const config = CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG;
      let query = supabase
        .from("resource_listings")
        .select("id, name, slug, category, city, state, website, is_nationwide, short_description, details")
        .eq("category", category)
        .eq("is_active", true);

      // Apply query strategy
      switch (config.strategy) {
        case "local-only":
          query = query.eq("city", city).eq("state", state);
          break;
        case "local-and-nationwide":
          query = query.or(`and(city.eq.${city},state.eq.${state}),is_nationwide.eq.true`);
          break;
        case "state-level":
          query = query.eq("state", state);
          break;
      }

      // Sort coworking by rating, others by name
      if (category === "coworking") {
        query = query.order("details->rating", { ascending: false, nullsFirst: false });
      } else {
        query = query.order("name", { ascending: true });
      }

      const { data, error } = await query.limit(config.limit);

      if (error) {
        console.error(`Error fetching ${category}:`, error);
        return { category, resources: [] };
      }

      return { category, resources: (data || []).map(transformResource) };
    });

    const results = await Promise.all(categoryQueries);

    // Step 3: Organize results by category
    const byCategory: Record<string, MatchedResource[]> = {};
    let totalMatched = 0;

    for (const { category, resources } of results) {
      if (resources.length > 0) {
        byCategory[category] = resources;
        totalMatched += resources.length;
      }
    }

    // Step 4: Return with legacy fields for backward compatibility
    return {
      coworking: byCategory["coworking"] || [],
      grants: byCategory["grant"] || [],
      accelerators: byCategory["accelerator"] || [],
      sba: byCategory["sba"] || [],
      byCategory,
      allCategories: Object.keys(byCategory),
      totalMatched,
    };
  } catch (error) {
    console.error("Error matching resources:", error);
    return emptyResults;
  }
}

// Transform database row to MatchedResource format
function transformResource(resource: {
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
}): MatchedResource {
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
      // Coworking / Virtual Office details
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
      // Generic details for other categories
      specialty: (details as { specialty?: string }).specialty,
      focus_areas: (details as { focus_areas?: string[] }).focus_areas,
    },
  };
}

// Category display configuration
const CATEGORY_DISPLAY: Record<string, { heading: string; emoji: string }> = {
  coworking: { heading: "Workspace Options", emoji: "🏢" },
  "virtual-office": { heading: "Virtual Office Solutions", emoji: "💼" },
  grant: { heading: "Available Grants", emoji: "💵" },
  accelerator: { heading: "Accelerator Programs", emoji: "🚀" },
  sba: { heading: "Free SBA Resources", emoji: "🏛️" },
  "chamber-of-commerce": { heading: "Chamber of Commerce", emoji: "🤝" },
  "business-attorney": { heading: "Business Attorneys", emoji: "⚖️" },
  "business-consultant": { heading: "Business Consultants", emoji: "📋" },
  "business-insurance": { heading: "Business Insurance", emoji: "🛡️" },
  "marketing-agency": { heading: "Marketing Agencies", emoji: "📣" },
  accountant: { heading: "Accountants & CPAs", emoji: "📊" },
  "commercial-real-estate": { heading: "Commercial Real Estate", emoji: "🏬" },
};

/**
 * Format matched resources for inclusion in prompts
 * FUTURE-PROOF: Handles any category dynamically
 */
export function formatResourcesForPrompt(resources: MatchedResources): string {
  if (resources.totalMatched === 0) {
    return "No local resources matched. Provide general guidance.";
  }

  let formatted = "## Matched Local Resources\n\n";

  // Process each category in byCategory
  for (const [category, categoryResources] of Object.entries(resources.byCategory)) {
    if (categoryResources.length === 0) continue;

    const display = CATEGORY_DISPLAY[category] || {
      heading: category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      emoji: "📌",
    };

    formatted += `### ${display.heading}\n`;

    categoryResources.forEach((r) => {
      formatted += formatResourceLine(r, category);
    });
    formatted += "\n";
  }

  return formatted;
}

/**
 * Format a single resource line based on its category
 */
function formatResourceLine(r: MatchedResource, category: string): string {
  let line = `- **${r.name}**`;

  // Add location scope
  if (r.is_nationwide) {
    line += " (Nationwide)";
  } else if (r.city && r.state) {
    line += ` (${r.city}, ${r.state})`;
  }

  // Category-specific details
  switch (category) {
    case "coworking":
    case "virtual-office": {
      const price = r.details.price_monthly_min
        ? `$${r.details.price_monthly_min}${r.details.price_monthly_max ? `-${r.details.price_monthly_max}` : ""}/month`
        : "";
      const rating = r.rating ? `${r.rating}★` : "";
      const details = [rating, price].filter(Boolean).join(", ");
      if (details) line += `: ${details}`;
      break;
    }
    case "grant": {
      const amount = formatAmountRange(r.details.amount_min, r.details.amount_max);
      if (amount) line += `: ${amount}`;
      if (r.details.deadline) line += ` — Deadline: ${r.details.deadline}`;
      break;
    }
    case "accelerator": {
      const funding = r.details.funding_provided
        ? `$${(r.details.funding_provided / 1000).toFixed(0)}K funding`
        : "";
      const equity = r.details.equity_taken ? `${r.details.equity_taken}% equity` : "";
      const terms = [funding, equity].filter(Boolean).join(", ");
      if (terms) line += `: ${terms}`;
      if (r.details.next_deadline) line += ` — Next deadline: ${r.details.next_deadline}`;
      break;
    }
    case "sba": {
      const type = r.details.sba_type ? `(${r.details.sba_type})` : "";
      if (type) line += ` ${type}`;
      if (r.details.services && r.details.services.length > 0) {
        line += `: ${r.details.services.slice(0, 3).join(", ")}`;
      }
      break;
    }
    default: {
      // Generic formatting for other categories
      if (r.short_description) {
        line += `: ${r.short_description.slice(0, 100)}${r.short_description.length > 100 ? "..." : ""}`;
      }
      break;
    }
  }

  if (r.website) line += ` — ${r.website}`;
  line += "\n";

  return line;
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
