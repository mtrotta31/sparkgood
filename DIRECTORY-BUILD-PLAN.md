# SparkGood Resource Directory — Build Plan

## The Vision

A comprehensive directory of business resources — funding, accelerators, coworking, event spaces, grants, mentorship programs, and tools — that serves two purposes:

1. **Public directory (sparkgood.io/resources/)** — Free, searchable, SEO-optimized. Captures entrepreneurs at every stage searching for business resources. Funnels them into SparkGood.

2. **Deep Dive integration** — When a SparkGood user gets their launch plan, the "Start Here" tab doesn't just say "find an accelerator." It says "Here are 3 accelerators that match your idea, location, and budget" with real listings from our own database.

**One database. Two products. Traffic that compounds.**

---

## Resource Categories

### Tier 1 — Launch First (Highest Search Volume + Easiest Data)

| Category | Example Searches | Data Source | Est. Listings |
|----------|-----------------|-------------|---------------|
| **Small Business Grants** | "small business grants 2026", "grants for women entrepreneurs" | SBA, Grants.gov, state programs | 2,000-5,000 |
| **Startup Accelerators** | "startup accelerators near me", "social impact accelerators" | F6S, Crunchbase, direct scraping | 1,000-2,000 |
| **Coworking Spaces** | "coworking space Austin", "affordable coworking NYC" | Google Maps (Outscraper), Coworker.com | 10,000-20,000 |
| **SBA Resources** | "SBDC near me", "SCORE mentors" | SBA.gov (public data) | 1,800+ |

### Tier 2 — Add After Launch

| Category | Example Searches | Data Source | Est. Listings |
|----------|-----------------|-------------|---------------|
| **Event Spaces** | "event space for workshop", "venue for networking event" | Google Maps, Peerspace | 15,000+ |
| **Business Incubators** | "business incubator programs", "nonprofit incubator" | Direct scraping, InBIA | 1,500+ |
| **Pitch Competitions** | "startup pitch competitions 2026" | F6S, startup calendars | 500-1,000 |
| **Nonprofit Formation Services** | "how to form a 501c3", "nonprofit attorney near me" | Google Maps, legal directories | 5,000+ |

### Tier 3 — Growth Phase

| Category | Example Searches | Data Source |
|----------|-----------------|-------------|
| **Impact Investors** | "impact investors social enterprise" | Crunchbase, GIIN |
| **Grant Writers** | "grant writer for nonprofits" | Google Maps, Upwork |
| **Business Attorneys** | "startup attorney", "nonprofit lawyer" | Google Maps |
| **Accountants / CPAs** | "CPA for small business", "nonprofit accountant" | Google Maps |
| **Marketing Agencies** | "marketing agency for nonprofits" | Google Maps |
| **Business Banking** | "best bank for startups", "nonprofit banking" | Direct research |
| **Insurance** | "business insurance for startups" | Direct research |
| **Mentorship Programs** | "entrepreneur mentorship", "startup mentor" | SCORE, MicroMentor |

---

## Data Architecture

### Database Schema (Supabase)

```sql
-- Core listings table
CREATE TABLE resource_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT, -- 1-2 sentence summary
  
  -- Categorization
  category TEXT NOT NULL, -- 'grant', 'accelerator', 'coworking', 'event_space', etc.
  subcategories TEXT[], -- ['women-owned', 'tech', 'social-impact']
  cause_areas TEXT[], -- Maps to SparkGood's 12 cause areas
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL,
  longitude DECIMAL,
  is_remote BOOLEAN DEFAULT false,
  is_nationwide BOOLEAN DEFAULT false,
  service_areas TEXT[], -- Cities/states served
  
  -- Contact
  website TEXT,
  email TEXT,
  phone TEXT,
  
  -- Details (varies by category)
  details JSONB, -- Flexible field for category-specific data
  /*
    Grants: { amount_min, amount_max, deadline, eligibility, application_url }
    Accelerators: { duration, equity_taken, funding_provided, batch_size, next_deadline }
    Coworking: { price_monthly_min, price_monthly_max, amenities[], hours }
    Event spaces: { capacity, price_hourly, amenities[], availability }
    SBA resources: { type, services[], languages[] }
  */
  
  -- Enrichment
  enrichment_status TEXT DEFAULT 'raw', -- 'raw', 'enriched', 'verified'
  enrichment_data JSONB, -- Data from Crawl4AI
  last_enriched_at TIMESTAMPTZ,
  
  -- Media
  logo_url TEXT,
  images TEXT[],
  
  -- Metadata
  source TEXT, -- Where we got this data
  source_id TEXT, -- Original ID from source
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location pages for SEO
CREATE TABLE resource_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'austin-tx', 'new-york-ny'
  latitude DECIMAL,
  longitude DECIMAL,
  population INTEGER,
  listing_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category + Location cross reference for programmatic SEO
CREATE TABLE resource_category_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  location_id UUID REFERENCES resource_locations(id),
  listing_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(category, location_id)
);

-- User interactions
CREATE TABLE resource_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  listing_id UUID REFERENCES resource_listings(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- For deep dive integration — matches between user ideas and resources
CREATE TABLE resource_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID, -- References saved_ideas
  listing_id UUID REFERENCES resource_listings(id),
  match_reason TEXT, -- Why this resource matches
  match_score DECIMAL, -- 0-1 relevance score
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_category ON resource_listings(category);
CREATE INDEX idx_listings_city_state ON resource_listings(city, state);
CREATE INDEX idx_listings_cause_areas ON resource_listings USING GIN(cause_areas);
CREATE INDEX idx_listings_is_active ON resource_listings(is_active);
CREATE INDEX idx_listings_slug ON resource_listings(slug);
CREATE INDEX idx_locations_slug ON resource_locations(slug);
```

