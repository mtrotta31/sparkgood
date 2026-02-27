import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * SparkLocal Content Enrichment Script (SEO)
 *
 * Generates AI-powered descriptions, FAQs, and key details for:
 * - Resource listings (coworking, grants, accelerators, SBA)
 * - City hub pages
 *
 * Uses Claude Haiku for cost-effective bulk content generation.
 *
 * Usage:
 *   npx tsx scripts/enrich-content-seo.ts
 *     --mode listings|cities|all     (what to enrich)
 *     --batch-size 50                (default 50)
 *     --category coworking|grant|accelerator|sba  (optional filter)
 *     --city "new-york-ny"           (optional, single city slug)
 *     --force                        (re-enrich already enriched items)
 *     --dry-run                      (preview without DB writes)
 *
 * Examples:
 *   npx tsx scripts/enrich-content-seo.ts --mode listings --batch-size 10 --category coworking --dry-run
 *   npx tsx scripts/enrich-content-seo.ts --mode cities --batch-size 20
 *   npx tsx scripts/enrich-content-seo.ts --mode all --force
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// CONFIG
// ============================================================================

const MODEL = 'claude-haiku-4-5-20251001';
const DELAY_MS = 200;
const MAX_TOKENS = 2000;

// ============================================================================
// SUPABASE SETUP
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!anthropicKey) {
  console.error('Error: Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

// ============================================================================
// TYPES
// ============================================================================

interface CLIArgs {
  mode: 'listings' | 'cities' | 'all';
  batchSize: number;
  category?: string;
  city?: string;
  force: boolean;
  dryRun: boolean;
}

interface ListingRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: string;
  subcategories?: string[];
  cause_areas?: string[];
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  details?: Record<string, unknown>;
  enrichment_data?: Record<string, unknown>;
  enrichment_status?: string;
  is_nationwide?: boolean;
}

interface CityRecord {
  id: string;
  city: string;
  state: string;
  slug: string;
  population?: number;
  listing_count: number;
  ai_city_intro?: string;
  enrichment_status?: string;
  coworking_count?: number;
  grant_count?: number;
  accelerator_count?: number;
  sba_count?: number;
}

interface EnrichmentResult {
  ai_description?: string;
  ai_faqs?: Array<{ question: string; answer: string }>;
  ai_key_details?: Record<string, string>;
}

interface CityEnrichmentResult {
  ai_city_intro: string;
  ai_city_faqs: Array<{ question: string; answer: string }>;
  ai_city_tips: string;
}

interface Stats {
  enriched: number;
  failed: number;
  skipped: number;
}

// ============================================================================
// CLI PARSING
// ============================================================================

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = {
    mode: 'listings',
    batchSize: 50,
    force: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--mode':
        if (next && ['listings', 'cities', 'all'].includes(next)) {
          result.mode = next as 'listings' | 'cities' | 'all';
          i++;
        } else {
          console.error('Error: --mode must be one of: listings, cities, all');
          process.exit(1);
        }
        break;
      case '--batch-size':
        if (next && !isNaN(parseInt(next))) {
          result.batchSize = parseInt(next);
          i++;
        }
        break;
      case '--category':
        if (next) {
          result.category = next;
          i++;
        }
        break;
      case '--city':
        if (next) {
          result.city = next;
          i++;
        }
        break;
      case '--force':
        result.force = true;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
    }
  }

  return result;
}

// ============================================================================
// PROMPTS
// ============================================================================

