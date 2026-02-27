// API route for deep dive generation
// Takes selected idea + user profile and generates viability, plan, marketing, and roadmap
// NOW WITH REAL RESEARCH: Uses Perplexity for market data + Firecrawl to scrape competitors

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasDeepDiveAccess, type SubscriptionTier } from "@/lib/stripe";
import { sendMessageForJSON } from "@/lib/claude";
import { conductMarketResearch, type MarketResearchData } from "@/lib/perplexity";
import { scrapeCompetitors, type CompetitorInsight } from "@/lib/firecrawl";
import {
  generateViabilityPrompt,
  generateBusinessPlanPrompt,
  generateMarketingPrompt,
  generateRoadmapPrompt,
  VIABILITY_SYSTEM_PROMPT,
  BUSINESS_PLAN_SYSTEM_PROMPT,
  MARKETING_SYSTEM_PROMPT,
  ROADMAP_SYSTEM_PROMPT,
  // V2 prompt generators
  generateChecklistPrompt,
  generateFoundationPrompt,
  generateGrowthPrompt,
  generateFinancialPrompt,
  CHECKLIST_SYSTEM_PROMPT,
  FOUNDATION_SYSTEM_PROMPT,
  GROWTH_SYSTEM_PROMPT,
  FINANCIAL_SYSTEM_PROMPT,
} from "@/prompts/deep-dive";
import { matchResources, type MatchedResources } from "@/lib/match-resources";
import {
  generateResearchEnhancedViabilityPrompt,
  generateResearchEnhancedPlanPrompt,
  generateResearchEnhancedMarketingPrompt,
  generateResearchEnhancedRoadmapPrompt,
  RESEARCH_ENHANCED_VIABILITY_SYSTEM_PROMPT,
  RESEARCH_ENHANCED_PLAN_SYSTEM_PROMPT,
  RESEARCH_ENHANCED_MARKETING_SYSTEM_PROMPT,
  RESEARCH_ENHANCED_ROADMAP_SYSTEM_PROMPT,
  type ResearchData,
  type PerplexityResult,
  type FirecrawlResult,
} from "@/prompts/research-enhanced-prompts";
import type {
  UserProfile,
  Idea,
  ViabilityReport,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
  ApiResponse,
  // V2 types
  LaunchChecklistData,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
} from "@/types";

// V2 sections: checklist, foundation, growth, financial
// Legacy sections: viability, plan, marketing, roadmap (kept for backwards compatibility)
type DeepDiveSection =
  | "checklist" | "foundation" | "growth" | "financial"  // V2
  | "viability" | "plan" | "marketing" | "roadmap";       // Legacy

interface DeepDiveRequest {
  idea: Idea;
  profile: UserProfile;
  section: DeepDiveSection;
}

type DeepDiveResponse =
  | ViabilityReport | BusinessPlan | MarketingAssets | ActionRoadmap  // Legacy
  | LaunchChecklistData | BusinessFoundationData | GrowthPlanData | FinancialModelData;  // V2

// Cache research data per session to avoid redundant API calls
// In production, this would be stored in Redis or similar
interface CachedResearch {
  marketResearch: MarketResearchData | null;
  competitorInsights: CompetitorInsight[];
  timestamp: number;
  researchAttempted: boolean; // Whether we tried to do research (even if it failed)
  useResearch: boolean; // Final decision: should we use research-enhanced prompts?
}

const researchCache = new Map<string, CachedResearch>();

// Helper to ensure viability scores are properly populated with varied scores
function processViabilityScores(report: ViabilityReport): ViabilityReport {
  // If scoreBreakdown exists and has valid, varied scores, use it
  if (report.scoreBreakdown) {
    const scores = [
      report.scoreBreakdown.marketOpportunity?.score,
      report.scoreBreakdown.competitionLevel?.score,
      report.scoreBreakdown.feasibility?.score,
      report.scoreBreakdown.revenuePotential?.score,
      report.scoreBreakdown.impactPotential?.score,
    ].filter((s): s is number => typeof s === "number");

    // Check if we have all 5 scores and they're not all the same
    const uniqueScores = new Set(scores.map(s => s.toFixed(1)));
    const hasVariedScores = scores.length === 5 && uniqueScores.size >= 3;

    if (hasVariedScores) {
      console.log("ScoreBreakdown valid with varied scores:", scores);
      return report;
    } else {
      console.log("ScoreBreakdown invalid or uniform scores:", scores);
    }
  }

  // Generate intelligent fallback scores based on the overall viability score
  // and analysis of the report's content
  const baseScore = report.viabilityScore;
  console.log("Generating intelligent fallback scores from base:", baseScore);

  // Analyze report content to adjust scores intelligently
  const hasStrongMarket = report.marketSize?.toLowerCase().includes("billion") ||
    report.demandAnalysis?.toLowerCase().includes("strong") ||
    report.demandAnalysis?.toLowerCase().includes("high demand");

  const hasLowCompetition = report.competitors?.length <= 2 ||
    report.strengths?.some(s => s.toLowerCase().includes("unique") || s.toLowerCase().includes("no direct"));

  const hasFeasibilityRisks = report.risks?.some(r =>
    r.toLowerCase().includes("complex") || r.toLowerCase().includes("difficult") || r.toLowerCase().includes("technical")
  );

  const hasRevenueClarity = !!report.targetAudience?.demographics &&
    report.opportunities?.some(o => o.toLowerCase().includes("revenue") || o.toLowerCase().includes("monetiz"));

  const hasHighImpact = report.strengths?.some(s =>
    s.toLowerCase().includes("impact") || s.toLowerCase().includes("community") || s.toLowerCase().includes("social")
  );

  // Generate varied scores (±0.5 to ±2.0 from base)
  const fallbackScores = {
    marketOpportunity: {
      score: Math.min(10, Math.max(1, baseScore + (hasStrongMarket ? 0.8 : -0.5))),
      explanation: hasStrongMarket
        ? "Growing market with clear demand signals"
        : "Market exists but size needs validation"
    },
    competitionLevel: {
      score: Math.min(10, Math.max(1, baseScore + (hasLowCompetition ? 1.0 : -1.0))),
      explanation: hasLowCompetition
        ? "Limited direct competition, room for differentiation"
        : "Established players exist, requiring clear positioning"
    },
    feasibility: {
      score: Math.min(10, Math.max(1, baseScore + (hasFeasibilityRisks ? -1.5 : 0.3))),
      explanation: hasFeasibilityRisks
        ? "Execution requires careful planning and resources"
        : "Achievable with available resources and skills"
    },
    revenuePotential: {
      score: Math.min(10, Math.max(1, baseScore + (hasRevenueClarity ? 0.5 : -1.5))),
      explanation: hasRevenueClarity
        ? "Multiple revenue streams possible with clear paths"
        : "Revenue model needs further development"
    },
    impactPotential: {
      score: Math.min(10, Math.max(1, baseScore + (hasHighImpact ? 1.5 : 0.5))),
      explanation: hasHighImpact
        ? "Strong potential for meaningful community impact"
        : "Impact achievable with focused execution"
    },
  };

  console.log("Generated fallback scores:", {
    marketOpportunity: fallbackScores.marketOpportunity.score,
    competitionLevel: fallbackScores.competitionLevel.score,
    feasibility: fallbackScores.feasibility.score,
    revenuePotential: fallbackScores.revenuePotential.score,
    impactPotential: fallbackScores.impactPotential.score,
  });

  return {
    ...report,
    scoreBreakdown: fallbackScores,
  };
}

// Generate cache key from idea name and profile
function getCacheKey(idea: Idea, profile: UserProfile): string {
  return `${idea.name}-${profile.ventureType}-${profile.causes?.join(",") || ""}`;
}

// Check if cache is still valid (1 hour TTL)
function isCacheValid(timestamp: number): boolean {
  const ONE_HOUR = 60 * 60 * 1000;
  return Date.now() - timestamp < ONE_HOUR;
}

