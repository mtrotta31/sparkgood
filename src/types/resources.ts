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
  | "investor";

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
  created_at: string;
  updated_at: string;
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
}

export const CATEGORY_INFO: Record<ResourceCategory, CategoryInfo> = {
  grant: {
    slug: "grant",
    name: "Grant",
    plural: "Grants",
    description: "Funding that doesn't need to be repaid",
    icon: "dollar",
    color: "text-green-400",
  },
  accelerator: {
    slug: "accelerator",
    name: "Accelerator",
    plural: "Accelerators",
    description: "Intensive programs to fast-track your startup",
    icon: "rocket",
    color: "text-spark",
  },
  incubator: {
    slug: "incubator",
    name: "Incubator",
    plural: "Incubators",
    description: "Nurture early-stage ideas into viable ventures",
    icon: "seedling",
    color: "text-emerald-400",
  },
  coworking: {
    slug: "coworking",
    name: "Coworking Space",
    plural: "Coworking Spaces",
    description: "Flexible workspace for entrepreneurs",
    icon: "building",
    color: "text-blue-400",
  },
  event_space: {
    slug: "event_space",
    name: "Event Space",
    plural: "Event Spaces",
    description: "Venues for workshops, meetups, and launches",
    icon: "calendar",
    color: "text-purple-400",
  },
  sba: {
    slug: "sba",
    name: "SBA Resource",
    plural: "SBA Resources",
    description: "Free government business assistance",
    icon: "flag",
    color: "text-red-400",
  },
  pitch_competition: {
    slug: "pitch_competition",
    name: "Pitch Competition",
    plural: "Pitch Competitions",
    description: "Win funding by pitching your idea",
    icon: "microphone",
    color: "text-yellow-400",
  },
  mentorship: {
    slug: "mentorship",
    name: "Mentorship Program",
    plural: "Mentorship Programs",
    description: "Learn from experienced entrepreneurs",
    icon: "users",
    color: "text-indigo-400",
  },
  legal: {
    slug: "legal",
    name: "Legal Service",
    plural: "Legal Services",
    description: "Legal help for startups and nonprofits",
    icon: "scale",
    color: "text-slate-400",
  },
  accounting: {
    slug: "accounting",
    name: "Accounting Service",
    plural: "Accounting Services",
    description: "Financial services for small businesses",
    icon: "calculator",
    color: "text-teal-400",
  },
  marketing: {
    slug: "marketing",
    name: "Marketing Service",
    plural: "Marketing Services",
    description: "Help spreading the word about your venture",
    icon: "megaphone",
    color: "text-pink-400",
  },
  investor: {
    slug: "investor",
    name: "Investor",
    plural: "Investors",
    description: "Funding partners for your venture",
    icon: "trending-up",
    color: "text-cyan-400",
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
