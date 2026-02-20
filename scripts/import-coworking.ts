import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Import Cleaned Coworking Data into Supabase
 *
 * Reads the cleaned coworking data and upserts into resource_listings.
 * Uses source + source_id for conflict resolution to prevent duplicates.
 *
 * Usage:
 *   npx tsx scripts/import-coworking.ts
 *
 * Prerequisites:
 *   - Run 'npx tsx scripts/clean-outscraper.ts' first
 *   - Ensure data/outscraper/coworking-cleaned.json exists
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// SUPABASE SETUP
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// TYPES
// ============================================================================

interface CleanedListing {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: 'coworking';
  subcategories: string[];
  cause_areas: string[];
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_remote: boolean;
  is_nationwide: boolean;
  service_areas: string[];
  website?: string;
  phone?: string;
  details: {
    rating?: number;
    reviews?: number;
    hours?: string;
    amenities?: string[];
    subtypes?: string[];
  };
  logo_url?: string;
  images: string[];
  source: 'outscraper';
  source_id: string;
  enrichment_status: 'raw';
  is_featured: boolean;
  is_active: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Split array into chunks for batch inserts
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Ensure location exists and get or create it
async function ensureLocations(listings: CleanedListing[]): Promise<void> {
  console.log('Ensuring locations exist...');

  // Get unique city/state combinations
  const locationMap = new Map<string, { city: string; state: string }>();
  for (const listing of listings) {
    if (listing.city && listing.state) {
      const key = `${listing.city.toLowerCase()}|${listing.state.toLowerCase()}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, { city: listing.city, state: listing.state });
      }
    }
  }

  const locations = Array.from(locationMap.values());
  console.log(`  Found ${locations.length} unique city/state combinations`);

  // State full name mapping
  const STATE_FULL_NAMES: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
    FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
    IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
    NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
    OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island',
    SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
    UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
    WI: 'Wisconsin', WY: 'Wyoming',
  };

  // Prepare location records
  const locationRecords = locations.map(loc => ({
    city: loc.city,
    state: loc.state,
    state_full: STATE_FULL_NAMES[loc.state] || loc.state,
    slug: `${loc.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${loc.state.toLowerCase()}`,
  }));

  // Upsert in batches
  const batches = chunk(locationRecords, 100);
  let inserted = 0;
  for (const batch of batches) {
    const { error } = await supabase
      .from('resource_locations')
      .upsert(batch, { onConflict: 'city,state', ignoreDuplicates: true });

    if (error) {
      console.error('  Warning: Error upserting locations:', error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`  Ensured ${inserted} locations exist`);
}

// ============================================================================
// MAIN IMPORT LOGIC
// ============================================================================

async function main() {
  const inputPath = path.join(process.cwd(), 'data/outscraper/coworking-cleaned.json');

  console.log('='.repeat(60));
  console.log('SparkGood Coworking Import Script');
  console.log('='.repeat(60));
  console.log('');

  // Check if cleaned file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Cleaned data file not found at ${inputPath}`);
    console.error('Run "npx tsx scripts/clean-outscraper.ts" first.');
    process.exit(1);
  }

  // Read cleaned data
  console.log('Reading cleaned data...');
  const rawContent = fs.readFileSync(inputPath, 'utf-8');
  const listings: CleanedListing[] = JSON.parse(rawContent);
  console.log(`  Found ${listings.length} listings to import`);
  console.log('');

  // Ensure locations exist
  await ensureLocations(listings);
  console.log('');

  // Upsert listings in batches
  console.log('Importing listings...');

  const BATCH_SIZE = 100;
  const batches = chunk(listings, BATCH_SIZE);

  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Transform to database format
    const dbRecords = batch.map(listing => ({
      name: listing.name,
      slug: listing.slug,
      description: listing.description,
      short_description: listing.short_description,
      category: listing.category,
      subcategories: listing.subcategories,
      cause_areas: listing.cause_areas,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      zip: listing.zip,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      is_remote: listing.is_remote,
      is_nationwide: listing.is_nationwide,
      service_areas: listing.service_areas,
      website: listing.website,
      phone: listing.phone,
      details: listing.details,
      logo_url: listing.logo_url,
      images: listing.images,
      source: listing.source,
      source_id: listing.source_id,
      enrichment_status: listing.enrichment_status,
      is_featured: listing.is_featured,
      is_active: listing.is_active,
    }));

    const { data, error } = await supabase
      .from('resource_listings')
      .upsert(dbRecords, { onConflict: 'slug' })
      .select('id');

    if (error) {
      console.error(`  Batch ${i + 1}/${batches.length}: Error - ${error.message}`);
      totalErrors += batch.length;
    } else {
      totalInserted += data?.length || 0;
      process.stdout.write(`\r  Progress: ${totalInserted}/${listings.length} (${((totalInserted / listings.length) * 100).toFixed(1)}%)`);
    }
  }

  console.log(''); // New line after progress
  console.log('');

  // Update category-location mappings
  console.log('Updating category-location mappings...');
  const { error: mappingError } = await supabase.rpc('recalculate_listing_counts');
  if (mappingError) {
    console.error('  Warning: Could not recalculate counts:', mappingError.message);
  } else {
    console.log('  Listing counts recalculated.');
  }
  console.log('');

  // Get final counts
  const { count: totalListings } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true });

  const { count: coworkingListings } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'coworking');

  const { count: outscraperListings } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'outscraper');

  // Summary
  console.log('='.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Listings imported: ${totalInserted}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log('');
  console.log('Database totals:');
  console.log(`  Total resource listings: ${totalListings}`);
  console.log(`  Coworking listings: ${coworkingListings}`);
  console.log(`  Outscraper listings: ${outscraperListings}`);
  console.log('');

  // Get breakdown by state for coworking
  const { data: stateData } = await supabase
    .from('resource_listings')
    .select('state')
    .eq('category', 'coworking')
    .eq('is_active', true);

  if (stateData) {
    const byState: Record<string, number> = {};
    for (const row of stateData) {
      const state = row.state || 'Unknown';
      byState[state] = (byState[state] || 0) + 1;
    }

    console.log('Top 10 states for coworking:');
    Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count}`);
      });
  }
}

main().catch(console.error);
