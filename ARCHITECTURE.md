# SparkGood — Technical Architecture

## System Overview

SparkGood is a dual-product platform: a React-based web application AND a downloadable Claude Code skills toolkit. Both products share the same core frameworks and AI logic.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPARKGOOD PLATFORM                            │
│                                                                  │
│  ┌───────────────────────────┐  ┌────────────────────────────┐  │
│  │   PRODUCT 1: WEB APP      │  │  PRODUCT 2: PRO TOOLKIT    │  │
│  │                           │  │                            │  │
│  │  User Browser (React)     │  │  User's Claude Code        │  │
│  │  ┌──────┐ ┌────────────┐ │  │  ┌──────────────────────┐  │  │
│  │  │Guide │→│  Results    │ │  │  │ 13+ Claude Code      │  │  │
│  │  │Flow  │ │  Dashboard  │ │  │  │ Skills (SKILL.md)    │  │  │
│  │  └──┬───┘ └─────┬──────┘ │  │  │                      │  │  │
│  │     │           │        │  │  │ + MCP Configs         │  │  │
│  │     ▼           ▼        │  │  │ (Perplexity,          │  │  │
│  │  Next.js API Routes      │  │  │  Playwright,          │  │  │
│  │  (Server-side, secure)   │  │  │  Firecrawl)           │  │  │
│  └──────────┬───────────────┘  │  └──────────────────────┘  │  │
│             │                  │                            │  │
│             ▼                  │  Same frameworks,          │  │
│  ┌──────────────────────┐     │  user controls everything  │  │
│  │   SHARED AI LAYER    │     │                            │  │
│  │                      │     └────────────────────────────┘  │
│  │  • Claude API        │                                     │
│  │  • Perplexity API    │                                     │
│  │  • Firecrawl API     │                                     │
│  │  • Prompt Templates  │                                     │
│  └──────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Product 1: Web App Architecture

### Framework: Next.js (App Router)

**Why Next.js:**
- Server-side API routes keep all API keys secure (never exposed to browser)
- SSR for SEO (organic discovery)
- Built-in image optimization
- Easy Vercel deployment
- File-based routing

### Component Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata
│   ├── page.tsx                # Landing / welcome page
│   ├── builder/
│   │   └── page.tsx            # Main guided builder flow
│   └── api/
│       ├── generate-ideas/
│       │   └── route.ts        # Idea generation (Claude API)
│       ├── research/
│       │   └── route.ts        # Market research (Perplexity API)
│       ├── analyze-competitors/
│       │   └── route.ts        # Competitor analysis (Firecrawl API)
│       └── deep-dive/
│           └── route.ts        # Business plan, marketing, roadmap (Claude API)
│
├── components/
│   ├── ui/                     # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── OptionCard.tsx
│   │   ├── CauseTag.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── FadeIn.tsx
│   │   └── LoadingDots.tsx
│   │
│   ├── steps/                  # Each step of the guided flow
│   │   ├── Welcome.tsx
│   │   ├── VentureType.tsx
│   │   ├── Format.tsx
│   │   ├── CauseSelect.tsx
│   │   ├── Experience.tsx
│   │   ├── Budget.tsx
│   │   ├── Depth.tsx
│   │   ├── HasIdea.tsx
│   │   ├── OwnIdea.tsx
│   │   └── GeneratingScreen.tsx
│   │
│   ├── results/                # Result display components
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaList.tsx
│   │   ├── DeepDiveSection.tsx
│   │   ├── ViabilityReport.tsx
│   │   ├── BusinessPlan.tsx
│   │   ├── MarketingAssets.tsx
│   │   └── ActionRoadmap.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       └── SparkIcon.tsx
│
├── lib/
│   ├── claude.ts               # Claude API client wrapper
│   ├── perplexity.ts           # Perplexity API client wrapper
│   ├── firecrawl.ts            # Firecrawl API client wrapper
│   ├── prompts.ts              # Prompt template builder
│   └── types.ts                # TypeScript interfaces
│
├── prompts/                    # Detailed prompt templates
│   ├── system-prompt.md        # SparkGood AI persona
│   ├── idea-generation.md
│   ├── viability-analysis.md
│   ├── business-plan.md
│   ├── project-plan.md
│   ├── marketing-assets.md
│   └── action-roadmap.md
│
└── styles/
    └── globals.css
```

### Data Flow: How Research Tools Power the Web App

```
User clicks "Analyze Viability"
         │
         ▼
Browser sends POST to /api/research
         │
         ▼
