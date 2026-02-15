# CLAUDE.md — SparkGood Project Instructions

## Project Overview

SparkGood is a **dual-product platform** that helps people turn their desire to make a difference into real-world action:

1. **SparkGood Web App** — A guided web experience that takes users from "I want to do something good" to a complete launch package (ideas, market research, business plan, marketing assets, action roadmap). Powered by AI tools running behind the scenes (Perplexity, Firecrawl, Claude) so users never touch a terminal.

2. **SparkGood Pro Toolkit** — A downloadable package of pre-configured Claude Code skills for advanced users who want to run the same powerful frameworks in their own environment with full customization.

**Brand name:** SparkGood
**Domain:** sparkgood.io
**Tagline:** "Spark something good."
**Mission:** Remove the barriers between good intentions and real impact.

## What Makes SparkGood Different

Every AI business idea generator stops at "here's an idea." SparkGood is the only tool that:
- Filters everything through a **social impact lens** — every concept must create measurable good
- Includes a **community project** option alongside nonprofits and businesses — you don't have to start a company to make a difference
- Goes from idea → **market research** → **business/project plan** → **marketing assets** → **action roadmap** in one guided flow
- **Calibrates to the user** — experience level, budget, format preference, and causes they care about shape every output
- Uses **real research tools** (Perplexity, Firecrawl, Playwright) behind the scenes — not just LLM knowledge, but live data
- Offers a **Pro Toolkit** for advanced users who want to run these frameworks in Claude Code themselves

## Target Audience

- Aspiring social entrepreneurs who have passion but lack knowledge or resources
- People who want to help their community but don't know where to start
- Early-stage founders pivoting toward purpose-driven work
- Students, retirees, career-changers, and anyone with desire but not direction
- **Pro tier:** Technical founders, agency owners, and consultants who work in Claude Code and want social impact frameworks

## Product Architecture

### Product 1: SparkGood Web App

#### The User Journey

**Step 1: Discovery (FREE)**
User answers intake questions that shape everything downstream:
- **Venture type:** Community project, nonprofit, socially-conscious business, or hybrid
- **Format:** Online-only, in-person/on the ground, or both
- **Causes:** Select from 12 cause areas (environment, education, health, poverty, food security, equity, animals, mental health, youth, elder care, arts, tech access)
- **Experience level:** Complete beginner → some experience → experienced founder
- **Budget:** $0 sweat equity → under $500 → $500-5K → $5K+
- **Depth:** "Just give me ideas" or "Help me build it"
- **Own idea or surprise:** Bring their own seed concept or let AI generate from scratch

