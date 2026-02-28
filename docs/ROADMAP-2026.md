# SparkLocal — Product Roadmap Q1-Q3 2026

**Last updated:** February 26, 2026

---

## Overview

Three workstreams running in sequence. Each one unblocks the next.

1. **Harden** — Security fixes and infrastructure (Week 1)
2. **Optimize** — Cost reduction and performance (Week 2-3)
3. **Grow** — SEO, content enrichment, and traffic acquisition (Weeks 4-16)

---

## Phase 1: Harden (Week 1)

**Goal:** Make the app safe to scale. No feature changes — purely defensive.

### Sprint 1A: Security Fixes
| Task | Risk Level | Effort |
|------|-----------|--------|
| Sanitize all `dangerouslySetInnerHTML` with DOMPurify | Critical | 1-2 hrs |
| Add Supabase-backed API rate limiting (serverless-safe) | Critical | 2-3 hrs |
| Add Stripe webhook idempotency (deduplicate events) | Critical | 1 hr |

### Sprint 1B: Infrastructure for Cost Optimization
| Task | Risk Level | Effort |
|------|-----------|--------|
| Add model parameter to Claude API wrapper (default = current model) | Zero risk | 1 hr |
| Do NOT switch any calls yet — infrastructure only | — | — |

### Verification
- Full user flow test: idea generation → deep dive → Launch Kit → AI Advisor
- Landing pages render with all styling intact
- No console errors

---

## Phase 2: Optimize (Weeks 2-3)

**Goal:** Reduce per-user API cost by 40-60% so traffic growth doesn't blow up the bill.

### Sprint 2A: Model Tiering (Test and Switch)

Test each call individually. Generate output on both Sonnet and Haiku, compare quality, only switch if Haiku output is acceptable.

**Switch to Haiku (claude-haiku-4-5-20251001) — lower complexity tasks:**

| API Call | Why Haiku Works | Test Method |
|----------|----------------|-------------|
| Resource matching descriptions | Short, factual text matching resources to ideas | Generate 5 matches on both models, compare relevance |
| Growth Plan social post captions | Short-form copywriting, formulaic structure | Generate posts for 3 different businesses, compare quality |
| Launch Kit text content (email templates, elevator pitch) | Template-driven, shorter outputs | Generate for 2 businesses, compare usefulness |
| Meta description generation (for SEO enrichment) | Very short, formulaic | Generate 10, compare keyword inclusion and readability |
| Data formatting / JSON restructuring | Non-creative, structural | Verify JSON output matches expected schema |

**Keep on Sonnet — high complexity, user-facing quality matters:**

| API Call | Why Sonnet Required |
|----------|-------------------|
| Business Foundation (viability scoring) | Complex multi-factor analysis with calibrated rubrics |
| Launch Checklist generation | Context-heavy, needs to understand business type for validation tasks |
| Growth Plan (full marketing strategy) | Long-form, strategic, needs creativity |
| Financial Model | Numerical reasoning, projections, cost analysis |
| AI Advisor conversations | Full context reasoning, conversational quality is the product |
| Idea generation | Creativity and differentiation are critical |
| Launch Kit landing page HTML | Design quality, inline CSS, full page generation |
| Launch Kit pitch deck content | Strategic narrative, investor-facing quality |

**Process for each switch:**
1. Generate 3 outputs using current model (Sonnet)
2. Generate 3 outputs using Haiku with the same inputs
3. Compare side by side — is the Haiku output good enough?
4. If yes, switch that call. If no, keep on Sonnet.
5. Monitor for 1 week after switching — any user complaints or quality drops, revert.

**Expected savings:** 30-40% reduction in Claude API costs

### Sprint 2B: Research Cache

| Task | Effort | Savings |
|------|--------|---------|
| Create `research_cache` table in Supabase | 30 min | — |
| Cache Perplexity research results with 7-day TTL | 2 hrs | 20-30% research API costs |
| Cache key = hash of (business category + city + state) | — | — |
| Similar idea in the same city → serve cached research | — | — |
| Add cache invalidation after 7 days | 30 min | — |

### Sprint 2C: Database Performance

| Task | Effort | Impact |
|------|--------|--------|
| Add index: `deep_dive_results(user_id, created_at DESC)` | 10 min | Faster project listing |
| Add index: `user_credits(user_id, subscription_status)` | 10 min | Faster subscription checks |
| Add index: `advisor_messages(project_id, created_at)` | 10 min | Faster chat loading |
| Parallelize sequential queries in projects route | 1 hr | 30-40% faster |
| Parallelize sequential queries in advisor route | 1 hr | 30-40% faster |

### Sprint 2D: Token Right-Sizing

Only reduce where we can verify typical response lengths. Leave all deep dive and core generation calls untouched.

| Call | Action |
|------|--------|
| Deep dive tabs (all 5) | DO NOT REDUCE |
| AI Advisor | DO NOT REDUCE |
| Idea generation | DO NOT REDUCE |
| Launch Kit generation | DO NOT REDUCE |
| Resource matching | Review and reduce if over-allocated (with 2x buffer) |
| Any utility/formatting calls | Review and reduce if over-allocated (with 2x buffer) |

### Phase 2 Cost Impact Summary

