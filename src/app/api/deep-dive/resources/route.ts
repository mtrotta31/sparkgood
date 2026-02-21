// API route for fetching matched local resources with AI-generated relevance notes

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasDeepDiveAccess } from "@/lib/stripe";
import { sendMessageForJSON } from "@/lib/claude";
import { matchResources, type MatchedResource } from "@/lib/match-resources";
import type { UserProfile, Idea, LocalResourcesData, LocalResourceItem, ApiResponse } from "@/types";

interface ResourcesRequest {
  idea: Idea;
  profile: UserProfile;
}

interface RelevanceNotes {
  [resourceId: string]: string;
}

// Generate city slug from city name
function generateCitySlug(city: string, state: string): string {
  return `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
}

// Format amount range for display
function formatAmountRange(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;

  const formatK = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  if (min && max) return `${formatK(min)} - ${formatK(max)}`;
  if (max) return `Up to ${formatK(max)}`;
  if (min) return `From ${formatK(min)}`;
  return undefined;
}

// Format price range for coworking
function formatPriceRange(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;
  if (min && max) return `$${min}-$${max}/mo`;
  if (min) return `From $${min}/mo`;
  if (max) return `Up to $${max}/mo`;
  return undefined;
}

// Generate relevance notes for all resources
async function generateRelevanceNotes(
  resources: MatchedResource[],
  idea: Idea,
  profile: UserProfile
): Promise<RelevanceNotes> {
  if (resources.length === 0) return {};

  const resourceList = resources.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    description: r.short_description || "",
    city: r.city,
    state: r.state,
    isNationwide: r.is_nationwide,
    details: r.details,
  }));

  const prompt = `You are helping an entrepreneur understand how local resources can help their specific business.

BUSINESS IDEA:
Name: ${idea.name}
Tagline: ${idea.tagline}
${profile.businessCategory ? `Business Category: ${profile.businessCategory}` : ""}
${profile.location?.city ? `Location: ${profile.location.city}, ${profile.location.state}` : ""}

MATCHED RESOURCES:
${JSON.stringify(resourceList, null, 2)}

For each resource, write a 1-2 sentence relevance note explaining WHY this specific resource is useful for this specific business idea. Be concrete and mention the business name.

Examples:
- For a coworking space: "Professional meeting rooms for investor pitches and a community of fellow founders to exchange ideas with."
- For a grant: "This small business grant specifically targets food & beverage startups, making your coffee shop concept a strong candidate."
- For an accelerator: "Their 12-week program specializes in consumer products and could help you refine your go-to-market strategy."
- For SBA: "Free one-on-one mentoring from experienced entrepreneurs who can guide your licensing and permit process."

Return a JSON object with resource IDs as keys and relevance notes as values:
{
  "resource-id-1": "relevance note here",
  "resource-id-2": "relevance note here"
}`;

  try {
    const notes = await sendMessageForJSON<RelevanceNotes>(prompt, {
      maxTokens: 2000,
      temperature: 0.7,
    });
    return notes;
  } catch (error) {
    console.error("[Resources API] Error generating relevance notes:", error);
    // Return empty notes - we'll use generic descriptions instead
    return {};
  }
}

// Transform MatchedResource to LocalResourceItem
function transformResource(
  resource: MatchedResource,
  relevanceNote: string
): LocalResourceItem {
  return {
    id: resource.id,
    name: resource.name,
    slug: resource.slug,
    category: resource.category,
    city: resource.city,
    state: resource.state,
    isNationwide: resource.is_nationwide,
    relevanceNote: relevanceNote || resource.short_description || "A valuable resource for your business.",
    // Category-specific fields
    rating: resource.rating,
    priceRange: formatPriceRange(resource.details.price_monthly_min, resource.details.price_monthly_max),
    amountRange: formatAmountRange(resource.details.amount_min, resource.details.amount_max),
    deadline: resource.details.deadline || resource.details.next_deadline,
    fundingAmount: resource.details.funding_provided
      ? `$${(resource.details.funding_provided / 1000).toFixed(0)}K`
      : undefined,
    services: resource.details.services,
    isFree: resource.category === "sba", // SBA resources are free
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<LocalResourcesData>>> {
  try {
    const body = await request.json();
    const { idea, profile } = body as ResourcesRequest;

    if (!idea || !profile) {
      return NextResponse.json(
        { success: false, error: "Missing idea or profile" },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check deep dive access
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("subscription_tier, subscription_status, deep_dive_credits_remaining, one_time_purchases")
      .eq("user_id", user.id)
      .single();

    const hasAccess = hasDeepDiveAccess(
      userCredits?.subscription_tier || "free",
      userCredits?.deep_dive_credits_remaining ?? 0,
      userCredits?.one_time_purchases ?? [],
      idea.id
    );

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Deep dive access required" },
        { status: 403 }
      );
    }

    // Check if user has location set
    if (!profile.location?.city || !profile.location?.state) {
      // Return empty data with helpful message
      return NextResponse.json({
        success: true,
        data: {
          coworking: [],
          grants: [],
          accelerators: [],
          sba: [],
          citySlug: "",
          cityName: "",
          state: "",
          totalMatched: 0,
        },
      });
    }

    console.log(`[Resources API] Matching resources for ${profile.location.city}, ${profile.location.state}`);

    // Fetch matched resources
    const matchedResources = await matchResources(profile, idea);

    console.log(`[Resources API] Found ${matchedResources.totalMatched} total matches`);

    // Combine all resources for relevance note generation
    const allResources = [
      ...matchedResources.coworking,
      ...matchedResources.grants,
      ...matchedResources.accelerators,
      ...matchedResources.sba,
    ];

    // Generate relevance notes via Claude
    const relevanceNotes = await generateRelevanceNotes(allResources, idea, profile);

    // Transform resources with relevance notes
    const transformWithNotes = (resources: MatchedResource[]): LocalResourceItem[] =>
      resources.map((r) => transformResource(r, relevanceNotes[r.id] || ""));

    const result: LocalResourcesData = {
      coworking: transformWithNotes(matchedResources.coworking),
      grants: transformWithNotes(matchedResources.grants),
      accelerators: transformWithNotes(matchedResources.accelerators),
      sba: transformWithNotes(matchedResources.sba),
      citySlug: generateCitySlug(profile.location.city, profile.location.state),
      cityName: profile.location.city,
      state: profile.location.state,
      totalMatched: matchedResources.totalMatched,
    };

    console.log(`[Resources API] Returning ${result.totalMatched} resources with relevance notes`);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[Resources API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch local resources" },
      { status: 500 }
    );
  }
}
