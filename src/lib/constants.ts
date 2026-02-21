// SparkLocal Constants

import type {
  CauseArea,
  VentureType,
  Format,
  ExperienceLevel,
  BudgetLevel,
  BusinessCategory,
  BusinessModelPreference,
  TargetCustomer,
  KeySkill,
} from "@/types";

// Business categories (first step for all users)
export const BUSINESS_CATEGORIES: {
  id: BusinessCategory;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "food_beverage",
    label: "Food & Beverage",
    emoji: "🍽️",
    description: "Restaurants, cafes, food trucks, catering, specialty foods",
  },
  {
    id: "health_wellness",
    label: "Health & Wellness",
    emoji: "💪",
    description: "Fitness, therapy, nutrition, spa, personal training",
  },
  {
    id: "education",
    label: "Education & Coaching",
    emoji: "📚",
    description: "Tutoring, courses, coaching, training programs",
  },
  {
    id: "technology",
    label: "Technology",
    emoji: "💻",
    description: "Software, apps, SaaS, tech services, IT consulting",
  },
  {
    id: "ecommerce",
    label: "E-Commerce & Retail",
    emoji: "🛒",
    description: "Online stores, physical retail, product-based businesses",
  },
  {
    id: "professional_services",
    label: "Professional Services",
    emoji: "💼",
    description: "Consulting, legal, accounting, marketing agencies",
  },
  {
    id: "creative_arts",
    label: "Creative & Arts",
    emoji: "🎨",
    description: "Design, photography, music, content creation, crafts",
  },
  {
    id: "real_estate",
    label: "Real Estate & Property",
    emoji: "🏠",
    description: "Property management, real estate services, rentals",
  },
  {
    id: "social_enterprise",
    label: "Social Enterprise",
    emoji: "💚",
    description: "Mission-driven business focused on social or environmental impact",
  },
  {
    id: "other",
    label: "Other",
    emoji: "✨",
    description: "Something else entirely — we love creative ideas!",
  },
];

// Business models for general business path
export const BUSINESS_MODELS: {
  id: BusinessModelPreference;
  label: string;
  description: string;
}[] = [
  {
    id: "product",
    label: "Product-Based",
    description: "Sell physical or digital products to customers",
  },
  {
    id: "service",
    label: "Service-Based",
    description: "Provide services and expertise to clients",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Recurring revenue from memberships or subscriptions",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Connect buyers and sellers, take a commission",
  },
];

// Target customer types for general business path
export const TARGET_CUSTOMERS: {
  id: TargetCustomer;
  label: string;
  description: string;
}[] = [
  {
    id: "b2c",
    label: "Consumers (B2C)",
    description: "Individuals, families, everyday people",
  },
  {
    id: "b2b",
    label: "Businesses (B2B)",
    description: "Companies, organizations, other businesses",
  },
  {
    id: "b2g",
    label: "Government (B2G)",
    description: "Government agencies, municipalities, public sector",
  },
  {
    id: "other",
    label: "Mixed / Other",
    description: "Multiple customer types or something different",
  },
];

// Key skills for general business path
export const KEY_SKILLS: {
  id: KeySkill;
  label: string;
  description: string;
}[] = [
  {
    id: "sales_marketing",
    label: "Sales & Marketing",
    description: "Finding customers, closing deals, promotion",
  },
  {
    id: "technical",
    label: "Technical / Engineering",
    description: "Building, coding, technical problem-solving",
  },
  {
    id: "design_creative",
    label: "Design & Creative",
    description: "Visual design, branding, content creation",
  },
  {
    id: "finance_accounting",
    label: "Finance & Accounting",
    description: "Numbers, budgets, financial planning",
  },
  {
    id: "operations",
    label: "Operations & Logistics",
    description: "Getting things done, process management",
  },
  {
    id: "customer_service",
    label: "Customer Service",
    description: "Supporting and delighting customers",
  },
  {
    id: "leadership",
    label: "Leadership & Management",
    description: "Leading teams, making decisions",
  },
  {
    id: "industry_expertise",
    label: "Industry Expertise",
    description: "Deep knowledge in a specific field",
  },
];

