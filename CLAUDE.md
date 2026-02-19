# CLAUDE.md — SparkGood Project Instructions

## Project Overview

SparkGood is a **dual-product platform** that helps people turn their desire to make a difference into real-world action:

1. **SparkGood Web App** — A guided web experience that takes users from "I want to do something good" to a complete launch package (ideas, market research, business plan, marketing assets, action roadmap). Powered by AI tools running behind the scenes (Perplexity, Claude) so users never touch a terminal.

2. **SparkGood Resource Directory** — A comprehensive, SEO-optimized directory of grants, accelerators, SBA resources, and coworking spaces that helps entrepreneurs find real-world support matched to their idea and location.

3. **SparkGood Pro Toolkit** (Future) — A downloadable package of pre-configured Claude Code skills for advanced users who want to run the same powerful frameworks in their own environment.

**Brand name:** SparkGood
**Domain:** sparkgood.io
**Tagline:** "Spark something good."
**Mission:** Remove the barriers between good intentions and real impact.

## What's Been Built (Current State)

### Core Web App (Fully Functional)
- **Guided Builder Flow** (`/builder`) — Multi-step questionnaire capturing venture type, format, location, causes, experience, budget, commitment level
- **Idea Generation** — AI generates 4 tailored social impact concepts based on user profile
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
- **Main Directory** (`/resources`) — Browse by category with search
- **Category Pages** (`/resources/[category]`) — List all resources in a category with filters
- **Location Pages** (`/resources/[category]/[location]`) — SEO-optimized local pages (e.g., "Grants in Austin, TX")
- **Listing Pages** (`/resources/listing/[slug]`) — Individual resource details
- **Resource Matching API** — Matches resources to user's idea based on cause areas, location, venture type
- **Dynamic Sitemap** — Auto-generated sitemap for 16,000+ pages

### Authentication & User Data
- **Supabase Auth** — Email/password authentication with magic links
- **User Profiles** — Save intake preferences
- **Saved Ideas** — Persist generated ideas and deep dive results
- **Auto-save** — Deep dive results save automatically when logged in

### Payments & Credits (Fully Functional)
- **Stripe Integration** — Checkout sessions, webhooks, subscription management
- **Pricing Page** (`/pricing`) — Three tiers: Free, Spark ($14.99/mo), Ignite ($29.99/mo)
- **Credits System** — Subscription credits + one-time purchases
- **One-Time Purchases** — Deep Dive ($4.99), Launch Kit ($2.99)
- **Payment Gates** — Server-side verification on `/api/deep-dive`, client-side gates on project pages
- **Purchase Modals** — In-app purchase flow with Stripe Checkout redirect

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
- `POST /api/generate-ideas` — Generate 4 ideas from user profile
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

## Database Schema

### Core Tables
- `profiles` — User preferences (venture_type, format, location, causes, etc.)
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

### Colors
- **Spark (Primary):** `#F59E0B` (amber)
- **Accent:** `#F97316` (orange)
- **Charcoal Dark:** `#1C1412` (background)
- **Charcoal:** `#2A2220` (cards)
- **Warmwhite:** `#FBF7F4` (text)

### Typography
- **Display:** Playfair Display (serif)
- **Body:** DM Sans (sans-serif)

### Components
Located in `src/components/`:
- `ui/` — Reusable primitives (FadeIn, Header, etc.)
- `steps/` — Builder flow step components
- `results/` — Idea cards, result displays
- `deep-dive/` — Deep dive section components
- `resources/` — Resource directory components
- `auth/` — Authentication modals

## File Structure

```
sparkgood/
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
│   │   ├── resources/           # Resource directory
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots.txt
│   ├── components/
│   │   ├── ui/                  # Shared UI components
│   │   ├── steps/               # Builder step components
│   │   ├── deep-dive/           # Deep dive & launch kit components
│   │   ├── resources/           # Directory components
│   │   ├── auth/                # Auth components
│   │   └── PurchaseModal.tsx    # Stripe checkout modal
│   ├── contexts/                # React contexts (Auth)
│   ├── hooks/                   # Custom hooks (useCredits, useUserData)
│   ├── lib/                     # Utilities (Supabase, Stripe, etc.)
│   ├── prompts/                 # AI prompt templates
│   └── types/                   # TypeScript types
├── scripts/
│   ├── seed-directory.ts        # Seeds resource listings from data files
│   ├── enrich-listings.ts       # Enriches listings via Perplexity API
│   ├── sba-resources-data.ts    # VBOCs, SCORE chapters data
│   ├── grants-data.ts           # Grant programs data
│   └── accelerators-data.ts     # Accelerator programs data
├── supabase/
│   └── migrations/              # Database migrations
└── public/                      # Static assets
```

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
```

## Current Phase

**Phase: MVP Complete — Ready for Launch**

The core product is fully functional with payments:
- ✅ Guided builder flow
- ✅ Idea generation
- ✅ Deep dive (all 4 tabs) with payment gates
- ✅ Launch kit generation with payment gates
- ✅ PDF export
- ✅ User auth & saved projects
- ✅ Resource directory with SEO
- ✅ Matched resources in deep dive
- ✅ Dynamic sitemap
- ✅ Stripe payments (subscriptions + one-time purchases)
- ✅ Pricing page with 3 tiers
- ✅ Credits system with server-side verification
- ✅ Session state preservation through Stripe checkout flow

**In Progress:**
- Resource directory enrichment (216 listings loaded, enrichment script ready)

**Future:**
- Pro Toolkit (Claude Code skills package)
- More resource data (currently 216 listings, targeting 16,000+)
- Email notifications
- Team collaboration features
- Usage analytics dashboard

## Important Context

- The founder is a beginner technically but can follow instructions
- Budget is $200-1000/month — favor free/low-cost tools
- Side project (evenings/weekends) but moving fast
- The resource directory is a key SEO play — location pages drive organic traffic
- Deep dive "Start Here" tab now shows REAL matched resources, not placeholders