function getCoworkingPrompt(listing: ListingRecord): string {
  const details = listing.details || {};
  return `You are writing SEO content for a business resource directory. Generate content for this coworking space listing. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: ${listing.name}
City: ${listing.city || 'N/A'}, ${listing.state || 'N/A'}
Address: ${listing.address || 'N/A'}
Phone: ${listing.phone || 'N/A'}
Rating: ${details.rating || 'N/A'}
Hours: ${details.hours || 'N/A'}
Amenities: ${Array.isArray(details.amenities) ? details.amenities.join(', ') : 'N/A'}
Price range: ${details.price_monthly_min ? `From $${details.price_monthly_min}/mo` : 'N/A'}
Existing description: ${listing.description || listing.short_description || 'None'}

RULES:
- Be specific to THIS listing — don't write generic coworking content
- Do NOT invent pricing, membership tiers, or amenities not listed above
- If data is limited, write based on what's available and the location
- Mention the neighborhood/area based on the address

OUTPUT FORMAT:
{
  "ai_description": "Write at least 180 words. Describe what this space offers, who it's ideal for, and what makes it useful for entrepreneurs and small business owners in this area.",
  "ai_faqs": [
    { "question": "What type of workspace does ${listing.name} offer?", "answer": "2-3 sentences" },
    { "question": "Where is ${listing.name} located in ${listing.city || 'this city'}?", "answer": "2-3 sentences about location and access" },
    { "question": "Is ${listing.name} suitable for startup founders?", "answer": "2-3 sentences" },
    { "question": "What are the hours at ${listing.name}?", "answer": "Based on data or 'Contact directly for current hours'" }
  ],
  "ai_key_details": {
    "workspace_type": "Coworking Space",
    "best_for": "e.g., Freelancers, startups, remote teams",
    "neighborhood": "e.g., Midtown Manhattan"
  }
}`;
}

function getGrantPrompt(listing: ListingRecord): string {
  const details = listing.details || {};
  const location = listing.is_nationwide ? 'Nationwide' : `${listing.city || 'N/A'}, ${listing.state || 'N/A'}`;
  const amountMin = details.amount_min ? `$${Number(details.amount_min).toLocaleString()}` : 'N/A';
  const amountMax = details.amount_max ? `$${Number(details.amount_max).toLocaleString()}` : 'N/A';

  return `You are writing SEO content for a business resource directory. Generate content for this grant program. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: ${listing.name}
Location: ${location}
Existing description: ${listing.description || listing.short_description || 'None'}
Amount: ${amountMin} - ${amountMax}
Deadline: ${details.deadline || 'N/A'}
Eligibility: ${details.eligibility || 'N/A'}
Cause areas: ${listing.cause_areas?.join(', ') || 'N/A'}

RULES:
- Be specific to THIS grant program
- Do NOT invent deadlines, amounts, or eligibility criteria not provided
- If data is limited, write based on the name and any existing description
- Direct readers to the official website for current details

OUTPUT FORMAT:
{
  "ai_description": "Write at least 180 words. Describe who this grant is for, what it funds, and why entrepreneurs should apply.",
  "ai_faqs": [
    { "question": "Who is eligible for ${listing.name}?", "answer": "Based on available info, or direct to official website" },
    { "question": "How much funding does ${listing.name} provide?", "answer": "Use provided amounts or 'Varies by cycle'" },
    { "question": "How do I apply for ${listing.name}?", "answer": "General guidance + direct to official website" },
    { "question": "What can ${listing.name} funding be used for?", "answer": "Based on available info" }
  ],
  "ai_key_details": {
    "grant_type": "e.g., Federal, Corporate, Foundation",
    "funding_range": "e.g., Up to $50,000",
    "best_for": "e.g., Minority-owned businesses, social enterprises",
    "application_type": "e.g., Rolling, Annual, Quarterly"
  }
}`;
}

