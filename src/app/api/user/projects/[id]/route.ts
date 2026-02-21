// API Route: Get a single project with full deep dive results
// GET - Get project by ID

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

    // Get the saved idea
    const { data: savedIdea, error: ideaError } = await supabase
      .from("saved_ideas")
      .select(`
        id,
        idea_data,
        is_selected,
        created_at,
        updated_at,
        profile_id
      `)
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (ideaError || !savedIdea) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Get the user profile for this idea
    let profile = null;
    if (savedIdea.profile_id) {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", savedIdea.profile_id)
        .single();

      if (profileData) {
        profile = {
          ventureType: profileData.venture_type,
          format: profileData.format,
          causes: profileData.causes || [],
          experience: profileData.experience,
          budget: profileData.budget,
          commitment: profileData.commitment,
          depth: profileData.depth,
          hasIdea: profileData.has_idea,
          ownIdea: profileData.own_idea || "",
        };
      }
    }

    // Get deep dive results
    const { data: deepDive } = await supabase
      .from("deep_dive_results")
      .select("*")
      .eq("idea_id", projectId)
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        id: savedIdea.id,
        idea: savedIdea.idea_data,
        profile,
        createdAt: savedIdea.created_at,
        updatedAt: savedIdea.updated_at,
        deepDive: deepDive ? {
          // V1 fields
          viability: deepDive.viability,
          businessPlan: deepDive.business_plan,
          marketing: deepDive.marketing,
          roadmap: deepDive.roadmap,
          // V2 fields
          checklist: deepDive.checklist,
          foundation: deepDive.foundation,
          growth: deepDive.growth,
          financial: deepDive.financial,
          matchedResources: deepDive.matched_resources,
          checklistProgress: deepDive.checklist_progress,
        } : null,
      },
    });
  } catch (error) {
    console.error("Project fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

    // Delete the saved idea (deep_dive_results will cascade delete)
    const { error } = await supabase
      .from("saved_ideas")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
