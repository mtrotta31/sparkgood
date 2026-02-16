// Deep Dive Prompt Templates
// These prompts power the paid features: Viability, Business Plan, Marketing, and Roadmap
// All prompts calibrate outputs based on commitment level:
// - Weekend Warriors → Dramatically simplified, no jargon, just "here's what to do"
// - Steady Builders → Structured but accessible, 3-page plans
// - All-In → Full professional frameworks
//
// Note: Research-enhanced prompts are in research-enhanced-prompts.ts

import type { UserProfile, Idea, CauseArea, CommitmentLevel } from "@/types";
import { CAUSE_AREAS } from "@/lib/constants";

// Helper to get cause labels
const getCauseLabels = (causes: CauseArea[]): string => {
  return causes
    .map((c) => CAUSE_AREAS.find((ca) => ca.id === c)?.label || c)
    .join(", ");
};

// Helper to get commitment level with fallback
const getCommitment = (profile: UserProfile): CommitmentLevel => {
  return profile.commitment || "steady";
};

// ============================================================================
// VIABILITY REPORT PROMPT (from viability-scoring skill)
// Calibrated by commitment level:
// - Weekend: Quick yes/no + "here's how to get people to show up"
// - Steady: Simple scorecard with red/yellow/green
// - All-In: Full 5-dimension weighted analysis
// ============================================================================

export function generateViabilityPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);
  const commitment = getCommitment(profile);

  // Weekend Warriors get dramatically simplified output
  if (commitment === "weekend") {
    return generateWeekendViabilityPrompt(idea, profile, causes);
  }

  // Steady Builders get a simple scorecard
  if (commitment === "steady") {
    return generateSteadyViabilityPrompt(idea, profile, causes);
  }

  // All-In gets full analysis
  return generateAllInViabilityPrompt(idea, profile, ventureType, causes);
}

function generateWeekendViabilityPrompt(idea: Idea, _profile: UserProfile, _causes: string): string {
  return `You help people figure out if their weekend project will work. No MBA jargon. Just "yes, and here's how."

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**The problem:** ${idea.problem}
**Who it helps:** ${idea.audience}

## Your Job

Give them a simple yes/no/probably with practical tips. This is a weekend project — they don't need SWOT analysis, they need to know if this will work and how to get people to show up.

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "marketSize": "One sentence on why this type of project works (keep it simple)",
  "demandAnalysis": "1-2 sentences on why people will want this",
  "competitors": [
    {
      "name": "Similar thing that exists",
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
  "recommendation": "YES — do it! Here's how to get people to show up: [specific practical advice like 'text 10 friends personally, post on Nextdoor, pick a specific date']"
}
\`\`\`

## Important
- verdict should almost always be "go" for simple community projects — the bar is "will people show up?" not "will this scale?"
- viabilityScore should be 7-9 for most valid weekend projects
- recommendation should focus on HOW TO GET PEOPLE TO SHOW UP, not strategy
- Keep everything short and jargon-free
- Return ONLY valid JSON`;
}

function generateSteadyViabilityPrompt(idea: Idea, profile: UserProfile, causes: string): string {
  return `You help people evaluate ongoing volunteer projects. Give them a simple scorecard — green/yellow/red — with clear next steps.

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

## Evaluation (Simplified)

Score these 4 factors as green (strong), yellow (needs work), or red (problem):
1. **People need this** — Is there real demand?
2. **You can deliver** — Do you have the skills/resources?
3. **It can keep going** — Is it sustainable without burnout?
4. **You're right for this** — Do you have the connections/experience?

## Output Format (JSON)

\`\`\`json
{
  "marketSize": "2 sentences on the need/opportunity",
  "demandAnalysis": "2-3 sentences on demand signals",
  "competitors": [
    {
      "name": "Similar initiative",
      "url": "https://example.com",
      "description": "What they do",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Gap you could fill"]
    }
  ],
  "targetAudience": {
    "primaryPersona": "Who you're helping (2 sentences)",
    "demographics": "Key characteristics",
    "painPoints": ["Pain 1", "Pain 2"],
    "motivations": ["Why they'll engage"]
  },
  "strengths": ["What's working for you"],
  "risks": ["Risk — how to mitigate it"],
  "opportunities": ["Growth opportunity"],
  "viabilityScore": 7.5,
  "verdict": "refine",
  "recommendation": "Overall verdict with 2-3 specific things to do before launching. Be direct: 'GO' means proceed, 'WORK ON IT' means fix these specific things first, 'RETHINK' means major issues."
}
\`\`\`

## Notes
- viabilityScore: 8+ = GO, 6-7.9 = WORK ON IT (refine), below 6 = RETHINK (pivot)
- Keep language accessible, no MBA jargon
- Focus on practical next steps
- Return ONLY valid JSON`;
}

