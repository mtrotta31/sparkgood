// Dynamic Sitemap for SparkGood
// Generates sitemap.xml for all resource directory pages
// Critical for SEO - helps Google index 16,000+ pages

import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_INFO, type ResourceCategory } from "@/types/resources";

const BASE_URL = "https://sparkgood.io";

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
  ];

  // Category pages
  const categories = Object.keys(CATEGORY_INFO) as ResourceCategory[];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/resources/${category}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Get all category-location combinations
  const { data: categoryLocations } = await supabase
    .from("resource_category_locations")
    .select("category, location_id")
    .gt("listing_count", 0);

  // Get location slugs for category-location pages
  const { data: allLocations } = await supabase
    .from("resource_locations")
    .select("id, slug, updated_at")
    .gt("listing_count", 0);

  const locationMap = new Map(
    (allLocations || []).map((loc) => [loc.id, { slug: loc.slug, updated_at: loc.updated_at }])
  );

  // Category + Location pages (e.g., /resources/grant/austin-tx)
  const categoryLocationPages: MetadataRoute.Sitemap = (categoryLocations || [])
    .filter((cl) => locationMap.has(cl.location_id))
    .map((cl) => {
      const location = locationMap.get(cl.location_id)!;
      return {
        url: `${BASE_URL}/resources/${cl.category}/${location.slug}`,
        lastModified: location.updated_at ? new Date(location.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  // Get all active listings
  const { data: listings } = await supabase
    .from("resource_listings")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  // Individual listing pages
  const listingPages: MetadataRoute.Sitemap = (listings || []).map((listing) => ({
    url: `${BASE_URL}/resources/listing/${listing.slug}`,
    lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...categoryLocationPages,
    ...listingPages,
  ];
}
