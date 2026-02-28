# SparkLocal — Content Enrichment Spec (V2)

**Based on actual schema audit from Claude Code — February 27, 2026**

## Problem

Directory listing pages have ~50 unique words. City hub pages are pure link lists. Google requires 500+ unique words per programmatic page to index them. 1,717 pages discovered, most are thin content.

## Key Findings from Architecture Audit

1. **`enrichment_data` JSONB, `enrichment_status`, and `last_enriched_at` already exist** on `resource_listings` — no new listing columns needed
2. **`enrich-listings.ts` already exists** using Perplexity API — targets listings with `enrichment_status='raw'` AND `website IS NOT NULL`
3. **`resource_locations` has NO enrichment columns** — migration needed only for city pages
4. **Listing page already renders** `description`, `short_description`, and category-specific details from `details` JSONB
5. **City hub pages have no structured data** — needs FAQPage + BreadcrumbList schema
6. **Listing structured data exists** via `ResourceStructuredData.tsx` — category-specific schemas already in place

## Strategy

- **Listings:** Use the EXISTING `enrichment_data` JSONB column to store AI-generated descriptions, FAQs, and key details. Update `enrichment_status` to track progress. Update existing page template to render the new fields from `enrichment_data`.
- **City pages:** Add new columns to `resource_locations` via migration. Generate city-specific content. Update `CityHubContent.tsx` to render it.
- **Use Claude Haiku** instead of Perplexity (cheaper for bulk generation, no need for live web data since we're generating descriptive content, not researching facts).

---

## Part 1: Database Migration

Only `resource_locations` needs new columns. Listings already have `enrichment_data` JSONB.

```sql
-- Add enrichment columns to resource_locations (city hub pages)
ALTER TABLE resource_locations
ADD COLUMN IF NOT EXISTS ai_city_intro TEXT,
ADD COLUMN IF NOT EXISTS ai_city_faqs JSONB,
ADD COLUMN IF NOT EXISTS ai_city_tips TEXT,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'raw',
ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;
```

### Data Storage Plan

**Listings** — Store in existing `enrichment_data` JSONB column:
```json
{
  "ai_description": "150-200 word description...",
  "ai_faqs": [
    { "question": "...", "answer": "..." }
  ],
  "ai_key_details": {
    "workspace_type": "Coworking Space",
    "best_for": "Freelancers, startups",
    "neighborhood": "Midtown Manhattan"
  },
  // ... any existing Perplexity enrichment data preserved
}
```

When writing to `enrichment_data`, **merge** with existing data (don't overwrite). Some listings may already have Perplexity-sourced data in this column.

**City pages** — Store in new dedicated columns on `resource_locations`:
- `ai_city_intro` (TEXT): 200-300 words about starting a business in this city
- `ai_city_faqs` (JSONB): Array of FAQ objects
- `ai_city_tips` (TEXT): Numbered practical tips

---

## Part 2: Enrichment Script

Create `scripts/enrich-content-seo.ts` — a NEW script (don't modify the existing `enrich-listings.ts` which uses Perplexity).

### CLI Interface

```
npx tsx scripts/enrich-content-seo.ts
  --mode listings|cities|all     (what to enrich)
  --batch-size 50                (default 50)
  --category coworking|grant|accelerator|sba  (optional filter)
  --city "new-york-ny"           (optional, single city slug)
  --force                        (re-enrich already enriched items)
  --dry-run                      (preview without DB writes)
```

### Process Flow

1. Query Supabase for records to enrich:
   - **Listings mode:** `enrichment_status = 'raw'` OR records where `enrichment_data->>'ai_description'` IS NULL (unless `--force`)
   - **Cities mode:** `enrichment_status = 'raw'` OR `ai_city_intro IS NULL` (unless `--force`)
2. Process in batches of 50
3. For each record, call Claude Haiku (`claude-haiku-4-5-20251001`) with category-appropriate prompt
4. Parse JSON response
5. **Listings:** Merge AI content into existing `enrichment_data` JSONB (preserve any existing Perplexity data), update `enrichment_status` to 'enriched', set `last_enriched_at`
6. **Cities:** Write to new columns, update `enrichment_status`, set `last_enriched_at`
7. Log progress: `[42/2416] Enriched: WeWork - New York, NY`
8. 200ms delay between API calls
9. On error: log, skip record, continue batch
10. Print summary at end: X enriched, Y failed, Z skipped

### Environment Variables

Uses existing env vars (should be in `.env.local`):
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (needs service role for direct writes, not anon key)

### Model

`claude-haiku-4-5-20251001` for all enrichment calls. Structured content generation at scale — Haiku handles this well and is ~10x cheaper than Sonnet.

---

## Part 3: Prompts

### Listing: Coworking

```
You are writing SEO content for a business resource directory. Generate content for this coworking space listing. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: {name}
City: {city}, {state}
Address: {address}
Phone: {phone}
Rating: {details.rating || 'N/A'}
Hours: {details.hours || 'N/A'}
Amenities: {details.amenities || 'N/A'}
Price range: {details.price_range || 'N/A'}
Existing description: {description || short_description || 'None'}

RULES:
- Be specific to THIS listing — don't write generic coworking content
- Do NOT invent pricing, membership tiers, or amenities not listed above
- If data is limited, write based on what's available and the location
- Mention the neighborhood/area based on the address

OUTPUT FORMAT:
{
  "ai_description": "150-200 word description. What this space offers, who it's ideal for, and what makes it useful for entrepreneurs and small business owners in this area.",
  "ai_faqs": [
    { "question": "What type of workspace does [name] offer?", "answer": "2-3 sentences" },
    { "question": "Where is [name] located in [city]?", "answer": "2-3 sentences about location and access" },
    { "question": "Is [name] suitable for startup founders?", "answer": "2-3 sentences" },
    { "question": "What are the hours at [name]?", "answer": "Based on data or 'Contact directly for current hours'" }
  ],
  "ai_key_details": {
    "workspace_type": "Coworking Space",
    "best_for": "e.g., Freelancers, startups, remote teams",
    "neighborhood": "e.g., Midtown Manhattan"
  }
}
```

### Listing: Grant

```
You are writing SEO content for a business resource directory. Generate content for this grant program. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: {name}
Location: {city}, {state} (or "Nationwide" if is_nationwide)
Existing description: {description || short_description || 'None'}
Amount: {details.amount_min} - {details.amount_max}
Deadline: {details.deadline || 'N/A'}
Eligibility: {details.eligibility || 'N/A'}
Cause areas: {cause_areas.join(', ') || 'N/A'}

RULES:
- Be specific to THIS grant program
- Do NOT invent deadlines, amounts, or eligibility criteria not provided
- If data is limited, write based on the name and any existing description
- Direct readers to the official website for current details

OUTPUT FORMAT:
{
  "ai_description": "150-200 word description. Who this grant is for, what it funds, why entrepreneurs should apply.",
  "ai_faqs": [
    { "question": "Who is eligible for [name]?", "answer": "Based on available info, or direct to official website" },
    { "question": "How much funding does [name] provide?", "answer": "Use provided amounts or 'Varies by cycle'" },
    { "question": "How do I apply for [name]?", "answer": "General guidance + direct to official website" },
    { "question": "What can [name] funding be used for?", "answer": "Based on available info" }
  ],
  "ai_key_details": {
    "grant_type": "e.g., Federal, Corporate, Foundation",
    "funding_range": "e.g., Up to $50,000",
    "best_for": "e.g., Minority-owned businesses, social enterprises",
    "application_type": "e.g., Rolling, Annual, Quarterly"
  }
}
```

### Listing: Accelerator/Incubator

```
You are writing SEO content for a business resource directory. Generate content for this accelerator/incubator. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: {name}
City: {city}, {state}
Existing description: {description || short_description || 'None'}
Funding amount: {details.funding_amount || 'N/A'}
Equity: {details.equity_percent || 'N/A'}
Duration: {details.duration_weeks || 'N/A'}
Focus areas: {cause_areas.join(', ') || subcategories.join(', ') || 'N/A'}

RULES:
- Be specific to THIS program
- Do NOT invent batch sizes, equity terms, or details not provided
- If limited data, write based on name and available info

OUTPUT FORMAT:
{
  "ai_description": "150-200 word description. What the program offers, its focus, and why founders should consider it.",
  "ai_faqs": [
    { "question": "What does [name] offer startups?", "answer": "2-3 sentences" },
    { "question": "What types of startups does [name] accept?", "answer": "Based on focus areas" },
    { "question": "Does [name] provide funding?", "answer": "Use provided amount or 'Contact for details'" },
    { "question": "How do I apply to [name]?", "answer": "General guidance" }
  ],
  "ai_key_details": {
    "program_type": "Accelerator or Incubator",
    "focus": "e.g., FoodTech, Social Impact",
    "funding": "e.g., $150K or N/A",
    "best_for": "e.g., Early-stage, pre-seed founders"
  }
}
```

### Listing: SBA Resource

```
You are writing SEO content for a business resource directory. Generate content for this SBA resource center. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: {name}
City: {city}, {state}
Type: {details.sba_type || subcategories[0] || 'SBA Resource'} (SBDC, SCORE, WBC, VBOC)
Existing description: {description || short_description || 'None'}

RULES:
- Be specific to this center and its SBA program type
- Explain what SBDC/SCORE/WBC/VBOC means and its specific value
- Most SBA services are free — highlight this

OUTPUT FORMAT:
{
  "ai_description": "150-200 word description. What services this center provides, who it serves, how it helps local entrepreneurs. Explain the SBA program type.",
  "ai_faqs": [
    { "question": "What services does [name] provide?", "answer": "Based on program type" },
    { "question": "Is [name] free to use?", "answer": "Explain SBA resource cost structure" },
    { "question": "Who can use [name]?", "answer": "Eligibility" },
    { "question": "How do I get started with [name]?", "answer": "Steps to access services" }
  ],
  "ai_key_details": {
    "program_type": "e.g., SCORE Chapter, SBDC, Women's Business Center",
    "services": "e.g., Free mentoring, business plan review, workshops",
    "cost": "Free",
    "best_for": "e.g., First-time business owners, women entrepreneurs"
  }
}
```

### City Hub Page

```
You are writing SEO content for a city page on SparkLocal, a business resource directory. Generate content about starting a business in this specific city. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

CITY: {city}, {state}
POPULATION: {population || 'N/A'}
RESOURCE COUNTS:
- {coworking_count} coworking spaces
- {grant_count} grants available
- {accelerator_count} accelerators/incubators
- {sba_count} SBA resources

RULES:
- Be SPECIFIC to this city — don't write generic advice
- Mention real industries, neighborhoods, and characteristics of this city
- Reference the resource counts available on SparkLocal
- Use factual information you're confident about
- If this is a smaller/less-known city, focus on state-level context and local advantages

OUTPUT FORMAT:
{
  "ai_city_intro": "200-300 word introduction about starting a business in {city}, {state}. Cover: local economy and key industries, entrepreneurial ecosystem, cost of living relative to other cities, notable business districts or startup hubs. Mention the SparkLocal resource counts.",
  "ai_city_faqs": [
    { "question": "What do I need to start a business in {city}, {state}?", "answer": "3-4 sentences: business registration, licenses, local requirements" },
    { "question": "What industries are growing in {city}?", "answer": "Specific to this city" },
    { "question": "Are there grants for small businesses in {city}?", "answer": "Reference SparkLocal grants + general state/local programs" },
    { "question": "Where can I find coworking space in {city}?", "answer": "Reference SparkLocal listings + neighborhoods" },
    { "question": "What free business help is available in {city}?", "answer": "Reference SBA/SCORE/SBDC on SparkLocal" },
    { "question": "Is {city} a good place to start a business?", "answer": "Balanced, factual assessment" }
  ],
  "ai_city_tips": "5 numbered practical tips for entrepreneurs in {city}. Be specific — mention real neighborhoods, local programs, or unique city characteristics. Format as: 1. Tip one... 2. Tip two... etc."
}
```

---

## Part 4: Update Page Templates

### Listing Page (`src/app/resources/listing/[slug]/page.tsx`)

The page already renders `description` and category-specific details. Add rendering for the NEW fields stored in `enrichment_data`:

**1. Enhanced "About" Section**
If `enrichment_data.ai_description` exists and the existing `description` is short (< 100 chars), display `ai_description` as the main description. If both exist, show both (existing first, then AI-generated as supplementary content).

**2. Key Details**
Render `enrichment_data.ai_key_details` in the existing "Space Details" / category details section. Merge with any existing details — don't replace what's already there.

**3. FAQ Section** — NEW
Add below the contact info section, above "Similar Resources":
```tsx
{enrichment_data?.ai_faqs && enrichment_data.ai_faqs.length > 0 && (
  <section>
    <h2>Frequently Asked Questions</h2>
    {enrichment_data.ai_faqs.map((faq, i) => (
      <details key={i}>
        <summary>{faq.question}</summary>
        <p>{faq.answer}</p>
      </details>
    ))}
  </section>
)}
```

Use native HTML `<details>/<summary>` for collapsible FAQ items (no JS needed, accessible, works everywhere).

**4. FAQPage Schema**
Add a SECOND JSON-LD script tag (alongside the existing ResourceStructuredData) when FAQs exist:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "answer text"
      }
    }
  ]
}
```

### City Hub Page (`src/components/resources/CityHubContent.tsx`)

This component renders city pages. Add these sections:

**1. City Introduction** — After the hero (city name, count, category pills) and before the first category section:
```tsx
{location.ai_city_intro && (
  <section className="prose max-w-none mb-12">
    <p>{location.ai_city_intro}</p>
  </section>
)}
```

The intro should flow as clean paragraphs — no card wrapper, just text.

**2. Tips Section** — After all category listing sections, before the SparkLocal CTA:
```tsx
{location.ai_city_tips && (
  <section>
    <h2>Tips for Entrepreneurs in {city}</h2>
    <div className="prose">{location.ai_city_tips}</div>
  </section>
)}
```

**3. FAQ Section** — After tips, before the CTA:
```tsx
{location.ai_city_faqs && (
  <section>
    <h2>Starting a Business in {city} — FAQ</h2>
    {location.ai_city_faqs.map((faq, i) => (
      <details key={i}>
        <summary>{faq.question}</summary>
        <p>{faq.answer}</p>
      </details>
    ))}
  </section>
)}
```

**4. Structured Data for City Pages**
Add JSON-LD to city hub pages (currently has none):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [/* city FAQs */]
}
```

