# CLAUDE.md — SparkLocal Project Instructions

## Project Overview

SparkLocal is a **dual-product platform** that helps aspiring entrepreneurs turn their business ideas into reality:

1. **SparkLocal Web App** — A guided web experience that takes users from "I want to start something" to a complete launch package (ideas, market research, business plan, marketing assets, action roadmap). Works for any business type — from food trucks to tech startups to social enterprises. Powered by AI tools running behind the scenes (Perplexity, Claude) so users never touch a terminal.

2. **SparkLocal Resource Directory** — A comprehensive, SEO-optimized directory of grants, accelerators, SBA resources, coworking spaces, and local business services (1,000+ listings across 547 cities) that helps entrepreneurs find real-world support matched to their idea and location. All listings and city pages have AI-generated SEO content for better search visibility.

3. **SparkLocal Pro Toolkit** (Future) — A downloadable package of pre-configured Claude Code skills for advanced users who want to run the same powerful frameworks in their own environment.

**Brand name:** SparkLocal
**Domain:** sparklocal.co
**Tagline:** "Start something local."
**Mission:** Remove the barriers between wanting to start a business and actually doing it.

## What's Been Built (Current State)

### Core Web App (Fully Functional)
- **Guided Builder Flow** (`/builder`) — Multi-step questionnaire with two paths:
  - **General Business Path:** Business category → Target customer → Business model → Key skills → Location → Experience → Budget → Commitment → Depth → Ideas
  - **Social Enterprise Path:** Business category (Social Enterprise) → Venture type → Format → Location → Causes → Experience → Budget → Commitment → Depth → Ideas
- **Idea Generation** — AI generates 4 tailored business concepts based on user profile
- **Deep Dive V2** — Premium 6-tab experience (current version):
  - **"🏗️ Business Foundation"** — Viability score (0-100) with calibrated scoring rubrics, market research (TAM/SAM/SOM), competitor analysis, legal structure, startup costs, suppliers, tech stack, insurance
  - **"🚀 Launch Checklist"** — 4-week "validate first, formalize later" action plan: Weeks 1-2 test demand with business-type-specific validation tasks, Weeks 3-4 formalize and launch after validation
  - **"📈 Growth Plan"** — Elevator pitch, landing page copy, social media posts (5 platforms), email templates, local marketing tactics
  - **"💰 Financial Model"** — Startup costs breakdown, monthly operating costs, revenue projections (3 scenarios), break-even analysis, pricing strategy
  - **"📍 Local Resources"** — Dynamically matched resources across all 11 categories (coworking, grants, accelerators, SBA, business attorneys, consultants, insurance, marketing agencies, chambers of commerce, virtual offices, commercial real estate) based on user's city
  - **"💬 AI Advisor"** — Streaming chat with personalized AI business consultant that knows the user's full plan, profile, and local resources
- **Deep Dive V1** (legacy, still supported for existing projects):
  - **"Will This Work?"** — Viability analysis with scoring breakdown, competitors, market research
  - **"Your Game Plan"** — Complete business/project plan with financials
  - **"Spread the Word"** — Marketing assets (pitch, social posts, email templates)
  - **"Start Here"** — Action roadmap with quick wins, phases, and matched real-world resources
- **Launch Kit V2** — Professional asset generation with 5 downloadable/shareable outputs:
  - **Landing Page** (HTML) — Hosted at `/sites/[slug]`, uses mailto: links for CTAs
  - **Pitch Deck** (PPTX) — 7-slide presentation with market data, financials, competitive landscape
  - **Social Graphics** (PNG) — 4 platform-optimized images (Instagram Post/Story, LinkedIn, Facebook Cover)
  - **One-Pager** (PDF) — Single-page business summary
  - **Text Content** — Social posts, email templates, elevator pitch
- **PDF Export** — Download complete plan as professional PDF
- **My Projects** (`/projects`) — Dashboard to view and continue saved projects
- **Individual Project Pages** (`/projects/[id]`) — View saved deep dive results
- **Example Deep Dive** (`/builder/example`) — Fully interactive example showcasing "Austin Pour Co." mobile cocktail bar with hardcoded data for all 6 tabs. Used as social proof and to help users understand what they'll get. Contextual CTAs when accessed from purchase modal.

### Resource Directory (Fully Functional)
- **Main Directory** (`/resources`) — Homepage with hero, city search, animated stats, top cities grid, category cards
- **Category Pages** (`/resources/[category]`) — List all resources with filters, location sidebar with accurate local counts, 500-600 word SEO guide content with 4 FAQs and FAQPage JSON-LD schema
- **City Hub Pages** (`/resources/[city-slug]`) — SEO-optimized city pages (e.g., `/resources/austin-tx`) showing all resources grouped by category, AI-generated intro, tips, and FAQs
- **Location Pages** (`/resources/[category]/[location]`) — Category + location pages (e.g., "Grants in Austin, TX")
- **Listing Pages** (`/resources/listing/[slug]`) — Individual resource details with structured data and AI-generated descriptions
- **URL Slug Aliases** — Supports common variations (`/resources/grants` → `/resources/grant`, etc.)
- **Resource Matching API** — Matches resources to user's idea based on category, location, business type
- **Dynamic Sitemap** — Auto-generated sitemap for 16,000+ pages (includes city hub pages)
- **Light Theme** — Directory uses warm cream/white theme (separate from dark builder theme)
- **Content Enrichment** — All 1,000+ listings and 547 cities have AI-generated SEO content (descriptions, FAQs, tips, meta content)
- **State Business Guides** — 50 "How to Start a Business in [State]" programmatic SEO pages at `/resources/start-business/[state]` with AI-generated content, FAQs, city links, and JSON-LD schemas (FAQPage, BreadcrumbList, HowTo)
- **Stats:** 1,000+ listings across 547 cities, 50 state guides, 11+ resource categories

### Smart Expansion Engine (Autonomous Growth)
- **Coverage Score Algorithm** — Prioritizes cities with highest population-to-listing ratio
- **11 Resource Categories** — coworking, grant, accelerator, sba, business-attorney, business-consultant, business-insurance, marketing-agency, chamber-of-commerce, virtual-office, commercial-real-estate
- **200 US Cities** — Top cities by population with lat/lng coordinates
- **Budget Controls** — Hard cost cap per run (`--max-cost`), never exceeds budget
- **30-Day Scrape Cooldown** — Won't re-scrape a city+category within 30 days
- **Deduplication** — Checks Google Place ID against existing listings
- **Automated Pipeline** — Weekly GitHub Action runs expansion + enrichment + IndexNow
- **Webhook Notifications** — Optional Slack-compatible notifications on completion

### Automated Blog Engine (SEO Content Pipeline)
- **Fully Automated MWF Schedule** — GitHub Action publishes 3 posts/week at 6 AM EST
- **Keyword Discovery** — DataForSEO API finds low-competition keywords (100-10K volume, <40 difficulty)
- **Topic Selection** — Scoring algorithm: `searchVolume / (difficulty + 1) * clusterBonus`
- **Cannibalization Prevention** — Filters out keywords that would compete with programmatic pages
- **Content Generation** — Claude Haiku writes 1,500-2,500 word SEO posts with directory data
- **Quality Gates** — Auto-validates word count, internal links, keyword density, filler phrase blocklist
- **Featured Images** — Satori generates branded 1200x630 OG images
- **Cross-Linking** — Automatically updates related posts with links to new content
- **Search Submission** — IndexNow + Google Indexing API for instant indexing
- **Cost Efficiency** — ~$8-15/month for 12 posts (DataForSEO ~$1.50, Claude Haiku ~$6-12)
- **Scripts:** `scripts/blog-engine/` (discover-keywords, select-topic, write-post, generate-images, publish-post, submit-indexes, run-all)
- **Config:** `data/blog-engine/config.json` (cluster weights, filler blocklist, keyword filters)

