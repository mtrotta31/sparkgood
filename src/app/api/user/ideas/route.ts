// API Route: Save and load user ideas
// POST - Save ideas, GET - Load ideas

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Idea } from "@/types";

export async function POST(request: Request) {
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

    const { ideas, profileId, selectedIdeaId } = await request.json() as {
      ideas: Idea[];
      profileId?: string;
      selectedIdeaId?: string;
    };

    if (!ideas || !Array.isArray(ideas)) {
      return NextResponse.json(
        { success: false, error: "Ideas array required" },
        { status: 400 }
      );
    }

    // First, clear any existing ideas for this user that aren't selected
    // (We keep selected ideas to preserve deep dive results)
    await supabase
      .from("saved_ideas")
      .delete()
      .eq("user_id", user.id)
      .eq("is_selected", false);

    // Insert the new ideas
    const ideaRecords = ideas.map((idea) => ({
      user_id: user.id,
      profile_id: profileId || null,
      idea_data: idea,
      is_selected: idea.id === selectedIdeaId,
    }));

    const { data, error } = await supabase
      .from("saved_ideas")
      .insert(ideaRecords)
      .select();

    if (error) {
      console.error("Error saving ideas:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save ideas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { savedCount: data.length },
    });
  } catch (error) {
    console.error("Ideas save error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get all ideas for this user, ordered by creation date
    const { data, error } = await supabase
      .from("saved_ideas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading ideas:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load ideas" },
        { status: 500 }
      );
    }

    // Extract the idea data and mark which one is selected
    const ideas = data.map((row) => ({
      ...row.idea_data,
      savedId: row.id,
      isSelected: row.is_selected,
    }));

    return NextResponse.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error("Ideas load error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update selected idea
export async function PATCH(request: Request) {
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

    const { ideaId, isSelected } = await request.json() as {
      ideaId: string;
      isSelected: boolean;
    };

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "Idea ID required" },
        { status: 400 }
      );
    }

    // If selecting this idea, first deselect all others
    if (isSelected) {
      await supabase
        .from("saved_ideas")
        .update({ is_selected: false })
        .eq("user_id", user.id);
    }

    // Update this idea's selection status
    const { error } = await supabase
      .from("saved_ideas")
      .update({ is_selected: isSelected })
      .eq("id", ideaId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating idea:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update idea" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Idea update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
