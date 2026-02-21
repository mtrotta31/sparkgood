// API Route: Save checklist progress
// POST - Update checklist_progress JSONB column

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ChecklistProgress } from "@/types";

interface ProgressUpdate {
  ideaId: string;
  checklistProgress: ChecklistProgress;
}

export async function POST(request: Request) {
  console.log("[deep-dive/progress] Starting save progress request");

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("[deep-dive/progress] Not authenticated");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { ideaId, checklistProgress } = await request.json() as ProgressUpdate;

    console.log("[deep-dive/progress] Received:", {
      ideaId,
      progressItemCount: Object.keys(checklistProgress || {}).length,
    });

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "Idea ID required" },
        { status: 400 }
      );
    }

    // Check if a deep dive record exists
    const { data: existing, error: existingError } = await supabase
      .from("deep_dive_results")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("[deep-dive/progress] Error checking existing:", existingError);
      return NextResponse.json(
        { success: false, error: "Failed to check existing record" },
        { status: 500 }
      );
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("deep_dive_results")
        .update({ checklist_progress: checklistProgress })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[deep-dive/progress] Error updating:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to save progress" },
          { status: 500 }
        );
      }

      console.log("[deep-dive/progress] Updated existing record:", existing.id);
    } else {
      // Create new record with just the progress
      const { error: insertError } = await supabase
        .from("deep_dive_results")
        .insert({
          user_id: user.id,
          idea_id: ideaId,
          checklist_progress: checklistProgress,
        });

      if (insertError) {
        console.error("[deep-dive/progress] Error inserting:", insertError);
        return NextResponse.json(
          { success: false, error: "Failed to save progress" },
          { status: 500 }
        );
      }

      console.log("[deep-dive/progress] Created new record for idea:", ideaId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[deep-dive/progress] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