function generateAllInViabilityPrompt(idea: Idea, profile: UserProfile, ventureType: string, causes: string): string {
  return `You are a social venture analyst specializing in early-stage viability assessment. Evaluate this social impact idea and deliver an honest, actionable verdict.

## The Idea to Evaluate

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

## Evaluation Framework

Evaluate across 5 dimensions, each scored 1-10:

1. **Demand Signal (25%)** - Is there real, demonstrated need?
2. **Impact Potential (25%)** - Will this create meaningful, measurable change?
3. **Founder-Idea Fit (20%)** - Based on stated experience and context
4. **Feasibility (15%)** - Can this actually be built and delivered?
5. **Sustainability (15%)** - Can this keep going without constant heroic effort?

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "marketSize": "Description of the market/need size (2-3 sentences)",
  "demandAnalysis": "Analysis of demand signals and evidence (3-4 sentences)",
  "competitors": [
    {
      "name": "Competitor or Similar Initiative Name",
      "url": "https://example.com",
      "description": "What they do (1-2 sentences)",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"]
    }
  ],
  "targetAudience": {
    "primaryPersona": "Description of the primary beneficiary (2-3 sentences)",
    "demographics": "Age, location, income, relevant characteristics",
    "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
    "motivations": ["Motivation 1", "Motivation 2", "Motivation 3"]
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "risks": ["Risk 1", "Risk 2", "Risk 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "viabilityScore": 7.5,
  "verdict": "go",
  "recommendation": "Strategic recommendation and critical next steps (3-4 sentences)"
}
\`\`\`

## Notes
- Include 2-4 competitors (can be similar initiatives, not just direct competitors)
- viabilityScore should be weighted: (Demand × 0.25) + (Impact × 0.25) + (Fit × 0.20) + (Feasibility × 0.15) + (Sustainability × 0.15)
- verdict must be one of: "go" (score 8+), "refine" (score 6-7.9), or "pivot" (score below 6)
- Be honest but encouraging — a "refine" verdict with clear steps is valuable
- Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// BUSINESS PLAN PROMPT (from business-plan-generator skill)
// Calibrated by commitment level:
// - Weekend: 1-page action plan (what, who, when, done)
// - Steady: 3-page starter plan with 4-week launch
// - All-In: Full business plan with all sections
// ============================================================================

export function generateBusinessPlanPrompt(idea: Idea, profile: UserProfile): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendPlanPrompt(idea, profile);
  }

  if (commitment === "steady") {
    return generateSteadyPlanPrompt(idea, profile);
  }

  return generateAllInPlanPrompt(idea, profile);
}

function generateWeekendPlanPrompt(idea: Idea, _profile: UserProfile): string {
  return `You create simple 1-page action plans for weekend projects. No business jargon. Just what they need to do.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## Your Job

Create a simple action plan they can follow. This is a weekend project — they need a checklist, not a business plan.

## Output Format (JSON)

Return the same structure but with DRAMATICALLY simplified content:

\`\`\`json
{
  "executiveSummary": "One paragraph max. What you're doing, who it helps, what success looks like. Example: 'You're organizing a neighborhood park cleanup on Saturday. Success = 10 people show up, 20 bags of trash collected, everyone feels good about their neighborhood.'",
  "missionStatement": "One simple sentence. Example: 'Make Oak Street Park clean and bring neighbors together.'",
  "impactThesis": "One sentence on what changes. Example: 'When neighbors work together on something visible, they connect and want to do more.'",
  "volunteerPlan": {
    "rolesNeeded": ["You (organizer)", "People who show up"],
    "recruitmentStrategy": "Text friends, post on Nextdoor, put up a flyer",
    "retentionStrategy": "Make it fun, take photos, coffee after"
  },
  "budgetPlan": [
    {
      "category": "Supplies (trash bags, gloves)",
      "amount": 20,
      "priority": "essential",
      "notes": "Dollar store, you provide so people don't have excuses"
    }
  ],
  "partnerships": [
    {
      "type": "None needed",
      "description": "This is a simple project — just do it",
      "potentialPartners": ["Maybe ask a local coffee shop for post-cleanup coffee"]
    }
  ],
  "operations": "Pick a date. Post about it. Show up with supplies. Do the thing. Take before/after photos. Thank everyone. Post the photos. Done.",
  "impactMeasurement": [
    {
      "metric": "People who showed up",
      "target": "10 people",
      "measurementMethod": "Count them",
      "frequency": "Once"
    },
    {
      "metric": "Bags of trash",
      "target": "15-20 bags",
      "measurementMethod": "Count them",
      "frequency": "Once"
    }
  ]
}
\`\`\`

## Rules
- Keep EVERYTHING simple and short
- No jargon, no "stakeholders," no "KPIs"
- Focus on what to DO, not what to plan
- Budget should be under $50 for most weekend projects
- Operations should be a simple checklist, not paragraphs
- Return ONLY valid JSON`;
}

