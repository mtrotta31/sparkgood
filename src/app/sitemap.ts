// Dynamic Sitemap for SparkLocal
// Generates sitemap.xml for all resource directory pages and blog posts
// Critical for SEO - helps Google index 16,000+ pages

import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO, type ResourceCategory } from "@/types/resources";
import { getAllPostsMeta } from "@/lib/blog";

const BASE_URL = "https://sparklocal.co";

// Get the most recent date from two optional timestamps
function getMostRecentDate(date1?: string | null, date2?: string | null): Date {
  const d1 = date1 ? new Date(date1) : null;
  const d2 = date2 ? new Date(date2) : null;

  if (d1 && d2) {
    return d1 > d2 ? d1 : d2;
  }
  return d1 || d2 || new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/builder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Blog posts
  const blogPosts = getAllPostsMeta();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Get all active listings with timestamps for lastmod calculation
  const { data: listings } = await supabase
    .from("resource_listings")
    .select("slug, city, state, category, updated_at, last_enriched_at")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  // Build maps for city and category most recent dates
  const cityLastModMap = new Map<string, Date>();
  const categoryLastModMap = new Map<string, Date>();

  (listings || []).forEach((listing) => {
    const lastMod = getMostRecentDate(listing.updated_at, listing.last_enriched_at);

    // Track most recent date per city
    if (listing.city && listing.state) {
      const cityKey = `${listing.city}-${listing.state}`;
      const existing = cityLastModMap.get(cityKey);
      if (!existing || lastMod > existing) {
        cityLastModMap.set(cityKey, lastMod);
      }
    }

    // Track most recent date per category
    if (listing.category) {
      const existing = categoryLastModMap.get(listing.category);
      if (!existing || lastMod > existing) {
        categoryLastModMap.set(listing.category, lastMod);
      }
    }
  });

  // Category pages - use most recent listing in that category
  const categories = Object.keys(CATEGORY_INFO) as ResourceCategory[];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/resources/${category}`,
    lastModified: categoryLastModMap.get(category) || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Get all category-location combinations
  const { data: categoryLocations } = await supabase
    .from("resource_category_locations")
    .select("category, location_id")
    .gt("listing_count", 0);

  // Get location slugs for city hub and category-location pages
  const { data: allLocations } = await supabase
    .from("resource_locations")
    .select("id, slug, city, state")
    .gt("listing_count", 0);

  const locationMap = new Map(
    (allLocations || []).map((loc) => [
      loc.id,
      { slug: loc.slug, city: loc.city, state: loc.state },
    ])
  );

  // City hub pages - use most recent listing in that city
  const cityHubPages: MetadataRoute.Sitemap = (allLocations || []).map((loc) => {
    const cityKey = `${loc.city}-${loc.state}`;
    return {
      url: `${BASE_URL}/resources/${loc.slug}`,
      lastModified: cityLastModMap.get(cityKey) || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    };
  });

  // Category + Location pages
  const categoryLocationPages: MetadataRoute.Sitemap = (categoryLocations || [])
    .filter((cl) => locationMap.has(cl.location_id))
    .map((cl) => {
      const location = locationMap.get(cl.location_id)!;
      const cityKey = `${location.city}-${location.state}`;
      return {
        url: `${BASE_URL}/resources/${cl.category}/${location.slug}`,
        lastModified: cityLastModMap.get(cityKey) || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  // Individual listing pages - use more recent of updated_at or last_enriched_at
  const listingPages: MetadataRoute.Sitemap = (listings || []).map((listing) => ({
    url: `${BASE_URL}/resources/listing/${listing.slug}`,
    lastModified: getMostRecentDate(listing.updated_at, listing.last_enriched_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...categoryPages,
    ...cityHubPages,
    ...categoryLocationPages,
    ...listingPages,
  ];
}
