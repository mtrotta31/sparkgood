# Launch Kit V2 — Implementation Spec

## Overview

Upgrade the Launch Kit from text-only content (social posts, emails, elevator pitch, basic HTML) to **4 professional, downloadable/hostable assets** that make users feel like they hired a consultant. The current Launch Kit generates content in a modal. The V2 Launch Kit generates real files.

**Current Launch Kit ($2.99):** Text social posts, text emails, basic HTML landing page, elevator pitch
**V2 Launch Kit ($4.99):** Hosted landing page, pitch deck (PPTX), social media graphics (PNG), business one-pager (PDF)

## Price Change

Update the Launch Kit price from $2.99 to $4.99. The deliverables are now real assets, not just text. Update Stripe pricing and any hardcoded price displays.

## Architecture

The Launch Kit generation happens server-side. When a user purchases and triggers generation:

1. Load the user's deep dive data (Business Overview, Foundation, Growth Plan, Financial Model, matched resources)
2. Generate all 4 assets in parallel (or sequentially if resource-constrained)
3. Store generated files in Supabase Storage (bucket: `launch-kit-assets`)
4. Return download URLs for each asset
5. Display in an updated LaunchKitModal with 4 tabs, each showing a preview + download button

### Data Available to All Assets

Every asset pulls from the same deep dive data:
- **Business Overview:** name, tagline, description, problem, audience, howItWorks, differentiation
- **Growth Plan:** elevatorPitch, landingPageCopy (headline, subheadline, benefits, cta, about, faq), socialMediaPosts, emailTemplates, localMarketing
- **Financial Model:** startupCosts, monthlyOperatingCosts, revenueProjections, breakEvenAnalysis, pricingStrategy
- **Business Foundation:** marketViability (overallScore, scoreBreakdown, marketResearch, competitorAnalysis), legalStructure, startupCosts, suppliers, techStack, insurance
- **Matched Resources:** coworking, grants, accelerators, sba
- **User Profile:** city, state, budget, experience, category

---

## Deliverable 1: Hosted Landing Page

**Skill:** `frontend-design` (at /mnt/skills/public/frontend-design/SKILL.md)

**What it produces:** A beautiful, standalone HTML page hosted at `sparklocal.co/sites/[business-slug]`

**Generation approach:**
1. Call Claude with the `frontend-design` skill instructions + all business data
2. Claude generates a single HTML file with inline CSS and minimal JS
3. Store the HTML in Supabase Storage
4. Serve via a Next.js dynamic route at `/sites/[slug]`

**Prompt context to include:**
- Business name, tagline, full description
- Landing page copy from Growth Plan (headline, subheadline, 3 benefits, CTA, about section, FAQ)
- Business category (to inform visual style — food business gets warm tones, tech gets modern, etc.)
- City/state for local flavor
- Contact placeholder (email form or "Contact Us" button)

**Design requirements (from frontend-design skill):**
- Bold, distinctive aesthetic — NOT generic template look
- Professional typography (never Inter, Roboto, Arial)
- Cohesive color palette matched to business category
- Responsive (mobile + desktop)
- Sections: Hero (headline + CTA), Problem/Solution, Benefits (3), About, FAQ, Footer with contact
- Must include: business name in header, city/state mention, professional imagery placeholders
- Inline everything — single HTML file, no external dependencies except Google Fonts CDN

**Hosting route:** Create `/src/app/sites/[slug]/page.tsx`
- Server-side rendered: fetches HTML from Supabase Storage
- Renders in an iframe or dangerouslySetInnerHTML within a minimal wrapper
- Add meta tags for SEO (title, description, OG image)
- The slug is generated from the business name (e.g., "austin-pour-co")

**Database:**
- Add `landing_page_url` TEXT column to `deep_dive_results` or a new `launch_kit_assets` table
- Store: slug, html_content (or Supabase Storage path), created_at, project_id

**User experience:**
- Preview in modal (iframe)
- "Copy Link" button for the hosted URL
- "Download HTML" button to save the file locally
- "Edit" button (future — opens a simple editor)

---

## Deliverable 2: Pitch Deck (PPTX)

**Skill:** `pptx` (at /mnt/skills/public/pptx/SKILL.md, using pptxgenjs.md)

**What it produces:** A 7-slide professional PowerPoint deck they can present to investors, banks, landlords, or partners.