function getAcceleratorPrompt(listing: ListingRecord): string {
  const details = listing.details || {};
  const focusAreas = listing.cause_areas?.join(', ') || listing.subcategories?.join(', ') || 'N/A';

  return `You are writing SEO content for a business resource directory. Generate content for this accelerator/incubator. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: ${listing.name}
City: ${listing.city || 'N/A'}, ${listing.state || 'N/A'}
Existing description: ${listing.description || listing.short_description || 'None'}
Funding amount: ${details.funding_provided ? `$${Number(details.funding_provided).toLocaleString()}` : 'N/A'}
Equity: ${details.equity_taken !== undefined ? `${details.equity_taken}%` : 'N/A'}
Duration: ${details.duration_weeks ? `${details.duration_weeks} weeks` : 'N/A'}
Focus areas: ${focusAreas}

RULES:
- Be specific to THIS program
- Do NOT invent batch sizes, equity terms, or details not provided
- If limited data, write based on name and available info

OUTPUT FORMAT:
{
  "ai_description": "Write at least 180 words. Describe what the program offers, its focus, and why founders should consider it.",
  "ai_faqs": [
    { "question": "What does ${listing.name} offer startups?", "answer": "2-3 sentences" },
    { "question": "What types of startups does ${listing.name} accept?", "answer": "Based on focus areas" },
    { "question": "Does ${listing.name} provide funding?", "answer": "Use provided amount or 'Contact for details'" },
    { "question": "How do I apply to ${listing.name}?", "answer": "General guidance" }
  ],
  "ai_key_details": {
    "program_type": "Accelerator or Incubator",
    "focus": "e.g., FoodTech, Social Impact",
    "funding": "e.g., $150K or N/A",
    "best_for": "e.g., Early-stage, pre-seed founders"
  }
}`;
}

function getSBAPrompt(listing: ListingRecord): string {
  const details = listing.details || {};
  const sbaType = details.sba_type || listing.subcategories?.[0] || 'SBA Resource';

  return `You are writing SEO content for a business resource directory. Generate content for this SBA resource center. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: ${listing.name}
City: ${listing.city || 'N/A'}, ${listing.state || 'N/A'}
Type: ${sbaType} (SBDC, SCORE, WBC, VBOC)
Existing description: ${listing.description || listing.short_description || 'None'}

RULES:
- Be specific to this center and its SBA program type
- Explain what SBDC/SCORE/WBC/VBOC means and its specific value
- Most SBA services are free — highlight this

OUTPUT FORMAT:
{
  "ai_description": "Write at least 180 words. Describe what services this center provides, who it serves, and how it helps local entrepreneurs. Explain the SBA program type.",
  "ai_faqs": [
    { "question": "What services does ${listing.name} provide?", "answer": "Based on program type" },
    { "question": "Is ${listing.name} free to use?", "answer": "Explain SBA resource cost structure" },
    { "question": "Who can use ${listing.name}?", "answer": "Eligibility" },
    { "question": "How do I get started with ${listing.name}?", "answer": "Steps to access services" }
  ],
  "ai_key_details": {
    "program_type": "e.g., SCORE Chapter, SBDC, Women's Business Center",
    "services": "e.g., Free mentoring, business plan review, workshops",
    "cost": "Free",
    "best_for": "e.g., First-time business owners, women entrepreneurs"
  }
}`;
}

function getCityPrompt(city: CityRecord): string {
  return `You are writing SEO content for a city page about starting a business. Generate content about starting a business in this specific city. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

CITY: ${city.city}, ${city.state}
POPULATION: ${city.population?.toLocaleString() || 'N/A'}

RULES:
- Be SPECIFIC to this city — don't write generic advice
- Mention real industries, neighborhoods, and characteristics of this city
- Do NOT mention specific resource counts or any website/platform by name
- Use factual information you're confident about
- If this is a smaller/less-known city, focus on state-level context and local advantages
- Write in a neutral, informative tone suitable for any business resource website

OUTPUT FORMAT:
{
  "ai_city_intro": "200-300 word introduction about starting a business in ${city.city}, ${city.state}. Cover: local economy and key industries, entrepreneurial ecosystem, cost of living relative to other cities, notable business districts or startup hubs. Do NOT mention specific resource counts or website names.",
  "ai_city_faqs": [
    { "question": "What do I need to start a business in ${city.city}, ${city.state}?", "answer": "3-4 sentences: business registration, licenses, local requirements" },
    { "question": "What industries are growing in ${city.city}?", "answer": "Specific to this city" },
    { "question": "Are there grants for small businesses in ${city.city}?", "answer": "General info about state/local grant programs" },
    { "question": "Where can I find coworking space in ${city.city}?", "answer": "Mention popular neighborhoods and general coworking scene" },
    { "question": "What free business help is available in ${city.city}?", "answer": "Mention SBA, SCORE, SBDC, and local resources" },
    { "question": "Is ${city.city} a good place to start a business?", "answer": "Balanced, factual assessment" }
  ],
  "ai_city_tips": "5 numbered practical tips for entrepreneurs in ${city.city}. Be specific — mention real neighborhoods, local programs, or unique city characteristics. Do NOT mention specific resource counts. Format as: 1. Tip one... 2. Tip two... etc."
}`;
}

