// Consume Credits API
// POST /api/user/credits/consume
// Deducts a credit when a subscription user accesses a deep dive or launch kit

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ConsumeRequest {
  type: "deep_dive" | "launch_kit";
  ideaId: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: ConsumeRequest = await request.json();
    const { type, ideaId } = body;

    if (!type || !ideaId) {
      return NextResponse.json(
        { success: false, error: "Type and ideaId are required" },
        { status: 400 }
      );
    }

    // Get current credits
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsError || !credits) {
      return NextResponse.json(
        { success: false, error: "No credits record found" },
        { status: 404 }
      );
    }

    // Check if user already has access (one-time purchase)
    const purchaseKey = type === "deep_dive" ? ideaId : `launch_kit_${ideaId}`;
    if (credits.one_time_purchases?.includes(purchaseKey)) {
      // Already purchased, no credit needed
      return NextResponse.json({ success: true, data: { consumed: false, reason: "already_purchased" } });
    }

    // Ignite has unlimited access
    if (credits.subscription_tier === "ignite" && credits.subscription_status === "active") {
      // Track usage but don't deduct (unlimited)
      return NextResponse.json({ success: true, data: { consumed: false, reason: "unlimited" } });
    }

    // Spark plan - check and deduct credits
    if (credits.subscription_tier === "spark" && credits.subscription_status === "active") {
      const creditsField = type === "deep_dive" ? "deep_dive_credits_remaining" : "launch_kit_credits_remaining";
      const currentCredits = credits[creditsField] || 0;

      if (currentCredits <= 0) {
        return NextResponse.json(
          { success: false, error: "No credits remaining" },
          { status: 403 }
        );
      }

      // Deduct credit
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({
          [creditsField]: currentCredits - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error deducting credit:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to deduct credit" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          consumed: true,
          creditsRemaining: currentCredits - 1,
        },
      });
    }

    // Free tier - no access
    return NextResponse.json(
      { success: false, error: "No subscription or credits" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Consume credits error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
