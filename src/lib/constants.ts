// SparkGood Constants

import type { CauseArea, VentureType, Format, ExperienceLevel, BudgetLevel } from "@/types";

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

// Step configuration
export const STEPS = [
  "welcome",
  "venture_type",
  "format",
  "causes",
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

// Progress percentage for each step
export const STEP_PROGRESS: Record<(typeof STEPS)[number], number> = {
  welcome: 0,
  venture_type: 10,
  format: 20,
  causes: 30,
  experience: 42,
  budget: 52,
  commitment: 62,
  depth: 72,
  has_idea: 82,
  own_idea: 90,
  generating: 95,
  ideas: 100,
  deep_dive: 100,
};