### Authentication & User Data
- **Supabase Auth** — Email/password authentication with magic links
- **User Profiles** — Save intake preferences
- **Saved Ideas** — Persist generated ideas and deep dive results
- **Auto-save** — Deep dive results save automatically when logged in
- **Session State Migration** — Old sessions automatically migrate to include new business category fields (`src/lib/sessionState.ts`)

### Payments & Credits (Fully Functional)
- **Stripe Integration** — Checkout sessions, webhooks, subscription management
- **Pricing Page** (`/pricing`) — Three tiers: Free, Spark ($14.99/mo), Ignite ($29.99/mo)
- **Credits System** — Subscription credits + one-time purchases
- **One-Time Purchases** — Deep Dive ($14.99), Launch Kit ($9.99)
- **Payment Gates** — Server-side verification on `/api/deep-dive`, client-side gates on project pages
- **Purchase Modals** — In-app purchase flow with Stripe Checkout redirect

### Analytics & SEO
- **Google Analytics (GA4)** — User tracking and conversion events
- **Google Search Console** — Site verification via meta tag in `src/app/layout.tsx`
- **IndexNow** — Instant URL submission to Bing/Yandex (`scripts/submit-indexnow.ts`)
- **Schema.org Structured Data:**
  - **Organization + WebSite** — In root layout for brand recognition and sitelinks search box
  - **BreadcrumbList** — On category pages, city hub pages, listing pages, state guides
  - **ItemList** — On category pages for resource grid rich results
  - **FAQPage** — On category guide sections and city hub pages
  - **LocalBusiness** — On coworking/event space listings (with AggregateRating when reviews exist)
  - **MonetaryGrant** — On grant listings with funder and amount info
  - **GovernmentOrganization** — On SBA resource listings
- **Page Metadata** — All key pages have Next.js metadata via layout.tsx files (builder, pricing, projects)
- **Newsletter Capture** — Email signup for updates

### Security & Rate Limiting
- **API Rate Limiting** — Supabase-backed rate limiter prevents abuse (`src/lib/rate-limit.ts`)
- **HTML Sanitization** — DOMPurify for user-generated HTML content (`src/lib/sanitize.ts`)
- **Stripe Webhook Idempotency** — Prevents duplicate credit grants on webhook retries

## Tech Stack (Implemented)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom design tokens
- **Fonts:** Playfair Display (headings), DM Sans (body)
- **Components:** Custom UI library in `src/components/ui/`

### Backend
- **API Routes:** Next.js Route Handlers in `src/app/api/`
- **AI:** Claude API (Anthropic) for all generation
- **Research:** Perplexity MCP for live market research
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **PDF Generation:** @react-pdf/renderer

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **Payments:** Stripe (checkout, webhooks, subscriptions, one-time purchases)

## Key API Routes

### Idea Generation & Deep Dive
- `POST /api/generate-ideas` — Generate 4 ideas from user profile (supports both paths)
- `POST /api/deep-dive` — Generate viability, plan, marketing, or roadmap content
- `POST /api/deep-dive/resources` — Match local resources to user's idea (uses Haiku for cost savings)
- `POST /api/launch-kit` — Generate complete launch kit (legacy V1)
- `POST /api/launch-kit/v2` — Generate Launch Kit V2 assets (pitch deck, social graphics, landing page, one-pager, text content)
- `POST /api/build-asset` — Build specific assets (pitch deck, landing page, etc.)
- `POST /api/export-pdf` — Generate downloadable PDF
- `GET/POST /api/chat-advisor` — AI Advisor chat (GET: load messages, POST: send message with streaming response)

### User Data
- `GET/POST /api/user/profile` — User preferences
- `GET/POST /api/user/ideas` — Saved ideas
- `POST /api/user/ideas/save` — Save idea to projects
- `GET/POST /api/user/deep-dive` — Deep dive results
- `GET /api/user/projects` — List user's projects
- `GET/DELETE /api/user/projects/[id]` — Single project details / delete
- `GET /api/user/credits` — User subscription & credits info
- `POST /api/user/credits/consume` — Consume a credit for deep dive/launch kit

### Payments
- `POST /api/stripe/checkout` — Create Stripe checkout session
- `POST /api/stripe/webhook` — Handle Stripe webhook events (subscription lifecycle)

### Resource Directory
- `GET /api/resources/search` — Full-text search with filters
- `GET /api/resources/[slug]` — Single resource details
- `GET /api/resources/categories` — Category stats
- `POST /api/resources/match` — Match resources to user's idea

### Research
- `POST /api/research` — Perplexity-powered market research
- `POST /api/analyze-competitors` — Competitor analysis

## Key Types (`src/types/index.ts`)

### Business Path Types
- `BusinessCategory` — 10 options: food_beverage, health_wellness, education, technology, ecommerce, professional_services, creative_arts, real_estate, social_enterprise, other
- `BusinessModelPreference` — product, service, subscription, marketplace
- `TargetCustomer` — b2b, b2c, b2g, other
- `KeySkill` — sales_marketing, technical, design_creative, finance_accounting, operations, customer_service, leadership, industry_expertise

### Social Enterprise Types
- `VentureType` — project, nonprofit, business, hybrid
- `CauseArea` — 12 cause areas (environment, education, health, poverty, etc.)

### Profile & Idea Types
- `UserProfile` — Contains both path fields; `businessCategory` determines which path
- `Idea` — Shared fields + optional path-specific fields (`impact`/`causeAreas` for social enterprise, `valueProposition`/`competitiveAdvantage` for general business)

### Deep Dive V2 Types
- `LaunchChecklistData` — Array of weeks, each with tasks (title, description, estimatedTime, estimatedCost, priority, resources)
- `BusinessFoundationData` — marketViability (score, factors), legalStructure, startupCosts, suppliers, techStack, insurance
- `GrowthPlanData` — elevatorPitch, landingPageCopy, socialMediaPosts, emailTemplates, localMarketing
- `FinancialModelData` — startupCostsSummary, monthlyOperatingCosts, revenueProjections, breakEvenAnalysis, pricingStrategy
- `LocalResourcesData` — Matched resources with `byCategory` (dynamic Record<string, LocalResourceItem[]>) and `allCategories` (list of matched category slugs) plus legacy fields for backward compatibility
- `ChecklistProgress` — Record of task IDs to boolean completion status
- `AdvisorMessage` — Chat message (id, role, content, created_at)
- `AdvisorContext` — Full context for AI advisor (profile, idea, checklist, foundation, growth, financial)

### Deep Dive V1 Types (legacy)
- `ViabilityReport` — Market research, competitor analysis, viability score
- `BusinessPlan` — Mission, revenue streams, impact metrics
- `MarketingAssets` — Social posts, email templates, landing page copy
- `ActionRoadmap` — Quick wins, phases, matched resources

