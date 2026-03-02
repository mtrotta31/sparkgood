#!/usr/bin/env npx tsx
/**
 * Discover keywords using DataForSEO Labs API
 *
 * Uses the Keyword Suggestions endpoint to find low-competition keywords
 * related to seed keywords. Rotates through seed keywords to ensure variety.
 *
 * Usage:
 *   npx tsx scripts/blog-engine/discover-keywords.ts
 *   npx tsx scripts/blog-engine/discover-keywords.ts --dry-run
 */

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
config({ path: '.env.local' });

const CONFIG_PATH = path.join(__dirname, '../../data/blog-engine/config.json');
const KEYWORD_POOL_PATH = path.join(__dirname, '../../data/blog-engine/keyword-pool.json');

interface Config {
  seedKeywords: string[];
  keywordFilters: {
    minSearchVolume: number;
    maxSearchVolume: number;
    maxDifficulty: number;
  };
}

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  discoveredFrom: string;
  discoveredAt: string;
}

interface KeywordPool {
  lastUpdated: string | null;
  lastSeedKeywordIndex: number;
  keywords: KeywordData[];
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

async function fetchKeywordSuggestions(
  seedKeyword: string,
  filters: Config['keywordFilters']
): Promise<KeywordData[]> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error('DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set');
  }

  const auth = Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`Fetching suggestions for: "${seedKeyword}"`);

  const response = await fetch(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keyword: seedKeyword,
          location_code: 2840, // United States
          language_code: 'en',
          include_serp_info: true,
          include_seed_keyword: true,
          limit: 100, // Get top 100 suggestions
          filters: [
            ['keyword_info.search_volume', '>', filters.minSearchVolume],
            ['keyword_info.search_volume', '<', filters.maxSearchVolume],
            ['keyword_info.keyword_difficulty', '<', filters.maxDifficulty],
          ],
          order_by: ['keyword_info.search_volume,desc'],
        },
      ]),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DataForSEO API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO API error: ${data.status_message}`);
  }

  const results = data.tasks?.[0]?.result || [];
  const keywords: KeywordData[] = [];

  for (const result of results) {
    if (!result.items) continue;

    for (const item of result.items) {
      const keywordInfo = item.keyword_data?.keyword_info;
      if (!keywordInfo) continue;

      keywords.push({
        keyword: item.keyword,
        searchVolume: keywordInfo.search_volume || 0,
        difficulty: keywordInfo.keyword_difficulty || 0,
        cpc: keywordInfo.cpc || 0,
        intent: keywordInfo.search_intent || 'informational',
        discoveredFrom: seedKeyword,
        discoveredAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  return keywords;
}

async function main() {
  console.log('Blog Engine: Keyword Discovery');
  console.log('===============================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No API calls will be made\n');
  }

  // Load config and keyword pool
  const config: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const pool: KeywordPool = JSON.parse(fs.readFileSync(KEYWORD_POOL_PATH, 'utf-8'));

  // Determine next seed keyword (rotate through all before repeating)
  const nextIndex = (pool.lastSeedKeywordIndex + 1) % config.seedKeywords.length;
  const seedKeyword = config.seedKeywords[nextIndex];

  console.log(`Seed keywords total: ${config.seedKeywords.length}`);
  console.log(`Last used index: ${pool.lastSeedKeywordIndex}`);
  console.log(`Next seed keyword: "${seedKeyword}" (index ${nextIndex})`);
  console.log(`Current keyword pool size: ${pool.keywords.length}`);
  console.log('');

  if (isDryRun) {
    console.log('Would call DataForSEO API with:');
    console.log(`  Keyword: ${seedKeyword}`);
    console.log(`  Location: US (2840)`);
    console.log(`  Volume filter: ${config.keywordFilters.minSearchVolume} - ${config.keywordFilters.maxSearchVolume}`);
    console.log(`  Difficulty filter: < ${config.keywordFilters.maxDifficulty}`);
    console.log('\nDry run complete. Use without --dry-run to make API calls.');
    return;
  }

  // Validate environment
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    console.error('Error: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set');
    console.error('Add them to .env.local or use --dry-run to preview');
    process.exit(1);
  }

  try {
    const newKeywords = await fetchKeywordSuggestions(seedKeyword, config.keywordFilters);
    console.log(`\nFetched ${newKeywords.length} keyword suggestions`);

    // Merge with existing pool (avoid duplicates)
    const existingKeywords = new Set(pool.keywords.map((k) => k.keyword.toLowerCase()));
    const uniqueNewKeywords = newKeywords.filter(
      (k) => !existingKeywords.has(k.keyword.toLowerCase())
    );

    console.log(`New unique keywords: ${uniqueNewKeywords.length}`);

    // Update pool
    pool.keywords.push(...uniqueNewKeywords);
    pool.lastUpdated = new Date().toISOString();
    pool.lastSeedKeywordIndex = nextIndex;

    // Save pool
    fs.writeFileSync(KEYWORD_POOL_PATH, JSON.stringify(pool, null, 2));

    console.log(`\nKeyword pool updated:`);
    console.log(`  Total keywords: ${pool.keywords.length}`);
    console.log(`  Added: ${uniqueNewKeywords.length}`);
    console.log(`  Next seed index: ${(nextIndex + 1) % config.seedKeywords.length}`);

    if (uniqueNewKeywords.length > 0) {
      console.log('\nSample new keywords (top 5):');
      uniqueNewKeywords.slice(0, 5).forEach((k) => {
        console.log(`  - "${k.keyword}" (vol: ${k.searchVolume}, diff: ${k.difficulty})`);
      });
    }
  } catch (error) {
    console.error('Error fetching keywords:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
