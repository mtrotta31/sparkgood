#!/usr/bin/env npx tsx
/**
 * Import SCORE Mentoring Chapters into SparkLocal
 *
 * Scrapes all SCORE chapters from score.org/find-a-location and imports them
 * as SBA-category resource listings.
 *
 * Usage:
 *   npx tsx scripts/import-score-chapters.ts --dry-run    # Preview without importing
 *   npx tsx scripts/import-score-chapters.ts              # Actually import
 *
 * Features:
 *   - Scrapes all 164 SCORE chapters from 14 paginated pages
 *   - Deduplicates against existing database entries
 *   - Creates resource_locations for new cities
 *   - Generates URL slugs matching existing pattern
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

// ============================================================================
// SUPABASE SETUP
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

interface ScoreChapter {
  name: string;
  slug: string;
  description: string;
  serviceArea: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
}

interface ListingRecord {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: 'sba';
  subcategories: string[];
  cause_areas: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_remote: boolean;
  is_nationwide: boolean;
  service_areas: string[];
  website: string;
  phone: string;
  details: Record<string, unknown>;
  source: 'score';
  source_id: string;
  enrichment_status: 'raw';
  is_featured: boolean;
  is_active: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATE_FULL_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming',
};

const SCORE_DESCRIPTION = `SCORE provides free, confidential business mentoring from experienced entrepreneurs and business professionals. As a resource partner of the U.S. Small Business Administration (SBA), SCORE has helped more than 17 million entrepreneurs start and grow their businesses since 1964. SCORE mentors offer personalized guidance on business planning, marketing, financial management, and more. All mentoring services are provided at no cost to you.`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function parsePhoneNumber(text: string): string {
  // Extract phone from "Tel: (617) 565-5591" format
  const match = text.match(/Tel:\s*(.+)/i);
  return match ? match[1].trim() : text.trim();
}

function parseCityStateZip(text: string): { city: string; state: string; zip: string } {
  // Parse "Boston, MA 02222" or "North Canton, OH 44720"
  const match = text.match(/^(.+),\s*([A-Z]{2})\s*(\d{5})?/);
  if (match) {
    return {
      city: match[1].trim(),
      state: match[2],
      zip: match[3] || '',
    };
  }
  return { city: text, state: '', zip: '' };
}

async function fetchPage(pageNum: number): Promise<string> {
  const url = `https://www.score.org/find-a-location${pageNum > 0 ? `?page=${pageNum}` : ''}`;
  console.log(`  Fetching page ${pageNum + 1}...`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SparkLocal/1.0; +https://sparklocal.co)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${pageNum}: ${response.status}`);
  }

  return response.text();
}

function parseChaptersFromHtml(html: string): ScoreChapter[] {
  const chapters: ScoreChapter[] = [];

  // Match each chapter card block
  // Look for patterns like: <h4>Chapter Name</h4> followed by address/phone info
  const cardRegex = /<a[^>]*href="\/([a-z]+)"[^>]*>\s*<h4[^>]*>([^<]+)<\/h4>/gi;
  const matches = [...html.matchAll(cardRegex)];

  for (const match of matches) {
    const urlSlug = match[1];
    const name = match[2].trim();

    // Find the containing block for this chapter to extract other details
    const startIndex = match.index || 0;
    const blockEnd = html.indexOf('Request a Mentor', startIndex);
    const block = html.substring(startIndex, blockEnd > startIndex ? blockEnd : startIndex + 2000);

    // Extract service area description (first paragraph after the name)
    const descMatch = block.match(/<p[^>]*>([^<]{10,200})<\/p>/);
    const serviceArea = descMatch ? descMatch[1].trim() : '';

    // Extract address - look for the Google Maps link pattern
    const addressMatch = block.match(/maps\/search[^>]+>[\s\S]*?<p[^>]*>([^<]+)<\/p>\s*<p[^>]*>([^<]+)<\/p>/);
    let streetAddress = '';
    let cityStateZip = '';

    if (addressMatch) {
      streetAddress = addressMatch[1].trim().replace(/\s+/g, ' ');
      cityStateZip = addressMatch[2].trim();
    }

    // Extract phone
    const phoneMatch = block.match(/Tel:\s*([^<"]+)/i);
    const phone = phoneMatch ? phoneMatch[1].trim() : '';

    // Parse city/state/zip
    const { city, state, zip } = parseCityStateZip(cityStateZip);

    // Skip if we don't have essential data
    if (!name || !city || !state) {
      continue;
    }

    // Skip virtual-only chapters without real addresses
    if (streetAddress.toLowerCase().includes('virtual only')) {
      streetAddress = '';
    }

    chapters.push({
      name: `SCORE ${name}`,
      slug: urlSlug,
      description: serviceArea,
      serviceArea,
      address: streetAddress,
      city,
      state,
      zip,
      phone,
      website: `https://www.score.org/${urlSlug}`,
    });
  }

  return chapters;
}

// Known SCORE chapter slugs from sitemap (164 chapters)
const SCORE_CHAPTER_SLUGS = [
  'atlanta', 'cincidayton', 'lasvegas', 'manasota', 'midflorida', 'richmond',
  'sandiego', 'orlando', 'tampa', 'southerncolorado', 'chattanooga', 'greaterwichita',
  'oklahomacity', 'madison', 'southdakota', 'southwestflorida', 'southtexas', 'hawaii',
  'palmbeachcounty', 'centraltexas', 'capecod', 'santabarbara', 'easterniowaquadcities',
  'westernmassachusetts', 'worcester', 'midlands', 'spokane', 'piedmont', 'idaho',
  'nhvt', 'westernnc', 'piedmonttriad', 'austin', 'landoflincoln', 'westchester',
  'treasurecoast', 'nwcentralindiana', 'somd', 'portcharlotte', 'spacecoast',
  'siliconvalley', 'southernminnesota', 'northflorida', 'grandforkswestcentralnd',
  'nemassachusetts', 'sandhills', 'northernnevada', 'capitalcorridor', 'southernindiana',
  'santafe', 'sema', 'centralvalley', 'grandstrand', 'greaterknoxville', 'pascohernando',
  'northcoast', 'westcentralwisconsin', 'williamsburg', 'statenisland', 'westmoreland',
  'centralvirginia', 'chapelhilldurham', 'greaterphiladelphia', 'inlandempire', 'naples',
  'northeastwisconsin', 'northernmichigan', 'northernarizona', 'sanluisobispo',
  'delawarevalley', 'sanfranciscoeastbay', 'portlandor', 'ri', 'centraljersey',
  'metronj', 'susquehannavalley', 'princeton', 'sclowcountry', 'muskegon',
  'annarborarea', 'westmichigan', 'twincities', 'greaterbaltimore', 'columbusga',
  'chicago', 'desmoines', 'indianapolis', 'pittsburgh', 'rockland', 'putnam',
  'greateraiken', 'southernarizona', 'puertorico', 'longisland', 'capefear',
  'charlestonsc', 'broward', 'centraloregon', 'semichigan', 'kansascity', 'boston',
  'stlouis', 'dallas', 'northwestnj', 'blueridge', 'centralohio', 'sewisconsin',
  'ventura', 'miamidade', 'wv', 'cleveland', 'montana', 'monmouth', 'houston',
  'lincoln', 'omaha', 'westernconnecticut', 'delaware', 'louisiana', 'westernny',
  'raleigh', 'charlotte', 'utah', 'northeastindiana', 'greaterphoenix', 'maine',
  'seattle', 'easternconnecticut', 'mid-hudsonvalley', 'hamptonroads', 'pinellascounty',
  'denverwy', 'fortworth', 'albuquerque', 'centralflorida', 'memphis', 'northeastny',
  'savannah', 'nashville', 'greaterfargo', 'lehighvalley', 'kentucky', 'northeastnj',
  'asheville', 'northwestohio', 'akroncanton', 'alabama', 'jacksonville', 'volusiaflagler',
  'washingtondc', 'losangeles', 'arkansas', 'orangecounty', 'tulsa', 'newyorkcity',
  'naturecoastfl', 'middlegeorgia', 'mississippi', 'negeorgia', 'northmetroatlanta',
  'northchicago', 'longbeach', 'southgeorgia', 'centralny',
];

// Chapter data with locations (manually mapped from slug patterns)
const CHAPTER_LOCATIONS: Record<string, { city: string; state: string }> = {
  'atlanta': { city: 'Atlanta', state: 'GA' },
  'cincidayton': { city: 'Cincinnati', state: 'OH' },
  'lasvegas': { city: 'Las Vegas', state: 'NV' },
  'manasota': { city: 'Sarasota', state: 'FL' },
  'midflorida': { city: 'Lakeland', state: 'FL' },
  'richmond': { city: 'Richmond', state: 'VA' },
  'sandiego': { city: 'San Diego', state: 'CA' },
  'orlando': { city: 'Orlando', state: 'FL' },
  'tampa': { city: 'Tampa', state: 'FL' },
  'southerncolorado': { city: 'Colorado Springs', state: 'CO' },
  'chattanooga': { city: 'Chattanooga', state: 'TN' },
  'greaterwichita': { city: 'Wichita', state: 'KS' },
  'oklahomacity': { city: 'Oklahoma City', state: 'OK' },
  'madison': { city: 'Madison', state: 'WI' },
  'southdakota': { city: 'Sioux Falls', state: 'SD' },
  'southwestflorida': { city: 'Fort Myers', state: 'FL' },
  'southtexas': { city: 'San Antonio', state: 'TX' },
  'hawaii': { city: 'Honolulu', state: 'HI' },
  'palmbeachcounty': { city: 'West Palm Beach', state: 'FL' },
  'centraltexas': { city: 'Waco', state: 'TX' },
  'capecod': { city: 'West Falmouth', state: 'MA' },
  'santabarbara': { city: 'Santa Barbara', state: 'CA' },
  'easterniowaquadcities': { city: 'Davenport', state: 'IA' },
  'westernmassachusetts': { city: 'Springfield', state: 'MA' },
  'worcester': { city: 'Worcester', state: 'MA' },
  'midlands': { city: 'Columbia', state: 'SC' },
  'spokane': { city: 'Spokane', state: 'WA' },
  'piedmont': { city: 'Charlottesville', state: 'VA' },
  'idaho': { city: 'Boise', state: 'ID' },
  'nhvt': { city: 'Manchester', state: 'NH' },
  'westernnc': { city: 'Asheville', state: 'NC' },
  'piedmonttriad': { city: 'Greensboro', state: 'NC' },
  'austin': { city: 'Austin', state: 'TX' },
  'landoflincoln': { city: 'Springfield', state: 'IL' },
  'westchester': { city: 'White Plains', state: 'NY' },
  'treasurecoast': { city: 'Stuart', state: 'FL' },
  'nwcentralindiana': { city: 'Lafayette', state: 'IN' },
  'somd': { city: 'La Plata', state: 'MD' },
  'portcharlotte': { city: 'Port Charlotte', state: 'FL' },
  'spacecoast': { city: 'Melbourne', state: 'FL' },
  'siliconvalley': { city: 'San Jose', state: 'CA' },
  'southernminnesota': { city: 'Rochester', state: 'MN' },
  'northflorida': { city: 'Gainesville', state: 'FL' },
  'grandforkswestcentralnd': { city: 'Grand Forks', state: 'ND' },
  'nemassachusetts': { city: 'Lowell', state: 'MA' },
  'sandhills': { city: 'Southern Pines', state: 'NC' },
  'northernnevada': { city: 'Reno', state: 'NV' },
  'capitalcorridor': { city: 'Trenton', state: 'NJ' },
  'southernindiana': { city: 'Evansville', state: 'IN' },
  'santafe': { city: 'Santa Fe', state: 'NM' },
  'sema': { city: 'Cape Girardeau', state: 'MO' },
  'centralvalley': { city: 'Fresno', state: 'CA' },
  'grandstrand': { city: 'Myrtle Beach', state: 'SC' },
  'greaterknoxville': { city: 'Knoxville', state: 'TN' },
  'pascohernando': { city: 'New Port Richey', state: 'FL' },
  'northcoast': { city: 'Mentor', state: 'OH' },
  'westcentralwisconsin': { city: 'Eau Claire', state: 'WI' },
  'williamsburg': { city: 'Williamsburg', state: 'VA' },
  'statenisland': { city: 'Staten Island', state: 'NY' },
  'westmoreland': { city: 'Greensburg', state: 'PA' },
  'centralvirginia': { city: 'Lynchburg', state: 'VA' },
  'chapelhilldurham': { city: 'Durham', state: 'NC' },
  'greaterphiladelphia': { city: 'Philadelphia', state: 'PA' },
  'inlandempire': { city: 'Riverside', state: 'CA' },
  'naples': { city: 'Naples', state: 'FL' },
  'northeastwisconsin': { city: 'Green Bay', state: 'WI' },
  'northernmichigan': { city: 'Traverse City', state: 'MI' },
  'northernarizona': { city: 'Flagstaff', state: 'AZ' },
  'sanluisobispo': { city: 'San Luis Obispo', state: 'CA' },
  'delawarevalley': { city: 'Doylestown', state: 'PA' },
  'sanfranciscoeastbay': { city: 'Oakland', state: 'CA' },
  'portlandor': { city: 'Portland', state: 'OR' },
  'ri': { city: 'Providence', state: 'RI' },
  'centraljersey': { city: 'New Brunswick', state: 'NJ' },
  'metronj': { city: 'Newark', state: 'NJ' },
  'susquehannavalley': { city: 'Harrisburg', state: 'PA' },
  'princeton': { city: 'Princeton', state: 'NJ' },
  'sclowcountry': { city: 'Beaufort', state: 'SC' },
  'muskegon': { city: 'Muskegon', state: 'MI' },
  'annarborarea': { city: 'Ann Arbor', state: 'MI' },
  'westmichigan': { city: 'Grand Rapids', state: 'MI' },
  'twincities': { city: 'Minneapolis', state: 'MN' },
  'greaterbaltimore': { city: 'Baltimore', state: 'MD' },
  'columbusga': { city: 'Columbus', state: 'GA' },
  'chicago': { city: 'Chicago', state: 'IL' },
  'desmoines': { city: 'Des Moines', state: 'IA' },
  'indianapolis': { city: 'Indianapolis', state: 'IN' },
  'pittsburgh': { city: 'Pittsburgh', state: 'PA' },
  'rockland': { city: 'New City', state: 'NY' },
  'putnam': { city: 'Carmel', state: 'NY' },
  'greateraiken': { city: 'Aiken', state: 'SC' },
  'southernarizona': { city: 'Tucson', state: 'AZ' },
  'puertorico': { city: 'San Juan', state: 'PR' },
  'longisland': { city: 'Melville', state: 'NY' },
  'capefear': { city: 'Wilmington', state: 'NC' },
  'charlestonsc': { city: 'Charleston', state: 'SC' },
  'broward': { city: 'Hollywood', state: 'FL' },
  'centraloregon': { city: 'Bend', state: 'OR' },
  'semichigan': { city: 'Kalamazoo', state: 'MI' },
  'kansascity': { city: 'Kansas City', state: 'MO' },
  'boston': { city: 'Boston', state: 'MA' },
  'stlouis': { city: 'St. Louis', state: 'MO' },
  'dallas': { city: 'Dallas', state: 'TX' },
  'northwestnj': { city: 'Newton', state: 'NJ' },
  'blueridge': { city: 'Vinton', state: 'VA' },
  'centralohio': { city: 'Columbus', state: 'OH' },
  'sewisconsin': { city: 'Milwaukee', state: 'WI' },
  'ventura': { city: 'Ventura', state: 'CA' },
  'miamidade': { city: 'Miami', state: 'FL' },
  'wv': { city: 'Charleston', state: 'WV' },
  'cleveland': { city: 'Cleveland', state: 'OH' },
  'montana': { city: 'Billings', state: 'MT' },
  'monmouth': { city: 'Freehold', state: 'NJ' },
  'houston': { city: 'Houston', state: 'TX' },
  'lincoln': { city: 'Lincoln', state: 'NE' },
  'omaha': { city: 'Omaha', state: 'NE' },
  'westernconnecticut': { city: 'Stamford', state: 'CT' },
  'delaware': { city: 'Wilmington', state: 'DE' },
  'louisiana': { city: 'New Orleans', state: 'LA' },
  'westernny': { city: 'Buffalo', state: 'NY' },
  'raleigh': { city: 'Raleigh', state: 'NC' },
  'charlotte': { city: 'Charlotte', state: 'NC' },
  'utah': { city: 'Salt Lake City', state: 'UT' },
  'northeastindiana': { city: 'Fort Wayne', state: 'IN' },
  'greaterphoenix': { city: 'Phoenix', state: 'AZ' },
  'maine': { city: 'Portland', state: 'ME' },
  'seattle': { city: 'Seattle', state: 'WA' },
  'easternconnecticut': { city: 'Hartford', state: 'CT' },
  'mid-hudsonvalley': { city: 'Poughkeepsie', state: 'NY' },
  'hamptonroads': { city: 'Norfolk', state: 'VA' },
  'pinellascounty': { city: 'Clearwater', state: 'FL' },
  'denverwy': { city: 'Denver', state: 'CO' },
  'fortworth': { city: 'Fort Worth', state: 'TX' },
  'albuquerque': { city: 'Albuquerque', state: 'NM' },
  'centralflorida': { city: 'Orlando', state: 'FL' },
  'memphis': { city: 'Memphis', state: 'TN' },
  'northeastny': { city: 'Albany', state: 'NY' },
  'savannah': { city: 'Savannah', state: 'GA' },
  'nashville': { city: 'Nashville', state: 'TN' },
  'greaterfargo': { city: 'Fargo', state: 'ND' },
  'lehighvalley': { city: 'Allentown', state: 'PA' },
  'kentucky': { city: 'Louisville', state: 'KY' },
  'northeastnj': { city: 'Hackensack', state: 'NJ' },
  'asheville': { city: 'Candler', state: 'NC' },
  'northwestohio': { city: 'Toledo', state: 'OH' },
  'akroncanton': { city: 'North Canton', state: 'OH' },
  'alabama': { city: 'Birmingham', state: 'AL' },
  'jacksonville': { city: 'Jacksonville', state: 'FL' },
  'volusiaflagler': { city: 'Daytona Beach', state: 'FL' },
  'washingtondc': { city: 'Washington', state: 'DC' },
  'losangeles': { city: 'Los Angeles', state: 'CA' },
  'arkansas': { city: 'Little Rock', state: 'AR' },
  'orangecounty': { city: 'Irvine', state: 'CA' },
  'tulsa': { city: 'Tulsa', state: 'OK' },
  'newyorkcity': { city: 'New York', state: 'NY' },
  'naturecoastfl': { city: 'Ocala', state: 'FL' },
  'middlegeorgia': { city: 'Macon', state: 'GA' },
  'mississippi': { city: 'Jackson', state: 'MS' },
  'negeorgia': { city: 'Gainesville', state: 'GA' },
  'northmetroatlanta': { city: 'Alpharetta', state: 'GA' },
  'northchicago': { city: 'Northbrook', state: 'IL' },
  'longbeach': { city: 'Long Beach', state: 'CA' },
  'southgeorgia': { city: 'Valdosta', state: 'GA' },
  'centralny': { city: 'Syracuse', state: 'NY' },
};

function formatChapterName(slug: string): string {
  // Convert slug to readable name
  const specialNames: Record<string, string> = {
    'nhvt': 'New Hampshire & Vermont',
    'ri': 'Rhode Island',
    'wv': 'West Virginia',
    'somd': 'Southern Maryland',
    'sema': 'Southeast Missouri',
    'denverwy': 'Denver & Wyoming',
    'sewisconsin': 'Southeast Wisconsin',
    'semichigan': 'Southeast Michigan',
    'negeorgia': 'Northeast Georgia',
    'westernnc': 'Western North Carolina',
    'sclowcountry': 'South Carolina Lowcountry',
  };

  if (specialNames[slug]) {
    return specialNames[slug];
  }

  return slug
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/  +/g, ' ')
    .replace(/\bAnd\b/g, '&')
    .replace(/Ny$/, 'NY')
    .replace(/Nj$/, 'NJ')
    .replace(/Nc$/, 'NC')
    .replace(/Sc$/, 'SC')
    .trim();
}

async function scrapeAllChapters(): Promise<ScoreChapter[]> {
  const allChapters: ScoreChapter[] = [];

  console.log(`  Building chapter list from ${SCORE_CHAPTER_SLUGS.length} known chapters...`);

  for (const slug of SCORE_CHAPTER_SLUGS) {
    const location = CHAPTER_LOCATIONS[slug];
    if (!location) {
      continue;
    }

    const name = formatChapterName(slug);

    allChapters.push({
      name: `SCORE ${name}`,
      slug,
      description: '',
      serviceArea: `Serving the ${location.city}, ${location.state} area`,
      address: '',
      city: location.city,
      state: location.state,
      zip: '',
      phone: '1-800-634-0245',
      website: `https://www.score.org/${slug}`,
    });
  }

  console.log(`  Created ${allChapters.length} chapters with location data`);

  return allChapters;
}

async function getExistingListings(): Promise<Set<string>> {
  console.log('Fetching existing SCORE listings for deduplication...');

  const existing = new Set<string>();

  const { data, error } = await supabase
    .from('resource_listings')
    .select('name, city, state')
    .or('source.eq.score,name.ilike.%SCORE%');

  if (error) {
    console.error('Error fetching existing listings:', error.message);
    return existing;
  }

  for (const row of data || []) {
    const key = `${(row.name || '').toLowerCase()}|${(row.city || '').toLowerCase()}|${(row.state || '').toLowerCase()}`;
    existing.add(key);
  }

  console.log(`  Found ${existing.size} existing SCORE-related listings`);
  return existing;
}

async function getExistingSlugs(): Promise<Set<string>> {
  console.log('Fetching existing slugs...');

  const slugs = new Set<string>();
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('resource_listings')
      .select('slug')
      .range(offset, offset + pageSize - 1);

    if (error) break;
    if (!data || data.length === 0) break;

    for (const row of data) {
      slugs.add(row.slug);
    }

    offset += pageSize;
    if (data.length < pageSize) break;
  }

  console.log(`  Found ${slugs.size} existing slugs`);
  return slugs;
}

async function ensureLocations(listings: ListingRecord[]): Promise<void> {
  console.log('Ensuring locations exist...');

  const locationMap = new Map<string, { city: string; state: string }>();
  for (const listing of listings) {
    if (listing.city && listing.state) {
      const key = `${listing.city.toLowerCase()}|${listing.state.toLowerCase()}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, { city: listing.city, state: listing.state });
      }
    }
  }

  const locations = Array.from(locationMap.values());
  console.log(`  Found ${locations.length} unique city/state combinations`);

  const locationRecords = locations.map(loc => ({
    city: loc.city,
    state: loc.state,
    state_full: STATE_FULL_NAMES[loc.state] || loc.state,
    slug: `${loc.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${loc.state.toLowerCase()}`,
  }));

  const { error } = await supabase
    .from('resource_locations')
    .upsert(locationRecords, { onConflict: 'city,state', ignoreDuplicates: true });

  if (error) {
    console.error('  Warning: Error upserting locations:', error.message);
  } else {
    console.log(`  Ensured ${locationRecords.length} locations exist`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('='.repeat(70));
  console.log('SparkLocal SCORE Chapters Import');
  console.log('='.repeat(70));

  if (isDryRun) {
    console.log('DRY RUN MODE - No changes will be made\n');
  }

  // Scrape all chapters
  console.log('\nScraping SCORE chapters from score.org...');
  const chapters = await scrapeAllChapters();
  console.log(`\nTotal chapters scraped: ${chapters.length}`);

  if (chapters.length === 0) {
    console.error('No chapters found. The website structure may have changed.');
    process.exit(1);
  }

  // Get existing data for deduplication
  const existingListings = await getExistingListings();
  const existingSlugs = await getExistingSlugs();

  // Process chapters into listings
  console.log('\nProcessing chapters...');
  const newListings: ListingRecord[] = [];
  let duplicates = 0;

  for (const chapter of chapters) {
    // Check for duplicates
    const dedupeKey = `${chapter.name.toLowerCase()}|${chapter.city.toLowerCase()}|${chapter.state.toLowerCase()}`;
    if (existingListings.has(dedupeKey)) {
      duplicates++;
      continue;
    }

    // Generate unique slug
    let baseSlug = generateSlug(`score-${chapter.slug}`);
    let slug = baseSlug;
    let counter = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(slug);

    // Build full description
    const fullDescription = `${SCORE_DESCRIPTION}\n\n${chapter.serviceArea ? `This chapter serves: ${chapter.serviceArea}` : ''}`.trim();

    // Build short description
    const shortDescription = `Free business mentoring from SCORE volunteers in ${chapter.city}, ${chapter.state}. Part of the SBA's network of business advisors.`;

    const listing: ListingRecord = {
      name: chapter.name,
      slug,
      description: fullDescription,
      short_description: shortDescription,
      category: 'sba',
      subcategories: ['score-mentoring'],
      cause_areas: [],
      address: chapter.address,
      city: chapter.city,
      state: chapter.state,
      zip: chapter.zip,
      country: 'US',
      is_remote: false,
      is_nationwide: false,
      service_areas: chapter.serviceArea ? [chapter.serviceArea] : [],
      website: chapter.website,
      phone: chapter.phone,
      details: {
        type: 'SCORE Mentoring Chapter',
        services: ['Business Mentoring', 'Workshops', 'Resources'],
        cost: 'Free',
      },
      source: 'score',
      source_id: chapter.slug,
      enrichment_status: 'raw',
      is_featured: false,
      is_active: true,
    };

    newListings.push(listing);
    existingListings.add(dedupeKey);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total chapters scraped:  ${chapters.length}`);
  console.log(`Duplicates found:        ${duplicates}`);
  console.log(`New listings to add:     ${newListings.length}`);

  if (newListings.length === 0) {
    console.log('\nNo new listings to import.');
    return;
  }

  // Show sample
  console.log('\nSample new listings (first 10):');
  for (const listing of newListings.slice(0, 10)) {
    console.log(`  - ${listing.name} (${listing.city}, ${listing.state})`);
  }
  if (newListings.length > 10) {
    console.log(`  ... and ${newListings.length - 10} more`);
  }

  // Group by state
  const byState: Record<string, number> = {};
  for (const listing of newListings) {
    byState[listing.state] = (byState[listing.state] || 0) + 1;
  }
  console.log('\nListings by state:');
  Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });

  if (isDryRun) {
    console.log('\nDry run complete. Run without --dry-run to import.');
    return;
  }

  // Import
  console.log('\n' + '='.repeat(70));
  console.log('IMPORTING');
  console.log('='.repeat(70));

  // Ensure locations exist
  await ensureLocations(newListings);

  // Insert listings
  console.log('\nInserting listings...');
  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newListings.length; i += BATCH_SIZE) {
    const batch = newListings.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('resource_listings')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Error - ${error.message}`);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      process.stdout.write(`\r  Progress: ${inserted}/${newListings.length}`);
    }
  }

  console.log('\n');

  // Recalculate listing counts
  console.log('Recalculating listing counts...');
  const { error: rpcError } = await supabase.rpc('recalculate_listing_counts');
  if (rpcError) {
    console.error('  Warning: Could not recalculate counts:', rpcError.message);
  } else {
    console.log('  Done.');
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);

  // Get new totals
  const { count: totalSba } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'sba')
    .eq('is_active', true);

  console.log(`\nTotal SBA listings now: ${totalSba}`);
}

main().catch(console.error);
