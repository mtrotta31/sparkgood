// Research-Enhanced Prompt Templates
// These prompts incorporate real data from Perplexity (market research) and Firecrawl (competitor scraping)
// to generate grounded, evidence-based outputs instead of AI guesswork.
//
// Calibrated by commitment level:
// - Weekend Warriors → Minimal research integration, just "similar things exist, here's why yours works"
// - Steady Builders → Moderate research, key competitors and market signals
// - All-In → Full research synthesis with detailed competitor analysis

import type { UserProfile, Idea, CauseArea, CommitmentLevel } from "@/types";
import { CAUSE_AREAS } from "@/lib/constants";

// ============================================================================
// RESEARCH DATA TYPES
// ============================================================================

export interface PerplexityResult {
  query: string;
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

export interface FirecrawlResult {
  url: string;
  title: string;
  description?: string;
  content?: string;
  // Extracted structured data
  pricing?: string;
  services?: string[];
  targetAudience?: string;
  uniqueValue?: string;
}

export interface ResearchData {
  // Market research from Perplexity
  marketResearch?: PerplexityResult;
  demandSignals?: PerplexityResult;
  existingSolutions?: PerplexityResult;

  // Competitor data from Firecrawl
  competitors?: FirecrawlResult[];

  // Optional: local context
  localContext?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const getCauseLabels = (causes: CauseArea[]): string => {
  return causes
    .map((c) => CAUSE_AREAS.find((ca) => ca.id === c)?.label || c)
    .join(", ");
};

const getCommitment = (profile: UserProfile): CommitmentLevel => {
  return profile.commitment || "steady";
};

// Format Perplexity results for prompt injection
const formatPerplexityForPrompt = (result: PerplexityResult | undefined, maxLength: number = 1500): string => {
  if (!result) return "No research data available.";

  let formatted = result.answer;

  // Truncate if too long
  if (formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength) + "...";
  }

  // Add top sources
  if (result.sources && result.sources.length > 0) {
    const topSources = result.sources.slice(0, 3);
    formatted += "\n\nSources:\n";
    topSources.forEach(s => {
      formatted += `- ${s.title}: ${s.url}\n`;
    });
  }

  return formatted;
};

// Format competitor data for prompt injection
const formatCompetitorsForPrompt = (
  competitors: FirecrawlResult[] | undefined,
  commitment: CommitmentLevel
): string => {
  if (!competitors || competitors.length === 0) {
    return "No competitor data scraped.";
  }

  // Weekend warriors only need 1-2 examples
  const maxCompetitors = commitment === "weekend" ? 2 : commitment === "steady" ? 4 : 8;
  const selected = competitors.slice(0, maxCompetitors);

  let formatted = "";
  selected.forEach((comp, i) => {
    formatted += `\n### Competitor ${i + 1}: ${comp.title}\n`;
    formatted += `URL: ${comp.url}\n`;
    if (comp.description) formatted += `Description: ${comp.description}\n`;
    if (comp.pricing) formatted += `Pricing: ${comp.pricing}\n`;
    if (comp.services && comp.services.length > 0) {
      formatted += `Services: ${comp.services.join(", ")}\n`;
    }
    if (comp.targetAudience) formatted += `Target: ${comp.targetAudience}\n`;
    if (comp.uniqueValue) formatted += `Unique Value: ${comp.uniqueValue}\n`;
  });

  return formatted;
};

// ============================================================================
// RESEARCH-ENHANCED VIABILITY PROMPTS
// ============================================================================

export function generateResearchEnhancedViabilityPrompt(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendViabilityWithResearch(idea, profile, research);
  }

  if (commitment === "steady") {
    return generateSteadyViabilityWithResearch(idea, profile, research);
  }

  return generateAllInViabilityWithResearch(idea, profile, research);
}

function generateWeekendViabilityWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const hasResearch = research.marketResearch || research.existingSolutions;

  return `You help people figure out if their weekend project will work. No MBA jargon. Just "yes, and here's how."

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**The problem:** ${idea.problem}
**Who it helps:** ${idea.audience}

${hasResearch ? `## What We Found (Real Research)

We searched for similar projects and here's what exists:

${research.existingSolutions ? formatPerplexityForPrompt(research.existingSolutions, 800) : ""}

${research.competitors && research.competitors.length > 0 ? `
### Similar Initiatives We Found:
${formatCompetitorsForPrompt(research.competitors, "weekend")}
` : ""}

