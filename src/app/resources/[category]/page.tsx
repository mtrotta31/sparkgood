// SparkLocal Resource Directory - Category Page (Light Theme)
// Lists all resources in a category with enhanced filters and pagination
// Also handles city hub pages when param is a location slug (e.g., austin-tx)

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_INFO,
  type ResourceCategory,
  type ResourceListing,
  type ResourceLocation,
} from "@/types/resources";
import ResourceCard from "@/components/resources/ResourceCard";
import CategoryFiltersLight from "@/components/resources/CategoryFiltersLight";
import CityHubContent from "@/components/resources/CityHubContent";
import CategoryGuideContent from "@/components/resources/CategoryGuideContent";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    state?: string;
    city?: string;
    subcategory?: string;
    remote?: string;
    sort?: string;
    page?: string;
    open?: string;
    amount_min?: string;
    amount_max?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

// Slug normalization map - maps common URL variations to canonical slugs
// This allows /resources/grants, /resources/grant, /resources/sba-resources, etc.
const SLUG_ALIASES: Record<string, ResourceCategory> = {
  // Grant variations
  grants: "grant",
  grant: "grant",
  funding: "grant",

  // Coworking variations
  coworking: "coworking",
  "coworking-spaces": "coworking",
  "coworking-space": "coworking",
  workspace: "coworking",
  workspaces: "coworking",

  // Accelerator variations
  accelerator: "accelerator",
  accelerators: "accelerator",
  "startup-accelerator": "accelerator",
  "startup-accelerators": "accelerator",

  // Incubator variations
  incubator: "incubator",
  incubators: "incubator",
  "startup-incubator": "incubator",
  "startup-incubators": "incubator",

  // SBA variations
  sba: "sba",
  "sba-resources": "sba",
  "sba-resource": "sba",
  sbdc: "sba",
  score: "sba",

  // Mentorship variations
  mentorship: "mentorship",
  mentors: "mentorship",
  mentor: "mentorship",

  // Business Attorney variations
  "business-attorney": "business-attorney",
  "business-attorneys": "business-attorney",
  "business-lawyer": "business-attorney",
  "business-lawyers": "business-attorney",
  attorney: "business-attorney",
  attorneys: "business-attorney",

  // Accountant variations
  accountant: "accountant",
  accountants: "accountant",
  cpa: "accountant",
  cpas: "accountant",
  bookkeeper: "accountant",
  bookkeepers: "accountant",

  // Marketing Agency variations
  "marketing-agency": "marketing-agency",
  "marketing-agencies": "marketing-agency",
  "digital-marketing": "marketing-agency",

  // Print Shop variations
  "print-shop": "print-shop",
  "print-shops": "print-shop",
  printing: "print-shop",
  "print-design": "print-shop",

  // Commercial Real Estate variations
  "commercial-real-estate": "commercial-real-estate",
  "commercial-property": "commercial-real-estate",
  "office-space": "commercial-real-estate",
  "retail-space": "commercial-real-estate",

  // Business Insurance variations
  "business-insurance": "business-insurance",
  "commercial-insurance": "business-insurance",
  "liability-insurance": "business-insurance",

  // Chamber of Commerce variations
  "chamber-of-commerce": "chamber-of-commerce",
  "chambers-of-commerce": "chamber-of-commerce",
  chamber: "chamber-of-commerce",
  chambers: "chamber-of-commerce",

  // Virtual Office variations
  "virtual-office": "virtual-office",
  "virtual-offices": "virtual-office",
  "business-address": "virtual-office",
  "mail-forwarding": "virtual-office",

  // Business Consultant variations
  "business-consultant": "business-consultant",
  "business-consultants": "business-consultant",
  consultant: "business-consultant",
  consultants: "business-consultant",
  consulting: "business-consultant",
};

// Normalize a slug to its canonical form
function normalizeSlug(slug: string): ResourceCategory | null {
  // First check if it's already a valid category
  if (slug in CATEGORY_INFO) {
    return slug as ResourceCategory;
  }
  // Then check aliases
  const normalized = SLUG_ALIASES[slug.toLowerCase()];
  return normalized || null;
}

