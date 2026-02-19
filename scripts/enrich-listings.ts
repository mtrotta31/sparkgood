import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * SparkGood Resource Directory Enrichment Script
 *
 * Enriches resource listings using the Perplexity API to gather
 * additional information about each organization.
 *
 * Usage:
 *   npx tsx scripts/enrich-listings.ts
 *
 * Options:
 *   --limit <number>    Limit the number of listings to process
 *   --dry-run           Preview what would be enriched without making changes
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 *   - PERPLEXITY_API_KEY environment variable
 */

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 3000; // 3 seconds between batches
const DELAY_BETWEEN_REQUESTS_MS = 500; // 500ms between individual requests

// ============================================================================
// INITIALIZE CLIENTS
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const perplexityApiKey = process.env.PERPLEXITY_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

if (!perplexityApiKey) {
  console.error("Error: Missing PERPLEXITY_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// TYPES
// ============================================================================

interface ResourceListing {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string;
  website: string | null;
  city: string | null;
  state: string | null;
  details: Record<string, unknown> | null;
  enrichment_status: string;
}

interface EnrichmentData {
  description?: string;
  programs?: string[];
  pricing?: string;
  application_deadline?: string;
  notable_stats?: string[];
  social_media?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  founded_year?: number;
  team_size?: string;
  key_people?: string[];
  last_enriched_source?: string;
}

// ============================================================================
// PERPLEXITY API
// ============================================================================

async function queryPerplexity(prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You are a research assistant helping to gather accurate, current information about organizations. Be concise and factual. If information is not available, say so clearly.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error querying Perplexity:", error);
    return null;
  }
}

// ============================================================================
// ENRICHMENT LOGIC
// ============================================================================

function buildEnrichmentPrompt(listing: ResourceListing): string {
  const locationStr =
    listing.city && listing.state
      ? ` based in ${listing.city}, ${listing.state}`
      : "";

  const categoryMap: Record<string, string> = {
    grant: "grant program or funding opportunity",
    accelerator: "startup accelerator or incubator program",
    sba: "SBA resource partner or small business development center",
    coworking: "coworking space",
    incubator: "business incubator",
  };

  const categoryDesc = categoryMap[listing.category] || "business resource";

  return `Research "${listing.name}"${locationStr}, a ${categoryDesc}.
Website: ${listing.website}

Please provide the following information in a structured format:

1. **Description**: A 2-3 sentence description of what this organization does and who it serves.

2. **Programs/Services**: List the main programs or services they offer (bullet points).

3. **Pricing**: Any pricing information (if applicable - membership fees, grant amounts, program costs).

4. **Application Deadlines**: Current or typical application deadlines (if applicable).

5. **Notable Stats**: Any impressive statistics (number of companies helped, funding provided, success stories).

6. **Founded Year**: When was this organization founded?

7. **Key People**: Names and titles of key leadership (founder, CEO, director).

Be concise and factual. If any information is not readily available, indicate "Not found".`;
}

function parseEnrichmentResponse(
  response: string,
  listing: ResourceListing
): {
  shortDescription: string | null;
  enrichmentData: EnrichmentData;
} {
  const enrichmentData: EnrichmentData = {
    last_enriched_source: "perplexity",
  };

  // Extract description (for short_description if empty)
  const descMatch = response.match(
    /\*\*Description\*\*:?\s*([^\n*]+(?:\n(?!\d\.|\*\*)[^\n*]+)*)/i
  );
  const shortDescription = descMatch
    ? descMatch[1].trim().slice(0, 200)
    : null;

  // Extract programs/services
  const programsMatch = response.match(
    /\*\*Programs\/Services?\*\*:?\s*([\s\S]*?)(?=\n\d\.|\n\*\*|$)/i
  );
  if (programsMatch) {
    const programsText = programsMatch[1];
    const programs = programsText
      .split(/[-•*]\s+/)
      .map((p) => p.trim())
      .filter((p) => p && p.length > 3 && !p.toLowerCase().includes("not found"));
    if (programs.length > 0) {
      enrichmentData.programs = programs.slice(0, 5);
    }
  }

  // Extract pricing
  const pricingMatch = response.match(
    /\*\*Pricing\*\*:?\s*([^\n*]+(?:\n(?!\d\.|\*\*)[^\n*]+)*)/i
  );
  if (
    pricingMatch &&
    !pricingMatch[1].toLowerCase().includes("not found") &&
    !pricingMatch[1].toLowerCase().includes("not available")
  ) {
    enrichmentData.pricing = pricingMatch[1].trim().slice(0, 200);
  }

  // Extract deadlines
  const deadlineMatch = response.match(
    /\*\*Application Deadlines?\*\*:?\s*([^\n*]+)/i
  );
  if (
    deadlineMatch &&
    !deadlineMatch[1].toLowerCase().includes("not found") &&
    !deadlineMatch[1].toLowerCase().includes("not available")
  ) {
    enrichmentData.application_deadline = deadlineMatch[1].trim().slice(0, 100);
  }

  // Extract notable stats
  const statsMatch = response.match(
    /\*\*Notable Stats?\*\*:?\s*([\s\S]*?)(?=\n\d\.|\n\*\*|$)/i
  );
  if (statsMatch) {
    const statsText = statsMatch[1];
    const stats = statsText
      .split(/[-•*]\s+/)
      .map((s) => s.trim())
      .filter((s) => s && s.length > 5 && !s.toLowerCase().includes("not found"));
    if (stats.length > 0) {
      enrichmentData.notable_stats = stats.slice(0, 5);
    }
  }

  // Extract founded year
  const foundedMatch = response.match(
    /\*\*Founded Year\*\*:?\s*(\d{4})/i
  );
  if (foundedMatch) {
    enrichmentData.founded_year = parseInt(foundedMatch[1], 10);
  }

  // Extract key people
  const peopleMatch = response.match(
    /\*\*Key People\*\*:?\s*([\s\S]*?)(?=\n\d\.|\n\*\*|$)/i
  );
  if (peopleMatch) {
    const peopleText = peopleMatch[1];
    const people = peopleText
      .split(/[-•*,]\s+/)
      .map((p) => p.trim())
      .filter((p) => p && p.length > 3 && !p.toLowerCase().includes("not found"));
    if (people.length > 0) {
      enrichmentData.key_people = people.slice(0, 3);
    }
  }

  return { shortDescription, enrichmentData };
}

async function enrichListing(listing: ResourceListing): Promise<boolean> {
  const prompt = buildEnrichmentPrompt(listing);
  const response = await queryPerplexity(prompt);

  if (!response) {
    console.log(`  [!] No response from Perplexity for: ${listing.name}`);
    return false;
  }

  const { shortDescription, enrichmentData } = parseEnrichmentResponse(
    response,
    listing
  );

  // Build update object
  const updates: Record<string, unknown> = {
    enrichment_status: "enriched",
    last_enriched_at: new Date().toISOString(),
    enrichment_data: enrichmentData,
  };

  // Update short_description if it's empty and we found one
  if (!listing.short_description && shortDescription) {
    updates.short_description = shortDescription;
  }

  // Merge new data into existing details
  if (Object.keys(enrichmentData).length > 1) {
    // More than just last_enriched_source
    const existingDetails = listing.details || {};
    updates.details = {
      ...existingDetails,
      ...enrichmentData,
    };
  }

  // Update the listing in the database
  const { error } = await supabase
    .from("resource_listings")
    .update(updates)
    .eq("id", listing.id);

  if (error) {
    console.error(`  [!] Failed to update ${listing.name}: ${error.message}`);
    return false;
  }

  return true;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch(
  listings: ResourceListing[],
  batchNumber: number,
  totalListings: number
): Promise<number> {
  let successCount = 0;

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const globalIndex = (batchNumber - 1) * BATCH_SIZE + i + 1;

    process.stdout.write(
      `  [${globalIndex}/${totalListings}] ${listing.name.slice(0, 50)}...`
    );

    const success = await enrichListing(listing);

    if (success) {
      console.log(" done");
      successCount++;
    } else {
      console.log(" failed");
    }

    // Small delay between requests to avoid rate limiting
    if (i < listings.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  return successCount;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("SparkGood Resource Directory Enrichment\n");
  console.log("========================================\n");

  // Parse command line arguments
  const args = process.argv.slice(2);
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("DRY RUN MODE - No changes will be made\n");
  }

  // Fetch all raw listings with website URLs
  console.log("Fetching listings to enrich...");

  let query = supabase
    .from("resource_listings")
    .select("id, name, slug, description, short_description, category, website, city, state, details, enrichment_status")
    .eq("enrichment_status", "raw")
    .not("website", "is", null)
    .order("created_at", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: listings, error } = await query;

  if (error) {
    console.error("Error fetching listings:", error.message);
    process.exit(1);
  }

  if (!listings || listings.length === 0) {
    console.log("No listings to enrich. All listings are already enriched or have no website.");
    return;
  }

  console.log(`Found ${listings.length} listings to enrich\n`);

  if (dryRun) {
    console.log("Listings that would be enriched:");
    listings.forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.name} (${l.category}) - ${l.website}`);
    });
    console.log("\nRun without --dry-run to perform enrichment.");
    return;
  }

  // Process in batches
  const totalBatches = Math.ceil(listings.length / BATCH_SIZE);
  let totalEnriched = 0;
  let totalFailed = 0;

  console.log(
    `Processing ${listings.length} listings in ${totalBatches} batches...\n`
  );

  for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
    const startIdx = (batchNum - 1) * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, listings.length);
    const batch = listings.slice(startIdx, endIdx);

    console.log(
      `\nBatch ${batchNum}/${totalBatches} (${batch.length} listings)`
    );
    console.log("-".repeat(40));

    const successCount = await processBatch(batch, batchNum, listings.length);
    totalEnriched += successCount;
    totalFailed += batch.length - successCount;

    // Progress update
    const processed = endIdx;
    console.log(`\nEnriched ${processed}/${listings.length}...`);

    // Delay between batches (except for the last one)
    if (batchNum < totalBatches) {
      console.log(
        `Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`
      );
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // Final summary
  console.log("\n========================================");
  console.log("ENRICHMENT COMPLETE");
  console.log("========================================");
  console.log(`Total processed: ${listings.length}`);
  console.log(`Successfully enriched: ${totalEnriched}`);
  console.log(`Failed: ${totalFailed}`);

  // Show updated stats
  const { count: rawCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("enrichment_status", "raw");

  const { count: enrichedCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("enrichment_status", "enriched");

  console.log(`\nDatabase status:`);
  console.log(`  - Raw listings remaining: ${rawCount}`);
  console.log(`  - Enriched listings: ${enrichedCount}`);
}

main().catch((error) => {
  console.error("Enrichment failed:", error);
  process.exit(1);
});
