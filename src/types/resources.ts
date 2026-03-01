// Resource Directory Types

export type ResourceCategory =
  | "grant"
  | "accelerator"
  | "incubator"
  | "coworking"
  | "event_space"
  | "sba"
  | "pitch_competition"
  | "mentorship"
  | "legal"
  | "accounting"
  | "marketing"
  | "investor"
  // New expansion categories
  | "business-attorney"
  | "accountant"
  | "marketing-agency"
  | "print-shop"
  | "commercial-real-estate"
  | "business-insurance"
  | "chamber-of-commerce"
  | "virtual-office"
  | "business-consultant";

export type EnrichmentStatus = "raw" | "enriched" | "verified";

export interface ResourceListing {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: ResourceCategory;
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
  email?: string;
  phone?: string;
  details: ResourceDetails;
  enrichment_status: EnrichmentStatus;
  enrichment_data?: ListingEnrichmentData;
  last_enriched_at?: string;
  logo_url?: string;
  images: string[];
  source: string;
  source_id?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category-specific details
export interface GrantDetails {
  amount_min?: number;
  amount_max?: number;
  deadline?: string;
  eligibility?: string;
  application_url?: string;
  grant_type?: "federal" | "state" | "private" | "corporate";
}

export interface AcceleratorDetails {
  duration_weeks?: number;
  equity_taken?: number;
  funding_provided?: number;
  batch_size?: number;
  next_deadline?: string;
  notable_alumni?: string[];
}

export interface SBADetails {
  sba_type?: "SBDC" | "SCORE" | "WBC" | "VBOC";
  services?: string[];
  languages?: string[];
}

export interface CoworkingDetails {
  price_monthly_min?: number;
  price_monthly_max?: number;
  day_pass_price?: number;
  amenities?: string[];
  hours?: string;
  rating?: number;
  review_count?: number;
  price_level?: number; // 1-4 scale ($-$$$$)
}

export type ResourceDetails =
  | GrantDetails
  | AcceleratorDetails
  | SBADetails
  | CoworkingDetails
  | Record<string, unknown>;

export interface ResourceLocation {
  id: string;
  city: string;
  state: string;
  state_full?: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  listing_count: number;
  seo_title?: string;
  seo_description?: string;
  // AI-generated content for SEO
  ai_city_intro?: string;
  ai_city_faqs?: Array<{ question: string; answer: string }>;
  ai_city_tips?: string;
  enrichment_status?: EnrichmentStatus;
  last_enriched_at?: string;
  created_at: string;
  updated_at: string;
}

// Enrichment data structure for listings (stored in enrichment_data JSONB)
export interface ListingEnrichmentData {
  ai_description?: string;
  ai_faqs?: Array<{ question: string; answer: string }>;
  ai_key_details?: {
    workspace_type?: string;
    best_for?: string;
    neighborhood?: string;
    // Grant-specific
    grant_type?: string;
    funding_range?: string;
    application_type?: string;
    // Accelerator-specific
    program_type?: string;
    focus?: string;
    funding?: string;
    // SBA-specific
    services?: string;
    cost?: string;
  };
  // Any existing Perplexity enrichment data
  [key: string]: unknown;
}

export interface ResourceCategoryLocation {
  id: string;
  category: ResourceCategory;
  location_id: string;
  listing_count: number;
  seo_title?: string;
  seo_description?: string;
  location?: ResourceLocation;
}

export interface ResourceSave {
  id: string;
  user_id: string;
  listing_id: string;
  notes?: string;
  created_at: string;
  listing?: ResourceListing;
}

// UI types
export interface CategoryInfo {
  slug: ResourceCategory;
  name: string;
  plural: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  lightBgColor: string;
}

// Light theme category colors
// Grants: Forest green (#16A34A)
// Coworking: Warm blue (#2563EB)
// Accelerators: Burnt orange (#EA580C)
// SBA: Brick red (#DC2626)

export const CATEGORY_INFO: Record<ResourceCategory, CategoryInfo> = {
  grant: {
    slug: "grant",
    name: "Grant",
    plural: "Grants",
    description: "Funding that doesn't need to be repaid",
    icon: "dollar",
    color: "text-green-600",
    bgColor: "bg-green-600",
    borderColor: "border-green-600",
    lightBgColor: "bg-green-50",
  },
  accelerator: {
    slug: "accelerator",
    name: "Accelerator",
    plural: "Accelerators",
    description: "Intensive programs to fast-track your startup",
    icon: "rocket",
    color: "text-orange-600",
    bgColor: "bg-orange-600",
    borderColor: "border-orange-600",
    lightBgColor: "bg-orange-50",
  },
  incubator: {
    slug: "incubator",
    name: "Incubator",
    plural: "Incubators",
    description: "Nurture early-stage ideas into viable ventures",
    icon: "seedling",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600",
    borderColor: "border-emerald-600",
    lightBgColor: "bg-emerald-50",
  },
  coworking: {
    slug: "coworking",
    name: "Coworking Space",
    plural: "Coworking Spaces",
    description: "Flexible workspace for entrepreneurs",
    icon: "building",
    color: "text-blue-600",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-600",
    lightBgColor: "bg-blue-50",
  },
  event_space: {
    slug: "event_space",
    name: "Event Space",
    plural: "Event Spaces",
    description: "Venues for workshops, meetups, and launches",
    icon: "calendar",
    color: "text-purple-600",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-600",
    lightBgColor: "bg-purple-50",
  },
  sba: {
    slug: "sba",
    name: "SBA Resource",
    plural: "SBA Resources",
    description: "Free government business assistance",
    icon: "flag",
    color: "text-red-600",
    bgColor: "bg-red-600",
    borderColor: "border-red-600",
    lightBgColor: "bg-red-50",
  },
  pitch_competition: {
    slug: "pitch_competition",
    name: "Pitch Competition",
    plural: "Pitch Competitions",
    description: "Win funding by pitching your idea",
    icon: "microphone",
    color: "text-amber-600",
    bgColor: "bg-amber-600",
    borderColor: "border-amber-600",
    lightBgColor: "bg-amber-50",
  },
  mentorship: {
    slug: "mentorship",
    name: "Mentorship Program",
    plural: "Mentorship Programs",
    description: "Learn from experienced entrepreneurs",
    icon: "users",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600",
    borderColor: "border-indigo-600",
    lightBgColor: "bg-indigo-50",
  },
  legal: {
    slug: "legal",
    name: "Legal Service",
    plural: "Legal Services",
    description: "Legal help for startups and nonprofits",
    icon: "scale",
    color: "text-slate-600",
    bgColor: "bg-slate-600",
    borderColor: "border-slate-600",
    lightBgColor: "bg-slate-50",
  },
  accounting: {
    slug: "accounting",
    name: "Accounting Service",
    plural: "Accounting Services",
    description: "Financial services for small businesses",
    icon: "calculator",
    color: "text-teal-600",
    bgColor: "bg-teal-600",
    borderColor: "border-teal-600",
    lightBgColor: "bg-teal-50",
  },
  marketing: {
    slug: "marketing",
    name: "Marketing Service",
    plural: "Marketing Services",
    description: "Help spreading the word about your venture",
    icon: "megaphone",
    color: "text-pink-600",
    bgColor: "bg-pink-600",
    borderColor: "border-pink-600",
    lightBgColor: "bg-pink-50",
  },
  investor: {
    slug: "investor",
    name: "Investor",
    plural: "Investors",
    description: "Funding partners for your venture",
    icon: "trending-up",
    color: "text-cyan-600",
    bgColor: "bg-cyan-600",
    borderColor: "border-cyan-600",
    lightBgColor: "bg-cyan-50",
  },
  // New expansion categories
  "business-attorney": {
    slug: "business-attorney",
    name: "Business Attorney",
    plural: "Business Attorneys",
    description: "Legal counsel for incorporation, contracts, and IP",
    icon: "scale",
    color: "text-violet-600",
    bgColor: "bg-violet-600",
    borderColor: "border-violet-600",
    lightBgColor: "bg-violet-50",
  },
  accountant: {
    slug: "accountant",
    name: "Accountant",
    plural: "Accountants & CPAs",
    description: "Financial services and tax planning for small businesses",
    icon: "calculator",
    color: "text-teal-600",
    bgColor: "bg-teal-600",
    borderColor: "border-teal-600",
    lightBgColor: "bg-teal-50",
  },
  "marketing-agency": {
    slug: "marketing-agency",
    name: "Marketing Agency",
    plural: "Marketing Agencies",
    description: "Digital marketing, SEO, and branding services",
    icon: "megaphone",
    color: "text-pink-600",
    bgColor: "bg-pink-600",
    borderColor: "border-pink-600",
    lightBgColor: "bg-pink-50",
  },
  "print-shop": {
    slug: "print-shop",
    name: "Print Shop",
    plural: "Print & Design Shops",
    description: "Business cards, signage, and promotional materials",
    icon: "printer",
    color: "text-amber-600",
    bgColor: "bg-amber-600",
    borderColor: "border-amber-600",
    lightBgColor: "bg-amber-50",
  },
  "commercial-real-estate": {
    slug: "commercial-real-estate",
    name: "Commercial Real Estate",
    plural: "Commercial Real Estate",
    description: "Office, retail, and industrial space for your business",
    icon: "building-office",
    color: "text-sky-600",
    bgColor: "bg-sky-600",
    borderColor: "border-sky-600",
    lightBgColor: "bg-sky-50",
  },
  "business-insurance": {
    slug: "business-insurance",
    name: "Business Insurance",
    plural: "Business Insurance",
    description: "Liability, property, and workers comp coverage",
    icon: "shield-check",
    color: "text-lime-600",
    bgColor: "bg-lime-600",
    borderColor: "border-lime-600",
    lightBgColor: "bg-lime-50",
  },
  "chamber-of-commerce": {
    slug: "chamber-of-commerce",
    name: "Chamber of Commerce",
    plural: "Chambers of Commerce",
    description: "Local business networking and advocacy organizations",
    icon: "users",
    color: "text-rose-600",
    bgColor: "bg-rose-600",
    borderColor: "border-rose-600",
    lightBgColor: "bg-rose-50",
  },
  "virtual-office": {
    slug: "virtual-office",
    name: "Virtual Office",
    plural: "Virtual Offices",
    description: "Professional business addresses and mail services",
    icon: "envelope",
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-600",
    borderColor: "border-fuchsia-600",
    lightBgColor: "bg-fuchsia-50",
  },
  "business-consultant": {
    slug: "business-consultant",
    name: "Business Consultant",
    plural: "Business Consultants",
    description: "Strategy, operations, and growth advisory services",
    icon: "briefcase",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600",
    borderColor: "border-indigo-600",
    lightBgColor: "bg-indigo-50",
  },
};

// Search and filter types
export interface ResourceFilters {
  category?: ResourceCategory;
  state?: string;
  city?: string;
  subcategories?: string[];
  cause_areas?: string[];
  is_remote?: boolean;
  is_nationwide?: boolean;
  search?: string;
}

export interface ResourceSearchParams {
  filters: ResourceFilters;
  page: number;
  limit: number;
  sort: "relevance" | "newest" | "name";
}
