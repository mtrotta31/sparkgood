#!/usr/bin/env npx tsx
/**
 * Expansion Report Script
 *
 * Analyzes expansion logs and shows:
 * - Total listings over time
 * - Listings per category
 * - Listings per city
 * - Weekly growth rate
 * - Estimated monthly Outscraper cost
 *
 * Usage:
 *   npx tsx scripts/expansion-report.ts
 *   npx tsx scripts/expansion-report.ts --last=10
 *   npx tsx scripts/expansion-report.ts --category=coworking
 *   npx tsx scripts/expansion-report.ts --export=csv
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { EXPANSION_CATEGORIES } from '../src/data/expansion-config';

// Environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Config {
  last: number;
  category: string | null;
  exportFormat: 'console' | 'csv' | 'json';
}

interface ExpansionLog {
  runDate: string;
  config: any;
  totalCost: number;
  citiesProcessed: number;
  totalResults: number;
  newListings: number;
  errors: number;
  results?: any[];
  coverageGaps?: any[];
}

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    last: 30,
    category: null,
    exportFormat: 'console',
  };

  for (const arg of args) {
    if (arg.startsWith('--last=')) {
      config.last = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--category=')) {
      config.category = arg.split('=')[1];
    } else if (arg.startsWith('--export=')) {
      config.exportFormat = arg.split('=')[1] as any;
    }
  }

  return config;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Load expansion logs from files
function loadExpansionLogs(config: Config): ExpansionLog[] {
  const logsDir = path.join(process.cwd(), 'scripts', 'expansion-logs');
  const logs: ExpansionLog[] = [];

  if (!fs.existsSync(logsDir)) {
    return logs;
  }

  const files = fs.readdirSync(logsDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('pipeline-') && !f.startsWith('new-'))
    .sort()
    .reverse()
    .slice(0, config.last);

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(logsDir, file), 'utf-8');
      const data = JSON.parse(content);
      logs.push(data);
    } catch {
      // Skip invalid files
    }
  }

  return logs;
}

async function main() {
  const config = parseArgs();

  console.log('📊 SparkLocal Expansion Report');
  console.log('==============================\n');

  // Load expansion logs
  const logs = loadExpansionLogs(config);

  // Get current database stats
  console.log('📈 Current Database Stats');
  console.log('─'.repeat(60));

  // Total listings by category
  const { data: categoryStats } = await supabase
    .from('resource_listings')
    .select('category')
    .eq('is_active', true);

  const categoryCounts: Record<string, number> = {};
  for (const row of categoryStats || []) {
    categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
  }

  const totalListings = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  console.log(`Total Active Listings: ${formatNumber(totalListings)}\n`);
  console.log('Listings by Category:');

  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  for (const [cat, count] of sortedCategories) {
    const catInfo = EXPANSION_CATEGORIES.find(c => c.slug === cat);
    const displayName = catInfo?.displayName || cat;
    const icon = catInfo?.icon || '📦';
    const bar = '█'.repeat(Math.ceil((count / totalListings) * 40));
    const pct = ((count / totalListings) * 100).toFixed(1);
    console.log(`  ${icon} ${displayName.padEnd(25)} ${formatNumber(count).padStart(6)} (${pct}%) ${bar}`);
  }

  // Total locations
  const { count: locationCount } = await supabase
    .from('resource_locations')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal Cities: ${formatNumber(locationCount || 0)}`);

  // Top cities by listings
  console.log('\n📍 Top 15 Cities by Listings');
  console.log('─'.repeat(60));

  const { data: topCities } = await supabase
    .from('resource_locations')
    .select('city, state, listing_count')
    .order('listing_count', { ascending: false })
    .limit(15);

  for (let i = 0; i < (topCities || []).length; i++) {
    const city = topCities![i];
    const bar = '█'.repeat(Math.ceil((city.listing_count / (topCities![0].listing_count || 1)) * 30));
    console.log(
      `  ${(i + 1).toString().padStart(2)}. ${(city.city + ', ' + city.state).padEnd(25)} ${formatNumber(city.listing_count).padStart(5)} ${bar}`
    );
  }

  // Expansion history
  if (logs.length > 0) {
    console.log('\n📅 Expansion History (Last ' + logs.length + ' Runs)');
    console.log('─'.repeat(80));
    console.log(
      'Date'.padEnd(14) +
      'Cities'.padEnd(10) +
      'Results'.padEnd(12) +
      'New'.padEnd(10) +
      'Errors'.padEnd(10) +
      'Cost'
    );
    console.log('─'.repeat(80));

    let totalCost = 0;
    let totalNew = 0;
    let totalErrors = 0;

    for (const log of logs) {
      totalCost += log.totalCost || 0;
      totalNew += log.newListings || 0;
      totalErrors += log.errors || 0;

      console.log(
        formatDate(log.runDate).padEnd(14) +
        (log.citiesProcessed?.toString() || '0').padEnd(10) +
        (log.totalResults?.toString() || '0').padEnd(12) +
        (log.newListings?.toString() || '0').padEnd(10) +
        (log.errors?.toString() || '0').padEnd(10) +
        formatCurrency(log.totalCost || 0)
      );
    }

    console.log('─'.repeat(80));
    console.log(
      'TOTAL'.padEnd(14) +
      ''.padEnd(10) +
      ''.padEnd(12) +
      totalNew.toString().padEnd(10) +
      totalErrors.toString().padEnd(10) +
      formatCurrency(totalCost)
    );

    // Calculate growth rate
    if (logs.length >= 2) {
      const recentWeek = logs.slice(0, 7);
      const weeklyNew = recentWeek.reduce((sum, l) => sum + (l.newListings || 0), 0);
      const weeklyCost = recentWeek.reduce((sum, l) => sum + (l.totalCost || 0), 0);

      console.log('\n📊 Weekly Stats (Last 7 Days)');
      console.log('─'.repeat(40));
      console.log(`New Listings: ${formatNumber(weeklyNew)}`);
      console.log(`API Cost: ${formatCurrency(weeklyCost)}`);
      console.log(`Growth Rate: ${((weeklyNew / totalListings) * 100).toFixed(2)}%`);
      console.log(`Est. Monthly Cost: ${formatCurrency(weeklyCost * 4.3)}`);
    }
  } else {
    console.log('\n⚠️  No expansion logs found');
    console.log('   Run `npx tsx scripts/smart-expand.ts` to start expanding');
  }

  // Coverage gaps preview
  console.log('\n🎯 Coverage Gaps (Top 10)');
  console.log('─'.repeat(80));

  // Query expansion tracking for gaps
  const { data: tracking } = await supabase
    .from('expansion_tracking')
    .select('*')
    .order('last_scraped_at', { ascending: true })
    .limit(100);

  // Calculate gaps manually (since view might not exist)
  interface GapData {
    city: string;
    state: string;
    population: number;
    listings: number;
    score: number;
    daysSince: number;
  }

  const gaps: GapData[] = [];

  // Get city+category combinations that need attention
  const { data: locations } = await supabase
    .from('resource_locations')
    .select('city, state, population, listing_count')
    .not('population', 'is', null)
    .order('population', { ascending: false })
    .limit(50);

  for (const loc of locations || []) {
    const listingCount = loc.listing_count || 0;
    const score = loc.population / (listingCount + 1);
    const trackingRecord = tracking?.find(
      t => t.city_slug === `${loc.city.toLowerCase().replace(/\s+/g, '-')}-${loc.state.toLowerCase()}`
    );
    const daysSince = trackingRecord
      ? Math.floor((Date.now() - new Date(trackingRecord.last_scraped_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    gaps.push({
      city: loc.city,
      state: loc.state,
      population: loc.population,
      listings: listingCount,
      score,
      daysSince,
    });
  }

  gaps.sort((a, b) => b.score - a.score);

  console.log(
    'City'.padEnd(25) +
    'State'.padEnd(8) +
    'Population'.padEnd(12) +
    'Listings'.padEnd(10) +
    'Score'.padEnd(12) +
    'Last Scraped'
  );
  console.log('─'.repeat(80));

  for (const gap of gaps.slice(0, 10)) {
    console.log(
      gap.city.slice(0, 23).padEnd(25) +
      gap.state.padEnd(8) +
      formatNumber(gap.population).padEnd(12) +
      gap.listings.toString().padEnd(10) +
      formatNumber(Math.round(gap.score)).padEnd(12) +
      (gap.daysSince === 999 ? 'Never' : `${gap.daysSince} days ago`)
    );
  }

  // Export if requested
  if (config.exportFormat === 'csv') {
    const csvData = [
      'city,state,population,listings,score,days_since_scrape',
      ...gaps.map(g => `${g.city},${g.state},${g.population},${g.listings},${Math.round(g.score)},${g.daysSince}`),
    ].join('\n');

    const exportPath = path.join(process.cwd(), 'scripts', 'expansion-logs', 'coverage-gaps.csv');
    fs.writeFileSync(exportPath, csvData);
    console.log(`\n📄 Exported to: ${exportPath}`);
  } else if (config.exportFormat === 'json') {
    const exportPath = path.join(process.cwd(), 'scripts', 'expansion-logs', 'coverage-gaps.json');
    fs.writeFileSync(exportPath, JSON.stringify({ gaps, stats: { totalListings, locationCount } }, null, 2));
    console.log(`\n📄 Exported to: ${exportPath}`);
  }

  console.log('');
}

main().catch(console.error);