function getPromptForCategory(listing: ListingRecord): string {
  switch (listing.category) {
    case 'coworking':
      return getCoworkingPrompt(listing);
    case 'grant':
      return getGrantPrompt(listing);
    case 'accelerator':
    case 'incubator':
      return getAcceleratorPrompt(listing);
    case 'sba':
      return getSBAPrompt(listing);
    default:
      // Default to coworking-style for unknown categories
      return getCoworkingPrompt(listing);
  }
}

// ============================================================================
// API CALLS
// ============================================================================

async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type from Claude');
}

function parseJSON<T>(text: string): T {
  // Remove any markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// LISTING ENRICHMENT
// ============================================================================

async function fetchListingsToEnrich(
  supabase: SupabaseClient,
  args: CLIArgs
): Promise<ListingRecord[]> {
  let query = supabase
    .from('resource_listings')
    .select(
      'id, name, slug, description, short_description, category, subcategories, cause_areas, address, city, state, phone, website, details, enrichment_data, enrichment_status, is_nationwide'
    )
    .eq('is_active', true);

  // Filter by category if specified
  if (args.category) {
    query = query.eq('category', args.category);
  }

  // Filter by city if specified (need to look up city/state from slug)
  if (args.city) {
    const { data: location } = await supabase
      .from('resource_locations')
      .select('city, state')
      .eq('slug', args.city)
      .single();

    if (location) {
      query = query.eq('city', location.city).eq('state', location.state);
    } else {
      console.error(`Error: City slug '${args.city}' not found in resource_locations`);
      process.exit(1);
    }
  }

  // Only get un-enriched records unless --force
  if (!args.force) {
    // Records where ai_description is null or missing from enrichment_data
    query = query.or('enrichment_data.is.null,enrichment_data->ai_description.is.null');
  }

  query = query.order('category').order('city').limit(args.batchSize);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error.message);
    return [];
  }

  return data || [];
}