**Your job:** Use this research to tell them "yes, similar things work — here's why yours will too" or "here's what to watch out for based on what others have done."
` : ""}

## Your Job

Give them a simple yes/no/probably with practical tips. This is a weekend project — they don't need SWOT analysis, they need to know if this will work and how to get people to show up.

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "marketSize": "One sentence on why this type of project works (reference the research if available)",
  "demandAnalysis": "1-2 sentences on why people will want this",
  "competitors": [
    {
      "name": "Similar thing that exists (use real ones from research if available)",
      "url": "https://example.com",
      "description": "What it is (one sentence)",
      "strengths": ["What works about it"],
      "weaknesses": ["What's missing that your project could fill"]
    }
  ],
  "targetAudience": {
    "primaryPersona": "Plain English description of who will show up (1 sentence)",
    "demographics": "Your neighbors, local families, etc.",
    "painPoints": ["Simple pain point"],
    "motivations": ["Why they'll actually come"]
  },
  "strengths": ["Why this will work", "Another reason"],
  "risks": ["Watch out for this — here's how to handle it", "Another thing to watch for — solution"],
  "opportunities": ["Could grow into this"],
  "viabilityScore": 8.5,
  "verdict": "go",
  "recommendation": "YES — do it! Here's how to get people to show up: [specific practical advice]"
}
\`\`\`

## Important
- verdict should almost always be "go" for simple community projects
- viabilityScore should be 7-9 for most valid weekend projects
- recommendation should focus on HOW TO GET PEOPLE TO SHOW UP
- If research shows similar projects succeeding, mention that as evidence
- Return ONLY valid JSON`;
}

function generateSteadyViabilityWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const causes = getCauseLabels(idea.causeAreas);

  return `You help people evaluate ongoing volunteer projects using real research data. Give them a simple scorecard with evidence-based insights.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**How it sustains:** ${idea.revenueModel || "Volunteer-driven"}

## User Context

**Experience:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}
**Causes:** ${causes}

## Real Research Data

### Market & Demand Research (from Perplexity)
${research.marketResearch ? formatPerplexityForPrompt(research.marketResearch, 1000) : "No market research available."}

### Demand Signals
${research.demandSignals ? formatPerplexityForPrompt(research.demandSignals, 800) : "No demand signal research available."}

### Existing Solutions & Competitors
${research.existingSolutions ? formatPerplexityForPrompt(research.existingSolutions, 800) : "No existing solutions research available."}

${research.competitors && research.competitors.length > 0 ? `
### Competitor Websites Analyzed (from Firecrawl)
${formatCompetitorsForPrompt(research.competitors, "steady")}
` : ""}

## Your Job

Use this research to provide an evidence-based assessment. Score these 4 factors as green (strong), yellow (needs work), or red (problem):
1. **People need this** — Based on the research, is there real demand?
2. **You can deliver** — Do you have the skills/resources?
3. **It can keep going** — Is it sustainable without burnout?
4. **You're right for this** — Do you have the connections/experience?

## Output Format (JSON)

\`\`\`json
{
  "marketSize": "2 sentences on the need/opportunity, citing research findings",
  "demandAnalysis": "2-3 sentences on demand signals from the research",
  "competitors": [
    {
      "name": "Real competitor from research",
      "url": "https://actual-url.com",
      "description": "What they do (from scrape data)",
      "strengths": ["Strength from research", "Another strength"],
      "weaknesses": ["Gap you could fill based on research"]
    }
  ],
  "targetAudience": {
    "primaryPersona": "Who you're helping based on research (2 sentences)",
    "demographics": "Key characteristics",
    "painPoints": ["Pain from research", "Another pain"],
    "motivations": ["Why they'll engage"]
  },
  "strengths": ["Evidence-based strength"],
  "risks": ["Risk identified in research — how to mitigate it"],
  "opportunities": ["Growth opportunity from research"],
  "viabilityScore": 7.5,
  "verdict": "refine",
  "recommendation": "Evidence-based verdict with 2-3 specific things to do. Reference research findings."
}
\`\`\`

## Notes
- Use REAL data from the research above, not generic advice
- viabilityScore: 8+ = GO, 6-7.9 = WORK ON IT (refine), below 6 = RETHINK (pivot)
- Include actual competitor names and URLs from the research
- Return ONLY valid JSON`;
}

function generateAllInViabilityWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);

  return `You are a social venture analyst conducting a rigorous viability assessment using real market research data. Your job is to synthesize the research into an honest, evidence-based evaluation.

## The Venture to Evaluate

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}
**Impact:** ${idea.impact}

## User Context

**Venture Type:** ${ventureType}
**Causes:** ${causes}
**Experience Level:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}
**Format:** ${profile.format || "both"}

## Research Data (SUPPLEMENTARY — Your Knowledge is Primary)

Use your own extensive knowledge as the foundation. The research below adds real-world specificity when available. If research is weak or generic, rely more on your expertise.

### Market Research (Perplexity)
${research.marketResearch ? formatPerplexityForPrompt(research.marketResearch, 1500) : "No market research available — use your knowledge."}

### Demand Signals Research (Perplexity)
${research.demandSignals ? formatPerplexityForPrompt(research.demandSignals, 1200) : "No demand research available."}

### Existing Solutions Research (Perplexity)
${research.existingSolutions ? formatPerplexityForPrompt(research.existingSolutions, 1200) : "No existing solutions research available."}

### Competitor Websites Analyzed (Firecrawl Scrapes)
${research.competitors && research.competitors.length > 0
  ? formatCompetitorsForPrompt(research.competitors, "all_in")
  : "No competitor websites scraped."}

${research.localContext ? `
### Local Context
${research.localContext}
` : ""}

## Evaluation Framework

Using the research above, evaluate across 5 dimensions (1-10 each):

1. **Demand Signal (25%)** - Based on research, is there real, demonstrated need?
2. **Impact Potential (25%)** - Will this create meaningful, measurable change?
3. **Founder-Idea Fit (20%)** - Based on stated experience and context
4. **Feasibility (15%)** - Can this actually be built and delivered?
5. **Sustainability (15%)** - Can this keep going without constant heroic effort?

## Output Format (JSON)

Return a JSON object with this structure. **Use actual data from research — do not make up competitor names or statistics.**

\`\`\`json
{
  "marketSize": "Description citing specific research findings (2-3 sentences)",
  "demandAnalysis": "Analysis of demand signals from research (3-4 sentences with evidence)",
  "competitors": [
    {
      "name": "REAL Competitor Name from research",
      "url": "https://actual-scraped-url.com",
      "description": "From Firecrawl scrape data",
      "strengths": ["From research", "Another from research"],
      "weaknesses": ["Gap identified in research"]
    }
  ],
  "targetAudience": {
    "primaryPersona": "Based on research findings",
    "demographics": "From research data",
    "painPoints": ["From research", "Another from research", "Third pain point"],
    "motivations": ["From research", "Another motivation", "Third motivation"]
  },
  "strengths": ["Evidence-based strength", "Another with research backing", "Third strength", "Fourth strength"],
  "risks": ["Risk from research", "Another research-identified risk", "Third risk"],
  "opportunities": ["Opportunity from research", "Another opportunity", "Third opportunity"],
  "viabilityScore": 7.5,
  "verdict": "go",
  "recommendation": "Strategic recommendation citing research findings (3-4 sentences)"
}
\`\`\`

## Critical Instructions
- Use your knowledge as the foundation — you understand social ventures, market dynamics, and what works
- When research provides specific competitor names, URLs, and data — incorporate them
- When research is weak or generic — rely on your expertise and use well-known examples from your knowledge
- Cite specific statistics when research provides them, otherwise use your knowledge of typical ranges
- viabilityScore should be weighted: (Demand × 0.25) + (Impact × 0.25) + (Fit × 0.20) + (Feasibility × 0.15) + (Sustainability × 0.15)
- verdict: "go" (8+), "refine" (6-7.9), "pivot" (below 6)
- Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// RESEARCH-ENHANCED BUSINESS PLAN PROMPTS
// ============================================================================

export function generateResearchEnhancedPlanPrompt(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendPlanWithResearch(idea, profile, research);
  }

  if (commitment === "steady") {
    return generateSteadyPlanWithResearch(idea, profile, research);
  }

  return generateAllInPlanWithResearch(idea, profile, research);
}

function generateWeekendPlanWithResearch(
  idea: Idea,
  _profile: UserProfile,
  research: ResearchData
): string {
  const hasResearch = research.existingSolutions || (research.competitors && research.competitors.length > 0);

  return `You create simple 1-page action plans for weekend projects. No business jargon. Just what they need to do.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