function generateSteadyPlanPrompt(idea: Idea, profile: UserProfile): string {
  const causes = getCauseLabels(idea.causeAreas);

  return `You create 3-page starter plans for ongoing volunteer projects. Structured but accessible.

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

## Your Job

Create a realistic plan for someone spending a few hours a week on this. Include a 4-week launch plan.

## Output Format (JSON)

\`\`\`json
{
  "executiveSummary": "2 paragraphs covering: what this is, who it helps, how it works, what success looks like in 3 months",
  "missionStatement": "Clear, simple mission (one sentence)",
  "impactThesis": "How your activities lead to change (2 sentences max)",
  "volunteerPlan": {
    "rolesNeeded": ["2-3 specific roles needed"],
    "recruitmentStrategy": "Practical ways to find helpers (be specific)",
    "retentionStrategy": "How to keep people engaged month after month"
  },
  "budgetPlan": [
    {
      "category": "Category",
      "amount": 0,
      "priority": "essential",
      "notes": "Why needed, free alternatives if budget is zero"
    }
  ],
  "partnerships": [
    {
      "type": "Partnership type",
      "description": "What this provides",
      "potentialPartners": ["Specific local options"]
    }
  ],
  "operations": "Week 1: [tasks]. Week 2: [tasks]. Week 3: [tasks]. Week 4: First session/event. Ongoing: Weekly rhythm of [activities].",
  "impactMeasurement": [
    {
      "metric": "Simple, countable metric",
      "target": "Realistic 3-month target",
      "measurementMethod": "How to track (keep it simple)",
      "frequency": "Monthly"
    }
  ]
}
\`\`\`

## Guidelines
- Keep language accessible
- Be realistic about what one person with a few hours/week can do
- Include a clear 4-week launch plan in operations
- Budget should match their stated budget level (${profile.budget || "zero"})
- 3-5 impact metrics max
- Return ONLY valid JSON`;
}

function generateAllInPlanPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);
  const isProject = ventureType === "project";
  const isNonprofit = ventureType === "nonprofit";
  const isBusiness = ventureType === "business";

  return `You are a social venture planning expert. Create a comprehensive, actionable business plan tailored to this specific venture.

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
**Experience Level:** ${profile.experience || "beginner"} ${profile.experience === "beginner" ? "(Include more explanation, simpler projections, focus on Year 1)" : ""}
**Budget:** ${profile.budget || "zero"} ${profile.budget === "zero" ? "(Volunteer-based model, in-kind resources, lean operations)" : ""}
**Format:** ${profile.format || "both"}

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "executiveSummary": "2-3 paragraph executive summary covering problem, solution, impact thesis, and key metrics",
  "missionStatement": "One sentence mission statement",
  "impactThesis": "2-3 sentences on your theory of change - how activities lead to outcomes",
  ${!isProject ? `"revenueStreams": [
    {
      "name": "Revenue/Funding Source Name",
      "description": "How this revenue stream works",
      "estimatedRevenue": "Year 1 estimate (be realistic for budget level)",
      "timeline": "When this activates"
    }
  ],` : `"volunteerPlan": {
    "rolesNeeded": ["Role 1", "Role 2", "Role 3"],
    "recruitmentStrategy": "How to find and recruit volunteers",
    "retentionStrategy": "How to keep volunteers engaged"
  },`}
  ${isBusiness ? `"financialProjections": [
    { "year": 1, "revenue": 0, "expenses": 0, "netIncome": 0 },
    { "year": 2, "revenue": 0, "expenses": 0, "netIncome": 0 },
    { "year": 3, "revenue": 0, "expenses": 0, "netIncome": 0 }
  ],` : `"budgetPlan": [
    {
      "category": "Category name",
      "amount": 0,
      "priority": "essential",
      "notes": "Why this is needed"
    }
  ],`}
  "partnerships": [
    {
      "type": "Partnership type (Referral, Delivery, Funding, etc.)",
      "description": "What this partnership provides",
      "potentialPartners": ["Partner 1", "Partner 2"]
    }
  ],
  "operations": "2-3 paragraphs on how the venture operates day-to-day, including key activities, timeline, and resources needed",
  "impactMeasurement": [
    {
      "metric": "What you're measuring",
      "target": "Specific target for Year 1",
      "measurementMethod": "How you'll track this",
      "frequency": "How often you'll measure"
    }
  ]
}
\`\`\`

## Calibration Guidelines
${profile.experience === "beginner" ? "- Keep it simple and actionable, focus on Year 1" : ""}
${profile.budget === "zero" ? "- Emphasize free tools, volunteer time, and in-kind resources" : ""}
${isProject ? "- Focus on volunteer engagement, community ownership, and lean operations" : ""}
${isNonprofit ? "- Include grant/donor strategy, board considerations, and impact reporting" : ""}
${isBusiness ? "- Include unit economics, competitive positioning, and revenue projections" : ""}

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// MARKETING ASSETS PROMPT (from social-impact-copywriting skill)
// Calibrated by commitment level:
// - Weekend: One Nextdoor post + text template to friends
// - Steady: Core social posts + simple email
// - All-In: Full marketing asset suite
// ============================================================================

export function generateMarketingPrompt(idea: Idea, profile: UserProfile): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendMarketingPrompt(idea, profile);
  }

  if (commitment === "steady") {
    return generateSteadyMarketingPrompt(idea, profile);
  }

  return generateAllInMarketingPrompt(idea, profile);
}

function generateWeekendMarketingPrompt(idea: Idea, _profile: UserProfile): string {
  return `You write simple outreach messages for weekend community projects. No marketing jargon. Just friendly invitations.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## Your Job

Write the simple messages they need to get people to show up. This is a weekend project — they need a Nextdoor post and a text to send friends.

## Output Format (JSON)

Return this structure with SIMPLE, FRIENDLY content:

\`\`\`json
{
  "elevatorPitch": "One sentence you'd say to a neighbor. Example: 'We're cleaning up Oak Street Park this Saturday — want to come?'",
  "tagline": "3-5 words max. Example: 'Join your neighbors Saturday'",
  "landingPageHeadline": "They don't need a landing page. Put: 'No website needed — just show up!'",
  "landingPageSubheadline": "The date, time, and location. Example: 'Saturday March 15, 9am, Oak Street Park entrance'",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "A Nextdoor/Facebook post: friendly, specific date/time/place, what to bring, what to expect. 3-5 sentences max.",
      "hashtags": []
    },
    {
      "platform": "linkedin",
      "content": "A text message template to send friends. Example: 'Hey! I'm doing a park cleanup Saturday 9am at Oak Street Park. Want to come? Bringing coffee for after.'",
      "hashtags": []
    },
    {
      "platform": "instagram",
      "content": "A simple flyer text they could print: Project name, date, time, place, what to bring, contact info.",
      "hashtags": []
    }
  ],
  "emailTemplate": {
    "subject": "They don't need email. But if they do: simple subject",
    "body": "Quick reminder email for people who said they'd come. 2-3 sentences. What, when, where, what to bring."
  },
  "primaryCTA": "Show Up Saturday"
}
\`\`\`

## Rules
- No marketing speak. Write like you're texting a friend.
- Include specific date/time/place in every message
- Tell people what to bring (or that you'll provide supplies)
- Keep it SHORT
- Don't include LinkedIn (weekend warriors don't need it)
- Return ONLY valid JSON`;
}

