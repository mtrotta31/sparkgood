#!/usr/bin/env npx tsx
/**
 * Fix City Intros Script
 *
 * Removes SparkLocal references from ai_city_intro fields.
 *
 * Usage:
 *   npx tsx scripts/fix-city-intros.ts --dry-run    # Preview changes
 *   npx tsx scripts/fix-city-intros.ts              # Apply changes
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const DELAY_MS = 200;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

interface CityRecord {
  id: string;
  city: string;
  state: string;
  slug: string;
  ai_city_intro: string;
}

interface Stats {
  total: number;
  rewritten: number;
  skipped: number;
  failed: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rewriteIntro(intro: string): Promise<string | null> {
  const prompt = `Rewrite this city introduction, removing any references to SparkLocal or specific resource counts from SparkLocal's directory. Keep the neighborhood names, industry info, and everything else. If a sentence mentions SparkLocal counts, either rewrite it to be general (e.g., "the city has many coworking options across Uptown and Midtown") or remove it. Return only the rewritten text, nothing else.

TEXT TO REWRITE:
${intro}`;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    return null;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('============================================================');
  console.log('Fix City Intros - Remove SparkLocal References');
  console.log('============================================================');
  console.log('');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}`);
  console.log('');

  // Fetch all cities with ai_city_intro containing "SparkLocal"
  console.log('Fetching city intros containing "SparkLocal"...');

  const { data: cities, error } = await supabase
    .from('resource_locations')
    .select('id, city, state, slug, ai_city_intro')
    .not('ai_city_intro', 'is', null)
    .ilike('ai_city_intro', '%SparkLocal%');

  if (error) {
    console.error('Error fetching cities:', error.message);
    process.exit(1);
  }

  if (!cities || cities.length === 0) {
    console.log('No city intros found containing "SparkLocal". Nothing to fix!');
    process.exit(0);
  }

  console.log(`Found ${cities.length} city intros to rewrite.`);
  console.log('');
  console.log('------------------------------------------------------------');
  console.log('');

  const stats: Stats = {
    total: cities.length,
    rewritten: 0,
    skipped: 0,
    failed: 0,
  };

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i] as CityRecord;
    const progress = `[${i + 1}/${cities.length}]`;

    console.log(`${progress} Processing: ${city.city}, ${city.state}`);

    // Count SparkLocal mentions
    const mentions = (city.ai_city_intro.match(/SparkLocal/gi) || []).length;
    console.log(`  SparkLocal mentions: ${mentions}`);

    // Rewrite the intro
    const rewritten = await rewriteIntro(city.ai_city_intro);

    if (!rewritten) {
      console.log(`  FAILED: Could not rewrite intro`);
      stats.failed++;
      continue;
    }

    // Check if SparkLocal was removed
    const stillHasSparkLocal = rewritten.toLowerCase().includes('sparklocal');
    if (stillHasSparkLocal) {
      console.log(`  WARNING: Rewritten text still contains SparkLocal`);
    }

    if (dryRun) {
      console.log(`  ORIGINAL (first 150 chars):`);
      console.log(`    "${city.ai_city_intro.substring(0, 150)}..."`);
      console.log(`  REWRITTEN (first 150 chars):`);
      console.log(`    "${rewritten.substring(0, 150)}..."`);
      stats.rewritten++;
    } else {
      // Update the database
      const { error: updateError } = await supabase
        .from('resource_locations')
        .update({
          ai_city_intro: rewritten,
          updated_at: new Date().toISOString(),
        })
        .eq('id', city.id);

      if (updateError) {
        console.log(`  FAILED: ${updateError.message}`);
        stats.failed++;
      } else {
        console.log(`  UPDATED successfully`);
        stats.rewritten++;
      }
    }

    console.log('');

    // Delay between API calls
    if (i < cities.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log('============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  console.log(`  Total found: ${stats.total}`);
  console.log(`  Rewritten: ${stats.rewritten}`);
  console.log(`  Failed: ${stats.failed}`);
  if (dryRun) {
    console.log('');
    console.log('This was a dry run. Run without --dry-run to apply changes.');
  }
}

main().catch(console.error);