${hasResearch ? `## What We Learned From Research

Similar projects exist and work. Here's what we found:

${research.existingSolutions ? `**What's out there:** ${formatPerplexityForPrompt(research.existingSolutions, 400)}` : ""}

${research.competitors && research.competitors.length > 0 ? `
**Example that works:** ${research.competitors[0].title} (${research.competitors[0].url})
${research.competitors[0].description || ""}
` : ""}

**Use this to reassure them:** "Other people are doing similar things, so this model works. Here's what you can learn from them."
` : ""}

## Your Job

Create a simple action plan they can follow. This is a weekend project — they need a checklist, not a business plan.

## Output Format (JSON)

\`\`\`json
{
  "executiveSummary": "One paragraph max. What you're doing, who it helps, what success looks like.",
  "missionStatement": "One simple sentence.",
  "impactThesis": "One sentence on what changes.",
  "volunteerPlan": {
    "rolesNeeded": ["You (organizer)", "People who show up"],
    "recruitmentStrategy": "Text friends, post on Nextdoor, put up a flyer",
    "retentionStrategy": "Make it fun, take photos, coffee after"
  },
  "budgetPlan": [
    {
      "category": "Supplies",
      "amount": 20,
      "priority": "essential",
      "notes": "Dollar store basics"
    }
  ],
  "partnerships": [
    {
      "type": "None needed",
      "description": "This is simple enough to do yourself",
      "potentialPartners": ["Maybe local coffee shop for after"]
    }
  ],
  "operations": "Simple checklist: 1. Pick date. 2. Post about it. 3. Show up. 4. Do it. 5. Take photos. Done.",
  "impactMeasurement": [
    {
      "metric": "People who showed up",
      "target": "10 people",
      "measurementMethod": "Count them",
      "frequency": "Once"
    }
  ]
}
\`\`\`

## Rules
- Keep EVERYTHING simple and short
- Reference that similar projects work (from research) to build confidence
- Budget should be under $50
- Return ONLY valid JSON`;
}

function generateSteadyPlanWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const causes = getCauseLabels(idea.causeAreas);

  return `You create 3-page starter plans for ongoing volunteer projects using real research data to inform strategy.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**How it sustains:** ${idea.revenueModel || "Volunteer-driven"}

## User Context

**Experience:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}
**Causes:** ${causes}

## Research Insights (Use These)

### What the Market Shows
${research.marketResearch ? formatPerplexityForPrompt(research.marketResearch, 600) : "No market research available."}

### Similar Programs That Work
${research.existingSolutions ? formatPerplexityForPrompt(research.existingSolutions, 600) : "No existing solutions research."}

${research.competitors && research.competitors.length > 0 ? `
### Programs We Analyzed
${formatCompetitorsForPrompt(research.competitors, "steady")}

**Learn from them:** What are they doing well? What gaps could this project fill?
` : ""}

## Your Job

Create a realistic plan informed by what works for similar projects. Include a 4-week launch plan.

## Output Format (JSON)

\`\`\`json
{
  "executiveSummary": "2 paragraphs covering what this is, who it helps, how it works. Reference what similar projects have achieved.",
  "missionStatement": "Clear, simple mission (one sentence)",
  "impactThesis": "How your activities lead to change, informed by what research shows works",
  "volunteerPlan": {
    "rolesNeeded": ["Specific roles based on what similar programs use"],
    "recruitmentStrategy": "Practical ways to find helpers, informed by research",
    "retentionStrategy": "Based on what keeps volunteers engaged in similar programs"
  },
  "budgetPlan": [
    {
      "category": "Category",
      "amount": 0,
      "priority": "essential",
      "notes": "Why needed, based on what similar programs spend"
    }
  ],
  "partnerships": [
    {
      "type": "Partnership type",
      "description": "What this provides, based on research into similar programs",
      "potentialPartners": ["Specific options from research"]
    }
  ],
  "operations": "4-week launch plan: Week 1: [tasks]. Week 2: [tasks]. Week 3: [tasks]. Week 4: Launch. Informed by how similar programs operate.",
  "impactMeasurement": [
    {
      "metric": "Metric similar programs track",
      "target": "Realistic target based on research",
      "measurementMethod": "How to track",
      "frequency": "How often"
    }
  ]
}
\`\`\`

## Guidelines
- Reference research findings to make the plan credible
- Use realistic numbers based on what similar programs achieve
- Budget should match their stated level (${profile.budget || "zero"})
- Return ONLY valid JSON`;
}

function generateAllInPlanWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);
  const isProject = ventureType === "project";
  const isNonprofit = ventureType === "nonprofit";
  const isBusiness = ventureType === "business";

  return `You are a social venture planning expert creating a comprehensive business plan informed by real market research.

## The Venture

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}
**Impact:** ${idea.impact}

## User Context

**Venture Type:** ${ventureType}
**Causes:** ${causes}
**Experience Level:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}
**Format:** ${profile.format || "both"}

## Research Data (SUPPLEMENTARY — Your Knowledge is Primary)

Use your expertise in social venture planning as the foundation. Research below adds specificity when available.

### Market Research
${research.marketResearch ? formatPerplexityForPrompt(research.marketResearch, 1200) : "No market research available — use your knowledge."}

### Demand Analysis
${research.demandSignals ? formatPerplexityForPrompt(research.demandSignals, 1000) : "No demand research available."}

### Competitive Landscape
${research.existingSolutions ? formatPerplexityForPrompt(research.existingSolutions, 1000) : "No existing solutions research."}

### Competitor Analysis (Scraped Websites)
${research.competitors && research.competitors.length > 0
  ? formatCompetitorsForPrompt(research.competitors, "all_in")
  : "No competitor websites scraped."}

## Output Format (JSON)

Return a JSON object with this structure, informed by research:

\`\`\`json
{
  "executiveSummary": "2-3 paragraphs citing market research, problem validation, and competitive positioning",
  "missionStatement": "One sentence mission statement",
  "impactThesis": "2-3 sentences on theory of change, informed by what research shows works",
  ${!isProject ? `"revenueStreams": [
    {
      "name": "Revenue Source informed by competitor analysis",
      "description": "How it works, based on what similar orgs do",
      "estimatedRevenue": "Realistic estimate based on research",
      "timeline": "When this activates"
    }
  ],` : `"volunteerPlan": {
    "rolesNeeded": ["Roles based on similar programs"],
    "recruitmentStrategy": "Strategy informed by research",
    "retentionStrategy": "Based on what works in similar programs"
  },`}
  ${isBusiness ? `"financialProjections": [
    { "year": 1, "revenue": 0, "expenses": 0, "netIncome": 0 },
    { "year": 2, "revenue": 0, "expenses": 0, "netIncome": 0 },
    { "year": 3, "revenue": 0, "expenses": 0, "netIncome": 0 }
  ],` : `"budgetPlan": [
    {
      "category": "Category based on similar org budgets",
      "amount": 0,
      "priority": "essential",
      "notes": "Informed by research"
    }
  ],`}
  "partnerships": [
    {
      "type": "Partnership type from competitive analysis",
      "description": "What this provides",
      "potentialPartners": ["Specific partners based on research"]
    }
  ],
  "operations": "2-3 paragraphs on operations, informed by how similar ventures operate",
  "impactMeasurement": [
    {
      "metric": "Industry-standard metric from research",
      "target": "Realistic target based on similar orgs",
      "measurementMethod": "How to track",
      "frequency": "How often"
    }
  ]
}
\`\`\`

## Calibration Guidelines
${profile.experience === "beginner" ? "- Keep explanations clear, focus on Year 1" : ""}
${profile.budget === "zero" ? "- Emphasize free tools, volunteer time, in-kind resources" : ""}
${isProject ? "- Focus on volunteer engagement and lean operations" : ""}
${isNonprofit ? "- Include grant/donor strategy informed by research" : ""}
${isBusiness ? "- Include unit economics based on competitor pricing" : ""}

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// RESEARCH-ENHANCED MARKETING PROMPTS
// ============================================================================

export function generateResearchEnhancedMarketingPrompt(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendMarketingWithResearch(idea, profile, research);
  }

  if (commitment === "steady") {
    return generateSteadyMarketingWithResearch(idea, profile, research);
  }

  return generateAllInMarketingWithResearch(idea, profile, research);
}

function generateWeekendMarketingWithResearch(
  idea: Idea,
  _profile: UserProfile,
  _research: ResearchData
): string {
  // Weekend warriors don't need research-enhanced marketing — keep it simple
  return `You write simple outreach messages for weekend community projects. No marketing jargon. Just friendly invitations.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## Your Job

Write the simple messages they need to get people to show up. This is a weekend project — they need a Nextdoor post and a text to send friends.

## Output Format (JSON)

\`\`\`json
{
  "elevatorPitch": "One sentence you'd say to a neighbor.",
  "tagline": "3-5 words max.",
  "landingPageHeadline": "No website needed — just show up!",
  "landingPageSubheadline": "The date, time, and location.",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "A Nextdoor/Facebook post: friendly, specific date/time/place, what to bring.",
      "hashtags": []
    },
    {
      "platform": "linkedin",
      "content": "A text message template to send friends.",
      "hashtags": []
    },
    {
      "platform": "instagram",
      "content": "A simple flyer text they could print.",
      "hashtags": []
    }
  ],
  "emailTemplate": {
    "subject": "Quick reminder subject",
    "body": "Reminder email for people who said they'd come. 2-3 sentences."
  },
  "primaryCTA": "Show Up Saturday"
}
\`\`\`

Return ONLY valid JSON`;
}