**Step 2: Idea Generation (FREE)**
AI generates 4 tailored social impact concepts. Each includes:
- Catchy name and one-liner description
- The specific problem it solves
- Who it serves
- Revenue/sustainability model (unless it's a community project)
- Why it matters / tangible impact

**Step 3: Market Research & Viability (PAID — Standard)**
Behind the scenes, the app uses Perplexity and Firecrawl to conduct real research:
- Market size and demand analysis using live data
- Competitive landscape scan (actual competitors found and analyzed)
- Target audience profiling
- Strengths, risks, opportunities
- Viability score (1-10) with Go / Refine / Pivot verdict
- Strategic recommendation

**Step 4: Business/Project Plan (PAID — Standard)**
- Executive summary
- Mission and impact thesis
- Revenue streams OR resource/volunteer plan (for projects)
- Financial projections OR budget plan
- Partnerships and operations
- Impact measurement framework

**Step 5: Marketing / Outreach Assets (PAID — Standard)**
- Elevator pitch and tagline
- Landing page headline and subheadline
- Social media posts (Twitter/X, LinkedIn, Instagram)
- Email outreach template
- Primary call to action

**Step 6: Action Roadmap (PAID — Standard)**
- Quick wins (do this week)
- Phased plan with tasks, priorities, and cost indicators
- Skip list (what NOT to waste time on yet)

### Product 2: SparkGood Pro Toolkit

A downloadable package of Claude Code skills that advanced users install in their own environment. Includes:

#### Research Skills
- **social-impact-research** — Uses Perplexity MCP to conduct deep research on social issues, market gaps, and opportunities within a cause area
- **competitor-analysis** — Uses Firecrawl and Playwright MCPs to find, scrape, and analyze competing organizations, tools, and services
- **audience-profiling** — Builds detailed profiles of beneficiaries, customers, donors, or community members

#### Strategy Skills
- **social-impact-positioning** — Finds unique positioning angles for social ventures using frameworks adapted for impact-driven organizations
- **viability-scoring** — Evaluates a social venture idea across market demand, feasibility, impact potential, and sustainability
- **revenue-model-design** — Generates sustainable revenue/funding models for nonprofits, social enterprises, and community projects

#### Execution Skills
- **business-plan-generator** — Creates complete business plans or project plans calibrated to venture type and experience level
- **impact-measurement** — Designs impact measurement frameworks with specific KPIs and tracking methods
- **grant-writing-assistant** — Helps draft grant applications for nonprofit and social enterprise funding

#### Marketing Skills
- **social-impact-copywriting** — Direct response copy adapted for cause-driven organizations (not corporate, not charity-voice — authentic and compelling)
- **launch-assets** — Generates landing pages, pitch decks, social posts, and email templates
- **community-outreach** — Creates volunteer recruitment materials, partnership proposals, and community engagement plans

#### Orchestration
- **sparkgood-orchestrator** — Master skill that analyzes what skills are available, what the user has done so far, and recommends the next step

## Monetization Model

### Free Tier
- Full guided questionnaire
- AI-generated idea concepts (4 per session)
- Ability to regenerate ideas
- No sign-up required

### Standard Tier (Subscription — pricing TBD)
- Everything in Free
- Market research and viability analysis (powered by Perplexity + Firecrawl behind the scenes)
- Complete business/project plan generation
- Marketing and outreach asset generation
- Personalized action roadmap
- Save, export, and revisit plans

### Pro Tier (Subscription or one-time — pricing TBD)
- Everything in Standard
- Downloadable SparkGood Pro Toolkit (all Claude Code skills)
- Setup guide and documentation for installing skills and MCPs
- Access to skill updates as we improve them
- Priority support

## Design Direction

### Aesthetic
- Warm, empowering, grounded — "campfire energy"
- Warm amber/gold (#F59E0B) as the primary spark color against deep charcoal/brown tones (#1C1412)
- NOT corporate blue, NOT charity-pink, NOT purple AI gradients
- Should feel like sitting down with a mentor who believes in you

### Typography
- Display/headings: Playfair Display (serif, distinctive, human)
- Body/UI: DM Sans (clean, friendly, readable)
- NEVER use generic fonts: Inter, Roboto, Arial, system fonts

### Tone of Voice
- Conversational, not formal. Every question should feel like a natural next question, not a survey.
- Encouraging without being cheesy. More like a smart friend who takes you seriously.
- Direct and clear. Respect the user's intelligence.

### UI Principles
- Progress bar showing where users are in the flow
- Smooth fade-in animations on step transitions
- Cards with hover states for selection
- Pill-shaped tags for cause selection
- No form-like layouts — this should feel like a conversation
- Mobile-first responsive design

## Tech Stack

### Web App
- **Frontend:** React (Next.js App Router)
- **AI Backend:** Claude API (Sonnet for speed, Opus for deep analysis if needed)
- **Research Backend:** Perplexity API, Firecrawl API (called from server-side API routes)
- **Deployment:** Vercel (free tier initially)
- **Styling:** Tailwind CSS or CSS-in-JS (must match design direction)
- **Future:** Supabase (auth + database), Stripe (payments)

### Pro Toolkit
- Claude Code skills (.claude/skills/ directory structure)
- SKILL.md files following the Agent Skills open standard
- MCP configuration guides for Perplexity, Playwright, Firecrawl
- README with installation instructions

## MCP Tools (for development AND powering the web app)

- **Perplexity MCP** — Deep market research, competitive analysis, trend identification
- **Playwright MCP** — Browser automation, screenshot competitor sites, design inspiration
- **Firecrawl MCP** — Web scraping, data extraction from competitor tools

## Skills (for development)

- **frontend-design** — Anthropic's skill for distinctive, production-grade UI
- **Custom SparkGood skills** — These become the Pro Toolkit AND power the web app. DRY principle.

## Code Conventions

- Clean, readable code with comments explaining business logic
- Component-based architecture — one component per concern
- All AI prompts stored in a separate prompts/ directory for easy iteration
- Error handling on all API calls with user-friendly fallback messages
- Responsive design — test at 375px (mobile), 768px (tablet), 1280px (desktop)

## File Structure (Target)

```
sparkgood/
├── CLAUDE.md
├── PROJECT_BRIEF.md
├── ARCHITECTURE.md
├── package.json
├── src/
│   ├── app/
│   │   └── api/                  # Server-side API routes
│   ├── components/
│   │   ├── ui/
│   │   ├── steps/
│   │   └── results/
│   ├── lib/
│   ├── prompts/
│   ├── styles/
│   └── types/
├── public/
├── pro-toolkit/
│   ├── README.md
│   ├── setup/
│   │   ├── install-mcps.sh
│   │   └── mcp-config-example.json
│   └── skills/
│       ├── social-impact-research/
│       ├── competitor-analysis/
│       ├── audience-profiling/
│       ├── social-impact-positioning/
│       ├── viability-scoring/
│       ├── revenue-model-design/
│       ├── business-plan-generator/
│       ├── impact-measurement/
│       ├── grant-writing-assistant/
│       ├── social-impact-copywriting/
│       ├── launch-assets/
│       ├── community-outreach/
│       └── sparkgood-orchestrator/
└── .claude/
    └── skills/
```

## Important Context

- The founder is a beginner technically but can follow instructions. Explain decisions in plain language.
- Budget is $200-1000/month. Favor free/low-cost tools.
- Side project (evenings/weekends) but moving fast.
- **Dual product:** Web app AND Pro Toolkit are both core products, not afterthoughts.
- **Skills we build for the Pro Toolkit also power the web app.** Same frameworks, both places. DRY.
- The sparkgood.jsx artifact from initial planning can be referenced for UI patterns and flow design.

## Development Workflow: Multi-Terminal Strategy

Running Claude Code in multiple terminals simultaneously is encouraged for this project. Each terminal maintains its own context window, so splitting work prevents context overload and produces better results.

**Recommended terminal split:**

- **Terminal 1 — Research & Data Collection:** Run Perplexity MCP queries, Firecrawl scraping, Playwright screenshots. Save all findings to files in a `/research` directory. This terminal's context will fill up with raw data — that's expected. Its job is to gather and export, not to build.

- **Terminal 2 — Building & Execution:** Read saved research files, invoke skills, write code, create components. This terminal stays focused on production work with clean context. Reference research files created by Terminal 1 rather than re-running research queries.

- **Terminal 3 (optional) — Review & QA:** Spin up a fresh context to review what the other terminals produced. Use task-based agents with specialized roles (e.g., "You are a conversion rate optimization expert — review this landing page and suggest improvements"). Fresh context = better critique.

**Key rules:**
- Research terminals should always save outputs to files before context gets compacted
- Building terminals should read those files rather than re-running expensive MCP calls
- When stuck or confused, spin up a fresh terminal with a focused role rather than continuing in a cluttered context
- The orchestrator skill can help decide what to do next from any terminal

## Current Phase

**Phase A: Environment Setup** — Installing MCPs (Perplexity, Playwright, Firecrawl) and skills (frontend-design, custom skills)

**Next:** Deep market research using Perplexity MCP, then competitive analysis, then build.
