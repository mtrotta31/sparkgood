/**
 * Smart Expansion Engine Configuration
 *
 * Defines all categories for automatic expansion and the top 200 US cities.
 * This is a static data file - no API calls needed.
 */

export interface ExpansionCategory {
  slug: string;
  displayName: string;
  searchQueries: string[];
  icon: string;
  description: string;
  /** Whether this category exists in the current database schema */
  isExisting: boolean;
  /** Subcategories to apply to imported listings */
  defaultSubcategories?: string[];
}

export const EXPANSION_CATEGORIES: ExpansionCategory[] = [
  // Existing categories
  {
    slug: 'coworking',
    displayName: 'Coworking Spaces',
    searchQueries: ['coworking space', 'shared office space'],
    icon: '🏢',
    description: 'Find the perfect workspace for your business. From hot desks to private offices, coworking spaces offer flexible, professional environments with amenities like high-speed internet, meeting rooms, and networking opportunities.',
    isExisting: true,
  },
  {
    slug: 'grant',
    displayName: 'Business Grants',
    searchQueries: ['small business grants', 'business grant program'],
    icon: '💰',
    description: 'Discover grants and funding opportunities for your business. Unlike loans, grants don\'t need to be repaid, making them an excellent source of capital for startups and growing businesses.',
    isExisting: true,
  },
  {
    slug: 'accelerator',
    displayName: 'Accelerators & Incubators',
    searchQueries: ['startup accelerator', 'business incubator'],
    icon: '🚀',
    description: 'Join accelerator and incubator programs that provide mentorship, funding, and resources to help your startup grow faster. Many programs offer equity investment and valuable connections.',
    isExisting: true,
  },
  {
    slug: 'sba',
    displayName: 'SBA Resources',
    searchQueries: ['small business development center', 'SBDC', 'SCORE mentoring'],
    icon: '🏛️',
    description: 'Access free and low-cost business assistance from SBA-affiliated organizations including Small Business Development Centers (SBDCs), SCORE mentors, and Women\'s Business Centers.',
    isExisting: true,
  },

  // New categories for expansion
  {
    slug: 'business-attorney',
    displayName: 'Business Attorneys',
    searchQueries: ['business attorney', 'business lawyer', 'corporate attorney', 'startup lawyer'],
    icon: '⚖️',
    description: 'Find experienced business attorneys to help with incorporation, contracts, intellectual property, employment law, and other legal needs. The right legal counsel protects your business and helps you grow with confidence.',
    isExisting: false,
    defaultSubcategories: ['legal'],
  },
  {
    slug: 'accountant',
    displayName: 'Accountants & CPAs',
    searchQueries: ['accountant for small business', 'CPA', 'small business accountant', 'bookkeeper'],
    icon: '📊',
    description: 'Connect with certified accountants and CPAs who specialize in small business finances. Get help with bookkeeping, tax planning, financial statements, and strategic financial advice.',
    isExisting: false,
    defaultSubcategories: ['accounting'],
  },
  {
    slug: 'marketing-agency',
    displayName: 'Marketing Agencies',
    searchQueries: ['marketing agency', 'digital marketing agency', 'small business marketing'],
    icon: '📣',
    description: 'Partner with marketing agencies that understand small business needs. From digital marketing and SEO to branding and social media, find experts to help grow your customer base.',
    isExisting: false,
    defaultSubcategories: ['marketing'],
  },
  {
    slug: 'print-shop',
    displayName: 'Print & Design Shops',
    searchQueries: ['print shop', 'business printing', 'commercial printing', 'sign shop'],
    icon: '🖨️',
    description: 'Find local print shops for business cards, marketing materials, signage, and promotional items. Quality print materials help establish your brand and attract customers.',
    isExisting: false,
  },
  {
    slug: 'commercial-real-estate',
    displayName: 'Commercial Real Estate',
    searchQueries: ['commercial real estate agent', 'commercial property', 'retail space for lease'],
    icon: '🏬',
    description: 'Work with commercial real estate agents to find the perfect location for your business. Whether you need retail space, office space, or industrial property, local experts can help.',
    isExisting: false,
  },
  {
    slug: 'business-insurance',
    displayName: 'Business Insurance',
    searchQueries: ['business insurance agent', 'commercial insurance', 'small business insurance'],
    icon: '🛡️',
    description: 'Protect your business with the right insurance coverage. Find agents who specialize in general liability, professional liability, property insurance, and workers\' compensation.',
    isExisting: false,
  },
  {
    slug: 'chamber-of-commerce',
    displayName: 'Chambers of Commerce',
    searchQueries: ['chamber of commerce', 'business association'],
    icon: '🤝',
    description: 'Join your local chamber of commerce for networking, advocacy, and business resources. Chambers connect you with other business owners and community leaders.',
    isExisting: false,
  },
  {
    slug: 'virtual-office',
    displayName: 'Virtual Offices',
    searchQueries: ['virtual office', 'business address service', 'mail forwarding business'],
    icon: '📬',
    description: 'Get a professional business address without the overhead of physical office space. Virtual offices provide mail handling, meeting rooms on demand, and a prestigious address for your business.',
    isExisting: false,
  },
  {
    slug: 'business-consultant',
    displayName: 'Business Consultants',
    searchQueries: ['business consultant', 'small business consultant', 'management consultant'],
    icon: '💼',
    description: 'Work with business consultants who can help you solve problems, improve operations, and accelerate growth. Find experts in strategy, operations, finance, and more.',
    isExisting: false,
    defaultSubcategories: ['consulting'],
  },
];

/** Get a category by slug */
export function getCategoryBySlug(slug: string): ExpansionCategory | undefined {
  return EXPANSION_CATEGORIES.find(c => c.slug === slug);
}

