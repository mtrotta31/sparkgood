import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * SparkGood Resource Directory Seeding Script
 *
 * Seeds the resource directory with initial data:
 * - SBA Resources (VBOCs, SCORE chapters, SBDCs, WBCs)
 * - Accelerators (city-specific and cause-specific)
 * - Grants (federal, state, private foundation, corporate)
 *
 * Usage:
 *   npx tsx scripts/seed-directory.ts
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 *
 * Deduplication:
 *   Uses source + source_id to generate deterministic slugs, preventing duplicates
 *   when re-running the seed script.
 */

import { createClient } from "@supabase/supabase-js";
import { allSBAResources } from "./sba-resources-data";
import grantListings from "./grants-data";
import acceleratorListings from "./accelerators-data";

// Initialize Supabase with service role key for seeding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Export the interface so data files can use it
export interface ResourceListing {
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
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_remote?: boolean;
  is_nationwide?: boolean;
  service_areas?: string[];
  website?: string;
  email?: string;
  phone?: string;
  details?: Record<string, unknown>;
  logo_url?: string;
  source: string;
  source_id?: string;
  is_featured?: boolean;
}

interface ResourceLocation {
  city: string;
  state: string;
  state_full: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  population?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Generate a deterministic slug from source_id if available, otherwise from name.
 * This ensures re-running the seed script updates rather than duplicates.
 */
function generateDeterministicSlug(listing: Omit<ResourceListing, "slug">): string {
  if (listing.source_id) {
    // Use source_id for deterministic slugs (e.g., "vboc-new-england" -> "vboc-new-england")
    return generateSlug(listing.source_id);
  }
  // Fall back to name-based slug
  return generateSlug(listing.name);
}

/**
 * Prepare listings by adding deterministic slugs based on source_id.
 * This allows external data files to omit slugs.
 */
function prepareListings(listings: Omit<ResourceListing, "slug">[]): ResourceListing[] {
  return listings.map((listing) => ({
    ...listing,
    slug: generateDeterministicSlug(listing),
  }));
}

function stateAbbreviationToFull(abbr: string): string {
  const states: Record<string, string> = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "District of Columbia",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    PR: "Puerto Rico",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };
  return states[abbr] || abbr;
}

// ============================================================================
// SBA RESOURCES DATA
// ============================================================================