// Quality filter: Check if research data is good enough to use
// Returns true if research should be used, false if we should fall back to Claude-only
function isResearchQualityGood(marketResearch: MarketResearchData): boolean {
  // Check 1: Do we have meaningful market size info? (not just error messages or generic text)
  const marketSizeOk = marketResearch.marketSize &&
    marketResearch.marketSize.length > 100 &&
    !marketResearch.marketSize.toLowerCase().includes("unavailable") &&
    !marketResearch.marketSize.toLowerCase().includes("error");

  // Check 2: Did we find any competitor names or URLs?
  const hasCompetitors = (marketResearch.competitorNames?.length || 0) >= 2 ||
    (marketResearch.competitorUrls?.length || 0) >= 2;

  // Check 3: Do we have funding/trends info?
  const hasFundingInfo = marketResearch.fundingLandscape &&
    marketResearch.fundingLandscape.length > 50 &&
    !marketResearch.fundingLandscape.toLowerCase().includes("unavailable");

  // Quality threshold: need at least 2 out of 3 checks to pass
  const passedChecks = [marketSizeOk, hasCompetitors, hasFundingInfo].filter(Boolean).length;

  console.log(`Research quality check: marketSizeOk=${marketSizeOk}, hasCompetitors=${hasCompetitors}, hasFundingInfo=${hasFundingInfo}, passed=${passedChecks}/3`);

  return passedChecks >= 2;
}

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  try {
    const body = await request.json();
    const { idea, profile, section } = body as DeepDiveRequest;


    // Validate required fields
    if (!idea || !profile || !section) {
      console.log("Missing required fields, returning error");
      return NextResponse.json<ApiResponse<DeepDiveResponse>>({
        success: false,
        error: "Missing required fields: idea, profile, or section",
      });
    }

    // ========================================================================
    // CREDIT/ACCESS CHECK: Verify user has paid for this deep dive
    // ========================================================================
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<DeepDiveResponse>>({
        success: false,
        error: "Authentication required",
      }, { status: 401 });
    }

    // Rate limit check
    const allowed = await checkRateLimit("/api/deep-dive", user.id);
    if (!allowed) {
      return NextResponse.json<ApiResponse<DeepDiveResponse>>(
        { success: false, error: "Rate limit exceeded. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    // Get user's credits and purchases
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Check access using the stripe helper function
    const tier = (credits?.subscription_tier || "free") as SubscriptionTier;
    const isActive = credits?.subscription_status === "active";
    const deepDiveCredits = credits?.deep_dive_credits_remaining || 0;
    const purchases = credits?.one_time_purchases || [];

    // For subscriptions, must be active
    const effectiveTier = isActive ? tier : "free";

    const canAccess = hasDeepDiveAccess(
      effectiveTier,
      deepDiveCredits,
      purchases,
      idea.id
    );

    if (!canAccess) {
      return NextResponse.json<ApiResponse<DeepDiveResponse>>({
        success: false,
        error: "Payment required. Please purchase this deep dive or subscribe to access.",
      }, { status: 403 });
    }

    // Check for API key
    if (!anthropicKey) {
      console.warn("No ANTHROPIC_API_KEY set, returning mock data");
      return NextResponse.json<ApiResponse<DeepDiveResponse>>({
        success: true,
        data: getMockData(section, idea, profile),
      });
    }

    // ========================================================================
    // STEP 1: CHECK CACHE OR CONDUCT RESEARCH (BLOCKING - complete before generating)
    // ========================================================================
    const cacheKey = getCacheKey(idea, profile);
    let cachedData = researchCache.get(cacheKey);

    // Make the research decision ONCE and cache it
    if (!cachedData || !isCacheValid(cachedData.timestamp)) {
      const hasPerplexityKey = !!perplexityKey;
      const hasFirecrawlKey = !!firecrawlKey;

      // Initialize cache entry with decision tracking
      cachedData = {
        marketResearch: null,
        competitorInsights: [],
        timestamp: Date.now(),
        researchAttempted: false,
        useResearch: false, // Will be set to true only if research succeeds AND is high quality
      };

      if (hasPerplexityKey) {
        cachedData.researchAttempted = true;
        console.log("Attempting research for:", idea.name);

        try {
          const primaryCause = idea.causeAreas?.[0] || profile.causes?.[0] || "social impact";

          // Format location string if provided
          const locationString = profile.location
            ? `${profile.location.city}, ${profile.location.state}`
            : undefined;

          // Step 1: Market research via Perplexity (BLOCKING)
          const marketResearch = await conductMarketResearch(
            idea.name,
            idea.tagline,
            primaryCause,
            profile.ventureType || "project",
            profile.format || "both",
            locationString
          );

          cachedData.marketResearch = marketResearch;

          // Step 2: Scrape competitor websites via Firecrawl (if available)
          if (hasFirecrawlKey && marketResearch.competitorUrls.length > 0) {
            try {
              cachedData.competitorInsights = await scrapeCompetitors(marketResearch.competitorUrls);
            } catch (scrapeError) {
              console.warn("Firecrawl scraping failed:", scrapeError);
            }
          }

          // Step 3: Check quality and make FINAL decision
          if (isResearchQualityGood(marketResearch)) {
            cachedData.useResearch = true;
            console.log("Research quality GOOD - will use research-enhanced prompts");
          } else {
            cachedData.useResearch = false;
            console.log("Research quality LOW - falling back to Claude-only generation");
          }

        } catch (researchError) {
          console.warn("Research APIs failed:", researchError);
          cachedData.useResearch = false;
        }
      } else {
        console.log("No Perplexity key - using Claude-only generation");
        cachedData.useResearch = false;
      }

      // Cache the decision
      researchCache.set(cacheKey, cachedData);
    }

    // ========================================================================
    // STEP 2: GENERATE CONTENT (using the cached decision)
    // ========================================================================
    let data: DeepDiveResponse;

    // Use the cached decision - this never changes for this idea/profile combo
    const useResearch = cachedData.useResearch;
    console.log(`Generating ${section} content with research=${useResearch}`);

    // Convert cached research data to ResearchData format for prompts
    // Only create this if we decided to use research
    const formattedResearch: ResearchData | undefined = useResearch && cachedData.marketResearch
      ? {
          marketResearch: {
            query: `market research for ${idea.name}`,
            answer: `Market Size: ${cachedData.marketResearch.marketSize}\n\nTrends: ${cachedData.marketResearch.trends}\n\nFunding: ${cachedData.marketResearch.fundingLandscape}`,
            sources: cachedData.marketResearch.rawResponses?.flatMap(r =>
              r.citations.map(url => ({ title: url, url, snippet: "" }))
            ) || [],
          } as PerplexityResult,
          demandSignals: {
            query: `demand signals for ${idea.name}`,
            answer: cachedData.marketResearch.demandSignals || "",
            sources: [],
          } as PerplexityResult,
          existingSolutions: {
            query: `existing solutions for ${idea.name}`,
            answer: `Competitors: ${cachedData.marketResearch.competitorNames?.join(", ") || "None identified"}`,
            sources: cachedData.marketResearch.competitorUrls?.map(url => ({
              title: url,
              url,
              snippet: "",
            })) || [],
          } as PerplexityResult,
          competitors: cachedData.competitorInsights?.map((c) => ({
            url: c.url,
            title: c.name,
            description: c.description,
            pricing: c.pricingModel,
            services: c.keyMessages,
            targetAudience: c.targetAudience,
            uniqueValue: c.differentiators?.join(", ") || c.tagline,
          } as FirecrawlResult)) || [],
        }
      : undefined;

    // ========================================================================
    // STEP 3: MATCH LOCAL RESOURCES (for V2 prompts)
    // ========================================================================
    let matchedResources: MatchedResources = {
      coworking: [],
      grants: [],
      accelerators: [],
      sba: [],
      totalMatched: 0,
    };

    // Match resources for V2 sections or when we need them for enhanced prompts
    const v2Sections = ["checklist", "foundation", "growth", "financial"];
    if (v2Sections.includes(section)) {
      try {
        matchedResources = await matchResources(profile, idea);
        console.log(`Matched ${matchedResources.totalMatched} resources for ${section}`);
      } catch (matchError) {
        console.warn("Resource matching failed, continuing without resources:", matchError);
      }
    }

    try {
      switch (section) {
        case "viability":
          // Use research-enhanced prompt if we have research data
          const viabilityPrompt = formattedResearch
            ? generateResearchEnhancedViabilityPrompt(idea, profile, formattedResearch)
            : generateViabilityPrompt(idea, profile);
          const rawViabilityData = await sendMessageForJSON<ViabilityReport>(viabilityPrompt, {
            systemPrompt: formattedResearch
              ? RESEARCH_ENHANCED_VIABILITY_SYSTEM_PROMPT
              : VIABILITY_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 4096,
          });

          // Debug logging to see what Claude returned
          console.log("=== VIABILITY RESPONSE DEBUG ===");
          console.log("Has scoreBreakdown:", !!rawViabilityData.scoreBreakdown);
          console.log("Raw scoreBreakdown:", JSON.stringify(rawViabilityData.scoreBreakdown, null, 2));

          // Post-process to ensure scoreBreakdown exists with valid, varied scores
          data = processViabilityScores(rawViabilityData);
          break;

        case "plan":
          const planPrompt = formattedResearch
            ? generateResearchEnhancedPlanPrompt(idea, profile, formattedResearch)
            : generateBusinessPlanPrompt(idea, profile);
          data = await sendMessageForJSON<BusinessPlan>(planPrompt, {
            systemPrompt: formattedResearch
              ? RESEARCH_ENHANCED_PLAN_SYSTEM_PROMPT
              : BUSINESS_PLAN_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 6000,
          });
          break;

        case "marketing":
          const marketingPrompt = formattedResearch
            ? generateResearchEnhancedMarketingPrompt(idea, profile, formattedResearch)
            : generateMarketingPrompt(idea, profile);
          data = await sendMessageForJSON<MarketingAssets>(marketingPrompt, {
            systemPrompt: formattedResearch
              ? RESEARCH_ENHANCED_MARKETING_SYSTEM_PROMPT
              : MARKETING_SYSTEM_PROMPT,
            temperature: 0.8,
            maxTokens: 4096,
          });
          break;

        case "roadmap":
          const roadmapPrompt = formattedResearch
            ? generateResearchEnhancedRoadmapPrompt(idea, profile, formattedResearch)
            : generateRoadmapPrompt(idea, profile);
          data = await sendMessageForJSON<ActionRoadmap>(roadmapPrompt, {
            systemPrompt: formattedResearch
              ? RESEARCH_ENHANCED_ROADMAP_SYSTEM_PROMPT
              : ROADMAP_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 4096,
          });
          break;

        // ====================================================================
        // V2 SECTIONS (Sprint 1 Rewrite)
        // ====================================================================

        case "checklist":
          const checklistPrompt = generateChecklistPrompt(profile, idea, matchedResources);
          data = await sendMessageForJSON<LaunchChecklistData>(checklistPrompt, {
            systemPrompt: CHECKLIST_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 6000,
          });
          break;

        case "foundation":
          // Foundation uses research data if available
          const foundationPrompt = generateFoundationPrompt(
            profile,
            idea,
            matchedResources,
            formattedResearch
          );
          data = await sendMessageForJSON<BusinessFoundationData>(foundationPrompt, {
            systemPrompt: FOUNDATION_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 8000,
          });
          break;

        case "growth":
          const growthPrompt = generateGrowthPrompt(profile, idea, matchedResources);
          data = await sendMessageForJSON<GrowthPlanData>(growthPrompt, {
            systemPrompt: GROWTH_SYSTEM_PROMPT,
            temperature: 0.8,
            maxTokens: 6000,
          });
          break;

        case "financial":
          const financialPrompt = generateFinancialPrompt(profile, idea, matchedResources);
          data = await sendMessageForJSON<FinancialModelData>(financialPrompt, {
            systemPrompt: FINANCIAL_SYSTEM_PROMPT,
            temperature: 0.7,
            maxTokens: 6000,
          });
          break;

        default:
          return NextResponse.json<ApiResponse<DeepDiveResponse>>({
            success: false,
            error: `Invalid section: ${section}`,
          });
      }
    } catch (apiError) {
      // If Claude API fails, fall back to mock data
      console.warn("Claude API failed, falling back to mock data:", apiError);
      data = getMockData(section, idea, profile);
    }

    return NextResponse.json<ApiResponse<DeepDiveResponse>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating deep dive:", error);
    return NextResponse.json<ApiResponse<DeepDiveResponse>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}

// Mock data for development - calibrated by commitment level
function getMockData(
  section: DeepDiveSection,
  idea: Idea,
  profile: UserProfile
): DeepDiveResponse {
  const commitment = profile.commitment || "steady";

  switch (section) {
    // Legacy sections
    case "viability":
      if (commitment === "weekend") return getMockWeekendViability(idea);
      if (commitment === "steady") return getMockSteadyViability(idea, profile);
      return getMockViability(idea, profile);
    case "plan":
      if (commitment === "weekend") return getMockWeekendPlan(idea);
      if (commitment === "steady") return getMockSteadyPlan(idea, profile);
      return getMockPlan(idea, profile);
    case "marketing":
      if (commitment === "weekend") return getMockWeekendMarketing(idea);
      if (commitment === "steady") return getMockSteadyMarketing(idea);
      return getMockMarketing(idea);
    case "roadmap":
      if (commitment === "weekend") return getMockWeekendRoadmap();
      if (commitment === "steady") return getMockSteadyRoadmap();
      return getMockRoadmap(profile);

    // V2 sections
    case "checklist":
      return getMockChecklist(idea, profile);
    case "foundation":
      return getMockFoundation(idea, profile);
    case "growth":
      return getMockGrowth(idea, profile);
    case "financial":
      return getMockFinancial(idea, profile);
  }
}

// V2 Mock Data Functions
function getMockChecklist(_idea: Idea, profile: UserProfile): LaunchChecklistData {
  const state = profile.location?.state || "TX";
  return {
    weeks: [
      {
        weekNumber: 1,
        title: "Foundation",
        items: [
          {
            id: "register-llc",
            title: `Register your LLC in ${state}`,
            priority: "critical",
            estimatedTime: "1-2 hours",
            estimatedCost: "$300",
            guide: `To register an LLC in ${state}:\n1. Go to the Secretary of State website\n2. Choose "Form a Business Entity"\n3. Select LLC and fill out the Articles of Organization\n4. Pay the filing fee ($300)\n5. Wait for approval (usually 3-5 business days)`,
            resources: [],
            links: [{ label: "Secretary of State", url: `https://sos.${state.toLowerCase()}.gov` }],
          },
          {
            id: "get-ein",
            title: "Get your EIN (Employer Identification Number)",
            priority: "critical",
            estimatedTime: "15 minutes",
            estimatedCost: "Free",
            guide: "Go to irs.gov/ein and apply online. It's free and takes about 15 minutes. You'll need your LLC info ready.",
            resources: [],
            links: [{ label: "IRS EIN Application", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" }],
          },
          {
            id: "open-bank",
            title: "Open a business bank account",
            priority: "important",
            estimatedTime: "1 hour",
            estimatedCost: "Free-$25/month",
            guide: "Bring your EIN, Articles of Organization, and government ID to a local bank or apply online with Mercury or Relay (both free, online-first banks for small businesses).",
            resources: [],
            links: [
              { label: "Mercury Bank", url: "https://mercury.com" },
              { label: "Relay Bank", url: "https://relayfi.com" },
            ],
          },
        ],
      },
      {
        weekNumber: 2,
        title: "Setup",
        items: [
          {
            id: "business-insurance",
            title: "Get business insurance",
            priority: "important",
            estimatedTime: "30 minutes",
            estimatedCost: "$30-100/month",
            guide: "Start with general liability insurance. Get quotes from Next Insurance or Hiscox — both offer quick online quotes for small businesses.",
            resources: [],
            links: [
              { label: "Next Insurance", url: "https://nextinsurance.com" },
              { label: "Hiscox", url: "https://hiscox.com" },
            ],
          },
        ],
      },
    ],
  };
}

function getMockFoundation(_idea: Idea, _profile: UserProfile): BusinessFoundationData {
  return {
    marketViability: {
      overallScore: 75,
      scoreBreakdown: [
        { factor: "Market Demand", score: 80, assessment: "Growing market with clear demand signals" },
        { factor: "Competition", score: 70, assessment: "Some competitors exist but room for differentiation" },
        { factor: "Startup Feasibility", score: 75, assessment: "Achievable within stated budget" },
        { factor: "Revenue Potential", score: 72, assessment: "Multiple revenue streams possible" },
        { factor: "Timing", score: 78, assessment: "Market conditions favorable" },
      ],
      marketResearch: {
        tam: "$50 billion",
        sam: "$5 billion",
        som: "$500,000",
        growthRate: "12% annually",
        trends: ["Growing consumer interest", "Shift to local", "Digital adoption"],
        demandSignals: ["High search volume", "Social media interest"],
        risks: ["Economic downturn", "New competitors"],
        sources: ["Industry Report 2024", "Market Analysis"],
      },
      competitorAnalysis: [
        {
          name: "Competitor A",
          url: "https://competitor-a.com",
          pricing: "$29-99/month",
          positioning: "Premium, feature-rich",
          weakness: "Expensive and complex to use",
        },
      ],
      localMarketSize: "Approximately 50,000 potential customers in your metro area",
    },
    legalStructure: {
      recommendedStructure: "LLC",
      reasoning: "Best balance of liability protection and tax flexibility for small businesses",
      registrationSteps: [
        "File Articles of Organization with Secretary of State ($300)",
        "Get EIN from IRS (free)",
        "Register for state tax ID if required",
      ],
      estimatedCost: "$300-500",
      licensesRequired: ["General Business License", "Potentially industry-specific licenses"],
      whenToGetLawyer: "For complex contracts, partnerships, or if raising investment",
    },
    startupCosts: [
      { item: "LLC Registration", cost: "$300", priority: "Week 1", notes: "One-time fee" },
      { item: "Website/Domain", cost: "$50", priority: "Week 2", notes: "Annual cost" },
      { item: "Insurance", cost: "$50/month", priority: "Week 1", notes: "Monthly ongoing" },
    ],
    suppliers: {
      platforms: [
        { name: "Faire", url: "https://faire.com", description: "Wholesale marketplace", bestFor: "Physical products" },
      ],
      evaluationChecklist: ["Check minimum order quantities", "Verify shipping costs", "Read reviews"],
      minimumOrderExpectations: "Typically $100-500 for first orders",
      paymentTermsInfo: "Most offer Net 30 or Net 60 after relationship established",
    },
    techStack: {
      recommendation: "Start simple with Squarespace or Carrd",
      reasoning: "Easy to use, professional templates, no coding required",
      tools: [
        { name: "Squarespace", purpose: "Website", cost: "$16/month", url: "https://squarespace.com" },
        { name: "Stripe", purpose: "Payments", cost: "2.9% + $0.30/transaction", url: "https://stripe.com" },
      ],
      setupTime: "2-4 hours for basic site",
    },
    insurance: {
      required: [
        { type: "General Liability", estimatedCost: "$30-50/month", provider: "Next Insurance", url: "https://nextinsurance.com" },
      ],
      totalEstimatedCost: "$30-50/month",
      complianceNotes: ["Register for state tax ID", "Check local business license requirements"],
      taxObligations: "Quarterly estimated taxes, annual returns",
    },
  };
}

function getMockGrowth(_idea: Idea, _profile: UserProfile): GrowthPlanData {
  return {
    elevatorPitch: "I'm launching a business that helps local customers solve their problems in a new way. What makes us different is our focus on community and personalized service. We're launching this month and I'm looking for early customers who want to be part of something new.",
    landingPageCopy: {
      headline: "The Smarter Way to Get What You Need",
      subheadline: "Join hundreds of locals who've discovered a better approach",
      benefits: [
        { title: "Save Time", description: "Get what you need faster than ever before" },
        { title: "Save Money", description: "Affordable options that fit your budget" },
        { title: "Local Support", description: "Real people in your community ready to help" },
      ],
      socialProofPlaceholder: "Trusted by 100+ happy customers in your neighborhood",
      ctaButtonText: "Get Started Free",
      aboutSection: "We started this because we saw a better way. As locals ourselves, we understand what our community needs.",
      faq: [
        { question: "How does it work?", answer: "Sign up, tell us what you need, and we handle the rest." },
        { question: "What does it cost?", answer: "We offer free trials and affordable monthly plans." },
        { question: "How do I get started?", answer: "Click the button above and we'll guide you through!" },
      ],
      setupGuide: "Sign up for Carrd ($19/year) or Squarespace, paste in this copy, add your images, and publish.",
    },
    socialMediaPosts: [
      {
        platform: "instagram",
        caption: "We're officially launching! 🎉 After months of preparation, we're ready to help you [benefit]. Link in bio to learn more.",
        visualSuggestion: "Behind-the-scenes photo or celebration image",
        bestTimeToPost: "Tuesday 10am or Thursday 2pm",
        hashtags: ["SmallBusiness", "LocalBusiness", "LaunchDay"],
      },
      {
        platform: "linkedin",
        caption: "Excited to announce the launch of our new venture. We're solving [problem] for [audience] by [solution]. If you know anyone who could benefit, I'd love an introduction.",
        visualSuggestion: "Professional headshot or product image",
        bestTimeToPost: "Tuesday-Thursday, 8-10am",
        hashtags: ["Entrepreneurship", "SmallBusiness", "Startup"],
      },
    ],
    emailTemplates: [
      {
        type: "launch_announcement",
        subject: "Something new for our community",
        body: "Hi [Name],\n\nI wanted to personally let you know about something I've been working on.\n\n[1-2 sentences about the business]\n\nI think this could really help [target customer], and I'd love your support — whether that's trying it out, sharing with someone who'd benefit, or just giving feedback.\n\n[CTA Button]\n\nThanks for being part of this journey!\n\n[Your name]",
      },
      {
        type: "cold_outreach",
        subject: "Quick question about [their business/role]",
        body: "Hi [Name],\n\nI noticed you [something specific about them]. I'm launching [your business] to help [target customer] with [problem].\n\nWould you be open to a quick 10-minute call to get your perspective? I'd genuinely value your insight.\n\nBest,\n[Your name]",
      },
    ],
    localMarketing: [
      {
        tactic: "Join local subreddit and Facebook groups",
        details: "Be helpful first, answer questions in your area of expertise. Mention your business only when directly relevant to solving someone's problem.",
      },
      {
        tactic: "Partner with complementary local businesses",
        details: "Identify businesses whose customers might need your service. Offer cross-promotion or referral arrangement.",
        pitchTemplate: "I run [your business] and I think our customers overlap. Would you be open to a cross-promotion?",
      },
      {
        tactic: "Attend local networking events",
        details: "Check meetup.com, eventbrite, and local chamber of commerce. Bring business cards, be genuinely interested in others, follow up within 24 hours.",
      },
    ],
  };
}

function getMockFinancial(_idea: Idea, _profile: UserProfile): FinancialModelData {
  return {
    startupCostsSummary: [
      { item: "LLC Registration", cost: "$300", notes: "One-time state fee" },
      { item: "Business Insurance", cost: "$50/month", notes: "Monthly ongoing" },
      { item: "Website/Domain", cost: "$50", notes: "First year" },
      { item: "Initial Marketing", cost: "$200", notes: "Launch campaign" },
    ],
    monthlyOperatingCosts: [
      { item: "Software/Tools", monthlyCost: "$50", annualCost: "$600", notes: "Essential tools" },
      { item: "Insurance", monthlyCost: "$50", annualCost: "$600", notes: "General liability" },
      { item: "Marketing", monthlyCost: "$100", annualCost: "$1,200", notes: "Ads and content" },
      { item: "Miscellaneous", monthlyCost: "$50", annualCost: "$600", notes: "Buffer for unexpected" },
    ],
    revenueProjections: {
      conservative: {
        monthlyCustomers: 10,
        averageOrder: 50,
        monthlyRevenue: 500,
        monthlyCosts: 250,
        monthlyProfit: 250,
        breakEvenMonth: "Month 3",
      },
      moderate: {
        monthlyCustomers: 25,
        averageOrder: 50,
        monthlyRevenue: 1250,
        monthlyCosts: 350,
        monthlyProfit: 900,
        breakEvenMonth: "Month 1",
      },
      aggressive: {
        monthlyCustomers: 50,
        averageOrder: 50,
        monthlyRevenue: 2500,
        monthlyCosts: 500,
        monthlyProfit: 2000,
        breakEvenMonth: "Month 1",
      },
    },
    breakEvenAnalysis: {
      unitsNeeded: 10,
      description: "You need about 10 customers per month (roughly 2-3 per week) to break even. Most similar businesses reach break-even within 2-3 months.",
    },
    pricingStrategy: {
      recommendedPrice: "$49",
      reasoning: "Similar services charge $40-80. Your pricing is competitive while leaving room for premium positioning.",
      psychologyTips: [
        "End prices in 9 (e.g., $49) for perceived value",
        "Offer a premium tier to make standard seem affordable",
      ],
      testingApproach: "Start at $49, offer early-bird 20% discount, test $59 after first 20 customers",
    },
  };
}

function getMockViability(_idea: Idea, _profile: UserProfile): ViabilityReport {
  return {
    marketSize:
      "The community resource-sharing market is estimated at $150 billion globally, with peer-to-peer sharing platforms growing 25% annually. Locally, neighborhoods with 5,000+ households represent ideal initial markets.",
    demandAnalysis:
      "Strong demand signals exist: Buy Nothing groups have 7 million+ members, tool library waitlists average 3 months, and 78% of surveyed neighbors express interest in borrowing vs. buying. The post-pandemic shift toward local community has accelerated this trend.",
    competitors: [
      {
        name: "Buy Nothing Project",
        url: "https://buynothingproject.org",
        description:
          "Facebook-based hyperlocal gifting communities focused on giving items away for free.",
        strengths: ["Large existing network", "Strong community ethos", "Zero cost"],
        weaknesses: [
          "Facebook dependency",
          "No borrowing/returning workflow",
          "Inconsistent experience",
        ],
      },
      {
        name: "Nextdoor",
        url: "https://nextdoor.com",
        description:
          "Neighborhood social network with marketplace and borrowing features.",
        strengths: ["Wide adoption", "Verified addresses", "Feature-rich"],
        weaknesses: [
          "Not purpose-built for sharing",
          "Cluttered with other content",
          "Trust issues",
        ],
      },
      {
        name: "Local Tool Libraries",
        url: "https://localtools.org",
        description:
          "Physical locations where community members can borrow tools.",
        strengths: ["Curated inventory", "Staff assistance", "Quality control"],
        weaknesses: [
          "Limited hours",
          "Requires physical location",
          "High overhead",
        ],
      },
    ],
    targetAudience: {
      primaryPersona:
        "Sarah is a 35-year-old apartment dweller who recently moved to the neighborhood. She needs a drill for one project but doesn't want to buy and store tools she'll rarely use. She values sustainability and wants to meet her neighbors.",
      demographics:
        "25-55 years old, urban/suburban, middle income, environmentally conscious, renters or small-space homeowners",
      painPoints: [
        "Buying expensive items used only once",
        "Limited storage space",
        "Not knowing neighbors",
        "Feeling isolated in their community",
      ],
      motivations: [
        "Save money on occasional-use items",
        "Reduce environmental impact",
        "Build genuine local connections",
        "Be part of a community movement",
      ],
    },
    strengths: [
      "Clear dual value proposition (save money + build community)",
      "Low startup costs with app-light approach",
      "Strong alignment with sustainability trends",
      "Natural network effects as community grows",
    ],
    risks: [
      "Trust barrier for sharing valuable items",
      "Liability concerns for damaged/lost items",
      "Critical mass needed for utility",
      "Volunteer coordinator burnout",
    ],
    opportunities: [
      "Partner with apartment complexes as amenity",
      "Expand to skills/time sharing",
      "Corporate sustainability partnerships",
      "Municipal support for community resilience",
    ],
    viabilityScore: 7.8,
    scoreBreakdown: {
      marketOpportunity: {
        score: 8.0,
        explanation: "Growing demand for sharing economy solutions, especially post-pandemic"
      },
      competitionLevel: {
        score: 7.5,
        explanation: "Existing players focus on specific niches, leaving room for differentiation"
      },
      feasibility: {
        score: 7.0,
        explanation: "Achievable with low-tech approach, but requires community organizing skills"
      },
      revenuePotential: {
        score: 6.5,
        explanation: "Multiple revenue streams possible but will need validation"
      },
      impactPotential: {
        score: 9.0,
        explanation: "Strong environmental and community-building impact potential"
      }
    },
    verdict: "refine",
    recommendation:
      "Strong concept with clear demand. Before building any technology, validate with a manual pilot: create a shared Google Sheet for one apartment building or block, recruit 10 founding members, and facilitate 20 successful shares. This will reveal trust mechanisms and operational needs. The 7.8 score reflects solid fundamentals with execution risks that can be mitigated through careful piloting.",
  };
}

function getMockPlan(idea: Idea, profile: UserProfile): BusinessPlan {
  const isProject = profile.ventureType === "project";

  return {
    executiveSummary: `${idea.name} addresses a fundamental problem: households have resources sitting unused while neighbors struggle without access to these same items. Our solution creates a hyperlocal sharing network that reduces waste, saves money, and builds genuine community connections.

In Year 1, we will launch in 3 neighborhoods, facilitate 500+ successful shares, and build a community of 200 active members. Our approach starts analog (community boards, group chats) before investing in technology, ensuring we understand actual user needs.

The model is sustainable through a combination of volunteer coordination, small membership fees for premium features, and partnerships with local businesses and apartment complexes seeking community amenities.`,
    missionStatement: `${idea.name} builds connected neighborhoods where resources flow freely and no one faces a problem alone.`,
    impactThesis:
      "When neighbors share resources, three outcomes emerge: households save money on items they'd otherwise buy (economic impact), fewer items are manufactured and discarded (environmental impact), and strangers become acquaintances become friends (social impact). Each successful share creates a micro-connection that compounds into community resilience.",
    ...(isProject
      ? {
          volunteerPlan: {
            rolesNeeded: [
              "Block Captain (coordinate shares in their area)",
              "Inventory Manager (track available items)",
              "New Member Onboarder (welcome and train new members)",
              "Event Coordinator (organize monthly meetups)",
            ],
            recruitmentStrategy:
              "Start with founding members who are already enthusiastic sharers. Post in existing community groups, partner with local sustainability orgs, and ask each volunteer to recruit one friend.",
            retentionStrategy:
              "Monthly volunteer appreciation events, public recognition in community communications, first access to new features, and clear impact metrics showing their contribution.",
          },
        }
      : {
          revenueStreams: [
            {
              name: "Premium Membership",
              description:
                "Monthly subscription for power users with priority access, delivery coordination, and extended borrowing periods.",
              estimatedRevenue: "$2,400/year (100 members × $24/year)",
              timeline: "Month 6",
            },
            {
              name: "Apartment Complex Partnerships",
              description:
                "B2B service where apartment complexes offer sharing as an amenity, paying per-unit fees.",
              estimatedRevenue: "$6,000/year (3 complexes × $2,000)",
              timeline: "Month 9",
            },
            {
              name: "Local Business Sponsorships",
              description:
                "Local hardware stores, sustainable businesses sponsor the platform for community visibility.",
              estimatedRevenue: "$3,000/year",
              timeline: "Month 4",
            },
          ],
        }),
    budgetPlan: [
      {
        category: "Technology (basic website/tools)",
        amount: profile.budget === "zero" ? 0 : 200,
        priority: "important",
        notes: "Start with free tools (Google Forms, Airtable free tier, WhatsApp groups)",
      },
      {
        category: "Community Events",
        amount: profile.budget === "zero" ? 0 : 150,
        priority: "important",
        notes: "Monthly meetups, launch party (can be potluck to minimize cost)",
      },
      {
        category: "Marketing Materials",
        amount: profile.budget === "zero" ? 0 : 100,
        priority: "nice_to_have",
        notes: "Flyers, door hangers for initial outreach (can start digital-only)",
      },
      {
        category: "Insurance/Legal",
        amount: profile.budget === "zero" ? 0 : 300,
        priority: "essential",
        notes: "Basic liability waiver review, eventual umbrella policy",
      },
    ],
    partnerships: [
      {
        type: "Distribution",
        description:
          "Apartment complexes and HOAs distribute information to residents and potentially host sharing hubs.",
        potentialPartners: [
          "Local apartment management companies",
          "Neighborhood associations",
          "Community centers",
        ],
      },
      {
        type: "Referral",
        description:
          "Organizations refer members who could benefit from resource sharing.",
        potentialPartners: [
          "Buy Nothing groups",
          "Sustainability organizations",
          "Faith communities",
        ],
      },
      {
        type: "Sponsorship",
        description:
          "Businesses provide funding or in-kind support in exchange for community visibility.",
        potentialPartners: [
          "Local hardware stores",
          "Eco-friendly businesses",
          "Credit unions with community focus",
        ],
      },
    ],
    operations: `Day-to-day operations center on facilitating connections and maintaining trust. The process flow is simple: members list items they're willing to share, others browse and request, the owner confirms and coordinates pickup, and both parties rate the experience after return.

In the pilot phase, all matching happens through a WhatsApp group with a shared Google Sheet inventory. The Block Captain moderates requests and follows up to ensure returns. This manual approach builds understanding before any technology investment.

Weekly activities include: reviewing pending requests, following up on overdue items, welcoming new members, and highlighting successful shares in the community. Monthly activities include: inventory audit, volunteer check-in, community event, and metrics review.`,
    impactMeasurement: [
      {
        metric: "Successful Shares",
        target: "500 shares in Year 1",
        measurementMethod: "Tracking in shared database, confirmation from both parties",
        frequency: "Weekly",
      },
      {
        metric: "Active Members",
        target: "200 members who have shared or borrowed at least once",
        measurementMethod: "Member activity tracking",
        frequency: "Monthly",
      },
      {
        metric: "Money Saved",
        target: "$15,000 collective savings (estimated $30/share average)",
        measurementMethod: "Self-reported value of borrowed vs. purchased items",
        frequency: "Quarterly survey",
      },
      {
        metric: "Community Connection",
        target: "80% report meeting someone new through the platform",
        measurementMethod: "Quarterly member survey",
        frequency: "Quarterly",
      },
    ],
  };
}

function getMockMarketing(idea: Idea): MarketingAssets {
  return {
    elevatorPitch: `We connect neighbors who have tools, equipment, and skills sitting unused with neighbors who need them. Instead of everyone buying a drill they'll use twice, one drill serves the whole block. Last month, 50 families saved over $2,000 and made 30 new connections.`,
    tagline: "Your neighbors have what you need.",
    landingPageHeadline: "Borrow from neighbors. Save money. Build community.",
    landingPageSubheadline:
      "Join 200+ neighbors sharing tools, gear, and skills. No more buying things you'll use once. No more strangers living next door.",
    socialPosts: [
      {
        platform: "twitter",
        content: `Your neighbor has the drill you need. You have the pressure washer they need.

${idea.name} connects you.

No more buying stuff you'll use twice. No more strangers living next door.

Join us: [link]`,
        hashtags: ["SharingEconomy", "Community", "Sustainability", "Neighbors"],
      },
      {
        platform: "linkedin",
        content: `I'm excited to announce the launch of ${idea.name}.

The problem we're solving: Most households own tools and equipment they use once or twice a year. Meanwhile, their neighbors are buying the same items. It's wasteful, expensive, and a missed opportunity for connection.

Our solution: A hyperlocal sharing network that makes it easy to borrow from neighbors. We started with a simple WhatsApp group and a Google Sheet. In 3 months, 50 families have shared 200+ items and saved thousands of dollars.

More importantly, strangers became acquaintances. Acquaintances became friends.

We're looking for:
→ Neighbors in [City] who want to join
→ Apartment complexes interested in offering this as an amenity
→ Anyone passionate about community resilience

If this resonates, I'd love to connect.`,
        hashtags: ["SocialImpact", "Community", "Sustainability", "LocalFirst"],
      },
      {
        platform: "instagram",
        content: `Your neighbors have what you need. You have what they need.

We just forget to ask.

${idea.name} fixes that.

Borrow the ladder for your weekend project.
Lend the camping gear gathering dust in your garage.
Meet the humans living 50 feet away.

No more buying things you'll use once.
No more strangers next door.
Just... neighbors. Being neighbors.

Link in bio to join us.

Who's in?`,
        hashtags: [
          "NeighborhoodLove",
          "SharingEconomy",
          "SustainableLiving",
          "CommunityBuilding",
          "LocalFirst",
          "BorrowDontBuy",
        ],
      },
    ],
    emailTemplate: {
      subject: "Your neighbors have what you need",
      body: `Hey!

I wanted to tell you about something we're building in the neighborhood.

You know how everyone owns a drill they use twice a year? A pressure washer that sits in the garage? A stand mixer that comes out once at Thanksgiving?

What if you could just borrow those things from neighbors — and lend out your own unused stuff in return?

That's ${idea.name}.

Here's how it works:
1. Join our community (takes 2 minutes)
2. List items you're willing to share
3. Browse what neighbors have available
4. Connect, borrow, return, repeat

No apps to download. No weird fees. Just neighbors helping neighbors.

We already have 50+ families sharing everything from power tools to party supplies. Last month alone, members saved over $2,000 they would have spent buying things they'll barely use.

But honestly? The best part isn't the savings. It's actually knowing your neighbors.

Ready to join? Click here: [LINK]

Questions? Just reply to this email.

See you in the neighborhood,
[Name]

P.S. — Know a neighbor who would love this? Forward this email. The more people who join, the better it works.`,
    },
    primaryCTA: "Join Your Neighbors",
  };
}

function getMockRoadmap(_profile: UserProfile): ActionRoadmap {
  return {
    quickWins: [
      {
        task: "Text 5 friends who live nearby and ask: 'Would you borrow a tool from a neighbor if it was easy?' Document their responses.",
        timeframe: "Today",
        cost: "free",
      },
      {
        task: "Create a simple Google Form: 'What items would you share/borrow?' Share it in one existing community group you're already in.",
        timeframe: "Day 2",
        cost: "free",
      },
      {
        task: "Start a WhatsApp/Signal group called '[Neighborhood] Sharing' and invite the 5 interested friends to be founding members.",
        timeframe: "Day 3",
        cost: "free",
      },
      {
        task: "Post your first share offer in the group: something you own that others might need. Ask others to do the same.",
        timeframe: "Day 4",
        cost: "free",
      },
      {
        task: "Facilitate your first successful share between two members. Document what worked and what was awkward.",
        timeframe: "Day 5-7",
        cost: "free",
      },
    ],
    phases: [
      {
        name: "Phase 1: Foundation",
        duration: "Weeks 1-2",
        tasks: [
          {
            task: "Define your first neighborhood boundary (one apartment complex, one block, or one HOA)",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Recruit 10 founding members who commit to listing at least 3 items each",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Create a shared Google Sheet inventory with columns: Item, Owner, Contact, Status",
            priority: "critical",
            cost: "free",
            dependencies: ["Recruit founding members"],
          },
          {
            task: "Write a simple one-page community agreement (borrowing period, damage policy, communication norms)",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Host a casual founding member meetup (can be at someone's home or a park)",
            priority: "medium",
            cost: "low",
            dependencies: ["Recruit founding members"],
          },
        ],
      },
      {
        name: "Phase 2: Launch",
        duration: "Weeks 3-4",
        tasks: [
          {
            task: "Facilitate at least 20 successful shares among founding members",
            priority: "critical",
            cost: "free",
            dependencies: ["Create inventory"],
          },
          {
            task: "Ask each founding member to invite 2 neighbors to join",
            priority: "high",
            cost: "free",
            dependencies: ["Facilitate shares"],
          },
          {
            task: "Create a simple landing page (Carrd or Notion) explaining what you do",
            priority: "medium",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Post in 3 local Facebook/Nextdoor groups announcing the community",
            priority: "high",
            cost: "free",
            dependencies: ["Landing page"],
          },
          {
            task: "Document 3 success stories with photos (with permission) for social proof",
            priority: "medium",
            cost: "free",
            dependencies: ["Facilitate shares"],
          },
        ],
      },
      {
        name: "Phase 3: Growth",
        duration: "Weeks 5-8",
        tasks: [
          {
            task: "Reach 50 active members who have shared or borrowed at least once",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Identify and recruit 3 Block Captains to help coordinate in different areas",
            priority: "high",
            cost: "free",
            dependencies: ["50 active members"],
          },
          {
            task: "Approach one apartment complex about piloting as a resident amenity",
            priority: "medium",
            cost: "free",
            dependencies: ["Success stories"],
          },
          {
            task: "Host a public community event (share fair, skill swap, or meetup)",
            priority: "medium",
            cost: "medium",
            dependencies: ["Block Captains"],
          },
          {
            task: "Survey members on what's working, what's not, and what features they want",
            priority: "high",
            cost: "free",
            dependencies: ["50 active members"],
          },
          {
            task: "Evaluate whether you need any technology beyond WhatsApp + Google Sheets",
            priority: "low",
            cost: "free",
            dependencies: ["Member survey"],
          },
        ],
      },
    ],
    skipList: [
      "Don't build an app — validate with manual processes first. Most sharing can happen via group chat and spreadsheets.",
      "Don't incorporate as a nonprofit yet — start as an informal community project until you have traction.",
      "Don't spend money on marketing — personal outreach and community posts are more effective at this stage.",
      "Don't create complex rules — start simple and add policies only when specific problems arise.",
      "Don't try to scale to multiple neighborhoods — master one area first before expanding.",
      "Don't worry about a perfect brand/logo — a simple name and clear description is enough to start.",
    ],
  };
}

// ============================================================================
// WEEKEND WARRIOR MOCK DATA - Dramatically simplified
// ============================================================================

function getMockWeekendViability(_idea: Idea): ViabilityReport {
  return {
    marketSize:
      "Park cleanups work everywhere. People like clean parks and meeting neighbors. This is a proven model.",
    demandAnalysis:
      "Your neighbors walk through this park every day. They see the trash. They wish someone would do something. You're that someone.",
    competitors: [
      {
        name: "Keep America Beautiful",
        url: "https://kab.org",
        description: "National org that supports local cleanups",
        strengths: ["Provides resources and guides"],
        weaknesses: ["Not local — you know your park better"],
      },
    ],
    targetAudience: {
      primaryPersona:
        "Your neighbors who walk their dogs, push strollers, or jog through the park",
      demographics: "Local families, dog owners, retirees, anyone who uses the park",
      painPoints: ["The park looks trashy and nobody's doing anything"],
      motivations: ["Want a nicer park", "Want to meet neighbors", "Want to feel good"],
    },
    strengths: [
      "Zero startup cost — just show up",
      "Visible results in 2 hours",
      "People love before/after photos",
      "Easy to do again next month",
    ],
    risks: [
      "Only 3 people show up — That's fine! 3 people can fill a lot of bags. Do it anyway.",
      "It rains — Pick a rain date when you post the invite",
    ],
    opportunities: ["Could become a monthly thing", "Might inspire others to start their own"],
    viabilityScore: 9.0,
    scoreBreakdown: {
      marketOpportunity: {
        score: 9.0,
        explanation: "Everyone wants cleaner parks — easy to get people interested"
      },
      competitionLevel: {
        score: 9.5,
        explanation: "No one else is doing this in your neighborhood"
      },
      feasibility: {
        score: 9.0,
        explanation: "Just show up with trash bags — couldn't be simpler"
      },
      revenuePotential: {
        score: 7.0,
        explanation: "Not about money, but sponsors might chip in for supplies"
      },
      impactPotential: {
        score: 9.0,
        explanation: "Visible before/after impact plus community connections"
      }
    },
    verdict: "go",
    recommendation:
      "YES — do it! Here's how to get 10 people: Text 15 friends personally ('Hey, doing a park cleanup Saturday 9am, want to come? Coffee after.'). Post on Nextdoor with specific date/time/location. That's it. You'll get 5-10 people.",
  };
}

function getMockSteadyViability(_idea: Idea, _profile: UserProfile): ViabilityReport {
  return {
    marketSize:
      "After-school tutoring programs are one of the most proven interventions in education. The demand far exceeds supply in most communities.",
    demandAnalysis:
      "Schools are overwhelmed. Parents want help. Kids who get tutoring do better. Local libraries often have free meeting rooms. All the pieces are there.",
    competitors: [
      {
        name: "Kumon / Sylvan",
        url: "https://kumon.com",
        description: "Paid tutoring franchises",
        strengths: ["Established curriculum", "Professional tutors"],
        weaknesses: ["Expensive ($200-400/month)", "Not accessible to families who need it most"],
      },
      {
        name: "School volunteer programs",
        url: "",
        description: "In-school tutoring organized by PTAs",
        strengths: ["Already in schools", "Known to families"],
        weaknesses: ["Limited to school hours", "Often inconsistent"],
      },
    ],
    targetAudience: {
      primaryPersona:
        "Elementary and middle school students who are falling behind in reading or math, from families who can't afford paid tutoring",
      demographics: "Ages 6-14, various backgrounds, often from lower-income households",
      painPoints: [
        "Falling behind in school",
        "Can't afford private tutoring",
        "Parents working and can't help with homework",
      ],
      motivations: [
        "Want to catch up to peers",
        "Want to feel confident in school",
        "Parents want their kids to succeed",
      ],
    },
    strengths: [
      "Clear, proven model",
      "Free spaces available (libraries, churches)",
      "Retired teachers often want to help",
      "Measurable impact (grades improve)",
    ],
    risks: [
      "Tutor no-shows — Build a substitute list from day one",
      "Low initial turnout — Normal for first month, grows by word of mouth",
      "Your own burnout — Get 2+ tutors before launching so you're not alone",
    ],
    opportunities: [
      "Could partner with schools for referrals",
      "Could expand to more subjects/ages",
      "Could become a registered nonprofit eventually",
    ],
    viabilityScore: 7.5,
    scoreBreakdown: {
      marketOpportunity: {
        score: 8.5,
        explanation: "High demand for free tutoring in most communities"
      },
      competitionLevel: {
        score: 8.0,
        explanation: "Paid options exist but free programs are rare"
      },
      feasibility: {
        score: 7.0,
        explanation: "Doable but requires consistent tutor recruitment"
      },
      revenuePotential: {
        score: 6.0,
        explanation: "Grant funding possible once established"
      },
      impactPotential: {
        score: 8.5,
        explanation: "Direct, measurable improvement in student outcomes"
      }
    },
    verdict: "refine",
    recommendation:
      "WORK ON IT — Solid foundation, but secure these before launching: (1) Reserve a consistent weekly time slot at the library, (2) Recruit 2 committed tutors besides yourself, (3) Connect with one school counselor who can refer students. Once those three things are done, you're ready to start.",
  };
}

function getMockWeekendPlan(_idea: Idea): BusinessPlan {
  return {
    executiveSummary:
      "You're organizing a neighborhood park cleanup on Saturday. Success = people show up, trash gets collected, everyone feels good about their neighborhood. That's it.",
    missionStatement: "Make Oak Street Park cleaner and connect neighbors.",
    impactThesis:
      "When neighbors work together on something visible, they connect with each other and want to do more.",
    volunteerPlan: {
      rolesNeeded: ["You (organizer)", "People who show up with gloves"],
      recruitmentStrategy:
        "Text friends personally. Post on Nextdoor with specific date/time.",
      retentionStrategy:
        "Make it fun. Take before/after photos. Get coffee after. People will want to do it again.",
    },
    budgetPlan: [
      {
        category: "Trash bags (3 boxes)",
        amount: 10,
        priority: "essential",
        notes: "Dollar store",
      },
      {
        category: "Gloves (20 pairs)",
        amount: 10,
        priority: "essential",
        notes: "Dollar store — you provide so people don't have excuses",
      },
      {
        category: "Coffee after (optional)",
        amount: 15,
        priority: "nice_to_have",
        notes: "Or just meet at a local coffee shop",
      },
    ],
    partnerships: [
      {
        type: "None needed",
        description:
          "This is simple enough to do yourself. Maybe ask a local coffee shop to donate coffee for volunteers.",
        potentialPartners: ["Local coffee shop", "Hardware store for supplies"],
      },
    ],
    operations:
      "1. Pick a date (Saturday morning works best). 2. Post about it with specific time/place. 3. Buy supplies at dollar store ($20). 4. Show up 15 min early. 5. Take before photo. 6. Assign people to sections. 7. Pick up trash for 1-2 hours. 8. Take after photo. 9. Thank everyone. 10. Post the photos and announce next month's date.",
    impactMeasurement: [
      {
        metric: "People who showed up",
        target: "10 people",
        measurementMethod: "Count them",
        frequency: "Once",
      },
      {
        metric: "Bags of trash collected",
        target: "15-20 bags",
        measurementMethod: "Count them and take a photo",
        frequency: "Once",
      },
    ],
  };
}

function getMockSteadyPlan(idea: Idea, _profile: UserProfile): BusinessPlan {
  return {
    executiveSummary: `${idea.name} provides free after-school tutoring to students who need help but can't afford private tutors. Starting with reading and math for grades 3-8, we'll meet weekly at the public library with a small team of volunteer tutors.

In the first 3 months, we aim to serve 10-15 students consistently, with at least 3 volunteer tutors on the roster. Success looks like: kids show up reliably, parents report homework is getting done, and at least one teacher notices improvement.`,
    missionStatement:
      "Help local kids succeed in school by providing free, consistent tutoring from caring adults.",
    impactThesis:
      "Students who get regular one-on-one attention from a caring adult improve academically and build confidence. We provide that attention to kids whose families can't afford paid tutoring.",
    volunteerPlan: {
      rolesNeeded: [
        "Lead Tutor (you) — coordinate scheduling, recruit students",
        "Volunteer Tutors (2-3) — lead tutoring sessions",
        "Substitute Tutors (1-2) — fill in when regulars can't make it",
      ],
      recruitmentStrategy:
        "Post in local teacher Facebook groups. Ask retired teacher neighbors. Contact education clubs at local colleges. Personal asks work better than public posts.",
      retentionStrategy:
        "Monthly tutor appreciation (coffee gift cards). Share success stories. Keep it low-commitment (1 hour/week). Give tutors autonomy with their students.",
    },
    budgetPlan: [
      {
        category: "Supplies (paper, pencils, folders)",
        amount: 50,
        priority: "essential",
        notes: "One-time purchase to start",
      },
      {
        category: "Background checks for tutors",
        amount: 0,
        priority: "essential",
        notes: "Many states offer free checks for volunteers working with kids",
      },
      {
        category: "Snacks for students",
        amount: 20,
        priority: "important",
        notes: "Monthly — kids focus better with a snack",
      },
    ],
    partnerships: [
      {
        type: "Venue",
        description: "Free meeting room for weekly sessions",
        potentialPartners: [
          "Public library (call to reserve recurring room)",
          "Church community room",
          "Community center",
        ],
      },
      {
        type: "Referral",
        description: "Schools refer students who need help",
        potentialPartners: [
          "School counselors",
          "After-school program coordinators",
          "Parent Facebook groups",
        ],
      },
    ],
    operations: `Week 1: Reserve library room (Saturday 10am-12pm works well). Define your focus (reading? math? both?).

Week 2: Recruit 2 tutors besides yourself. Post in teacher groups, ask neighbors.

Week 3: Reach out to one school counselor OR post in parent groups to find your first 5-8 students.

Week 4: First tutoring session. Keep it simple: check in, work on homework or problem areas, wrap up.

Ongoing: Every Saturday, 10am-12pm. Arrive 10 min early to set up. Match tutors with students. Check in monthly with parents.`,
    impactMeasurement: [
      {
        metric: "Students served",
        target: "10-15 students by month 3",
        measurementMethod: "Attendance tracking",
        frequency: "Weekly",
      },
      {
        metric: "Session attendance rate",
        target: "75% of enrolled students attend each week",
        measurementMethod: "Sign-in sheet",
        frequency: "Weekly",
      },
      {
        metric: "Parent satisfaction",
        target: "80% would recommend to another family",
        measurementMethod: "Quick survey at month 3",
        frequency: "Quarterly",
      },
    ],
  };
}

function getMockWeekendMarketing(_idea: Idea): MarketingAssets {
  return {
    elevatorPitch:
      "We're cleaning up Oak Street Park this Saturday. Want to come?",
    tagline: "Join your neighbors Saturday",
    landingPageHeadline: "No website needed — just show up!",
    landingPageSubheadline:
      "Saturday March 15, 9am, Oak Street Park main entrance. Bring gloves if you have them.",
    socialPosts: [
      {
        platform: "twitter",
        content: `🌳 Oak Street Park Cleanup!

📅 Saturday, March 15
⏰ 9am - 11am
📍 Meet at the main entrance

Bring gloves if you have them — I'll have trash bags and extras.

Kids welcome! Coffee after.

Just show up. Let's make our park nice.

Questions? Reply here or text me.`,
        hashtags: [],
      },
      {
        platform: "linkedin",
        content: `Hey! I'm organizing a park cleanup Saturday 9am at Oak Street Park. Want to come? I'll bring trash bags and extra gloves. Just show up. Coffee after at that place on the corner.`,
        hashtags: [],
      },
      {
        platform: "instagram",
        content: `OAK STREET PARK CLEANUP

Saturday, March 15
9am - 11am
Main entrance

What to bring: Gloves (if you have them)
What I'm bringing: Trash bags, extra gloves

Kids welcome. Coffee after.

RSVP by showing up!`,
        hashtags: [],
      },
    ],
    emailTemplate: {
      subject: "Reminder: Park cleanup tomorrow 9am",
      body: `Quick reminder — park cleanup is tomorrow (Saturday) at 9am!

Meet at the main entrance of Oak Street Park. I'll have trash bags and extra gloves.

Should take about 2 hours. Coffee after at the corner shop.

See you there!`,
    },
    primaryCTA: "Show Up Saturday",
  };
}

function getMockSteadyMarketing(_idea: Idea): MarketingAssets {
  return {
    elevatorPitch:
      "We provide free tutoring for local kids who need help in school. Every Saturday at the library, volunteer tutors work one-on-one with students on reading and math. No fees, no pressure — just neighbors helping neighbors' kids succeed.",
    tagline: "Free tutoring. Real results.",
    landingPageHeadline: "Every kid deserves a tutor",
    landingPageSubheadline:
      "Free weekly tutoring for local students. Saturdays 10am-12pm at the public library.",
    socialPosts: [
      {
        platform: "twitter",
        content: `Looking for free tutoring for your child? 📚

We're starting a free tutoring program at the public library:
- Every Saturday, 10am-12pm
- Reading & math help
- Grades 3-8
- No cost, ever

DM me or comment to sign up your child. Spots are limited!`,
        hashtags: ["freetutoring", "community"],
      },
      {
        platform: "linkedin",
        content: `I'm starting a free tutoring program for local students and looking for volunteers.

The commitment: 1 hour per week, Saturday mornings at the library.

The impact: You help a kid who can't afford private tutoring get the attention they need to succeed.

If you have teaching experience (or just patience and a desire to help), reach out. Background check required.

Also looking for: parents who want to enroll their kids. Grades 3-8, reading and math focus.`,
        hashtags: ["volunteer", "education", "community"],
      },
      {
        platform: "instagram",
        content: `FREE TUTORING 📚

For: Local students grades 3-8
Where: Public library
When: Saturdays 10am-12pm
Cost: Always free

Want to enroll your child? DM me.
Want to volunteer as a tutor? Also DM me.

Every kid deserves help with homework. Not every family can afford it. That's why we exist.`,
        hashtags: ["freetutoring", "community", "education", "volunteer"],
      },
    ],
    emailTemplate: {
      subject: "Welcome to Oak Street Tutoring!",
      body: `Hi [Name],

Thanks for signing up your child for tutoring!

Here's what you need to know:

WHEN: Every Saturday, 10am-12pm
WHERE: Oak Street Public Library, Community Room B
WHAT TO BRING: Homework, any materials they're struggling with

First session: This Saturday. Just show up at 10am — we'll handle the rest.

What to expect: Your child will be paired with a volunteer tutor who'll work with them one-on-one. We focus on reading and math, but we can help with other subjects too.

Questions? Just reply to this email.

See you Saturday!`,
    },
    primaryCTA: "Sign Up Your Child",
  };
}

function getMockWeekendRoadmap(): ActionRoadmap {
  return {
    quickWins: [
      {
        task: "TODAY: Text 5 friends and ask if they'll come to a park cleanup Saturday",
        timeframe: "Today",
        cost: "free",
      },
      {
        task: "TOMORROW: Post on Nextdoor with date, time, and location",
        timeframe: "Tomorrow",
        cost: "free",
      },
      {
        task: "THIS WEEK: Buy trash bags and gloves at Dollar Store ($20)",
        timeframe: "This week",
        cost: "low",
      },
      {
        task: "DAY BEFORE: Send a reminder text to everyone who said yes",
        timeframe: "Day before",
        cost: "free",
      },
      {
        task: "DAY OF: Show up 15 min early, take before photo, start cleaning",
        timeframe: "Day of",
        cost: "free",
      },
    ],
    phases: [
      {
        name: "Just Do It",
        duration: "This week",
        tasks: [
          {
            task: "Pick a specific date and time (Saturday 9am works best)",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Text 10 friends personally: 'Hey, doing a park cleanup Saturday 9am, want to come?'",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Post on Nextdoor/Facebook with specific date/time/place",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Buy supplies at Dollar Store: trash bags, gloves, maybe grabber tools",
            priority: "high",
            cost: "low",
            dependencies: [],
          },
          {
            task: "Show up, do the cleanup, take before/after photos, thank everyone",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Post photos on Nextdoor and announce next month's date",
            priority: "medium",
            cost: "free",
            dependencies: [],
          },
        ],
      },
    ],
    skipList: [
      "Don't make a website — you don't need one for a park cleanup",
      "Don't wait for perfect weather — pick a rain date in your invite",
      "Don't worry if only 3 people come — that's enough to make a difference",
      "Don't overthink supplies — trash bags and gloves are enough",
      "Don't ask for permission — it's a public park, just start picking up trash",
    ],
  };
}

function getMockSteadyRoadmap(): ActionRoadmap {
  return {
    quickWins: [
      {
        task: "Today: Call the library and ask about reserving a recurring room",
        timeframe: "Today",
        cost: "free",
      },
      {
        task: "This week: Text 3 people you know who might want to tutor",
        timeframe: "This week",
        cost: "free",
      },
      {
        task: "This week: Post in one local parent Facebook group to gauge interest",
        timeframe: "This week",
        cost: "free",
      },
    ],
    phases: [
      {
        name: "Week 1: Set Up",
        duration: "Week 1",
        tasks: [
          {
            task: "Reserve a recurring room at the library (Saturday 10am-12pm)",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Decide your focus: reading, math, or both? What grades?",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Create a simple sign-up form (Google Form) for students",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
        ],
      },
      {
        name: "Week 2: Recruit",
        duration: "Week 2",
        tasks: [
          {
            task: "Post in local teacher Facebook group asking for volunteer tutors",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Ask 5 retired teacher neighbors if they'd volunteer 1 hour/week",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Reach out to one school counselor to introduce yourself",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Post in 2-3 parent groups about free tutoring signups",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
        ],
      },
      {
        name: "Week 3: Prep",
        duration: "Week 3",
        tasks: [
          {
            task: "Confirm at least 2 tutors besides yourself for first session",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Buy basic supplies: paper, pencils, folders ($30)",
            priority: "high",
            cost: "low",
            dependencies: [],
          },
          {
            task: "Match tutors with enrolled students based on grade/subject",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
        ],
      },
      {
        name: "Week 4: Launch",
        duration: "Week 4",
        tasks: [
          {
            task: "Run your first session — start simple, learn as you go",
            priority: "critical",
            cost: "free",
            dependencies: [],
          },
          {
            task: "After session: quick debrief with tutors — what worked?",
            priority: "high",
            cost: "free",
            dependencies: [],
          },
          {
            task: "Send thank-you texts to parents and invite them back next week",
            priority: "medium",
            cost: "free",
            dependencies: [],
          },
        ],
      },
    ],
    skipList: [
      "Don't incorporate as a nonprofit yet — run it informally until you have traction",
      "Don't build a website — a Google Form and Facebook posts are enough to start",
      "Don't try to serve all grades — start narrow and expand later",
      "Don't stress about curriculum — start with homework help and figure it out",
      "Don't launch until you have 2+ tutors committed — solo burnout is real",
    ],
  };
}
