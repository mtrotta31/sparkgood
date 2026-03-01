// SparkLocal TypeScript Types

// User intake/profile types
export type VentureType = "project" | "nonprofit" | "business" | "hybrid";
export type Format = "online" | "in_person" | "both";
export type ExperienceLevel = "beginner" | "some" | "experienced";
export type BudgetLevel = "zero" | "low" | "medium" | "high";
export type CommitmentLevel = "weekend" | "steady" | "all_in";
export type Depth = "ideas" | "full";

// Business category types (general business path)
export type BusinessCategory =
  | "food_beverage"
  | "health_wellness"
  | "education"
  | "technology"
  | "ecommerce"
  | "professional_services"
  | "creative_arts"
  | "real_estate"
  | "social_enterprise"
  | "other";

export type BusinessModelPreference =
  | "product"
  | "service"
  | "subscription"
  | "marketplace";

export type TargetCustomer = "b2b" | "b2c" | "b2g" | "other";

export type KeySkill =
  | "sales_marketing"
  | "technical"
  | "design_creative"
  | "finance_accounting"
  | "operations"
  | "customer_service"
  | "leadership"
  | "industry_expertise";

// Cause areas (social enterprise path)
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
  // Business category (first choice - determines path)
  businessCategory: BusinessCategory | null;

  // General business path fields
  targetCustomer: TargetCustomer | null;
  businessModelPreference: BusinessModelPreference | null;
  keySkills: KeySkill[];

  // Social enterprise path fields
  ventureType: VentureType | null;
  causes: CauseArea[];

  // Common fields (both paths)
  format: Format | null;
  location: UserLocation | null;
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

  // Social enterprise fields
  impact?: string;
  causeAreas?: CauseArea[];

  // General business fields
  businessCategory?: BusinessCategory;
  valueProposition?: string;
  competitiveAdvantage?: string;

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

// Action roadmap types (legacy)
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

// ============================================
// NEW DEEP DIVE TYPES (v2 - Structured JSON)
// ============================================

// Tab 1: Launch Checklist Types
export interface LaunchChecklistData {
  weeks: LaunchWeek[];
}

export interface LaunchWeek {
  weekNumber: number;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  priority: "critical" | "important" | "optional";
  estimatedTime: string;
  estimatedCost: string;
  guide: string; // Markdown content
  resources?: MatchedResourceRef[];
  links?: ExternalLink[];
}

export interface MatchedResourceRef {
  id: string;
  name: string;
  type: "grant" | "accelerator" | "coworking" | "sba";
  url: string;
  description?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
}

// Tab 2: Business Foundation Types
export interface BusinessFoundationData {
  marketViability: MarketViabilitySection;
  legalStructure: LegalStructureSection;
  startupCosts: StartupCostItem[];
  suppliers: SupplierSection;
  techStack: TechStackSection;
  insurance: InsuranceSection;
}

export interface MarketViabilitySection {
  overallScore: number; // 0-100
  scoreBreakdown: ViabilityScoreItem[];
  marketResearch: MarketResearchFindings;
  competitorAnalysis: CompetitorAnalysisItem[];
  localMarketSize: string;
}

export interface ViabilityScoreItem {
  factor: string;
  score: number;
  assessment: string;
}

export interface MarketResearchFindings {
  tam: string;
  sam: string;
  som: string;
  growthRate: string;
  trends: string[];
  demandSignals: string[];
  risks: string[];
  sources: string[];
}

export interface CompetitorAnalysisItem {
  name: string;
  url: string;
  pricing: string;
  positioning: string;
  weakness: string;
}

export interface LegalStructureSection {
  recommendedStructure: string;
  reasoning: string;
  registrationSteps: string[];
  estimatedCost: string;
  licensesRequired: string[];
  whenToGetLawyer: string;
}

export interface StartupCostItem {
  item: string;
  cost: string;
  priority: "Week 1" | "Week 2" | "Week 3" | "Week 4" | "Month 2" | "Month 3";
  notes: string;
}

export interface SupplierSection {
  platforms: SupplierPlatform[];
  evaluationChecklist: string[];
  minimumOrderExpectations: string;
  paymentTermsInfo: string;
}

export interface SupplierPlatform {
  name: string;
  url: string;
  description: string;
  bestFor: string;
}

export interface TechStackSection {
  recommendation: string;
  reasoning: string;
  tools: TechToolRecommendation[];
  setupTime: string;
}

export interface TechToolRecommendation {
  name: string;
  purpose: string;
  cost: string;
  url: string;
}

export interface InsuranceSection {
  required: InsuranceRequirement[];
  totalEstimatedCost: string;
  complianceNotes: string[];
  taxObligations: string;
}

