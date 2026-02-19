// User Credits API
// GET /api/user/credits
// Returns the user's subscription tier and remaining credits

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionTier } from "@/lib/stripe";

export interface UserCredits {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "active" | "canceled" | "past_due" | "none";
  deepDiveCreditsRemaining: number;
  launchKitCreditsRemaining: number;
  oneTimePurchases: string[];
  creditsResetAt: string | null;
}

export async function GET() {
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

    // Get user credits
    const { data: credits, error } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching credits:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    // Return default free tier if no credits record exists
    const userCredits: UserCredits = credits
      ? {
          subscriptionTier: credits.subscription_tier || "free",
          subscriptionStatus: credits.subscription_status || "none",
          deepDiveCreditsRemaining: credits.deep_dive_credits_remaining || 0,
          launchKitCreditsRemaining: credits.launch_kit_credits_remaining || 0,
          oneTimePurchases: credits.one_time_purchases || [],
          creditsResetAt: credits.credits_reset_at,
        }
      : {
          subscriptionTier: "free",
          subscriptionStatus: "none",
          deepDiveCreditsRemaining: 0,
          launchKitCreditsRemaining: 0,
          oneTimePurchases: [],
          creditsResetAt: null,
        };

    return NextResponse.json({
      success: true,
      data: userCredits,
    });
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