function generateSteadyMarketingWithResearch(
  idea: Idea,
  _profile: UserProfile,
  research: ResearchData
): string {
  return `You create practical outreach content for ongoing community projects, informed by how similar projects message.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}

${research.competitors && research.competitors.length > 0 ? `
## How Similar Projects Position Themselves

${research.competitors.slice(0, 2).map(c => `
**${c.title}**
${c.description || "No description available"}
${c.uniqueValue ? `Value prop: ${c.uniqueValue}` : ""}
`).join("\n")}

**Use this:** Learn from their messaging but differentiate. What makes YOUR project unique?
` : ""}

## Your Job

Write the core messages they need to recruit volunteers and participants. Informed by competitor positioning.

## Output Format (JSON)

\`\`\`json
{
  "elevatorPitch": "2-3 sentence explanation, differentiated from competitors",
  "tagline": "5-7 word memorable phrase",
  "landingPageHeadline": "Clear headline",
  "landingPageSubheadline": "One sentence explaining what you do",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "Facebook/Nextdoor post (3-4 sentences)",
      "hashtags": ["local", "community"]
    },
    {
      "platform": "linkedin",
      "content": "LinkedIn post (2 short paragraphs)",
      "hashtags": ["volunteer", "community"]
    },
    {
      "platform": "instagram",
      "content": "Instagram post with casual tone",
      "hashtags": ["community", "local", "volunteer"]
    }
  ],
  "emailTemplate": {
    "subject": "Clear, specific subject",
    "body": "Welcome or outreach email. 3 paragraphs, friendly tone."
  },
  "primaryCTA": "2-4 word action phrase"
}
\`\`\`

Return ONLY valid JSON`;
}

function generateAllInMarketingWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);

  return `You are a direct response copywriter creating marketing assets informed by competitive research.

## The Venture

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}
**Impact:** ${idea.impact}

## User Context

**Venture Type:** ${ventureType}
**Causes:** ${causes}

## Competitive Messaging Analysis

${research.competitors && research.competitors.length > 0 ? `
Here's how competitors position themselves:

${research.competitors.slice(0, 4).map(c => `
### ${c.title}
- URL: ${c.url}
- Description: ${c.description || "N/A"}
- Target: ${c.targetAudience || "N/A"}
- Unique Value: ${c.uniqueValue || "N/A"}
`).join("\n")}

**Differentiation opportunity:** What gaps exist in competitor messaging? Where can this venture stand out?
` : "No competitor messaging available — create distinctive positioning."}

${research.demandSignals ? `
## Audience Insights (from research)
${formatPerplexityForPrompt(research.demandSignals, 600)}
` : ""}

## Copy Philosophy

1. **Lead with Transformation** - Reader is the hero
2. **Be Specific** - Use real numbers and outcomes from research
3. **Differentiate** - Stand out from competitors identified above

## Output Format (JSON)

\`\`\`json
{
  "elevatorPitch": "30-second pitch differentiated from competitors",
  "tagline": "3-7 word memorable tagline",
  "landingPageHeadline": "10 words or fewer, differentiated from competitor headlines",
  "landingPageSubheadline": "20-30 words, clear value prop",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "Tweet (under 280 chars)",
      "hashtags": ["relevant"]
    },
    {
      "platform": "linkedin",
      "content": "LinkedIn post (2-3 paragraphs)",
      "hashtags": ["professional"]
    },
    {
      "platform": "instagram",
      "content": "Instagram caption (hook, story, CTA)",
      "hashtags": ["instagram"]
    }
  ],
  "emailTemplate": {
    "subject": "Compelling subject line",
    "body": "Email body (3-4 paragraphs)"
  },
  "primaryCTA": "Primary CTA (2-4 words)"
}
\`\`\`

## Voice Guidelines
${ventureType === "project" ? "- Warm, neighborly, accessible" : ""}
${ventureType === "nonprofit" ? "- Professional but personable, story-driven" : ""}
${ventureType === "business" ? "- Brand-forward, quality-focused" : ""}

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// RESEARCH-ENHANCED ROADMAP PROMPTS
// ============================================================================

export function generateResearchEnhancedRoadmapPrompt(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendRoadmapWithResearch(idea, profile, research);
  }

  if (commitment === "steady") {
    return generateSteadyRoadmapWithResearch(idea, profile, research);
  }

  return generateAllInRoadmapWithResearch(idea, profile, research);
}

function generateWeekendRoadmapWithResearch(
  idea: Idea,
  _profile: UserProfile,
  _research: ResearchData
): string {
  // Weekend warriors don't need research-enhanced roadmaps — keep it simple
  return `You create simple checklists for weekend projects. No phases, no dependencies — just what to do and when.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## Your Job