### Launch Kit V2 Types (`src/lib/launch-kit/types.ts`)
- `DeepDiveData` — Combined input for all generators (idea, profile, foundation, growth, financial, checklist, localResources)
- `CategoryColors` — Color palette (primary, secondary, accent, background, text, textLight)
- `BusinessOverview` — Extracted business info (name, tagline, problem, audience, howItWorks, differentiation, category, city, state)
- `GeneratedGraphic` — Social graphic output (name, buffer, width, height, platform)
- `LaunchKitAssets` — All generated assets with storage paths and URLs

## Database Schema

### Core Tables
- `user_profiles` — User preferences (business_category, venture_type, format, location, causes, target_customer, business_model_preference, key_skills, etc.)
- `saved_ideas` — Generated ideas linked to profiles (idea_data JSONB, is_selected, profile_id)
- `deep_dive_results` — Deep dive content linked to saved_ideas by idea_id
  - V1 fields: `viability`, `business_plan`, `marketing`, `roadmap`
  - V2 fields: `checklist`, `foundation`, `growth`, `financial`, `matched_resources`, `checklist_progress`, `advisor_message_count`
  - Launch Kit: `launch_kit_assets` (JSONB with storage paths and download URLs for all generated assets)
- `advisor_messages` — AI Advisor chat history (project_id, user_id, role, content, created_at)

### Payments Tables
- `user_credits` — Subscription tier, status, credits remaining, one-time purchases
  - `subscription_tier`: 'free' | 'spark' | 'ignite'
  - `subscription_status`: 'active' | 'canceled' | 'past_due' | null
  - `deep_dive_credits_remaining`: number (Spark gets 5/mo, Ignite unlimited)
  - `launch_kit_credits_remaining`: number (Spark gets 3/mo, Ignite unlimited)
  - `one_time_purchases`: array of idea IDs for purchased deep dives/launch kits

### Resource Directory Tables
- `resource_listings` — All resources (grants, accelerators, SBA, coworking)
  - `enrichment_status`: 'raw' | 'enriched' | 'verified'
  - `enrichment_data`: JSONB with AI-generated SEO content:
    - `ai_description`: 180+ word description for SEO
    - `ai_meta_description`: 150-160 char meta description
    - `ai_faqs`: Array of {question, answer} for structured data
    - `ai_geo_terms`: Local SEO keywords
    - `ai_nearby_landmarks`: Nearby points of interest
  - `details`: JSONB with category-specific data (amounts, deadlines, etc.)
- `resource_locations` — Cities with listing counts and AI content
  - `enrichment_status`: 'raw' | 'enriched' | 'verified'
  - `ai_city_intro`: Intro paragraph about the city's business ecosystem
  - `ai_city_tips`: Numbered tips for entrepreneurs (rendered as list)
  - `ai_city_faqs`: Array of {question, answer} for FAQ section
  - `ai_business_climate`: Overview of local business environment
  - `ai_key_industries`: Major industries in the city
- `resource_category_locations` — Category counts per location
- `resource_saves` — User saved resources

### Newsletter
- `newsletter_subscribers` — Email signups

### Security
- `rate_limits` — API rate limiting (user_id, endpoint, requested_at)
- `webhook_events` — Stripe webhook idempotency (event_id, processed_at)

### Expansion Tracking
- `expansion_tracking` — Tracks scraping history per city+category
  - `city_slug`: City identifier (e.g., 'new-york-ny')
  - `category`: Resource category slug
  - `last_scraped_at`: When this combo was last scraped
  - `results_count`: Number of results from Outscraper
  - `new_listings_count`: Number of new listings added
  - `api_cost`: Estimated API cost for this scrape
  - `status`: 'success' | 'error' | 'no_results'
- **Helper Functions:**
  - `needs_scraping(city_slug, category, days)` — Returns true if not scraped within N days
  - `record_scrape(...)` — Records a scrape attempt with upsert
- **View:** `expansion_coverage_gaps` — Shows cities ordered by coverage gap score

## Builder Flow Paths

### Business Categories (10 total)
1. Food & Beverage
2. Health & Wellness
3. Education & Coaching
4. Technology
5. E-Commerce & Retail
6. Professional Services
7. Creative & Arts
8. Real Estate & Property
9. **Social Enterprise** (triggers legacy social impact path)
10. Other

### General Business Path
```
welcome → business_category → target_customer → business_model → key_skills
→ location → experience → budget → commitment → depth → has_idea → generating → ideas
```

### Social Enterprise Path (when business_category = "social_enterprise")
```
welcome → business_category → venture_type → format → location → causes
→ experience → budget → commitment → depth → has_idea → generating → ideas
```

## Monetization Model

### Free Tier
- Full guided questionnaire
- AI-generated idea concepts (4 per session)
- Ability to regenerate ideas
- No sign-up required

### Spark Tier ($14.99/month)
- Everything in Free
- 5 Deep Dive credits/month
- 3 Launch Kit credits/month
- Save unlimited projects
- PDF export

### Ignite Tier ($29.99/month)
- Everything in Spark
- Unlimited Deep Dives
- Unlimited Launch Kits
- Priority support

### One-Time Purchases
- Deep Dive: $14.99 per idea
- Launch Kit: $9.99 per idea (requires Deep Dive first)

## Design System

### Dark Theme (Builder, Main App)
- **Spark (Primary):** `#F59E0B` (amber)
- **Accent:** `#F97316` (orange)
- **Charcoal Dark:** `#1C1412` (background)
- **Charcoal:** `#2A2220` (cards)
- **Warmwhite:** `#FBF7F4` (text)

### Light Theme (Resource Directory)
- **Cream:** `#FAFAF8` (background)
- **Cream Dark:** `#F5F5F3` (secondary background)
- **Slate Dark:** `#1E293B` (text)
- **Warm Shadows:** Custom shadow utilities (`shadow-warm`, `shadow-warm-md`, etc.)
- **Category Accent Colors:**
  - Grant: Forest green (`#16A34A`)
  - Coworking: Warm blue (`#2563EB`)
  - Accelerator: Burnt orange (`#EA580C`)
  - SBA: Brick red (`#DC2626`)

### Typography
- **Display:** Playfair Display (serif)
- **Body:** DM Sans (sans-serif)

### Components
Located in `src/components/`:
- `ui/` — Reusable primitives (FadeIn, Header, etc.)
- `steps/` — Builder flow step components
- `results/` — Idea cards, result displays, V2 tab components
  - `BusinessOverview.tsx` — Displays idea overview (name, tagline, problem, audience, how it works, differentiation) at top of Business Foundation tab and in PDF
  - `LaunchChecklist.tsx` — Renders V2 checklist with progress tracking
  - `BusinessFoundation.tsx` — Renders V2 market research, legal, costs
  - `GrowthPlan.tsx` — Renders V2 marketing content with copy buttons
  - `FinancialModel.tsx` — Renders V2 financial projections
  - `LocalResources.tsx` — Renders matched local resources by category
  - `AIAdvisor.tsx` — Streaming chat UI with the AI business advisor
  - `IdeaList.tsx` — Displays generated ideas with "See an example" link
