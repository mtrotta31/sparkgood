#!/usr/bin/env npx tsx
/**
 * Import federal small business grants from Grants.gov
 *
 * Uses the Grants.gov REST API (no authentication required)
 * Searches for grants relevant to small businesses, entrepreneurs, and startups
 *
 * Usage:
 *   npx tsx scripts/import-grants-gov.ts --dry-run
 *   npx tsx scripts/import-grants-gov.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// Grants.gov API endpoint
const GRANTS_API_URL = 'https://api.grants.gov/v1/api/search2';

// Search terms relevant to small businesses
// Prioritize SBIR/STTR and business-specific programs
const SEARCH_TERMS = [
  'SBIR', // Small Business Innovation Research - THE main federal small business program
  'STTR', // Small Business Technology Transfer
  'small business innovation',
  'small business development',
  'minority business enterprise',
  'women owned small business',
  'veteran owned small business',
  'rural business development',
  'economic development administration',
  'microenterprise',
  'small business grant',
  'business incubator',
  'entrepreneurship',
];

// Funding categories relevant to small businesses
// BC = Business and Commerce, CD = Community Development
// ELT = Employment/Labor/Training, RD = Regional Development
const BUSINESS_FUNDING_CATEGORIES = 'BC|CD|ELT|RD';

// Eligibility codes that include small businesses
// 23 = Small businesses
// 22 = For profit organizations other than small businesses
// 99 = Unrestricted
const SMALL_BUSINESS_ELIGIBILITIES = ['23', '22', '99'];

interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agencyCode: string;
  agency: string;
  openDate: string;
  closeDate: string;
  oppStatus: string;
  docType: string;
  cfdaList?: string[];
}

interface SearchResponse {
  errorcode: number;
  msg: string;
  data: {
    hitCount: number;
    oppHits: GrantsGovOpportunity[];
    eligibilities?: Array<{ label: string; value: string; count: number }>;
  };
}

interface GrantDetails {
  id: string;
  opportunityNumber: string;
  title: string;
  agency: string;
  agencyCode: string;
  openDate: string;
  closeDate: string;
  status: string;
  cfdaNumbers: string[];
  grantsGovUrl: string;
}

/**
 * Make a POST request to the Grants.gov API
 */