**Generation approach:**
1. Build a Node.js script that uses pptxgenjs to create the deck
2. Pull all content from the deep dive data
3. Generate the .pptx file server-side
4. Store in Supabase Storage, return download URL

**Slide structure:**

**Slide 1: Cover**
- Business name (large, bold)
- Tagline (subtitle)
- City, State
- "Business Launch Plan" or "Investment Overview"
- Date
- Dark background, amber accent (SparkLocal brand feel, but for THEIR business)

**Slide 2: The Opportunity**
- Problem statement (from Business Overview)
- Target audience description
- Market size stats (TAM/SAM/SOM from Business Foundation marketResearch)
- Large stat callout: market size number

**Slide 3: The Solution**
- Business description (what it is, how it works)
- What makes it different (competitive edge)
- 3 key benefits
- Visual: icon grid or benefit cards

**Slide 4: Market Validation**
- Viability score: X/100 with breakdown
- Score breakdown table (demand, competition, feasibility, revenue potential, timing)
- Key market research data points
- Industry growth rate

**Slide 5: Competitive Landscape**
- Competitor table (name, pricing, positioning, your advantage)
- Positioning statement: "We're the [unique thing] in [market]"

**Slide 6: Financial Projections**
- Startup costs total
- Monthly operating costs
- Revenue projections table (conservative/moderate/aggressive)
- Break-even analysis: "Break even in month X with Y customers"
- Large stat callout: projected annual revenue (moderate scenario)

**Slide 7: The Ask / Next Steps**
- What you need to launch (funding, space, partnerships)
- Timeline: Week 1-4 key milestones from Launch Checklist
- Contact information
- CTA: "Let's build this together"

**Design specs (from pptx skill):**
- Use a "Warm Terracotta" or "Charcoal Minimal" color palette (business-category-aware)
- Dark background for cover + closing slides, light for content (sandwich structure)
- Large stat callouts (60-72pt numbers)
- Icon + text rows for benefits
- Tables for financial data and competitors
- Bold header font + clean body font
- Every slide has a visual element (no text-only slides)

**User experience:**
- Preview slides as images in the modal (generate thumbnails)
- "Download PPTX" button
- File named: `[BusinessName]-Pitch-Deck.pptx`

---

## Deliverable 3: Social Media Graphics (PNG)

**Skill:** `canvas-design` (at /mnt/skills/examples/canvas-design/SKILL.md)

**What it produces:** 4 branded PNG images sized for major platforms:
1. Instagram Post (1080×1080) — announcement/launch post
2. Instagram Story (1080×1920) — "Now Open" or "Now Booking" story
3. LinkedIn Post (1200×627) — professional launch announcement
4. Facebook Cover (820×312) — page header

**Generation approach:**
1. Use Node.js canvas library (`@napi-rs/canvas` or `canvas` npm package) to programmatically generate PNGs
2. Claude generates the design code (canvas drawing instructions) based on the canvas-design skill philosophy
3. Each graphic includes: business name, tagline, city, and a platform-appropriate CTA
4. Use fonts from the canvas-design skill's font collection (copy needed fonts)
5. Generate all 4 sizes server-side, store in Supabase Storage

**Design philosophy for social graphics:**
- Clean, modern, branded feel
- Business name prominent
- Tagline or key value proposition
- City/state for local credibility
- Background: gradient or textured (category-appropriate colors)
- NO stock photos or AI-generated imagery — pure typography and design
- Consistent visual identity across all 4 graphics (same colors, fonts, style)

**Alternative simpler approach (if canvas library is complex):**
- Generate styled HTML for each size
- Use a headless browser (Puppeteer) or `html-to-image` library to screenshot to PNG
- This is more reliable and lets us use CSS for styling
- Install `puppeteer` or use `satori` + `@resvg/resvg-js` for HTML→SVG→PNG (Vercel-friendly, no headless browser needed)

**Recommended approach: satori + resvg**
- `satori` converts JSX/HTML to SVG (made by Vercel, works in serverless)
- `@resvg/resvg-js` converts SVG to PNG
- No headless browser needed, works in Vercel serverless functions
- Full control over fonts, colors, layout via JSX
- Example: Create a React-like JSX template for each graphic size, render with satori, convert to PNG

**Content per graphic:**

1. **Instagram Post (1080×1080):**
   - Business name (large)
   - Tagline
   - "Coming Soon" or "Now Open" or "Book Now"
   - City, State
   - Decorative elements (shapes, lines matching brand)

