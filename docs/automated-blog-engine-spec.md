# SparkLocal Automated Blog Engine — Build Spec

## Overview

A fully automated pipeline that discovers low-competition keywords, writes SEO-optimized blog posts with real directory data, generates featured images, publishes to the site, and submits to search engines — on a MWF schedule via GitHub Actions.

**Estimated cost:** ~$20-25/month for 12 posts/month
**Tech stack:** DataForSEO API, Claude Haiku API, Satori (image generation), GitHub Actions, IndexNow + Google Indexing API

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (MWF)                      │
│                                                             │
│  1. DISCOVER    ──→  DataForSEO API                        │
│     keywords         (keyword suggestions + SERP analysis)  │
│                                                             │
│  2. SELECT      ──→  Score & filter keywords                │
│     best topic       (volume, difficulty, no cannibalization)│
│                                                             │
│  3. WRITE       ──→  Claude Haiku API                      │
│     blog post        (with directory data context)          │
│                                                             │
│  4. GENERATE    ──→  Satori                                │
│     images           (featured image + data graphics)       │
│                                                             │
│  5. PUBLISH     ──→  Git commit + push                     │
│     to site          (Vercel auto-deploys)                  │
│                                                             │
│  6. INDEX       ──→  IndexNow + Google Indexing API        │
│     submission       (instant ping to search engines)       │
│                                                             │
│  7. MONITOR     ──→  Google Search Console API (weekly)     │
│     performance      (feed rankings back into step 2)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Keyword Discovery

### Script: `scripts/blog-engine/discover-keywords.ts`

**Data source:** DataForSEO Labs API — Keyword Suggestions endpoint

**Seed keywords** (rotate through these, one per run):
```typescript
const SEED_KEYWORDS = [
  // Funding cluster
  "small business grants",
  "startup funding",
  "SBA loans",
  "business grants for women",
  "business grants for veterans",
  "business grants for minorities",
  "SBIR grants",
  
  // Getting started cluster
  "how to start a business",
  "business plan template",
  "LLC formation",
  "business license",
  "startup costs",
  "business structure",
  
  // Location cluster
  "best cities to start a business",
  "coworking space",
  "startup accelerator",
  "business incubator",
  
  // Services cluster
  "small business attorney",
  "business accountant",
  "business insurance",
  "marketing agency small business",
  "chamber of commerce",
  "virtual office",
  "business consultant",
  
  // Industry cluster
  "food truck business",
  "ecommerce business",
  "freelance business",
  "consulting business",
  "cleaning business",
  "landscaping business",
  "online business ideas"
];
```

**API call:**
```typescript
// DataForSEO Keyword Suggestions endpoint
// Cost: $0.10 per task + $0.0001 per keyword returned
const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([{
    keyword: seedKeyword,
    location_code: 2840, // United States
    language_code: "en",
    include_serp_info: true,
    include_seed_keyword: true,
    limit: 100, // Get top 100 suggestions
    filters: [
      ["keyword_info.search_volume", ">", 100],      // Minimum 100 monthly searches
      ["keyword_info.search_volume", "<", 10000],     // Not too competitive
      ["keyword_info.keyword_difficulty", "<", 40]     // Low difficulty
    ],
    order_by: ["keyword_info.search_volume,desc"]
  }])
});
```

**Output:** Save discovered keywords to `data/blog-engine/keyword-pool.json`:
```json
{
  "lastUpdated": "2026-03-01T00:00:00Z",
  "keywords": [
    {
      "keyword": "small business grants for veterans in texas",
      "searchVolume": 480,
      "difficulty": 18,
      "cpc": 2.30,
      "intent": "informational",
      "discoveredFrom": "small business grants",
      "discoveredAt": "2026-03-01"
    }
  ]
}
```

**Cost per run:** ~$0.12 (1 task + ~100 results)
**Monthly cost for keyword discovery:** ~$1.50 (12 runs)

---

## Step 2: Topic Selection

### Script: `scripts/blog-engine/select-topic.ts`

**Selection algorithm:**

