# SparkLocal Codebase Audit — February 2026

Comprehensive audit covering API routes, React components, database patterns, security, and AI integrations.

---

## Executive Summary

The codebase is **well-structured and production-ready** with solid foundations (authentication, RLS, payment integration). However, there are **3 critical security issues** and **multiple efficiency opportunities** that could reduce costs by 40-60% and improve performance.

### Priority Matrix

| Priority | Category | Issue Count | Estimated Impact |
|----------|----------|-------------|------------------|
| 🔴 Critical | Security | 3 | Must fix before scaling |
| 🟡 High | Performance/Cost | 8 | 40-60% cost reduction possible |
| 🟢 Medium | Code Quality | 12 | Maintainability + DX |
| ⚪ Low | Polish | 8 | Nice to have |

---

## 🔴 CRITICAL — Fix Immediately

### 1. XSS Vulnerability in Generated Content
**Files:**
- `src/app/sites/[slug]/page.tsx` (line 110)
- `src/components/results/AIAdvisor.tsx` (lines 201-211)
- `src/components/results/LaunchChecklist.tsx` (lines 165-171)

**Issue:** `dangerouslySetInnerHTML` renders Claude-generated HTML without sanitization.

**Risk:** If Claude is manipulated or content is compromised, malicious JavaScript could execute.

**Fix:**
```bash
npm install dompurify @types/dompurify
```
```typescript
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

**Effort:** 1-2 hours

---

### 2. Missing Rate Limiting on Expensive Operations
**Files:** All generation routes (`/api/generate-ideas`, `/api/deep-dive`, `/api/launch-kit/v2`, `/api/chat-advisor`)

**Issue:** No per-user rate limiting. A single user could exhaust API quotas or spike costs by $1000s.

**Fix:** Add rate limiting middleware (Upstash Redis recommended for Vercel):
```typescript
const RATE_LIMITS = {
  'generate-ideas': { max: 30, window: 3600 },  // 30 per hour
  'deep-dive': { max: 10, window: 3600 },
  'launch-kit': { max: 5, window: 3600 },
};
```

**Effort:** 2-3 hours

---

### 3. Stripe Webhook Idempotency Missing
**File:** `src/app/api/stripe/webhook/route.ts`

**Issue:** No check if webhook was already processed. Duplicate webhooks = duplicate credits.

**Fix:** Add idempotency check using Stripe event ID:
```typescript
const { data: exists } = await supabase
  .from("stripe_webhook_log")
  .select("id")
  .eq("stripe_event_id", event.id);

if (exists?.length) return NextResponse.json({ received: true });
```

**Effort:** 1 hour

---

## 🟡 HIGH PRIORITY — Performance & Cost

### 4. Use Tiered Model Selection (40-60% cost savings)
**File:** `src/lib/claude.ts`

**Issue:** Using Claude Sonnet for everything. Many tasks (resource matching, simple formatting) could use Haiku.

**Recommendation:**
- **Haiku:** Resource matching, text formatting, social post generation
- **Sonnet:** Idea generation, viability analysis, business planning

**Effort:** 3-4 hours | **Savings:** 40-60% on LLM costs

---

### 5. Persistent Research Cache
**File:** `src/app/api/deep-dive/route.ts`

**Issue:** In-memory cache lost on every Vercel deployment. Perplexity/Firecrawl called repeatedly for similar ideas.

**Fix:** Cache research in Supabase with 7-day TTL:
```sql
CREATE TABLE research_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Effort:** 2-3 hours | **Savings:** 20-30% on research API calls

---

### 6. Parallelize Sequential Database Queries
**Files:**
- `src/app/api/user/projects/route.ts` (3 sequential queries → 2 parallel)
- `src/app/api/chat-advisor/route.ts` (4 sequential queries → 2 parallel)

**Issue:** Independent queries run sequentially, adding 100-200ms latency.

**Fix:** Use `Promise.all()` for independent fetches.

**Effort:** 1-2 hours | **Impact:** 30-40% faster page loads

---

### 7. Reduce Token Allocations
**Files:** All API routes with `maxTokens`

**Current vs Recommended:**
| Section | Current | Recommended |
|---------|---------|-------------|
| Foundation | 8000 | 5000 |
| Plan | 6000 | 4000 |
| Launch Kit Text | 6000 | 3500 |
| Ideas | 4096 | 3000 |

**Effort:** 30 minutes | **Savings:** 15-25% on tokens

---

### 8. Add Missing Database Indexes
**File:** New migration needed

```sql
-- Deep Dive Results (speeds up project listing)
CREATE INDEX idx_deep_dive_results_user_created
ON deep_dive_results(user_id, created_at DESC);

-- User Credits (speeds up subscription checks)
CREATE INDEX idx_user_credits_subscription
ON user_credits(user_id, subscription_status);

-- Advisor Messages (speeds up chat loading)
CREATE INDEX idx_advisor_messages_project_created
ON advisor_messages(project_id, created_at);
```

**Effort:** 30 minutes | **Impact:** Faster queries at scale

---

### 9. Add CORS and CSP Headers
**File:** `src/middleware.ts`

**Issue:** No CORS or Content Security Policy headers. Vulnerable to CSRF.

