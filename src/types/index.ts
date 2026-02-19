// SparkGood TypeScript Types

// User intake/profile types
export type VentureType = "project" | "nonprofit" | "business" | "hybrid";
export type Format = "online" | "in_person" | "both";
export type ExperienceLevel = "beginner" | "some" | "experienced";
export type BudgetLevel = "zero" | "low" | "medium" | "high";
export type CommitmentLevel = "weekend" | "steady" | "all_in";
export type Depth = "ideas" | "full";

export type CauseArea =
  | "environment"
  | "education"
  | "health"
  | "poverty"
  | "food_security"
  | "equity"
  | "animals"
  | "mental_health"
  | "youth"
  | "elder_care"
  | "arts"
  | "tech_access";

export interface UserProfile {
  ventureType: VentureType | null;
  format: Format | null;
  location: UserLocation | null;
  causes: CauseArea[];
  experience: ExperienceLevel | null;
  budget: BudgetLevel | null;
  commitment: CommitmentLevel | null;
  depth: Depth | null;
  hasIdea: boolean | null;
  ownIdea: string;
}

export interface UserLocation {
  city: string;
  state: string;
}

// Idea types
export interface Idea {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  audience: string;
  revenueModel: string | null; // null for pure community projects
  impact: string;
  causeAreas: CauseArea[];
  // Extended fields from generation
  mechanism?: string;
  whyNow?: string;
  firstStep?: string;
}

// Viability report types
export interface ViabilityReport {
  marketSize: string;
  demandAnalysis: string;
  competitors: Competitor[];
  targetAudience: AudienceProfile;
  strengths: string[];
  risks: string[];
  opportunities: string[];
  viabilityScore: number; // 1-10
  scoreBreakdown: ScoreBreakdown; // Individual dimension scores
  verdict: "go" | "refine" | "pivot";
  recommendation: string;
}

// Individual scoring dimensions for viability analysis
export interface ScoreBreakdown {
  marketOpportunity: DimensionScore;
  competitionLevel: DimensionScore;
  feasibility: DimensionScore;
  revenuePotential: DimensionScore;
  impactPotential: DimensionScore;
}

export interface DimensionScore {
  score: number; // 1-10
  explanation: string; // One-line explanation
}

export interface Competitor {
  name: string;
  url: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AudienceProfile {
  primaryPersona: string;
  demographics: string;
  painPoints: string[];
  motivations: string[];
}

// Business/Project plan types
export interface BusinessPlan {
  executiveSummary: string;
  missionStatement: string;
  impactThesis: string;
  revenueStreams?: RevenueStream[];
  volunteerPlan?: VolunteerPlan;
  financialProjections?: FinancialProjection[];
  budgetPlan?: BudgetItem[];
  partnerships: Partnership[];
  operations: string;
  impactMeasurement: ImpactMetric[];
}

export interface RevenueStream {
  name: string;
  description: string;
  estimatedRevenue: string;
  timeline: string;
}

export interface VolunteerPlan {
  rolesNeeded: string[];
  recruitmentStrategy: string;
  retentionStrategy: string;
}

export interface FinancialProjection {
  year: number;
  revenue: number;
  expenses: number;
  netIncome: number;
}

export interface BudgetItem {
  category: string;
  amount: number;
  priority: "essential" | "important" | "nice_to_have";
  notes: string;
}

export interface Partnership {
  type: string;
  description: string;
  potentialPartners: string[];
}

export interface ImpactMetric {
  metric: string;
  target: string;
  measurementMethod: string;
  frequency: string;
}

// Marketing assets types
export interface MarketingAssets {
  elevatorPitch: string;
  tagline: string;
  landingPageHeadline: string;
  landingPageSubheadline: string;
  socialPosts: SocialPost[];
  emailTemplate: EmailTemplate;
  primaryCTA: string;
}

export interface SocialPost {
  platform: "twitter" | "linkedin" | "instagram" | "nextdoor";
  content: string;
  hashtags: string[];
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

// Action roadmap types
export interface ActionRoadmap {
  quickWins: QuickWin[];
  phases: Phase[];
  skipList: string[];
}

export interface QuickWin {
  task: string;
  timeframe: string;
  cost: "free" | "low" | "medium";
}

export interface Phase {
  name: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  task: string;
  priority: "critical" | "high" | "medium" | "low";
  cost: "free" | "low" | "medium" | "high";
  dependencies: string[];
}

// Combined generated content state
export interface GeneratedContent {
  ideas: Idea[];
  selectedIdea: Idea | null;
  viability: ViabilityReport | null;
  plan: BusinessPlan | null;
  marketing: MarketingAssets | null;
  roadmap: ActionRoadmap | null;
}

// Launch Kit types
export interface LaunchKit {
  landingPage: LandingPageAsset;
  socialPosts: LaunchKitSocialPosts;
  emailSequence: EmailSequence;
  elevatorPitch: string;
}

export interface LandingPageAsset {
  html: string;
  headline: string;
  subheadline: string;
}

export interface LaunchKitSocialPosts {
  linkedin: SocialPost;
  twitter: SocialPost;
  instagram: SocialPost;
  nextdoor: SocialPost;
}

export interface EmailSequence {
  email1: EmailTemplate;
  email2: EmailTemplate;
  email3: EmailTemplate;
}

// Step state for the guided flow
export type StepName =
  | "welcome"
  | "venture_type"
  | "format"
  | "location"
  | "causes"
  | "experience"
  | "budget"
  | "commitment"
  | "depth"
  | "has_idea"
  | "own_idea"
  | "generating"
  | "ideas"
  | "deep_dive";

export interface StepState {
  currentStep: StepName;
  completedSteps: StepName[];
  canProgress: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Re-export asset types
export * from "./assets";

// Re-export resource types
export * from "./resources";