// Note: isValidCategory was replaced by normalizeSlug which handles aliases

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: paramValue } = await params;

  // Try to normalize the slug to a valid category
  const normalizedCategory = normalizeSlug(paramValue);

  // Check if this is a category (or alias)
  if (normalizedCategory) {
    const info = CATEGORY_INFO[normalizedCategory];
    const supabase = await createClient();

    // Get count of listings in this category
    const { count } = await supabase
      .from("resource_listings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", normalizedCategory);

    const listingCount = count || 0;

    const title = `${info.plural} for Entrepreneurs`;
    const description = `Browse ${listingCount} ${info.plural.toLowerCase()} to launch your business. ${info.description}. Compare options, eligibility, and apply.`;

    return {
      title,
      description,
      keywords: [
        info.plural.toLowerCase(),
        `${info.name.toLowerCase()} for small business`,
        "entrepreneur resources",
        "business support",
        "business funding",
      ],
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "SparkLocal",
        url: `https://sparklocal.co/resources/${normalizedCategory}`,
        images: [
          {
            url: "https://sparklocal.co/og-default.png",
            width: 1200,
            height: 630,
            alt: "SparkLocal - Business Resources Directory",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["https://sparklocal.co/og-default.png"],
      },
      alternates: {
        canonical: `https://sparklocal.co/resources/${normalizedCategory}`,
      },
    };
  }

  // Otherwise, check if this is a location slug
  const supabase = await createClient();
  const { data: location } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", paramValue)
    .single();

  if (location) {
    // Get category counts for this city (local listings only)
    const categories = ["grant", "coworking", "accelerator", "sba"] as const;
    const countPromises = categories.map(async (cat) => {
      const { count } = await supabase
        .from("resource_listings")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("city", location.city)
        .eq("state", location.state)
        .eq("is_remote", false)
        .or("is_nationwide.eq.false,is_nationwide.is.null")
        .eq("category", cat);
      return { cat, count: count || 0 };
    });
    const counts = await Promise.all(countPromises);
    const catCounts: Record<string, number> = {};
    counts.forEach(({ cat, count }) => { catCounts[cat] = count; });

    // Build category summary for description (e.g., "12 grants, 8 coworking spaces")
    const countParts: string[] = [];
    if (catCounts.grant > 0) countParts.push(`${catCounts.grant} grants`);
    if (catCounts.coworking > 0) countParts.push(`${catCounts.coworking} coworking`);
    if (catCounts.accelerator > 0) countParts.push(`${catCounts.accelerator} accelerators`);
    if (catCounts.sba > 0) countParts.push(`${catCounts.sba} SBA resources`);

    const totalLocal = Object.values(catCounts).reduce((a, b) => a + b, 0);
    const countSummary = countParts.length > 0 ? countParts.join(", ") : "coworking, grants, accelerators";

    const title = `Business Resources in ${location.city}, ${location.state}`;
    const description = `Find ${totalLocal}+ resources in ${location.city}, ${location.state}: ${countSummary}. Free directory on SparkLocal.`;

    return {
      title,
      description,
      keywords: [
        `business resources ${location.city}`,
        `grants ${location.city} ${location.state}`,
        `coworking spaces ${location.city}`,
        `accelerators ${location.city}`,
        `SBA ${location.city}`,
        "small business help",
      ],
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "SparkLocal",
        url: `https://sparklocal.co/resources/${paramValue}`,
        images: [
          {
            url: "https://sparklocal.co/og-default.png",
            width: 1200,
            height: 630,
            alt: "SparkLocal - Business Resources Directory",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["https://sparklocal.co/og-default.png"],
      },
      alternates: {
        canonical: `https://sparklocal.co/resources/${paramValue}`,
      },
    };
  }

  return { title: "Not Found" };
}

// Get category-specific hero background gradient
function getCategoryHeroStyle(category: string) {
  switch (category) {
    case "grant":
      return "from-green-50 to-white";
    case "coworking":
      return "from-blue-50 to-white";
    case "accelerator":
      return "from-orange-50 to-white";
    case "sba":
      return "from-red-50 to-white";
    case "incubator":
      return "from-emerald-50 to-white";
    case "business-attorney":
      return "from-violet-50 to-white";
    case "accountant":
      return "from-teal-50 to-white";
    case "marketing-agency":
      return "from-pink-50 to-white";
    case "print-shop":
      return "from-amber-50 to-white";
    case "commercial-real-estate":
      return "from-sky-50 to-white";
    case "business-insurance":
      return "from-lime-50 to-white";
    case "chamber-of-commerce":
      return "from-rose-50 to-white";
    case "virtual-office":
      return "from-fuchsia-50 to-white";
    case "business-consultant":
      return "from-indigo-50 to-white";
    default:
      return "from-gray-50 to-white";
  }
}

// Get category icon
function getCategoryIcon(category: string) {
  switch (category) {
    case "grant":
      return (
        <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "coworking":
      return (
        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "accelerator":
      return (
        <svg className="w-12 h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      );
    case "sba":
      return (
        <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      );
    case "business-attorney":
      return (
        <svg className="w-12 h-12 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
        </svg>
      );
    case "accountant":
      return (
        <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
        </svg>
      );
    case "marketing-agency":
      return (
        <svg className="w-12 h-12 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      );
    case "print-shop":
      return (
        <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
      );
    case "commercial-real-estate":
      return (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "business-insurance":
      return (
        <svg className="w-12 h-12 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "chamber-of-commerce":
      return (
        <svg className="w-12 h-12 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      );
    case "virtual-office":
      return (
        <svg className="w-12 h-12 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "business-consultant":
      return (
        <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      );
    default:
      return (
        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: paramValue } = await params;
  const filters = await searchParams;

  // Try to normalize the slug to a valid category
  const normalizedCategory = normalizeSlug(paramValue);

  // Check if this is a valid category (or alias)
  if (normalizedCategory) {
    // Render category page with the normalized category
    return renderCategoryPage(normalizedCategory, filters);
  }

  // Otherwise, check if this is a location slug
  const supabase = await createClient();
  const { data: location } = await supabase
    .from("resource_locations")
    .select("*")
    .eq("slug", paramValue)
    .single();

  if (location) {
    // Render city hub page
    return <CityHubContent location={location as ResourceLocation} />;
  }

  // Neither category nor location - 404
  notFound();
}

// Separated category page rendering for cleaner code
async function renderCategoryPage(
  category: ResourceCategory,
  filters: {
    state?: string;
    city?: string;
    subcategory?: string;
    remote?: string;
    sort?: string;
    page?: string;
    open?: string;
    amount_min?: string;
    amount_max?: string;
  }
) {
  const categoryInfo = CATEGORY_INFO[category];

  const supabase = await createClient();
  const currentPage = parseInt(filters.page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query
  let query = supabase
    .from("resource_listings")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("category", category);

  // Apply filters
  if (filters.state) {
    query = query.eq("state", filters.state);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.subcategory) {
    query = query.contains("subcategories", [filters.subcategory]);
  }
  if (filters.remote === "true") {
    query = query.or("is_remote.eq.true,is_nationwide.eq.true");
  }

  // Apply sorting
  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "rating":
      query = query.order("details->rating", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("name");
  }

  // Apply pagination
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: listings, count: totalCount } = await query;

  // Get total count without filters for comparison
  const { count: unfilteredCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category);

  // Get unique states, cities, and subcategories for filters
  const { data: allListings } = await supabase
    .from("resource_listings")
    .select("state, city, subcategories")
    .eq("is_active", true)
    .eq("category", category);

  const states = Array.from(
    new Set(allListings?.map((l) => l.state).filter(Boolean) || [])
  ).sort() as string[];

  const cities = Array.from(
    new Set(allListings?.map((l) => l.city).filter(Boolean) || [])
  ).sort() as string[];

  const subcategories = Array.from(
    new Set(allListings?.flatMap((l) => l.subcategories || []) || [])
  ).sort() as string[];

  // Get local listings by STATE for sidebar
  // Query listings that are state-specific (not nationwide/remote)
  const { data: localListingsForCounts } = await supabase
    .from("resource_listings")
    .select("city, state")
    .eq("is_active", true)
    .eq("category", category)
    .eq("is_nationwide", false)
    .eq("is_remote", false)
    .not("state", "is", null);

  // Count listings per state (for sidebar)
  const stateCountMap = new Map<string, number>();
  localListingsForCounts?.forEach((listing) => {
    if (listing.state) {
      stateCountMap.set(listing.state, (stateCountMap.get(listing.state) || 0) + 1);
    }
  });

  // Get top states by count
  const topStateCounts = Array.from(stateCountMap.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Build locations array with state data for sidebar
  const locations = topStateCounts.map((s) => ({
    state: s.state,
    count: s.count,
  }));

  // Get nationwide/remote count for this category
  const { count: nationwideCount } = await supabase
    .from("resource_listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("category", category)
    .or("is_nationwide.eq.true,is_remote.eq.true");

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);
  const showPagination = totalPages > 1;

  // Build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.remote) params.set("remote", filters.remote);
    if (filters.sort) params.set("sort", filters.sort);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return `/resources/${category}${queryString ? `?${queryString}` : ""}`;
  };

  // Build breadcrumb if filtered to a city
  const showBreadcrumb = filters.city || filters.state;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`pt-24 pb-12 px-4 bg-gradient-to-b ${getCategoryHeroStyle(category)}`}>
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Resources
          </Link>

          {/* Breadcrumb if filtered */}
          {showBreadcrumb && (
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/resources" className="hover:text-gray-700">Resources</Link>
              <span>/</span>
              <Link href={`/resources/${category}`} className="hover:text-gray-700">{categoryInfo.plural}</Link>
              <span>/</span>
              <span className="text-gray-900">
                {filters.city || filters.state}
              </span>
            </nav>
          )}

          {/* Hero content */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {getCategoryIcon(category)}
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {categoryInfo.plural}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                {categoryInfo.description}. Browse {unfilteredCount || 0} listings
                to find the right fit for your venture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Content Section */}
      <CategoryGuideContent category={category} />

      {/* Sticky Filter Bar */}
      <section className="sticky top-16 z-40 bg-gray-50 border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFiltersLight
            category={category}
            states={states}
            cities={cities}
            subcategories={subcategories}
            totalCount={unfilteredCount || 0}
            filteredCount={totalCount || 0}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 scroll-mt-44">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Popular Locations */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-48">
                <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
                  Browse by Location
                </h3>
                <div className="space-y-2">
                  {/* All [Category] entry - always show first as default */}
                  <Link
                    href={`/resources/${category}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 hover:border-amber-400 hover:shadow-sm transition-all group"
                  >
                    <span className="text-amber-700 group-hover:text-amber-900 transition-colors font-semibold">
                      All {categoryInfo.plural}
                    </span>
                    <span className="text-amber-600 text-sm font-semibold">
                      {unfilteredCount}
                    </span>
                  </Link>
                  {/* Nationwide entry */}
                  {nationwideCount && nationwideCount > 0 && (
                    <Link
                      href={`/resources/${category}?remote=true`}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="text-blue-700 group-hover:text-blue-900 transition-colors font-medium">
                        Nationwide / Remote
                      </span>
                      <span className="text-blue-500 text-sm font-medium">
                        {nationwideCount}
                      </span>
                    </Link>
                  )}
                  {/* State entries - local resources by state */}
                  {locations?.map((loc) => (
                    <Link
                      key={loc.state}
                      href={`/resources/${category}?state=${encodeURIComponent(loc.state)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                        {loc.state}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {loc.count}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <h4 className="font-display text-gray-900 font-semibold mb-2">
                    Get Matched
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Let SparkLocal recommend the best resources for your specific
                    idea and location.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors"
                  >
                    Start Building
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Listings Grid */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {listings && listings.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                      <ResourceCard
                        key={listing.id}
                        listing={listing as ResourceListing}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {showPagination && (
                    <div className="mt-8 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of {totalCount?.toLocaleString()} {categoryInfo.plural.toLowerCase()}
                      </p>
                      <div className="flex items-center gap-2">
                        {currentPage > 1 && (
                          <Link
                            href={getPaginationUrl(currentPage - 1)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            Previous
                          </Link>
                        )}
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages && (
                          <Link
                            href={getPaginationUrl(currentPage + 1)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            Next
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">
                    No {categoryInfo.plural.toLowerCase()} found with these filters.
                  </p>
                  <Link
                    href={`/resources/${category}`}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Clear filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
