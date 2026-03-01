#!/usr/bin/env npx tsx
/**
 * Post-Expansion Pipeline
 *
 * Runs after smart-expand.ts to:
 * 1. Enrich all un-enriched listings (AI descriptions, FAQs)
 * 2. Enrich all un-enriched city locations
 * 3. Recalculate location counts
 * 4. Submit all new URLs to IndexNow
 * 5. Generate category landing page content for new categories
 *
 * Usage:
 *   npx tsx scripts/post-expand-pipeline.ts
 *   npx tsx scripts/post-expand-pipeline.ts --dry-run
 *   npx tsx scripts/post-expand-pipeline.ts --skip-enrichment
 *   npx tsx scripts/post-expand-pipeline.ts --skip-indexnow
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { EXPANSION_CATEGORIES, getNewCategories } from '../src/data/expansion-config';

// Environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;
const indexNowKey = process.env.INDEXNOW_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
interface Config {
  dryRun: boolean;
  skipEnrichment: boolean;
  skipIndexNow: boolean;
  batchSize: number;
  maxListings: number;
  maxCities: number;
}

interface PipelineResult {
  step: string;
  success: boolean;
  processed: number;
  errors: number;
  details?: string;
}

// Parse command line arguments
function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    dryRun: false,
    skipEnrichment: false,
    skipIndexNow: false,
    batchSize: 25,
    maxListings: 500,
    maxCities: 100,
  };

  for (const arg of args) {
    if (arg === '--dry-run') config.dryRun = true;
    if (arg === '--skip-enrichment') config.skipEnrichment = true;
    if (arg === '--skip-indexnow') config.skipIndexNow = true;
    if (arg.startsWith('--batch-size=')) config.batchSize = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--max-listings=')) config.maxListings = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--max-cities=')) config.maxCities = parseInt(arg.split('=')[1], 10);
  }

  return config;
}

// Initialize Claude client
let anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }
    anthropic = new Anthropic({ apiKey: anthropicKey });
  }
  return anthropic;
}

// Enrich a single listing with AI content
async function enrichListing(listing: any): Promise<any> {
  const client = getAnthropic();
  const category = EXPANSION_CATEGORIES.find(c => c.slug === listing.category);
  const categoryName = category?.displayName || listing.category;

  const prompt = `Generate SEO-optimized content for this business listing:

Business: ${listing.name}
Category: ${categoryName}
Location: ${listing.city}, ${listing.state}
Address: ${listing.address || 'Not provided'}
Website: ${listing.website || 'Not provided'}
Current Description: ${listing.description || listing.short_description || 'None'}

Generate a JSON response with:
1. "ai_description": A 180-200 word SEO-optimized description. Include:
   - What the business offers
   - Who it serves (entrepreneurs, small businesses, startups)
   - Location benefits
   - Why someone should choose this business
   Do NOT mention specific prices, hours, or data you don't have.

2. "ai_faqs": Array of 4 FAQs relevant to this type of business:
   [{"question": "...", "answer": "..."}]
   Make questions specific to the business type and location.

3. "ai_meta_description": 150-160 character meta description for SEO.

4. "ai_key_details": Object with 3-4 key details about this business type.

Return ONLY valid JSON, no markdown.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON from response
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error(`Failed to parse enrichment for ${listing.name}:`, error);
  }

  return null;
}

// Enrich a single city with AI content
async function enrichCity(city: any, resourceCounts: Record<string, number>): Promise<any> {
  const client = getAnthropic();

  const prompt = `Generate SEO content for a city business resources page.

City: ${city.city}, ${city.state_full || city.state}
Population: ${city.population?.toLocaleString() || 'Unknown'}

Generate a JSON response with:

1. "ai_city_intro": 200-250 word introduction about starting a business in this city. Include:
   - Business climate and opportunities
   - Key industries and growing sectors
   - Support ecosystem for entrepreneurs
   - Neighborhoods known for business activity
   Do NOT mention specific resource counts or website names.

2. "ai_city_tips": 5 numbered tips for starting a business in this city. Format as:
   "1. [Tip title] — [Tip details]\\n2. [Tip title] — [Tip details]..." etc.

3. "ai_city_faqs": Array of 4 FAQs about starting a business in this city:
   [{"question": "...", "answer": "..."}]

4. "ai_business_climate": 1-2 sentence overview of the local business environment.

5. "ai_key_industries": Array of 4-6 key industries in the area: ["Industry 1", "Industry 2", ...]

Return ONLY valid JSON, no markdown.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error(`Failed to parse city enrichment for ${city.city}:`, error);
  }

  return null;
}

// Step 1: Enrich un-enriched listings
async function enrichListings(config: Config): Promise<PipelineResult> {
  console.log('\n📝 Step 1: Enriching listings...');

  if (config.skipEnrichment) {
    console.log('  ⏭️  Skipped (--skip-enrichment)');
    return { step: 'enrich_listings', success: true, processed: 0, errors: 0, details: 'Skipped' };
  }

  // Get un-enriched listings
  const { data: listings, error } = await supabase
    .from('resource_listings')
    .select('id, name, category, city, state, address, website, description, short_description')
    .eq('enrichment_status', 'raw')
    .eq('is_active', true)
    .limit(config.maxListings);

  if (error) {
    console.error('  ❌ Error fetching listings:', error);
    return { step: 'enrich_listings', success: false, processed: 0, errors: 1, details: error.message };
  }

  const toEnrich = listings || [];
  console.log(`  Found ${toEnrich.length} un-enriched listings`);

  if (toEnrich.length === 0) {
    return { step: 'enrich_listings', success: true, processed: 0, errors: 0, details: 'No listings to enrich' };
  }

  if (config.dryRun) {
    console.log(`  🔍 Would enrich ${toEnrich.length} listings`);
    return { step: 'enrich_listings', success: true, processed: 0, errors: 0, details: 'Dry run' };
  }

  let processed = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < toEnrich.length; i += config.batchSize) {
    const batch = toEnrich.slice(i, i + config.batchSize);
    console.log(`  Processing batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(toEnrich.length / config.batchSize)}...`);

    for (const listing of batch) {
      try {
        const enrichment = await enrichListing(listing);

        if (enrichment) {
          await supabase
            .from('resource_listings')
            .update({
              enrichment_data: enrichment,
              enrichment_status: 'enriched',
              last_enriched_at: new Date().toISOString(),
            })
            .eq('id', listing.id);

          processed++;
        } else {
          errors++;
        }

        // Rate limit: 200ms between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Error enriching ${listing.name}:`, error);
        errors++;
      }
    }
  }

  console.log(`  ✅ Enriched ${processed} listings (${errors} errors)`);
  return { step: 'enrich_listings', success: errors === 0, processed, errors };
}

// Step 2: Enrich un-enriched cities
async function enrichCities(config: Config): Promise<PipelineResult> {
  console.log('\n🏙️  Step 2: Enriching cities...');

  if (config.skipEnrichment) {
    console.log('  ⏭️  Skipped (--skip-enrichment)');
    return { step: 'enrich_cities', success: true, processed: 0, errors: 0, details: 'Skipped' };
  }

  // Get un-enriched cities
  const { data: cities, error } = await supabase
    .from('resource_locations')
    .select('id, city, state, state_full, population, slug')
    .or('enrichment_status.eq.raw,ai_city_intro.is.null')
    .limit(config.maxCities);

  if (error) {
    console.error('  ❌ Error fetching cities:', error);
    return { step: 'enrich_cities', success: false, processed: 0, errors: 1, details: error.message };
  }

  const toEnrich = cities || [];
  console.log(`  Found ${toEnrich.length} un-enriched cities`);

  if (toEnrich.length === 0) {
    return { step: 'enrich_cities', success: true, processed: 0, errors: 0, details: 'No cities to enrich' };
  }

  if (config.dryRun) {
    console.log(`  🔍 Would enrich ${toEnrich.length} cities`);
    return { step: 'enrich_cities', success: true, processed: 0, errors: 0, details: 'Dry run' };
  }

  let processed = 0;
  let errors = 0;

  for (const city of toEnrich) {
    try {
      const enrichment = await enrichCity(city, {});

      if (enrichment) {
        await supabase
          .from('resource_locations')
          .update({
            ai_city_intro: enrichment.ai_city_intro,
            ai_city_tips: enrichment.ai_city_tips,
            ai_city_faqs: enrichment.ai_city_faqs,
            ai_business_climate: enrichment.ai_business_climate,
            ai_key_industries: enrichment.ai_key_industries,
            enrichment_status: 'enriched',
          })
          .eq('id', city.id);

        processed++;
        console.log(`  ✓ ${city.city}, ${city.state}`);
      } else {
        errors++;
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`  ❌ Error enriching ${city.city}:`, error);
      errors++;
    }
  }

  console.log(`  ✅ Enriched ${processed} cities (${errors} errors)`);
  return { step: 'enrich_cities', success: errors === 0, processed, errors };
}

// Step 3: Recalculate location counts
async function recalculateCounts(config: Config): Promise<PipelineResult> {
  console.log('\n📊 Step 3: Recalculating location counts...');

  if (config.dryRun) {
    console.log('  🔍 Would recalculate counts');
    return { step: 'recalculate_counts', success: true, processed: 0, errors: 0, details: 'Dry run' };
  }

  try {
    await supabase.rpc('recalculate_listing_counts');
    console.log('  ✅ Counts recalculated');
    return { step: 'recalculate_counts', success: true, processed: 1, errors: 0 };
  } catch (error) {
    console.error('  ❌ Error:', error);
    return { step: 'recalculate_counts', success: false, processed: 0, errors: 1, details: String(error) };
  }
}

// Step 4: Submit new URLs to IndexNow
async function submitToIndexNow(config: Config): Promise<PipelineResult> {
  console.log('\n🔍 Step 4: Submitting to IndexNow...');

  if (config.skipIndexNow) {
    console.log('  ⏭️  Skipped (--skip-indexnow)');
    return { step: 'indexnow', success: true, processed: 0, errors: 0, details: 'Skipped' };
  }

  if (!indexNowKey) {
    console.log('  ⚠️  INDEXNOW_API_KEY not set, skipping');
    return { step: 'indexnow', success: true, processed: 0, errors: 0, details: 'No API key' };
  }

  // Get recently added listings (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: newListings } = await supabase
    .from('resource_listings')
    .select('slug')
    .gte('created_at', oneDayAgo)
    .eq('is_active', true);

  // Get recently added/updated cities
  const { data: newCities } = await supabase
    .from('resource_locations')
    .select('slug')
    .gte('updated_at', oneDayAgo);

  const urls: string[] = [];
  const baseUrl = 'https://sparklocal.co';

  // Add listing URLs
  for (const listing of newListings || []) {
    urls.push(`${baseUrl}/resources/listing/${listing.slug}`);
  }

  // Add city URLs
  for (const city of newCities || []) {
    urls.push(`${baseUrl}/resources/${city.slug}`);
  }

  console.log(`  Found ${urls.length} new URLs to submit`);

  if (urls.length === 0) {
    return { step: 'indexnow', success: true, processed: 0, errors: 0, details: 'No new URLs' };
  }

  if (config.dryRun) {
    console.log(`  🔍 Would submit ${urls.length} URLs to IndexNow`);
    for (const url of urls.slice(0, 10)) {
      console.log(`    • ${url}`);
    }
    if (urls.length > 10) {
      console.log(`    ... and ${urls.length - 10} more`);
    }
    return { step: 'indexnow', success: true, processed: 0, errors: 0, details: 'Dry run' };
  }

  // Submit in batches of 10000 (IndexNow limit)
  const batchSize = 10000;
  let submitted = 0;
  let errors = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'sparklocal.co',
          key: indexNowKey,
          keyLocation: `https://sparklocal.co/${indexNowKey}.txt`,
          urlList: batch,
        }),
      });

      if (response.ok || response.status === 202) {
        submitted += batch.length;
      } else {
        console.error(`  ❌ IndexNow error: ${response.status}`);
        errors++;
      }
    } catch (error) {
      console.error('  ❌ IndexNow error:', error);
      errors++;
    }
  }

  console.log(`  ✅ Submitted ${submitted} URLs to IndexNow`);
  return { step: 'indexnow', success: errors === 0, processed: submitted, errors };
}

// Step 5: Generate category landing page content for new categories
async function generateCategoryContent(config: Config): Promise<PipelineResult> {
  console.log('\n📑 Step 5: Checking for new categories...');

  const newCategories = getNewCategories();

  // Check which categories have listings
  const categoriesWithListings: string[] = [];

  for (const category of newCategories) {
    const { count } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.slug)
      .eq('is_active', true);

    if ((count || 0) > 0) {
      categoriesWithListings.push(category.slug);
    }
  }

  if (categoriesWithListings.length === 0) {
    console.log('  No new categories with listings');
    return { step: 'category_content', success: true, processed: 0, errors: 0, details: 'No new categories' };
  }

  console.log(`  Found ${categoriesWithListings.length} new categories with listings: ${categoriesWithListings.join(', ')}`);

  if (config.dryRun) {
    console.log('  🔍 Would generate content for these categories');
    return { step: 'category_content', success: true, processed: 0, errors: 0, details: 'Dry run' };
  }

  // For now, log that content needs to be generated
  // In a full implementation, this would generate CategoryGuideContent entries
  console.log('  ℹ️  Note: New category content should be added to CategoryGuideContent.tsx');
  console.log('     Categories needing content:', categoriesWithListings.join(', '));

  // Generate a helper file with category info
  const contentGuide = categoriesWithListings.map(slug => {
    const cat = EXPANSION_CATEGORIES.find(c => c.slug === slug);
    return {
      slug,
      displayName: cat?.displayName,
      description: cat?.description,
      icon: cat?.icon,
    };
  });

  const guidePath = path.join(process.cwd(), 'scripts', 'expansion-logs', 'new-categories.json');
  fs.writeFileSync(guidePath, JSON.stringify(contentGuide, null, 2));
  console.log(`  📄 Category info saved to: ${guidePath}`);

  return { step: 'category_content', success: true, processed: categoriesWithListings.length, errors: 0 };
}

// Main execution
async function main() {
  const config = parseArgs();
  const startTime = Date.now();

  console.log('🔄 Post-Expansion Pipeline');
  console.log('==========================');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  const results: PipelineResult[] = [];
  let hasErrors = false;

  // Run each step, continuing even if one fails
  try {
    results.push(await enrichListings(config));
  } catch (error) {
    console.error('Step 1 failed:', error);
    results.push({ step: 'enrich_listings', success: false, processed: 0, errors: 1, details: String(error) });
    hasErrors = true;
  }

  try {
    results.push(await enrichCities(config));
  } catch (error) {
    console.error('Step 2 failed:', error);
    results.push({ step: 'enrich_cities', success: false, processed: 0, errors: 1, details: String(error) });
    hasErrors = true;
  }

  try {
    results.push(await recalculateCounts(config));
  } catch (error) {
    console.error('Step 3 failed:', error);
    results.push({ step: 'recalculate_counts', success: false, processed: 0, errors: 1, details: String(error) });
    hasErrors = true;
  }

  try {
    results.push(await submitToIndexNow(config));
  } catch (error) {
    console.error('Step 4 failed:', error);
    results.push({ step: 'indexnow', success: false, processed: 0, errors: 1, details: String(error) });
    hasErrors = true;
  }

  try {
    results.push(await generateCategoryContent(config));
  } catch (error) {
    console.error('Step 5 failed:', error);
    results.push({ step: 'category_content', success: false, processed: 0, errors: 1, details: String(error) });
    hasErrors = true;
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n📈 Pipeline Summary');
  console.log('─'.repeat(60));
  console.log('Step'.padEnd(25) + 'Status'.padEnd(12) + 'Processed'.padEnd(12) + 'Errors');
  console.log('─'.repeat(60));

  for (const result of results) {
    console.log(
      result.step.padEnd(25) +
      (result.success ? '✅' : '❌').padEnd(12) +
      result.processed.toString().padEnd(12) +
      result.errors.toString()
    );
  }

  console.log('─'.repeat(60));
  console.log(`Duration: ${duration}s`);

  // Save results to log
  const logsDir = path.join(process.cwd(), 'scripts', 'expansion-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, `pipeline-${new Date().toISOString().split('T')[0]}.json`);
  const logData = {
    runDate: new Date().toISOString(),
    config,
    duration: parseFloat(duration),
    results,
  };

  // Append to existing log
  let existingLogs: any[] = [];
  if (fs.existsSync(logFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      existingLogs = Array.isArray(existing) ? existing : [existing];
    } catch {
      // Ignore
    }
  }
  existingLogs.push(logData);
  fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));

  if (hasErrors) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Pipeline failed:', error);
  process.exit(1);
});
