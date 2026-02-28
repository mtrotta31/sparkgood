#!/usr/bin/env npx tsx
/**
 * Import Outscraper CSV data directly into SparkLocal
 *
 * Usage:
 *   npx tsx scripts/import-outscraper-csv.ts data/outscraper/san-antonio-coworking.csv
 *   npx tsx scripts/import-outscraper-csv.ts data/outscraper/san-antonio-coworking.csv --dry-run
 *
 * Features:
 *   - Reads Outscraper CSV format directly
 *   - Deduplicates against existing database entries (name + city + state)
 *   - Creates new resource_locations for any new cities
 *   - Generates URL slugs matching existing pattern
 *   - Supports --dry-run to preview imports
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

// ============================================================================
// SUPABASE SETUP
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

interface OutscraperRow {
  name?: string;
  full_address?: string;
  site?: string;
  phone?: string;
  rating?: string;
  description?: string;
  working_hours?: string;
  photo?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  place_id?: string;
  google_id?: string;
  subtypes?: string;
  [key: string]: string | undefined;
}

interface ListingRecord {
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
// HELPER FUNCTIONS
// ============================================================================

function parseCSV(content: string): OutscraperRow[] {
  const lines = content.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse rows
  const rows: OutscraperRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: OutscraperRow = {};

    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].toLowerCase().replace(/\s+/g, '_');
      row[key] = values[j] || '';
    }

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

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

function createShortDescription(name: string, city?: string, state?: string): string {
  if (city && state) {
    return `Coworking and office space in ${city}, ${state}.`;
  }
  return 'Coworking and shared office space.';
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function getExistingListings(): Promise<Set<string>> {
  console.log('Fetching existing listings for deduplication...');

  const existing = new Set<string>();
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('resource_listings')
      .select('name, city, state')
      .eq('category', 'coworking')
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

  console.log(`  Found ${existing.size} existing coworking listings`);
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
// MAIN IMPORT LOGIC
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const csvPath = args.find(arg => !arg.startsWith('--'));

  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-outscraper-csv.ts <csv-file> [--dry-run]');
    console.error('Example: npx tsx scripts/import-outscraper-csv.ts data/outscraper/san-antonio.csv --dry-run');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('SparkLocal Outscraper CSV Import');
  console.log('='.repeat(70));

  if (isDryRun) {
    console.log('DRY RUN MODE - No changes will be made\n');
  }

  // Read CSV file
  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV: ${fullPath}`);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const rows = parseCSV(content);
  console.log(`  Found ${rows.length} rows in CSV\n`);

  // Get existing data for deduplication
  const existingListings = await getExistingListings();
  const existingSlugs = await getExistingSlugs();

  // Process rows
  console.log('\nProcessing rows...');
  const newListings: ListingRecord[] = [];
  let duplicates = 0;
  let skippedNoName = 0;
  let skippedNoLocation = 0;

  for (const row of rows) {
    // Skip if no name
    if (!row.name || row.name.trim() === '') {
      skippedNoName++;
      continue;
    }

    const name = row.name.trim();

    // Parse city/state from CSV columns or address
    let city = normalizeCity(row.city);
    let state = normalizeState(row.state);
    let zip = row.postal_code?.trim();

    // If city/state not in columns, try parsing from full_address
    if ((!city || !state) && row.full_address) {
      const parsed = parseAddressForCityState(row.full_address);
      city = city || parsed.city;
      state = state || parsed.state;
      zip = zip || parsed.zip;
    }

    // Skip if no location
    if (!city || !state) {
      skippedNoLocation++;
      continue;
    }

    // Check for duplicates
    const dedupeKey = `${name.toLowerCase()}|${city.toLowerCase()}|${state.toLowerCase()}`;
    if (existingListings.has(dedupeKey)) {
      duplicates++;
      continue;
    }

    // Generate unique slug
    let baseSlug = generateSlug(`${name}-${city}-${state}`);
    let slug = baseSlug;
    let counter = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(slug);

    // Parse rating
    const rating = row.rating ? parseFloat(row.rating) : undefined;

    // Parse coordinates
    const latitude = row.latitude ? parseFloat(row.latitude) : undefined;
    const longitude = row.longitude ? parseFloat(row.longitude) : undefined;

    // Parse subtypes
    const subtypes = row.subtypes
      ? row.subtypes.split(',').map(s => s.trim().toLowerCase())
      : [];

    // Get first photo URL
    const logoUrl = row.photo?.split(',')[0]?.trim();

    // Build listing record
    const listing: ListingRecord = {
      name,
      slug,
      description: row.description?.trim() || undefined,
      short_description: createShortDescription(name, city, state),
      category: 'coworking',
      subcategories: [],
      cause_areas: [],
      address: row.full_address?.trim(),
      city,
      state,
      zip,
      country: 'US',
      latitude: latitude && !isNaN(latitude) ? latitude : undefined,
      longitude: longitude && !isNaN(longitude) ? longitude : undefined,
      is_remote: false,
      is_nationwide: false,
      service_areas: [],
      website: row.site?.trim() || undefined,
      phone: row.phone?.trim() || undefined,
      details: {
        rating: rating && !isNaN(rating) ? rating : undefined,
        hours: row.working_hours?.trim() || undefined,
        subtypes: subtypes.length > 0 ? subtypes : undefined,
      },
      logo_url: logoUrl || undefined,
      images: logoUrl ? [logoUrl] : [],
      source: 'outscraper',
      source_id: row.place_id || row.google_id || slug,
      enrichment_status: 'raw',
      is_featured: false,
      is_active: true,
    };

    newListings.push(listing);
    existingListings.add(dedupeKey); // Prevent duplicates within CSV
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total rows in CSV:     ${rows.length}`);
  console.log(`Skipped (no name):     ${skippedNoName}`);
  console.log(`Skipped (no location): ${skippedNoLocation}`);
  console.log(`Duplicates found:      ${duplicates}`);
  console.log(`New listings to add:   ${newListings.length}`);

  if (newListings.length === 0) {
    console.log('\nNo new listings to import.');
    return;
  }

  // Show sample of new listings
  console.log('\nSample new listings (first 10):');
  for (const listing of newListings.slice(0, 10)) {
    console.log(`  - ${listing.name} (${listing.city}, ${listing.state})`);
  }
  if (newListings.length > 10) {
    console.log(`  ... and ${newListings.length - 10} more`);
  }

  // Group by city/state for summary
  const byCityState: Record<string, number> = {};
  for (const listing of newListings) {
    const key = `${listing.city}, ${listing.state}`;
    byCityState[key] = (byCityState[key] || 0) + 1;
  }
  console.log('\nListings by location:');
  for (const [location, count] of Object.entries(byCityState).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${location}: ${count}`);
  }

  if (isDryRun) {
    console.log('\nDry run complete. Run without --dry-run to import.');
    return;
  }

  // Insert into database
  console.log('\n' + '='.repeat(70));
  console.log('IMPORTING');
  console.log('='.repeat(70));

  // Ensure locations exist
  await ensureLocations(newListings);

  // Insert listings in batches
  console.log('\nInserting listings...');
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newListings.length; i += BATCH_SIZE) {
    const batch = newListings.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('resource_listings')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Error - ${error.message}`);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      process.stdout.write(`\r  Progress: ${inserted}/${newListings.length}`);
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

  // Get new totals
  const { count: totalCoworking } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'coworking')
    .eq('is_active', true);

  console.log(`\nTotal coworking listings now: ${totalCoworking}`);
}

main().catch(console.error);
