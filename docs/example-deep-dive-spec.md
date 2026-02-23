# Example Deep Dive — Implementation Prompt for Claude Code

## Overview

Create a fully produced example deep dive at `/builder/example` that shows visitors exactly what they get when they purchase a deep dive. This is our primary conversion tool — it should make people think "I need this for MY idea."

## The Example Business

**Name:** Austin Pour Co.
**Tagline:** Premium mobile cocktail catering for Austin's best events
**Category:** Food & Beverage / Event Services
**Location:** Austin, TX
**Budget:** $3,000-$5,000
**Experience Level:** Some experience (worked in hospitality)

**Description:** A mobile cocktail bar service that brings craft cocktail experiences directly to weddings, corporate events, private parties, and festivals across Austin, TX. Custom-designed bar setups, seasonal drink menus, professional bartenders, and Instagram-worthy presentation. Offers packages ranging from intimate gatherings (20 guests) to large-scale events (500+ guests).

## What to Build

### 1. Route & Page: `/builder/example`

Create `src/app/builder/example/page.tsx`:
- Uses the same deep dive layout as real projects
- All 6 tabs fully populated with pre-generated content (hardcoded JSON, not API calls)
- Fully interactive — tabs switch, checklist items can be clicked (but don't persist), copy buttons work
- Persistent banner at the top: "📋 This is an example deep dive. See what you'll get for your own business idea." with a CTA button: "Generate Your Deep Dive →" linking to /builder
- The AI Advisor tab should show a mock conversation (3-4 exchanges) instead of a live chat
- Page title: "Example: Austin Pour Co. | SparkLocal Deep Dive"

### 2. Pre-Generated Content for Each Tab

#### Tab 1: Business Foundation

**Viability Score: 82/100 — Strong Opportunity**

Score Breakdown:
| Factor | Score | Assessment |
|--------|-------|------------|
| Market Demand | 88 | Austin's event industry is booming — 15,000+ weddings/year, major corporate hub, festival capital |
| Competition | 72 | 4-5 mobile bar services exist but most are basic beer/wine. Premium craft cocktail gap is real |
| Startup Feasibility | 85 | Can launch with $3-5K. No storefront needed. TABC permit is straightforward |
| Revenue Potential | 90 | $2K-8K per event at 60%+ margins. Corporate clients pay premium. Recurring revenue from repeat clients |
| Timing | 78 | Peak wedding/event season starts in March. Q1 launch gives 2 months to prepare |

Market Research:
- US mobile bar market: $1.2B and growing 12% annually
- Austin event industry: $2.8B — 3rd fastest growing event market in the US
- 15,400 weddings in Austin metro annually (avg spend on bar: $2,800)
- 8,500+ corporate events per year in Austin (avg bar budget: $4,200)
- Google Trends: "mobile bar Austin" searches up 45% YoY
- Key trend: couples shifting from open bar to curated cocktail experiences
- 73% of corporate event planners prefer unique food/drink experiences over standard catering

Competitor Analysis:
| Competitor | URL | Pricing | Positioning | Your Advantage |
|-----------|-----|---------|-------------|---------------|
| The Bar Cart ATX | barcartaustin.com | $800-2,500 | Budget-friendly, beer/wine focused | They don't do craft cocktails — you own the premium segment |
| Tipsy Trailer Co | tipsytraileratx.com | $1,500-4,000 | Vintage trailer aesthetic | Similar price range but limited menu customization. You offer fully custom seasonal menus |
| ATX Mobile Bar | atxmobilebar.com | $1,200-3,000 | Standard mobile bar | Generic presentation. You differentiate on Instagram-worthy design + craft quality |
| Whiskey & Rose | whiskeyandrose.com | $2,000-5,000 | Premium events | Closest competitor. They're booked 3 months out — demand exceeds supply in this segment |

Local Market Sizing:
- Austin metro population: 2.3 million (growing 3% annually)
- Estimated addressable market: 4,200 events/year that would pay for premium mobile cocktail service
- At an average booking of $3,500: that's a $14.7M addressable market in Austin alone
- Capturing just 2% of addressable events (84 events/year) = $294K annual revenue

Legal & Structure:
- **Recommended: LLC** — File with Texas Secretary of State ($300 filing fee at sos.texas.gov)
- **TABC Permit Required** — Texas Alcoholic Beverage Commission caterer's permit ($1,076/2-year term)
- **Food Handler Certification** — Required for all staff ($15/person, online at texasfoodhandler.com)
- **General Liability Insurance** — Required for event venues. $500-800/year for mobile bar operations
- **Sales Tax Permit** — Free from Texas Comptroller (required to collect 8.25% sales tax)

Startup Costs:
| Item | Cost | Priority | Notes |
|------|------|----------|-------|
| LLC Registration (TX) | $300 | Week 1 | File at sos.texas.gov |
| TABC Caterer's Permit | $1,076 | Week 1 | Apply immediately — takes 2-4 weeks to process |
| Mobile Bar Setup | $800-1,500 | Week 2 | Start with a portable bar table + backdrop. Upgrade to custom bar later |
| Bar Tools & Equipment | $300 | Week 2 | Shakers, jiggers, ice bins, glassware (50-person kit) |
| Initial Liquor Inventory | $400 | Week 3 | Premium spirits for your core 8-10 cocktail recipes |
| Business Insurance | $500/year | Week 1 | General liability — required by most venues |
| Website (Squarespace) | $16/month | Week 2 | Use the landing page copy from your Growth Plan |
| Business Cards | $50 | Week 2 | Thick stock, minimal design. Hand out at venue tours |
| TOTAL | $3,442-4,142 | | Within your $3-5K budget |

Technology & Tools:
- **Website:** Squarespace ($16/month) — Event-focused template, gallery, booking form
- **Booking Management:** HoneyBook ($19/month) — Proposals, contracts, invoicing built for event businesses
- **Social Media:** Later ($18/month) — Schedule Instagram posts, track engagement
- **Accounting:** Wave (Free) — Invoicing, expenses, tax-ready reports
- **Payment Processing:** Square (2.6% + $0.10) — Accept cards at events + send invoices
- **Communication:** Google Workspace ($6/month) — Professional email (you@austinpourco.com)

Insurance & Compliance:
- **General Liability:** $500-800/year (required by 95% of event venues) — Quote at Next Insurance or Thimble
- **Liquor Liability:** $400-600/year (specifically covers alcohol-related incidents) — Get this. Non-negotiable.
- **Commercial Auto:** If you use a vehicle to transport equipment/alcohol — $1,200-1,800/year
- **Workers' Comp:** Required once you hire W-2 employees — $800-1,200/year per bartender
- **Health Department:** No commercial kitchen needed for mobile bar. You're preparing drinks on-site, not food.

#### Tab 2: Launch Checklist

Week 1: Foundation
- Register Austin Pour Co. LLC in Texas ($300 at sos.texas.gov) — CRITICAL
  Guide: "Go to sos.texas.gov, click 'SOSDirect', create an account, select 'Domestic Limited Liability Company', fill in: Name: Austin Pour Co. LLC, Registered Agent: your name and home address, Management: Member-Managed. Pay $300. You'll get confirmation in 24-48 hours."
- Apply for TABC Caterer's Permit ($1,076) — CRITICAL
  Guide: "This takes 2-4 weeks to process so apply immediately. Go to tabc.texas.gov, download the Caterer's Permit application, or apply online through their portal. You'll need your LLC docs, a floor plan isn't required for mobile operations. Budget for $1,076."
- Get your EIN from IRS (Free, 5 minutes) — CRITICAL
  Guide: "Go to irs.gov/ein, select 'Apply Online', choose LLC, answer questions. You'll get your EIN immediately. Save the confirmation letter."
- Open a business bank account — IMPORTANT
  Guide: "Bring your EIN, LLC filing confirmation, and ID to a local bank. We recommend Relay (online, no fees) or a local credit union. Keep personal and business finances completely separate from day one."
- Get general liability + liquor liability insurance — CRITICAL
  Guide: "Get both policies before your first event. Quote at: Next Insurance (nextinsurance.com), Thimble (thimble.com, great for per-event pricing while starting out), or a local agent. You need: General liability ($1M minimum) + Liquor liability. Most venues require both before they'll let you serve."

Week 2: Build Your Brand
- Develop your signature cocktail menu (8-10 cocktails) — CRITICAL
  Guide: "Create 8-10 signature cocktails spanning: 2 whiskey-based, 2 vodka-based, 2 tequila-based, 1 rum-based, 1 gin-based. Include 2 non-alcoholic options. Name each cocktail something memorable. Test recipes until they're perfect. Cost out each drink (aim for <$2.50/drink in ingredients for drinks you'll charge $12-15 for). Document exact recipes so any bartender can replicate them."
- Set up your Squarespace website — IMPORTANT
  Guide: "Use your Growth Plan landing page copy. Key pages: Home (hero shot of your bar setup), Services (packages), Gallery (borrow photos from styled shoots until you have your own), About, Contact/Booking form. Connect your domain: austinpourco.com ($12/year at Namecheap)."
- Create Instagram and TikTok accounts — IMPORTANT
  Guide: "Handle: @austinpourco. Bio: 'Craft cocktail experiences for Austin's best events. Weddings • Corporate • Private Parties. Book your date ↓' Post your first 9 Instagram posts using the content from your Growth Plan. Film 3 TikToks of you making cocktails (behind-the-scenes content performs best)."
- Purchase initial bar equipment and supplies — IMPORTANT
  Guide: "Start minimal: 1 portable bar table ($200, Amazon), bar tools kit ($80), 50-person glassware set ($120, WebstaurantStore), ice bin ($40), garnish trays ($30), speed rack ($25), bar mats ($15). Total: ~$510. Upgrade to a custom branded bar after your first 5 bookings."
- Design and order business cards — OPTIONAL
  Guide: "Thick stock, minimal design. Include: name, title (Founder & Lead Mixologist), phone, email, website, Instagram. Order 250 from Moo.com ($60) or Vistaprint ($30)."

Week 3: Get Your First Bookings
- Tour 10 event venues in Austin and introduce yourself — CRITICAL
  Guide: "This is your #1 sales channel. Visit: Barr Mansion, The Driskill, Greenhouse at Driftwood, Vista West Ranch, Prospect House, The Allan House, One World Theatre, Hotel Van Zandt, The Contemporary Austin, Brazos Hall. Bring business cards and a one-page menu. Ask to be added to their preferred vendor list. Offer to do a free tasting for their events team."
- Reach out to 15 wedding planners in Austin — CRITICAL
  Guide: "Find them on The Knot, WeddingWire, and Instagram. Send the cold email from your Growth Plan. Offer a complimentary tasting. Austin's top planners: Westcott Weddings, Bird Dog Wedding, Clearly Classy Events, Coordinate This, Jessica Frey Events."
- List your business on The Knot, WeddingWire, and Thumbtack — IMPORTANT
  Guide: "The Knot and WeddingWire have free basic listings. Create detailed profiles with your best photos, full menu, and pricing. Thumbtack charges per lead but is worth it for corporate events. Also list on Yelp (free) and Google Business Profile (free)."
- Purchase your initial liquor inventory — IMPORTANT
  Guide: "Buy from Twin Liquors or Total Wine (wholesale accounts available). For your first 3-5 events worth: 2 bottles each of your 8 base spirits + mixers + garnishes. Budget $400. Buy in bulk as bookings increase."

Week 4: Launch
- Host a styled shoot for portfolio photos — IMPORTANT
  Guide: "Partner with a local photographer ($200-400 or trade) and a florist (offer to feature them). Set up your bar, make 5-6 signature cocktails, photograph everything. You need: wide shots of the full bar setup, close-ups of individual cocktails, action shots of pouring/shaking, detail shots of garnishes. These photos will be your website, social media, and venue portfolio for the next 6 months."
- Soft launch with a friends/family event — IMPORTANT
  Guide: "Host a free event for 20-30 friends. Practice your full setup, timing, service flow, and breakdown. Ask for honest feedback. Photograph and video everything. Ask 5 friends to leave Google reviews."
- Launch social media campaign — IMPORTANT
  Guide: "Post your styled shoot photos. Use the 5 social media posts from your Growth Plan. Run a targeted Instagram ad ($50, target: Austin, ages 25-40, interests: weddings, craft cocktails, event planning). Goal: 500 followers and 3 inquiries in the first 2 weeks."
- Follow up with all venue contacts and planners — CRITICAL
  Guide: "Send the follow-up email from your Growth Plan to everyone you met in Week 3. Offer a 10% discount for bookings in the first month. Follow up with a phone call 3 days after the email if no response."

#### Tab 3: Growth Plan

Elevator Pitch:
"I'm the founder of Austin Pour Co. — we bring premium craft cocktail experiences directly to weddings, corporate events, and private parties across Austin. Think Instagram-worthy bar setups, seasonal custom menus, and professional bartenders — but mobile. What makes us different is we're not a standard beer-and-wine cart. We create fully curated cocktail programs that match your event's theme and vibe. We're booking for spring and summer now, and I'd love to chat about your upcoming events."

Landing Page Copy:
- Headline: "Craft Cocktails That Come to You"
- Subheadline: "Austin's premier mobile cocktail bar for weddings, corporate events, and private parties. Stunning setups. Custom menus. Unforgettable experiences."
- Benefit 1: "Custom Cocktail Menus" — "We design seasonal drink menus that match your event's theme, dietary needs, and guest preferences. From classic Old Fashioneds to signature creations named after the couple."
- Benefit 2: "Instagram-Worthy Setups" — "Our mobile bars are designed to be the centerpiece of your event. Elegant displays, branded signage, and presentation that your guests will photograph and share."
- Benefit 3: "Professional Service, Start to Finish" — "Licensed, insured, and experienced. We handle setup, service, and cleanup. You focus on enjoying your event."
- CTA: "Book Your Date — Free Consultation"
- About: "Austin Pour Co. was born from a love of great cocktails and great parties. We believe every event deserves more than a standard bar setup. Based in Austin, TX, we bring the craft cocktail bar experience to your venue — whether it's a backyard wedding, a corporate retreat, or a milestone birthday."
- FAQ 1: "How far in advance should I book?" → "We recommend booking 2-3 months ahead for weddings and 3-4 weeks for corporate events. Popular dates (April-October) book up fast."
- FAQ 2: "Do you provide the alcohol?" → "We can provide all alcohol, or work with client-provided alcohol depending on your budget and preferences. We'll handle all TABC-compliant service either way."
- FAQ 3: "What's included in your packages?" → "Every package includes: professional bartender(s), custom cocktail menu, all bar equipment and tools, setup and cleanup, glassware, ice, and garnishes. Packages start at $1,200 for intimate gatherings."

Social Media Posts (5):
1. Instagram — "There's something magical about a perfectly crafted Old Fashioned under string lights. ✨🥃 Now booking spring & summer events in Austin. Link in bio. #AustinEvents #MobileBar #CraftCocktails #AustinWedding #ATXEvents" — Visual: Close-up of cocktail with bokeh lights background — Best time: Tuesday 11am
2. Instagram Reel — "POV: You hired a mobile cocktail bar for your wedding 🍸 [Show: setup timelapse → shaking cocktails → guests enjoying drinks → beautiful bar shot] Now booking 2026! DM us or link in bio. #AustinWedding #WeddingBar #MobileBartending #ATX" — Visual: 15-second reel with trending audio — Best time: Wednesday 7pm
3. LinkedIn — "Just launched Austin Pour Co. — a premium mobile cocktail catering service for corporate events in Austin. We're bringing the craft cocktail bar experience directly to your next team event, client dinner, or product launch. If you're planning corporate events in Austin, I'd love to connect. What's the most memorable event experience you've had? #AustinBusiness #EventPlanning #Entrepreneurship" — Visual: Professional bar setup at corporate venue — Best time: Thursday 9am
4. TikTok — "How much does it cost to start a mobile bar business? 💰 LLC: $300, TABC Permit: $1,076, Equipment: $800, Inventory: $400, Insurance: $500. Total: ~$3,000. First event pays for half of it. 📈 #SmallBusiness #Entrepreneur #MobileBar #BusinessTok #Austin" — Visual: Text overlay with each cost appearing — Best time: Saturday 10am
5. Instagram Story — "BEHIND THE SCENES 🎬 Prepping for Saturday's wedding — 150 guests, 6 signature cocktails, 1 gorgeous bar setup. Swipe to see the menu → [Show cocktail menu card] → [Show ingredients laid out] → [Show finished cocktails] Book your event: link in bio 🔗" — Visual: BTS photo series, casual style — Best time: Friday 5pm

Email Templates:
1. Venue Introduction:
Subject: "Adding a premium mobile cocktail bar to your vendor list"
Body: "Hi [Venue Coordinator Name], I'm [Name], founder of Austin Pour Co. We're a new premium mobile cocktail bar service here in Austin, and I'd love to be considered for your preferred vendor list. We specialize in craft cocktail experiences for weddings and events — custom menus, beautiful bar setups, and fully licensed/insured service. I'd love to stop by, introduce myself, and even do a quick tasting for your team. Would any day next week work for a brief visit? Best, [Name] | Austin Pour Co. | austinpourco.com | @austinpourco"

2. Wedding Planner Outreach:
Subject: "Craft cocktails for your Austin weddings"
Body: "Hi [Planner Name], I've been following your work — the [specific recent wedding/event] was absolutely stunning. I'm launching Austin Pour Co., a premium mobile cocktail bar designed specifically for events like yours. We create custom cocktail menus that match each couple's style, with Instagram-worthy bar setups that double as a visual centerpiece. I'd love to offer you a complimentary tasting so you can experience what we do. Could I buy you a coffee this week and bring some samples? Best, [Name] | Austin Pour Co."

3. Post-Event Follow-Up:
Subject: "Thank you — and a small ask"
Body: "Hi [Client Name], Thank you so much for choosing Austin Pour Co. for your [event type]! We had an amazing time — your guests were so fun, and that [specific cocktail or moment] was a highlight. I have a small ask: would you mind leaving us a quick review on Google or The Knot? It makes a huge difference for a new business. [Google Review Link] If you know anyone planning an event in Austin, we'd be grateful for the referral — and we offer a $100 credit for every booking that comes from you. Thank you again! [Name] | Austin Pour Co."

Local Marketing Tactics:
- "Partner with Austin wedding photographers — offer to provide cocktails for their styled shoots in exchange for professional photos of your bar setup"
- "Join Austin Wedding Network (austinweddingnetwork.com) — monthly mixers with planners and vendors, $150/year membership"
- "Post in r/Austin and r/AustinWeddings when you launch — locals love supporting new Austin businesses"
- "Sponsor a local event (Austin Food & Wine Festival has vendor opportunities starting at $500)"
- "Reach out to Austin Monthly and Austin Woman magazines — they regularly feature new local businesses"

#### Tab 4: Financial Model

Startup Costs Summary:
| Item | Cost | Notes |
|------|------|-------|
| LLC Registration | $300 | One-time |
| TABC Caterer's Permit | $1,076 | 2-year term |
| Mobile Bar Equipment | $1,200 | Portable bar + tools + glassware |
| Initial Liquor Inventory | $400 | First 3-5 events |
| Business Insurance | $900 | General liability + liquor liability (annual) |
| Website + Domain | $204 | Squarespace annual + domain |
| Marketing (initial) | $250 | Business cards + first ad campaign |
| **TOTAL** | **$4,330** | **Within $3-5K budget** |

Monthly Operating Costs:
| Expense | Monthly | Annual | Notes |
|---------|---------|--------|-------|
| Liquor & Supplies | $600 | $7,200 | Scales with bookings (~$150/event avg) |
| Software (HoneyBook + Later) | $37 | $444 | Booking management + social scheduling |
| Insurance | $75 | $900 | Amortized annual cost |
| Website | $17 | $204 | Squarespace + domain |
| Marketing/Ads | $100 | $1,200 | Instagram ads + Thumbtack leads |
| Gas/Transport | $80 | $960 | Driving to events/venues |
| Misc Supplies | $50 | $600 | Ice, garnishes, napkins, disposables |
| **TOTAL** | **$959** | **$11,508** | |

Revenue Projections:
| | Conservative | Moderate | Aggressive |
|---|---|---|---|
| Events per month | 4 | 8 | 14 |
| Average booking | $2,500 | $3,200 | $3,800 |
| Monthly revenue | $10,000 | $25,600 | $53,200 |
| Monthly costs | $1,559 | $2,159 | $3,059 |
| **Monthly profit** | **$8,441** | **$23,441** | **$50,141** |
| Annual profit | $101,292 | $281,292 | $601,692 |
| Break-even month | Month 1 | Month 1 | Month 1 |

Note: Conservative assumes 1 event/weekend. Moderate assumes 2 events/weekend. Aggressive assumes hiring additional bartenders and taking weekday corporate events. Cost of liquor/supplies scales at roughly $150 per event.

Pricing Strategy:
- **Intimate Package (up to 30 guests):** $1,200 — 1 bartender, 4 cocktail options, 3-hour service
- **Classic Package (31-100 guests):** $2,800 — 2 bartenders, 6 cocktail options, 4-hour service, custom menu cards
- **Premium Package (101-250 guests):** $5,500 — 3 bartenders, 8 cocktail options, 5-hour service, custom bar branding, cocktail napkins
- **Grand Package (250+ guests):** $8,000+ — Full team, unlimited cocktail menu, premium spirits upgrade, multiple bar stations
- **Corporate Events:** Minimum $3,500 — includes branded cocktail naming, logo signage, custom experience

Why this pricing works: Competitors in Austin range from $800 (basic) to $5,000 (premium). Your pricing positions you firmly in the premium segment without being the most expensive. The $2,800 Classic package is your bread and butter — it's competitive with what couples expect to pay for bar service at Austin wedding venues.

Break-Even Analysis:
- Monthly fixed costs: ~$359 (software, insurance, website, marketing, gas)
- Variable cost per event: ~$150 (liquor, supplies, ice)
- Average revenue per event: $3,200
- Profit per event: $3,050
- **Break-even: 1 event covers your monthly costs with $2,641 profit remaining**
- Your initial $4,330 investment is recovered after just 2 events

#### Tab 5: Local Resources (Austin, TX)

Coworking Spaces Near You (3):
1. **Capital Factory** — Austin, TX — ★ 4.7 — "Capital Factory is Austin's premier startup hub. Their events and networking could connect Austin Pour Co. with corporate clients who regularly host catered events. Their rooftop space even hosts events that need bar service."
2. **WeWork South Congress** — Austin, TX — ★ 4.3 — $300-500/month — "Affordable hot desk for administrative work. WeWork's community events could be a direct source of corporate event leads for your bar service."
3. **Createscape** — Austin, TX — ★ 4.8 — $200/month — "Creative coworking space that hosts regular community events. Perfect for working on your business while networking with other Austin creatives and event professionals."

Grants You May Qualify For (5):
1. **Wells Fargo Open for Business Fund** — Nationwide — $5K-$25K — Deadline: Various — "This small business grant could fund your TABC permit, initial equipment, and first month of marketing. Food & beverage businesses are a strong fit."
2. **FedEx Small Business Grant** — Nationwide — $15K-$50K — Deadline: Annual (typically February-March) — "The $15K-$50K grant could fund a custom mobile bar trailer — transforming your setup from a portable table to a head-turning branded experience."
3. **Comcast RISE Grant Program** — Nationwide — $5K-$10K — Deadline: Rolling — "Includes marketing services that could fund professional photography of your bar setups and an ad campaign targeting Austin event planners."
4. **USDA Value-Added Producer Grant** — Nationwide — Up to $75K — "If you source local Texas spirits and ingredients, you may qualify. This grant specifically supports businesses that add value to agricultural products."
5. **City of Austin Small Business Grant** — Austin, TX — Up to $40K — "Austin's local grant program supports new businesses in food & beverage. Check austintexas.gov/smallbusiness for current application windows."

Accelerator Programs (3):
1. **Techstars** — Nationwide — $120K — Next: Varies by program — "Techstars' Austin programs could help if you plan to build a tech-enabled booking platform or expand to a franchise model."
2. **SKU** — Austin, TX — Consumer Products Accelerator — "SKU is Austin's premier CPG accelerator. If you develop a bottled cocktail line, this is the program to apply to."
3. **Capital Factory Accelerator** — Austin, TX — "Austin's largest accelerator. Their network of mentors and investors could help scale Austin Pour Co. into a multi-city operation."

Free SBA Mentorship (2):
1. **SCORE Austin** — Austin, TX — FREE — "SCORE's free mentoring pairs you with experienced business owners. Request a mentor with food & beverage or event industry experience. They'll help with your business plan, pricing strategy, and growth planning."
2. **UT Austin SBDC** — Austin, TX — FREE — "The Small Business Development Center at UT offers free consulting, workshops on bookkeeping and marketing, and can help you apply for local grants."

#### Tab 6: AI Advisor (Mock Conversation)

Show 3 pre-built exchanges:

User: "What's the single most important thing I should do this week?"
Assistant: "Get your TABC Caterer's Permit application submitted today. Here's why: it's the longest lead-time item on your checklist — processing takes 2-4 weeks, and you legally cannot serve alcohol at events without it. Everything else (LLC, equipment, marketing) can happen in parallel, but the TABC permit is your critical path item.

Go to tabc.texas.gov, download the caterer's permit application, and submit it with your $1,076 fee. While it processes, use the next 2-4 weeks to knock out your LLC registration, equipment purchases, and venue tours. By the time your permit arrives, you'll be ready to book your first event."

User: "How do I convince wedding venues to add me to their vendor list?"
Assistant: "Here's what actually works with Austin venues — I'll give you a specific approach:

**The Ask:** Don't pitch yourself. Offer something first. Say: 'I'd love to do a complimentary craft cocktail tasting for your events team — no strings attached. It'll take 30 minutes and I'll bring 4-5 of our signature cocktails.'

**The Script:** 'Hi, I'm [Name] from Austin Pour Co. We're a new premium mobile cocktail bar service, and I've always admired [specific thing about their venue]. I'd love to stop by and do a quick tasting for your team — completely free. We specialize in custom cocktail menus for weddings, and I think our aesthetic would be a great fit for your space. Would any afternoon next week work?'

**Top 5 venues to hit first** (based on your market research): Barr Mansion, The Driskill, Vista West Ranch, The Allan House, and Prospect House. These all host 100+ weddings per year and actively maintain vendor lists.

**Pro tip:** Bring your portfolio (even if it's just your styled shoot photos), a printed one-page menu, and business cards. Follow up with the email template from your Growth Plan within 24 hours."

User: "Should I hire bartenders or do events myself at first?"
Assistant: "Do the first 10-15 events yourself. Here's why:

1. **You'll learn the operation inside out** — timing, setup flow, common issues, what clients actually care about
2. **Your margins stay at 60%+** instead of dropping to 40% with hired staff
3. **You'll build direct relationships** with clients and venue coordinators — these become your referral network
4. **You'll refine your recipes and service** based on real event feedback

**When to hire your first bartender:** Once you're consistently booking 6+ events per month or getting requests for dates you're already booked. Your financial model shows this happens around month 3-4 in the moderate scenario.

**How to hire:** Post on Poached (poachedjobs.com) — it's the industry standard for hospitality hiring in Austin. Look for bartenders with event experience, not just bar experience. Pay $25-35/hour plus tips. Always have them shadow you at 2-3 events before working solo.

Your break-even per event is so low ($150 in costs vs $3,200+ revenue) that even with a bartender at $200-280 per event, you're still profiting $2,700+ per booking."

### 3. Navigation & CTA

- Add a link to the example from the paywall/purchase screen: "See an example deep dive →"
- Add a link from the landing page: "See what you'll get →"
- The persistent banner should follow the user as they scroll through tabs
- CTA button style: amber/gold to match the brand, prominent but not annoying
- On mobile, the banner should be collapsible

### 4. Design Notes

- Match the existing dark builder theme exactly
- All tabs should feel real and interactive (clickable checklist items, copy buttons on growth plan, etc.)
- The mock AI conversation should look identical to the real advisor — same message bubbles, same styling
- Add a subtle "EXAMPLE" watermark or badge on each tab so users always know this isn't their project

### 5. SEO & Meta

- Title: "Example Business Plan: Austin Pour Co. | SparkLocal"
- Description: "See a complete AI-generated business launch plan. Market research, financial projections, step-by-step checklist, local resources, and AI advisor — all personalized for a real business idea."
- This page should be indexable — it's great SEO content for "AI business plan example" keywords

Build this as a single page with hardcoded JSON data. Do NOT call any APIs. The content above should be formatted to match the exact JSON structure that the V2 deep dive components expect. Use the same components (BusinessFoundation, LaunchChecklist, GrowthPlan, FinancialModel, LocalResources) with a special mock mode for the AI Advisor.