### Data Fields by Category

**Grants:**
- Amount range (min/max)
- Deadline
- Eligibility criteria
- Application URL
- Grant type (federal, state, private, corporate)
- Tags: women-owned, minority-owned, veteran, social-impact, tech, rural

**Accelerators:**
- Duration (weeks)
- Equity taken (%)
- Funding provided ($)
- Batch size
- Next application deadline
- Focus areas
- Notable alumni
- Remote vs in-person

**Coworking Spaces:**
- Monthly price range
- Day pass price
- Amenities (wifi, meeting rooms, printing, mail, kitchen, parking)
- Hours
- Capacity
- Private offices available (y/n)
- Photos

**Event Spaces:**
- Capacity
- Hourly/daily rate
- Amenities (AV, wifi, catering, parking)
- Availability
- Space types (classroom, theater, boardroom, outdoor)

**SBA Resources (SBDC, SCORE, WBC):**
- Type (SBDC, SCORE, WBC, VBOC)
- Services offered
- Languages
- Free vs paid

---

## URL Structure (Programmatic SEO)

```
sparkgood.io/resources/                                    → Directory home
sparkgood.io/resources/grants/                             → All grants
sparkgood.io/resources/grants/texas/                       → Grants in Texas
sparkgood.io/resources/grants/austin-tx/                   → Grants in Austin
sparkgood.io/resources/grants/women-entrepreneurs/         → Grants for women
sparkgood.io/resources/accelerators/                       → All accelerators
sparkgood.io/resources/accelerators/social-impact/         → Social impact accelerators
sparkgood.io/resources/accelerators/new-york-ny/           → Accelerators in NYC
sparkgood.io/resources/coworking/                          → All coworking
sparkgood.io/resources/coworking/austin-tx/                → Coworking in Austin
sparkgood.io/resources/sba/                                → SBA resources
sparkgood.io/resources/sba/sbdc/texas/                     → SBDCs in Texas
sparkgood.io/resources/[slug]                              → Individual listing page
```

**Page count estimate (Tier 1 launch):**
- 4 category home pages
- 4 categories × 200 cities = 800 location pages
- 15,000+ individual listing pages
- **~16,000 indexable pages at launch**

Each page targets a specific long-tail keyword. This is the Frey playbook applied to SparkGood.

---

## Deep Dive Integration

### How It Works

When a user generates their "Start Here" action roadmap, the system:

1. Takes the user's idea, cause area, location, budget, and commitment level
2. Queries the resource_listings table for matches
3. Injects real, relevant resources into the roadmap

### Example Output

**Before (current — generic advice):**
```
Week 1: Research local accelerators that support social enterprises
Week 2: Apply for relevant grants
Week 3: Find a coworking space to work from
```

**After (with directory integration):**
```
Week 1: Apply to These Accelerators
  → Impact Hub Austin — Social impact focus, 12-week program, no equity
    Apply by March 15 | impacthub.net/austin
  → Techstars Social Impact — Remote, $120K funding, 6% equity
    Apply by April 1 | techstars.com/social-impact
  [Build This For Me: Application essay draft]

Week 2: Apply for These Grants
  → Texas Enterprise Fund — Up to $50K for TX-based social enterprises
    Deadline: Rolling | gov.texas.gov/business
  → Amber Grant — $10K monthly grant for women entrepreneurs
    Deadline: End of each month | ambergrantsforwomen.com
  [Build This For Me: Grant application draft]

Week 3: Set Up Your Workspace
  → Capital Factory — Austin, $300/mo, social impact community
  → WeWork Austin — $250/mo, meeting rooms included
  → SCORE Austin — FREE mentorship, weekly office hours
```

**This is the moment SparkGood becomes indispensable.** Generic advice is ignorable. Real resources with real links and real deadlines are actionable.

### Matching Logic

```typescript
async function matchResources(idea: Idea, profile: UserProfile) {
  const matches = await supabase
    .from('resource_listings')
    .select('*')
    .eq('is_active', true)
    .or(`city.eq.${profile.location},is_nationwide.eq.true,is_remote.eq.true`)
    .contains('cause_areas', idea.causes)
    .order('enrichment_status', { ascending: false }) // Prefer enriched listings
    .limit(20);
  
  // Score and rank by relevance
  const scored = matches.map(listing => ({
    ...listing,
    score: calculateMatchScore(listing, idea, profile)
  }));
  
  // Return top matches by category
  return {
    grants: scored.filter(l => l.category === 'grant').slice(0, 3),
    accelerators: scored.filter(l => l.category === 'accelerator').slice(0, 3),
    coworking: scored.filter(l => l.category === 'coworking').slice(0, 3),
    sba: scored.filter(l => l.category === 'sba').slice(0, 2),
  };
}
```

