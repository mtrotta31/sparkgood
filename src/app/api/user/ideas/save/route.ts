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
    // First check by idea.id (exact match)
    const { data: existingById } = await supabase
      .from("saved_ideas")
      .select("id")
      .eq("user_id", user.id)
      .filter("idea_data->id", "eq", idea.id)
      .single();

    console.log("[save-idea] Existing by ID check:", { existing: existingById?.id });

    if (existingById) {
      console.log("[save-idea] Idea already saved (by ID)");
      return NextResponse.json({
        success: true,
        data: { savedId: existingById.id, alreadySaved: true },
      });
    }

    // Also check by idea name + tagline to catch duplicates with regenerated IDs
    const { data: existingByName } = await supabase
      .from("saved_ideas")
      .select("id")
      .eq("user_id", user.id)
      .filter("idea_data->name", "eq", idea.name)
      .filter("idea_data->tagline", "eq", idea.tagline)
      .single();

    console.log("[save-idea] Existing by name check:", { existing: existingByName?.id });

    if (existingByName) {
      console.log("[save-idea] Idea already saved (by name+tagline)");
      return NextResponse.json({
        success: true,
        data: { savedId: existingByName.id, alreadySaved: true },
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
