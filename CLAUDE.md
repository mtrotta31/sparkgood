# CLAUDE.md — SparkLocal Project Instructions

## Project Overview

SparkLocal is a **dual-product platform** that helps aspiring entrepreneurs turn their business ideas into reality:

1. **SparkLocal Web App** — A guided web experience that takes users from "I want to start something" to a complete launch package (ideas, market research, business plan, marketing assets, action roadmap). Works for any business type — from food trucks to tech startups to social enterprises. Powered by AI tools running behind the scenes (Perplexity, Claude) so users never touch a terminal.

2. **SparkLocal Resource Directory** — A comprehensive, SEO-optimized directory of grants, accelerators, SBA resources, and coworking spaces (2,400+ listings across 275 cities) that helps entrepreneurs find real-world support matched to their idea and location.

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
- **Deep Dive** — Premium 4-tab experience:
  - **"Will This Work?"** — Viability analysis with scoring breakdown, competitors, market research
  - **"Your Game Plan"** — Complete business/project plan with financials
  - **"Spread the Word"** — Marketing assets (pitch, social posts, email templates)
  - **"Start Here"** — Action roadmap with quick wins, phases, and matched real-world resources
- **Launch Kit** — One-click generation of landing page HTML, social posts, email sequence
- **PDF Export** — Download complete plan as professional PDF
- **My Projects** (`/projects`) — Dashboard to view and continue saved projects
- **Individual Project Pages** (`/projects/[id]`) — View saved deep dive results

### Resource Directory (Fully Functional)
- **Main Directory** (`/resources`) — Homepage with hero, city search, animated stats, top cities grid, category cards
- **Category Pages** (`/resources/[category]`) — List all resources with filters, location sidebar with accurate local counts
- **City Hub Pages** (`/resources/[city-slug]`) — SEO-optimized city pages (e.g., `/resources/austin-tx`) showing all resources grouped by category
- **Location Pages** (`/resources/[category]/[location]`) — Category + location pages (e.g., "Grants in Austin, TX")
- **Listing Pages** (`/resources/listing/[slug]`) — Individual resource details with structured data
- **URL Slug Aliases** — Supports common variations (`/resources/grants` → `/resources/grant`, etc.)
- **Resource Matching API** — Matches resources to user's idea based on category, location, business type
- **Dynamic Sitemap** — Auto-generated sitemap for 16,000+ pages (includes city hub pages)
- **Light Theme** — Directory uses warm cream/white theme (separate from dark builder theme)
- **Stats:** 2,400+ listings across 275 cities

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
- **One-Time Purchases** — Deep Dive ($4.99), Launch Kit ($2.99)
- **Payment Gates** — Server-side verification on `/api/deep-dive`, client-side gates on project pages
- **Purchase Modals** — In-app purchase flow with Stripe Checkout redirect

### Analytics & SEO
- **Google Analytics (GA4)** — User tracking and conversion events
- **Schema.org Structured Data** — Organization, LocalBusiness, WebSite schemas
- **Newsletter Capture** — Email signup for updates

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
- `POST /api/launch-kit` — Generate complete launch kit
- `POST /api/build-asset` — Build specific assets (pitch deck, landing page, etc.)
- `POST /api/export-pdf` — Generate downloadable PDF

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

## Database Schema

### Core Tables
- `user_profiles` — User preferences (business_category, venture_type, format, location, causes, target_customer, business_model_preference, key_skills, etc.)
- `saved_ideas` — Generated ideas linked to profiles
- `deep_dive_results` — Viability, plan, marketing, roadmap content

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
  - `enrichment_data`: JSONB with additional info from Perplexity
  - `details`: JSONB with category-specific data (amounts, deadlines, etc.)
- `resource_locations` — Cities with listing counts
- `resource_category_locations` — Category counts per location
- `resource_saves` — User saved resources

### Newsletter
- `newsletter_subscribers` — Email signups

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
- Deep Dive: $4.99 per idea
- Launch Kit: $2.99 per idea (requires Deep Dive first)

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
- `results/` — Idea cards, result displays
- `deep-dive/` — Deep dive section components
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

## File Structure