API Route (server-side, secure):
  1. Calls Perplexity API with targeted research queries
     - "market size for [idea category] in [user's format]"
     - "competitors in [cause area] [venture type]"
     - "funding landscape for [venture type] in [cause area]"
  2. Calls Firecrawl API to scrape top competitor websites
     - Extracts messaging, pricing, positioning
  3. Passes all research data + user profile to Claude API
     - Claude synthesizes into structured viability report
  4. Returns structured JSON to browser
         │
         ▼
Browser renders ViabilityReport component with real data
```

### State Management

React state with `useState` and `useReducer`. No external library needed.

```typescript
interface UserProfile {
  ventureType: 'project' | 'nonprofit' | 'business' | 'hybrid' | null;
  format: 'online' | 'in_person' | 'both' | null;
  causes: string[];
  experience: 'beginner' | 'some' | 'experienced' | null;
  budget: 'zero' | 'low' | 'medium' | 'high' | null;
  depth: 'ideas' | 'full' | null;
  hasIdea: boolean | null;
  ownIdea: string;
}

interface GeneratedContent {
  ideas: Idea[];
  selectedIdea: Idea | null;
  viability: ViabilityReport | null;
  plan: BusinessPlan | null;
  marketing: MarketingAssets | null;
  roadmap: ActionRoadmap | null;
}
```

### API Route Pattern

```typescript
// src/app/api/research/route.ts
export async function POST(request: Request) {
  const { profile, idea } = await request.json();

  // Step 1: Research with Perplexity
  const researchData = await perplexitySearch([
    `market size ${idea.category} social enterprise`,
    `competitors ${idea.category} ${profile.ventureType}`,
    `funding opportunities ${profile.ventureType} ${profile.causes.join(' ')}`,
  ]);

  // Step 2: Scrape top competitors with Firecrawl
  const competitorData = await firecrawlScrape(researchData.topCompetitorUrls);

  // Step 3: Synthesize with Claude
  const analysis = await claudeAnalyze({
    systemPrompt: SPARKGOOD_SYSTEM_PROMPT,
    researchData,
    competitorData,
    userProfile: profile,
    idea,
    outputFormat: 'viability_report',
  });

  return Response.json(analysis);
}
```

## Product 2: Pro Toolkit Architecture

### Structure

```
pro-toolkit/
├── README.md                           # Complete installation and usage guide
├── QUICKSTART.md                       # Get running in 5 minutes
├── setup/
│   ├── install-mcps.sh                 # Automated MCP installation script
│   ├── mcp-config-example.json         # Example MCP configuration
│   └── verify-setup.sh                 # Verification script
│
└── skills/
    │
    ├── research/
    │   ├── social-impact-research/
    │   │   ├── SKILL.md                # Main skill instructions
    │   │   ├── templates/
    │   │   │   └── research-report.md  # Output template
    │   │   └── examples/
    │   │       └── sample-output.md    # Example of good output
    │   ├── competitor-analysis/
    │   │   └── SKILL.md
    │   └── audience-profiling/
    │       └── SKILL.md
    │
    ├── strategy/
    │   ├── social-impact-positioning/
    │   │   └── SKILL.md
    │   ├── viability-scoring/
    │   │   ├── SKILL.md
    │   │   └── templates/
    │   │       └── scorecard.md
    │   └── revenue-model-design/
    │       └── SKILL.md
    │
    ├── execution/
    │   ├── business-plan-generator/
    │   │   ├── SKILL.md
    │   │   └── templates/
    │   │       ├── business-plan.md
    │   │       └── project-plan.md
    │   ├── impact-measurement/
    │   │   └── SKILL.md
    │   └── grant-writing-assistant/
    │       └── SKILL.md
    │
    ├── marketing/
    │   ├── social-impact-copywriting/
    │   │   └── SKILL.md
    │   ├── launch-assets/
    │   │   └── SKILL.md
    │   └── community-outreach/
    │       └── SKILL.md
    │
    └── orchestration/
        └── sparkgood-orchestrator/
            └── SKILL.md
```

### Skill Format (Agent Skills Open Standard)

Each SKILL.md follows this pattern:

```markdown
---
name: skill-name
description: When and why Claude should use this skill. Detailed trigger conditions.
---

# Skill Name

## Purpose
What this skill does and when to use it.

## Required MCPs
Which MCPs must be installed (if any).

## Instructions
Step-by-step instructions for Claude to follow.

## Output Format
Expected structure of the output.

