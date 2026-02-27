#!/usr/bin/env npx tsx
/**
 * Submit all SparkLocal resource URLs to IndexNow for instant Bing/Yandex indexing
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow.ts
 *   npx tsx scripts/submit-indexnow.ts --dry-run    # Preview URLs without submitting
 *   npx tsx scripts/submit-indexnow.ts --listings   # Only submit listing pages
 *   npx tsx scripts/submit-indexnow.ts --cities     # Only submit city pages
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { submitToIndexNowBatched } from '../src/lib/indexnow';

// Load .env.local
config({ path: '.env.local' });

const SITE_URL = 'https://sparklocal.co';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const listingsOnly = args.includes('--listings');
const citiesOnly = args.includes('--cities');

async function main() {
  console.log('IndexNow URL Submission Script');
  console.log('==============================');

  if (isDryRun) {
    console.log('DRY RUN MODE - URLs will not be submitted\n');
  }

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const indexNowKey = process.env.INDEXNOW_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!indexNowKey && !isDryRun) {
    console.error('Error: INDEXNOW_API_KEY not set');
    console.error('Add it to .env.local or use --dry-run to preview URLs');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const urls: string[] = [];

  // Fetch listing slugs (paginate to get all, Supabase default limit is 1000)
  if (!citiesOnly) {
    console.log('Fetching listing slugs...');
    const allListings: { slug: string }[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data: listings, error: listingsError } = await supabase
        .from('resource_listings')
        .select('slug')
        .eq('is_active', true)
        .range(offset, offset + pageSize - 1);

      if (listingsError) {
        console.error('Error fetching listings:', listingsError.message);
        process.exit(1);
      }

      if (!listings || listings.length === 0) break;

      allListings.push(...listings);
      offset += pageSize;

      if (listings.length < pageSize) break;
    }

    const listingUrls = allListings.map(
      (l) => `${SITE_URL}/resources/listing/${l.slug}`
    );
    urls.push(...listingUrls);
    console.log(`  Found ${listingUrls.length} listing pages`);
  }

  // Fetch city slugs
  if (!listingsOnly) {
    console.log('Fetching city slugs...');
    const { data: cities, error: citiesError } = await supabase
      .from('resource_locations')
      .select('slug');

    if (citiesError) {
      console.error('Error fetching cities:', citiesError.message);
      process.exit(1);
    }

    const cityUrls = (cities || []).map(
      (c) => `${SITE_URL}/resources/${c.slug}`
    );
    urls.push(...cityUrls);
    console.log(`  Found ${cityUrls.length} city pages`);
  }

  // Add static pages
  const staticPages = [
    `${SITE_URL}/resources`,
    `${SITE_URL}/resources/grant`,
    `${SITE_URL}/resources/coworking`,
    `${SITE_URL}/resources/accelerator`,
    `${SITE_URL}/resources/sba`,
  ];
  urls.push(...staticPages);
  console.log(`  Added ${staticPages.length} static pages`);

  console.log(`\nTotal URLs to submit: ${urls.length}`);

  if (isDryRun) {
    console.log('\nSample URLs (first 20):');
    urls.slice(0, 20).forEach((url) => console.log(`  ${url}`));
    if (urls.length > 20) {
      console.log(`  ... and ${urls.length - 20} more`);
    }
    console.log('\nDry run complete. Use without --dry-run to submit.');
    return;
  }

  // Submit to IndexNow
  console.log('\nSubmitting to IndexNow...');
  const startTime = Date.now();

  const { submitted, failed } = await submitToIndexNowBatched(urls);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n==============================');
  console.log('Submission Complete');
  console.log(`  Submitted: ${submitted}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Time: ${elapsed}s`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