const sbaResources: ResourceListing[] = [
  // SBDC Lead Centers (one per state + territories)
  {
    name: "Alabama SBDC Network",
    slug: "alabama-sbdc-network",
    short_description:
      "Alabama's lead SBDC providing business counseling and training across the state.",
    category: "sba",
    city: "Birmingham",
    state: "AL",
    is_nationwide: false,
    service_areas: ["Alabama"],
    website: "https://asbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Market Research",
        "Financial Analysis",
      ],
    },
    source: "manual",
    source_id: "sbdc-al",
  },
  {
    name: "Alaska SBDC",
    slug: "alaska-sbdc",
    short_description:
      "Alaska's Small Business Development Center at UAA providing statewide business assistance.",
    category: "sba",
    city: "Anchorage",
    state: "AK",
    website: "https://aksbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Export Assistance"],
    },
    source: "manual",
    source_id: "sbdc-ak",
  },
  {
    name: "Arizona SBDC Network",
    slug: "arizona-sbdc-network",
    short_description:
      "Maricopa County SBDC providing business counseling and training in the Phoenix metro area.",
    category: "sba",
    city: "Phoenix",
    state: "AZ",
    website: "https://www.azsbdc.net",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Government Contracting Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-az",
  },
  {
    name: "Arkansas SBDC",
    slug: "arkansas-sbdc",
    short_description:
      "Arkansas SBTDC at UA Little Rock providing business development assistance.",
    category: "sba",
    city: "Little Rock",
    state: "AR",
    website: "https://asbtdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Market Research"],
    },
    source: "manual",
    source_id: "sbdc-ar",
  },
  {
    name: "California SBDC Network",
    slug: "california-sbdc-network",
    short_description:
      "California's statewide SBDC network with multiple regional centers.",
    category: "sba",
    city: "Sacramento",
    state: "CA",
    website: "https://www.californiasbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Capital Access",
        "Export Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-ca",
  },
  {
    name: "Colorado SBDC Network",
    slug: "colorado-sbdc-network",
    short_description:
      "Colorado SBDC providing business counseling and resources across the state.",
    category: "sba",
    city: "Denver",
    state: "CO",
    website: "https://www.coloradosbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Capital Access"],
    },
    source: "manual",
    source_id: "sbdc-co",
  },
  {
    name: "Connecticut SBDC",
    slug: "connecticut-sbdc",
    short_description:
      "Connecticut SBDC at UConn providing business development services.",
    category: "sba",
    city: "Hartford",
    state: "CT",
    website: "https://ctsbdc.com",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Manufacturing Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-ct",
  },
  {
    name: "Delaware SBDC",
    slug: "delaware-sbdc",
    short_description:
      "Delaware SBDC providing business assistance throughout the state.",
    category: "sba",
    city: "Newark",
    state: "DE",
    website: "https://www.delawaresbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Financial Analysis"],
    },
    source: "manual",
    source_id: "sbdc-de",
  },
  {
    name: "Florida SBDC Network",
    slug: "florida-sbdc-network",
    short_description:
      "Florida's statewide SBDC network with over 40 locations.",
    category: "sba",
    city: "Pensacola",
    state: "FL",
    website: "https://floridasbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Disaster Recovery",
        "Government Contracting",
      ],
    },
    source: "manual",
    source_id: "sbdc-fl",
  },
  {
    name: "Georgia SBDC Network",
    slug: "georgia-sbdc-network",
    short_description:
      "Georgia SBDC at University of Georgia providing statewide business assistance.",
    category: "sba",
    city: "Athens",
    state: "GA",
    website: "https://www.georgiasbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Market Research",
        "Export Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-ga",
  },
  {
    name: "Hawaii SBDC Network",
    slug: "hawaii-sbdc-network",
    short_description:
      "Hawaii SBDC providing business development assistance across the islands.",
    category: "sba",
    city: "Honolulu",
    state: "HI",
    website: "https://www.hisbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Export Assistance"],
    },
    source: "manual",
    source_id: "sbdc-hi",
  },
  {
    name: "Idaho SBDC",
    slug: "idaho-sbdc",
    short_description:
      "Idaho SBDC at Boise State providing business counseling and training.",
    category: "sba",
    city: "Boise",
    state: "ID",
    website: "https://idahosbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Market Research"],
    },
    source: "manual",
    source_id: "sbdc-id",
  },
  {
    name: "Illinois SBDC Network",
    slug: "illinois-sbdc-network",
    short_description:
      "Illinois SBDC providing business development services across the state.",
    category: "sba",
    city: "Springfield",
    state: "IL",
    website: "https://www.ilsbdc.biz",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Government Contracting",
        "Export Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-il",
  },
  {
    name: "Indiana SBDC",
    slug: "indiana-sbdc",
    short_description:
      "Indiana SBDC providing business assistance through multiple regional centers.",
    category: "sba",
    city: "Indianapolis",
    state: "IN",
    website: "https://isbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Technology Commercialization",
      ],
    },
    source: "manual",
    source_id: "sbdc-in",
  },
  {
    name: "Iowa SBDC",
    slug: "iowa-sbdc",
    short_description:
      "Iowa SBDC at Iowa State providing business development services.",
    category: "sba",
    city: "Ames",
    state: "IA",
    website: "https://iowasbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Market Research"],
    },
    source: "manual",
    source_id: "sbdc-ia",
  },
  {
    name: "Kansas SBDC",
    slug: "kansas-sbdc",
    short_description:
      "Kansas SBDC at Fort Hays State University providing statewide assistance.",
    category: "sba",
    city: "Topeka",
    state: "KS",
    website: "https://www.kansassbdc.net",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Government Contracting",
        "Export Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-ks",
  },
  {
    name: "Kentucky SBDC",
    slug: "kentucky-sbdc",
    short_description:
      "Kentucky SBDC at University of Kentucky providing business development.",
    category: "sba",
    city: "Lexington",
    state: "KY",
    website: "https://ksbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Financial Analysis"],
    },
    source: "manual",
    source_id: "sbdc-ky",
  },
  {
    name: "Louisiana SBDC",
    slug: "louisiana-sbdc",
    short_description:
      "Louisiana SBDC providing business assistance throughout the state.",
    category: "sba",
    city: "Baton Rouge",
    state: "LA",
    website: "https://www.lsbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Disaster Recovery"],
    },
    source: "manual",
    source_id: "sbdc-la",
  },
  {
    name: "Maine SBDC",
    slug: "maine-sbdc",
    short_description:
      "Maine SBDC providing business counseling and training statewide.",
    category: "sba",
    city: "Portland",
    state: "ME",
    website: "https://mainesbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Export Assistance",
        "Rural Development",
      ],
    },
    source: "manual",
    source_id: "sbdc-me",
  },
  {
    name: "Maryland SBDC",
    slug: "maryland-sbdc",
    short_description:
      "Maryland SBDC providing business development services across the state.",
    category: "sba",
    city: "Baltimore",
    state: "MD",
    website: "https://mdsbdc.umd.edu",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Government Contracting",
        "Cybersecurity",
      ],
    },
    source: "manual",
    source_id: "sbdc-md",
  },
  {
    name: "Massachusetts SBDC",
    slug: "massachusetts-sbdc",
    short_description:
      "Massachusetts SBDC providing business assistance throughout the state.",
    category: "sba",
    city: "Boston",
    state: "MA",
    website: "https://www.msbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Manufacturing Assistance",
        "Technology Development",
      ],
    },
    source: "manual",
    source_id: "sbdc-ma",
  },
  {
    name: "Michigan SBDC",
    slug: "michigan-sbdc",
    short_description:
      "Michigan SBDC providing comprehensive business development services.",
    category: "sba",
    city: "Detroit",
    state: "MI",
    website: "https://sbdcmichigan.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Export Assistance",
        "Manufacturing",
      ],
    },
    source: "manual",
    source_id: "sbdc-mi",
  },
  {
    name: "Minnesota SBDC",
    slug: "minnesota-sbdc",
    short_description:
      "Minnesota SBDC providing business development services statewide.",
    category: "sba",
    city: "Minneapolis",
    state: "MN",
    website: "https://www.mnsbdc.com",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Financial Analysis"],
    },
    source: "manual",
    source_id: "sbdc-mn",
  },
  {
    name: "Mississippi SBDC",
    slug: "mississippi-sbdc",
    short_description:
      "Mississippi SBDC at University of Mississippi providing business assistance.",
    category: "sba",
    city: "Jackson",
    state: "MS",
    website: "https://www.mssbdc.org",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Market Research"],
    },
    source: "manual",
    source_id: "sbdc-ms",
  },
  {
    name: "Missouri SBDC",
    slug: "missouri-sbdc",
    short_description:
      "Missouri SBDC at University of Missouri providing statewide assistance.",
    category: "sba",
    city: "Columbia",
    state: "MO",
    website: "https://www.missouribusiness.net/sbdc",
    details: {
      sba_type: "SBDC",
      services: ["Business Counseling", "Training", "Financial Analysis"],
    },
    source: "manual",
    source_id: "sbdc-mo",
  },
  {
    name: "New York SBDC",
    slug: "new-york-sbdc",
    short_description:
      "New York SBDC at SUNY providing business development across the state.",
    category: "sba",
    city: "Albany",
    state: "NY",
    website: "https://www.nysbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Export Assistance",
        "Technology Development",
      ],
    },
    source: "manual",
    source_id: "sbdc-ny",
  },
  {
    name: "Texas SBDC Network",
    slug: "texas-sbdc-network",
    short_description:
      "Texas SBDC network with centers across the state providing business assistance.",
    category: "sba",
    city: "San Antonio",
    state: "TX",
    website: "https://txsbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Government Contracting",
        "Export Assistance",
      ],
    },
    source: "manual",
    source_id: "sbdc-tx",
  },
  {
    name: "Washington SBDC",
    slug: "washington-sbdc",
    short_description:
      "Washington SBDC providing business development services across the state.",
    category: "sba",
    city: "Seattle",
    state: "WA",
    website: "https://wsbdc.org",
    details: {
      sba_type: "SBDC",
      services: [
        "Business Counseling",
        "Training",
        "Export Assistance",
        "Technology",
      ],
    },
    source: "manual",
    source_id: "sbdc-wa",
  },

  // Major SCORE Chapters
  {
    name: "SCORE Los Angeles",
    slug: "score-los-angeles",
    short_description:
      "Free business mentoring and workshops in the Los Angeles metro area.",
    category: "sba",
    city: "Los Angeles",
    state: "CA",
    website: "https://www.score.org/losangeles",
    details: {
      sba_type: "SCORE",
      services: [
        "One-on-One Mentoring",
        "Workshops",
        "Webinars",
        "Business Planning",
      ],
    },
    source: "manual",
    source_id: "score-la",
  },
  {
    name: "SCORE New York City",
    slug: "score-new-york-city",
    short_description:
      "Free business mentoring and workshops in the New York City metro area.",
    category: "sba",
    city: "New York",
    state: "NY",
    website: "https://www.score.org/newyorkcity",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-nyc",
  },
  {
    name: "SCORE Chicago",
    slug: "score-chicago",
    short_description:
      "Free business mentoring and workshops in the Chicago metro area.",
    category: "sba",
    city: "Chicago",
    state: "IL",
    website: "https://www.score.org/chicago",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-chicago",
  },
  {
    name: "SCORE Houston",
    slug: "score-houston",
    short_description:
      "Free business mentoring and workshops in the Houston metro area.",
    category: "sba",
    city: "Houston",
    state: "TX",
    website: "https://www.score.org/houston",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-houston",
  },
  {
    name: "SCORE Atlanta",
    slug: "score-atlanta",
    short_description:
      "Free business mentoring and workshops in the Atlanta metro area.",
    category: "sba",
    city: "Atlanta",
    state: "GA",
    website: "https://www.score.org/atlanta",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-atlanta",
  },
  {
    name: "SCORE Boston",
    slug: "score-boston",
    short_description:
      "Free business mentoring and workshops in the Boston metro area.",
    category: "sba",
    city: "Boston",
    state: "MA",
    website: "https://www.score.org/boston",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-boston",
  },
  {
    name: "SCORE Austin",
    slug: "score-austin",
    short_description:
      "Free business mentoring and workshops in the Austin metro area.",
    category: "sba",
    city: "Austin",
    state: "TX",
    website: "https://www.score.org/austin",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-austin",
  },
  {
    name: "SCORE Denver",
    slug: "score-denver",
    short_description:
      "Free business mentoring and workshops in the Denver metro area.",
    category: "sba",
    city: "Denver",
    state: "CO",
    website: "https://www.score.org/denver",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-denver",
  },
  {
    name: "SCORE San Francisco",
    slug: "score-san-francisco",
    short_description:
      "Free business mentoring and workshops in the San Francisco Bay Area.",
    category: "sba",
    city: "San Francisco",
    state: "CA",
    website: "https://www.score.org/sanfrancisco",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-sf",
  },
  {
    name: "SCORE Seattle",
    slug: "score-seattle",
    short_description:
      "Free business mentoring and workshops in the Seattle metro area.",
    category: "sba",
    city: "Seattle",
    state: "WA",
    website: "https://www.score.org/seattle",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-seattle",
  },
  {
    name: "SCORE Miami",
    slug: "score-miami",
    short_description:
      "Free business mentoring and workshops in the Miami metro area.",
    category: "sba",
    city: "Miami",
    state: "FL",
    website: "https://www.score.org/miami-dade",
    details: {
      sba_type: "SCORE",
      services: [
        "One-on-One Mentoring",
        "Workshops",
        "Webinars",
        "Spanish Language Services",
      ],
    },
    source: "manual",
    source_id: "score-miami",
  },
  {
    name: "SCORE Phoenix",
    slug: "score-phoenix",
    short_description:
      "Free business mentoring and workshops in the Phoenix metro area.",
    category: "sba",
    city: "Phoenix",
    state: "AZ",
    website: "https://www.score.org/phoenix",
    details: {
      sba_type: "SCORE",
      services: ["One-on-One Mentoring", "Workshops", "Webinars"],
    },
    source: "manual",
    source_id: "score-phoenix",
  },

  // Women's Business Centers
  {
    name: "Women's Business Center of California",
    slug: "wbc-california",
    short_description:
      "Training, counseling, and resources for women entrepreneurs in California.",
    category: "sba",
    city: "Los Angeles",
    state: "CA",
    website: "https://www.wbec-west.com",
    details: {
      sba_type: "WBC",
      services: [
        "Business Counseling",
        "Training",
        "Networking",
        "Access to Capital",
      ],
    },
    source: "manual",
    source_id: "wbc-ca",
  },
  {
    name: "Women's Business Enterprise Center - New York",
    slug: "wbc-new-york",
    short_description:
      "Resources and support for women-owned businesses in New York.",
    category: "sba",
    city: "New York",
    state: "NY",
    website: "https://www.wbencny.org",
    details: {
      sba_type: "WBC",
      services: [
        "Business Certification",
        "Counseling",
        "Corporate Connections",
      ],
    },
    source: "manual",
    source_id: "wbc-ny",
  },
  {
    name: "Texas Women's Business Center",
    slug: "wbc-texas",
    short_description:
      "Supporting women entrepreneurs across Texas with training and resources.",
    category: "sba",
    city: "Houston",
    state: "TX",
    website: "https://www.womenbusinessowners.org",
    details: {
      sba_type: "WBC",
      services: ["Business Counseling", "Training", "Networking"],
    },
    source: "manual",
    source_id: "wbc-tx",
  },
  {
    name: "Chicago Women's Business Development Center",
    slug: "wbc-chicago",
    short_description:
      "Training and resources for women entrepreneurs in Chicago.",
    category: "sba",
    city: "Chicago",
    state: "IL",
    website: "https://www.wbdc.org",
    details: {
      sba_type: "WBC",
      services: [
        "Business Counseling",
        "Training",
        "Access to Capital",
        "Certification",
      ],
    },
    source: "manual",
    source_id: "wbc-chicago",
  },
  {
    name: "Florida Women's Business Center",
    slug: "wbc-florida",
    short_description:
      "Supporting women-owned businesses throughout Florida.",
    category: "sba",
    city: "Miami",
    state: "FL",
    website: "https://flwbc.org",
    details: {
      sba_type: "WBC",
      services: ["Business Counseling", "Training", "Networking"],
    },
    source: "manual",
    source_id: "wbc-fl",
  },
];

