// Single Resource API
// GET /api/resources/[slug]
// Returns a single listing with all details

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: listing, error } = await supabase
      .from("resource_listings")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !listing) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      );
    }

    // Get related listings (same category)
    const { data: relatedListings } = await supabase
      .from("resource_listings")
      .select("id, name, slug, short_description, category, logo_url, city, state, is_nationwide, is_remote, details, is_featured")
      .eq("is_active", true)
      .eq("category", listing.category)
      .neq("id", listing.id)
      .order("is_featured", { ascending: false })
      .limit(4);

    return NextResponse.json({
      success: true,
      data: {
        listing,
        related: relatedListings || [],
      },
    });
  } catch (error) {
    console.error("Get resource error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
