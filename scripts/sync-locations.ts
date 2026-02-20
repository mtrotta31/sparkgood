import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Sync Locations Script
 *
 * 1. Finds all unique city/state combinations in resource_listings
 * 2. Inserts any missing locations into resource_locations
 * 3. Updates listing_count for all locations
 * 4. Creates/updates resource_category_locations mappings
 *
 * Usage:
 *   npx tsx scripts/sync-locations.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// State abbreviation to full name mapping
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

function generateSlug(city: string, state: string): string {
  return `${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${state.toLowerCase()}`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Sync Locations Script');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Get all unique city/state from resource_listings
  console.log('Step 1: Finding unique city/state combinations in listings...');
  const { data: listings } = await supabase
    .from('resource_listings')
    .select('city, state')
    .eq('is_active', true)
    .not('city', 'is', null)
    .not('state', 'is', null);

  const listingLocations = new Map<string, { city: string; state: string }>();
  for (const row of listings || []) {
    if (row.city && row.state) {
      const key = `${row.city}|${row.state}`;
      if (!listingLocations.has(key)) {
        listingLocations.set(key, { city: row.city, state: row.state });
      }
    }
  }
  console.log(`  Found ${listingLocations.size} unique city/state combinations in listings`);

  // Step 2: Get existing locations
  console.log('');
  console.log('Step 2: Checking existing locations...');
  const { data: existingLocations } = await supabase
    .from('resource_locations')
    .select('city, state');

  const existingKeys = new Set<string>();
  for (const loc of existingLocations || []) {
    existingKeys.add(`${loc.city}|${loc.state}`);
  }
  console.log(`  Found ${existingKeys.size} existing locations`);

  // Step 3: Find missing locations
  const missingLocations: Array<{
    city: string;
    state: string;
    state_full: string;
    slug: string;
  }> = [];

  for (const [key, loc] of listingLocations) {
    if (!existingKeys.has(key)) {
      missingLocations.push({
        city: loc.city,
        state: loc.state,
        state_full: STATE_FULL_NAMES[loc.state] || loc.state,
        slug: generateSlug(loc.city, loc.state),
      });
    }
  }
  console.log(`  Missing locations to add: ${missingLocations.length}`);

  // Step 4: Insert missing locations
  if (missingLocations.length > 0) {
    console.log('');
    console.log('Step 3: Inserting missing locations...');
    const { error } = await supabase
      .from('resource_locations')
      .upsert(missingLocations, { onConflict: 'slug', ignoreDuplicates: true });

    if (error) {
      console.error('  Error inserting locations:', error.message);
    } else {
      console.log(`  Inserted ${missingLocations.length} new locations`);
    }
  }

  // Step 5: Update listing counts for all locations
  console.log('');
  console.log('Step 4: Updating listing counts...');
  const { data: allLocations } = await supabase
    .from('resource_locations')
    .select('id, city, state');

  let updatedCount = 0;
  for (const loc of allLocations || []) {
    const { count } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', loc.city)
      .eq('state', loc.state)
      .eq('is_active', true);

    await supabase
      .from('resource_locations')
      .update({ listing_count: count || 0 })
      .eq('id', loc.id);

    updatedCount++;
    if (updatedCount % 50 === 0) {
      process.stdout.write(`\r  Updated ${updatedCount}/${allLocations?.length || 0} locations`);
    }
  }
  console.log(`\r  Updated ${updatedCount} location counts`);

  // Step 6: Sync category-location mappings
  console.log('');
  console.log('Step 5: Syncing category-location mappings...');

  // Get all categories
  const { data: categories } = await supabase
    .from('resource_listings')
    .select('category')
    .eq('is_active', true);

  const uniqueCategories = [...new Set((categories || []).map(c => c.category))];
  console.log(`  Categories: ${uniqueCategories.join(', ')}`);

  // Get all locations with IDs
  const { data: locationsWithIds } = await supabase
    .from('resource_locations')
    .select('id, city, state, state_full');

  // Build mappings
  const mappings: Array<{
    category: string;
    location_id: string;
    listing_count: number;
    seo_title: string;
    seo_description: string;
  }> = [];

  for (const category of uniqueCategories) {
    for (const loc of locationsWithIds || []) {
      const { count } = await supabase
        .from('resource_listings')
        .select('*', { count: 'exact', head: true })
        .eq('category', category)
        .eq('city', loc.city)
        .eq('state', loc.state)
        .eq('is_active', true);

      if (count && count > 0) {
        const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
        const stateFull = loc.state_full || STATE_FULL_NAMES[loc.state] || loc.state;

        mappings.push({
          category,
          location_id: loc.id,
          listing_count: count,
          seo_title: `${categoryTitle} Spaces in ${loc.city}, ${stateFull} | SparkGood`,
          seo_description: `Find ${count} ${category} spaces in ${loc.city}, ${stateFull}. Browse coworking, shared offices, and meeting spaces to launch your venture.`,
        });
      }
    }
    process.stdout.write(`\r  Processed category: ${category}`);
  }
  console.log('');
  console.log(`  Found ${mappings.length} category-location combinations with listings`);

  // Upsert mappings
  if (mappings.length > 0) {
    const { error } = await supabase
      .from('resource_category_locations')
      .upsert(mappings, { onConflict: 'category,location_id' });

    if (error) {
      console.error('  Error upserting mappings:', error.message);
    } else {
      console.log(`  Upserted ${mappings.length} category-location mappings`);
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const { count: totalLocations } = await supabase
    .from('resource_locations')
    .select('*', { count: 'exact', head: true });

  const { count: totalMappings } = await supabase
    .from('resource_category_locations')
    .select('*', { count: 'exact', head: true });

  console.log(`  Total locations: ${totalLocations}`);
  console.log(`  Total category-location mappings: ${totalMappings}`);
  console.log('');

  // Show top coworking locations
  const { data: topCoworking } = await supabase
    .from('resource_category_locations')
    .select('listing_count, category, resource_locations(city, state)')
    .eq('category', 'coworking')
    .order('listing_count', { ascending: false })
    .limit(10);

  console.log('Top 10 coworking locations:');
  for (const row of topCoworking || []) {
    const loc = row.resource_locations as { city: string; state: string } | null;
    if (loc) {
      console.log(`  ${loc.city}, ${loc.state}: ${row.listing_count}`);
    }
  }
}

main().catch(console.error);