// ============================================================================
// ACCELERATOR DATA
// ============================================================================

const accelerators: ResourceListing[] = [
  {
    name: "Y Combinator",
    slug: "y-combinator",
    description:
      "Y Combinator is a startup accelerator that has launched over 4,000 companies including Airbnb, Stripe, DoorDash, and Reddit. The program provides $500,000 in funding, intensive mentorship, and access to the largest network of startup founders and investors in the world.",
    short_description:
      "The world's most famous startup accelerator. $500K funding, 3-month program, Demo Day access.",
    category: "accelerator",
    subcategories: ["tech", "early-stage"],
    city: "San Francisco",
    state: "CA",
    is_remote: true,
    is_nationwide: true,
    website: "https://www.ycombinator.com",
    details: {
      duration_weeks: 12,
      equity_taken: 7,
      funding_provided: 500000,
      batch_size: 250,
      next_deadline: "Rolling",
      notable_alumni: [
        "Airbnb",
        "Stripe",
        "DoorDash",
        "Coinbase",
        "Reddit",
        "Instacart",
      ],
    },
    logo_url:
      "https://www.ycombinator.com/assets/ycombinator-logo-b603b0a270e12b1d42b7cca9d4527a9b206adf8293a77f9f3e8b6cb542fcbfa7.png",
    source: "manual",
    source_id: "acc-yc",
    is_featured: true,
  },
  {
    name: "Techstars",
    slug: "techstars",
    description:
      "Techstars is a global accelerator network that supports entrepreneurs across various industries and geographies. With programs in over 150 countries, Techstars provides $120,000 in funding, a 13-week intensive program, and lifetime access to the Techstars network of 10,000+ founders and 10,000+ mentors.",
    short_description:
      "Global accelerator network with 150+ programs. $120K funding, 13-week program, industry-specific tracks.",
    category: "accelerator",
    subcategories: ["tech", "early-stage"],
    city: "Boulder",
    state: "CO",
    is_remote: true,
    is_nationwide: true,
    website: "https://www.techstars.com",
    details: {
      duration_weeks: 13,
      equity_taken: 6,
      funding_provided: 120000,
      batch_size: 10,
      next_deadline: "Varies by program",
      notable_alumni: ["SendGrid", "ClassPass", "DigitalOcean", "Zipline"],
    },
    source: "manual",
    source_id: "acc-techstars",
    is_featured: true,
  },
  {
    name: "500 Global",
    slug: "500-global",
    description:
      "500 Global (formerly 500 Startups) is a venture capital firm and startup accelerator. They have invested in over 2,800 companies across 80+ countries. Their accelerator program provides funding, mentorship, and global connections.",
    short_description:
      "Global VC firm and accelerator with 2,800+ portfolio companies across 80+ countries.",
    category: "accelerator",
    subcategories: ["tech", "global"],
    city: "San Francisco",
    state: "CA",
    is_remote: true,
    is_nationwide: true,
    website: "https://500.co",
    details: {
      duration_weeks: 16,
      equity_taken: 6,
      funding_provided: 150000,
      batch_size: 30,
      next_deadline: "Rolling",
      notable_alumni: ["Canva", "Credit Karma", "Udemy", "Grab"],
    },
    source: "manual",
    source_id: "acc-500",
    is_featured: true,
  },
  {
    name: "MassChallenge",
    slug: "masschallenge",
    description:
      "MassChallenge is a non-profit startup accelerator that does not take equity. They support early-stage entrepreneurs through acceleration programs, mentorship, and access to corporate partners. Over $3 billion has been raised by MassChallenge alumni.",
    short_description:
      "Zero-equity accelerator supporting early-stage founders. Global programs, $3B+ raised by alumni.",
    category: "accelerator",
    subcategories: ["early-stage", "no-equity"],
    city: "Boston",
    state: "MA",
    is_remote: true,
    is_nationwide: true,
    website: "https://masschallenge.org",
    details: {
      duration_weeks: 16,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 128,
      next_deadline: "Varies by program",
      notable_alumni: ["Ginkgo Bioworks", "Movable Ink", "Parexel"],
    },
    source: "manual",
    source_id: "acc-masschallenge",
  },
  {
    name: "SOSV",
    slug: "sosv",
    description:
      "SOSV is a global venture capital firm that runs multiple accelerator programs including HAX (hardware), IndieBio (life sciences), Food-X (food tech), and dLab (blockchain). They have invested in over 1,500 companies.",
    short_description:
      "Multi-vertical accelerator running HAX, IndieBio, Food-X, and dLab. Specialized deep-tech focus.",
    category: "accelerator",
    subcategories: ["hardware", "biotech", "deep-tech"],
    city: "Princeton",
    state: "NJ",
    is_nationwide: true,
    website: "https://sosv.com",
    details: {
      duration_weeks: 16,
      equity_taken: 7,
      funding_provided: 250000,
      batch_size: 15,
      next_deadline: "Varies by program",
      notable_alumni: [
        "Memphis Meats",
        "Geltor",
        "Perfect Day",
        "Formlabs",
        "Makeblock",
      ],
    },
    source: "manual",
    source_id: "acc-sosv",
  },
  {
    name: "Plug and Play Tech Center",
    slug: "plug-and-play",
    description:
      "Plug and Play is an innovation platform connecting startups with corporate partners. They run industry-specific accelerator programs and have over 500 corporate partners including PayPal, Mercedes-Benz, and Nike.",
    short_description:
      "Innovation platform connecting startups with 500+ corporate partners. Industry-specific programs.",
    category: "accelerator",
    subcategories: ["tech", "corporate"],
    city: "Sunnyvale",
    state: "CA",
    is_nationwide: true,
    website: "https://www.plugandplaytechcenter.com",
    details: {
      duration_weeks: 12,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 100,
      next_deadline: "Rolling",
      notable_alumni: ["PayPal", "Dropbox", "LendingClub"],
    },
    source: "manual",
    source_id: "acc-plugandplay",
  },
  {
    name: "Founder Institute",
    slug: "founder-institute",
    description:
      "The Founder Institute is the world's largest pre-seed startup accelerator with chapters in 200+ cities across 65 countries. They have helped launch over 6,000 companies that have raised over $1.75 billion.",
    short_description:
      "World's largest pre-seed accelerator. 200+ cities, 65 countries, 6,000+ companies launched.",
    category: "accelerator",
    subcategories: ["pre-seed", "global"],
    city: "San Francisco",
    state: "CA",
    is_remote: true,
    is_nationwide: true,
    website: "https://fi.co",
    details: {
      duration_weeks: 16,
      equity_taken: 4,
      funding_provided: 0,
      batch_size: 20,
      next_deadline: "Quarterly",
      notable_alumni: ["Udemy", "Rover", "EcoModo"],
    },
    source: "manual",
    source_id: "acc-fi",
  },
  {
    name: "Startupbootcamp",
    slug: "startupbootcamp",
    description:
      "Startupbootcamp is a global network of industry-specific accelerators with programs in fintech, healthtech, mobility, smart city, and more. Based in Europe with programs worldwide.",
    short_description:
      "Global industry-focused accelerator network with fintech, healthtech, mobility programs.",
    category: "accelerator",
    subcategories: ["fintech", "healthtech", "global"],
    city: "New York",
    state: "NY",
    is_nationwide: true,
    website: "https://www.startupbootcamp.org",
    details: {
      duration_weeks: 12,
      equity_taken: 8,
      funding_provided: 20000,
      batch_size: 10,
      next_deadline: "Varies by program",
      notable_alumni: ["Bux", "Dealroom", "Spotcap"],
    },
    source: "manual",
    source_id: "acc-sbc",
  },
  {
    name: "Dreamit Ventures",
    slug: "dreamit-ventures",
    description:
      "Dreamit is an early-stage venture fund and accelerator focusing on healthtech, urbantech, and securetech. Based in Philadelphia with a strong East Coast network.",
    short_description:
      "Early-stage VC and accelerator focused on healthtech, urbantech, securetech.",
    category: "accelerator",
    subcategories: ["healthtech", "early-stage"],
    city: "Philadelphia",
    state: "PA",
    website: "https://www.dreamit.com",
    details: {
      duration_weeks: 14,
      equity_taken: 6,
      funding_provided: 50000,
      batch_size: 8,
      next_deadline: "Rolling",
      notable_alumni: ["DuckDuckGo", "Zonoff", "InfoBionic"],
    },
    source: "manual",
    source_id: "acc-dreamit",
  },
  {
    name: "Capital Factory",
    slug: "capital-factory",
    description:
      "Capital Factory is the center of gravity for entrepreneurs in Texas, providing accelerator programs, coworking, and the largest community of startups, investors, and mentors in the state.",
    short_description:
      "Texas's leading startup accelerator and coworking hub. Center of the Austin tech ecosystem.",
    category: "accelerator",
    subcategories: ["tech", "regional"],
    city: "Austin",
    state: "TX",
    website: "https://www.capitalfactory.com",
    details: {
      duration_weeks: 12,
      equity_taken: 1,
      funding_provided: 25000,
      batch_size: 20,
      next_deadline: "Rolling",
      notable_alumni: [
        "WP Engine",
        "Indeed",
        "RetailMeNot",
        "Main Street Hub",
      ],
    },
    source: "manual",
    source_id: "acc-capitalfactory",
  },
  {
    name: "Techstars Social Impact",
    slug: "techstars-social-impact",
    description:
      "Techstars Social Impact accelerates startups using technology to create positive social and environmental outcomes. Focus areas include sustainability, health equity, education access, and economic opportunity.",
    short_description:
      "Accelerator for startups creating positive social and environmental impact. $120K funding.",
    category: "accelerator",
    subcategories: ["social-impact", "tech"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "equity",
      "tech_access",
    ],
    city: "Denver",
    state: "CO",
    is_remote: true,
    is_nationwide: true,
    website: "https://www.techstars.com/accelerators/social-impact",
    details: {
      duration_weeks: 13,
      equity_taken: 6,
      funding_provided: 120000,
      batch_size: 10,
      next_deadline: "Check website",
    },
    source: "manual",
    source_id: "acc-techstars-impact",
    is_featured: true,
  },
  {
    name: "Echoing Green",
    slug: "echoing-green",
    description:
      "Echoing Green finds and invests in emerging social entrepreneurs with bold ideas for change. Their fellowship provides $80,000 in funding plus leadership development and network access.",
    short_description:
      "Social entrepreneur fellowship providing $80K funding and leadership development.",
    category: "accelerator",
    subcategories: ["social-impact", "fellowship"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "equity",
      "mental_health",
    ],
    city: "New York",
    state: "NY",
    is_nationwide: true,
    website: "https://echoinggreen.org",
    details: {
      duration_weeks: 78,
      equity_taken: 0,
      funding_provided: 80000,
      batch_size: 30,
      next_deadline: "Annual application",
      notable_alumni: [
        "Teach For America",
        "City Year",
        "One Acre Fund",
        "SKS Microfinance",
      ],
    },
    source: "manual",
    source_id: "acc-echoinggreen",
    is_featured: true,
  },
  {
    name: "Unreasonable Institute",
    slug: "unreasonable-institute",
    description:
      "Unreasonable Group supports entrepreneurs solving major world challenges through their ventures. Their accelerator and fellowship programs connect impact-driven founders with mentors and investors.",
    short_description:
      "Accelerator for entrepreneurs solving global challenges at scale. Impact-first focus.",
    category: "accelerator",
    subcategories: ["social-impact", "climate"],
    cause_areas: [
      "environment",
      "health",
      "poverty",
      "food_security",
      "tech_access",
    ],
    city: "Boulder",
    state: "CO",
    is_nationwide: true,
    website: "https://unreasonablegroup.com",
    details: {
      duration_weeks: 2,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 20,
      next_deadline: "Check website",
    },
    source: "manual",
    source_id: "acc-unreasonable",
  },
  {
    name: "Halcyon",
    slug: "halcyon",
    description:
      "Halcyon is a Washington, DC-based nonprofit that supports social entrepreneurs with bold ideas to change the world. Their fellowship provides housing, stipends, and intensive coaching.",
    short_description:
      "DC-based social enterprise accelerator with housing, stipends, and intensive coaching.",
    category: "accelerator",
    subcategories: ["social-impact", "fellowship"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "equity",
      "arts",
    ],
    city: "Washington",
    state: "DC",
    website: "https://halcyonhouse.org",
    details: {
      duration_weeks: 18,
      equity_taken: 0,
      funding_provided: 10000,
      batch_size: 18,
      next_deadline: "Annual application",
    },
    source: "manual",
    source_id: "acc-halcyon",
  },
  {
    name: "Village Capital",
    slug: "village-capital",
    description:
      "Village Capital finds, trains, and invests in entrepreneurs solving real-world problems in agriculture, education, energy, financial inclusion, and health.",
    short_description:
      "Impact-focused VC and accelerator in agriculture, education, energy, financial inclusion, health.",
    category: "accelerator",
    subcategories: ["social-impact", "venture"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "food_security",
    ],
    city: "Washington",
    state: "DC",
    is_nationwide: true,
    website: "https://vilcap.com",
    details: {
      duration_weeks: 12,
      equity_taken: 0,
      funding_provided: 50000,
      batch_size: 12,
      next_deadline: "Rolling by sector",
    },
    source: "manual",
    source_id: "acc-vilcap",
  },
  {
    name: "Impact Hub",
    slug: "impact-hub",
    description:
      "Impact Hub is a global network of coworking spaces and innovation hubs for social entrepreneurs. They offer acceleration programs, events, and community for impact-driven founders.",
    short_description:
      "Global network of 100+ hubs for social entrepreneurs with coworking and acceleration.",
    category: "accelerator",
    subcategories: ["social-impact", "coworking"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "equity",
      "arts",
    ],
    city: "Oakland",
    state: "CA",
    is_nationwide: true,
    website: "https://impacthub.net",
    details: {
      duration_weeks: 12,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 15,
      next_deadline: "Varies by hub",
    },
    source: "manual",
    source_id: "acc-impacthub",
  },
  {
    name: "IDEO CoLab",
    slug: "ideo-colab",
    description:
      "IDEO CoLab is an investment arm and startup accelerator from design firm IDEO, focusing on emerging technologies including AI, blockchain, and biotech.",
    short_description:
      "Design-driven accelerator from IDEO focusing on emerging tech: AI, blockchain, biotech.",
    category: "accelerator",
    subcategories: ["design", "deep-tech"],
    city: "San Francisco",
    state: "CA",
    website: "https://www.ideocolab.com",
    details: {
      duration_weeks: 12,
      equity_taken: 5,
      funding_provided: 100000,
      batch_size: 6,
      next_deadline: "Rolling",
    },
    source: "manual",
    source_id: "acc-ideocolab",
  },
  {
    name: "Newchip Accelerator",
    slug: "newchip-accelerator",
    description:
      "Newchip is a fully online accelerator for pre-seed to Series A startups. They offer flexible programs with no equity taken and focus on fundraising support.",
    short_description:
      "Fully online accelerator with zero equity. Pre-seed to Series A, fundraising focused.",
    category: "accelerator",
    subcategories: ["online", "no-equity"],
    is_remote: true,
    is_nationwide: true,
    website: "https://launch.newchip.com",
    details: {
      duration_weeks: 24,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 100,
      next_deadline: "Rolling",
    },
    source: "manual",
    source_id: "acc-newchip",
  },
  {
    name: "Google for Startups Accelerator",
    slug: "google-for-startups-accelerator",
    description:
      "Google for Startups offers equity-free accelerator programs for seed to Series A startups. Programs include AI/ML focused tracks and regional programs across the globe.",
    short_description:
      "Equity-free accelerator from Google. AI/ML focus, global programs, Google mentorship.",
    category: "accelerator",
    subcategories: ["tech", "no-equity", "ai"],
    city: "Mountain View",
    state: "CA",
    is_remote: true,
    is_nationwide: true,
    website: "https://startup.google.com/accelerator/",
    details: {
      duration_weeks: 10,
      equity_taken: 0,
      funding_provided: 0,
      batch_size: 12,
      next_deadline: "Varies by program",
    },
    source: "manual",
    source_id: "acc-google",
    is_featured: true,
  },
  {
    name: "Microsoft for Startups Founders Hub",
    slug: "microsoft-for-startups",
    description:
      "Microsoft for Startups Founders Hub provides up to $150,000 in Azure credits, development tools, and mentorship. Open to all startups at any stage with no equity required.",
    short_description:
      "Up to $150K in Azure credits, dev tools, mentorship. Zero equity, open to all stages.",
    category: "accelerator",
    subcategories: ["tech", "no-equity", "cloud"],
    city: "Redmond",
    state: "WA",
    is_remote: true,
    is_nationwide: true,
    website: "https://www.microsoft.com/en-us/startups",
    details: {
      duration_weeks: 52,
      equity_taken: 0,
      funding_provided: 150000,
      batch_size: 0,
      next_deadline: "Rolling",
    },
    source: "manual",
    source_id: "acc-microsoft",
    is_featured: true,
  },
];