export interface InsuranceRequirement {
  type: string;
  estimatedCost: string;
  provider: string;
  url: string;
}

// Tab 3: Growth Plan Types
export interface GrowthPlanData {
  elevatorPitch: string;
  landingPageCopy: LandingPageCopy;
  socialMediaPosts: SocialMediaPost[];
  emailTemplates: GrowthEmailTemplate[];
  localMarketing: LocalMarketingTactic[];
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  benefits: BenefitBlock[];
  socialProofPlaceholder: string;
  ctaButtonText: string;
  aboutSection: string;
  faq: FAQItem[];
  setupGuide: string;
}

export interface BenefitBlock {
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialMediaPost {
  platform: "instagram" | "linkedin" | "tiktok" | "twitter" | "facebook" | "nextdoor";
  caption: string;
  visualSuggestion: string;
  bestTimeToPost: string;
  hashtags: string[];
}

export interface GrowthEmailTemplate {
  type: "launch_announcement" | "cold_outreach" | "follow_up";
  subject: string;
  body: string;
}

export interface LocalMarketingTactic {
  tactic: string;
  details: string;
  pitchTemplate?: string;
}

// Tab 4: Financial Model Types
export interface FinancialModelData {
  startupCostsSummary: FinancialTableRow[];
  monthlyOperatingCosts: FinancialTableRow[];
  revenueProjections: RevenueProjections;
  breakEvenAnalysis: BreakEvenAnalysis;
  pricingStrategy: PricingStrategy;
}

export interface FinancialTableRow {
  item: string;
  monthlyCost?: string;
  annualCost?: string;
  cost?: string;
  notes: string;
}

export interface RevenueProjections {
  conservative: RevenueScenario;
  moderate: RevenueScenario;
  aggressive: RevenueScenario;
}

export interface RevenueScenario {
  monthlyCustomers: number;
  averageOrder: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyProfit: number;
  breakEvenMonth: string;
}

export interface BreakEvenAnalysis {
  unitsNeeded: number;
  description: string;
}

export interface PricingStrategy {
  recommendedPrice: string;
  reasoning: string;
  psychologyTips: string[];
  testingApproach: string;
}

// Checklist Progress (for persistence)
export interface ChecklistProgress {
  [itemId: string]: boolean;
}

// Tab 5: Local Resources Types
export interface LocalResourcesData {
  // Legacy fields for backward compatibility
  coworking: LocalResourceItem[];
  grants: LocalResourceItem[];
  accelerators: LocalResourceItem[];
  sba: LocalResourceItem[];
  // Dynamic categories - any category from the database
  byCategory: Record<string, LocalResourceItem[]>;
  allCategories: string[]; // List of category slugs that have resources
  // Location info
  citySlug: string;
  cityName: string;
  state: string;
  totalMatched: number;
}

export interface LocalResourceItem {
  id: string;
  name: string;
  slug: string;
  category: string; // ResourceCategory - coworking, grant, accelerator, sba, business-attorney, etc.
  city: string | null;
  state: string | null;
  isNationwide: boolean;
  relevanceNote: string; // AI-generated explanation of why this is relevant
  website?: string; // Resource website
  // Category-specific details
  rating?: number; // Coworking
  priceRange?: string; // Coworking, Virtual Office
  amountRange?: string; // Grant
  deadline?: string; // Grant/Accelerator
  fundingAmount?: string; // Accelerator
  services?: string[]; // SBA
  isFree?: boolean; // SBA
  specialty?: string; // Attorneys, Consultants, etc.
}

// Tab 6: AI Advisor Types
export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AdvisorContext {
  profile: UserProfile;
  idea: Idea;
  checklist?: LaunchChecklistData;
  foundation?: BusinessFoundationData;
  growth?: GrowthPlanData;
  financial?: FinancialModelData;
}

// Deep Dive V2 Section Types
export type DeepDiveSectionV2 =
  | "checklist"
  | "foundation"
  | "growth"
  | "financial"
  // Legacy support
  | "viability"
  | "plan"
  | "marketing"
  | "roadmap";

export type DeepDiveResponseV2 =
  | LaunchChecklistData
  | BusinessFoundationData
  | GrowthPlanData
  | FinancialModelData
  // Legacy types
  | ViabilityReport
  | BusinessPlan
  | MarketingAssets
  | ActionRoadmap;

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
  | "business_category" // New first step - choose business category
  // General business path
  | "target_customer"
  | "business_model"
  | "key_skills"
  // Social enterprise path
  | "venture_type"
  | "causes"
  // Common steps (both paths)
  | "format"
  | "location"
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