- `deep-dive/` — Deep dive section components
  - `DeepDiveSectionV2.tsx` — Main V2 deep dive component (6 tabs + Launch Kit button + regeneration handler)
  - `DeepDiveSection.tsx` — Legacy V1 deep dive component (4 tabs)
  - `LaunchKitModalV2.tsx` — Launch Kit V2 modal with 5 asset tabs (Landing Page, Pitch Deck, Social Graphics, One-Pager, Text Content). Shows "Regenerate" button for failed assets, per-tab error messages, and download/preview functionality.
  - `LaunchKitUpsell.tsx` — Conversion component that appears after all 5 deep dive tabs complete. Shows Launch Kit benefits with CTA to purchase. Dismissible (local state).
  - `LaunchKitModal.tsx` — Legacy V1 launch kit modal
  - `ConfirmDialog.tsx` — Regeneration confirmation
  - V1 view components: `ViabilityReport.tsx`, `BusinessPlanView.tsx`, etc.
- `resources/` — Resource directory components (see below)
- `auth/` — Authentication modals

### Resource Directory Components (`src/components/resources/`)
- `DirectoryNav.tsx` — Light-themed navigation bar
- `DirectoryFooter.tsx` — Light-themed footer
- `ResourceCard.tsx` — Main resource card (category-aware styling)
- `ResourceListingCardLight.tsx` — Compact resource card for lists
- `CityHubContent.tsx` — City hub page content (grouped by category)
- `CitySearch.tsx` — City autocomplete search component
- `AnimatedCounter.tsx` — Animated stats counter
- `NewsletterSignupLight.tsx` — Light-themed newsletter signup
- `CategoryFiltersLight.tsx` — Filter bar for category pages
- `CategoryGuideContent.tsx` — SEO guide content and FAQs for category landing pages (12 categories: grant, coworking, accelerator, sba, business-attorney, business-consultant, business-insurance, marketing-agency, chamber-of-commerce, virtual-office, commercial-real-estate, print-shop)

## File Structure

```
sparklocal/
├── CLAUDE.md                    # This file
├── src/
│   ├── app/
│   │   ├── api/                 # All API routes
│   │   │   ├── generate-ideas/
│   │   │   ├── deep-dive/
│   │   │   ├── chat-advisor/    # AI Advisor streaming chat
│   │   │   ├── launch-kit/
│   │   │   ├── stripe/          # Checkout & webhook
│   │   │   ├── resources/
│   │   │   ├── user/            # Profile, ideas, credits
│   │   │   └── ...
│   │   ├── builder/             # Main builder flow
│   │   │   └── example/         # Example deep dive page (Austin Pour Co.)
│   │   ├── pricing/             # Pricing page
│   │   ├── projects/            # User projects
│   │   ├── resources/           # Resource directory (light theme via layout.tsx)
│   │   │   ├── layout.tsx       # Light theme wrapper
│   │   │   ├── page.tsx         # Main directory homepage
│   │   │   ├── [category]/      # Category OR city hub pages
│   │   │   │   ├── page.tsx     # Handles both category and city-slug routes
│   │   │   │   └── [location]/  # Category + location pages
│   │   │   ├── listing/[slug]/  # Individual listing pages
│   │   │   └── start-business/  # State business guides
│   │   │       ├── page.tsx     # Index page with 50 state grid
│   │   │       ├── layout.tsx   # Light theme wrapper
│   │   │       └── [state]/     # Individual state guide pages
│   │   ├── sites/[slug]/        # Hosted landing pages for Launch Kit
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots.txt
│   ├── components/
│   │   ├── ui/                  # Shared UI components
│   │   ├── steps/               # Builder step components
│   │   │   ├── BusinessCategory.tsx  # NEW - first step
│   │   │   ├── TargetCustomer.tsx    # NEW - general path
│   │   │   ├── BusinessModel.tsx     # NEW - general path
│   │   │   ├── KeySkills.tsx         # NEW - general path
│   │   │   ├── VentureType.tsx       # Social enterprise path
│   │   │   ├── CauseSelect.tsx       # Social enterprise path
│   │   │   └── ...                   # Common steps
│   │   ├── deep-dive/           # Deep dive & launch kit components
│   │   ├── resources/           # Directory components (see Design System)
│   │   ├── seo/                 # SEO components (structured data)
│   │   ├── auth/                # Auth components
│   │   └── PurchaseModal.tsx    # Stripe checkout modal with "See an example" link
│   ├── contexts/                # React contexts (Auth)
│   ├── hooks/                   # Custom hooks (useCredits, useUserData)
│   ├── lib/
│   │   ├── constants.ts         # BUSINESS_CATEGORIES, BUSINESS_MODELS, etc.
│   │   ├── sessionState.ts      # Session persistence with migration
│   │   ├── supabase.ts          # Supabase client
│   │   ├── stripe.ts            # Stripe utilities
│   │   ├── claude.ts            # Claude API wrapper with retry logic
│   │   ├── format-amount.ts     # Currency formatting ($5M, $25K, etc.)
│   │   ├── format-description.ts # Clean up listing descriptions
│   │   ├── formatHours.ts       # Parse hours JSONB to readable format
│   │   ├── match-resources.ts   # Dynamic resource matching for Local Resources tab
│   │   ├── launch-kit/          # Launch Kit V2 generators
│   │   │   ├── index.ts         # Main exports
│   │   │   ├── types.ts         # DeepDiveData, CategoryColors, helpers
│   │   │   ├── generate-pitch-deck.ts    # 7-slide PPTX generation
│   │   │   ├── generate-social-graphics.ts # 4 PNG graphics via satori
│   │   │   ├── generate-landing-page.ts  # Claude-generated HTML
│   │   │   ├── generate-one-pager.ts     # PDF via @react-pdf/renderer
│   │   │   └── fonts/           # Inter font files for satori
│   │   └── ...
│   ├── prompts/                 # AI prompt templates
│   │   ├── idea-generation.ts   # Supports both business paths
│   │   ├── deep-dive.ts         # Supports both business paths
│   │   └── ...
│   ├── data/
│   │   ├── state-guides.ts      # Generated state business guide content (50 states)
│   │   └── expansion-config.ts  # Smart Expansion categories (13) and US cities (200)
│   └── types/                   # TypeScript types
├── scripts/
│   ├── seed-directory.ts        # Seeds resource listings from data files
│   ├── enrich-listings.ts       # Enriches listings via Perplexity API (legacy)
│   ├── enrich-content-seo.ts    # AI content enrichment for SEO (Claude Haiku)
│   ├── fix-city-intros.ts       # Removes SparkLocal references from city intros
│   ├── generate-state-guides.ts # Generate 50 state business guides (Claude Haiku)
│   ├── submit-indexnow.ts       # Submit URLs to Bing/Yandex for instant indexing
│   ├── sync-locations.ts        # Syncs location pages for SEO
│   ├── smart-expand.ts          # Smart Expansion Engine (coverage scoring, Outscraper API)
│   ├── post-expand-pipeline.ts  # Post-expansion enrichment + IndexNow
│   ├── expansion-report.ts      # View expansion stats and coverage gaps
│   ├── expansion-logs/          # JSON logs from expansion runs
│   ├── blog-engine/             # Automated blog content pipeline
│   │   ├── discover-keywords.ts # DataForSEO keyword discovery
│   │   ├── select-topic.ts      # Topic scoring and selection
│   │   ├── write-post.ts        # Claude Haiku content generation
│   │   ├── generate-images.ts   # Satori featured image generation
│   │   ├── publish-post.ts      # Git commit + cross-linking
│   │   ├── submit-indexes.ts    # IndexNow + Google Indexing API
│   │   └── run-all.ts           # Full pipeline orchestrator
│   └── ...                      # Data files
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_resource_directory.sql
│       ├── 20240220_create_user_credits.sql
│       ├── 20240221_create_newsletter_subscribers.sql
│       ├── 20240222_add_business_category_fields.sql  # Business category support
│       ├── 20240223_add_checklist_progress.sql        # Checklist progress tracking
│       ├── 20240224_add_deep_dive_v2_columns.sql      # V2 deep dive columns
│       ├── 20240225_add_matched_resources_column.sql  # Local resources column
│       ├── 20240226_add_advisor_tables.sql            # AI Advisor chat tables
│       ├── 20240227_launch_kit_v2.sql                 # Launch Kit V2 storage
│       ├── 20260226_webhook_idempotency.sql           # Stripe webhook deduplication
│       └── 20260228_expansion_tracking.sql            # Smart Expansion tracking table
├── content/
│   └── blog/                    # Markdown blog posts
│       └── *.md                 # Posts with frontmatter (title, slug, description, date, tags, featuredImage)
└── public/
    └── blog/images/             # Featured images ({slug}-featured.png)
```

