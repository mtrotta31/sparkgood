// Resource Search API
// GET /api/resources/search
// Params: query, category, state, is_remote, cause_areas, page, limit

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const state = searchParams.get("state") || "";
    const isRemote = searchParams.get("is_remote") === "true";
    const causeAreas = searchParams.get("cause_areas")?.split(",").filter(Boolean) || [];
    const subcategory = searchParams.get("subcategory") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Start building the query
    let dbQuery = supabase
      .from("resource_listings")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Full-text search on name and description
    if (query) {
      // Use Postgres full-text search
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Filter by category
    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    // Filter by state
    if (state) {
      dbQuery = dbQuery.eq("state", state);
    }

    // Filter by remote/nationwide
    if (isRemote) {
      dbQuery = dbQuery.or("is_remote.eq.true,is_nationwide.eq.true");
    }

    // Filter by cause areas
    if (causeAreas.length > 0) {
      dbQuery = dbQuery.overlaps("cause_areas", causeAreas);
    }

    // Filter by subcategory
    if (subcategory) {
      dbQuery = dbQuery.contains("subcategories", [subcategory]);
    }

    // Order and paginate
    dbQuery = dbQuery
      .order("is_featured", { ascending: false })
      .order("name")
      .range(offset, offset + limit - 1);

    const { data: listings, error, count } = await dbQuery;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to search resources" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        listings: listings || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