2. **Instagram Story (1080×1920):**
   - Business name (centered, large)
   - Tagline
   - "Swipe Up" or "Link in Bio" CTA
   - City, State
   - Vertical-optimized layout

3. **LinkedIn Post (1200×627):**
   - Business name
   - One-line description
   - "Launching in [City]"
   - More professional/corporate aesthetic
   - Subtle grid or pattern background

4. **Facebook Cover (820×312):**
   - Business name (left or center aligned)
   - Tagline
   - City, State
   - Clean, wide layout optimized for cover photo cropping

**User experience:**
- Preview all 4 graphics in the modal as a grid
- Individual download buttons for each
- "Download All" as a ZIP
- Files named: `[BusinessName]-Instagram-Post.png`, etc.

---

## Deliverable 4: Business One-Pager (PDF)

**Skill:** `pdf` (at /mnt/skills/public/pdf/SKILL.md, using reportlab)

**What it produces:** A single-page professional PDF that users can email to partners, landlords, banks, or print and hand out.

**Generation approach:**
1. Use Python's `reportlab` to generate a designed PDF
2. Pull content from deep dive data
3. Generate server-side, store in Supabase Storage

**Layout (single page, letter size 8.5×11):**

**Top section (header):**
- Business name (large, bold)
- Tagline (italic, below name)
- City, State | Category | Website placeholder
- Thin horizontal rule

**Left column (60% width):**
- **About:** 2-3 sentence business description
- **The Problem We Solve:** 1-2 sentences
- **How It Works:** 2-3 sentences explaining the business model
- **What Makes Us Different:** 2-3 bullet points (competitive edge)

**Right column (40% width):**
- **Market Opportunity** box:
  - Viability Score: X/100
  - Market size (TAM)
  - Growth rate
- **Financial Snapshot** box:
  - Startup cost: $X
  - Monthly revenue (moderate): $X
  - Break-even: Month X
- **Pricing** box:
  - 2-3 package/price tiers

**Bottom section:**
- **Services/Offerings:** 3-4 key services in a row with icons or bullets
- **Contact:** Email placeholder, website placeholder, city/state
- SparkLocal watermark (small, bottom corner): "Built with SparkLocal.co"

