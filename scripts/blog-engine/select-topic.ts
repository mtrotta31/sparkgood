#!/usr/bin/env npx tsx
/**
 * Select the best keyword topic from the pool
 *
 * Filters out keywords that would cannibalize existing pages,
 * scores remaining keywords, and maps to internal links.
 *
 * Usage:
 *   npx tsx scripts/blog-engine/select-topic.ts
 *   npx tsx scripts/blog-engine/select-topic.ts --dry-run
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
config({ path: '.env.local' });

const CONFIG_PATH = path.join(__dirname, '../../data/blog-engine/config.json');
const KEYWORD_POOL_PATH = path.join(__dirname, '../../data/blog-engine/keyword-pool.json');
const SELECTED_TOPIC_PATH = path.join(__dirname, '../../data/blog-engine/selected-topic.json');
const BLOG_DIR = path.join(__dirname, '../../content/blog');

interface Config {
  clusterWeights: Record<string, number>;
  siteUrl: string;
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

interface InternalLink {
  url: string;
  label: string;
}

interface SelectedTopic {
  keyword: string;
  slug: string;
  searchVolume: number;
  difficulty: number;
  score: number;
  cluster: string;
  internalLinks: {
    categoryPages: InternalLink[];
    cityPages: InternalLink[];
    stateGuides: InternalLink[];
    otherBlogPosts: InternalLink[];
    builderCTA: string;
  };
  selectedAt: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Patterns to avoid (would cannibalize programmatic pages)
const DIRECTORY_PATTERNS = [
  /^(coworking|grants?|accelerator|sba|attorney|accountant|insurance|marketing|chamber|virtual office|commercial real estate|consultant)s?\s+(in|near)\s+/i,
  /^(best|top|find)\s+(coworking|grants?|accelerators?)\s+(in|near)\s+/i,
  /^(coworking spaces?|grants?|accelerators?)\s+in\s+[a-z]+,?\s*[a-z]{2}/i,
];

const STATE_GUIDE_PATTERNS = [
  /^how to start a business in [a-z]+$/i,
  /^start(ing)? a business in [a-z]+$/i,
  /^[a-z]+ business (license|registration|requirements)$/i,
];

// US state names for pattern matching
const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
  'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
  'wisconsin', 'wyoming',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function matchesDirectoryPattern(keyword: string): boolean {
  return DIRECTORY_PATTERNS.some((pattern) => pattern.test(keyword));
}

function matchesStateGuidePattern(keyword: string): boolean {
  const lowerKeyword = keyword.toLowerCase();

  // Check for "how to start a business in [state]" pattern
  if (STATE_GUIDE_PATTERNS.some((p) => p.test(lowerKeyword))) {
    return US_STATES.some((state) => lowerKeyword.includes(state));
  }
  return false;
}

function getCluster(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();

  // Funding cluster
  if (/grant|funding|sbir|sba loan|capital|investment|money|financing/.test(lowerKeyword)) {
    return 'funding';
  }

  // Getting started cluster
  if (/how to start|business plan|llc|corporation|license|permit|register|formation|structure/.test(lowerKeyword)) {
    return 'getting-started';
  }

  // Location cluster
  if (/city|cities|location|coworking|workspace|accelerator|incubator/.test(lowerKeyword)) {
    return 'location';
  }

  // Services cluster
  if (/attorney|lawyer|accountant|cpa|insurance|marketing|chamber|virtual office|consultant/.test(lowerKeyword)) {
    return 'services';
  }

  // Industry cluster
  if (/food truck|restaurant|ecommerce|freelance|consulting|cleaning|landscaping|online business/.test(lowerKeyword)) {
    return 'industry';
  }

  return 'getting-started'; // Default
}

function getClusterBonus(cluster: string, existingPostClusters: string[], weights: Record<string, number>): number {
  const clusterCount = existingPostClusters.filter((c) => c === cluster).length;
  const totalPosts = existingPostClusters.length;

  if (totalPosts === 0) return weights[cluster] || 1.0;

  // Favor clusters with fewer posts
  const avgCount = totalPosts / Object.keys(weights).length;
  const scarcity = avgCount / Math.max(clusterCount, 1);

  return (weights[cluster] || 1.0) * Math.min(scarcity, 2.0);
}

function semanticOverlap(keyword: string, postSlug: string): number {
  const keywordWords = new Set(keyword.toLowerCase().split(/\s+/));
  const slugWords = new Set(postSlug.split('-'));

  const intersection = [...keywordWords].filter((w) => slugWords.has(w));
  const union = new Set([...keywordWords, ...slugWords]);

  return intersection.length / union.size;
}

async function getExistingPostSlugs(): Promise<string[]> {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));
}

async function mapInternalLinks(
  keyword: string,
  supabase: ReturnType<typeof createClient> | null,
  existingPosts: string[]
): Promise<SelectedTopic['internalLinks']> {
  const links: SelectedTopic['internalLinks'] = {
    categoryPages: [],
    cityPages: [],
    stateGuides: [],
    otherBlogPosts: [],
    builderCTA: '/builder',
  };

  const lowerKeyword = keyword.toLowerCase();

  // Map keyword to category pages
  if (/grant|funding|money/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/grant', label: 'grants directory' });
  }
  if (/coworking|workspace|office/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/coworking', label: 'coworking spaces directory' });
  }
  if (/accelerator|incubator/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/accelerator', label: 'accelerators directory' });
  }
  if (/sba|small business administration/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/sba', label: 'SBA resources' });
  }
  if (/attorney|lawyer|legal/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/business-attorney', label: 'business attorneys' });
  }
  if (/insurance/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/business-insurance', label: 'business insurance' });
  }
  if (/chamber/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/chamber-of-commerce', label: 'chambers of commerce' });
  }
  if (/virtual office/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/virtual-office', label: 'virtual offices' });
  }
  if (/consultant|consulting|advisor/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/business-consultant', label: 'business consultants' });
  }
  if (/accountant|cpa|bookkeep/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/accountant', label: 'accountants' });
  }
  if (/marketing|advertising|agency/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/marketing-agency', label: 'marketing agencies' });
  }
  if (/real estate|commercial property|lease/.test(lowerKeyword)) {
    links.categoryPages.push({ url: '/resources/commercial-real-estate', label: 'commercial real estate' });
  }

  // Ensure at least one category link
  if (links.categoryPages.length === 0) {
    links.categoryPages.push({ url: '/resources', label: 'resource directory' });
  }

  // Map to state guides if state mentioned
  for (const state of US_STATES) {
    if (lowerKeyword.includes(state)) {
      const stateSlug = state.replace(' ', '-');
      links.stateGuides.push({
        url: `/resources/start-business/${stateSlug}`,
        label: `start a business in ${state.charAt(0).toUpperCase() + state.slice(1)}`,
      });
      break;
    }
  }

  // Get top cities for city page links (if location-related keyword and Supabase available)
  if (/city|cities|location|local|where/.test(lowerKeyword) && supabase) {
    try {
      const { data: cities } = await supabase
        .from('resource_locations')
        .select('slug, city, state')
        .order('listing_count', { ascending: false })
        .limit(3);

      if (cities) {
        for (const city of cities) {
          links.cityPages.push({
            url: `/resources/${city.slug}`,
            label: `${city.city}, ${city.state}`,
          });
        }
      }
    } catch {
      // Ignore city fetch errors
    }
  }

  // Find related blog posts (by shared keywords)
  const relatedPosts = existingPosts
    .filter((slug) => {
      // Don't link to welcome/announcement posts
      if (slug.includes('welcome') || slug.includes('announcement')) return false;
      return semanticOverlap(keyword, slug) > 0.2;
    })
    .slice(0, 2);

  for (const slug of relatedPosts) {
    links.otherBlogPosts.push({
      url: `/blog/${slug}`,
      label: slug.split('-').join(' '),
    });
  }

  return links;
}

async function main() {
  console.log('Blog Engine: Topic Selection');
  console.log('============================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No changes will be saved\n');
  }

  // Supabase is optional for topic selection (only used for city links)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabase: ReturnType<typeof createClient> | null = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.log('Note: Supabase not configured - city page links will be skipped');
  }

  // Load config and keyword pool
  const blogConfig: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const pool: KeywordPool = JSON.parse(fs.readFileSync(KEYWORD_POOL_PATH, 'utf-8'));

  console.log(`Keyword pool size: ${pool.keywords.length}`);

  if (pool.keywords.length === 0) {
    console.error('Error: Keyword pool is empty. Run discover-keywords.ts first.');
    process.exit(1);
  }

  // Get existing blog post slugs
  const existingPosts = await getExistingPostSlugs();
  console.log(`Existing blog posts: ${existingPosts.length}`);

  // Get cluster distribution of existing posts
  const existingClusters: string[] = [];
  for (const slug of existingPosts) {
    // Infer cluster from slug (rough approximation)
    existingClusters.push(getCluster(slug.split('-').join(' ')));
  }

  // Filter keywords
  console.log('\nFiltering keywords...');

  let filtered = pool.keywords.filter((kw) => {
    // Check exact slug match
    const slug = slugify(kw.keyword);
    if (existingPosts.includes(slug)) {
      return false;
    }

    // Check semantic overlap with existing posts
    for (const post of existingPosts) {
      if (semanticOverlap(kw.keyword, post) > 0.6) {
        return false;
      }
    }

    // Check cannibalization patterns
    if (matchesDirectoryPattern(kw.keyword)) {
      return false;
    }
    if (matchesStateGuidePattern(kw.keyword)) {
      return false;
    }

    return true;
  });

  console.log(`After filtering: ${filtered.length} keywords`);

  if (filtered.length === 0) {
    console.error('Error: No suitable keywords after filtering.');
    console.error('Run discover-keywords.ts to add more keywords to the pool.');
    process.exit(1);
  }

  // Score keywords
  console.log('Scoring keywords...');

  const scored = filtered.map((kw) => {
    const cluster = getCluster(kw.keyword);
    const clusterBonus = getClusterBonus(cluster, existingClusters, blogConfig.clusterWeights);
    const score = (kw.searchVolume / (kw.difficulty + 1)) * clusterBonus;

    return { ...kw, cluster, score };
  });

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Select top keyword
  const best = scored[0];
  console.log(`\nSelected keyword: "${best.keyword}"`);
  console.log(`  Search volume: ${best.searchVolume}`);
  console.log(`  Difficulty: ${best.difficulty}`);
  console.log(`  Cluster: ${best.cluster}`);
  console.log(`  Score: ${best.score.toFixed(2)}`);

  // Map internal links
  const internalLinks = await mapInternalLinks(best.keyword, supabase, existingPosts);

  console.log('\nInternal links mapped:');
  console.log(`  Category pages: ${internalLinks.categoryPages.length}`);
  console.log(`  City pages: ${internalLinks.cityPages.length}`);
  console.log(`  State guides: ${internalLinks.stateGuides.length}`);
  console.log(`  Related posts: ${internalLinks.otherBlogPosts.length}`);

  const selectedTopic: SelectedTopic = {
    keyword: best.keyword,
    slug: slugify(best.keyword),
    searchVolume: best.searchVolume,
    difficulty: best.difficulty,
    score: best.score,
    cluster: best.cluster,
    internalLinks,
    selectedAt: new Date().toISOString(),
  };

  if (isDryRun) {
    console.log('\nSelected topic (not saved):');
    console.log(JSON.stringify(selectedTopic, null, 2));
    console.log('\nDry run complete. Use without --dry-run to save.');
    return;
  }

  // Save selected topic
  fs.writeFileSync(SELECTED_TOPIC_PATH, JSON.stringify(selectedTopic, null, 2));
  console.log(`\nSelected topic saved to: ${SELECTED_TOPIC_PATH}`);

  // Show top 5 alternatives
  console.log('\nTop 5 alternatives:');
  scored.slice(1, 6).forEach((kw, i) => {
    console.log(`  ${i + 2}. "${kw.keyword}" (score: ${kw.score.toFixed(2)})`);
  });
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