function generateSteadyMarketingPrompt(idea: Idea, _profile: UserProfile): string {
  return `You create practical outreach content for ongoing community projects. Clear, friendly, action-oriented.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}

## Your Job

Write the core messages they need to recruit volunteers and participants for an ongoing project.

## Output Format (JSON)

\`\`\`json
{
  "elevatorPitch": "2-3 sentence explanation of what this is and why it matters. Conversational tone.",
  "tagline": "5-7 word memorable phrase",
  "landingPageHeadline": "Clear headline for a simple landing page (Carrd, Notion, etc.)",
  "landingPageSubheadline": "One sentence explaining what you do and for whom",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "Facebook/Nextdoor post announcing or recruiting for the project (3-4 sentences)",
      "hashtags": ["local", "community"]
    },
    {
      "platform": "linkedin",
      "content": "LinkedIn post if recruiting professional volunteers (2 short paragraphs)",
      "hashtags": ["volunteer", "community"]
    },
    {
      "platform": "instagram",
      "content": "Instagram post with casual tone and clear CTA",
      "hashtags": ["community", "local", "volunteer"]
    }
  ],
  "emailTemplate": {
    "subject": "Clear, specific subject line",
    "body": "Welcome email for new volunteers OR outreach email to potential partners. 3 paragraphs, friendly tone, clear ask."
  },
  "primaryCTA": "2-4 word action phrase"
}
\`\`\`

## Guidelines
- Friendly, not formal
- Specific, not vague
- Action-oriented — every message should have a clear next step
- Return ONLY valid JSON`;
}

function generateAllInMarketingPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);

  return `You are a direct response copywriter specialized in cause-driven organizations. Create compelling marketing assets that convert interest into action.

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

## Copy Philosophy

1. **Lead with Transformation, Not Problem** - Reader is the hero
2. **Be Specific, Not Sentimental** - Concrete over vague
3. **Close the Loop** - Show them joining an existing movement

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "elevatorPitch": "30-second pitch: We help [BENEFICIARY] [ACHIEVE OUTCOME] by [UNIQUE MECHANISM]. [PROOF POINT]. (25-40 words)",
  "tagline": "3-7 word memorable tagline (Action + Benefit or Transformation Statement)",
  "landingPageHeadline": "10 words or fewer, transformation promise or bold claim",
  "landingPageSubheadline": "20-30 words explaining mechanism, who you serve, and differentiator",
  "socialPosts": [
    {
      "platform": "twitter",
      "content": "Tweet announcing the launch (under 280 characters)",
      "hashtags": ["relevant", "hashtags"]
    },
    {
      "platform": "linkedin",
      "content": "Professional post for LinkedIn (2-3 short paragraphs)",
      "hashtags": ["professional", "hashtags"]
    },
    {
      "platform": "instagram",
      "content": "Instagram caption with emoji and formatting (hook, story, CTA)",
      "hashtags": ["instagram", "hashtags"]
    }
  ],
  "emailTemplate": {
    "subject": "Compelling email subject line",
    "body": "Welcome/announcement email body (3-4 paragraphs, conversational tone, clear CTA)"
  },
  "primaryCTA": "Primary call-to-action button text (2-4 words)"
}
\`\`\`

## Voice Guidelines
${ventureType === "project" ? "- Warm, neighborly, accessible. 'We' language (inclusive). Local references." : ""}
${ventureType === "nonprofit" ? "- Professional but personable. Story-driven. Clear impact language." : ""}
${ventureType === "business" ? "- Brand-forward. Quality-focused. Impact integrated naturally." : ""}

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// ACTION ROADMAP PROMPT (from launch-assets skill)
// Calibrated by commitment level:
// - Weekend: Simple day-by-day checklist ending with "day of"
// - Steady: 4-week launch plan with weekly tasks
// - All-In: Full phased roadmap with dependencies
// ============================================================================

export function generateRoadmapPrompt(idea: Idea, profile: UserProfile): string {
  const commitment = getCommitment(profile);

  if (commitment === "weekend") {
    return generateWeekendRoadmapPrompt(idea, profile);
  }

  if (commitment === "steady") {
    return generateSteadyRoadmapPrompt(idea, profile);
  }

  return generateAllInRoadmapPrompt(idea, profile);
}

function generateWeekendRoadmapPrompt(idea: Idea, _profile: UserProfile): string {
  return `You create simple checklists for weekend projects. No phases, no dependencies — just what to do and when.