Plus BreadcrumbList:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Resources", "item": "https://sparklocal.co/resources" },
    { "@type": "ListItem", "position": 2, "name": "{City}, {State}", "item": "https://sparklocal.co/resources/{slug}" }
  ]
}
```

### BreadcrumbList on Listing Pages Too

Add to listing pages (the breadcrumb UI already exists visually — add the schema):
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Resources", "item": "https://sparklocal.co/resources" },
    { "@type": "ListItem", "position": 2, "name": "Coworking Spaces", "item": "https://sparklocal.co/resources/coworking" },
    { "@type": "ListItem", "position": 3, "name": "{City}, {State}", "item": "https://sparklocal.co/resources/{city-slug}" },
    { "@type": "ListItem", "position": 4, "name": "{Listing Name}" }
  ]
}
```

### Styling Notes

- Match existing light theme: warm cream background, serif headings (Playfair Display), sans-serif body (DM Sans)
- FAQ `<details>` elements: style the `<summary>` with a subtle border-bottom, pointer cursor, and a chevron indicator
- City intro: clean prose paragraphs, comfortable line-height, no box/card wrapper
- Tips: can use a subtle numbered list style or clean prose
- All new sections need appropriate heading hierarchy (h2)

---

## Part 5: Data Queries for Enrichment Script