// ============================================================================
// GRANTS DATA
// ============================================================================

const grants: ResourceListing[] = [
  {
    name: "Amber Grant for Women",
    slug: "amber-grant-for-women",
    description:
      "The Amber Grant awards $10,000 monthly to women-owned businesses. At the end of each year, one monthly recipient receives an additional $25,000 grand prize. No complicated applications — just tell your business story.",
    short_description:
      "$10,000 monthly grant for women-owned businesses. Plus $25K annual grand prize.",
    category: "grant",
    subcategories: ["women-owned", "small-business"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://ambergrantsforwomen.com",
    details: {
      amount_min: 10000,
      amount_max: 25000,
      deadline: "End of each month",
      eligibility: "Women-owned businesses",
      application_url: "https://ambergrantsforwomen.com/get-an-amber-grant/",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-amber",
    is_featured: true,
  },
  {
    name: "SBIR/STTR Program",
    slug: "sbir-sttr-program",
    description:
      "The Small Business Innovation Research (SBIR) and Small Business Technology Transfer (STTR) programs are highly competitive federal programs that encourage small businesses to engage in R&D with commercialization potential. Phase I awards up to $275,000; Phase II up to $1.5M.",
    short_description:
      "Federal R&D grants for small businesses. Phase I: up to $275K, Phase II: up to $1.5M.",
    category: "grant",
    subcategories: ["federal", "tech", "research"],
    is_nationwide: true,
    website: "https://www.sbir.gov",
    details: {
      amount_min: 50000,
      amount_max: 1500000,
      deadline: "Varies by agency",
      eligibility: "Small businesses with R&D capacity",
      application_url: "https://www.sbir.gov/apply",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-sbir",
    is_featured: true,
  },
  {
    name: "SSBCI Small Business Grants",
    slug: "ssbci-grants",
    description:
      "The State Small Business Credit Initiative (SSBCI) provides nearly $10 billion to states to expand access to capital for small businesses. Programs vary by state but include equity investments, loan guarantees, and direct lending.",
    short_description:
      "State-administered grants and loans from $10B federal program. Varies by state.",
    category: "grant",
    subcategories: ["federal", "state"],
    is_nationwide: true,
    website: "https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci",
    details: {
      amount_min: 10000,
      amount_max: 500000,
      deadline: "Varies by state",
      eligibility: "Small businesses (state-specific criteria)",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-ssbci",
  },
  {
    name: "FedEx Small Business Grant Contest",
    slug: "fedex-small-business-grant",
    description:
      "FedEx awards $250,000 in grants to small businesses annually. Grand prize is $50,000 plus $7,500 in FedEx services. Additional prizes ranging from $15,000 to $30,000.",
    short_description:
      "$250K total in grants. Grand prize: $50K + $7,500 FedEx services.",
    category: "grant",
    subcategories: ["corporate", "small-business"],
    is_nationwide: true,
    website: "https://www.fedex.com/en-us/small-business/grant-contest.html",
    details: {
      amount_min: 15000,
      amount_max: 50000,
      deadline: "Annual (typically February-March)",
      eligibility: "US-based small businesses",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-fedex",
  },
  {
    name: "Grants.gov Federal Grants Portal",
    slug: "grants-gov",
    description:
      "Grants.gov is the central portal for all federal grant opportunities. Over $500 billion in grants are awarded annually through 26 federal agencies. Searchable by category including community development, economic development, and more.",
    short_description:
      "Central portal for all federal grants. $500B+ awarded annually across 26 agencies.",
    category: "grant",
    subcategories: ["federal"],
    is_nationwide: true,
    website: "https://www.grants.gov",
    details: {
      amount_min: 1000,
      amount_max: 100000000,
      deadline: "Varies",
      eligibility: "Varies by program",
      application_url: "https://www.grants.gov/applicants/apply-for-grants.html",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-grantsgov",
    is_featured: true,
  },
  {
    name: "National Science Foundation (NSF) Grants",
    slug: "nsf-grants",
    description:
      "NSF provides grants for research and education across science and engineering fields. Small business programs include SBIR/STTR and partnerships with universities.",
    short_description:
      "Research and innovation grants for science and engineering. SBIR/STTR programs available.",
    category: "grant",
    subcategories: ["federal", "research", "tech"],
    is_nationwide: true,
    website: "https://www.nsf.gov/funding/",
    details: {
      amount_min: 10000,
      amount_max: 3000000,
      deadline: "Varies by program",
      eligibility: "Researchers, small businesses",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-nsf",
  },
  {
    name: "USDA Rural Business Development Grants",
    slug: "usda-rural-grants",
    description:
      "USDA provides grants to support targeted technical assistance, training, and other activities to develop or expand small and emerging private businesses in rural areas.",
    short_description:
      "Grants for small business development in rural areas. Up to $500K available.",
    category: "grant",
    subcategories: ["federal", "rural"],
    is_nationwide: true,
    website: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
    details: {
      amount_min: 10000,
      amount_max: 500000,
      deadline: "Rolling",
      eligibility: "Rural businesses and organizations",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-usda",
  },
  {
    name: "EDA Economic Development Grants",
    slug: "eda-grants",
    description:
      "The Economic Development Administration provides grants to support economic development and job creation. Programs include Public Works, Economic Adjustment, and Build Back Better Regional Challenge.",
    short_description:
      "Federal grants for economic development and job creation. Multiple programs available.",
    category: "grant",
    subcategories: ["federal", "economic-development"],
    is_nationwide: true,
    website: "https://www.eda.gov/funding/programs/",
    details: {
      amount_min: 100000,
      amount_max: 30000000,
      deadline: "Varies by program",
      eligibility: "States, localities, nonprofits",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-eda",
  },
  {
    name: "SBA Community Advantage Loans",
    slug: "sba-community-advantage",
    description:
      "SBA Community Advantage loans are designed for small businesses in underserved markets. Loans up to $350,000 through mission-based lenders.",
    short_description:
      "SBA loans up to $350K for businesses in underserved communities.",
    category: "grant",
    subcategories: ["sba", "underserved"],
    cause_areas: ["equity", "poverty"],
    is_nationwide: true,
    website: "https://www.sba.gov/funding-programs/loans/community-advantage-loans",
    details: {
      amount_min: 10000,
      amount_max: 350000,
      deadline: "Rolling",
      eligibility: "Small businesses in underserved markets",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-sba-ca",
  },
  {
    name: "Visa Everywhere Initiative",
    slug: "visa-everywhere-initiative",
    description:
      "Visa's global innovation program invites startups to pitch solutions in payments, commerce, financial services, and security. Winners receive funding and potential partnership with Visa.",
    short_description:
      "Global startup competition from Visa. Fintech and payments focus. Prizes + partnership potential.",
    category: "grant",
    subcategories: ["corporate", "fintech", "competition"],
    is_nationwide: true,
    website: "https://usa.visa.com/visa-everywhere/everywhere-initiative.html",
    details: {
      amount_min: 25000,
      amount_max: 100000,
      deadline: "Annual",
      eligibility: "Fintech startups",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-visa",
  },
  {
    name: "Patagonia Environmental Grants",
    slug: "patagonia-grants",
    description:
      "Patagonia provides grants to environmental organizations working on the root causes of environmental crisis. Grants range from $5,000 to $20,000 and prioritize direct-action groups.",
    short_description:
      "Grants for environmental organizations. $5K-$20K for direct-action groups.",
    category: "grant",
    subcategories: ["corporate", "environmental"],
    cause_areas: ["environment"],
    is_nationwide: true,
    website: "https://www.patagonia.com/actionworks/grants/",
    details: {
      amount_min: 5000,
      amount_max: 20000,
      deadline: "Rolling (April 30 and August 31)",
      eligibility: "Environmental nonprofits",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-patagonia",
  },
  {
    name: "Google.org Impact Challenge",
    slug: "google-impact-challenge",
    description:
      "Google.org supports nonprofits and social enterprises using technology to create positive change. Grants include funding, Google Ad Grants, and technical support.",
    short_description:
      "Grants and tech support for nonprofits using technology for social impact.",
    category: "grant",
    subcategories: ["corporate", "tech", "nonprofit"],
    cause_areas: ["tech_access", "education", "equity"],
    is_nationwide: true,
    website: "https://www.google.org/",
    details: {
      amount_min: 100000,
      amount_max: 5000000,
      deadline: "Varies by program",
      eligibility: "Nonprofits using technology for impact",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-google",
  },
  {
    name: "HelloAlice Small Business Grants",
    slug: "helloalice-grants",
    description:
      "Hello Alice aggregates grant opportunities for small businesses and provides their own grants focusing on underrepresented entrepreneurs including women, minorities, veterans, and LGBTQ+ owners.",
    short_description:
      "Grant aggregator + own grants for underrepresented entrepreneurs.",
    category: "grant",
    subcategories: ["women-owned", "minority-owned", "veteran"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://helloalice.com/grants/",
    details: {
      amount_min: 5000,
      amount_max: 50000,
      deadline: "Various",
      eligibility: "Underrepresented small business owners",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-helloalice",
  },
  {
    name: "National Association for the Self-Employed (NASE) Growth Grants",
    slug: "nase-growth-grants",
    description:
      "NASE provides micro-grants up to $4,000 to help small businesses grow. Available to NASE members quarterly.",
    short_description:
      "Micro-grants up to $4,000 for small business growth. Quarterly awards.",
    category: "grant",
    subcategories: ["small-business", "micro-grant"],
    is_nationwide: true,
    website: "https://www.nase.org/become-a-member/member-benefits/business-resources/growth-grants",
    details: {
      amount_min: 1000,
      amount_max: 4000,
      deadline: "Quarterly",
      eligibility: "NASE members",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-nase",
  },
  {
    name: "Tory Burch Foundation Fellows Program",
    slug: "tory-burch-fellows",
    description:
      "The Tory Burch Foundation Fellows Program provides women entrepreneurs with education, access to capital, and a community of support. Fellows receive grants and mentorship.",
    short_description:
      "Fellowship for women entrepreneurs with grants, education, and mentorship.",
    category: "grant",
    subcategories: ["women-owned", "fellowship"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://www.toryburchfoundation.org/",
    details: {
      amount_min: 5000,
      amount_max: 100000,
      deadline: "Annual",
      eligibility: "Women-owned businesses",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-toryburch",
  },
  {
    name: "Cartier Women's Initiative",
    slug: "cartier-womens-initiative",
    description:
      "The Cartier Women's Initiative is an annual international entrepreneurship program for women impact entrepreneurs. Regional winners receive $100,000 in grants plus coaching and mentorship.",
    short_description:
      "International program for women impact entrepreneurs. $100K grants + coaching.",
    category: "grant",
    subcategories: ["women-owned", "social-impact", "international"],
    cause_areas: ["equity", "environment", "health", "education"],
    is_nationwide: true,
    website: "https://www.cartierwomensinitiative.com",
    details: {
      amount_min: 30000,
      amount_max: 100000,
      deadline: "Annual (typically June)",
      eligibility: "Women-led impact businesses",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-cartier",
    is_featured: true,
  },
  {
    name: "Verizon Small Business Digital Ready Grants",
    slug: "verizon-digital-ready",
    description:
      "Verizon provides $10,000 grants to small businesses through their Digital Ready program. The program also offers free online courses, coaching, and networking opportunities.",
    short_description:
      "$10K grants plus free digital skills training for small businesses.",
    category: "grant",
    subcategories: ["corporate", "small-business", "tech"],
    cause_areas: ["tech_access"],
    is_nationwide: true,
    website: "https://www.verizon.com/about/responsibility/digital-inclusion/small-business-digital-ready",
    details: {
      amount_min: 10000,
      amount_max: 10000,
      deadline: "Monthly",
      eligibility: "Small businesses that complete the curriculum",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-verizon",
  },
  {
    name: "Comcast RISE Grant Program",
    slug: "comcast-rise",
    description:
      "Comcast RISE (Representation, Investment, Strength, Empowerment) provides grants, marketing services, and technology to small businesses owned by people of color.",
    short_description:
      "Grants, marketing, and tech for businesses owned by people of color.",
    category: "grant",
    subcategories: ["corporate", "minority-owned"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://www.comcastrise.com",
    details: {
      amount_min: 5000,
      amount_max: 10000,
      deadline: "Rolling",
      eligibility: "Small businesses owned by people of color",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-comcast",
  },
  {
    name: "IFundWomen Universal Grant Application",
    slug: "ifundwomen-universal",
    description:
      "IFundWomen provides a universal grant application that matches women entrepreneurs with relevant grant opportunities from their corporate partners.",
    short_description:
      "Universal grant application matching women with relevant opportunities.",
    category: "grant",
    subcategories: ["women-owned"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://ifundwomen.com/universal-grant-application",
    details: {
      amount_min: 5000,
      amount_max: 100000,
      deadline: "Rolling",
      eligibility: "Women entrepreneurs",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-ifundwomen",
  },
  {
    name: "Black Founders Matter Grant",
    slug: "black-founders-matter",
    description:
      "Grants specifically for Black entrepreneurs and founders. Various grant programs available through different corporate and foundation partners.",
    short_description:
      "Grant programs specifically supporting Black entrepreneurs and founders.",
    category: "grant",
    subcategories: ["minority-owned", "black-owned"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://blackfoundersmatter.com",
    details: {
      amount_min: 5000,
      amount_max: 50000,
      deadline: "Various",
      eligibility: "Black-owned businesses",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-bfm",
  },
  {
    name: "StreetShares Foundation Grants",
    slug: "streetshares-grants",
    description:
      "StreetShares Foundation provides grants to veteran and military spouse-owned businesses. Grants up to $15,000 available through their regular program.",
    short_description:
      "Grants up to $15K for veteran and military spouse-owned businesses.",
    category: "grant",
    subcategories: ["veteran"],
    is_nationwide: true,
    website: "https://streetsharesfoundation.org",
    details: {
      amount_min: 5000,
      amount_max: 15000,
      deadline: "Rolling",
      eligibility: "Veteran and military spouse-owned businesses",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-streetshares",
  },
  {
    name: "Minority Business Development Agency (MBDA) Grants",
    slug: "mbda-grants",
    description:
      "MBDA provides funding and technical assistance to minority-owned businesses through Business Centers nationwide. Programs include access to capital, contracts, and markets.",
    short_description:
      "Federal assistance for minority-owned businesses. Capital, contracts, and markets.",
    category: "grant",
    subcategories: ["federal", "minority-owned"],
    cause_areas: ["equity"],
    is_nationwide: true,
    website: "https://www.mbda.gov",
    details: {
      amount_min: 10000,
      amount_max: 500000,
      deadline: "Varies",
      eligibility: "Minority-owned businesses",
      grant_type: "federal",
    },
    source: "manual",
    source_id: "grant-mbda",
  },
  {
    name: "The Pollination Project Seed Grants",
    slug: "pollination-project",
    description:
      "The Pollination Project provides $1,000 seed grants daily to grassroots social change projects. No nonprofit status required. Focus on compassion and social good.",
    short_description:
      "Daily $1,000 seed grants for grassroots social change. No 501c3 needed.",
    category: "grant",
    subcategories: ["social-impact", "seed-grant"],
    cause_areas: [
      "environment",
      "education",
      "health",
      "poverty",
      "equity",
      "animals",
      "arts",
    ],
    is_nationwide: true,
    website: "https://thepollinationproject.org",
    details: {
      amount_min: 1000,
      amount_max: 1000,
      deadline: "Rolling (daily grants)",
      eligibility: "Individuals or grassroots groups",
      grant_type: "private",
    },
    source: "manual",
    source_id: "grant-pollination",
  },
  {
    name: "Ben & Jerry's Foundation Grassroots Organizing Grants",
    slug: "ben-jerrys-grants",
    description:
      "Ben & Jerry's Foundation provides grants to grassroots organizing groups working on social and environmental justice. Grants typically range from $1,000 to $25,000.",
    short_description:
      "Grants for grassroots social and environmental justice organizing.",
    category: "grant",
    subcategories: ["social-impact", "environmental"],
    cause_areas: ["environment", "equity", "poverty"],
    is_nationwide: true,
    website: "https://benandjerrysfoundation.org",
    details: {
      amount_min: 1000,
      amount_max: 25000,
      deadline: "Rolling (quarterly reviews)",
      eligibility: "Grassroots organizations",
      grant_type: "corporate",
    },
    source: "manual",
    source_id: "grant-benjerrys",
  },
];

// ============================================================================
// LOCATION DATA (Top US Cities)
// ============================================================================

const majorLocations: ResourceLocation[] = [
  {
    city: "New York",
    state: "NY",
    state_full: "New York",
    slug: "new-york-ny",
    latitude: 40.7128,
    longitude: -74.006,
    population: 8336817,
  },
  {
    city: "Los Angeles",
    state: "CA",
    state_full: "California",
    slug: "los-angeles-ca",
    latitude: 34.0522,
    longitude: -118.2437,
    population: 3979576,
  },
  {
    city: "Chicago",
    state: "IL",
    state_full: "Illinois",
    slug: "chicago-il",
    latitude: 41.8781,
    longitude: -87.6298,
    population: 2693976,
  },
  {
    city: "Houston",
    state: "TX",
    state_full: "Texas",
    slug: "houston-tx",
    latitude: 29.7604,
    longitude: -95.3698,
    population: 2320268,
  },
  {
    city: "Phoenix",
    state: "AZ",
    state_full: "Arizona",
    slug: "phoenix-az",
    latitude: 33.4484,
    longitude: -112.074,
    population: 1680992,
  },
  {
    city: "Philadelphia",
    state: "PA",
    state_full: "Pennsylvania",
    slug: "philadelphia-pa",
    latitude: 39.9526,
    longitude: -75.1652,
    population: 1584064,
  },
  {
    city: "San Antonio",
    state: "TX",
    state_full: "Texas",
    slug: "san-antonio-tx",
    latitude: 29.4241,
    longitude: -98.4936,
    population: 1547253,
  },
  {
    city: "San Diego",
    state: "CA",
    state_full: "California",
    slug: "san-diego-ca",
    latitude: 32.7157,
    longitude: -117.1611,
    population: 1423851,
  },
  {
    city: "Dallas",
    state: "TX",
    state_full: "Texas",
    slug: "dallas-tx",
    latitude: 32.7767,
    longitude: -96.797,
    population: 1343573,
  },
  {
    city: "San Jose",
    state: "CA",
    state_full: "California",
    slug: "san-jose-ca",
    latitude: 37.3382,
    longitude: -121.8863,
    population: 1021795,
  },
  {
    city: "Austin",
    state: "TX",
    state_full: "Texas",
    slug: "austin-tx",
    latitude: 30.2672,
    longitude: -97.7431,
    population: 978908,
  },
  {
    city: "Jacksonville",
    state: "FL",
    state_full: "Florida",
    slug: "jacksonville-fl",
    latitude: 30.3322,
    longitude: -81.6557,
    population: 911507,
  },
  {
    city: "Fort Worth",
    state: "TX",
    state_full: "Texas",
    slug: "fort-worth-tx",
    latitude: 32.7555,
    longitude: -97.3308,
    population: 909585,
  },
  {
    city: "Columbus",
    state: "OH",
    state_full: "Ohio",
    slug: "columbus-oh",
    latitude: 39.9612,
    longitude: -82.9988,
    population: 898553,
  },
  {
    city: "Charlotte",
    state: "NC",
    state_full: "North Carolina",
    slug: "charlotte-nc",
    latitude: 35.2271,
    longitude: -80.8431,
    population: 885708,
  },
  {
    city: "San Francisco",
    state: "CA",
    state_full: "California",
    slug: "san-francisco-ca",
    latitude: 37.7749,
    longitude: -122.4194,
    population: 874961,
  },
  {
    city: "Indianapolis",
    state: "IN",
    state_full: "Indiana",
    slug: "indianapolis-in",
    latitude: 39.7684,
    longitude: -86.158,
    population: 876384,
  },
  {
    city: "Seattle",
    state: "WA",
    state_full: "Washington",
    slug: "seattle-wa",
    latitude: 47.6062,
    longitude: -122.3321,
    population: 753675,
  },
  {
    city: "Denver",
    state: "CO",
    state_full: "Colorado",
    slug: "denver-co",
    latitude: 39.7392,
    longitude: -104.9903,
    population: 727211,
  },
  {
    city: "Washington",
    state: "DC",
    state_full: "District of Columbia",
    slug: "washington-dc",
    latitude: 38.9072,
    longitude: -77.0369,
    population: 689545,
  },
  {
    city: "Boston",
    state: "MA",
    state_full: "Massachusetts",
    slug: "boston-ma",
    latitude: 42.3601,
    longitude: -71.0589,
    population: 692600,
  },
  {
    city: "Nashville",
    state: "TN",
    state_full: "Tennessee",
    slug: "nashville-tn",
    latitude: 36.1627,
    longitude: -86.7816,
    population: 689447,
  },
  {
    city: "El Paso",
    state: "TX",
    state_full: "Texas",
    slug: "el-paso-tx",
    latitude: 31.7619,
    longitude: -106.485,
    population: 681124,
  },
  {
    city: "Detroit",
    state: "MI",
    state_full: "Michigan",
    slug: "detroit-mi",
    latitude: 42.3314,
    longitude: -83.0458,
    population: 670031,
  },
  {
    city: "Portland",
    state: "OR",
    state_full: "Oregon",
    slug: "portland-or",
    latitude: 45.5152,
    longitude: -122.6784,
    population: 654741,
  },
  {
    city: "Memphis",
    state: "TN",
    state_full: "Tennessee",
    slug: "memphis-tn",
    latitude: 35.1495,
    longitude: -90.049,
    population: 651073,
  },
  {
    city: "Oklahoma City",
    state: "OK",
    state_full: "Oklahoma",
    slug: "oklahoma-city-ok",
    latitude: 35.4676,
    longitude: -97.5164,
    population: 655057,
  },
  {
    city: "Las Vegas",
    state: "NV",
    state_full: "Nevada",
    slug: "las-vegas-nv",
    latitude: 36.1699,
    longitude: -115.1398,
    population: 644644,
  },
  {
    city: "Louisville",
    state: "KY",
    state_full: "Kentucky",
    slug: "louisville-ky",
    latitude: 38.2527,
    longitude: -85.7585,
    population: 633045,
  },
  {
    city: "Baltimore",
    state: "MD",
    state_full: "Maryland",
    slug: "baltimore-md",
    latitude: 39.2904,
    longitude: -76.6122,
    population: 585708,
  },
  {
    city: "Milwaukee",
    state: "WI",
    state_full: "Wisconsin",
    slug: "milwaukee-wi",
    latitude: 43.0389,
    longitude: -87.9065,
    population: 577222,
  },
  {
    city: "Albuquerque",
    state: "NM",
    state_full: "New Mexico",
    slug: "albuquerque-nm",
    latitude: 35.0844,
    longitude: -106.6504,
    population: 564559,
  },
  {
    city: "Tucson",
    state: "AZ",
    state_full: "Arizona",
    slug: "tucson-az",
    latitude: 32.2226,
    longitude: -110.9747,
    population: 548073,
  },
  {
    city: "Fresno",
    state: "CA",
    state_full: "California",
    slug: "fresno-ca",
    latitude: 36.7378,
    longitude: -119.7871,
    population: 542107,
  },
  {
    city: "Sacramento",
    state: "CA",
    state_full: "California",
    slug: "sacramento-ca",
    latitude: 38.5816,
    longitude: -121.4944,
    population: 524943,
  },
  {
    city: "Atlanta",
    state: "GA",
    state_full: "Georgia",
    slug: "atlanta-ga",
    latitude: 33.749,
    longitude: -84.388,
    population: 498715,
  },
  {
    city: "Kansas City",
    state: "MO",
    state_full: "Missouri",
    slug: "kansas-city-mo",
    latitude: 39.0997,
    longitude: -94.5786,
    population: 508090,
  },
  {
    city: "Miami",
    state: "FL",
    state_full: "Florida",
    slug: "miami-fl",
    latitude: 25.7617,
    longitude: -80.1918,
    population: 467963,
  },
  {
    city: "Raleigh",
    state: "NC",
    state_full: "North Carolina",
    slug: "raleigh-nc",
    latitude: 35.7796,
    longitude: -78.6382,
    population: 474069,
  },
  {
    city: "Oakland",
    state: "CA",
    state_full: "California",
    slug: "oakland-ca",
    latitude: 37.8044,
    longitude: -122.2712,
    population: 433031,
  },
  {
    city: "Minneapolis",
    state: "MN",
    state_full: "Minnesota",
    slug: "minneapolis-mn",
    latitude: 44.9778,
    longitude: -93.265,
    population: 429606,
  },
  {
    city: "Tampa",
    state: "FL",
    state_full: "Florida",
    slug: "tampa-fl",
    latitude: 27.9506,
    longitude: -82.4572,
    population: 399700,
  },
  {
    city: "New Orleans",
    state: "LA",
    state_full: "Louisiana",
    slug: "new-orleans-la",
    latitude: 29.9511,
    longitude: -90.0715,
    population: 391006,
  },
  {
    city: "Cleveland",
    state: "OH",
    state_full: "Ohio",
    slug: "cleveland-oh",
    latitude: 41.4993,
    longitude: -81.6944,
    population: 381009,
  },
  {
    city: "Pittsburgh",
    state: "PA",
    state_full: "Pennsylvania",
    slug: "pittsburgh-pa",
    latitude: 40.4406,
    longitude: -79.9959,
    population: 302971,
  },
  {
    city: "Salt Lake City",
    state: "UT",
    state_full: "Utah",
    slug: "salt-lake-city-ut",
    latitude: 40.7608,
    longitude: -111.891,
    population: 200567,
  },
  {
    city: "Boulder",
    state: "CO",
    state_full: "Colorado",
    slug: "boulder-co",
    latitude: 40.015,
    longitude: -105.2705,
    population: 108250,
  },
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedLocations() {
  console.log("Seeding locations...");

  const { data, error } = await supabase
    .from("resource_locations")
    .upsert(majorLocations, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error seeding locations:", error);
    return [];
  }

  console.log(`Seeded ${data?.length || 0} locations`);
  return data || [];
}

async function seedListings(listings: ResourceListing[], category: string) {
  console.log(`Seeding ${category} listings...`);

  const { data, error } = await supabase
    .from("resource_listings")
    .upsert(listings, { onConflict: "slug" })
    .select();

  if (error) {
    console.error(`Error seeding ${category}:`, error);
    return [];
  }

  console.log(`Seeded ${data?.length || 0} ${category} listings`);
  return data || [];
}

async function seedCategoryLocations() {
  console.log("Seeding category-location mappings...");

  // Get all locations and listings
  const { data: locations } = await supabase
    .from("resource_locations")
    .select("*");
  const { data: listings } = await supabase
    .from("resource_listings")
    .select("*")
    .eq("is_active", true);

  if (!locations || !listings) {
    console.error("Could not fetch locations or listings");
    return;
  }

  // Build category-location mappings
  const categories = Array.from(new Set(listings.map((l) => l.category))) as string[];
  const mappings: Array<{
    category: string;
    location_id: string;
    listing_count: number;
    seo_title: string;
    seo_description: string;
  }> = [];

  for (const category of categories) {
    for (const location of locations) {
      // Count listings in this category for this location
      const count = listings.filter(
        (l) =>
          l.category === category &&
          ((l.city === location.city && l.state === location.state) ||
            l.is_nationwide ||
            (l.is_remote && category === "accelerator"))
      ).length;

      if (count > 0) {
        const categoryTitle =
          category.charAt(0).toUpperCase() + category.slice(1);
        mappings.push({
          category,
          location_id: location.id,
          listing_count: count,
          seo_title: `${categoryTitle}s in ${location.city}, ${location.state_full} | SparkGood Resources`,
          seo_description: `Find ${categoryTitle.toLowerCase()}s in ${location.city}, ${location.state_full}. Browse ${count} ${categoryTitle.toLowerCase()} options to help launch your social venture.`,
        });
      }
    }
  }

  const { error } = await supabase
    .from("resource_category_locations")
    .upsert(mappings, { onConflict: "category,location_id" });

  if (error) {
    console.error("Error seeding category-locations:", error);
    return;
  }

  console.log(`Seeded ${mappings.length} category-location mappings`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("Starting SparkGood Resource Directory seeding...\n");

  try {
    // Seed locations first
    await seedLocations();

    // Seed original SBA resources (from hardcoded data)
    await seedListings(sbaResources, "SBA (original)");

    // Seed expanded SBA resources (from sba-resources-data.ts)
    const expandedSBAResources = prepareListings(allSBAResources);
    await seedListings(expandedSBAResources, "SBA (expanded)");

    // Seed original accelerators (from hardcoded data)
    await seedListings(accelerators, "accelerators (original)");

    // Seed expanded accelerators (from accelerators-data.ts)
    const expandedAccelerators = prepareListings(acceleratorListings);
    await seedListings(expandedAccelerators, "accelerators (expanded)");

    // Seed original grants (from hardcoded data)
    await seedListings(grants, "grants (original)");

    // Seed expanded grants (from grants-data.ts)
    const expandedGrants = prepareListings(grantListings);
    await seedListings(expandedGrants, "grants (expanded)");

    // Build category-location mappings
    await seedCategoryLocations();

    // Recalculate listing counts using the database function
    console.log("Recalculating listing counts...");
    const { error: recalcError } = await supabase.rpc("recalculate_listing_counts");
    if (recalcError) {
      console.error("Warning: Could not recalculate counts:", recalcError.message);
    } else {
      console.log("Listing counts recalculated.");
    }

    console.log("\nSeeding complete!");

    // Print summary
    const { count: listingCount } = await supabase
      .from("resource_listings")
      .select("*", { count: "exact", head: true });
    const { count: locationCount } = await supabase
      .from("resource_locations")
      .select("*", { count: "exact", head: true });
    const { count: mappingCount } = await supabase
      .from("resource_category_locations")
      .select("*", { count: "exact", head: true });

    console.log("\nSummary:");
    console.log(`- Resource listings: ${listingCount}`);
    console.log(`- Locations: ${locationCount}`);
    console.log(`- Category-location mappings: ${mappingCount}`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
