// Resource Categories API
// GET /api/resources/categories
// Returns category stats: name, count, icon

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO } from "@/types/resources";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get counts per category
    const { data: listings, error } = await supabase
      .from("resource_listings")
      .select("category")
      .eq("is_active", true);

    if (error) {
      console.error("Categories error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    // Count by category
    const counts: Record<string, number> = {};
    listings?.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });

    // Build category list with info
    const categories = Object.entries(CATEGORY_INFO)
      .filter(([key]) => counts[key] > 0)
      .map(([key, info]) => ({
        slug: key,
        name: info.name,
        plural: info.plural,
        description: info.description,
        icon: info.icon,
        color: info.color,
        count: counts[key] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Get total count
    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