### Fetch un-enriched listings

```sql
SELECT id, name, slug, description, short_description, category, 
       subcategories, cause_areas, address, city, state, phone, website,
       details, enrichment_data, enrichment_status
FROM resource_listings
WHERE is_active = true
  AND (enrichment_data->>'ai_description' IS NULL)
ORDER BY category, city
LIMIT {batch_size};
```

### Fetch un-enriched city pages

```sql
SELECT rl.*, 
  (SELECT COUNT(*) FROM resource_listings WHERE city = rl.city AND state = rl.state AND category = 'coworking' AND is_active = true) as coworking_count,
  (SELECT COUNT(*) FROM resource_listings WHERE city = rl.city AND state = rl.state AND category = 'grant' AND is_active = true) as grant_count,
  (SELECT COUNT(*) FROM resource_listings WHERE city = rl.city AND state = rl.state AND category = 'accelerator' AND is_active = true) as accelerator_count,
  (SELECT COUNT(*) FROM resource_listings WHERE city = rl.city AND state = rl.state AND category = 'sba' AND is_active = true) as sba_count
FROM resource_locations rl
WHERE rl.ai_city_intro IS NULL
ORDER BY rl.listing_count DESC;
```

### Update listing after enrichment

```sql
UPDATE resource_listings
SET 
  enrichment_data = enrichment_data || $1::jsonb,  -- MERGE, don't replace
  enrichment_status = 'enriched',
  last_enriched_at = NOW(),
  description = COALESCE(NULLIF(description, ''), $2),  -- Only set if currently empty
  updated_at = NOW()
WHERE id = $3;
```