// Cause area display data
export const CAUSE_AREAS: {
  id: CauseArea;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "environment",
    label: "Environment",
    emoji: "🌍",
    description: "Climate, conservation, sustainability",
  },
  {
    id: "education",
    label: "Education",
    emoji: "📚",
    description: "Learning, literacy, skills development",
  },
  {
    id: "health",
    label: "Health",
    emoji: "🏥",
    description: "Healthcare access, wellness, disease prevention",
  },
  {
    id: "poverty",
    label: "Poverty",
    emoji: "🤝",
    description: "Economic empowerment, financial inclusion",
  },
  {
    id: "food_security",
    label: "Food Security",
    emoji: "🌾",
    description: "Hunger relief, sustainable agriculture",
  },
  {
    id: "equity",
    label: "Equity & Justice",
    emoji: "⚖️",
    description: "Social justice, civil rights, inclusion",
  },
  {
    id: "animals",
    label: "Animals",
    emoji: "🐾",
    description: "Animal welfare, wildlife protection",
  },
  {
    id: "mental_health",
    label: "Mental Health",
    emoji: "🧠",
    description: "Mental wellness, support, awareness",
  },
  {
    id: "youth",
    label: "Youth",
    emoji: "👧",
    description: "Children, teens, young adults",
  },
  {
    id: "elder_care",
    label: "Elder Care",
    emoji: "👴",
    description: "Seniors, aging population support",
  },
  {
    id: "arts",
    label: "Arts & Culture",
    emoji: "🎨",
    description: "Creative expression, cultural preservation",
  },
  {
    id: "tech_access",
    label: "Tech Access",
    emoji: "💻",
    description: "Digital inclusion, tech education",
  },
];

// Venture type options
export const VENTURE_TYPES: {
  id: VentureType;
  label: string;
  description: string;
}[] = [
  {
    id: "project",
    label: "Community Project",
    description: "Organize something in your community — no business needed",
  },
  {
    id: "nonprofit",
    label: "Nonprofit",
    description: "A formal organization focused purely on impact",
  },
  {
    id: "business",
    label: "Social Business",
    description: "Make money while making a difference",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Combine business revenue with nonprofit mission",
  },
];

// Format options
export const FORMATS: {
  id: Format;
  label: string;
  description: string;
}[] = [
  {
    id: "online",
    label: "Online Only",
    description: "Digital products, services, or communities",
  },
  {
    id: "in_person",
    label: "In-Person",
    description: "Physical presence, local community focus",
  },
  {
    id: "both",
    label: "Both",
    description: "Hybrid approach with digital and physical elements",
  },
];

// Experience level options
export const EXPERIENCE_LEVELS: {
  id: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    id: "beginner",
    label: "Complete Beginner",
    description: "Never started a business or formal project before",
  },
  {
    id: "some",
    label: "Some Experience",
    description: "Dabbled in entrepreneurship or project leadership",
  },
  {
    id: "experienced",
    label: "Experienced",
    description: "Successfully launched ventures or led major initiatives",
  },
];

// Budget options
export const BUDGET_LEVELS: {
  id: BudgetLevel;
  label: string;
  description: string;
  range: string;
}[] = [
  {
    id: "zero",
    label: "Sweat Equity Only",
    description: "Time and effort, no money to invest",
    range: "$0",
  },
  {
    id: "low",
    label: "Bootstrap Budget",
    description: "Minimal investment to get started",
    range: "Under $500",
  },
  {
    id: "medium",
    label: "Seed Budget",
    description: "Some capital to invest in essentials",
    range: "$500 - $5,000",
  },
  {
    id: "high",
    label: "Growth Budget",
    description: "Significant capital to build properly",
    range: "$5,000+",
  },
];

// Step configuration (includes all possible steps from both paths)
export const STEPS = [
  "welcome",
  "business_category",
  // General business path
  "target_customer",
  "business_model",
  "key_skills",
  // Social enterprise path
  "venture_type",
  "causes",
  // Common steps (both paths)
  "format",
  "location",
  "experience",
  "budget",
  "commitment",
  "depth",
  "has_idea",
  "own_idea",
  "generating",
  "ideas",
  "deep_dive",
] as const;

// Progress percentage for each step (calibrated for both paths)
// Social enterprise path: welcome → business_category → venture_type → format → location → causes → experience → budget → commitment → depth → has_idea
// General business path: welcome → business_category → target_customer → business_model → key_skills → location → experience → budget → commitment → depth → has_idea
export const STEP_PROGRESS: Record<(typeof STEPS)[number], number> = {
  welcome: 0,
  business_category: 8,
  // General business path steps
  target_customer: 18,
  business_model: 28,
  key_skills: 38,
  // Social enterprise path steps
  venture_type: 18,
  causes: 38,
  // Common steps (progress continues from either path)
  format: 28,
  location: 48,
  experience: 56,
  budget: 64,
  commitment: 72,
  depth: 80,
  has_idea: 88,
  own_idea: 94,
  generating: 98,
  ideas: 100,
  deep_dive: 100,
};

// US States for location dropdown
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington, D.C." },
];
