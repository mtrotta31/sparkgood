// API Route: Save and load deep dive results
// POST - Save results, GET - Load results for an idea

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ViabilityReport, BusinessPlan, MarketingAssets, ActionRoadmap } from "@/types";

interface DeepDiveUpdate {
  ideaId: string;
  viability?: ViabilityReport;
  businessPlan?: BusinessPlan;
  marketing?: MarketingAssets;
  roadmap?: ActionRoadmap;
}

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

    const { ideaId, viability, businessPlan, marketing, roadmap } =
      await request.json() as DeepDiveUpdate;

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "Idea ID required" },
        { status: 400 }
      );
    }

    // First check if a deep dive record exists for this idea
    const { data: existing } = await supabase
      .from("deep_dive_results")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("user_id", user.id)
      .single();

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (viability !== undefined) updateData.viability = viability;
    if (businessPlan !== undefined) updateData.business_plan = businessPlan;
    if (marketing !== undefined) updateData.marketing = marketing;
    if (roadmap !== undefined) updateData.roadmap = roadmap;

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("deep_dive_results")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating deep dive:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update deep dive results" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Insert new record
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
        console.error("Error saving deep dive:", error);
        return NextResponse.json(
          { success: false, error: "Failed to save deep dive results" },
          { status: 500 }
        );
      }
      result = data;
    }

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
        viability: data.viability,
        businessPlan: data.business_plan,
        marketing: data.marketing,
        roadmap: data.roadmap,
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
