#!/usr/bin/env npx tsx
/**
 * Recalculate listing_count on resource_locations table
 *
 * Usage:
 *   npx tsx scripts/recalc-location-counts.ts           # Recalculate all
 *   npx tsx scripts/recalc-location-counts.ts --dry-run # Preview changes
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const DRY_RUN = process.argv.includes('--dry-run');

async function recalculateCounts() {
  console.log('============================================================');
  console.log('Recalculate Location Listing Counts');
  console.log('============================================================');
  console.log('');
  console.log('Mode: ' + (DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'));
  console.log('');

  // Get all locations
  const { data: locations, error: locErr } = await supabase
    .from('resource_locations')
    .select('id, city, state, listing_count')
    .order('city');

  if (locErr) {
    console.error('Error fetching locations:', locErr);
    process.exit(1);
  }

  const totalLocations = locations?.length || 0;
  console.log('Total locations: ' + totalLocations);
  console.log('');

  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const loc of locations || []) {
    // Get actual count
    const { count, error } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', loc.city)
      .eq('state', loc.state);

    if (error) {
      console.error('Error counting listings for ' + loc.city + ', ' + loc.state + ':', error);
      errors++;
      continue;
    }

    const actualCount = count || 0;
    const cached = loc.listing_count || 0;

    if (actualCount !== cached) {
      const diff = actualCount - cached;
      const diffStr = diff > 0 ? '+' + diff : String(diff);
      console.log(loc.city + ', ' + loc.state + ': ' + cached + ' → ' + actualCount + ' (' + diffStr + ')');

      if (!DRY_RUN) {
        const { error: updateErr } = await supabase
          .from('resource_locations')
          .update({ listing_count: actualCount })
          .eq('id', loc.id);

        if (updateErr) {
          console.error('  Error updating:', updateErr);
          errors++;
        } else {
          updated++;
        }
      } else {
        updated++;
      }
    } else {
      unchanged++;
    }
  }

  console.log('');
  console.log('============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  console.log('  Updated: ' + updated);
  console.log('  Unchanged: ' + unchanged);
  console.log('  Errors: ' + errors);

  if (DRY_RUN && updated > 0) {
    console.log('');
    console.log('Run without --dry-run to apply changes.');
  }
}

recalculateCounts();