```typescript
function selectBestTopic(keywordPool: Keyword[], existingPosts: string[], existingPages: string[]): SelectedTopic {
  
  // 1. Filter out already-written topics
  const unused = keywordPool.filter(kw => {
    // Check exact match against existing blog post slugs
    const slug = slugify(kw.keyword);
    if (existingPosts.includes(slug)) return false;
    
    // Check for semantic overlap (simple: shared 3+ word phrases)
    for (const post of existingPosts) {
      if (semanticOverlap(kw.keyword, post) > 0.6) return false;
    }
    return true;
  });
  
  // 2. Check for cannibalization against programmatic pages
  //    Blog should target INFORMATIONAL intent
  //    Programmatic pages own NAVIGATIONAL/TRANSACTIONAL intent
  const safe = unused.filter(kw => {
    // Don't write "coworking spaces in Austin TX" — that's a directory page
    if (matchesDirectoryPattern(kw.keyword)) return false;
    // Don't write "how to start a business in Texas" — that's a state guide
    if (matchesStateGuidePattern(kw.keyword)) return false;
    return true;
  });
  
  // 3. Score remaining keywords
  //    Score = searchVolume / (difficulty + 1) * clusterBonus
  const scored = safe.map(kw => ({
    ...kw,
    score: (kw.searchVolume / (kw.difficulty + 1)) * getClusterBonus(kw, existingPosts)
  }));
  
  // clusterBonus: favor keywords in clusters where we have few posts
  // If we have 5 funding posts and 0 location posts, location gets 2x bonus
  
  // 4. Return top keyword
  return scored.sort((a, b) => b.score - a.score)[0];
}
```

**Cannibalization patterns to avoid:**
```typescript
const DIRECTORY_PATTERNS = [
  /^(coworking|grants?|accelerator|sba|attorney|accountant|insurance|marketing|chamber|virtual office|commercial real estate|consultant)s?\s+(in|near)\s+/i,
  /^(best|top|find)\s+(coworking|grants?|accelerators?)\s+(in|near)\s+/i,
];

const STATE_GUIDE_PATTERNS = [
  /^how to start a business in [a-z]+$/i,
  /^start(ing)? a business in [a-z]+$/i,
];
```

**Map topic to internal links:**
```typescript
function mapInternalLinks(keyword: string, directoryStats: DirectoryStats): InternalLinks {
  // Based on keyword cluster, pick relevant directory links
  const links: InternalLinks = {
    categoryPages: [],   // e.g., /resources/grant
    cityPages: [],       // e.g., /resources/coworking/austin-tx
    stateGuides: [],     // e.g., /resources/start-business/texas
    otherBlogPosts: [],  // e.g., /blog/how-to-get-a-small-business-grant
    builderCTA: '/builder'
  };
  
  // Keyword contains "grant" → link to /resources/grant + relevant state guides
  // Keyword contains "coworking" → link to /resources/coworking + top city pages
  // Keyword contains a state name → link to state guide + city pages in that state
  // etc.
  
  return links;
}
```

**Output:** `data/blog-engine/selected-topic.json`

---

## Step 3: Content Generation

### Script: `scripts/blog-engine/write-post.ts`

**Context injection:** Before calling Claude, query the database for real directory stats:

```typescript
async function getDirectoryContext(): Promise<string> {
  const stats = await supabase.rpc('get_directory_stats');
  // Returns: { totalListings: 3866, totalCities: 547, categories: {...}, topCities: [...] }
  
  return `
SPARKLOCAL DIRECTORY DATA (use these real numbers in the post):
- Total listings: ${stats.totalListings}
- Total cities: ${stats.totalCities}
- Grants: ${stats.categories.grant} listings
- Coworking spaces: ${stats.categories.coworking} listings
- Accelerators: ${stats.categories.accelerator} listings
- SBA resources: ${stats.categories.sba} listings
- Business attorneys: ${stats.categories['business-attorney']} listings
- Accountants: ${stats.categories.accountant} listings
- Marketing agencies: ${stats.categories['marketing-agency']} listings
- Business insurance: ${stats.categories['business-insurance']} listings
- Chambers of commerce: ${stats.categories['chamber-of-commerce']} listings
- Virtual offices: ${stats.categories['virtual-office']} listings
- Commercial real estate: ${stats.categories['commercial-real-estate']} listings
- Business consultants: ${stats.categories['business-consultant']} listings
- State guides: 50 states
- Top cities by resource count: ${stats.topCities.map(c => `${c.name} (${c.count})`).join(', ')}
  `.trim();
}
```