---

## Build Plan

### Phase 1 — Data Collection & MVP (Week 1-2)

**Week 1: Scrape and Clean**

Day 1-2: Set up data pipeline
- Install Crawl4AI locally
- Set up Outscraper account
- Create Supabase tables (migration SQL above)

Day 3-4: Scrape Tier 1 data
- SBA resources (SBDC, SCORE, WBC) — public API/data at sba.gov
- Outscraper: "coworking space" for top 100 US cities
- Outscraper: "startup accelerator" + "business incubator" for top 50 cities
- Grants.gov API for federal grants
- Manual research: top 50 state-level grant programs

Day 5-7: Clean with Cloud Code
- Same process as Frey: bulk clean in passes
- Pass 1: Remove junk (no name, no address, duplicates, permanently closed)
- Pass 2: Categorize (is this actually an accelerator or just a consulting firm?)
- Pass 3: Normalize data (consistent formatting, city/state)

**Week 2: Build Directory UI**

Day 1-2: Directory pages
- /resources/ home page — search bar, category cards, featured listings
- /resources/[category]/ — filtered list with sidebar filters
- /resources/[category]/[city-state]/ — location-specific pages
- /resources/[slug] — individual listing page

Day 3-4: Search and filtering
- Search by keyword, category, location
- Filters: category, price range, remote/in-person, cause area
- Sort: relevance, rating, distance, newest

Day 5: SEO optimization
- Generate programmatic title tags and meta descriptions
- Internal linking between related pages
- Sitemap generation
- Schema.org structured data (LocalBusiness, Organization)

Day 6-7: CTA integration
- Every listing page: "Planning a venture? SparkGood helps you go from idea to launch plan"
- Category pages: "Looking for [grants/accelerators/coworking]? Let SparkGood match you with the best resources for your specific idea"
- Sticky banner on directory pages

### Phase 2 — Enrichment (Week 3)

- Crawl4AI pass on all listings with websites
- Extract: detailed description, programs, pricing, images, social media
- Claude API pass: categorize by SparkGood's cause areas
- Claude API pass: generate short_description for listings that don't have one
- Quality scoring: mark listings as 'enriched' or 'verified'
- Add images where available

### Phase 3 — Deep Dive Integration (Week 4)

- Add location question to SparkGood questionnaire (city, state)
- Build matchResources() function
- Update deep dive prompts to include matched resources
- Update "Start Here" tab to show real resource cards with links
- "Build This For Me" generates grant applications, accelerator essays using real listing data

### Phase 4 — Growth (Ongoing)

- Add Tier 2 categories (event spaces, incubators, pitch competitions)
- User submissions ("Add a resource")
- User reviews/ratings
- Featured listings (monetization)
- Email alerts ("New grants in your area")
- Expand to more cities
- Monthly data refresh pipeline

---

## Cost Estimate

| Item | Cost | Notes |
|------|------|-------|
| Outscraper | $50-100 | Coworking + accelerator scrapes |
| Cloud Code (Max) | $200/mo | Already subscribed |
| Claude API | $30-50 | Data categorization and enrichment |
| Supabase | Free tier | Handles this easily |
| Crawl4AI | Free | Open source |
| Vercel | Free tier | Already deployed |
| **Total** | **~$280-350** | One-time data collection cost |

---

## Success Metrics

### Month 1
- 15,000+ listings live
- 16,000+ indexed pages
- Directory functional and searchable
- Deep Dive integration working

### Month 3
- 5,000+ monthly organic visitors to directory
- 50+ conversions from directory to SparkGood builder
- Top 10 rankings for 20+ long-tail keywords

### Month 6
- 20,000+ monthly organic visitors
- 200+ SparkGood conversions from directory
- Featured listing revenue ($50-200/listing/month)
- Data enrichment at 80%+ coverage

### Month 12
- 50,000+ monthly organic visitors
- SparkGood's primary traffic source
- Tier 2 and Tier 3 categories live
- Recognized as go-to resource for entrepreneurs

---

## Competitive Advantage

**Why this wins:**

1. **No one has this specific combination** — business resources × social impact filter × AI-powered matching × venture planning tool

2. **The directory feeds the product** — unlike standalone directories, every visitor is a potential SparkGood user

3. **The product feeds the directory** — SparkGood users save resources, submit new ones, leave reviews. Network effects.

4. **Data compounds** — every Crawl4AI pass makes listings richer. User contributions add data. The directory gets better over time.

5. **SEO moat builds over time** — 16,000 pages of quality content is hard to replicate. First mover advantage in "social impact business resources" as a category.

6. **Dual monetization** — directory revenue (featured listings, leads) PLUS SparkGood conversion (deep dive subscriptions)