## Utility Functions (`src/lib/`)

### `format-amount.ts`
Currency formatting for grant/accelerator amounts:
- `formatAmount(5000000)` → `"$5M"`
- `formatAmount(25000)` → `"$25K"`
- `formatAmount(500)` → `"$500"`
- `formatAmount(0)` → `null` (hides $0 values)
- `formatAmountRange(10000, 50000)` → `"$10K - $50K"`
- `formatAmountRange(null, 100000)` → `"Up to $100K"`

### `formatHours.ts`
Parse hours JSONB from database into readable format:
- `formatHours({ "Monday": ["9AM-5PM"], "Tuesday": ["9AM-5PM"], ... })` → `"Mon-Fri: 9AM-5PM"`
- Groups consecutive days with same hours
- Also includes `getOpenStatus()` to check if currently open

### `format-description.ts`
Clean up listing descriptions by removing boilerplate text.

### `claude.ts`
Claude API wrapper with JSON handling and rate limit resilience:
- `sendMessage(prompt, options)` — Send message to Claude, get text response
- `sendMessageForJSON<T>(prompt, options)` — Send message, parse JSON response with automatic snake_case to camelCase conversion
- `extractJSON(response)` — Extract JSON from Claude response (handles markdown code blocks, extra text)
- Automatic key conversion ensures Claude's snake_case responses match TypeScript camelCase types
- **Model Tier Selection:** Set `modelTier: "sonnet"` or `modelTier: "haiku"` for simplified model selection. Sonnet is the default. Haiku is used for simpler tasks to reduce costs.
- **Rate Limit Retry:** Set `retryOnRateLimit: true` in options to automatically retry once after 10s on 429 errors

### `rate-limit.ts`
Supabase-backed rate limiter to prevent API abuse:
- `checkRateLimit(endpoint, identifier)` — Returns true if request allowed, false if rate limited
- Tracks requests per user/endpoint in `rate_limits` table
- **Fails open** — If database unavailable, allows requests through
- **Limits per hour:** generate-ideas (10), deep-dive (20), deep-dive/resources (30), launch-kit/v2 (20), chat-advisor (60)

### `sanitize.ts`
HTML sanitization using DOMPurify:
- Used for landing page HTML, AI advisor responses, and any user-generated HTML content
- Prevents XSS attacks by stripping dangerous tags and attributes

### `launch-kit/types.ts`
Launch Kit V2 type definitions and helpers:
- `DeepDiveData` — Combined data from all deep dive tabs (idea, profile, foundation, growth, financial, checklist, localResources)
- `CategoryColors` — Color palette based on business category (primary, secondary, accent, background, text)
- `getCategoryColors(category)` — Returns appropriate colors for each business category
- `extractBusinessOverview(data)` — Extracts key business info (name, tagline, problem, audience, etc.)
- `formatCurrency(amount)` — Format numbers as currency ($1,234)
- `parseCurrency(value)` — Parse currency strings to numbers (handles "$1,234", "1234", etc.)
- `generateSlug(name)` — Generate URL-safe slug from business name