**Claude Haiku prompt:**

```typescript
const systemPrompt = `You are a blog writer for SparkLocal (sparklocal.co), a business resource directory that helps entrepreneurs find local resources to start and grow their businesses.

WRITING STYLE:
- Write for entrepreneurs who are just getting started. Practical, specific, actionable.
- Tone: Like a knowledgeable friend — helpful, direct, no fluff. Not corporate, not overly casual.
- Every paragraph should provide specific, actionable information. No filler.
- Use real data points, real program names, real numbers where relevant.
- DO NOT use phrases like "In today's fast-paced world" or "Whether you're a seasoned entrepreneur or just starting out" or any generic AI filler.

STRUCTURE:
- Open with a compelling first paragraph that gets to the point immediately. No throat-clearing.
- Use 5-7 H2 subheadings structured as questions or action phrases (optimized for featured snippets and People Also Ask).
- Include 2-3 H3 subheadings under longer sections.
- Paragraphs should be 2-4 sentences. Keep it scannable.
- End with a "Next Steps" H2 section containing 3-4 actionable bullet points with links.

SEO REQUIREMENTS:
- Target keyword should appear in: first paragraph, at least 2 H2 headings, and 2-3 times naturally in body text.
- Include semantic variations of the target keyword throughout.
- Write a compelling meta description (150-160 chars) that includes the target keyword and a value proposition.

SPARKLOCAL MENTIONS:
- Mention SparkLocal by name NO MORE THAN TWICE in the body text.
- When you do mention it, reference real directory data (e.g., "SparkLocal's directory lists 170+ grants across all 50 states").
- DO NOT be promotional. Let the internal links do the selling.

INTERNAL LINKS:
- Include provided internal links naturally within the text using markdown link syntax.
- Every post must link to /builder at least once (the AI business planner).
- Link to 2-3 directory category pages.
- Link to 1-2 city hub pages or state guides if relevant.
- Link to 1-2 related blog posts if provided.

OUTPUT FORMAT:
Return ONLY the markdown content with frontmatter. No explanation, no preamble.

Frontmatter format:
---
title: "Post Title"
slug: "post-slug"
description: "Meta description (150-160 chars)"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2", "tag3"]
author: "SparkLocal"
---`;

const userPrompt = `Write a blog post targeting the keyword: "${selectedTopic.keyword}"

Search volume: ${selectedTopic.searchVolume}/month
Word count: ${selectedTopic.searchVolume > 1000 ? '2,000-2,500' : '1,500-2,000'} words

${directoryContext}

INTERNAL LINKS TO INCLUDE:
${selectedTopic.internalLinks.categoryPages.map(l => `- ${l.url} (${l.label})`).join('\n')}
${selectedTopic.internalLinks.stateGuides.map(l => `- ${l.url} (${l.label})`).join('\n')}
${selectedTopic.internalLinks.otherBlogPosts.map(l => `- ${l.url} (${l.label})`).join('\n')}
- /builder (AI Business Planner — CTA)

RELATED BLOG POSTS FOR CROSS-LINKING:
${relatedPosts.map(p => `- /blog/${p.slug} ("${p.title}")`).join('\n')}

Write the post now.`;
```

**Post-processing:**
```typescript
function processPost(markdown: string, topic: SelectedTopic): ProcessedPost {
  // 1. Validate frontmatter exists and is correct
  // 2. Verify internal links are present (at least 3)
  // 3. Verify word count is in range
  // 4. Verify target keyword appears 3+ times
  // 5. Add FAQ schema data by parsing Q&A-style H2s
  // 6. Generate cross-links to related older posts
  
  return {
    markdown,
    slug: topic.slug,
    faqItems: extractFAQs(markdown), // For FAQPage schema
    internalLinkCount: countInternalLinks(markdown),
    wordCount: countWords(markdown),
    keywordDensity: calculateDensity(markdown, topic.keyword)
  };
}
```