| Optimization | Estimated Savings |
|-------------|-------------------|
| Model tiering (Haiku for qualifying calls) | 30-40% Claude costs |
| Research cache | 20-30% Perplexity costs |
| Token right-sizing | 10-15% on switched calls |
| **Combined** | **40-55% total API cost reduction** |

**At current usage (~$100/month):** Saves $40-55/month
**At 10x traffic (~$1,000/month):** Saves $400-550/month
**At 50x traffic (~$5,000/month):** Saves $2,000-2,750/month

---

## Phase 3: Grow — SEO & Directory (Weeks 4-16)

**Goal:** Thousands of monthly organic visitors by Summer 2026.

Full strategy documented in `docs/SEO-GROWTH-STRATEGY.md`. Summary below.

### Sprint 3A: Audit & Foundation (Week 4)
- Verify Google Search Console setup and indexing status
- Run technical SEO audit on all directory pages
- Set up LowFruits for keyword research ($29/month)
- Implement IndexNow protocol for Bing/Yandex
- Expand schema markup: FAQPage, BreadcrumbList on all directory pages
- Fix any technical issues (duplicate titles, missing meta descriptions, broken canonical tags)

### Sprint 3B: Content Enrichment (Weeks 5-7)
- Build Claude API enrichment script for listing pages (use Haiku — this is one of the cost savings)
- Enrich all 2,400+ listings with descriptions, FAQs, key details
- Enrich all 275 city hub pages with introductory content and local business info
- Enhance category landing pages with guide content (500-1000 words each)
- Add FAQ sections to all page types (enables FAQPage schema)

**Quality gate:** Spot-check 5-10% of enriched content. Regenerate anything generic or inaccurate.

### Sprint 3C: Scale Page Count (Weeks 7-10)
- Expand listings from 2,400 to 10,000+ (Outscraper + Grants.gov + SCORE chapters)
- Create 50 "How to Start a Business in [State]" guide pages
- Implement comprehensive internal linking across all templates
- Launch blog with initial 4-6 posts targeting identified keyword opportunities
- Add new resource categories (legal clinics, chambers of commerce, pitch competitions)

### Sprint 3D: Indexing Push (Weeks 8-10)
- Set up Google Indexing API automation
- Set up Indexly for bulk indexing monitoring ($19/month)
- Bulk submit all pages in batches (200-500 at a time, monitor between batches)
- Split sitemap into multiple files if over 5,000 URLs

### Sprint 3E: GEO — AI Search Optimization (Weeks 10-12)
- Add "Last updated" timestamps to all directory pages
- Write headings as conversational questions ("What coworking spaces are in Austin?")
- Ensure all content is fact-dense with specific, verifiable data
- Add Dataset schema to directory overview pages
- Publish original data (resource counts per city, category breakdowns)
- Consistent entity clarity for SparkLocal brand across all pages

### Sprint 3F: Ongoing Growth (Weeks 12-16+)
- Publish 2-4 blog posts per month targeting keyword opportunities
- Monthly technical audit (Screaming Frog)
- Monthly content refresh (update stale listings, expired grants, closed resources)
- Review GSC data weekly — double down on what's ranking
- Quarterly data refresh — re-scrape and verify listing data
- Track directory-to-builder conversion rate

### SEO Traffic Targets

| Month | Target Organic Visitors | Key Milestone |
|-------|------------------------|---------------|
| Month 1 (April) | 100-300 | Pages indexed, initial rankings |
| Month 2 (May) | 300-800 | Content enrichment complete, blog live |
| Month 3 (June) | 800-2,000 | 10K+ pages indexed, long-tail rankings |
| Month 4 (July) | 2,000-3,500 | Blog traffic compounding, state guides ranking |
| Month 5 (August) | 3,500-5,000+ | GEO traffic from AI search, multiple ranking pages |

---

## Monthly Tool Costs After Full Implementation

| Tool | Purpose | Monthly Cost |
|------|---------|-------------|
| Claude API | AI generation (after optimization) | $50-80 (down from $100-150) |
| Perplexity API | Market research (after caching) | $15-25 (down from $30-50) |
| LowFruits | Keyword research | $29 |
| Indexly | Bulk indexing automation | $19 |
| Supabase | Database (free tier) | $0 |
| Vercel | Hosting (free tier) | $0 |
| Google Search Console | SEO monitoring | $0 |
| Google Analytics | Traffic analysis | $0 |
| **Total** | | **~$115-155/month** |

---

## Completed ✅

### Product Upgrades (February 2026)
- [x] Deep dive tab persistence fix (builder flow state management)
- [x] Launch Checklist restructured (validate first, formalize later)
- [x] Viability Score calibration (rubrics, calibration examples, prevents 72-74 clustering)
- [x] Launch Kit upsell component (appears after all 5 tabs complete)
- [x] Checklist link rendering fix (labels and URLs restored)

---

## Parked — Future Upgrades

See `docs/FUTURE-UPGRADES.md` for full backlog:
- Dynamic week generation (subscription-gated, post-Week 4 checklist tasks)
- Business name rename + content propagation
- Logo generation tool
- Firecrawl MCP integration
- Landing page editor
- Custom domain support
- Grant application draft generator
- Share/collaboration features
- Export to Google Docs
