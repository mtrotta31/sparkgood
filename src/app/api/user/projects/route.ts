// API Route: Get all user projects (saved ideas with deep dive status)
// GET - List all projects

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (ideasError) {
      console.error("Error fetching ideas:", ideasError);
      return NextResponse.json(
        { success: false, error: "Failed to load projects" },
        { status: 500 }
      );
    }

    // Get deep dive results for all ideas to check completion status
    const ideaIds = savedIdeas?.map((idea) => idea.id) || [];

    let deepDiveMap: Record<string, { hasViability: boolean; hasPlan: boolean; hasMarketing: boolean; hasRoadmap: boolean }> = {};

    if (ideaIds.length > 0) {
      const { data: deepDiveResults } = await supabase
        .from("deep_dive_results")
        .select("idea_id, viability, business_plan, marketing, roadmap")
        .in("idea_id", ideaIds);

      if (deepDiveResults) {
        deepDiveMap = deepDiveResults.reduce((acc, result) => {
          acc[result.idea_id] = {
            hasViability: result.viability !== null,
            hasPlan: result.business_plan !== null,
            hasMarketing: result.marketing !== null,
            hasRoadmap: result.roadmap !== null,
          };
          return acc;
        }, {} as Record<string, { hasViability: boolean; hasPlan: boolean; hasMarketing: boolean; hasRoadmap: boolean }>);
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
