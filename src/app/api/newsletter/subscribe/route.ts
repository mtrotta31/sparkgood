// Newsletter Subscription API
// POST /api/newsletter/subscribe
// Stores email signups in newsletter_subscribers table

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface SubscribeRequest {
  email: string;
  city?: string;
  state?: string;
  interests?: string[];
}

// Use service role client since newsletter signups don't require auth
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, city, state, interests } = body;

    // Validate email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const supabase = getServiceClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, interests")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      // Update interests if provided new ones
      if (interests && interests.length > 0) {
        const currentInterests = (existing.interests as string[]) || [];
        const mergedInterests = Array.from(new Set([...currentInterests, ...interests]));

        await supabase
          .from("newsletter_subscribers")
          .update({
            interests: mergedInterests,
            ...(city && { city }),
            ...(state && { state }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }

      return NextResponse.json({
        success: true,
        message: "Already subscribed",
      });
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        city: city || null,
        state: state || null,
        interests: interests || [],
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Newsletter subscribe error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
