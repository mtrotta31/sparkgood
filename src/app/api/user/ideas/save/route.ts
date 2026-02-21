// API Route: Save a single idea to My Projects
// POST - Save one idea

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Idea } from "@/types";

export async function POST(request: Request) {
  console.log("[save-idea] Starting save idea request");

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[save-idea] Auth check:", { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      console.log("[save-idea] Not authenticated");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { idea, profileId } = await request.json() as {
      idea: Idea;
      profileId?: string;
    };

    console.log("[save-idea] Received idea:", { ideaId: idea?.id, ideaName: idea?.name, profileId });

    if (!idea || !idea.id) {
      console.log("[save-idea] Missing idea data");
      return NextResponse.json(
        { success: false, error: "Idea required" },
        { status: 400 }
      );
    }

    // Check if this idea already exists for this user
    // Use raw SQL query for reliable JSONB comparison
    const { data: existingIdeas, error: searchError } = await supabase
      .from("saved_ideas")
      .select("id, idea_data")
      .eq("user_id", user.id);

    if (searchError) {
      console.error("[save-idea] Error checking existing ideas:", searchError);
      return NextResponse.json(
        { success: false, error: "Failed to check for existing ideas" },
        { status: 500 }
      );
    }

    // Check for existing idea by ID or by name+tagline
    interface SavedIdea {
      id: string;
      idea_data: Idea;
    }

    const existingIdea = (existingIdeas as SavedIdea[] | null)?.find((saved) => {
      const savedIdea = saved.idea_data;
      // Check by ID first
      if (savedIdea.id === idea.id) {
        console.log("[save-idea] Found existing by ID match");
        return true;
      }
      // Then check by name + tagline
      if (savedIdea.name === idea.name && savedIdea.tagline === idea.tagline) {
        console.log("[save-idea] Found existing by name+tagline match");
        return true;
      }
      return false;
    });

    if (existingIdea) {
      console.log("[save-idea] Idea already saved:", { savedId: existingIdea.id });

      // Fetch existing checklist progress from deep_dive_results
      const { data: deepDiveData } = await supabase
        .from("deep_dive_results")
        .select("checklist_progress")
        .eq("idea_id", existingIdea.id)
        .eq("user_id", user.id)
        .single();

      return NextResponse.json({
        success: true,
        data: {
          savedId: existingIdea.id,
          alreadySaved: true,
          checklistProgress: deepDiveData?.checklist_progress || null,
        },
      });
    }

    // Insert the new idea as a selected/saved idea
    const { data, error } = await supabase
      .from("saved_ideas")
      .insert({
        user_id: user.id,
        profile_id: profileId || null,
        idea_data: idea,
        is_selected: true, // Mark as selected so it shows in My Projects
      })
      .select()
      .single();

    if (error) {
      console.error("[save-idea] Error saving idea:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save idea" },
        { status: 500 }
      );
    }

    console.log("[save-idea] Successfully saved idea:", { savedId: data.id });

    return NextResponse.json({
      success: true,
      data: { savedId: data.id },
    });
  } catch (error) {
    console.error("[save-idea] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
