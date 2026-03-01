#!/usr/bin/env npx tsx
/**
 * Smart Expansion Script
 *
 * Automatically expands the resource directory by:
 * 1. Calculating coverage gaps (population / listing count)
 * 2. Prioritizing cities with the biggest gaps
 * 3. Calling Outscraper API to fill gaps
 * 4. Deduplicating and inserting new listings
 *
 * Usage:
 *   npx tsx scripts/smart-expand.ts --dry-run
 *   npx tsx scripts/smart-expand.ts --max-cost=10 --max-cities=20 --category=auto
 *   npx tsx scripts/smart-expand.ts --category=coworking --max-cities=10
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import {
  EXPANSION_CATEGORIES,
  US_CITIES,
  type ExpansionCategory,
  type USCity,
  estimateOutscraperCost,
} from '../src/data/expansion-config';

// Environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const outscraper_api_key = process.env.OUTSCRAPER_API_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
interface Config {
  maxCost: number;
  maxCities: number;
  category: string;
  dryRun: boolean;
  daysThreshold: number;
  resultsPerCity: number;
}

interface CoverageGap {
  citySlug: string;
  city: string;
  state: string;
  stateAbbr: string;
  population: number;
  category: string;
  categoryName: string;
  currentListings: number;
  coverageScore: number;
  lastScrapedAt: Date | null;
  daysSinceScrape: number;
  estimatedCost: number;
  lat: number;
  lng: number;
}

interface ScrapeResult {
  citySlug: string;
  category: string;
  resultsCount: number;
  newListingsCount: number;
  apiCost: number;
  status: 'success' | 'error' | 'no_results' | 'skipped';
  errorMessage?: string;
}

interface ExpansionReport {
  runDate: string;
  config: Config;
  totalCost: number;
  citiesProcessed: number;
  totalResults: number;
  newListings: number;
  errors: number;
  results: ScrapeResult[];
  coverageGaps: CoverageGap[];
}

// Parse command line arguments
function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    maxCost: 10,
    maxCities: 20,
    category: 'auto',
    dryRun: false,
    daysThreshold: 30,
    resultsPerCity: 50,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg.startsWith('--max-cost=')) {
      config.maxCost = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--max-cities=')) {
      config.maxCities = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--category=')) {
      config.category = arg.split('=')[1];
    } else if (arg.startsWith('--days-threshold=')) {
      config.daysThreshold = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--results-per-city=')) {
      config.resultsPerCity = parseInt(arg.split('=')[1], 10);
    }
  }

  return config;
}

// Get current listing counts per city+category
async function getListingCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  // Get counts by city, state, category
  const { data, error } = await supabase
    .from('resource_listings')
    .select('city, state, category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching listing counts:', error);
    return counts;
  }

  for (const row of data || []) {
    if (row.city && row.state && row.category) {
      const key = `${row.city.toLowerCase()}-${row.state.toLowerCase()}-${row.category}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return counts;
}

// Get last scrape dates from expansion_tracking
async function getLastScrapeDates(): Promise<Map<string, Date>> {
  const dates = new Map<string, Date>();

  const { data, error } = await supabase
    .from('expansion_tracking')
    .select('city_slug, category, last_scraped_at');

  if (error) {
    // Table might not exist yet
    console.log('Note: expansion_tracking table not found, treating all cities as unscraped');
    return dates;
  }

  for (const row of data || []) {
    const key = `${row.city_slug}-${row.category}`;
    dates.set(key, new Date(row.last_scraped_at));
  }

  return dates;
}

// Calculate coverage gaps for all city+category combinations
async function calculateCoverageGaps(
  config: Config,
  categories: ExpansionCategory[]
): Promise<CoverageGap[]> {
  const listingCounts = await getListingCounts();
  const lastScrapeDates = await getLastScrapeDates();
  const gaps: CoverageGap[] = [];
  const now = new Date();

  for (const city of US_CITIES) {
    for (const category of categories) {
      const countKey = `${city.name.toLowerCase()}-${city.stateAbbr.toLowerCase()}-${category.slug}`;
      const scrapeKey = `${city.slug}-${category.slug}`;

      const currentListings = listingCounts.get(countKey) || 0;
      const lastScrape = lastScrapeDates.get(scrapeKey);
      const daysSinceScrape = lastScrape
        ? Math.floor((now.getTime() - lastScrape.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Skip if recently scraped
      if (daysSinceScrape < config.daysThreshold) {
        continue;
      }

      // Coverage score: population / (listings + 1)
      // Higher score = bigger gap (more people per listing)
      const coverageScore = city.population / (currentListings + 1);

      gaps.push({
        citySlug: city.slug,
        city: city.name,
        state: city.state,
        stateAbbr: city.stateAbbr,
        population: city.population,
        category: category.slug,
        categoryName: category.displayName,
        currentListings,
        coverageScore,
        lastScrapedAt: lastScrape || null,
        daysSinceScrape,
        estimatedCost: estimateOutscraperCost(config.resultsPerCity),
        lat: city.lat,
        lng: city.lng,
      });
    }
  }

  // Sort by coverage score (descending) - biggest gaps first
  gaps.sort((a, b) => b.coverageScore - a.coverageScore);

  return gaps;
}

// Select which gaps to fill based on budget and limits
function selectGapsToFill(gaps: CoverageGap[], config: Config): CoverageGap[] {
  const selected: CoverageGap[] = [];
  let totalCost = 0;

  for (const gap of gaps) {
    if (selected.length >= config.maxCities) break;
    if (totalCost + gap.estimatedCost > config.maxCost) continue;

    selected.push(gap);
    totalCost += gap.estimatedCost;
  }

  return selected;
}

// Call Outscraper API for a city+category
async function scrapeCity(
  gap: CoverageGap,
  category: ExpansionCategory,
  config: Config
): Promise<{ results: any[]; cost: number }> {
  if (!outscraper_api_key) {
    throw new Error('OUTSCRAPER_API_KEY not set');
  }

  // Build query from category search queries
  const query = category.searchQueries[0];
  const location = `${gap.city}, ${gap.stateAbbr}`;

  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    limit: config.resultsPerCity.toString(),
    language: 'en',
    region: 'us',
    async: 'false',
  });

  const response = await fetch(
    `https://api.app.outscraper.com/maps/search-v2?${params}`,
    {
      method: 'GET',
      headers: {
        'X-API-KEY': outscraper_api_key,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Outscraper API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  // Outscraper returns results in data array
  const results = data.data?.[0] || [];
  const cost = results.length * 0.003;

  return { results, cost };
}

// Parse Outscraper result into database format
function parseOutscraperResult(
  result: any,
  category: ExpansionCategory,
  gap: CoverageGap
): any {
  // Parse address components
  let city = gap.city;
  let state = gap.stateAbbr;
  let zip = '';

  if (result.full_address) {
    const addressParts = result.full_address.split(',').map((p: string) => p.trim());
    if (addressParts.length >= 3) {
      city = addressParts[addressParts.length - 3] || gap.city;
      const stateZip = addressParts[addressParts.length - 2] || '';
      const stateZipMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})?/);
      if (stateZipMatch) {
        state = stateZipMatch[1];
        zip = stateZipMatch[2] || '';
      }
    }
  }

  // Generate slug
  const baseName = (result.name || 'Unknown').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const baseSlug = `${baseName}-${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;

  return {
    name: result.name || 'Unknown',
    slug: baseSlug,
    description: result.description || null,
    short_description: `${category.displayName.slice(0, -1)} in ${city}, ${state}`,
    category: category.slug,
    subcategories: category.defaultSubcategories || [],
    address: result.full_address || result.address || null,
    city,
    state,
    zip,
    country: 'US',
    latitude: result.latitude || gap.lat,
    longitude: result.longitude || gap.lng,
    website: result.site || result.website || null,
    phone: result.phone || null,
    details: {
      rating: result.rating,
      reviews_count: result.reviews,
      hours: result.working_hours,
      subtypes: result.subtypes || [],
      business_status: result.business_status,
    },
    source: 'outscraper',
    source_id: result.place_id || result.google_id || null,
    is_active: true,
    is_featured: false,
    enrichment_status: 'raw',
  };
}

// Deduplicate against existing listings
async function getExistingSourceIds(): Promise<Set<string>> {
  const ids = new Set<string>();

  const { data } = await supabase
    .from('resource_listings')
    .select('source_id')
    .not('source_id', 'is', null);

  for (const row of data || []) {
    if (row.source_id) {
      ids.add(row.source_id);
    }
  }

  return ids;
}

// Generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from('resource_listings')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    if (counter > 100) {
      // Safety valve
      return `${baseSlug}-${Date.now()}`;
    }
  }
}

// Insert new listings
async function insertListings(listings: any[]): Promise<number> {
  if (listings.length === 0) return 0;

  // Generate unique slugs
  for (const listing of listings) {
    listing.slug = await generateUniqueSlug(listing.slug);
  }

  const { data, error } = await supabase
    .from('resource_listings')
    .insert(listings)
    .select('id');

  if (error) {
    console.error('Error inserting listings:', error);
    return 0;
  }

  return data?.length || 0;
}

// Ensure location exists
async function ensureLocation(gap: CoverageGap): Promise<void> {
  const { data } = await supabase
    .from('resource_locations')
    .select('id')
    .eq('slug', gap.citySlug)
    .single();

  if (!data) {
    // Create new location
    await supabase.from('resource_locations').insert({
      city: gap.city,
      state: gap.stateAbbr,
      state_full: gap.state,
      slug: gap.citySlug,
      latitude: gap.lat,
      longitude: gap.lng,
      population: gap.population,
      listing_count: 0,
      enrichment_status: 'raw',
    });
  }
}

// Record scrape in tracking table
async function recordScrape(result: ScrapeResult): Promise<void> {
  try {
    await supabase.rpc('record_scrape', {
      p_city_slug: result.citySlug,
      p_category: result.category,
      p_results_count: result.resultsCount,
      p_new_listings_count: result.newListingsCount,
      p_api_cost: result.apiCost,
      p_status: result.status,
      p_error_message: result.errorMessage || null,
    });
  } catch (error) {
    // RPC might not exist yet, try direct insert
    await supabase.from('expansion_tracking').upsert(
      {
        city_slug: result.citySlug,
        category: result.category,
        last_scraped_at: new Date().toISOString(),
        results_count: result.resultsCount,
        new_listings_count: result.newListingsCount,
        api_cost: result.apiCost,
        status: result.status,
        error_message: result.errorMessage || null,
      },
      { onConflict: 'city_slug,category' }
    );
  }
}

// Save expansion report
function saveReport(report: ExpansionReport): void {
  const logsDir = path.join(process.cwd(), 'scripts', 'expansion-logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const filename = `${report.runDate.split('T')[0]}.json`;
  const filepath = path.join(logsDir, filename);

  // Append to existing report for the day if it exists
  let existingReport: ExpansionReport | null = null;
  if (fs.existsSync(filepath)) {
    try {
      existingReport = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch {
      // Ignore parse errors
    }
  }

  if (existingReport) {
    // Merge reports
    report.results = [...existingReport.results, ...report.results];
    report.totalCost += existingReport.totalCost;
    report.citiesProcessed += existingReport.citiesProcessed;
    report.totalResults += existingReport.totalResults;
    report.newListings += existingReport.newListings;
    report.errors += existingReport.errors;
  }

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${filepath}`);
}

// Format number with commas
function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Main execution
async function main() {
  const config = parseArgs();

  console.log('🚀 Smart Expansion Engine');
  console.log('========================');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Max Cost: $${config.maxCost}`);
  console.log(`Max Cities: ${config.maxCities}`);
  console.log(`Category: ${config.category}`);
  console.log(`Days Threshold: ${config.daysThreshold}`);
  console.log(`Results Per City: ${config.resultsPerCity}`);
  console.log('');

  // Determine which categories to use
  let categories: ExpansionCategory[];
  if (config.category === 'auto') {
    categories = EXPANSION_CATEGORIES;
  } else {
    const cat = EXPANSION_CATEGORIES.find(c => c.slug === config.category);
    if (!cat) {
      console.error(`Unknown category: ${config.category}`);
      console.log('Available categories:', EXPANSION_CATEGORIES.map(c => c.slug).join(', '));
      process.exit(1);
    }
    categories = [cat];
  }

  console.log(`📊 Calculating coverage gaps for ${categories.length} categories across ${US_CITIES.length} cities...`);
  const allGaps = await calculateCoverageGaps(config, categories);
  console.log(`Found ${formatNumber(allGaps.length)} potential gaps\n`);

  // Select gaps to fill
  const selectedGaps = selectGapsToFill(allGaps, config);
  const estimatedTotalCost = selectedGaps.reduce((sum, g) => sum + g.estimatedCost, 0);

  console.log('📍 Top 20 Coverage Gaps (by population/listings ratio):');
  console.log('─'.repeat(100));
  console.log(
    'Rank'.padEnd(6) +
    'City'.padEnd(22) +
    'State'.padEnd(6) +
    'Category'.padEnd(22) +
    'Population'.padEnd(12) +
    'Listings'.padEnd(10) +
    'Score'.padEnd(12) +
    'Days Ago'
  );
  console.log('─'.repeat(100));

  for (let i = 0; i < Math.min(20, allGaps.length); i++) {
    const gap = allGaps[i];
    console.log(
      `${(i + 1).toString().padEnd(6)}` +
      `${gap.city.slice(0, 20).padEnd(22)}` +
      `${gap.stateAbbr.padEnd(6)}` +
      `${gap.categoryName.slice(0, 20).padEnd(22)}` +
      `${formatNumber(gap.population).padEnd(12)}` +
      `${gap.currentListings.toString().padEnd(10)}` +
      `${formatNumber(Math.round(gap.coverageScore)).padEnd(12)}` +
      `${gap.daysSinceScrape === 999 ? 'Never' : gap.daysSinceScrape.toString()}`
    );
  }
  console.log('─'.repeat(100));

  console.log(`\n🎯 Selected ${selectedGaps.length} gaps to fill (est. cost: $${estimatedTotalCost.toFixed(2)})`);

  if (config.dryRun) {
    console.log('\n🔍 DRY RUN - Would scrape:');
    for (const gap of selectedGaps) {
      console.log(`  • ${gap.city}, ${gap.stateAbbr} - ${gap.categoryName} (est. $${gap.estimatedCost.toFixed(3)})`);
    }

    // Generate dry run report
    const report: ExpansionReport = {
      runDate: new Date().toISOString(),
      config,
      totalCost: 0,
      citiesProcessed: 0,
      totalResults: 0,
      newListings: 0,
      errors: 0,
      results: [],
      coverageGaps: allGaps.slice(0, 50), // Save top 50 gaps for reference
    };

    saveReport(report);
    return;
  }

  // Check for API key
  if (!outscraper_api_key) {
    console.error('\n❌ OUTSCRAPER_API_KEY not set - cannot proceed with live run');
    process.exit(1);
  }

  // Execute scraping
  const existingSourceIds = await getExistingSourceIds();
  const results: ScrapeResult[] = [];
  let totalCost = 0;
  let totalNewListings = 0;

  console.log('\n🔄 Starting scraping...\n');

  for (let i = 0; i < selectedGaps.length; i++) {
    const gap = selectedGaps[i];
    const category = EXPANSION_CATEGORIES.find(c => c.slug === gap.category)!;

    console.log(`[${i + 1}/${selectedGaps.length}] ${gap.city}, ${gap.stateAbbr} - ${gap.categoryName}...`);

    // Check budget
    if (totalCost + gap.estimatedCost > config.maxCost) {
      console.log(`  ⚠️ Skipping - would exceed budget ($${totalCost.toFixed(2)} + $${gap.estimatedCost.toFixed(2)} > $${config.maxCost})`);
      results.push({
        citySlug: gap.citySlug,
        category: gap.category,
        resultsCount: 0,
        newListingsCount: 0,
        apiCost: 0,
        status: 'skipped',
        errorMessage: 'Budget exceeded',
      });
      continue;
    }

    try {
      // Ensure location exists
      await ensureLocation(gap);

      // Call Outscraper API
      const { results: scraped, cost } = await scrapeCity(gap, category, config);
      totalCost += cost;

      // Parse and deduplicate results
      const newListings: any[] = [];
      for (const item of scraped) {
        const sourceId = item.place_id || item.google_id;
        if (sourceId && existingSourceIds.has(sourceId)) {
          continue; // Skip duplicate
        }

        const listing = parseOutscraperResult(item, category, gap);
        if (listing.source_id) {
          existingSourceIds.add(listing.source_id); // Mark as seen
        }
        newListings.push(listing);
      }

      // Insert new listings
      const insertedCount = await insertListings(newListings);
      totalNewListings += insertedCount;

      const result: ScrapeResult = {
        citySlug: gap.citySlug,
        category: gap.category,
        resultsCount: scraped.length,
        newListingsCount: insertedCount,
        apiCost: cost,
        status: insertedCount > 0 ? 'success' : 'no_results',
      };

      results.push(result);
      await recordScrape(result);

      console.log(`  ✅ Found ${scraped.length} results, added ${insertedCount} new listings (cost: $${cost.toFixed(3)})`);

      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Error: ${errorMessage}`);

      const result: ScrapeResult = {
        citySlug: gap.citySlug,
        category: gap.category,
        resultsCount: 0,
        newListingsCount: 0,
        apiCost: 0,
        status: 'error',
        errorMessage,
      };

      results.push(result);
      await recordScrape(result);
    }
  }

  // Recalculate location counts
  console.log('\n📊 Recalculating location counts...');
  try {
    await supabase.rpc('recalculate_listing_counts');
    console.log('  ✅ Done');
  } catch (error) {
    console.log('  ⚠️ Could not recalculate counts:', error);
  }

  // Summary
  console.log('\n📈 Summary');
  console.log('─'.repeat(40));
  console.log(`Cities processed: ${results.filter(r => r.status !== 'skipped').length}`);
  console.log(`Total results: ${results.reduce((sum, r) => sum + r.resultsCount, 0)}`);
  console.log(`New listings added: ${totalNewListings}`);
  console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
  console.log(`Total API cost: $${totalCost.toFixed(2)}`);
  console.log('─'.repeat(40));

  // Save report
  const report: ExpansionReport = {
    runDate: new Date().toISOString(),
    config,
    totalCost,
    citiesProcessed: results.filter(r => r.status !== 'skipped').length,
    totalResults: results.reduce((sum, r) => sum + r.resultsCount, 0),
    newListings: totalNewListings,
    errors: results.filter(r => r.status === 'error').length,
    results,
    coverageGaps: allGaps.slice(0, 50),
  };

  saveReport(report);
}

main().catch(console.error);