## The Project

**Name:** ${idea.name}
**What it is:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## Your Job

Create a simple day-by-day checklist leading up to the event/project. This should fit on an index card.

## Output Format (JSON)

\`\`\`json
{
  "quickWins": [
    {
      "task": "TODAY: [One specific thing to do right now]",
      "timeframe": "Today",
      "cost": "free"
    },
    {
      "task": "TOMORROW: [Next thing to do]",
      "timeframe": "Tomorrow",
      "cost": "free"
    },
    {
      "task": "THIS WEEK: [Thing to do before the day]",
      "timeframe": "This week",
      "cost": "free"
    },
    {
      "task": "DAY BEFORE: [Last prep task]",
      "timeframe": "Day before",
      "cost": "low"
    },
    {
      "task": "DAY OF: [What to do when you show up]",
      "timeframe": "Day of",
      "cost": "free"
    }
  ],
  "phases": [
    {
      "name": "Just Do It",
      "duration": "This week",
      "tasks": [
        {
          "task": "Pick a specific date and time",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        },
        {
          "task": "Text 5 friends to ask if they'll come",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        },
        {
          "task": "Post on Nextdoor/Facebook with the details",
          "priority": "high",
          "cost": "free",
          "dependencies": []
        },
        {
          "task": "Get supplies (keep it under $25)",
          "priority": "high",
          "cost": "low",
          "dependencies": []
        },
        {
          "task": "Show up, do the thing, take photos",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        }
      ]
    }
  ],
  "skipList": [
    "Don't make a website — just show up",
    "Don't wait for perfect conditions — pick a date and go",
    "Don't overthink supplies — basics are fine",
    "Don't worry if only 3 people come — that's enough to start"
  ]
}
\`\`\`

## Rules
- 5-6 quick wins max, each VERY specific
- Only ONE phase called "Just Do It"
- 4-6 simple tasks
- Skip list should prevent overthinking
- Everything should cost $0-25 total
- Return ONLY valid JSON`;
}

function generateSteadyRoadmapPrompt(idea: Idea, profile: UserProfile): string {
  return `You create 4-week launch plans for ongoing community projects. Realistic for someone with a few hours a week.

## The Project

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Who it helps:** ${idea.audience}

## User Context

**Experience:** ${profile.experience || "beginner"}
**Budget:** ${profile.budget || "zero"}

## Your Job

Create a realistic 4-week plan. Each week should have 3-4 tasks doable in a few hours.

## Output Format (JSON)

\`\`\`json
{
  "quickWins": [
    {
      "task": "Specific thing to do today",
      "timeframe": "Today",
      "cost": "free"
    },
    {
      "task": "Thing to do this week",
      "timeframe": "This week",
      "cost": "free"
    },
    {
      "task": "Another quick start task",
      "timeframe": "This week",
      "cost": "free"
    }
  ],
  "phases": [
    {
      "name": "Week 1: Set Up",
      "duration": "Week 1",
      "tasks": [
        {
          "task": "Specific task",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        }
      ]
    },
    {
      "name": "Week 2: Recruit",
      "duration": "Week 2",
      "tasks": [
        {
          "task": "Specific task",
          "priority": "high",
          "cost": "free",
          "dependencies": []
        }
      ]
    },
    {
      "name": "Week 3: Soft Launch",
      "duration": "Week 3",
      "tasks": [
        {
          "task": "Specific task",
          "priority": "high",
          "cost": "low",
          "dependencies": []
        }
      ]
    },
    {
      "name": "Week 4: Go Live",
      "duration": "Week 4",
      "tasks": [
        {
          "task": "Specific task",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        }
      ]
    }
  ],
  "skipList": [
    "Thing to NOT do yet — why",
    "Another common mistake to avoid"
  ]
}
\`\`\`

## Guidelines
- 3-4 quick wins
- 4 weekly phases with 3-4 tasks each
- Tasks should be specific and completable in 1-2 hours
- Budget calibrated to their stated budget (${profile.budget || "zero"})
- Skip list: 3-4 common mistakes for this type of project
- Return ONLY valid JSON`;
}

function generateAllInRoadmapPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const causes = getCauseLabels(idea.causeAreas);
  const budget = profile.budget || "zero";

  return `You are a launch strategist for social impact ventures. Create a clear, actionable roadmap that removes "now what?" paralysis.

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

## Budget Calibration
${budget === "zero" ? "- Personal outreach heavy, focus on friends/family/network, free tools only" : ""}
${budget === "low" ? "- Mixed personal + some paid, network + local community" : ""}
${budget === "medium" ? "- Can test small paid ads, broader reach, A/B testing" : ""}
${budget === "high" ? "- Multi-channel launch possible, comprehensive approach" : ""}

## Output Format (JSON)

Return a JSON object with this structure:

\`\`\`json
{
  "quickWins": [
    {
      "task": "Specific action to take this week (be very concrete)",
      "timeframe": "Day 1",
      "cost": "free"
    },
    {
      "task": "Another quick win",
      "timeframe": "Day 2-3",
      "cost": "free"
    },
    {
      "task": "Third quick win",
      "timeframe": "Day 4-5",
      "cost": "low"
    }
  ],
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "duration": "Weeks 1-2",
      "tasks": [
        {
          "task": "Specific task description",
          "priority": "critical",
          "cost": "free",
          "dependencies": []
        }
      ]
    },
    {
      "name": "Phase 2: Launch",
      "duration": "Weeks 3-4",
      "tasks": [
        {
          "task": "Specific task description",
          "priority": "high",
          "cost": "low",
          "dependencies": ["Previous task if applicable"]
        }
      ]
    },
    {
      "name": "Phase 3: Growth",
      "duration": "Weeks 5-8",
      "tasks": [
        {
          "task": "Specific task description",
          "priority": "medium",
          "cost": "medium",
          "dependencies": []
        }
      ]
    }
  ],
  "skipList": [
    "Thing they should NOT do yet (e.g., 'Don't build an app — validate with manual process first')",
    "Another thing to skip",
    "Third thing that's a common mistake"
  ]
}
\`\`\`

## Guidelines
- Quick wins should be doable TODAY, not someday
- Each phase should have 3-5 tasks
- Tasks should be specific and actionable, not vague
- priority: "critical" | "high" | "medium" | "low"
- cost: "free" | "low" | "medium" | "high"
- skipList should include common mistakes for this type of venture
- Total tasks across all phases: 12-18

Return ONLY valid JSON, no markdown formatting`;
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const VIABILITY_SYSTEM_PROMPT = `You are SparkGood's viability analyst — rigorous but encouraging.

You evaluate social impact ideas honestly, helping founders avoid the #1 reason ventures fail: building something nobody needs.

Your assessments are:
- Honest but not harsh
- Specific with evidence
- Action-oriented with clear next steps
- Calibrated to the user's experience level

A "refine" verdict with clear direction is more valuable than false optimism.

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const BUSINESS_PLAN_SYSTEM_PROMPT = `You are SparkGood's business planning expert — practical and impact-focused.

You create plans that are:
- Compelling enough for funders
- Practical enough for founders
- Impact-focused to stay true to mission
- Calibrated to experience level and budget

The best plan is one that actually gets used. Match complexity to the venture's actual needs.

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const MARKETING_SYSTEM_PROMPT = `You are SparkGood's copywriter — empowering, specific, and action-oriented.

Your copy philosophy:
- Empowerment over pity
- Specificity over sentiment
- Action over awareness
- Reader as hero, organization as guide

Great social impact copy illuminates truth and makes action easy. You're inviting, not selling.

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export const ROADMAP_SYSTEM_PROMPT = `You are SparkGood's launch strategist — practical and momentum-focused.

Your philosophy: Done is better than perfect. Analysis paralysis kills more ventures than bad execution.

Your roadmaps are:
- Immediately actionable
- Calibrated to budget and experience
- Focused on quick wins for momentum
- Realistic about what NOT to do yet

Help users ship, not obsess.

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;