async function enrichListing(
  listing: ListingRecord,
  args: CLIArgs
): Promise<{ success: boolean; data?: EnrichmentResult; error?: string }> {
  try {
    const prompt = getPromptForCategory(listing);
    const response = await callClaude(prompt);
    const parsed = parseJSON<EnrichmentResult>(response);

    if (!parsed.ai_description || !parsed.ai_faqs) {
      return { success: false, error: 'Missing required fields in response' };
    }

    return { success: true, data: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

async function saveListingEnrichment(
  supabase: SupabaseClient,
  listingId: string,
  existingEnrichmentData: Record<string, unknown> | undefined,
  newData: EnrichmentResult
): Promise<boolean> {
  // Merge new AI data with existing enrichment_data (preserve Perplexity data)
  const mergedEnrichmentData = {
    ...(existingEnrichmentData || {}),
    ...newData,
  };

  const { error } = await supabase
    .from('resource_listings')
    .update({
      enrichment_data: mergedEnrichmentData,
      enrichment_status: 'enriched',
      last_enriched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  return !error;
}

async function processListings(args: CLIArgs, stats: Stats): Promise<void> {
  console.log('');
  console.log('Fetching listings to enrich...');

  const listings = await fetchListingsToEnrich(supabase, args);

  if (listings.length === 0) {
    console.log('  No listings found matching criteria.');
    return;
  }

  console.log(`  Found ${listings.length} listings to process.`);
  console.log('');

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const progress = `[${i + 1}/${listings.length}]`;

    const result = await enrichListing(listing, args);

    if (result.success && result.data) {
      if (args.dryRun) {
        console.log(`${progress} [DRY-RUN] Would enrich: ${listing.name} - ${listing.city || 'N/A'}, ${listing.state || 'N/A'}`);
        console.log('  Category:', listing.category);
        console.log('  AI Description preview:', result.data.ai_description?.substring(0, 100) + '...');
        console.log('  FAQs:', result.data.ai_faqs?.length || 0);
        console.log('  Key Details:', JSON.stringify(result.data.ai_key_details || {}));
        console.log('');
        stats.enriched++;
      } else {
        const saved = await saveListingEnrichment(
          supabase,
          listing.id,
          listing.enrichment_data,
          result.data
        );

        if (saved) {
          console.log(`${progress} Enriched: ${listing.name} - ${listing.city || 'N/A'}, ${listing.state || 'N/A'}`);
          stats.enriched++;
        } else {
          console.error(`${progress} Failed to save: ${listing.name}`);
          stats.failed++;
        }
      }
    } else {
      console.error(`${progress} Failed: ${listing.name} - ${result.error}`);
      stats.failed++;
    }

    // Delay between API calls
    if (i < listings.length - 1) {
      await sleep(DELAY_MS);
    }
  }
}

// ============================================================================
// CITY ENRICHMENT
// ============================================================================

async function fetchCitiesToEnrich(
  supabase: SupabaseClient,
  args: CLIArgs
): Promise<CityRecord[]> {
  // First, get cities with their resource counts using a subquery approach
  let query = supabase
    .from('resource_locations')
    .select('id, city, state, slug, population, listing_count, ai_city_intro, enrichment_status');

  // Filter by city slug if specified
  if (args.city) {
    query = query.eq('slug', args.city);
  }

  // Only get un-enriched records unless --force
  if (!args.force) {
    query = query.is('ai_city_intro', null);
  }

  query = query.order('listing_count', { ascending: false }).limit(args.batchSize);

  const { data: cities, error } = await query;

  if (error) {
    console.error('Error fetching cities:', error.message);
    return [];
  }

  if (!cities || cities.length === 0) {
    return [];
  }

  // Now get counts for each city
  const citiesWithCounts: CityRecord[] = [];

  for (const city of cities) {
    const { count: coworkingCount } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', city.city)
      .eq('state', city.state)
      .eq('category', 'coworking')
      .eq('is_active', true);

    const { count: grantCount } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', city.city)
      .eq('state', city.state)
      .eq('category', 'grant')
      .eq('is_active', true);

    const { count: acceleratorCount } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', city.city)
      .eq('state', city.state)
      .or('category.eq.accelerator,category.eq.incubator')
      .eq('is_active', true);

    const { count: sbaCount } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('city', city.city)
      .eq('state', city.state)
      .eq('category', 'sba')
      .eq('is_active', true);

    citiesWithCounts.push({
      ...city,
      coworking_count: coworkingCount || 0,
      grant_count: grantCount || 0,
      accelerator_count: acceleratorCount || 0,
      sba_count: sbaCount || 0,
    });
  }

  return citiesWithCounts;
}

async function enrichCity(
  city: CityRecord
): Promise<{ success: boolean; data?: CityEnrichmentResult; error?: string }> {
  try {
    const prompt = getCityPrompt(city);
    const response = await callClaude(prompt);
    const parsed = parseJSON<CityEnrichmentResult>(response);

    if (!parsed.ai_city_intro || !parsed.ai_city_faqs || !parsed.ai_city_tips) {
      return { success: false, error: 'Missing required fields in response' };
    }

    return { success: true, data: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

async function saveCityEnrichment(
  supabase: SupabaseClient,
  cityId: string,
  data: CityEnrichmentResult
): Promise<boolean> {
  const { error } = await supabase
    .from('resource_locations')
    .update({
      ai_city_intro: data.ai_city_intro,
      ai_city_faqs: data.ai_city_faqs,
      ai_city_tips: data.ai_city_tips,
      enrichment_status: 'enriched',
      last_enriched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', cityId);

  return !error;
}

async function processCities(args: CLIArgs, stats: Stats): Promise<void> {
  console.log('');
  console.log('Fetching cities to enrich...');

  const cities = await fetchCitiesToEnrich(supabase, args);

  if (cities.length === 0) {
    console.log('  No cities found matching criteria.');
    return;
  }

  console.log(`  Found ${cities.length} cities to process.`);
  console.log('');

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const progress = `[${i + 1}/${cities.length}]`;

    const result = await enrichCity(city);

    if (result.success && result.data) {
      if (args.dryRun) {
        console.log(`${progress} [DRY-RUN] Would enrich: ${city.city}, ${city.state}`);
        console.log('  Population:', city.population?.toLocaleString() || 'N/A');
        console.log('  Resources:', city.coworking_count, 'coworking,', city.grant_count, 'grants,', city.sba_count, 'SBA');
        console.log('  Intro preview:', result.data.ai_city_intro?.substring(0, 100) + '...');
        console.log('  FAQs:', result.data.ai_city_faqs?.length || 0);
        console.log('  Tips preview:', result.data.ai_city_tips?.substring(0, 80) + '...');
        console.log('');
        stats.enriched++;
      } else {
        const saved = await saveCityEnrichment(supabase, city.id, result.data);

        if (saved) {
          console.log(`${progress} Enriched: ${city.city}, ${city.state}`);
          stats.enriched++;
        } else {
          console.error(`${progress} Failed to save: ${city.city}, ${city.state}`);
          stats.failed++;
        }
      }
    } else {
      console.error(`${progress} Failed: ${city.city}, ${city.state} - ${result.error}`);
      stats.failed++;
    }

    // Delay between API calls
    if (i < cities.length - 1) {
      await sleep(DELAY_MS);
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = parseArgs();

  console.log('='.repeat(60));
  console.log('SparkLocal Content Enrichment (SEO)');
  console.log('='.repeat(60));
  console.log('');
  console.log('Configuration:');
  console.log(`  Mode: ${args.mode}`);
  console.log(`  Batch size: ${args.batchSize}`);
  console.log(`  Category filter: ${args.category || 'all'}`);
  console.log(`  City filter: ${args.city || 'all'}`);
  console.log(`  Force re-enrich: ${args.force}`);
  console.log(`  Dry run: ${args.dryRun}`);
  console.log(`  Model: ${MODEL}`);

  if (args.dryRun) {
    console.log('');
    console.log('*** DRY RUN MODE - No changes will be saved to database ***');
  }

  const stats: Stats = { enriched: 0, failed: 0, skipped: 0 };

  // Process listings
  if (args.mode === 'listings' || args.mode === 'all') {
    console.log('');
    console.log('-'.repeat(60));
    console.log('Processing Listings');
    console.log('-'.repeat(60));
    await processListings(args, stats);
  }

  // Process cities
  if (args.mode === 'cities' || args.mode === 'all') {
    console.log('');
    console.log('-'.repeat(60));
    console.log('Processing Cities');
    console.log('-'.repeat(60));
    await processCities(args, stats);
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Enriched: ${stats.enriched}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log('');

  if (args.dryRun) {
    console.log('(Dry run complete - no changes were made to the database)');
  }
}

main().catch(console.error);
