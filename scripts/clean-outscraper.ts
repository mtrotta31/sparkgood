import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Clean Outscraper Coworking Data - Frey's 3-Pass Method
 *
 * Pass 1: Remove junk (no name, no address, closed, duplicates, non-coworking)
 * Pass 2: Categorize and validate (is it actually a coworking space?)
 * Pass 3: Normalize and format (map to database schema)
 *
 * Usage:
 *   npx tsx scripts/clean-outscraper.ts
 *
 * Output:
 *   Creates data/outscraper/coworking-cleaned.json with cleaned listings
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface OutscraperRow {
  query?: string;
  name?: string;
  subtypes?: string;
  category?: string;
  type?: string;
  phone?: string;
  website?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  state_code?: string;
  postal_code?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews?: number;
  business_status?: string;
  working_hours?: string;
  about?: string;
  description?: string;
  website_description?: string;
  photo?: string;
  logo?: string;
  place_id?: string;
  google_id?: string;
  [key: string]: unknown;
}

interface CleanedListing {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: 'coworking';
  subcategories: string[];
  cause_areas: string[];
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_remote: boolean;
  is_nationwide: boolean;
  service_areas: string[];
  website?: string;
  phone?: string;
  details: {
    rating?: number;
    reviews?: number;
    hours?: string;
    amenities?: string[];
    subtypes?: string[];
  };
  logo_url?: string;
  images: string[];
  source: 'outscraper';
  source_id: string;
  enrichment_status: 'raw';
  is_featured: boolean;
  is_active: boolean;
}

interface RemovalStats {
  no_name: number;
  no_address: number;
  no_city_state: number;
  permanently_closed: number;
  duplicates: number;
  not_coworking_pass1: number;
  not_coworking_pass2: number;
  total_removed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Keywords that indicate this is NOT a coworking space
const JUNK_KEYWORDS = [
  'ups store',
  'the ups store',
  'fedex',
  'fedex office',
  'staples',
  'office depot',
  'office max',
  'postal connections',
  'postal annex',
  'mail boxes etc',
  'mailboxes etc',
  'pak mail',
  'postnet',
  'goin postal',
  'post office',
  'usps',
  'po box',
  'p.o. box',
  'postal center',
  'shipping center',
  'notary',
  'title company',
  'mortgage',
  'insurance agency',
  'real estate',
  'realty',
  'keller williams',
  're/max',
  'remax',
  'coldwell banker',
  'century 21',
  'berkshire hathaway',
  'compass real estate',
  'storage',
  'self storage',
  'public storage',
  'extra space',
  'cubesmart',
  'u-haul',
  'uhaul',
  'budget truck',
  'penske',
  'enterprise rent',
  'hertz',
  'avis',
  'bank of america',
  'wells fargo',
  'chase bank',
  'td bank',
  'pnc bank',
  'citibank',
  'us bank',
];

// Subtypes that indicate virtual-only (no physical coworking)
const VIRTUAL_ONLY_SUBTYPES = [
  'virtual office rental',
  'mailbox rental service',
  'telephone answering service',
  'call center',
  'video conferencing service',
];

// Subtypes that indicate NOT a coworking space
const NON_COWORKING_SUBTYPES = [
  'commercial real estate agency',
  'real estate agency',
  'real estate rental agency',
  'property management company',
  'storage facility',
  'warehouse',
  'bank',
  'atm',
  'insurance agency',
  'coffee shop',
  'cafe',
  'bar',
  'restaurant',
  'hotel',
  'motel',
  'apartment complex',
  'apartment building',
  'law firm',
  'accounting firm',
  'dental office',
  'medical center',
  'hospital',
  'clinic',
  'gym',
  'fitness center',
  'church',
  'school',
  'university',
];

// Subtypes that indicate this IS a coworking space
const COWORKING_SUBTYPES = [
  'coworking space',
  'business center',
  'office space rental agency',
  'executive suite rental agency',
  'conference center',
  'event venue',
  'business to business service',
  'meeting planning service',
  'corporate office',
  'business park',
  'community center',
  'non-profit organization',
  'startup',
  'incubator',
  'business incubator',
];

// State abbreviation to full name mapping
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
    .substring(0, 100); // Limit slug length
}