**Fix:** Add security headers in middleware:
```typescript
response.headers.set('Content-Security-Policy',
  "default-src 'self'; script-src 'self' *.google-analytics.com; ..."
);
```

**Effort:** 1 hour

---

## 🟢 MEDIUM PRIORITY — Code Quality

### 10. Split Large Components
**Files:**
- `DeepDiveSectionV2.tsx` (1,286 lines) → 5-7 smaller components
- `LaunchKitModalV2.tsx` (717 lines) → Asset-type components

**Issue:** Difficult to maintain, test, and understand.

**Effort:** 4-6 hours

---

### 11. Extract Duplicate CopyButton Component
**Files:** 5 different implementations across codebase

**Fix:** Create unified `useCopyToClipboard` hook and single `CopyButton` component.

**Effort:** 1 hour | **Impact:** Removes ~150 lines of duplication

---

### 12. Add Accessibility (ARIA Labels)
**Issue:** Icon buttons missing `aria-label`, tabs missing `role="tab"`, modals missing focus trap.

**Files:** `DeepDiveSectionV2.tsx`, `LaunchKitModalV2.tsx`, `PurchaseModal.tsx`

**Effort:** 2-3 hours

---

### 13. Add Input Validation (Zod)
**Files:** All API routes

**Issue:** Minimal validation on request bodies. String lengths unchecked.

**Fix:**
```typescript
import { z } from 'zod';
const schema = z.object({
  idea: z.object({ name: z.string().max(100), tagline: z.string().max(200) }),
  section: z.enum(['checklist', 'foundation', 'growth', 'financial', 'resources']),
});
```

**Effort:** 3-4 hours

---

### 14. Add Error Boundaries
**Issue:** No React error boundaries. API failures break entire sections.

**Fix:** Wrap major sections with error boundary components.

**Effort:** 1-2 hours

---

### 15. Consolidate Subscription Logic
**Files:** Logic duplicated in webhook, credits route, deep-dive route, launch-kit route

**Fix:** Move to `src/lib/stripe.ts`:
```typescript
export function getCreditsForTier(tier: SubscriptionTier, type: 'deepDive' | 'launchKit') {...}
```

**Effort:** 1 hour

---

### 16. Improve Error Handling Consistency
**Issue:** Some routes return generic 500 errors, others have specific error types.

**Fix:** Standardize error responses with error codes.

**Effort:** 2-3 hours

---

## ⚪ LOW PRIORITY — Polish

### 17. Add Response Caching for Identical Inputs
Cache Claude responses for identical idea+profile combinations. 10-20% savings.

### 18. Add Streaming to Deep Dive Generation
Currently only chat-advisor streams. Adding streaming to deep dive improves perceived performance.

### 19. Implement Exponential Backoff for Rate Limits
Current: Single 10s retry. Better: 2s → 5s → 10s with jitter.

### 20. Add Audit Logging
Track sensitive operations (credit consumption, project deletion, payment failures).

### 21. Environment Variable Validation at Boot
Fail fast instead of failing at runtime when env vars missing.

### 22. Extract LoadingSpinner and ErrorMessage Components
4+ duplicate implementations across codebase.

### 23. Add useMemo/useCallback for Performance
Missing memoization causes unnecessary re-renders in large components.

### 24. Color Contrast Audit
Some text colors (`text-red-400`, `text-yellow-400`) may not meet WCAG AA contrast.

---

## Implementation Roadmap

### Phase 1: Security (Week 1) — 6-8 hours
- [ ] Fix XSS with DOMPurify
- [ ] Add rate limiting
- [ ] Add webhook idempotency
- [ ] Add CORS/CSP headers

### Phase 2: Cost Optimization (Week 2) — 8-10 hours
- [ ] Implement model tiering (Haiku for simple tasks)
- [ ] Add persistent research cache
- [ ] Reduce token allocations
- [ ] Add database indexes

### Phase 3: Performance (Week 3) — 6-8 hours
- [ ] Parallelize database queries
- [ ] Add input validation (Zod)
- [ ] Improve error handling consistency

### Phase 4: Code Quality (Week 4+) — 10-15 hours
- [ ] Split large components
- [ ] Extract duplicate components
- [ ] Add accessibility improvements
- [ ] Add error boundaries

---

## Cost Savings Summary

| Optimization | Estimated Savings |
|--------------|-------------------|
| Model tiering (Haiku) | 40-60% LLM costs |
| Persistent research cache | 20-30% API calls |
| Token allocation reduction | 15-25% tokens |
| Response caching | 10-20% API calls |
| **Combined** | **50-70% reduction** |

At current usage, this could mean **$50-150/month savings** scaling to **$500-1500/month** at 10x traffic.

---

## Files Most Needing Attention

| File | Lines | Issues |
|------|-------|--------|
| `src/components/deep-dive/DeepDiveSectionV2.tsx` | 1,286 | Size, any types, missing memoization |
| `src/components/deep-dive/LaunchKitModalV2.tsx` | 717 | Size, duplicate code |
| `src/app/api/deep-dive/route.ts` | 800+ | Cache, parallelization |
| `src/app/api/chat-advisor/route.ts` | 700+ | Sequential queries, formatting duplication |
| `src/app/api/stripe/webhook/route.ts` | 300+ | Idempotency, error handling |
