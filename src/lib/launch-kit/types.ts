// Launch Kit V2 Types
// Types for generated assets and data passed to generators

import type {
  Idea,
  UserProfile,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LaunchChecklistData,
  LocalResourcesData,
} from "@/types";

// Full deep dive data available to all asset generators
export interface DeepDiveData {
  idea: Idea;
  profile: UserProfile;
  foundation: BusinessFoundationData | null;
  growth: GrowthPlanData | null;
  financial: FinancialModelData | null;
  checklist: LaunchChecklistData | null;
  matchedResources: LocalResourcesData | null;
}

// Business overview extracted from idea + profile
export interface BusinessOverview {
  name: string;
  tagline: string;
  description: string;
  problem: string;
  audience: string;
  howItWorks: string;
  differentiation: string;
  category: string;
  city: string;
  state: string;
}

// Generated graphic metadata
export interface GeneratedGraphic {
  name: string;
  buffer: Buffer;
  width: number;
  height: number;
  platform: "instagram-post" | "instagram-story" | "linkedin-post" | "facebook-cover";
}

// Launch Kit V2 assets stored in database
export interface LaunchKitAssets {
  landingPage?: {
    slug: string;
    url: string;
    storagePath: string;
  };
  pitchDeck?: {
    storagePath: string;
  };
  socialGraphics?: {
    instagramPost?: { storagePath: string };
    instagramStory?: { storagePath: string };
    linkedinPost?: { storagePath: string };
    facebookCover?: { storagePath: string };
  };
  onePager?: {
    storagePath: string;
  };
  generatedAt: string;
}

// Color palette for business categories
export interface CategoryColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
}

// Get colors based on business category
export function getCategoryColors(category: string): CategoryColors {
  const palettes: Record<string, CategoryColors> = {
    food_beverage: {
      primary: "#C2410C", // Warm orange
      secondary: "#EA580C",
      accent: "#FED7AA",
      background: "#FFF7ED",
      text: "#431407",
      textLight: "#9A3412",
    },
    health_wellness: {
      primary: "#0D9488", // Teal
      secondary: "#14B8A6",
      accent: "#99F6E4",
      background: "#F0FDFA",
      text: "#134E4A",
      textLight: "#115E59",
    },
    education: {
      primary: "#7C3AED", // Purple
      secondary: "#8B5CF6",
      accent: "#DDD6FE",
      background: "#FAF5FF",
      text: "#4C1D95",
      textLight: "#6D28D9",
    },
    technology: {
      primary: "#2563EB", // Blue
      secondary: "#3B82F6",
      accent: "#BFDBFE",
      background: "#EFF6FF",
      text: "#1E3A8A",
      textLight: "#1D4ED8",
    },
    ecommerce: {
      primary: "#DB2777", // Pink
      secondary: "#EC4899",
      accent: "#FBCFE8",
      background: "#FDF2F8",
      text: "#831843",
      textLight: "#9D174D",
    },
    professional_services: {
      primary: "#1E40AF", // Deep blue
      secondary: "#3B82F6",
      accent: "#DBEAFE",
      background: "#F8FAFC",
      text: "#1E293B",
      textLight: "#334155",
    },
    creative_arts: {
      primary: "#C026D3", // Fuchsia
      secondary: "#D946EF",
      accent: "#F5D0FE",
      background: "#FDF4FF",
      text: "#701A75",
      textLight: "#86198F",
    },
    real_estate: {
      primary: "#065F46", // Emerald
      secondary: "#059669",
      accent: "#A7F3D0",
      background: "#ECFDF5",
      text: "#064E3B",
      textLight: "#047857",
    },
    social_enterprise: {
      primary: "#B45309", // Amber
      secondary: "#D97706",
      accent: "#FDE68A",
      background: "#FFFBEB",
      text: "#78350F",
      textLight: "#92400E",
    },
    other: {
      primary: "#374151", // Gray
      secondary: "#4B5563",
      accent: "#D1D5DB",
      background: "#F9FAFB",
      text: "#111827",
      textLight: "#374151",
    },
  };

  return palettes[category] || palettes.other;
}

// Extract business overview from deep dive data
export function extractBusinessOverview(data: DeepDiveData): BusinessOverview {
  const { idea, profile, growth } = data;

  return {
    name: idea.name,
    tagline: idea.tagline,
    description: growth?.landingPageCopy?.aboutSection || idea.problem,
    problem: idea.problem,
    audience: idea.audience,
    howItWorks: idea.mechanism || growth?.landingPageCopy?.benefits?.[0]?.description || "",
    differentiation: idea.competitiveAdvantage || idea.valueProposition || "",
    category: profile.businessCategory || "other",
    city: profile.location?.city || "",
    state: profile.location?.state || "",
  };
}

// Format currency for display
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]/g, "")) : amount;
  if (isNaN(num)) return "$0";

  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  }
  return `$${num.toFixed(0)}`;
}

// Generate slug from business name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
