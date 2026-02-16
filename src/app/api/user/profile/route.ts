// API Route: Save and load user profile data
// POST - Save profile, GET - Load profile

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { UserProfile } from "@/types";
import { userProfileToDbProfile, dbProfileToUserProfile } from "@/types/database";

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

    const { profile } = await request.json() as { profile: UserProfile };

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile data required" },
        { status: 400 }
      );
    }

    // Upsert the profile (insert or update)
    const dbProfile = userProfileToDbProfile(profile, user.id);

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(dbProfile, {
        onConflict: "user_id,created_at",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving profile:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { profileId: data.id },
    });
  } catch (error) {
    console.error("Profile save error:", error);
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

    // Get the most recent profile for this user
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No profile found is not an error, just return null
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: true, data: null });
      }
      console.error("Error loading profile:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profileId: data.id,
        profile: dbProfileToUserProfile(data),
      },
    });
  } catch (error) {
    console.error("Profile load error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