function normalizeStateName(stateCode: string | undefined): string | undefined {
  if (!stateCode) return undefined;
  const upper = stateCode.toUpperCase().trim();
  // Return the abbreviation (2 letters) for consistency with existing data
  if (upper.length === 2 && STATE_FULL_NAMES[upper]) {
    return upper;
  }
  // If it's a full state name, find the abbreviation
  for (const [abbr, full] of Object.entries(STATE_FULL_NAMES)) {
    if (full.toLowerCase() === stateCode.toLowerCase().trim()) {
      return abbr;
    }
  }
  return stateCode.substring(0, 2).toUpperCase();
}

function normalizeCity(city: string | undefined): string | undefined {
  if (!city) return undefined;
  return city
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseSubtypes(subtypesStr: string | undefined): string[] {
  if (!subtypesStr) return [];
  return subtypesStr.split(', ').map(s => s.trim().toLowerCase());
}

function containsJunkKeyword(name: string): boolean {
  const lower = name.toLowerCase();
  return JUNK_KEYWORDS.some(keyword => lower.includes(keyword));
}

function isVirtualOnly(subtypes: string[]): boolean {
  // If the only relevant subtypes are virtual-related, it's virtual-only
  const hasCoworkingSubtype = subtypes.some(s =>
    COWORKING_SUBTYPES.some(cs => s.includes(cs.toLowerCase()))
  );
  const hasVirtualSubtype = subtypes.some(s =>
    VIRTUAL_ONLY_SUBTYPES.some(vs => s.includes(vs.toLowerCase()))
  );

  // If it has virtual subtype but no coworking subtype, it's virtual-only
  if (hasVirtualSubtype && !hasCoworkingSubtype) {
    return true;
  }

  // If it ONLY has virtual subtypes and nothing else relevant, it's virtual-only
  const relevantSubtypes = subtypes.filter(s =>
    !['business to business service', 'meeting planning service'].includes(s)
  );
  if (relevantSubtypes.length > 0 &&
      relevantSubtypes.every(s => VIRTUAL_ONLY_SUBTYPES.some(vs => s.includes(vs.toLowerCase())))) {
    return true;
  }

  return false;
}

function isNonCoworking(subtypes: string[], name: string): boolean {
  const lowerName = name.toLowerCase();

  // Check if primary subtype is non-coworking
  if (subtypes.length > 0) {
    const primarySubtype = subtypes[0].toLowerCase();
    if (NON_COWORKING_SUBTYPES.some(ns => primarySubtype.includes(ns))) {
      return true;
    }
  }

  // Check name for Regus virtual office indicators
  if (lowerName.includes('regus') && lowerName.includes('virtual')) {
    return true;
  }

  return false;
}

function extractAmenities(row: OutscraperRow): string[] {
  const amenities: string[] = [];
  const websiteDesc = (row.website_description || '').toLowerCase();
  const about = (row.about || '').toLowerCase();
  const combined = websiteDesc + ' ' + about;

  if (combined.includes('wifi') || combined.includes('wi-fi') || combined.includes('internet')) {
    amenities.push('wifi');
  }
  if (combined.includes('meeting room') || combined.includes('conference')) {
    amenities.push('meeting_rooms');
  }
  if (combined.includes('print') || combined.includes('printer') || combined.includes('copy')) {
    amenities.push('printing');
  }
  if (combined.includes('mail') && !combined.includes('email')) {
    amenities.push('mail_handling');
  }
  if (combined.includes('kitchen') || combined.includes('coffee') || combined.includes('refreshment')) {
    amenities.push('kitchen');
  }
  if (combined.includes('parking')) {
    amenities.push('parking');
  }
  if (combined.includes('24/7') || combined.includes('24 hour') || combined.includes('24-hour')) {
    amenities.push('24_7_access');
  }
  if (combined.includes('pet') || combined.includes('dog')) {
    amenities.push('pet_friendly');
  }
  if (combined.includes('private office')) {
    amenities.push('private_offices');
  }
  if (combined.includes('event') || combined.includes('venue')) {
    amenities.push('event_space');
  }

  return amenities;
}

function createShortDescription(row: OutscraperRow): string {
  const city = row.city || '';
  const state = normalizeStateName(row.state_code) || '';
  const subtypes = parseSubtypes(row.subtypes);

  // Use website description if available and good
  if (row.website_description && row.website_description.length > 20 && row.website_description.length < 200) {
    // Clean up the website description
    let desc = row.website_description
      .replace(/·/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
    if (!desc.endsWith('.')) desc += '.';
    return desc;
  }

  // Build a description from available data
  const hasCoworking = subtypes.includes('coworking space');
  const hasPrivateOffice = subtypes.includes('office space rental agency') || subtypes.includes('executive suite rental agency');
  const hasEvent = subtypes.includes('event venue') || subtypes.includes('conference center');

  const features: string[] = [];
  if (hasCoworking) features.push('coworking');
  if (hasPrivateOffice) features.push('private offices');
  if (hasEvent) features.push('meeting space');

  if (features.length > 0 && city && state) {
    return `${features.join(', ').charAt(0).toUpperCase() + features.join(', ').slice(1)} space in ${city}, ${state}.`;
  }

  if (city && state) {
    return `Coworking and office space in ${city}, ${state}.`;
  }

  return 'Coworking and shared office space.';
}

// ============================================================================
// MAIN CLEANING LOGIC
// ============================================================================

async function main() {
  const inputPath = path.join(process.cwd(), 'data/outscraper/Outscraper-20260219052434m35_coworking_space.xlsx');
  const outputPath = path.join(process.cwd(), 'data/outscraper/coworking-cleaned.json');

  console.log('='.repeat(60));
  console.log('SparkGood Outscraper Cleaning Script');
  console.log('Frey\'s 3-Pass Method');
  console.log('='.repeat(60));
  console.log('');

  // Read the xlsx file
  console.log('Reading xlsx file...');
  const workbook = XLSX.readFile(inputPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData: OutscraperRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`Total raw rows: ${rawData.length}`);
  console.log('');

  const stats: RemovalStats = {
    no_name: 0,
    no_address: 0,
    no_city_state: 0,
    permanently_closed: 0,
    duplicates: 0,
    not_coworking_pass1: 0,
    not_coworking_pass2: 0,
    total_removed: 0,
  };

  // ========================================================================
  // PASS 1: Remove Junk
  // ========================================================================
  console.log('-'.repeat(60));
  console.log('PASS 1: Remove Junk');
  console.log('-'.repeat(60));

  const pass1: OutscraperRow[] = [];
  const seenKeys = new Set<string>();

  for (const row of rawData) {
    // No business name
    if (!row.name || row.name.trim() === '') {
      stats.no_name++;
      continue;
    }

    // No address
    if (!row.address || row.address.trim() === '') {
      stats.no_address++;
      continue;
    }

    // No city or state
    if (!row.city || !row.state_code) {
      stats.no_city_state++;
      continue;
    }

    // Permanently closed
    if (row.business_status === 'CLOSED_PERMANENTLY') {
      stats.permanently_closed++;
      continue;
    }

    // Duplicates (same name + same city)
    const dedupeKey = `${row.name.toLowerCase().trim()}|${row.city.toLowerCase().trim()}`;
    if (seenKeys.has(dedupeKey)) {
      stats.duplicates++;
      continue;
    }
    seenKeys.add(dedupeKey);

    // Not a coworking space (junk keywords)
    if (containsJunkKeyword(row.name)) {
      stats.not_coworking_pass1++;
      continue;
    }

    pass1.push(row);
  }

  console.log(`  No name: ${stats.no_name}`);
  console.log(`  No address: ${stats.no_address}`);
  console.log(`  No city/state: ${stats.no_city_state}`);
  console.log(`  Permanently closed: ${stats.permanently_closed}`);
  console.log(`  Duplicates: ${stats.duplicates}`);
  console.log(`  Junk keywords: ${stats.not_coworking_pass1}`);
  console.log(`  Remaining after Pass 1: ${pass1.length}`);
  console.log('');

  // ========================================================================
  // PASS 2: Categorize and Validate
  // ========================================================================
  console.log('-'.repeat(60));
  console.log('PASS 2: Categorize and Validate');
  console.log('-'.repeat(60));

  const pass2: OutscraperRow[] = [];

  for (const row of pass1) {
    const subtypes = parseSubtypes(row.subtypes);

    // Check if it's virtual-only
    if (isVirtualOnly(subtypes)) {
      stats.not_coworking_pass2++;
      continue;
    }

    // Check if it's a non-coworking business type
    if (isNonCoworking(subtypes, row.name || '')) {
      stats.not_coworking_pass2++;
      continue;
    }

    // Must have at least one coworking-related subtype
    const hasCoworkingSubtype = subtypes.some(s =>
      COWORKING_SUBTYPES.some(cs => s.includes(cs.toLowerCase()))
    );

    if (!hasCoworkingSubtype) {
      // Check if the category field indicates coworking
      const category = (row.category || '').toLowerCase();
      const isCoworkingCategory = category.includes('coworking') ||
                                   category.includes('office space') ||
                                   category.includes('business center');

      if (!isCoworkingCategory) {
        stats.not_coworking_pass2++;
        continue;
      }
    }

    pass2.push(row);
  }

  console.log(`  Virtual-only/Non-coworking removed: ${stats.not_coworking_pass2}`);
  console.log(`  Remaining after Pass 2: ${pass2.length}`);
  console.log('');

  // ========================================================================
  // PASS 3: Normalize and Format
  // ========================================================================
  console.log('-'.repeat(60));
  console.log('PASS 3: Normalize and Format');
  console.log('-'.repeat(60));

  const cleanedListings: CleanedListing[] = [];
  const slugsSeen = new Set<string>();

  for (const row of pass2) {
    const name = row.name!.trim();
    const city = normalizeCity(row.city);
    const state = normalizeStateName(row.state_code);
    const subtypes = parseSubtypes(row.subtypes);

    // Generate unique slug
    let baseSlug = generateSlug(`${name}-${city}-${state}`);
    let slug = baseSlug;
    let counter = 2;
    while (slugsSeen.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugsSeen.add(slug);

    // Build subcategories from subtypes
    const subcategories: string[] = [];
    if (subtypes.includes('coworking space')) subcategories.push('coworking');
    if (subtypes.some(s => s.includes('executive suite'))) subcategories.push('executive-suite');
    if (subtypes.some(s => s.includes('conference') || s.includes('event'))) subcategories.push('event-space');
    if (subtypes.some(s => s.includes('business center'))) subcategories.push('business-center');

    // Extract amenities
    const amenities = extractAmenities(row);

    // Create the cleaned listing
    const listing: CleanedListing = {
      name,
      slug,
      short_description: createShortDescription(row),
      category: 'coworking',
      subcategories,
      cause_areas: [],
      address: row.address?.trim(),
      city,
      state,
      zip: row.postal_code?.trim(),
      country: 'US',
      latitude: row.latitude,
      longitude: row.longitude,
      is_remote: false,
      is_nationwide: false,
      service_areas: [],
      website: row.website?.trim(),
      phone: row.phone?.trim(),
      details: {
        rating: row.rating,
        reviews: row.reviews,
        hours: row.working_hours,
        amenities,
        subtypes,
      },
      logo_url: row.logo,
      images: row.photo ? [row.photo] : [],
      source: 'outscraper',
      source_id: row.place_id || row.google_id || slug,
      enrichment_status: 'raw',
      is_featured: false,
      is_active: true,
    };

    cleanedListings.push(listing);
  }

  console.log(`  Formatted listings: ${cleanedListings.length}`);
  console.log('');

  // ========================================================================
  // SUMMARY
  // ========================================================================
  stats.total_removed = rawData.length - cleanedListings.length;

  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Original rows: ${rawData.length}`);
  console.log(`  Total removed: ${stats.total_removed}`);
  console.log(`  Final cleaned: ${cleanedListings.length}`);
  console.log(`  Retention rate: ${((cleanedListings.length / rawData.length) * 100).toFixed(1)}%`);
  console.log('');

  console.log('Removal breakdown:');
  console.log(`  - No name: ${stats.no_name}`);
  console.log(`  - No address: ${stats.no_address}`);
  console.log(`  - No city/state: ${stats.no_city_state}`);
  console.log(`  - Permanently closed: ${stats.permanently_closed}`);
  console.log(`  - Duplicates: ${stats.duplicates}`);
  console.log(`  - Junk keywords (Pass 1): ${stats.not_coworking_pass1}`);
  console.log(`  - Non-coworking (Pass 2): ${stats.not_coworking_pass2}`);
  console.log('');

  // Get stats by state
  const byState: Record<string, number> = {};
  for (const listing of cleanedListings) {
    const state = listing.state || 'Unknown';
    byState[state] = (byState[state] || 0) + 1;
  }

  console.log('Top 10 states:');
  Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });
  console.log('');

  // Write output
  console.log(`Writing cleaned data to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(cleanedListings, null, 2));
  console.log('Done!');
  console.log('');
  console.log(`Next step: Run 'npx tsx scripts/import-coworking.ts' to import into Supabase`);
}

main().catch(console.error);