function searchGrants(params: Record<string, unknown>): Promise<SearchResponse> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);

    const url = new URL(GRANTS_API_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Search for grants with a specific keyword
 */
async function searchByKeyword(keyword: string, maxResults = 500): Promise<GrantsGovOpportunity[]> {
  const results: GrantsGovOpportunity[] = [];
  let startRecord = 0;
  const pageSize = 100;

  while (results.length < maxResults) {
    const response = await searchGrants({
      keyword,
      oppStatuses: 'forecasted|posted', // Only open or upcoming opportunities
      rows: pageSize,
      startRecordNum: startRecord,
    });

    if (response.errorcode !== 0) {
      console.error(`  API error for "${keyword}": ${response.msg}`);
      break;
    }

    const hits = response.data.oppHits || [];
    if (hits.length === 0) break;

    results.push(...hits);
    startRecord += pageSize;

    // Check if we've fetched all results
    if (results.length >= response.data.hitCount) break;

    // Rate limiting - be nice to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/**
 * Search specifically for small business eligible grants
 */
async function searchSmallBusinessGrants(maxResults = 500): Promise<GrantsGovOpportunity[]> {
  const results: GrantsGovOpportunity[] = [];
  let startRecord = 0;
  const pageSize = 100;

  while (results.length < maxResults) {
    const response = await searchGrants({
      oppStatuses: 'forecasted|posted',
      eligibilities: '23', // Small businesses eligibility
      rows: pageSize,
      startRecordNum: startRecord,
    });

    if (response.errorcode !== 0) {
      console.error(`  API error for eligibility search: ${response.msg}`);
      break;
    }

    const hits = response.data.oppHits || [];
    if (hits.length === 0) break;

    results.push(...hits);
    startRecord += pageSize;

    if (results.length >= response.data.hitCount) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/**
 * Search for grants by funding category
 */
async function searchByFundingCategory(maxResults = 200): Promise<GrantsGovOpportunity[]> {
  const results: GrantsGovOpportunity[] = [];
  let startRecord = 0;
  const pageSize = 100;

  while (results.length < maxResults) {
    const response = await searchGrants({
      oppStatuses: 'forecasted|posted',
      fundingCategories: BUSINESS_FUNDING_CATEGORIES,
      rows: pageSize,
      startRecordNum: startRecord,
    });

    if (response.errorcode !== 0) {
      console.error(`  API error for category search: ${response.msg}`);
      break;
    }

    const hits = response.data.oppHits || [];
    if (hits.length === 0) break;

    results.push(...hits);
    startRecord += pageSize;

    if (results.length >= response.data.hitCount) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/**
 * Check if a grant is relevant for small business entrepreneurs
 * Filter out grants that aren't actually useful for typical small businesses
 */
function isRelevantForSmallBusiness(grant: GrantsGovOpportunity): boolean {
  const title = grant.title.toLowerCase();
  const oppNumber = grant.number.toLowerCase();

  // Always include SBIR/STTR grants - these are THE small business programs
  // These should be included even if they mention clinical trials
  if (title.includes('sbir') || title.includes('sttr') ||
      oppNumber.includes('sbir') || oppNumber.includes('sttr') ||
      title.includes('small business innovation research') ||
      title.includes('small business technology transfer')) {
    return true;
  }

  // Include grants with these keywords (strong indicators)
  const strongKeywords = [
    'small business',
    'entrepreneur',
    'minority business',
    'women owned',
    'women-owned',
    'veteran business',
    'veteran owned',
    'veteran-owned',
    'rural business',
    'microenterprise',
    'business incubator',
    'business accelerator',
    'startup',
    'economic development',
  ];

  if (strongKeywords.some(kw => title.includes(kw))) {
    // But exclude clinical trials that just happen to mention small business
    // unless it's specifically an SBIR/STTR program
    if (!title.includes('sbir') && !title.includes('sttr')) {
      const isClinicalTrial = title.includes('r01 ') || title.includes('r21 ') ||
        title.includes('r34 ') || title.includes('r43 ') || title.includes('r44 ') ||
        (title.includes('clinical trial') && !title.includes('business'));
      if (isClinicalTrial) {
        return false;
      }
    }
    return true;
  }

  // Include if it's from a business-focused agency
  const businessAgencies = [
    'SBA', 'EDA', 'RBCS', 'DOC-EDA', 'DOL-ETA',
    'Rural Business', 'Economic Development', 'Administration for Community Living',
    'Employment and Training',
  ];

  if (businessAgencies.some(agency =>
    grant.agency.includes(agency) || grant.agencyCode.includes(agency))) {
    return true;
  }

  // Include grants with business development keywords
  const businessKeywords = [
    'business development',
    'workforce development',
    'job creation',
    'job training',
    'capacity building',
    'technical assistance',
    'commerce',
    'trade promotion',
  ];

  if (businessKeywords.some(kw => title.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * Convert Grants.gov opportunity to our listing format
 */
function convertToListing(opp: GrantsGovOpportunity): GrantDetails {
  // Construct the grants.gov URL
  const grantsGovUrl = `https://www.grants.gov/search-results-detail/${opp.id}`;

  return {
    id: opp.id,
    opportunityNumber: opp.number,
    title: opp.title,
    agency: opp.agency,
    agencyCode: opp.agencyCode,
    openDate: opp.openDate,
    closeDate: opp.closeDate,
    status: opp.oppStatus,
    cfdaNumbers: opp.cfdaList || [],
    grantsGovUrl,
  };
}

/**
 * Generate URL-safe slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Format date from MM/DD/YYYY to YYYY-MM-DD or return null
 */
function formatDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Clean up HTML entities in title
 */
function cleanTitle(title: string): string {
  return title
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function main() {
  console.log('='.repeat(60));
  console.log('Grants.gov Federal Grant Import');
  console.log('='.repeat(60));
  console.log();

  if (DRY_RUN) {
    console.log('*** DRY RUN MODE - No changes will be saved to database ***\n');
  }

  // Collect all grants from different searches
  const allGrants = new Map<string, GrantsGovOpportunity>();

  // 1. Search by business-related funding categories
  console.log('Searching by business funding categories (BC, CD, ELT, RD)...');
  const categoryGrants = await searchByFundingCategory(200);
  console.log(`  Found ${categoryGrants.length} grants in business categories`);
  for (const grant of categoryGrants) {
    allGrants.set(grant.id, grant);
  }

  // 2. Search by keywords
  console.log('\nSearching by keywords...');
  for (const keyword of SEARCH_TERMS) {
    console.log(`  Searching: "${keyword}"...`);
    const results = await searchByKeyword(keyword, 100);
    console.log(`    Found ${results.length} grants`);

    for (const grant of results) {
      if (!allGrants.has(grant.id)) {
        allGrants.set(grant.id, grant);
      }
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nTotal unique grants found: ${allGrants.size}`);

  // 3. Filter to only relevant grants for small businesses
  console.log('\nFiltering for relevance to small business entrepreneurs...');
  const relevantGrants = Array.from(allGrants.values()).filter(isRelevantForSmallBusiness);
  console.log(`  Relevant grants after filtering: ${relevantGrants.length}`);

  // Convert to listing format
  const grants = relevantGrants.map(convertToListing);

  // Show some examples - pick a diverse set
  console.log('\n' + '-'.repeat(60));
  console.log('Sample Grants:');
  console.log('-'.repeat(60));

  // Find SBIR/STTR grants for samples
  const sbirGrants = grants.filter(g =>
    g.title.toLowerCase().includes('sbir') ||
    g.title.toLowerCase().includes('sttr') ||
    g.title.toLowerCase().includes('small business innovation')
  );
  const otherGrants = grants.filter(g =>
    !g.title.toLowerCase().includes('sbir') &&
    !g.title.toLowerCase().includes('sttr') &&
    !g.title.toLowerCase().includes('small business innovation')
  );

  // Show a mix
  const samples = [
    ...sbirGrants.slice(0, 3),
    ...otherGrants.slice(0, 4),
  ].slice(0, 7);

  for (const grant of samples) {
    console.log(`\nTitle: ${cleanTitle(grant.title).slice(0, 100)}${grant.title.length > 100 ? '...' : ''}`);
    console.log(`  Agency: ${grant.agency}`);
    console.log(`  Opportunity #: ${grant.opportunityNumber}`);
    console.log(`  Status: ${grant.status}`);
    console.log(`  Open Date: ${grant.openDate}`);
    console.log(`  Close Date: ${grant.closeDate || 'None specified'}`);
    console.log(`  URL: ${grant.grantsGovUrl}`);
  }

  // Show breakdown by type
  console.log('\n' + '-'.repeat(60));
  console.log('Grant Type Breakdown:');
  console.log('-'.repeat(60));
  console.log(`  SBIR/STTR grants: ${sbirGrants.length}`);
  console.log(`  Other business grants: ${otherGrants.length}`);

  if (DRY_RUN) {
    console.log('\n' + '='.repeat(60));
    console.log('DRY RUN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Would import ${grants.length} grants`);
    console.log('\nTo import for real, run without --dry-run flag');
    return;
  }

  // Get existing grants to check for duplicates
  console.log('\n' + '-'.repeat(60));
  console.log('Checking for existing grants...');
  console.log('-'.repeat(60));

  const { data: existingGrants } = await supabase
    .from('resource_listings')
    .select('name, slug')
    .eq('category', 'grant')
    .eq('is_active', true);

  const existingNames = new Set(
    (existingGrants || []).map((g) => g.name.toLowerCase())
  );
  const existingSlugs = new Set(
    (existingGrants || []).map((g) => g.slug)
  );

  console.log(`  Found ${existingNames.size} existing grants in database`);

  // Filter out duplicates and prepare for import
  const newGrants: Array<{
    name: string;
    slug: string;
    category: string;
    city: string;
    state: string;
    description: string;
    website: string;
    is_active: boolean;
    details: Record<string, unknown>;
  }> = [];

  let duplicates = 0;

  for (const grant of grants) {
    const name = cleanTitle(grant.title);

    // Check if already exists (case-insensitive name match)
    if (existingNames.has(name.toLowerCase())) {
      duplicates++;
      continue;
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugSuffix = 1;
    while (existingSlugs.has(slug)) {
      slug = `${generateSlug(name)}-${slugSuffix}`;
      slugSuffix++;
    }
    existingSlugs.add(slug);

    // Create description
    const description = `${name} is a federal funding opportunity from ${grant.agency}. ` +
      `This ${grant.status === 'posted' ? 'open' : 'forecasted'} grant opportunity ` +
      `(${grant.opportunityNumber}) is available nationwide for eligible applicants.`;

    newGrants.push({
      name,
      slug,
      category: 'grant',
      city: 'Nationwide',
      state: 'US',
      description,
      website: grant.grantsGovUrl,
      is_active: true,
      details: {
        opportunity_number: grant.opportunityNumber,
        agency: grant.agency,
        agency_code: grant.agencyCode,
        status: grant.status,
        open_date: formatDate(grant.openDate),
        close_date: formatDate(grant.closeDate),
        cfda_numbers: grant.cfdaNumbers,
        grants_gov_id: grant.id,
        grants_gov_url: grant.grantsGovUrl,
        source: 'grants.gov',
      },
    });
  }

  console.log(`  New grants to import: ${newGrants.length}`);
  console.log(`  Duplicates skipped: ${duplicates}`);

  if (newGrants.length === 0) {
    console.log('\nNo new grants to import.');
    return;
  }

  // Import in batches
  console.log('\n' + '-'.repeat(60));
  console.log('Importing grants...');
  console.log('-'.repeat(60));

  const batchSize = 50;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < newGrants.length; i += batchSize) {
    const batch = newGrants.slice(i, i + batchSize);

    const { error } = await supabase
      .from('resource_listings')
      .insert(batch);

    if (error) {
      console.error(`  Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`  Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newGrants.length / batchSize)} (${batch.length} grants)`);
    }
  }

  // Create/update the "Nationwide" location
  console.log('\nUpdating Nationwide location...');

  const { data: nationwideLocation } = await supabase
    .from('resource_locations')
    .select('id')
    .eq('city', 'Nationwide')
    .eq('state', 'US')
    .single();

  if (!nationwideLocation) {
    const { error: locError } = await supabase
      .from('resource_locations')
      .insert({
        city: 'Nationwide',
        state: 'US',
        slug: 'nationwide-us',
        grant_count: newGrants.length,
      });

    if (locError) {
      console.log(`  Warning: Could not create Nationwide location: ${locError.message}`);
    } else {
      console.log('  Created Nationwide location');
    }
  } else {
    // Update the grant count
    const { count } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'grant')
      .eq('city', 'Nationwide')
      .eq('state', 'US')
      .eq('is_active', true);

    await supabase
      .from('resource_locations')
      .update({ grant_count: count })
      .eq('id', nationwideLocation.id);

    console.log(`  Updated Nationwide location (${count} grants)`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Total grants found: ${grants.length}`);
  console.log(`  Duplicates skipped: ${duplicates}`);
  console.log(`  Successfully imported: ${imported}`);
  console.log(`  Errors: ${errors}`);

  // Show current grant totals
  const { count: totalGrants } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'grant')
    .eq('is_active', true);

  console.log(`\n  Total grants in database: ${totalGrants}`);
}

main().catch(console.error);