Create a simple day-by-day checklist leading up to the event/project.

## Output Format (JSON)

\`\`\`json
{
  "quickWins": [
    { "task": "TODAY: [One specific thing]", "timeframe": "Today", "cost": "free" },
    { "task": "TOMORROW: [Next thing]", "timeframe": "Tomorrow", "cost": "free" },
    { "task": "THIS WEEK: [Before the day]", "timeframe": "This week", "cost": "free" },
    { "task": "DAY BEFORE: [Last prep]", "timeframe": "Day before", "cost": "low" },
    { "task": "DAY OF: [Show up and do it]", "timeframe": "Day of", "cost": "free" }
  ],
  "phases": [
    {
      "name": "Just Do It",
      "duration": "This week",
      "tasks": [
        { "task": "Pick a date and time", "priority": "critical", "cost": "free", "dependencies": [] },
        { "task": "Text 10 friends", "priority": "critical", "cost": "free", "dependencies": [] },
        { "task": "Post on Nextdoor/Facebook", "priority": "high", "cost": "free", "dependencies": [] },
        { "task": "Get supplies ($25 max)", "priority": "high", "cost": "low", "dependencies": [] },
        { "task": "Show up and do it", "priority": "critical", "cost": "free", "dependencies": [] }
      ]
    }
  ],
  "skipList": [
    "Don't make a website — just show up",
    "Don't wait for perfect conditions",
    "Don't worry if only 3 people come"
  ]
}
\`\`\`

Return ONLY valid JSON`;
}

function generateSteadyRoadmapWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  return `You create 4-week launch plans for ongoing community projects, informed by how similar projects launched.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## User Context

**Experience:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}

${research.existingSolutions ? `
## How Similar Projects Launched (Research)
${formatPerplexityForPrompt(research.existingSolutions, 600)}

**Apply this:** What launch strategies worked for similar projects? What mistakes should they avoid?
` : ""}

## Your Job

Create a realistic 4-week plan informed by how similar projects launched successfully.

## Output Format (JSON)

\`\`\`json
{
  "quickWins": [
    { "task": "Specific today task", "timeframe": "Today", "cost": "free" },
    { "task": "This week task", "timeframe": "This week", "cost": "free" }
  ],
  "phases": [
    {
      "name": "Week 1: Set Up",
      "duration": "Week 1",
      "tasks": [
        { "task": "Task based on how similar projects start", "priority": "critical", "cost": "free", "dependencies": [] }
      ]
    },
    {
      "name": "Week 2: Recruit",
      "duration": "Week 2",
      "tasks": [
        { "task": "Recruitment task", "priority": "critical", "cost": "free", "dependencies": [] }
      ]
    },
    {
      "name": "Week 3: Soft Launch",
      "duration": "Week 3",
      "tasks": [
        { "task": "Soft launch task", "priority": "high", "cost": "low", "dependencies": [] }
      ]
    },
    {
      "name": "Week 4: Go Live",
      "duration": "Week 4",
      "tasks": [
        { "task": "Launch task", "priority": "critical", "cost": "free", "dependencies": [] }
      ]
    }
  ],
  "skipList": [
    "Common mistake to avoid based on research",
    "Another thing that derails similar projects"
  ]
}
\`\`\`

Return ONLY valid JSON`;
}