## Examples
Sample inputs and outputs showing quality expectations.
```

### Shared Logic: How Skills Map to Web App

| Pro Toolkit Skill | Web App Equivalent |
|---|---|
| social-impact-research | /api/research route (Perplexity calls) |
| competitor-analysis | /api/analyze-competitors route (Firecrawl calls) |
| viability-scoring | /api/deep-dive?type=viability route |
| business-plan-generator | /api/deep-dive?type=plan route |
| social-impact-copywriting | /api/deep-dive?type=marketing route |
| launch-assets | /api/deep-dive?type=marketing route |
| sparkgood-orchestrator | Step flow logic in the React app |

**Key principle:** The prompt templates and frameworks are shared. A skill's instructions should be directly translatable to the web app's API prompts. When we improve a skill, we improve the web app, and vice versa.

## External API Integration

### Perplexity API
- **Purpose:** Deep research queries with real-time web data
- **Used in:** Web app (server-side), Pro Toolkit (via MCP)
- **Pricing:** API access required (pplx-api), pay per query
- **Key endpoints:** Chat completions with web search grounding

### Firecrawl API
- **Purpose:** Web scraping and structured data extraction
- **Used in:** Web app (server-side), Pro Toolkit (via MCP)
- **Pricing:** Free tier available (500 credits/month), then paid
- **Key features:** Scrape, crawl, extract structured data from URLs

### Playwright (MCP only)
- **Purpose:** Browser automation, screenshots, interactive site analysis
- **Used in:** Pro Toolkit only (too resource-intensive for web app API routes)
- **Pricing:** Free (open source)
- **Note:** Pro Toolkit users get this capability; web app users get Firecrawl-based analysis instead

### Claude API (Anthropic)
- **Purpose:** All AI generation (ideas, plans, copy, analysis)
- **Used in:** Web app (server-side), Pro Toolkit (user's own Claude Code subscription)
- **Model strategy:** Sonnet for most tasks, Opus available for deep analysis

## Deployment Architecture

### Phase 1: Launch

```
GitHub Repo → Vercel Auto-Deploy
                  │
                  ├── Frontend (Edge Network / CDN)
                  ├── API Routes (Serverless Functions)
                  │     ├── Claude API calls
                  │     ├── Perplexity API calls
                  │     └── Firecrawl API calls
                  └── Environment Variables
                        ├── ANTHROPIC_API_KEY
                        ├── PERPLEXITY_API_KEY
                        └── FIRECRAWL_API_KEY

Pro Toolkit → GitHub Release / Gumroad download
```

### Phase 2: Auth + Payments

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Vercel   │────▶│ Supabase │     │  Stripe  │
│ Frontend  │     │  Auth &  │     │ Payments │
│ + API     │────▶│    DB    │     │          │
└──────────┘     └──────────┘     └──────────┘
```

## Token and Cost Estimates

### Web App (per user journey)

| Task | Model | Est. Input | Max Output | Est. Cost |
|------|-------|-----------|------------|-----------|
| Idea generation | Sonnet | ~800 | 2,000 | ~$0.01 |
| Research (Perplexity) | — | — | — | ~$0.005/query × 3 |
| Competitor scrape (Firecrawl) | — | — | — | ~5 credits |
| Viability analysis | Sonnet | ~2,000 | 2,000 | ~$0.02 |
| Business plan | Sonnet | ~1,500 | 3,000 | ~$0.02 |
| Marketing assets | Sonnet | ~1,000 | 2,000 | ~$0.01 |
| Action roadmap | Sonnet | ~1,000 | 2,000 | ~$0.01 |

**Total cost per full user journey: ~$0.10**
At 1,000 users/month doing full journeys: ~$100/month in API costs.

### Pro Toolkit
- No cost to SparkGood — users use their own Claude Code subscription and API keys
- Our cost: $0 per Pro user (pure margin after initial development)

## Security

- All API keys stored in Vercel environment variables (never client-side)
- Rate limiting on all API routes (per-IP)
- Input sanitization before passing to any API
- No PII storage in Phase 1
- Pro Toolkit: users manage their own keys locally

## Performance Targets

- First Contentful Paint: < 1.5s
- Idea generation: < 10s
- Research-backed viability: < 20s (multiple API calls)
- Deep dive sections: < 15s each
- Mobile Lighthouse score: > 90

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
FIRECRAWL_API_KEY=fc-...

# App config
NEXT_PUBLIC_APP_URL=https://sparkgood.io

# Future
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
```