The `||` operator merges JSONB — preserves existing Perplexity data while adding AI fields.

### Update city page after enrichment

```sql
UPDATE resource_locations
SET
  ai_city_intro = $1,
  ai_city_faqs = $2,
  ai_city_tips = $3,
  enrichment_status = 'enriched',
  last_enriched_at = NOW(),
  updated_at = NOW()
WHERE id = $4;
```

---

## Part 6: Execution Order

1. **Run the migration** (only resource_locations needs new columns)
2. **Build `scripts/enrich-content-seo.ts`** 
3. **Test on 10 listings:** `npx tsx scripts/enrich-content-seo.ts --mode listings --batch-size 10 --category coworking --city "new-york-ny"`
4. **Spot-check quality** (see quality gate below)
5. **Update page templates** to render enrichment_data fields + city enrichment columns
6. **Run full listing enrichment:** `npx tsx scripts/enrich-content-seo.ts --mode listings --batch-size 50`
7. **Run full city enrichment:** `npx tsx scripts/enrich-content-seo.ts --mode cities --batch-size 50`
8. **Deploy**
9. **Verify** several pages in production
10. **Resubmit sitemap** in Google Search Console

### Quality Gate (Between Steps 4 and 6)

Manually review 10 enriched listings:
- [ ] Description is specific to THIS listing, not generic?
- [ ] FAQs are answerable and genuinely helpful?
- [ ] Key details are accurate (nothing hallucinated)?
- [ ] Content reads naturally (not obvious AI slop)?
- [ ] Page now has 500+ unique words?
- [ ] JSON is valid and merges correctly with existing enrichment_data?

If quality is poor, adjust prompts and re-test before scaling.

---

## Cost Estimate

- ~2,400 listings × ~1,000 tokens/call = ~2.4M input + ~2.4M output tokens
- ~309 city pages × ~1,500 tokens/call = ~0.5M input + ~0.5M output tokens
- Haiku pricing: $0.80/M input, $4/M output
- **Listings:** ($0.80 × 2.4) + ($4 × 2.4) = ~$11.52
- **Cities:** ($0.80 × 0.5) + ($4 × 0.5) = ~$2.40
- **Total: ~$14 for complete enrichment of all pages**

---

## Expected Outcome

- Every listing page: 500-800 unique words (up from ~50)
- Every city hub page: 700-1,000 unique words (up from ~30)
- FAQPage schema on all enriched pages (eligible for Google rich results / People Also Ask)
- BreadcrumbList schema on all directory pages
- Existing Perplexity enrichment data preserved (merged, not overwritten)
- Total cost: ~$14
- Timeline: Script build (~2-3 hours), test run (~15 min), full enrichment (~30-45 min), template updates (~1-2 hours)