function generateAllInRoadmapWithResearch(
  idea: Idea,
  profile: UserProfile,
  research: ResearchData
): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);
  const budget = profile.budget || "zero";

  return `You are a launch strategist creating a roadmap informed by how successful similar ventures launched.

## The Venture

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}
**Impact:** ${idea.impact}

## User Context

**Venture Type:** ${ventureType}
**Causes:** ${causes}
**Experience Level:** ${profile.experience || "beginner"}
**Budget:** ${budget}
**Format:** ${profile.format || "both"}

## Research on How Similar Ventures Launched

${research.marketResearch ? `
### Market Context
${formatPerplexityForPrompt(research.marketResearch, 800)}
` : ""}

${research.existingSolutions ? `
### How Similar Ventures Launched
${formatPerplexityForPrompt(research.existingSolutions, 800)}
` : ""}

${research.competitors && research.competitors.length > 0 ? `
### Competitor Operations (from website analysis)
${formatCompetitorsForPrompt(research.competitors, "all_in")}
` : ""}

## Your Job

Create an actionable roadmap informed by:
- What worked for similar ventures
- What mistakes similar ventures made
- What partnerships and channels competitors use

## Budget Calibration
${budget === "zero" ? "- Personal outreach heavy, free tools only" : ""}
${budget === "low" ? "- Mixed personal + some paid" : ""}
${budget === "medium" ? "- Can test small paid ads" : ""}
${budget === "high" ? "- Multi-channel launch possible" : ""}

## Output Format (JSON)

\`\`\`json
{
  "quickWins": [
    { "task": "Specific task based on research", "timeframe": "Day 1", "cost": "free" },
    { "task": "Another quick win", "timeframe": "Day 2-3", "cost": "free" }
  ],
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "duration": "Weeks 1-2",
      "tasks": [
        { "task": "Task informed by how competitors started", "priority": "critical", "cost": "free", "dependencies": [] }
      ]
    },
    {
      "name": "Phase 2: Launch",
      "duration": "Weeks 3-4",
      "tasks": [
        { "task": "Task based on successful launch strategies", "priority": "high", "cost": "low", "dependencies": [] }
      ]
    },
    {
      "name": "Phase 3: Growth",
      "duration": "Weeks 5-8",
      "tasks": [
        { "task": "Growth task based on competitor growth patterns", "priority": "medium", "cost": "medium", "dependencies": [] }
      ]
    }
  ],
  "skipList": [
    "Mistake similar ventures made that you should avoid",
    "Another common pitfall from research"
  ]
}
\`\`\`

## Guidelines
- Reference research findings in task descriptions where relevant
- Learn from competitor mistakes for the skip list
- Each phase should have 3-5 tasks
- Total tasks across phases: 12-18

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// SYSTEM PROMPTS (Enhanced for research-based generation)
// ============================================================================

export const RESEARCH_ENHANCED_VIABILITY_SYSTEM_PROMPT = `You are SparkGood's viability analyst — rigorous, knowledgeable, and grounded.

IMPORTANT: Use YOUR OWN KNOWLEDGE as the primary foundation for your analysis. You have extensive knowledge about social impact, nonprofits, social enterprises, community projects, and market dynamics. The research data provided is SUPPLEMENTARY — use it to add real-world specificity, recent examples, and concrete data points, but don't let weak or incomplete research diminish the quality of your analysis.

How to use research data:
- If research provides strong, specific data → incorporate it with citations
- If research is generic or weak → rely more on your own knowledge, use research sparingly
- If research contradicts your knowledge → note the discrepancy and provide balanced analysis
- NEVER let missing or poor research make your output worse than it would be without research

Your assessments are:
- Grounded in your expertise — you know this space
- Enhanced by research — specific names, URLs, and data when available
- Honest — realistic about challenges
- Actionable — clear next steps
- Calibrated — match depth to commitment level

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const RESEARCH_ENHANCED_PLAN_SYSTEM_PROMPT = `You are SparkGood's business planning expert — experienced and practical.

IMPORTANT: Use YOUR OWN KNOWLEDGE as the primary foundation. You have deep expertise in social impact business models, nonprofit operations, community organizing, and sustainable revenue strategies. Research data provided is SUPPLEMENTARY — use it to add specificity when strong, but don't let weak research diminish your output.

You create plans that incorporate:
- Your expertise in what works for social ventures
- Real data when research provides it (specific names, pricing, partnerships)
- Practical, tested approaches based on your knowledge

Match plan complexity to the user's commitment level. Weekend warriors need 1-page action plans. All-in founders need comprehensive plans.

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const RESEARCH_ENHANCED_MARKETING_SYSTEM_PROMPT = `You are SparkGood's copywriter — compelling, authentic, and strategic.

IMPORTANT: Use YOUR OWN KNOWLEDGE of direct response copywriting and social impact messaging as the foundation. You understand what makes people take action, how to communicate impact authentically, and what resonates with different audiences. Research data is SUPPLEMENTARY — use it to differentiate from specific competitors when available.

You create marketing assets that:
- Apply proven copywriting principles you know work
- Differentiate from competitors when research provides specifics
- Speak to real audience pain points (from your knowledge, enhanced by research)
- Sound human and authentic, never corporate or generic

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const RESEARCH_ENHANCED_ROADMAP_SYSTEM_PROMPT = `You are SparkGood's launch strategist — practical and experienced.

IMPORTANT: Use YOUR OWN KNOWLEDGE of how social ventures launch successfully as the foundation. You know the common patterns, typical timelines, resource constraints, and pitfalls. Research data is SUPPLEMENTARY — use it to add specific examples when strong, but your expertise drives the roadmap.

You create roadmaps that apply:
- Your knowledge of what works at each stage of social venture development
- Specific learnings from research when it provides concrete examples
- Realistic timelines based on the user's resources and commitment level
- Clear priorities so users know what matters most

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;