**Quality gates (auto-reject and retry if):**
- Word count < 1,200 or > 3,500
- Fewer than 3 internal links
- Target keyword appears 0 times
- Contains obvious AI filler phrases (maintain a blocklist)
- No H2 headings found
- SparkLocal mentioned more than 3 times

**Cost per post:** ~$0.50-1.00 (Claude Haiku, ~3K input tokens + ~3K output tokens)

---

## Step 4: Image Generation

### Script: `scripts/blog-engine/generate-images.ts`

**Featured image** (required for every post):

Use Satori (already in the project for Launch Kit graphics) to generate a branded blog post header image.

```typescript
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

async function generateFeaturedImage(title: string, tags: string[]): Promise<Buffer> {
  const svg = await satori(
    // React-like JSX for the image layout
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'Inter',
        },
        children: [
          // SparkLocal logo/wordmark at top
          {
            type: 'div',
            props: {
              style: { color: '#f59e0b', fontSize: 24, marginBottom: 20 },
              children: '● SparkLocal'
            }
          },
          // Post title
          {
            type: 'div',
            props: {
              style: { 
                color: '#ffffff', 
                fontSize: title.length > 60 ? 40 : 48,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 30
              },
              children: title
            }
          },
          // Tags
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 10 },
              children: tags.slice(0, 3).map(tag => ({
                type: 'div',
                props: {
                  style: {
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: 16
                  },
                  children: tag
                }
              }))
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [/* load Inter font */]
    }
  );
  
  const resvg = new Resvg(svg);
  return resvg.render().asPng();
}
```

**Save to:** `public/blog/images/{slug}-featured.png`

**OG image path:** The blog post template should reference this as the og:image.

**Optional: Data graphics** (for posts with comparison data):
- Generate simple bar charts or comparison tables as PNG images using satori
- Only when the post topic naturally calls for it (startup costs by business type, funding comparison, etc.)

---

## Step 5: Publish

### Script: `scripts/blog-engine/publish-post.ts`

```typescript
async function publishPost(post: ProcessedPost, featuredImage: Buffer): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  
  // 1. Write markdown file
  const mdPath = `content/blog/${post.slug}.md`;
  fs.writeFileSync(mdPath, post.markdown);
  
  // 2. Write featured image
  const imgPath = `public/blog/images/${post.slug}-featured.png`;
  fs.mkdirSync(path.dirname(imgPath), { recursive: true });
  fs.writeFileSync(imgPath, featuredImage);
  
  // 3. Update blog post registry (if one exists)
  // This depends on how the existing blog system discovers posts
  
  // 4. Update cross-links in older posts
  await updateCrossLinks(post);
  
  // 5. Git commit and push
  execSync(`git add content/blog/${post.slug}.md public/blog/images/${post.slug}-featured.png`);
  execSync(`git commit -m "blog: ${post.slug} [automated]"`);
  execSync(`git push origin main`);
  
  // Vercel auto-deploys from main branch
}
```

**Cross-linking older posts:**
```typescript
async function updateCrossLinks(newPost: ProcessedPost): Promise<void> {
  // Find the 2-3 most related existing posts (by shared tags/cluster)
  const relatedPosts = findRelatedPosts(newPost.tags, existingPosts);
  
  for (const related of relatedPosts) {
    const content = fs.readFileSync(`content/blog/${related.slug}.md`, 'utf-8');
    
    // Check if it already links to the new post
    if (content.includes(newPost.slug)) continue;
    
    // Add a "Related Reading" link before the "Next Steps" section
    // Only if the post doesn't already have 3+ cross-links
    const crossLinkCount = (content.match(/\/blog\//g) || []).length;
    if (crossLinkCount >= 3) continue;
    
    // Insert link
    const updatedContent = insertCrossLink(content, newPost);
    fs.writeFileSync(`content/blog/${related.slug}.md`, updatedContent);
    execSync(`git add content/blog/${related.slug}.md`);
  }
}
```

---