**Design specs:**
- Professional, clean layout (think consulting firm one-pager)
- Primary color matched to business category
- Amber accent for SparkLocal branding (subtle)
- Font: Clean sans-serif header + readable body (use reportlab's built-in fonts or register custom ones)
- Plenty of white space — this is a ONE pager, don't cram
- Key numbers should be large and prominent

**User experience:**
- Preview PDF inline in the modal
- "Download PDF" button
- File named: `[BusinessName]-One-Pager.pdf`

---

## API Route Updates

### Updated `/api/launch-kit/route.ts`

The existing route generates text content. Refactor to:

1. Keep the existing generation as a first step (we still need the text content for social posts and emails)
2. Add file generation as a second step:
   - Call 4 generation functions in parallel: `generateLandingPage()`, `generatePitchDeck()`, `generateSocialGraphics()`, `generateOnePager()`
   - Each function returns a file buffer or URL
3. Upload all files to Supabase Storage
4. Return both the text content AND the file URLs

```typescript
// Pseudocode
const [landingPage, pitchDeck, socialGraphics, onePager] = await Promise.all([
  generateLandingPage(deepDiveData, userProfile),
  generatePitchDeck(deepDiveData, userProfile),
  generateSocialGraphics(deepDiveData, userProfile),
  generateOnePager(deepDiveData, userProfile),
]);

// Upload to Supabase Storage
const urls = await uploadToStorage(projectId, {
  landingPage, // HTML string
  pitchDeck,   // Buffer (.pptx)
  socialGraphics, // Array of Buffers (.png × 4)
  onePager,    // Buffer (.pdf)
});
```

### Storage Schema

Create a Supabase Storage bucket: `launch-kit-assets`

Store files at paths like:
```
launch-kit-assets/
  {projectId}/
    landing-page.html
    pitch-deck.pptx
    social-instagram-post.png
    social-instagram-story.png
    social-linkedin-post.png
    social-facebook-cover.png
    one-pager.pdf
```

### Database

Add to `deep_dive_results` or create new table:
```sql
ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS launch_kit_assets JSONB;
```

The JSONB stores:
```json
{
  "landingPage": {
    "slug": "austin-pour-co",
    "url": "/sites/austin-pour-co",
    "storagePath": "launch-kit-assets/{projectId}/landing-page.html"
  },
  "pitchDeck": {
    "storagePath": "launch-kit-assets/{projectId}/pitch-deck.pptx",
    "downloadUrl": "..."
  },
  "socialGraphics": {
    "instagramPost": { "storagePath": "...", "downloadUrl": "..." },
    "instagramStory": { "storagePath": "...", "downloadUrl": "..." },
    "linkedinPost": { "storagePath": "...", "downloadUrl": "..." },
    "facebookCover": { "storagePath": "...", "downloadUrl": "..." }
  },
  "onePager": {
    "storagePath": "launch-kit-assets/{projectId}/one-pager.pdf",
    "downloadUrl": "..."
  }
}
```

---

## Updated LaunchKitModal

Replace the existing 4-tab modal (Landing Page, Social, Email, Pitch) with:

**Tab 1: Landing Page**
- Iframe preview of the hosted page
- "Visit Your Page" button (opens sparklocal.co/sites/[slug])
- "Copy Link" button
- "Download HTML" button

**Tab 2: Pitch Deck**
- Slide thumbnails or carousel preview
- "Download PPTX" button
- Slide count: "7 slides"

**Tab 3: Social Graphics**
- 2×2 grid showing all 4 graphics
- Individual download buttons under each
- "Download All (ZIP)" button
- Platform labels under each (Instagram Post, Instagram Story, LinkedIn, Facebook Cover)

**Tab 4: One-Pager**
- PDF preview (inline or image)
- "Download PDF" button
- "Print" button (opens print dialog)

**Keep existing text content accessible:**
- Add a "Text Content" expandable section or 5th tab with the original social post captions, email templates, and elevator pitch (these are still useful for copy-pasting)

---

## Generation Time & UX

This will take longer than the current Launch Kit (which is a single Claude API call). Estimated:
- Landing page generation: 15-30s (Claude API call)
- Pitch deck generation: 5-10s (pptxgenjs is fast, data is already available)
- Social graphics: 5-15s (satori rendering)
- One-pager: 5-10s (reportlab)
- Upload to storage: 2-5s

**Total: ~30-60 seconds**

**Loading UX:**
- Show a progress indicator with steps:
  1. "Designing your landing page..." 
  2. "Building your pitch deck..."
  3. "Creating social media graphics..."
  4. "Generating your one-pager..."
  5. "Packaging your Launch Kit..."
- Each step checks off as it completes
- Show the modal with tabs once the first asset is ready (progressive loading)

---

## Dependencies to Install

```bash
npm install pptxgenjs        # Pitch deck generation
npm install satori            # HTML/JSX → SVG (for social graphics)
npm install @resvg/resvg-js   # SVG → PNG (for social graphics)
```

For the PDF one-pager, use the existing PDF generation setup (check what's already installed — likely jspdf or a Python reportlab call). If nothing exists, use `jspdf` for Node.js or call a Python script with reportlab.

---

## Implementation Order

1. **Database + Storage setup** — Add launch_kit_assets column, create Supabase Storage bucket
2. **Pitch Deck** — Most straightforward (pptxgenjs + structured data → PPTX). Start here.
3. **Social Graphics** — Install satori + resvg, build 4 JSX templates, generate PNGs
4. **One-Pager PDF** — reportlab or jspdf, single-page layout
5. **Landing Page** — Claude API call with frontend-design skill, hosting route
6. **Updated LaunchKitModal** — New 4-tab layout with previews + downloads
7. **Integration** — Wire everything together in the API route, progressive loading UX

---

## Example: Austin Pour Co. Launch Kit

For the example page at `/builder/example`, create hardcoded versions of all 4 assets:
- A pre-built landing page at `/sites/austin-pour-co` (or mock preview)
- A sample pitch deck preview (slide images)
- 4 sample social graphics
- A sample one-pager preview

This shows visitors exactly what they get in the Launch Kit before purchasing.

---

## Future Upgrades

- **Ideogram API integration** — Replace canvas-design graphics with AI-generated photorealistic social graphics (business name rendered in beautiful scenes)
- **Custom domain support** — Let users point their own domain to their landing page
- **Landing page editor** — Simple WYSIWYG to customize colors, text, images
- **Additional graphic sizes** — TikTok, Pinterest, YouTube thumbnail, Twitter/X header
- **Animated social content** — Short video/GIF versions of social graphics
- **QR code** — Generate QR code linking to their landing page, embed in one-pager
