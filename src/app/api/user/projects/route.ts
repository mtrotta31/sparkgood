// API Route: Get all user projects (saved ideas with deep dive status)
// GET - List all projects

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("[projects] Fetching user projects");

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[projects] Auth check:", { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      console.log("[projects] Not authenticated");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get all saved ideas for this user with their associated profile and deep dive status
    const { data: savedIdeas, error: ideasError } = await supabase
      .from("saved_ideas")
      .select(`
        id,
        idea_data,
        is_selected,
        created_at,
        updated_at,
        profile_id
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    console.log("[projects] Found saved ideas:", savedIdeas?.length || 0);

    if (ideasError) {
      console.error("[projects] Error fetching ideas:", ideasError);
      return NextResponse.json(
        { success: false, error: "Failed to load projects" },
        { status: 500 }
      );
    }

    // Get deep dive results for all ideas to check completion status
    const ideaIds = savedIdeas?.map((idea) => idea.id) || [];

    interface DeepDiveStatus {
      // V1 fields
      hasViability: boolean;
      hasPlan: boolean;
      hasMarketing: boolean;
      hasRoadmap: boolean;
      // V2 fields
      hasChecklist: boolean;
      hasFoundation: boolean;
      hasGrowth: boolean;
      hasFinancial: boolean;
      hasResources: boolean;
      // Which version
      isV2: boolean;
    }

    let deepDiveMap: Record<string, DeepDiveStatus> = {};

    if (ideaIds.length > 0) {
      const { data: deepDiveResults } = await supabase
        .from("deep_dive_results")
        .select("idea_id, viability, business_plan, marketing, roadmap, checklist, foundation, growth, financial, matched_resources")
        .in("idea_id", ideaIds);

      if (deepDiveResults) {
        deepDiveMap = deepDiveResults.reduce((acc, result) => {
          // Detect if this is a V2 project (has any V2 fields)
          const isV2 = !!(result.checklist || result.foundation || result.growth || result.financial || result.matched_resources);

          acc[result.idea_id] = {
            // V1 fields
            hasViability: result.viability !== null,
            hasPlan: result.business_plan !== null,
            hasMarketing: result.marketing !== null,
            hasRoadmap: result.roadmap !== null,
            // V2 fields
            hasChecklist: result.checklist !== null,
            hasFoundation: result.foundation !== null,
            hasGrowth: result.growth !== null,
            hasFinancial: result.financial !== null,
            hasResources: result.matched_resources !== null,
            // Version flag
            isV2,
          };
          return acc;
        }, {} as Record<string, DeepDiveStatus>);
      }
    }

    // Get user profiles to include commitment level
    const profileIds = Array.from(new Set(savedIdeas?.map((idea) => idea.profile_id).filter(Boolean) || []));
    let profileMap: Record<string, { commitment: string | null }> = {};

    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, commitment")
        .in("id", profileIds);

      if (profiles) {
        profileMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = { commitment: profile.commitment };
          return acc;
        }, {} as Record<string, { commitment: string | null }>);
      }
    }

    // Combine the data
    const projects = savedIdeas?.map((idea) => ({
      id: idea.id,
      idea: idea.idea_data,
      isSelected: idea.is_selected,
      createdAt: idea.created_at,
      updatedAt: idea.updated_at,
      commitment: idea.profile_id ? profileMap[idea.profile_id]?.commitment : null,
      deepDiveStatus: deepDiveMap[idea.id] || {
        hasViability: false,
        hasPlan: false,
        hasMarketing: false,
        hasRoadmap: false,
        hasChecklist: false,
        hasFoundation: false,
        hasGrowth: false,
        hasFinancial: false,
        hasResources: false,
        isV2: false,
      },
    })) || [];

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Projects fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