/** Get all existing categories (already in database) */
export function getExistingCategories(): ExpansionCategory[] {
  return EXPANSION_CATEGORIES.filter(c => c.isExisting);
}

/** Get new categories that need to be added to database */
export function getNewCategories(): ExpansionCategory[] {
  return EXPANSION_CATEGORIES.filter(c => !c.isExisting);
}

export interface USCity {
  name: string;
  state: string;
  stateAbbr: string;
  population: number;
  lat: number;
  lng: number;
  slug: string;
}

/**
 * Top 200 US cities by population (2024 estimates)
 * Source: US Census Bureau estimates
 */
export const US_CITIES: USCity[] = [
  { name: 'New York', state: 'New York', stateAbbr: 'NY', population: 8336817, lat: 40.7128, lng: -74.006, slug: 'new-york-ny' },
  { name: 'Los Angeles', state: 'California', stateAbbr: 'CA', population: 3979576, lat: 34.0522, lng: -118.2437, slug: 'los-angeles-ca' },
  { name: 'Chicago', state: 'Illinois', stateAbbr: 'IL', population: 2693976, lat: 41.8781, lng: -87.6298, slug: 'chicago-il' },
  { name: 'Houston', state: 'Texas', stateAbbr: 'TX', population: 2304580, lat: 29.7604, lng: -95.3698, slug: 'houston-tx' },
  { name: 'Phoenix', state: 'Arizona', stateAbbr: 'AZ', population: 1608139, lat: 33.4484, lng: -112.074, slug: 'phoenix-az' },
  { name: 'Philadelphia', state: 'Pennsylvania', stateAbbr: 'PA', population: 1603797, lat: 39.9526, lng: -75.1652, slug: 'philadelphia-pa' },
  { name: 'San Antonio', state: 'Texas', stateAbbr: 'TX', population: 1434625, lat: 29.4241, lng: -98.4936, slug: 'san-antonio-tx' },
  { name: 'San Diego', state: 'California', stateAbbr: 'CA', population: 1386932, lat: 32.7157, lng: -117.1611, slug: 'san-diego-ca' },
  { name: 'Dallas', state: 'Texas', stateAbbr: 'TX', population: 1304379, lat: 32.7767, lng: -96.797, slug: 'dallas-tx' },
  { name: 'San Jose', state: 'California', stateAbbr: 'CA', population: 1013240, lat: 37.3382, lng: -121.8863, slug: 'san-jose-ca' },
  { name: 'Austin', state: 'Texas', stateAbbr: 'TX', population: 978908, lat: 30.2672, lng: -97.7431, slug: 'austin-tx' },
  { name: 'Jacksonville', state: 'Florida', stateAbbr: 'FL', population: 949611, lat: 30.3322, lng: -81.6557, slug: 'jacksonville-fl' },
  { name: 'Fort Worth', state: 'Texas', stateAbbr: 'TX', population: 918915, lat: 32.7555, lng: -97.3308, slug: 'fort-worth-tx' },
  { name: 'Columbus', state: 'Ohio', stateAbbr: 'OH', population: 905748, lat: 39.9612, lng: -82.9988, slug: 'columbus-oh' },
  { name: 'Charlotte', state: 'North Carolina', stateAbbr: 'NC', population: 874579, lat: 35.2271, lng: -80.8431, slug: 'charlotte-nc' },
  { name: 'San Francisco', state: 'California', stateAbbr: 'CA', population: 873965, lat: 37.7749, lng: -122.4194, slug: 'san-francisco-ca' },
  { name: 'Indianapolis', state: 'Indiana', stateAbbr: 'IN', population: 867125, lat: 39.7684, lng: -86.1581, slug: 'indianapolis-in' },
  { name: 'Seattle', state: 'Washington', stateAbbr: 'WA', population: 737015, lat: 47.6062, lng: -122.3321, slug: 'seattle-wa' },
  { name: 'Denver', state: 'Colorado', stateAbbr: 'CO', population: 715522, lat: 39.7392, lng: -104.9903, slug: 'denver-co' },
  { name: 'Washington', state: 'District of Columbia', stateAbbr: 'DC', population: 689545, lat: 38.9072, lng: -77.0369, slug: 'washington-dc' },
  { name: 'Boston', state: 'Massachusetts', stateAbbr: 'MA', population: 675647, lat: 42.3601, lng: -71.0589, slug: 'boston-ma' },
  { name: 'El Paso', state: 'Texas', stateAbbr: 'TX', population: 678815, lat: 31.7619, lng: -106.485, slug: 'el-paso-tx' },
  { name: 'Nashville', state: 'Tennessee', stateAbbr: 'TN', population: 689447, lat: 36.1627, lng: -86.7816, slug: 'nashville-tn' },
  { name: 'Detroit', state: 'Michigan', stateAbbr: 'MI', population: 639111, lat: 42.3314, lng: -83.0458, slug: 'detroit-mi' },
  { name: 'Oklahoma City', state: 'Oklahoma', stateAbbr: 'OK', population: 681054, lat: 35.4676, lng: -97.5164, slug: 'oklahoma-city-ok' },
  { name: 'Portland', state: 'Oregon', stateAbbr: 'OR', population: 641162, lat: 45.5051, lng: -122.675, slug: 'portland-or' },
  { name: 'Las Vegas', state: 'Nevada', stateAbbr: 'NV', population: 641903, lat: 36.1699, lng: -115.1398, slug: 'las-vegas-nv' },
  { name: 'Memphis', state: 'Tennessee', stateAbbr: 'TN', population: 633104, lat: 35.1495, lng: -90.049, slug: 'memphis-tn' },
  { name: 'Louisville', state: 'Kentucky', stateAbbr: 'KY', population: 617638, lat: 38.2527, lng: -85.7585, slug: 'louisville-ky' },
  { name: 'Baltimore', state: 'Maryland', stateAbbr: 'MD', population: 585708, lat: 39.2904, lng: -76.6122, slug: 'baltimore-md' },
  { name: 'Milwaukee', state: 'Wisconsin', stateAbbr: 'WI', population: 577222, lat: 43.0389, lng: -87.9065, slug: 'milwaukee-wi' },
  { name: 'Albuquerque', state: 'New Mexico', stateAbbr: 'NM', population: 564559, lat: 35.0844, lng: -106.6504, slug: 'albuquerque-nm' },
  { name: 'Tucson', state: 'Arizona', stateAbbr: 'AZ', population: 542629, lat: 32.2226, lng: -110.9747, slug: 'tucson-az' },
  { name: 'Fresno', state: 'California', stateAbbr: 'CA', population: 542107, lat: 36.7378, lng: -119.7871, slug: 'fresno-ca' },
  { name: 'Sacramento', state: 'California', stateAbbr: 'CA', population: 524943, lat: 38.5816, lng: -121.4944, slug: 'sacramento-ca' },
  { name: 'Mesa', state: 'Arizona', stateAbbr: 'AZ', population: 504258, lat: 33.4152, lng: -111.8315, slug: 'mesa-az' },
  { name: 'Kansas City', state: 'Missouri', stateAbbr: 'MO', population: 508090, lat: 39.0997, lng: -94.5786, slug: 'kansas-city-mo' },
  { name: 'Atlanta', state: 'Georgia', stateAbbr: 'GA', population: 498715, lat: 33.749, lng: -84.388, slug: 'atlanta-ga' },
  { name: 'Long Beach', state: 'California', stateAbbr: 'CA', population: 466742, lat: 33.7701, lng: -118.1937, slug: 'long-beach-ca' },
  { name: 'Omaha', state: 'Nebraska', stateAbbr: 'NE', population: 486051, lat: 41.2565, lng: -95.9345, slug: 'omaha-ne' },
  { name: 'Raleigh', state: 'North Carolina', stateAbbr: 'NC', population: 467665, lat: 35.7796, lng: -78.6382, slug: 'raleigh-nc' },
  { name: 'Colorado Springs', state: 'Colorado', stateAbbr: 'CO', population: 478961, lat: 38.8339, lng: -104.8214, slug: 'colorado-springs-co' },
  { name: 'Miami', state: 'Florida', stateAbbr: 'FL', population: 442241, lat: 25.7617, lng: -80.1918, slug: 'miami-fl' },
  { name: 'Virginia Beach', state: 'Virginia', stateAbbr: 'VA', population: 459470, lat: 36.8529, lng: -75.978, slug: 'virginia-beach-va' },
  { name: 'Oakland', state: 'California', stateAbbr: 'CA', population: 433031, lat: 37.8044, lng: -122.2712, slug: 'oakland-ca' },
  { name: 'Minneapolis', state: 'Minnesota', stateAbbr: 'MN', population: 429954, lat: 44.9778, lng: -93.265, slug: 'minneapolis-mn' },
  { name: 'Tulsa', state: 'Oklahoma', stateAbbr: 'OK', population: 413066, lat: 36.154, lng: -95.9928, slug: 'tulsa-ok' },
  { name: 'Arlington', state: 'Texas', stateAbbr: 'TX', population: 394266, lat: 32.7357, lng: -97.1081, slug: 'arlington-tx' },
  { name: 'New Orleans', state: 'Louisiana', stateAbbr: 'LA', population: 383997, lat: 29.9511, lng: -90.0715, slug: 'new-orleans-la' },
  { name: 'Wichita', state: 'Kansas', stateAbbr: 'KS', population: 397532, lat: 37.6872, lng: -97.3301, slug: 'wichita-ks' },
  { name: 'Cleveland', state: 'Ohio', stateAbbr: 'OH', population: 372624, lat: 41.4993, lng: -81.6944, slug: 'cleveland-oh' },
  { name: 'Tampa', state: 'Florida', stateAbbr: 'FL', population: 384959, lat: 27.9506, lng: -82.4572, slug: 'tampa-fl' },
  { name: 'Bakersfield', state: 'California', stateAbbr: 'CA', population: 403455, lat: 35.3733, lng: -119.0187, slug: 'bakersfield-ca' },
  { name: 'Aurora', state: 'Colorado', stateAbbr: 'CO', population: 386261, lat: 39.7294, lng: -104.8319, slug: 'aurora-co' },
  { name: 'Honolulu', state: 'Hawaii', stateAbbr: 'HI', population: 350964, lat: 21.3069, lng: -157.8583, slug: 'honolulu-hi' },
  { name: 'Anaheim', state: 'California', stateAbbr: 'CA', population: 350365, lat: 33.8366, lng: -117.9143, slug: 'anaheim-ca' },
  { name: 'Santa Ana', state: 'California', stateAbbr: 'CA', population: 310227, lat: 33.7455, lng: -117.8677, slug: 'santa-ana-ca' },
  { name: 'Corpus Christi', state: 'Texas', stateAbbr: 'TX', population: 317863, lat: 27.8006, lng: -97.3964, slug: 'corpus-christi-tx' },
  { name: 'Riverside', state: 'California', stateAbbr: 'CA', population: 314998, lat: 33.9533, lng: -117.3962, slug: 'riverside-ca' },
  { name: 'Lexington', state: 'Kentucky', stateAbbr: 'KY', population: 322570, lat: 38.0406, lng: -84.5037, slug: 'lexington-ky' },
  { name: 'St. Louis', state: 'Missouri', stateAbbr: 'MO', population: 301578, lat: 38.627, lng: -90.1994, slug: 'st-louis-mo' },
  { name: 'Stockton', state: 'California', stateAbbr: 'CA', population: 320804, lat: 37.9577, lng: -121.2908, slug: 'stockton-ca' },
  { name: 'Henderson', state: 'Nevada', stateAbbr: 'NV', population: 320189, lat: 36.0395, lng: -114.9817, slug: 'henderson-nv' },
  { name: 'St. Paul', state: 'Minnesota', stateAbbr: 'MN', population: 311527, lat: 44.9537, lng: -93.09, slug: 'st-paul-mn' },
  { name: 'Pittsburgh', state: 'Pennsylvania', stateAbbr: 'PA', population: 302971, lat: 40.4406, lng: -79.9959, slug: 'pittsburgh-pa' },
  { name: 'Cincinnati', state: 'Ohio', stateAbbr: 'OH', population: 309317, lat: 39.1031, lng: -84.512, slug: 'cincinnati-oh' },
  { name: 'Anchorage', state: 'Alaska', stateAbbr: 'AK', population: 291247, lat: 61.2181, lng: -149.9003, slug: 'anchorage-ak' },
  { name: 'Greensboro', state: 'North Carolina', stateAbbr: 'NC', population: 299035, lat: 36.0726, lng: -79.792, slug: 'greensboro-nc' },
  { name: 'Plano', state: 'Texas', stateAbbr: 'TX', population: 285494, lat: 33.0198, lng: -96.6989, slug: 'plano-tx' },
  { name: 'Newark', state: 'New Jersey', stateAbbr: 'NJ', population: 311549, lat: 40.7357, lng: -74.1724, slug: 'newark-nj' },
  { name: 'Lincoln', state: 'Nebraska', stateAbbr: 'NE', population: 291082, lat: 40.8258, lng: -96.6852, slug: 'lincoln-ne' },
  { name: 'Orlando', state: 'Florida', stateAbbr: 'FL', population: 307573, lat: 28.5383, lng: -81.3792, slug: 'orlando-fl' },
  { name: 'Irvine', state: 'California', stateAbbr: 'CA', population: 307670, lat: 33.6846, lng: -117.8265, slug: 'irvine-ca' },
  { name: 'Durham', state: 'North Carolina', stateAbbr: 'NC', population: 283506, lat: 35.994, lng: -78.8986, slug: 'durham-nc' },
  { name: 'Chula Vista', state: 'California', stateAbbr: 'CA', population: 275487, lat: 32.6401, lng: -117.0842, slug: 'chula-vista-ca' },
  { name: 'Toledo', state: 'Ohio', stateAbbr: 'OH', population: 270871, lat: 41.6528, lng: -83.5379, slug: 'toledo-oh' },
  { name: 'Fort Wayne', state: 'Indiana', stateAbbr: 'IN', population: 263886, lat: 41.0793, lng: -85.1394, slug: 'fort-wayne-in' },
  { name: 'St. Petersburg', state: 'Florida', stateAbbr: 'FL', population: 258308, lat: 27.7676, lng: -82.6403, slug: 'st-petersburg-fl' },
  { name: 'Laredo', state: 'Texas', stateAbbr: 'TX', population: 255205, lat: 27.5306, lng: -99.4803, slug: 'laredo-tx' },
  { name: 'Jersey City', state: 'New Jersey', stateAbbr: 'NJ', population: 292449, lat: 40.7178, lng: -74.0431, slug: 'jersey-city-nj' },
  { name: 'Chandler', state: 'Arizona', stateAbbr: 'AZ', population: 275987, lat: 33.3062, lng: -111.8413, slug: 'chandler-az' },
  { name: 'Buffalo', state: 'New York', stateAbbr: 'NY', population: 278349, lat: 42.8864, lng: -78.8784, slug: 'buffalo-ny' },
  { name: 'Madison', state: 'Wisconsin', stateAbbr: 'WI', population: 269840, lat: 43.0731, lng: -89.4012, slug: 'madison-wi' },
  { name: 'Lubbock', state: 'Texas', stateAbbr: 'TX', population: 264312, lat: 33.5779, lng: -101.8552, slug: 'lubbock-tx' },
  { name: 'Scottsdale', state: 'Arizona', stateAbbr: 'AZ', population: 241361, lat: 33.4942, lng: -111.9261, slug: 'scottsdale-az' },
  { name: 'Reno', state: 'Nevada', stateAbbr: 'NV', population: 264165, lat: 39.5296, lng: -119.8138, slug: 'reno-nv' },
  { name: 'Glendale', state: 'Arizona', stateAbbr: 'AZ', population: 248325, lat: 33.5387, lng: -112.1859, slug: 'glendale-az' },
  { name: 'Gilbert', state: 'Arizona', stateAbbr: 'AZ', population: 267918, lat: 33.3528, lng: -111.789, slug: 'gilbert-az' },
  { name: 'Winston-Salem', state: 'North Carolina', stateAbbr: 'NC', population: 249545, lat: 36.0999, lng: -80.2442, slug: 'winston-salem-nc' },
  { name: 'North Las Vegas', state: 'Nevada', stateAbbr: 'NV', population: 262527, lat: 36.1989, lng: -115.1175, slug: 'north-las-vegas-nv' },
  { name: 'Norfolk', state: 'Virginia', stateAbbr: 'VA', population: 238005, lat: 36.8508, lng: -76.2859, slug: 'norfolk-va' },
  { name: 'Fremont', state: 'California', stateAbbr: 'CA', population: 230504, lat: 37.5485, lng: -121.9886, slug: 'fremont-ca' },
  { name: 'Garland', state: 'Texas', stateAbbr: 'TX', population: 239928, lat: 32.9126, lng: -96.6389, slug: 'garland-tx' },
  { name: 'Irving', state: 'Texas', stateAbbr: 'TX', population: 256684, lat: 32.814, lng: -96.9489, slug: 'irving-tx' },
  { name: 'Hialeah', state: 'Florida', stateAbbr: 'FL', population: 223109, lat: 25.8576, lng: -80.2781, slug: 'hialeah-fl' },
  { name: 'Richmond', state: 'Virginia', stateAbbr: 'VA', population: 226610, lat: 37.5407, lng: -77.436, slug: 'richmond-va' },
  { name: 'Boise', state: 'Idaho', stateAbbr: 'ID', population: 235684, lat: 43.615, lng: -116.2023, slug: 'boise-id' },
  { name: 'Spokane', state: 'Washington', stateAbbr: 'WA', population: 228989, lat: 47.6588, lng: -117.426, slug: 'spokane-wa' },
  { name: 'Baton Rouge', state: 'Louisiana', stateAbbr: 'LA', population: 227470, lat: 30.4515, lng: -91.1871, slug: 'baton-rouge-la' },
  { name: 'Tacoma', state: 'Washington', stateAbbr: 'WA', population: 219346, lat: 47.2529, lng: -122.4443, slug: 'tacoma-wa' },
  { name: 'San Bernardino', state: 'California', stateAbbr: 'CA', population: 222101, lat: 34.1083, lng: -117.2898, slug: 'san-bernardino-ca' },
  { name: 'Modesto', state: 'California', stateAbbr: 'CA', population: 218464, lat: 37.6391, lng: -120.9969, slug: 'modesto-ca' },
  { name: 'Fontana', state: 'California', stateAbbr: 'CA', population: 214547, lat: 34.0922, lng: -117.435, slug: 'fontana-ca' },
  { name: 'Des Moines', state: 'Iowa', stateAbbr: 'IA', population: 214237, lat: 41.5868, lng: -93.625, slug: 'des-moines-ia' },
  { name: 'Moreno Valley', state: 'California', stateAbbr: 'CA', population: 212751, lat: 33.9425, lng: -117.2297, slug: 'moreno-valley-ca' },
  { name: 'Santa Clarita', state: 'California', stateAbbr: 'CA', population: 228673, lat: 34.3917, lng: -118.5426, slug: 'santa-clarita-ca' },
  { name: 'Fayetteville', state: 'North Carolina', stateAbbr: 'NC', population: 208501, lat: 35.0527, lng: -78.8784, slug: 'fayetteville-nc' },
  { name: 'Birmingham', state: 'Alabama', stateAbbr: 'AL', population: 200733, lat: 33.5207, lng: -86.8025, slug: 'birmingham-al' },
  { name: 'Oxnard', state: 'California', stateAbbr: 'CA', population: 202063, lat: 34.1975, lng: -119.1771, slug: 'oxnard-ca' },
  { name: 'Rochester', state: 'New York', stateAbbr: 'NY', population: 211328, lat: 43.1566, lng: -77.6088, slug: 'rochester-ny' },
  { name: 'Port St. Lucie', state: 'Florida', stateAbbr: 'FL', population: 204851, lat: 27.2939, lng: -80.3503, slug: 'port-st-lucie-fl' },
  { name: 'Grand Rapids', state: 'Michigan', stateAbbr: 'MI', population: 198917, lat: 42.9634, lng: -85.6681, slug: 'grand-rapids-mi' },
  { name: 'Huntsville', state: 'Alabama', stateAbbr: 'AL', population: 215006, lat: 34.7304, lng: -86.5861, slug: 'huntsville-al' },
  { name: 'Salt Lake City', state: 'Utah', stateAbbr: 'UT', population: 199723, lat: 40.7608, lng: -111.891, slug: 'salt-lake-city-ut' },
  { name: 'Frisco', state: 'Texas', stateAbbr: 'TX', population: 210719, lat: 33.1507, lng: -96.8236, slug: 'frisco-tx' },
  { name: 'Yonkers', state: 'New York', stateAbbr: 'NY', population: 211569, lat: 40.9312, lng: -73.8988, slug: 'yonkers-ny' },
  { name: 'Amarillo', state: 'Texas', stateAbbr: 'TX', population: 200393, lat: 35.222, lng: -101.8313, slug: 'amarillo-tx' },
  { name: 'Glendale', state: 'California', stateAbbr: 'CA', population: 196543, lat: 34.1425, lng: -118.2551, slug: 'glendale-ca' },
  { name: 'Huntington Beach', state: 'California', stateAbbr: 'CA', population: 198711, lat: 33.6595, lng: -117.9988, slug: 'huntington-beach-ca' },
  { name: 'McKinney', state: 'Texas', stateAbbr: 'TX', population: 195308, lat: 33.1972, lng: -96.6398, slug: 'mckinney-tx' },
  { name: 'Montgomery', state: 'Alabama', stateAbbr: 'AL', population: 200603, lat: 32.3668, lng: -86.3, slug: 'montgomery-al' },
  { name: 'Augusta', state: 'Georgia', stateAbbr: 'GA', population: 202081, lat: 33.4735, lng: -82.0105, slug: 'augusta-ga' },
  { name: 'Aurora', state: 'Illinois', stateAbbr: 'IL', population: 180542, lat: 41.7606, lng: -88.3201, slug: 'aurora-il' },
  { name: 'Akron', state: 'Ohio', stateAbbr: 'OH', population: 190469, lat: 41.0814, lng: -81.519, slug: 'akron-oh' },
  { name: 'Little Rock', state: 'Arkansas', stateAbbr: 'AR', population: 202591, lat: 34.7465, lng: -92.2896, slug: 'little-rock-ar' },
  { name: 'Tempe', state: 'Arizona', stateAbbr: 'AZ', population: 180587, lat: 33.4255, lng: -111.94, slug: 'tempe-az' },
  { name: 'Overland Park', state: 'Kansas', stateAbbr: 'KS', population: 197238, lat: 38.9822, lng: -94.6708, slug: 'overland-park-ks' },
  { name: 'Grand Prairie', state: 'Texas', stateAbbr: 'TX', population: 196100, lat: 32.746, lng: -96.9978, slug: 'grand-prairie-tx' },
  { name: 'Tallahassee', state: 'Florida', stateAbbr: 'FL', population: 196169, lat: 30.4383, lng: -84.2807, slug: 'tallahassee-fl' },
  { name: 'Cape Coral', state: 'Florida', stateAbbr: 'FL', population: 194016, lat: 26.5629, lng: -81.9495, slug: 'cape-coral-fl' },
  { name: 'Mobile', state: 'Alabama', stateAbbr: 'AL', population: 187041, lat: 30.6954, lng: -88.0399, slug: 'mobile-al' },
  { name: 'Knoxville', state: 'Tennessee', stateAbbr: 'TN', population: 190740, lat: 35.9606, lng: -83.9207, slug: 'knoxville-tn' },
  { name: 'Shreveport', state: 'Louisiana', stateAbbr: 'LA', population: 187593, lat: 32.5252, lng: -93.7502, slug: 'shreveport-la' },
  { name: 'Worcester', state: 'Massachusetts', stateAbbr: 'MA', population: 206518, lat: 42.2626, lng: -71.8023, slug: 'worcester-ma' },
  { name: 'Ontario', state: 'California', stateAbbr: 'CA', population: 175265, lat: 34.0633, lng: -117.6509, slug: 'ontario-ca' },
  { name: 'Providence', state: 'Rhode Island', stateAbbr: 'RI', population: 190934, lat: 41.824, lng: -71.4128, slug: 'providence-ri' },
  { name: 'Peoria', state: 'Arizona', stateAbbr: 'AZ', population: 190985, lat: 33.5806, lng: -112.2374, slug: 'peoria-az' },
  { name: 'Vancouver', state: 'Washington', stateAbbr: 'WA', population: 190915, lat: 45.6387, lng: -122.6615, slug: 'vancouver-wa' },
  { name: 'Sioux Falls', state: 'South Dakota', stateAbbr: 'SD', population: 192517, lat: 43.5446, lng: -96.7311, slug: 'sioux-falls-sd' },
  { name: 'Brownsville', state: 'Texas', stateAbbr: 'TX', population: 186738, lat: 25.9017, lng: -97.4975, slug: 'brownsville-tx' },
  { name: 'Santa Rosa', state: 'California', stateAbbr: 'CA', population: 178127, lat: 38.4404, lng: -122.7141, slug: 'santa-rosa-ca' },
  { name: 'Fort Lauderdale', state: 'Florida', stateAbbr: 'FL', population: 182760, lat: 26.1224, lng: -80.1373, slug: 'fort-lauderdale-fl' },
  { name: 'Chattanooga', state: 'Tennessee', stateAbbr: 'TN', population: 181099, lat: 35.0456, lng: -85.3097, slug: 'chattanooga-tn' },
  { name: 'Newport News', state: 'Virginia', stateAbbr: 'VA', population: 186247, lat: 36.9787, lng: -76.428, slug: 'newport-news-va' },
  { name: 'Rancho Cucamonga', state: 'California', stateAbbr: 'CA', population: 177603, lat: 34.1064, lng: -117.5931, slug: 'rancho-cucamonga-ca' },
  { name: 'Santa Clara', state: 'California', stateAbbr: 'CA', population: 127647, lat: 37.3541, lng: -121.9552, slug: 'santa-clara-ca' },
  { name: 'Oceanside', state: 'California', stateAbbr: 'CA', population: 176193, lat: 33.1959, lng: -117.3795, slug: 'oceanside-ca' },
  { name: 'Garden Grove', state: 'California', stateAbbr: 'CA', population: 172646, lat: 33.7739, lng: -117.9414, slug: 'garden-grove-ca' },
  { name: 'Elk Grove', state: 'California', stateAbbr: 'CA', population: 176124, lat: 38.4088, lng: -121.3716, slug: 'elk-grove-ca' },
  { name: 'Corona', state: 'California', stateAbbr: 'CA', population: 157136, lat: 33.8753, lng: -117.5664, slug: 'corona-ca' },
  { name: 'Pembroke Pines', state: 'Florida', stateAbbr: 'FL', population: 171178, lat: 26.0078, lng: -80.2242, slug: 'pembroke-pines-fl' },
  { name: 'Eugene', state: 'Oregon', stateAbbr: 'OR', population: 176654, lat: 44.0521, lng: -123.0868, slug: 'eugene-or' },
  { name: 'Salem', state: 'Oregon', stateAbbr: 'OR', population: 175535, lat: 44.9429, lng: -123.0351, slug: 'salem-or' },
  { name: 'Cary', state: 'North Carolina', stateAbbr: 'NC', population: 174721, lat: 35.7913, lng: -78.7811, slug: 'cary-nc' },
  { name: 'Fort Collins', state: 'Colorado', stateAbbr: 'CO', population: 169810, lat: 40.5853, lng: -105.0844, slug: 'fort-collins-co' },
  { name: 'Hayward', state: 'California', stateAbbr: 'CA', population: 162954, lat: 37.6688, lng: -122.0808, slug: 'hayward-ca' },
  { name: 'Springfield', state: 'Missouri', stateAbbr: 'MO', population: 169176, lat: 37.2089, lng: -93.2923, slug: 'springfield-mo' },
  { name: 'Clarksville', state: 'Tennessee', stateAbbr: 'TN', population: 166722, lat: 36.5298, lng: -87.3595, slug: 'clarksville-tn' },
  { name: 'Lakewood', state: 'Colorado', stateAbbr: 'CO', population: 155984, lat: 39.7047, lng: -105.0814, slug: 'lakewood-co' },
  { name: 'Lancaster', state: 'California', stateAbbr: 'CA', population: 173516, lat: 34.6868, lng: -118.1542, slug: 'lancaster-ca' },
  { name: 'Palmdale', state: 'California', stateAbbr: 'CA', population: 169450, lat: 34.5794, lng: -118.1165, slug: 'palmdale-ca' },
  { name: 'Salinas', state: 'California', stateAbbr: 'CA', population: 163542, lat: 36.6777, lng: -121.6555, slug: 'salinas-ca' },
  { name: 'Rockford', state: 'Illinois', stateAbbr: 'IL', population: 148655, lat: 42.2711, lng: -89.094, slug: 'rockford-il' },
  { name: 'Pomona', state: 'California', stateAbbr: 'CA', population: 151348, lat: 34.0551, lng: -117.7523, slug: 'pomona-ca' },
  { name: 'Escondido', state: 'California', stateAbbr: 'CA', population: 151038, lat: 33.1192, lng: -117.0864, slug: 'escondido-ca' },
  { name: 'Joliet', state: 'Illinois', stateAbbr: 'IL', population: 150362, lat: 41.525, lng: -88.0817, slug: 'joliet-il' },
  { name: 'Paterson', state: 'New Jersey', stateAbbr: 'NJ', population: 159732, lat: 40.9168, lng: -74.1718, slug: 'paterson-nj' },
  { name: 'Kansas City', state: 'Kansas', stateAbbr: 'KS', population: 156607, lat: 39.1141, lng: -94.6275, slug: 'kansas-city-ks' },
  { name: 'Torrance', state: 'California', stateAbbr: 'CA', population: 143592, lat: 33.8358, lng: -118.3406, slug: 'torrance-ca' },
  { name: 'Syracuse', state: 'New York', stateAbbr: 'NY', population: 148620, lat: 43.0481, lng: -76.1474, slug: 'syracuse-ny' },
  { name: 'Bridgeport', state: 'Connecticut', stateAbbr: 'CT', population: 148654, lat: 41.1865, lng: -73.1952, slug: 'bridgeport-ct' },
  { name: 'Naperville', state: 'Illinois', stateAbbr: 'IL', population: 149540, lat: 41.7508, lng: -88.1535, slug: 'naperville-il' },
  { name: 'Savannah', state: 'Georgia', stateAbbr: 'GA', population: 147780, lat: 32.0809, lng: -81.0912, slug: 'savannah-ga' },
  { name: 'Mesquite', state: 'Texas', stateAbbr: 'TX', population: 150108, lat: 32.7668, lng: -96.5992, slug: 'mesquite-tx' },
  { name: 'Pasadena', state: 'Texas', stateAbbr: 'TX', population: 151950, lat: 29.6911, lng: -95.209, slug: 'pasadena-tx' },
  { name: 'Murfreesboro', state: 'Tennessee', stateAbbr: 'TN', population: 152769, lat: 35.8456, lng: -86.3903, slug: 'murfreesboro-tn' },
  { name: 'Sunnyvale', state: 'California', stateAbbr: 'CA', population: 155805, lat: 37.3688, lng: -122.0363, slug: 'sunnyvale-ca' },
  { name: 'Miramar', state: 'Florida', stateAbbr: 'FL', population: 134721, lat: 25.9871, lng: -80.3321, slug: 'miramar-fl' },
  { name: 'Dayton', state: 'Ohio', stateAbbr: 'OH', population: 137644, lat: 39.7589, lng: -84.1916, slug: 'dayton-oh' },
  { name: 'Killeen', state: 'Texas', stateAbbr: 'TX', population: 153095, lat: 31.1171, lng: -97.7278, slug: 'killeen-tx' },
  { name: 'Roseville', state: 'California', stateAbbr: 'CA', population: 147773, lat: 38.7521, lng: -121.288, slug: 'roseville-ca' },
  { name: 'Bellevue', state: 'Washington', stateAbbr: 'WA', population: 151854, lat: 47.6101, lng: -122.2015, slug: 'bellevue-wa' },
  { name: 'Hollywood', state: 'Florida', stateAbbr: 'FL', population: 153627, lat: 26.0112, lng: -80.1495, slug: 'hollywood-fl' },
  { name: 'Thornton', state: 'Colorado', stateAbbr: 'CO', population: 141867, lat: 39.868, lng: -104.9719, slug: 'thornton-co' },
  { name: 'McAllen', state: 'Texas', stateAbbr: 'TX', population: 142210, lat: 26.2034, lng: -98.2301, slug: 'mcallen-tx' },
  { name: 'Surprise', state: 'Arizona', stateAbbr: 'AZ', population: 143148, lat: 33.6292, lng: -112.3679, slug: 'surprise-az' },
  { name: 'Denton', state: 'Texas', stateAbbr: 'TX', population: 148146, lat: 33.2148, lng: -97.1331, slug: 'denton-tx' },
  { name: 'West Valley City', state: 'Utah', stateAbbr: 'UT', population: 140230, lat: 40.6916, lng: -112.0011, slug: 'west-valley-city-ut' },
  { name: 'Olathe', state: 'Kansas', stateAbbr: 'KS', population: 141290, lat: 38.8814, lng: -94.8191, slug: 'olathe-ks' },
  { name: 'Waco', state: 'Texas', stateAbbr: 'TX', population: 138486, lat: 31.5493, lng: -97.1467, slug: 'waco-tx' },
  { name: 'Visalia', state: 'California', stateAbbr: 'CA', population: 141384, lat: 36.3302, lng: -119.2921, slug: 'visalia-ca' },
  { name: 'Carrollton', state: 'Texas', stateAbbr: 'TX', population: 133168, lat: 32.9537, lng: -96.8903, slug: 'carrollton-tx' },
  { name: 'Midland', state: 'Texas', stateAbbr: 'TX', population: 132950, lat: 31.9973, lng: -102.0779, slug: 'midland-tx' },
  { name: 'Columbia', state: 'South Carolina', stateAbbr: 'SC', population: 136632, lat: 34.0007, lng: -81.0348, slug: 'columbia-sc' },
  { name: 'Sterling Heights', state: 'Michigan', stateAbbr: 'MI', population: 134346, lat: 42.5803, lng: -83.0302, slug: 'sterling-heights-mi' },
  { name: 'New Haven', state: 'Connecticut', stateAbbr: 'CT', population: 135081, lat: 41.3083, lng: -72.9279, slug: 'new-haven-ct' },
  { name: 'Macon', state: 'Georgia', stateAbbr: 'GA', population: 157346, lat: 32.8407, lng: -83.6324, slug: 'macon-ga' },
  { name: 'Charleston', state: 'South Carolina', stateAbbr: 'SC', population: 150227, lat: 32.7765, lng: -79.9311, slug: 'charleston-sc' },
  { name: 'Thousand Oaks', state: 'California', stateAbbr: 'CA', population: 126966, lat: 34.1706, lng: -118.8376, slug: 'thousand-oaks-ca' },
  { name: 'Cedar Rapids', state: 'Iowa', stateAbbr: 'IA', population: 137710, lat: 41.9779, lng: -91.6656, slug: 'cedar-rapids-ia' },
  { name: 'Elizabeth', state: 'New Jersey', stateAbbr: 'NJ', population: 137298, lat: 40.6639, lng: -74.2107, slug: 'elizabeth-nj' },
  { name: 'Stamford', state: 'Connecticut', stateAbbr: 'CT', population: 135470, lat: 41.0534, lng: -73.5387, slug: 'stamford-ct' },
  { name: 'Victorville', state: 'California', stateAbbr: 'CA', population: 134810, lat: 34.5362, lng: -117.2928, slug: 'victorville-ca' },
  { name: 'Topeka', state: 'Kansas', stateAbbr: 'KS', population: 126587, lat: 39.0473, lng: -95.6752, slug: 'topeka-ks' },
  { name: 'Simi Valley', state: 'California', stateAbbr: 'CA', population: 126356, lat: 34.2694, lng: -118.7815, slug: 'simi-valley-ca' },
  { name: 'Concord', state: 'California', stateAbbr: 'CA', population: 129295, lat: 37.9779, lng: -122.0311, slug: 'concord-ca' },
  { name: 'Kent', state: 'Washington', stateAbbr: 'WA', population: 136588, lat: 47.3809, lng: -122.2348, slug: 'kent-wa' },
  { name: 'Lafayette', state: 'Louisiana', stateAbbr: 'LA', population: 126185, lat: 30.2241, lng: -92.0198, slug: 'lafayette-la' },
  { name: 'Evansville', state: 'Indiana', stateAbbr: 'IN', population: 117979, lat: 37.9716, lng: -87.5711, slug: 'evansville-in' },
  { name: 'Hartford', state: 'Connecticut', stateAbbr: 'CT', population: 121054, lat: 41.7658, lng: -72.6734, slug: 'hartford-ct' },
  { name: 'Fargo', state: 'North Dakota', stateAbbr: 'ND', population: 125990, lat: 46.8772, lng: -96.7898, slug: 'fargo-nd' },
  { name: 'Santa Maria', state: 'California', stateAbbr: 'CA', population: 109988, lat: 34.9530, lng: -120.4357, slug: 'santa-maria-ca' },
  { name: 'Wilmington', state: 'North Carolina', stateAbbr: 'NC', population: 115451, lat: 34.2257, lng: -77.9447, slug: 'wilmington-nc' },
  { name: 'Abilene', state: 'Texas', stateAbbr: 'TX', population: 125182, lat: 32.4487, lng: -99.7331, slug: 'abilene-tx' },
  { name: 'Pearland', state: 'Texas', stateAbbr: 'TX', population: 125828, lat: 29.5636, lng: -95.2861, slug: 'pearland-tx' },
  { name: 'Arvada', state: 'Colorado', stateAbbr: 'CO', population: 124402, lat: 39.8028, lng: -105.0875, slug: 'arvada-co' },
  { name: 'Ann Arbor', state: 'Michigan', stateAbbr: 'MI', population: 123851, lat: 42.2808, lng: -83.743, slug: 'ann-arbor-mi' },
  { name: 'Allentown', state: 'Pennsylvania', stateAbbr: 'PA', population: 126092, lat: 40.6084, lng: -75.4902, slug: 'allentown-pa' },
  { name: 'Fullerton', state: 'California', stateAbbr: 'CA', population: 139640, lat: 33.8704, lng: -117.9242, slug: 'fullerton-ca' },
];

/** Get city by slug */
export function getCityBySlug(slug: string): USCity | undefined {
  return US_CITIES.find(c => c.slug === slug);
}

/** Get cities in a specific state */
export function getCitiesByState(stateAbbr: string): USCity[] {
  return US_CITIES.filter(c => c.stateAbbr === stateAbbr);
}

/** Get top N cities by population */
export function getTopCities(n: number): USCity[] {
  return US_CITIES.slice(0, n);
}

/** Estimate Outscraper API cost for a query */
export function estimateOutscraperCost(expectedResults: number): number {
  // Outscraper charges ~$0.003 per result for Google Maps search
  return expectedResults * 0.003;
}