## Step 6: Index Submission

### Script: `scripts/blog-engine/submit-indexes.ts`

```typescript
async function submitToSearchEngines(postUrl: string): Promise<void> {
  const fullUrl = `https://sparklocal.co/blog/${post.slug}`;
  
  // 1. IndexNow (Bing/Yandex) — instant
  await submitIndexNow([fullUrl]);
  
  // 2. Google Indexing API — uses daily quota
  await submitGoogleIndexing([fullUrl]);
  
  console.log(`Submitted ${fullUrl} to search engines`);
}
```

Reuse existing `scripts/submit-indexnow.ts` and `scripts/submit-google-indexing.ts` logic.

---

## Step 7: Performance Monitoring

### Script: `scripts/blog-engine/monitor-performance.ts`
### Schedule: Weekly (Sundays)

```typescript
async function monitorBlogPerformance(): Promise<void> {
  // 1. Pull Google Search Console data via API
  //    - Impressions, clicks, CTR, average position for each blog post
  //    - Which keywords each post is showing up for
  
  // 2. Save to data/blog-engine/performance.json
  const performance = {
    lastChecked: new Date().toISOString(),
    posts: [
      {
        slug: "how-to-get-a-small-business-grant",
        impressions: 1240,
        clicks: 45,
        ctr: 3.6,
        avgPosition: 18.2,
        topKeywords: [
          { keyword: "how to get a business grant", impressions: 320, clicks: 15, position: 12 },
          { keyword: "small business grant application", impressions: 180, clicks: 8, position: 22 }
        ]
      }
    ]
  };
  
  // 3. Feed back into keyword selection
  //    - Posts ranking 5-15 → create supporting content to boost them to page 1
  //    - Posts ranking 1-5 → leave alone, focus elsewhere
  //    - Posts with 0 impressions after 30 days → flag for review
  //    - Keywords appearing in GSC that we don't have posts for → add to keyword pool
  
  // 4. Generate weekly digest (save as markdown or send via email)
  const digest = generateWeeklyDigest(performance);
  fs.writeFileSync('data/blog-engine/weekly-digest.md', digest);
}
```

---

## GitHub Actions Workflow

### `.github/workflows/blog-engine.yml`

```yaml
name: Automated Blog Engine

on:
  schedule:
    # MWF at 6 AM EST (11 AM UTC)
    - cron: '0 11 * * 1,3,5'
  workflow_dispatch: # Manual trigger for testing

