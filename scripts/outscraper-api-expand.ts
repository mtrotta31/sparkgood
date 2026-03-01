#!/usr/bin/env npx tsx
/**
 * SparkLocal Outscraper API Expansion Script
 *
 * Automatically expands resource listings by querying the Outscraper API
 * for cities with low coverage in a given category.
 *
 * Usage:
 *   npx tsx scripts/outscraper-api-expand.ts
 *     --category coworking|grant|accelerator|sba  (default: coworking)
 *     --cities "Boise,ID,Denver,CO" | "auto"      (default: auto)
 *     --limit 100                                  (per city, default: 100)
 *     --min-listings 5                             (auto mode threshold, default: 5)
 *     --dry-run                                    (preview without DB writes)
 *
 * Examples:
 *   npx tsx scripts/outscraper-api-expand.ts --dry-run --cities="Boise,ID" --limit=5
 *   npx tsx scripts/outscraper-api-expand.ts --category=coworking --cities=auto --limit=50
 *   npx tsx scripts/outscraper-api-expand.ts --category=coworking --cities="Austin,TX,Denver,CO" --limit=20
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

// ============================================================================
// CONFIGURATION
// ============================================================================

const OUTSCRAPER_API_URL = 'https://api.app.outscraper.com/maps/search-v2';

// Category to search query mapping
const CATEGORY_QUERIES: Record<string, string> = {
  coworking: 'coworking space',
  grant: 'small business grants',
  accelerator: 'startup accelerator',
  sba: 'small business development center',
};

// ============================================================================
// SUPABASE SETUP
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const outscraperKey = process.env.OUTSCRAPER_API_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!outscraperKey) {
  console.error('Error: Missing OUTSCRAPER_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

interface CLIArgs {
  category: string;
  cities: string;
  limit: number;
  minListings: number;
  dryRun: boolean;
}

interface OutscraperResult {
  name?: string;
  full_address?: string;
  site?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  working_hours?: string | Record<string, string[]>;
  photo?: string;
  photos?: string[];
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  google_id?: string;
  subtypes?: string[];
  type?: string;
  business_status?: string;
}

interface ListingRecord {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: string;
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
  details: Record<string, unknown>;
  logo_url?: string;
  images: string[];
  source: 'outscraper';
  source_id: string;
  enrichment_status: 'raw';
  is_featured: boolean;
  is_active: boolean;
}

interface CityToQuery {
  city: string;
  state: string;
  currentCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

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

// Reverse mapping: full name -> abbreviation
const STATE_ABBREVS: Record<string, string> = {};
for (const [abbr, full] of Object.entries(STATE_FULL_NAMES)) {
  STATE_ABBREVS[full.toLowerCase()] = abbr;
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);

  const getArg = (name: string, defaultVal: string): string => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    if (arg) return arg.split('=')[1];
    return defaultVal;
  };

  return {
    category: getArg('category', 'coworking'),
    cities: getArg('cities', 'auto'),
    limit: parseInt(getArg('limit', '100'), 10),
    minListings: parseInt(getArg('min-listings', '5'), 10),
    dryRun: args.includes('--dry-run'),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function normalizeState(state: string | undefined): string | undefined {
  if (!state) return undefined;
  const trimmed = state.trim();

  // Already an abbreviation
  if (trimmed.length === 2) {
    const upper = trimmed.toUpperCase();
    if (STATE_FULL_NAMES[upper]) return upper;
  }

  // Full state name
  const abbr = STATE_ABBREVS[trimmed.toLowerCase()];
  if (abbr) return abbr;

  // Try to extract from longer strings
  for (const [full, ab] of Object.entries(STATE_ABBREVS)) {
    if (trimmed.toLowerCase().includes(full)) return ab;
  }

  return trimmed.substring(0, 2).toUpperCase();
}

function normalizeCity(city: string | undefined): string | undefined {
  if (!city) return undefined;
  return city
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseAddressForCityState(fullAddress: string): { city?: string; state?: string; zip?: string } {
  // Outscraper format: "123 Main St, San Antonio, TX 78201, USA"
  const parts = fullAddress.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    // City is usually second-to-last US part
    const city = parts[parts.length - 3] || parts[parts.length - 2];

    // State + ZIP is usually in the second-to-last part
    const stateZipPart = parts[parts.length - 2];
    const stateZipMatch = stateZipPart.match(/([A-Z]{2})\s*(\d{5})?/);

    if (stateZipMatch) {
      return {
        city: normalizeCity(city),
        state: stateZipMatch[1],
        zip: stateZipMatch[2],
      };
    }

    // Try extracting state abbreviation
    const stateMatch = stateZipPart.match(/\b([A-Z]{2})\b/);
    if (stateMatch) {
      return {
        city: normalizeCity(city),
        state: stateMatch[1],
      };
    }
  }

  return {};
}

function createShortDescription(name: string, category: string, city?: string, state?: string): string {
  const categoryLabels: Record<string, string> = {
    coworking: 'Coworking and office space',
    grant: 'Business grant program',
    accelerator: 'Startup accelerator',
    sba: 'Small business resource center',
  };
  const label = categoryLabels[category] || 'Business resource';

  if (city && state) {
    return `${label} in ${city}, ${state}.`;
  }
  return `${label}.`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// OUTSCRAPER API
// ============================================================================

interface OutscraperAPIResponse {
  id?: string;
  status?: string;
  data?: OutscraperResult[][];
  results_count?: number;
  cost_usd?: number;
}

async function queryOutscraper(
  searchQuery: string,
  city: string,
  state: string,
  limit: number
): Promise<{ results: OutscraperResult[]; cost: number }> {
  const query = `${searchQuery} in ${city}, ${state}`;
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    async: 'false',
    language: 'en',
    region: 'us',
  });

  const url = `${OUTSCRAPER_API_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-KEY': outscraperKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Outscraper API error (${response.status}): ${errorText}`);
  }

  const data: OutscraperAPIResponse = await response.json();

  // Outscraper returns data as nested arrays: [[{...}, {...}]]
  const results = data.data?.[0] || [];
  const cost = data.cost_usd || 0;

  return { results, cost };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function getCitiesWithLowCoverage(
  category: string,
  minListings: number
): Promise<CityToQuery[]> {
  console.log(`Finding cities with fewer than ${minListings} ${category} listings...`);

  // Get all locations
  const { data: locations, error: locError } = await supabase
    .from('resource_locations')
    .select('city, state')
    .order('listing_count', { ascending: false });

  if (locError) {
    console.error('Error fetching locations:', locError.message);
    return [];
  }

  const cities: CityToQuery[] = [];

  for (const loc of locations || []) {
    // Get count for this category in this city
    const { count, error } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('city', loc.city)
      .eq('state', loc.state)
      .eq('is_active', true);

    if (error) continue;

    const currentCount = count || 0;
    if (currentCount < minListings) {
      cities.push({
        city: loc.city,
        state: loc.state,
        currentCount,
      });
    }
  }

  // Sort by lowest coverage first
  cities.sort((a, b) => a.currentCount - b.currentCount);

  console.log(`  Found ${cities.length} cities with low coverage`);
  return cities;
}

function parseCitiesArg(citiesArg: string): CityToQuery[] {
  // Parse "Boise,ID,Denver,CO" format
  const parts = citiesArg.split(',').map(p => p.trim());
  const cities: CityToQuery[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    const city = parts[i];
    const state = parts[i + 1];
    if (city && state) {
      cities.push({
        city: normalizeCity(city) || city,
        state: normalizeState(state) || state,
        currentCount: 0,
      });
    }
  }

  return cities;
}

async function getExistingListings(category: string): Promise<Set<string>> {
  console.log(`Fetching existing ${category} listings for deduplication...`);

  const existing = new Set<string>();
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('resource_listings')
      .select('name, city, state')
      .eq('category', category)
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching existing listings:', error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const key = `${(row.name || '').toLowerCase()}|${(row.city || '').toLowerCase()}|${(row.state || '').toLowerCase()}`;
      existing.add(key);
    }

    offset += pageSize;
    if (data.length < pageSize) break;
  }

  console.log(`  Found ${existing.size} existing ${category} listings`);
  return existing;
}

async function getExistingSlugs(): Promise<Set<string>> {
  console.log('Fetching existing slugs...');

  const slugs = new Set<string>();
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('resource_listings')
      .select('slug')
      .range(offset, offset + pageSize - 1);

    if (error) break;
    if (!data || data.length === 0) break;

    for (const row of data) {
      slugs.add(row.slug);
    }

    offset += pageSize;
    if (data.length < pageSize) break;
  }

  console.log(`  Found ${slugs.size} existing slugs`);
  return slugs;
}

async function ensureLocations(listings: ListingRecord[]): Promise<void> {
  console.log('Ensuring locations exist...');

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

  const locationRecords = locations.map(loc => ({
    city: loc.city,
    state: loc.state,
    state_full: STATE_FULL_NAMES[loc.state] || loc.state,
    slug: `${loc.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${loc.state.toLowerCase()}`,
  }));

  const { error } = await supabase
    .from('resource_locations')
    .upsert(locationRecords, { onConflict: 'city,state', ignoreDuplicates: true });

  if (error) {
    console.error('  Warning: Error upserting locations:', error.message);
  } else {
    console.log(`  Ensured ${locationRecords.length} locations exist`);
  }
}

// ============================================================================
// RESULT MAPPING
// ============================================================================

function mapOutscraperToListing(
  result: OutscraperResult,
  category: string,
  existingSlugs: Set<string>
): ListingRecord | null {
  if (!result.name || result.name.trim() === '') return null;

  const name = result.name.trim();

  // Parse city/state
  let city = normalizeCity(result.city);
  let state = normalizeState(result.state);
  let zip = result.postal_code?.trim();

  // If city/state not in fields, try parsing from full_address
  if ((!city || !state) && result.full_address) {
    const parsed = parseAddressForCityState(result.full_address);
    city = city || parsed.city;
    state = state || parsed.state;
    zip = zip || parsed.zip;
  }

  if (!city || !state) return null;

  // Generate unique slug
  let baseSlug = generateSlug(`${name}-${city}-${state}`);
  let slug = baseSlug;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);

  // Parse coordinates
  const latitude = typeof result.latitude === 'number' ? result.latitude : undefined;
  const longitude = typeof result.longitude === 'number' ? result.longitude : undefined;

  // Parse subtypes
  const subtypes = result.subtypes || [];

  // Get photo URL
  const logoUrl = result.photo || (result.photos?.[0]);

  // Build listing record
  return {
    name,
    slug,
    description: result.description?.trim() || undefined,
    short_description: createShortDescription(name, category, city, state),
    category,
    subcategories: [],
    cause_areas: [],
    address: result.full_address?.trim(),
    city,
    state,
    zip,
    country: 'US',
    latitude,
    longitude,
    is_remote: false,
    is_nationwide: false,
    service_areas: [],
    website: result.site?.trim() || undefined,
    phone: result.phone?.trim() || undefined,
    details: {
      rating: result.rating,
      reviews: result.reviews,
      hours: typeof result.working_hours === 'string'
        ? result.working_hours
        : result.working_hours ? JSON.stringify(result.working_hours) : undefined,
      subtypes: subtypes.length > 0 ? subtypes : undefined,
      business_status: result.business_status,
    },
    logo_url: logoUrl || undefined,
    images: logoUrl ? [logoUrl] : [],
    source: 'outscraper',
    source_id: result.place_id || result.google_id || slug,
    enrichment_status: 'raw',
    is_featured: false,
    is_active: true,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = parseArgs();

  console.log('='.repeat(70));
  console.log('SparkLocal Outscraper API Expansion');
  console.log('='.repeat(70));
  console.log(`Category: ${args.category}`);
  console.log(`Cities: ${args.cities}`);
  console.log(`Limit per city: ${args.limit}`);
  console.log(`Min listings threshold: ${args.minListings}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // Validate category
  const searchQuery = CATEGORY_QUERIES[args.category];
  if (!searchQuery) {
    console.error(`Error: Unknown category "${args.category}"`);
    console.error(`Valid categories: ${Object.keys(CATEGORY_QUERIES).join(', ')}`);
    process.exit(1);
  }

  // Get cities to query
  let cities: CityToQuery[];
  if (args.cities === 'auto') {
    cities = await getCitiesWithLowCoverage(args.category, args.minListings);
    if (cities.length === 0) {
      console.log('\nNo cities need expansion. All cities have sufficient coverage.');
      return;
    }
    console.log(`\nWill query ${cities.length} cities with low coverage.`);
  } else {
    cities = parseCitiesArg(args.cities);
    console.log(`\nWill query ${cities.length} specified cities.`);
  }

  // Show cities
  console.log('\nCities to query:');
  for (const c of cities.slice(0, 10)) {
    console.log(`  - ${c.city}, ${c.state} (current: ${c.currentCount})`);
  }
  if (cities.length > 10) {
    console.log(`  ... and ${cities.length - 10} more`);
  }

  // Get existing data for deduplication
  const existingListings = await getExistingListings(args.category);
  const existingSlugs = await getExistingSlugs();

  // Query each city
  console.log('\n' + '='.repeat(70));
  console.log('QUERYING OUTSCRAPER API');
  console.log('='.repeat(70));

  const allNewListings: ListingRecord[] = [];
  let totalApiCost = 0;
  let totalResults = 0;
  let totalDuplicates = 0;

  for (const cityInfo of cities) {
    const { city, state } = cityInfo;
    console.log(`\nQuerying: ${city}, ${state}...`);

    try {
      const { results, cost } = await queryOutscraper(searchQuery, city, state, args.limit);
      totalApiCost += cost;
      totalResults += results.length;

      console.log(`  Found ${results.length} results (cost: $${cost.toFixed(4)})`);

      let newCount = 0;
      let dupeCount = 0;

      for (const result of results) {
        const listing = mapOutscraperToListing(result, args.category, existingSlugs);
        if (!listing) continue;

        // Check for duplicates
        const dedupeKey = `${listing.name.toLowerCase()}|${listing.city!.toLowerCase()}|${listing.state!.toLowerCase()}`;
        if (existingListings.has(dedupeKey)) {
          dupeCount++;
          continue;
        }

        allNewListings.push(listing);
        existingListings.add(dedupeKey);
        newCount++;
      }

      totalDuplicates += dupeCount;
      console.log(`  New: ${newCount}, Duplicates: ${dupeCount}`);

      // Rate limiting between API calls
      await sleep(500);
    } catch (error) {
      console.error(`  Error querying ${city}, ${state}:`, error);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Cities queried:        ${cities.length}`);
  console.log(`Total API results:     ${totalResults}`);
  console.log(`Duplicates skipped:    ${totalDuplicates}`);
  console.log(`New listings to add:   ${allNewListings.length}`);
  console.log(`Estimated API cost:    $${totalApiCost.toFixed(4)}`);

  if (allNewListings.length === 0) {
    console.log('\nNo new listings to import.');
    return;
  }

  // Show sample of new listings
  console.log('\nSample new listings (first 10):');
  for (const listing of allNewListings.slice(0, 10)) {
    console.log(`  - ${listing.name} (${listing.city}, ${listing.state})`);
  }
  if (allNewListings.length > 10) {
    console.log(`  ... and ${allNewListings.length - 10} more`);
  }

  // Group by city/state for summary
  const byCityState: Record<string, number> = {};
  for (const listing of allNewListings) {
    const key = `${listing.city}, ${listing.state}`;
    byCityState[key] = (byCityState[key] || 0) + 1;
  }
  console.log('\nNew listings by location:');
  for (const [location, count] of Object.entries(byCityState).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${location}: ${count}`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete. Run without --dry-run to import.');
    return;
  }

  // Insert into database
  console.log('\n' + '='.repeat(70));
  console.log('IMPORTING');
  console.log('='.repeat(70));

  // Ensure locations exist
  await ensureLocations(allNewListings);

  // Insert listings in batches
  console.log('\nInserting listings...');
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allNewListings.length; i += BATCH_SIZE) {
    const batch = allNewListings.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('resource_listings')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Error - ${error.message}`);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      process.stdout.write(`\r  Progress: ${inserted}/${allNewListings.length}`);
    }
  }

  console.log('\n');

  // Recalculate listing counts
  console.log('Recalculating listing counts...');
  const { error: rpcError } = await supabase.rpc('recalculate_listing_counts');
  if (rpcError) {
    console.error('  Warning: Could not recalculate counts:', rpcError.message);
  } else {
    console.log('  Done.');
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  API cost: $${totalApiCost.toFixed(4)}`);

  // Get new totals
  const { count: totalCategory } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category', args.category)
    .eq('is_active', true);

  console.log(`\nTotal ${args.category} listings now: ${totalCategory}`);
}

main().catch(console.error);