```
sparklocal/
├── CLAUDE.md                    # This file
├── src/
│   ├── app/
│   │   ├── api/                 # All API routes
│   │   │   ├── generate-ideas/
│   │   │   ├── deep-dive/
│   │   │   ├── launch-kit/
│   │   │   ├── stripe/          # Checkout & webhook
│   │   │   ├── resources/
│   │   │   ├── user/            # Profile, ideas, credits
│   │   │   └── ...
│   │   ├── builder/             # Main builder flow
│   │   ├── pricing/             # Pricing page
│   │   ├── projects/            # User projects
│   │   ├── resources/           # Resource directory (light theme via layout.tsx)
│   │   │   ├── layout.tsx       # Light theme wrapper
│   │   │   ├── page.tsx         # Main directory homepage
│   │   │   ├── [category]/      # Category OR city hub pages
│   │   │   │   ├── page.tsx     # Handles both category and city-slug routes
│   │   │   │   └── [location]/  # Category + location pages
│   │   │   └── listing/[slug]/  # Individual listing pages
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
│   │   └── PurchaseModal.tsx    # Stripe checkout modal
│   ├── contexts/                # React contexts (Auth)
│   ├── hooks/                   # Custom hooks (useCredits, useUserData)
│   ├── lib/
│   │   ├── constants.ts         # BUSINESS_CATEGORIES, BUSINESS_MODELS, etc.
│   │   ├── sessionState.ts      # Session persistence with migration
│   │   ├── supabase.ts          # Supabase client
│   │   ├── stripe.ts            # Stripe utilities
│   │   ├── format-amount.ts     # Currency formatting ($5M, $25K, etc.)
│   │   ├── format-description.ts # Clean up listing descriptions
│   │   ├── formatHours.ts       # Parse hours JSONB to readable format
│   │   └── ...
│   ├── prompts/                 # AI prompt templates
│   │   ├── idea-generation.ts   # Supports both business paths
│   │   ├── deep-dive.ts         # Supports both business paths
│   │   └── ...
│   └── types/                   # TypeScript types
├── scripts/
│   ├── seed-directory.ts        # Seeds resource listings from data files
│   ├── enrich-listings.ts       # Enriches listings via Perplexity API
│   ├── sync-locations.ts        # Syncs location pages for SEO
│   └── ...                      # Data files
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_resource_directory.sql
│       ├── 20240220_create_user_credits.sql
│       ├── 20240221_create_newsletter_subscribers.sql
│       └── 20240222_add_business_category_fields.sql  # Business category support
└── public/                      # Static assets
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

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # ESLint check
npx tsc --noEmit         # TypeScript check

# Resource Directory
npm run seed:directory   # Seed/update resource listings from data files
npm run enrich:directory # Enrich listings with Perplexity API (adds descriptions, stats)
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
```

## Current Phase

**Phase: MVP Complete — Ready for Launch**

The core product is fully functional with payments:
- ✅ Guided builder flow (both General Business and Social Enterprise paths)
- ✅ Business category selection (10 categories)
- ✅ Conditional routing based on category
- ✅ Idea generation (calibrated to business type)
- ✅ Deep dive (all 4 tabs) with payment gates
- ✅ Launch kit generation with payment gates
- ✅ PDF export
- ✅ User auth & saved projects
- ✅ Resource directory with SEO (2,400+ listings)
- ✅ Directory redesign with light theme (premium feel)
- ✅ City hub pages for SEO (`/resources/austin-tx`)
- ✅ City search with autocomplete
- ✅ Animated stats counters
- ✅ Location sidebar with accurate local-only counts
- ✅ URL slug aliases for categories
- ✅ Matched resources in deep dive
- ✅ Dynamic sitemap (includes city hub pages)
- ✅ Stripe payments (subscriptions + one-time purchases)
- ✅ Pricing page with 3 tiers
- ✅ Credits system with server-side verification
- ✅ Session state preservation through Stripe checkout flow
- ✅ Google Analytics (GA4)
- ✅ Schema.org structured data
- ✅ Newsletter signup

**Future:**
- Pro Toolkit (Claude Code skills package)
- More resource data (currently 2,400+ listings, targeting 16,000+)
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