jobs:
  publish-blog-post:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    env:
      DATAFORSEO_LOGIN: ${{ secrets.DATAFORSEO_LOGIN }}
      DATAFORSEO_PASSWORD: ${{ secrets.DATAFORSEO_PASSWORD }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
      GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
    
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_PAT }} # PAT with push access
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Discover keywords
        run: npx tsx scripts/blog-engine/discover-keywords.ts
      
      - name: Select topic
        run: npx tsx scripts/blog-engine/select-topic.ts
      
      - name: Write blog post
        run: npx tsx scripts/blog-engine/write-post.ts
      
      - name: Generate images
        run: npx tsx scripts/blog-engine/generate-images.ts
      
      - name: Publish and push
        run: |
          git config user.name "SparkLocal Bot"
          git config user.email "bot@sparklocal.co"
          npx tsx scripts/blog-engine/publish-post.ts
      
      - name: Submit to search engines
        run: npx tsx scripts/blog-engine/submit-indexes.ts

  weekly-monitoring:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 11 * * 0' # Sundays only
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Monitor performance
        run: npx tsx scripts/blog-engine/monitor-performance.ts
        env:
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
```

---

## Blog Post Template Updates

### Update `src/app/blog/[slug]/page.tsx`:

1. **Add featured image support:**
   - Read `featured_image` from frontmatter (defaults to `/blog/images/{slug}-featured.png`)
   - Display as hero image at top of post
   - Use as og:image in metadata

2. **Add FAQPage schema:**
   - Parse Q&A-style H2 headings from the markdown
   - Generate FAQPage JSON-LD alongside existing Article schema

3. **Add BreadcrumbList schema:**
   - Home → Blog → Post Title

4. **Add "Related Posts" section at bottom:**
   - Show 2-3 related posts based on shared tags
   - Renders as clickable cards

5. **Add "Last Updated" display:**
   - Show both published date and last modified date
   - dateModified in Article schema

---

## Configuration File

### `data/blog-engine/config.json`

```json
{
  "frequency": "MWF",
  "maxPostsPerWeek": 3,
  "minWordCount": 1200,
  "maxWordCount": 3500,
  "minInternalLinks": 3,
  "maxSparkLocalMentions": 2,
  "targetKeywordMinOccurrences": 3,
  "fillerPhraseBlocklist": [
    "in today's fast-paced",
    "whether you're a seasoned",
    "in this comprehensive guide",
    "look no further",
    "without further ado",
    "it's no secret that",
    "at the end of the day",
    "dive right in",
    "buckle up",
    "game-changer",
    "level up your",
    "skyrocket your"
  ],
  "keywordFilters": {
    "minSearchVolume": 100,
    "maxSearchVolume": 10000,
    "maxDifficulty": 40
  },
  "clusterWeights": {
    "funding": 1.0,
    "getting-started": 1.0,
    "location": 0.8,
    "services": 0.8,
    "industry": 0.7
  },
  "siteUrl": "https://sparklocal.co",
  "author": "SparkLocal"
}
```

---

## Setup Requirements

### Accounts/API Keys Needed:

1. **DataForSEO** — Sign up at dataforseo.com
   - Add $50 to start (pay-as-you-go, lasts months at this usage level)
   - Save login/password as GitHub secrets: `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`

2. **Anthropic API** — Already have this
   - Ensure `ANTHROPIC_API_KEY` is in GitHub secrets

3. **Google Search Console API** — For monitoring
   - Use existing service account
   - Enable "Search Console API" in Google Cloud Console
   - Already have `GOOGLE_SERVICE_ACCOUNT_KEY`

4. **GitHub PAT** — For pushing from Actions
   - Create a personal access token with `repo` scope
   - Save as `GH_PAT` secret

### NPM Dependencies to Add:
```bash
npm install @resvg/resvg-js  # For satori PNG rendering (if not already installed)
```

---

## Cost Breakdown (Monthly)

| Component | Cost |
|-----------|------|
| DataForSEO keyword discovery (12 runs) | ~$1.50 |
| Claude Haiku content generation (12 posts) | ~$6-12 |
| Satori image generation | Free (runs locally) |
| GitHub Actions minutes | Free (within limits) |
| Google Indexing API | Free |
| IndexNow | Free |
| **Total** | **~$8-15/month** |

---

## Rollout Plan

### Phase 1: Build & Manual Test (Day 1-2)
- Build all scripts
- Run discover → select → write → generate manually
- Review 3 test posts for quality
- Adjust prompts as needed

### Phase 2: Semi-Automated (Week 1)
- GitHub Action runs MWF
- Posts are written to a `drafts/` branch instead of `main`
- You review and merge (takes 2 min per post)
- This validates quality before going fully autonomous

### Phase 3: Fully Automated (Week 2+)
- Switch to pushing directly to `main`
- Vercel auto-deploys
- Search engine submission automatic
- You review the weekly digest on Sundays

### Phase 4: Feedback Loop (Month 2)
- Weekly GSC monitoring feeds back into keyword selection
- Double down on clusters that are getting traction
- Adjust difficulty threshold based on actual ranking performance
- Consider ramping to 4-5 posts/week if quality holds

---

## Safety Guardrails

1. **Rate limiting:** Never publish more than 1 post per day, even if workflow runs twice
2. **Duplicate prevention:** Check slug against all existing posts before writing
3. **Content quality:** Auto-reject posts that fail quality gates (word count, links, keyword density)
4. **Cost caps:** DataForSEO spending capped at $15/month; alert if exceeded
5. **Human override:** `workflow_dispatch` allows manual trigger; config file can pause automation
6. **Audit trail:** Every post commit message includes `[automated]` tag for easy filtering
7. **Rollback:** If a post looks bad after deploy, simply revert the git commit