### `launch-kit/generate-pitch-deck.ts`
Generates 7-slide PPTX presentation using pptxgenjs:
- Slide 1: Cover (business name, tagline, location, accent bar)
- Slide 2: The Opportunity (problem, audience, TAM/SAM/SOM with proper spacing)
- Slide 3: The Solution (description, differentiation, benefit cards with centered numbers)
- Slide 4: Market Validation (viability score centered in circle, breakdown table, trends)
- Slide 5: Competitive Landscape (competitor table with full names, positioning statement)
- Slide 6: Financial Projections (startup costs, prominent annual revenue, break-even)
- Slide 7: Next Steps (funding needs, 4-week timeline, accent bar)
- **Smart number formatting:** `formatMarketSize()` converts "$8.99 billion" → "$8.99B"
- **Sentence-aware truncation:** `truncateText()` cuts at sentence boundaries (. ! ?), falls back to comma, then word boundary - never mid-sentence
- **Color consistency:** Accent color (#F97316) only on slides 1 and 7; navy/professional palette for content slides
- **Character limits:** benefit descriptions (150), break-even (200), assessment (100)

### `launch-kit/generate-social-graphics.ts`
Generates 4 PNG graphics using satori + @resvg/resvg-js:
- Instagram Post (1080×1080) — Square format
- Instagram Story (1080×1920) — Vertical format
- LinkedIn Post (1200×627) — Landscape format
- Facebook Cover (820×312) — Wide banner
- **Category-aware colors:** Uses business category for color palette
- **Responsive font sizing:** Adjusts based on business name length (handles 20+ chars)
- **No text clipping:** Decorative elements positioned away from text areas
- **Satori requirements:** All containers with multiple children MUST have explicit `display: "flex"`. Decorative elements wrapped in flex containers to avoid layout errors.

### `launch-kit/generate-landing-page.ts`
Generates standalone HTML landing page via Claude API:
- Professional design with Google Fonts (Playfair Display + DM Sans)
- Category-aware color palette from `getCategoryColors()`
- Sections: Hero, Problem/Solution, Benefits, About, FAQ, Footer
- **mailto: CTAs:** All contact buttons use `mailto:{userEmail}` instead of forms
- **Copyright year:** Prompt explicitly requests current year (never hardcoded 2024/2025)
- Mobile responsive with CSS media queries, no JavaScript required

### `launch-kit/generate-one-pager.tsx`
Generates single-page PDF business summary using @react-pdf/renderer:
- **Header:** Business name, tagline, location, category badge
- **Left column (58%):** About, Problem We Solve, How It Works, What Makes Us Different
- **Right column (42%):** Viability Score (prominent callout), Market Opportunity, Financial Snapshot, Pricing
- **Footer:** Location and SparkLocal watermark
- **Market Opportunity layout:** Uses vertical stacking (label above value) to prevent text overlap with long market data
- **Sentence-aware truncation:** `truncate()` cuts at sentence boundaries, falls back to comma, then word boundary
- **Category-aware colors:** Primary color from business category applied to headers, dividers, score box

### `match-resources.ts`
Dynamic resource matching for the Local Resources deep dive tab:
- **Future-proof design:** Queries distinct categories from database, automatically includes new categories
- **Query strategies per category:**
  - `local-only`: coworking, virtual-office, business-attorney, business-consultant, business-insurance, marketing-agency, commercial-real-estate (matches user's city only)
  - `local-and-nationwide`: grant, accelerator (matches city OR nationwide resources)
  - `state-level`: sba, chamber-of-commerce (matches by state)
- **Returns `MatchedResources`:**
  - `byCategory`: Record<string, MatchedResource[]> — Dynamic, all categories
  - `allCategories`: string[] — List of category slugs with matches
  - Legacy fields (`coworking`, `grants`, `accelerators`, `sba`) for backward compatibility
- **`formatResourcesForPrompt()`:** Formats matched resources as markdown for AI prompts
- **Category display config:** Each category has emoji, heading, badge colors defined in both `match-resources.ts` and `LocalResources.tsx`

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # ESLint check
npx tsc --noEmit         # TypeScript check

# Resource Directory
npm run seed:directory   # Seed/update resource listings from data files
npm run enrich:directory # Enrich listings with Perplexity API (adds descriptions, stats)

# Content Enrichment (SEO)
npx tsx scripts/enrich-content-seo.ts --mode listings --batch-size 50  # Enrich all listings
npx tsx scripts/enrich-content-seo.ts --mode cities --batch-size 50    # Enrich all cities
npx tsx scripts/enrich-content-seo.ts --mode listings --category coworking --city "new-york-ny" --dry-run  # Test specific subset

# State Business Guides
npx tsx scripts/generate-state-guides.ts --dry-run  # Test on 3 states (TX, CA, NY)
npx tsx scripts/generate-state-guides.ts            # Generate all 50 state guides
npx tsx scripts/fix-city-intros.ts --dry-run  # Preview city intro fixes (removes SparkLocal refs)
npx tsx scripts/fix-city-intros.ts            # Apply city intro fixes

# Search Engine Indexing
npx tsx scripts/submit-indexnow.ts  # Submit all URLs to Bing/Yandex via IndexNow

# Smart Expansion Engine
npx tsx scripts/smart-expand.ts --dry-run                    # Preview what would be scraped
npx tsx scripts/smart-expand.ts --max-cost=15 --max-cities=30 --category=auto  # Live run
npx tsx scripts/smart-expand.ts --category=coworking         # Expand specific category
npx tsx scripts/post-expand-pipeline.ts                      # Run enrichment + IndexNow after expansion
npx tsx scripts/post-expand-pipeline.ts --skip-enrichment    # Skip AI enrichment step
npx tsx scripts/expansion-report.ts                          # View expansion stats and coverage gaps
npx tsx scripts/expansion-report.ts --export=csv             # Export coverage gaps to CSV

# Automated Blog Engine
npx tsx scripts/blog-engine/run-all.ts                       # Full pipeline (discover → write → publish)
npx tsx scripts/blog-engine/run-all.ts --skip-discovery      # Skip keyword discovery, reuse pool
npx tsx scripts/blog-engine/run-all.ts --dry-run             # Preview without writing files
npx tsx scripts/blog-engine/discover-keywords.ts             # Discover keywords from DataForSEO
npx tsx scripts/blog-engine/select-topic.ts                  # Select best keyword from pool
npx tsx scripts/blog-engine/write-post.ts                    # Generate blog post content
npx tsx scripts/blog-engine/write-post.ts --force            # Overwrite existing post
npx tsx scripts/blog-engine/generate-images.ts               # Generate featured image
npx tsx scripts/blog-engine/publish-post.ts                  # Git commit (no push)
npx tsx scripts/blog-engine/submit-indexes.ts                # Submit to search engines
```

## Environment Variables

Required in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# SEO
INDEXNOW_API_KEY=

# Blog Engine (keyword discovery)
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
GOOGLE_SERVICE_ACCOUNT_KEY=   # For Google Indexing API
```

## Current Phase

**Phase: MVP Complete — Ready for Launch**

The core product is fully functional with payments:
- ✅ Guided builder flow (both General Business and Social Enterprise paths)
- ✅ Business category selection (10 categories)
- ✅ Conditional routing based on category
- ✅ Idea generation (calibrated to business type)
- ✅ Deep Dive V2 (6 tabs: Foundation, Checklist, Growth, Financial, Local Resources, AI Advisor)
- ✅ Deep Dive V1 (legacy support for existing projects)
- ✅ Auto-save deep dive content with proper JSON key conversion
- ✅ Launch Kit V2 with 5 professional assets (pitch deck, social graphics, landing page, one-pager, text content)
- ✅ Launch Kit regeneration UI for failed assets
- ✅ Hosted landing pages at `/sites/[slug]`
- ✅ Rate limit resilience with partial results pattern
- ✅ PDF export
- ✅ User auth & saved projects
- ✅ Resource directory with SEO (1,000+ listings across 547 cities)
- ✅ Directory redesign with light theme (premium feel)
- ✅ City hub pages for SEO (`/resources/austin-tx`)
- ✅ City search with autocomplete
- ✅ Animated stats counters
- ✅ Location sidebar with accurate local-only counts
- ✅ URL slug aliases for categories
- ✅ Matched resources in deep dive (Local Resources tab)
- ✅ AI Advisor chat with streaming responses (20 messages per project)
- ✅ Dynamic sitemap (includes city hub pages)
- ✅ Stripe payments (subscriptions + one-time purchases)
- ✅ Pricing page with 3 tiers
- ✅ Credits system with server-side verification
- ✅ Session state preservation through Stripe checkout flow
- ✅ Google Analytics (GA4)
- ✅ Schema.org structured data
- ✅ Newsletter signup
- ✅ Example deep dive page (`/builder/example`) with Austin Pour Co. showcase
- ✅ "See an example" links at key conversion points
- ✅ Business Overview component (idea summary at top of Business Foundation tab)
- ✅ Launch Checklist "validate first" structure (Weeks 1-2 test demand, Weeks 3-4 formalize)
- ✅ Viability Score calibration (rubrics, examples at 87/58/34, prevents 72-74 clustering)
- ✅ Launch Kit upsell component (appears after all 5 tabs complete, drives conversion)
- ✅ API rate limiting (prevents abuse and runaway costs)
- ✅ HTML sanitization (XSS prevention)
- ✅ Stripe webhook idempotency (prevents duplicate credit grants)
- ✅ Google Search Console verification
- ✅ Model tiering (Haiku for simple tasks, Sonnet for complex)
- ✅ Content enrichment for SEO (1,000+ listings + 547 cities with AI-generated content)
- ✅ City hub tips rendered as visual list items
- ✅ Automated Blog Engine (MWF schedule, keyword discovery, AI content, auto-publish)
- ✅ Blog featured images via Satori
- ✅ Blog cross-linking (new posts link to related, old posts updated)
- ✅ GitHub Actions workflow for fully automated blog publishing

**Future:**
- Pro Toolkit (Claude Code skills package)
- More resource data (currently 1,000+ listings across 547 cities, targeting 16,000+)
- Email notifications
- Team collaboration features
- Usage analytics dashboard

## Important Context

- The founder is a beginner technically but can follow instructions
- Budget is $200-1000/month — favor free/low-cost tools
- Side project (evenings/weekends) but moving fast
- The resource directory is a key SEO play — location pages drive organic traffic
- Deep dive "Start Here" tab shows REAL matched resources, not placeholders
- Platform now supports ANY business type, not just social enterprises

## Technical Notes

### Deep Dive V1 vs V2 Detection
- Project pages detect V1 vs V2 using `shouldUseV2Layout()` function in `/projects/[id]/page.tsx`
- **V2 is the default** for all new projects (even if no data exists yet)
- Only projects with V1 data (viability, businessPlan, marketing, roadmap) AND no V2 data use V1 layout
- V2 projects have `checklist`, `foundation`, `growth`, `financial`, or `matchedResources` data
- Both versions supported simultaneously for backward compatibility

### Claude API JSON Handling
- Claude responses use snake_case keys (e.g., `estimated_time`)
- TypeScript types use camelCase (e.g., `estimatedTime`)
- `sendMessageForJSON()` in `claude.ts` automatically converts keys
- Prompts in `src/prompts/deep-dive.ts` should specify camelCase keys in examples to help Claude

### Prompt Engineering Notes
**Launch Checklist Prompt** (`generateChecklistPrompt` in `src/prompts/deep-dive.ts`):
- Follows "validate first, formalize later" principle
- Week 1-2: Business-type-specific validation tasks (product vs service vs food vs digital)
- Week 3-4: Formalization and launch only after validation confirmed
- Includes links to validation tools (Google Forms, Carrd) and government sites (IRS, Secretary of State)
- Week 3 includes transition message: "You've confirmed there's demand — now it's time to make it official"

**Viability Score Prompt** (`generateFoundationPrompt` in `src/prompts/deep-dive.ts`):
- Explicit scoring rubrics for all 5 dimensions (Market Demand, Competition, Feasibility, Revenue, Timing)
- Calibration examples anchored in prompt: strong idea (87), mediocre (58), weak (34)
- Reasoning step: "List 2 reasons score should be LOWER and 2 reasons HIGHER before deciding"
- Prevents clustering around 72-74 by requiring genuine differentiation for high scores

### Project Save Flow
1. User enters deep dive → idea saved to `saved_ideas` table → returns `savedIdeaId`
2. Deep dive content auto-saves to `deep_dive_results` using `savedIdeaId` as `idea_id`
3. Duplicate detection checks both idea ID and name+tagline
4. When opening saved project, content passed as props to avoid regeneration

### AI Advisor
- Uses Claude Sonnet with streaming responses via Server-Sent Events (SSE)
- System prompt includes full business context: idea, profile, checklist, foundation, growth, financial, and matched resources
- Messages persisted to `advisor_messages` table for conversation continuity
- Usage tracked via `advisor_message_count` on `deep_dive_results`
- Advisor persona: practical, specific, references user's actual plan/city/budget/resources by name
- Requires `savedIdeaId` to function (user must be logged in with saved project)
- **Message Limits:**
  - One-time deep dive purchase ($14.99): 20 messages per project
  - Spark subscription ($14.99/mo): Unlimited messages on all projects
  - Ignite subscription ($29.99/mo): Unlimited messages on all projects
- Checks `user_credits.subscription_tier` and `subscription_status` before enforcing limit
- Shows "Unlimited messages" badge for active subscribers, "X of 20 messages" for others
- Friendly upgrade prompt when limit reached with CTA to pricing page

### Deep Dive State Management
`DeepDiveSectionV2.tsx` uses a ref pattern to avoid stale closures and unnecessary re-renders:
- **deepDiveDataRef:** Holds current values of `foundation`, `growth`, `financial`, `checklist`, `localResources`
- **Why:** Launch Kit callbacks need current deep dive data, but adding these states as useCallback/useEffect dependencies would cause re-renders when data changes
- **Pattern:** Ref synced via useEffect, callbacks read from `deepDiveDataRef.current`:
```typescript
const deepDiveDataRef = useRef({ foundation, growth, financial, checklist, localResources });
useEffect(() => { deepDiveDataRef.current = { foundation, growth, ... }; }, [foundation, growth, ...]);

const handleGenerateLaunchKit = useCallback(async () => {
  const currentData = deepDiveDataRef.current;  // Always fresh
  // ... use currentData
}, [/* NO deep dive states here */]);
```

### Deep Dive Data Persistence (Builder Flow)
When entering deep dive from the builder flow (vs My Projects), the component handles two scenarios:
1. **My Projects flow:** Parent fetches data from DB, passes as `initial*` props → component uses props directly
2. **Builder flow:** No initial props, component must:
   - Save the idea via `/api/user/ideas/save` → gets `savedIdeaId`
   - Auto-save generated tabs to `/api/user/deep-dive` (runs on state change)
   - **Load saved data on remount** via `loadSavedDeepDiveData` effect

The `loadSavedDeepDiveData` effect ensures data persists across page remounts (e.g., after Stripe checkout):
```typescript
useEffect(() => {
  // Runs when savedIdeaId becomes available
  // Skips if initial props were provided (My Projects flow)
  // Fetches from /api/user/deep-dive?ideaId=${savedIdeaId}
  // Populates state + marks tabs as fetched/saved
}, [savedIdeaId, initialFoundation, ...]);
```
**Key refs:**
- `hasAttemptedSaveIdea` — Prevents duplicate idea save calls
- `hasAttemptedLoadSavedData` — Prevents duplicate DB fetch calls
- `fetchedTabs` — Tracks which tabs have content (prevents duplicate API generation)
- `savedTabs` — Tracks which tabs are saved to DB (prevents duplicate saves)

### Launch Kit V2
- **API Route:** `POST /api/launch-kit/v2` generates all 5 assets in parallel; `GET` retrieves cached assets
- **Rate Limit Resilience:** Each asset generator wrapped in try/catch; returns partial results if some fail
- **Failed Assets Tracking:** Response includes `failedAssets` array; modal shows per-tab error messages with "Regenerate" button
- **Regeneration:** Pass `forceRegenerate: true` in POST body to regenerate all assets fresh (bypasses cache check)
- **Storage:** Assets uploaded to Supabase Storage bucket `launch-kit-assets/{userId}/{ideaId}/`
- **Caching:** Generated assets saved to `deep_dive_results.launch_kit_assets` JSONB column
- **Landing Page Hosting:** HTML stored in storage and served at `/sites/[slug]` route
- **Color System:** Uses `getCategoryColors()` from `launch-kit/types.ts` for category-aware styling
- **Generators:**
  - `generatePitchDeck()` — pptxgenjs, returns Buffer
  - `generateSocialGraphics()` — satori + resvg, returns array of PNG Buffers (requires `display: flex` on multi-child containers)
  - `generateLandingPage()` — Claude API, returns HTML string
  - `generateOnePager()` — @react-pdf/renderer, returns Buffer (uses vertical stacking for variable-length text)
  - `generateTextContent()` — Claude API, returns LaunchKit JSON (social posts, emails, pitch)
- **Button Gating:** Launch Kit button disabled until all 5 deep dive tabs are complete
- **mailto: Links:** Landing pages use `mailto:{userEmail}` instead of forms
- **Regeneration UI:** `LaunchKitModalV2.tsx` shows "Regenerate" button when `failedAssets` exist; `DeepDiveSectionV2.tsx` handles `handleRegenerateLaunchKit` callback

### Callback Ref Pattern (Step Components)
Step components like `Location.tsx` receive `onChange` callbacks from the parent builder page. To avoid infinite re-render loops:
- **Problem:** Parent passes inline arrow functions (`(v) => updateProfile("location", v)`) which create new references on every render
- **Solution:** Use a ref to store the latest callback, avoiding it as a useEffect dependency:
```typescript
const onChangeRef = useRef(onChange);
onChangeRef.current = onChange;

useEffect(() => {
  onChangeRef.current(value);  // Always calls latest version
}, [value]);  // onChange NOT in deps
```
This pattern is used in `Location.tsx` and should be applied to any step component that calls `onChange` inside a useEffect.

### Content Enrichment System (SEO)
The `scripts/enrich-content-seo.ts` script generates AI content for directory pages to solve thin content issues:
- **Purpose:** Pages with ~50 words need 500+ for Google indexing
- **Model:** Claude Haiku (`claude-haiku-4-5-20251001`) for cost-effective bulk generation
- **Listings enrichment:** Generates 180+ word descriptions, FAQs, meta descriptions, geo terms, nearby landmarks
- **City enrichment:** Generates intro paragraphs, numbered tips, FAQs, business climate, key industries
- **CLI flags:** `--mode` (listings|cities), `--batch-size`, `--category`, `--city`, `--force`, `--dry-run`
- **Rate limiting:** 200ms delay between API calls to avoid rate limits
- **Database:** Content stored in `enrichment_data` JSONB (listings) and `ai_*` columns (cities)
- **Neutral prompts:** City prompts no longer mention SparkLocal or specific resource counts — content is platform-agnostic

**Fix Script** (`scripts/fix-city-intros.ts`):
- Rewrites existing city intros to remove SparkLocal references
- Uses Claude Haiku to rewrite while preserving neighborhoods, industries, and other content
- Supports `--dry-run` flag to preview changes

**City Hub Page Rendering** (`CityHubContent.tsx`):
- **City Intro Card:** Styled as info card with amber brand accents
  - `bg-white/80 rounded-xl p-6 md:p-8 border-amber-100/50`
  - Amber glow shadow: `shadow-[0_4px_20px_-4px_rgba(245,158,11,0.15)]`
  - Info icon with amber-to-orange gradient (`from-amber-400 to-orange-500`)
  - Heading: "About Starting a Business in {city}" (uppercase, tracking-wide)
  - Text: `text-[15px] text-slate-600 leading-relaxed`
- **Paragraph Splitting:** Intro text split into readable paragraphs
  - First tries `\n\n` (double newlines)
  - Falls back to sentence splitting with safe regex: `/(?<=(?<![A-Z])(?<!\d)[.!?]) (?=[A-Z])/`
  - Avoids breaking on decimals ("2.32") or abbreviations ("U.S.")
  - Groups sentences into chunks of 3 per paragraph
- **City Tips:** Split on numbered pattern (`/(?=\d+\.\s)/`) and rendered as styled list items with amber number badges
- **Internal Linking:** "Browse [City] Resources by Category" section with direct links to category+location filter pages for SEO
- **Category Section Links:** Each category section always shows a "Browse →" or "View all X →" link to the filtered category page

### Example Deep Dive & Purchase Flow
- `/builder/example` shows a fully interactive example using "Austin Pour Co." (mobile cocktail bar in Austin, TX)
- All 6 tabs work with hardcoded data matching the real deep dive structure
- "See an example →" links appear in 3 conversion points:
  - **PurchaseModal**: Below purchase button ("Not sure? See a full example deep dive →")
  - **Welcome step**: After "Let's Begin" button ("Or see what a deep dive looks like →")
  - **IdeaList**: In help text section ("See an example deep dive →")
- When accessed from PurchaseModal:
  - URL includes `?from=purchase&ideaId={id}` params
  - Ideas and selected idea stored in sessionStorage (`PURCHASE_CONTEXT_KEY`)
  - Example page shows contextual CTAs: "Complete Purchase →" instead of "Generate Your Deep Dive"
  - "Complete Purchase" navigates back to `/builder?restorePurchase=true&ideaId={id}`
  - Builder page restores state from sessionStorage and navigates to deep_dive step
- When accessed from other entry points (Welcome, IdeaList, direct URL):
  - Generic CTAs pointing to `/builder`

### Automated Blog Engine
- **GitHub Action:** `.github/workflows/blog-engine.yml` runs MWF at 6 AM EST (11 AM UTC)
- **Keyword Discovery Strategy:** Only runs on Monday to save DataForSEO costs; Wed/Fri reuse existing pool
- **Scoring Formula:** `searchVolume / (difficulty + 1) * clusterBonus`
- **Cluster Weights:** funding (1.0), getting-started (1.0), location (0.8), services (0.8), industry (0.7)
- **Cannibalization Patterns:** Filters keywords matching directory pages (`coworking in [city]`) or state guides (`how to start a business in [state]`)
- **Quality Gates:** Word count (1,200-3,500), internal links (≥3), keyword occurrences (≥2), SparkLocal mentions (≤2), filler phrase blocklist
- **SparkLocal Mentions:** Prompt requires exactly 1-2 mentions; auto-replacement reduces excess (>3 → 2)
- **Internal Link Mapping:** `select-topic.ts` maps keywords to category pages, state guides, and related blog posts
- **Cross-Linking:** `publish-post.ts` updates up to 2 related posts with links to new content
- **Featured Images:** 1200x630 PNG with dark gradient, SparkLocal branding, title, and tag pills
- **Config:** `data/blog-engine/config.json` contains cluster weights, filler blocklist, keyword filters, seed keywords
- **Data Files:**
  - `keyword-pool.json` — Discovered keywords with volume, difficulty, CPC, intent
  - `selected-topic.json` — Current topic with mapped internal links
  - `last-post-faqs.json` — Extracted FAQs for schema markup

### Blog Post Infrastructure (`src/lib/blog.ts`)
- **BlogPost interface:** slug, title, description, date, author, tags, `featuredImage` (optional path), content, htmlContent
- **`getPostBySlug()`:** Reads markdown, parses frontmatter via gray-matter, converts content to HTML via remark
- **`featuredImage` field:** Parsed from frontmatter (`featured_image` or `featuredImage`); write-post.ts always adds this field
- **`extractFAQsFromContent()`:** Extracts Q&A pairs from H2 headings ending with `?` for FAQPage schema markup
- **FAQ extraction logic:** First paragraph after question heading becomes answer; skips answers <50 chars or starting with `#`

### Blog Post Page (`src/app/blog/[slug]/page.tsx`)
- **Featured images:** Always displayed; defaults to `/blog/images/{slug}-featured.png` if no frontmatter field
- **No filesystem checks:** Removed `fs.existsSync` which doesn't work on Vercel serverless environment
- **Schema markup:** Article, BreadcrumbList, and FAQPage (auto-extracted from Q&A headings)
- **OG images:** Uses featuredImage path for OpenGraph and Twitter cards
