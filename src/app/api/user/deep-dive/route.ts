// API Route: Save and load deep dive results
// POST - Save results, GET - Load results for an idea

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type {
  ViabilityReport,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
  LaunchChecklistData,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LocalResourcesData,
  ChecklistProgress,
} from "@/types";

interface DeepDiveUpdate {
  ideaId: string;
  // Legacy V1 fields
  viability?: ViabilityReport;
  businessPlan?: BusinessPlan;
  marketing?: MarketingAssets;
  roadmap?: ActionRoadmap;
  // V2 fields
  checklist?: LaunchChecklistData;
  foundation?: BusinessFoundationData;
  growth?: GrowthPlanData;
  financial?: FinancialModelData;
  matchedResources?: LocalResourcesData;
  checklistProgress?: ChecklistProgress;
}

export async function POST(request: Request) {
  console.log("[deep-dive] Starting save deep dive request");

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[deep-dive] Auth check:", { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      console.log("[deep-dive] Not authenticated");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const {
      ideaId,
      viability,
      businessPlan,
      marketing,
      roadmap,
      checklist,
      foundation,
      growth,
      financial,
      matchedResources,
      checklistProgress,
    } = await request.json() as DeepDiveUpdate;

    console.log("[deep-dive] Received data:", {
      ideaId,
      hasViability: !!viability,
      hasBusinessPlan: !!businessPlan,
      hasMarketing: !!marketing,
      hasRoadmap: !!roadmap,
      hasChecklist: !!checklist,
      hasFoundation: !!foundation,
      hasGrowth: !!growth,
      hasFinancial: !!financial,
      hasMatchedResources: !!matchedResources,
      hasChecklistProgress: !!checklistProgress,
    });

    if (!ideaId) {
      console.log("[deep-dive] Missing ideaId");
      return NextResponse.json(
        { success: false, error: "Idea ID required" },
        { status: 400 }
      );
    }

    // First check if a deep dive record exists for this idea
    const { data: existing, error: existingError } = await supabase
      .from("deep_dive_results")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .single();

    console.log("[deep-dive] Existing record check:", { existingId: existing?.id, error: existingError?.code });

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {};
    // Legacy V1 fields
    if (viability !== undefined) updateData.viability = viability;
    if (businessPlan !== undefined) updateData.business_plan = businessPlan;
    if (marketing !== undefined) updateData.marketing = marketing;
    if (roadmap !== undefined) updateData.roadmap = roadmap;
    // V2 fields
    if (checklist !== undefined) updateData.checklist = checklist;
    if (foundation !== undefined) updateData.foundation = foundation;
    if (growth !== undefined) updateData.growth = growth;
    if (financial !== undefined) updateData.financial = financial;
    if (matchedResources !== undefined) updateData.matched_resources = matchedResources;
    if (checklistProgress !== undefined) updateData.checklist_progress = checklistProgress;

    let result;
    if (existing) {
      // Update existing record
      console.log("[deep-dive] Updating existing record:", existing.id);
      const { data, error } = await supabase
        .from("deep_dive_results")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[deep-dive] Error updating deep dive:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update deep dive results" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Insert new record
      console.log("[deep-dive] Inserting new record for idea:", ideaId);
      const { data, error } = await supabase
        .from("deep_dive_results")
        .insert({
          user_id: user.id,
          idea_id: ideaId,
          ...updateData,
        })
        .select()
        .single();

      if (error) {
        console.error("[deep-dive] Error saving deep dive:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save deep dive results" },
          { status: 500 }
        );
      }
      result = data;
    }

    console.log("[deep-dive] Successfully saved:", { deepDiveId: result.id });

    return NextResponse.json({
      success: true,
      data: { deepDiveId: result.id },
    });
  } catch (error) {
    console.error("Deep dive save error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    // Get ideaId from query params
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get("ideaId");

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "Idea ID required" },
        { status: 400 }
      );
    }

    // Get the deep dive results for this idea
    const { data, error } = await supabase
      .from("deep_dive_results")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      // No results found is not an error, just return null
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: true, data: null });
      }
      console.error("Error loading deep dive:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load deep dive results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        // Legacy V1 fields
        viability: data.viability,
        businessPlan: data.business_plan,
        marketing: data.marketing,
        roadmap: data.roadmap,
        // V2 fields
        checklist: data.checklist,
        foundation: data.foundation,
        growth: data.growth,
        financial: data.financial,
        matchedResources: data.matched_resources,
        checklistProgress: data.checklist_progress,
      },
    });
  } catch (error) {
    console.error("Deep dive load error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
