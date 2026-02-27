"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/ui";
import LaunchChecklist from "@/components/results/LaunchChecklist";
import BusinessFoundation from "@/components/results/BusinessFoundation";
import BusinessOverview from "@/components/results/BusinessOverview";
import GrowthPlan from "@/components/results/GrowthPlan";
import FinancialModel from "@/components/results/FinancialModel";
import LocalResources from "@/components/results/LocalResources";
import { PURCHASE_CONTEXT_KEY } from "@/components/PurchaseModal";
import { sanitizeMarkdownHTML } from "@/lib/sanitize";
import type {
  Idea,
  LaunchChecklistData,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LocalResourcesData,
  ChecklistProgress,
  AdvisorMessage,
} from "@/types";

// ============================================
// HARDCODED EXAMPLE DATA
// ============================================

const EXAMPLE_IDEA: Idea = {
  id: "example-austin-pour-co",
  name: "Austin Pour Co.",
  tagline: "Premium mobile cocktail catering for Austin's best events",
  problem: "Austin's booming event scene lacks premium craft cocktail experiences that match the city's sophisticated tastes",
  audience: "Wedding planners, corporate event managers, and private party hosts in Austin, TX",
  revenueModel: "Service packages from $1,200 to $8,000+ per event",
  businessCategory: "food_beverage",
  valueProposition: "Instagram-worthy bar setups, seasonal custom menus, and professional bartenders",
  competitiveAdvantage: "Premium craft cocktails and curated experiences vs basic beer/wine competitors",
  mechanism: "Clients book a package online, choose from signature cocktail menus (or request custom creations), and we arrive with a fully-equipped mobile bar, professional bartender, all supplies, and handle setup through breakdown. We serve at weddings, corporate events, private parties, and brand activations across the Austin metro area.",
};

const EXAMPLE_FOUNDATION: BusinessFoundationData = {
  marketViability: {
    overallScore: 82,
    scoreBreakdown: [
      { factor: "Market Demand", score: 88, assessment: "Austin's event industry is booming — 15,000+ weddings/year, major corporate hub, festival capital" },
      { factor: "Competition", score: 72, assessment: "4-5 mobile bar services exist but most are basic beer/wine. Premium craft cocktail gap is real" },
      { factor: "Startup Feasibility", score: 85, assessment: "Can launch with $3-5K. No storefront needed. TABC permit is straightforward" },
      { factor: "Revenue Potential", score: 90, assessment: "$2K-8K per event at 60%+ margins. Corporate clients pay premium. Recurring revenue from repeat clients" },
      { factor: "Timing", score: 78, assessment: "Peak wedding/event season starts in March. Q1 launch gives 2 months to prepare" },
    ],
    marketResearch: {
      tam: "$1.2B (US mobile bar market)",
      sam: "$2.8B Austin event industry",
      som: "$14.7M addressable market in Austin",
      growthRate: "12% annually",
      trends: [
        "Couples shifting from open bar to curated cocktail experiences",
        "73% of corporate event planners prefer unique food/drink experiences over standard catering",
        "Google Trends: 'mobile bar Austin' searches up 45% YoY",
      ],
      demandSignals: [
        "15,400 weddings in Austin metro annually (avg spend on bar: $2,800)",
        "8,500+ corporate events per year in Austin (avg bar budget: $4,200)",
        "Austin metro population: 2.3 million (growing 3% annually)",
      ],
      risks: [
        "Seasonality — slower in winter months",
        "Economic downturn could impact event spending",
        "Liquor liability concerns",
      ],
      sources: ["IBISWorld", "The Knot", "Austin Business Journal", "Google Trends"],
    },
    competitorAnalysis: [
      { name: "The Bar Cart ATX", url: "barcartaustin.com", pricing: "$800-2,500", positioning: "Budget-friendly, beer/wine focused", weakness: "They don't do craft cocktails — you own the premium segment" },
      { name: "Tipsy Trailer Co", url: "tipsytraileratx.com", pricing: "$1,500-4,000", positioning: "Vintage trailer aesthetic", weakness: "Similar price range but limited menu customization. You offer fully custom seasonal menus" },
      { name: "ATX Mobile Bar", url: "atxmobilebar.com", pricing: "$1,200-3,000", positioning: "Standard mobile bar", weakness: "Generic presentation. You differentiate on Instagram-worthy design + craft quality" },
      { name: "Whiskey & Rose", url: "whiskeyandrose.com", pricing: "$2,000-5,000", positioning: "Premium events", weakness: "Closest competitor. They're booked 3 months out — demand exceeds supply in this segment" },
    ],
    localMarketSize: "Estimated 4,200 addressable events/year. At an average booking of $3,500: that's a $14.7M addressable market in Austin alone. Capturing just 2% of addressable events (84 events/year) = $294K annual revenue.",
  },
  legalStructure: {
    recommendedStructure: "LLC",
    reasoning: "An LLC provides liability protection for alcohol-related incidents while keeping taxes simple as a pass-through entity.",
    registrationSteps: [
      "File with Texas Secretary of State ($300 filing fee at sos.texas.gov)",
      "Get your EIN from IRS (free, 5 minutes at irs.gov/ein)",
      "Open a business bank account",
      "Register for Texas sales tax permit (free at comptroller.texas.gov)",
    ],
    estimatedCost: "$300",
    licensesRequired: [
      "TABC Caterer's Permit ($1,076/2-year term)",
      "Food Handler Certification ($15/person)",
      "Sales Tax Permit (free)",
    ],
    whenToGetLawyer: "When drafting event contracts, especially for high-value corporate events or to review liability coverage.",
  },
  startupCosts: [
    { item: "LLC Registration (TX)", cost: "$300", priority: "Week 1", notes: "File at sos.texas.gov" },
    { item: "TABC Caterer's Permit", cost: "$1,076", priority: "Week 1", notes: "Apply immediately — takes 2-4 weeks to process" },
    { item: "Mobile Bar Setup", cost: "$800-1,500", priority: "Week 2", notes: "Start with a portable bar table + backdrop. Upgrade to custom bar later" },
    { item: "Bar Tools & Equipment", cost: "$300", priority: "Week 2", notes: "Shakers, jiggers, ice bins, glassware (50-person kit)" },
    { item: "Initial Liquor Inventory", cost: "$400", priority: "Week 3", notes: "Premium spirits for your core 8-10 cocktail recipes" },
    { item: "Business Insurance", cost: "$500/year", priority: "Week 1", notes: "General liability — required by most venues" },
    { item: "Website (Squarespace)", cost: "$16/month", priority: "Week 2", notes: "Use the landing page copy from your Growth Plan" },
    { item: "Business Cards", cost: "$50", priority: "Week 2", notes: "Thick stock, minimal design. Hand out at venue tours" },
  ],
  suppliers: {
    platforms: [
      { name: "Twin Liquors", url: "https://twinliquors.com", description: "Local Austin liquor supplier with wholesale accounts", bestFor: "Premium spirits and wholesale pricing" },
      { name: "Total Wine", url: "https://totalwine.com", description: "National chain with competitive pricing", bestFor: "Large volume orders" },
      { name: "WebstaurantStore", url: "https://webstaurantstore.com", description: "Restaurant supply online", bestFor: "Bar equipment and glassware at wholesale prices" },
    ],
    evaluationChecklist: [
      "Verify wholesale account requirements",
      "Compare pricing across 3+ suppliers",
      "Check delivery options and timing",
      "Ask about return policies",
    ],
    minimumOrderExpectations: "Most liquor wholesalers require $200-500 minimum orders. Start with Twin Liquors for flexibility.",
    paymentTermsInfo: "Expect to pay upfront until you establish credit. Net-30 typically available after 6 months of consistent orders.",
  },
  techStack: {
    recommendation: "Start lean with these tools",
    reasoning: "Keep costs under $60/month while covering all essential business operations.",
    tools: [
      { name: "Squarespace", purpose: "Website — Event-focused template, gallery, booking form", cost: "$16/month", url: "https://squarespace.com" },
      { name: "HoneyBook", purpose: "Booking Management — Proposals, contracts, invoicing built for event businesses", cost: "$19/month", url: "https://honeybook.com" },
      { name: "Later", purpose: "Social Media — Schedule Instagram posts, track engagement", cost: "$18/month", url: "https://later.com" },
      { name: "Wave", purpose: "Accounting — Invoicing, expenses, tax-ready reports", cost: "Free", url: "https://waveapps.com" },
      { name: "Square", purpose: "Payment Processing — Accept cards at events + send invoices", cost: "2.6% + $0.10", url: "https://squareup.com" },
      { name: "Google Workspace", purpose: "Email — Professional email (you@austinpourco.com)", cost: "$6/month", url: "https://workspace.google.com" },
    ],
    setupTime: "2-3 hours to get everything connected",
  },
  insurance: {
    required: [
      { type: "General Liability", estimatedCost: "$500-800/year", provider: "Next Insurance or Thimble", url: "https://nextinsurance.com" },
      { type: "Liquor Liability", estimatedCost: "$400-600/year", provider: "Specialized coverage for alcohol", url: "https://thimble.com" },
    ],
    totalEstimatedCost: "$75-120",
    complianceNotes: [
      "95% of event venues require proof of general liability insurance",
      "Liquor liability is non-negotiable — covers alcohol-related incidents",
      "Get both policies before your first event",
      "Commercial auto insurance needed if using a vehicle for transport ($1,200-1,800/year)",
    ],
    taxObligations: "Texas has 8.25% sales tax. Collect on all drink sales and remit quarterly.",
  },
};

const EXAMPLE_CHECKLIST: LaunchChecklistData = {
  weeks: [
    {
      weekNumber: 1,
      title: "Foundation",
      items: [
        {
          id: "w1-llc",
          title: "Register Austin Pour Co. LLC in Texas ($300 at sos.texas.gov)",
          priority: "critical",
          estimatedTime: "30 minutes",
          estimatedCost: "$300",
          guide: 'Go to sos.texas.gov, click "SOSDirect", create an account, select "Domestic Limited Liability Company", fill in: Name: Austin Pour Co. LLC, Registered Agent: your name and home address, Management: Member-Managed. Pay $300. You\'ll get confirmation in 24-48 hours.',
        },
        {
          id: "w1-tabc",
          title: "Apply for TABC Caterer's Permit ($1,076)",
          priority: "critical",
          estimatedTime: "1 hour",
          estimatedCost: "$1,076",
          guide: "This takes 2-4 weeks to process so apply immediately. Go to tabc.texas.gov, download the Caterer's Permit application, or apply online through their portal. You'll need your LLC docs, a floor plan isn't required for mobile operations. Budget for $1,076.",
        },
        {
          id: "w1-ein",
          title: "Get your EIN from IRS (Free, 5 minutes)",
          priority: "critical",
          estimatedTime: "5 minutes",
          estimatedCost: "Free",
          guide: 'Go to irs.gov/ein, select "Apply Online", choose LLC, answer questions. You\'ll get your EIN immediately. Save the confirmation letter.',
        },
        {
          id: "w1-bank",
          title: "Open a business bank account",
          priority: "important",
          estimatedTime: "1 hour",
          estimatedCost: "Free",
          guide: "Bring your EIN, LLC filing confirmation, and ID to a local bank. We recommend Relay (online, no fees) or a local credit union. Keep personal and business finances completely separate from day one.",
        },
        {
          id: "w1-insurance",
          title: "Get general liability + liquor liability insurance",
          priority: "critical",
          estimatedTime: "1-2 hours",
          estimatedCost: "$900-1,400/year",
          guide: "Get both policies before your first event. Quote at: Next Insurance (nextinsurance.com), Thimble (thimble.com, great for per-event pricing while starting out), or a local agent. You need: General liability ($1M minimum) + Liquor liability. Most venues require both before they'll let you serve.",
        },
      ],
    },
    {
      weekNumber: 2,
      title: "Build Your Brand",
      items: [
        {
          id: "w2-menu",
          title: "Develop your signature cocktail menu (8-10 cocktails)",
          priority: "critical",
          estimatedTime: "3-4 hours",
          estimatedCost: "$50-100 (ingredients for testing)",
          guide: "Create 8-10 signature cocktails spanning: 2 whiskey-based, 2 vodka-based, 2 tequila-based, 1 rum-based, 1 gin-based. Include 2 non-alcoholic options. Name each cocktail something memorable. Test recipes until they're perfect. Cost out each drink (aim for <$2.50/drink in ingredients for drinks you'll charge $12-15 for). Document exact recipes so any bartender can replicate them.",
        },
        {
          id: "w2-website",
          title: "Set up your Squarespace website",
          priority: "important",
          estimatedTime: "3-4 hours",
          estimatedCost: "$16/month + $12/year domain",
          guide: "Use your Growth Plan landing page copy. Key pages: Home (hero shot of your bar setup), Services (packages), Gallery (borrow photos from styled shoots until you have your own), About, Contact/Booking form. Connect your domain: austinpourco.com ($12/year at Namecheap).",
        },
        {
          id: "w2-social",
          title: "Create Instagram and TikTok accounts",
          priority: "important",
          estimatedTime: "1 hour",
          estimatedCost: "Free",
          guide: 'Handle: @austinpourco. Bio: "Craft cocktail experiences for Austin\'s best events. Weddings • Corporate • Private Parties. Book your date ↓" Post your first 9 Instagram posts using the content from your Growth Plan. Film 3 TikToks of you making cocktails (behind-the-scenes content performs best).',
        },
        {
          id: "w2-equipment",
          title: "Purchase initial bar equipment and supplies",
          priority: "important",
          estimatedTime: "2 hours",
          estimatedCost: "~$510",
          guide: "Start minimal: 1 portable bar table ($200, Amazon), bar tools kit ($80), 50-person glassware set ($120, WebstaurantStore), ice bin ($40), garnish trays ($30), speed rack ($25), bar mats ($15). Total: ~$510. Upgrade to a custom branded bar after your first 5 bookings.",
        },
        {
          id: "w2-cards",
          title: "Design and order business cards",
          priority: "optional",
          estimatedTime: "30 minutes",
          estimatedCost: "$30-60",
          guide: "Thick stock, minimal design. Include: name, title (Founder & Lead Mixologist), phone, email, website, Instagram. Order 250 from Moo.com ($60) or Vistaprint ($30).",
        },
      ],
    },
    {
      weekNumber: 3,
      title: "Get Your First Bookings",
      items: [
        {
          id: "w3-venues",
          title: "Tour 10 event venues in Austin and introduce yourself",
          priority: "critical",
          estimatedTime: "4-6 hours (spread across week)",
          estimatedCost: "Free",
          guide: "This is your #1 sales channel. Visit: Barr Mansion, The Driskill, Greenhouse at Driftwood, Vista West Ranch, Prospect House, The Allan House, One World Theatre, Hotel Van Zandt, The Contemporary Austin, Brazos Hall. Bring business cards and a one-page menu. Ask to be added to their preferred vendor list. Offer to do a free tasting for their events team.",
        },
        {
          id: "w3-planners",
          title: "Reach out to 15 wedding planners in Austin",
          priority: "critical",
          estimatedTime: "2-3 hours",
          estimatedCost: "Free",
          guide: "Find them on The Knot, WeddingWire, and Instagram. Send the cold email from your Growth Plan. Offer a complimentary tasting. Austin's top planners: Westcott Weddings, Bird Dog Wedding, Clearly Classy Events, Coordinate This, Jessica Frey Events.",
        },
        {
          id: "w3-listings",
          title: "List your business on The Knot, WeddingWire, and Thumbtack",
          priority: "important",
          estimatedTime: "2 hours",
          estimatedCost: "Free (basic)",
          guide: "The Knot and WeddingWire have free basic listings. Create detailed profiles with your best photos, full menu, and pricing. Thumbtack charges per lead but is worth it for corporate events. Also list on Yelp (free) and Google Business Profile (free).",
        },
        {
          id: "w3-inventory",
          title: "Purchase your initial liquor inventory",
          priority: "important",
          estimatedTime: "1-2 hours",
          estimatedCost: "$400",
          guide: "Buy from Twin Liquors or Total Wine (wholesale accounts available). For your first 3-5 events worth: 2 bottles each of your 8 base spirits + mixers + garnishes. Budget $400. Buy in bulk as bookings increase.",
        },
      ],
    },
    {
      weekNumber: 4,
      title: "Launch",
      items: [
        {
          id: "w4-shoot",
          title: "Host a styled shoot for portfolio photos",
          priority: "important",
          estimatedTime: "4-6 hours",
          estimatedCost: "$200-400 (photographer)",
          guide: "Partner with a local photographer ($200-400 or trade) and a florist (offer to feature them). Set up your bar, make 5-6 signature cocktails, photograph everything. You need: wide shots of the full bar setup, close-ups of individual cocktails, action shots of pouring/shaking, detail shots of garnishes. These photos will be your website, social media, and venue portfolio for the next 6 months.",
        },
        {
          id: "w4-softlaunch",
          title: "Soft launch with a friends/family event",
          priority: "important",
          estimatedTime: "4-5 hours",
          estimatedCost: "$100-200 (supplies)",
          guide: "Host a free event for 20-30 friends. Practice your full setup, timing, service flow, and breakdown. Ask for honest feedback. Photograph and video everything. Ask 5 friends to leave Google reviews.",
        },
        {
          id: "w4-launch",
          title: "Launch social media campaign",
          priority: "important",
          estimatedTime: "2-3 hours",
          estimatedCost: "$50 (ads)",
          guide: "Post your styled shoot photos. Use the 5 social media posts from your Growth Plan. Run a targeted Instagram ad ($50, target: Austin, ages 25-40, interests: weddings, craft cocktails, event planning). Goal: 500 followers and 3 inquiries in the first 2 weeks.",
        },
        {
          id: "w4-followup",
          title: "Follow up with all venue contacts and planners",
          priority: "critical",
          estimatedTime: "2 hours",
          estimatedCost: "Free",
          guide: "Send the follow-up email from your Growth Plan to everyone you met in Week 3. Offer a 10% discount for bookings in the first month. Follow up with a phone call 3 days after the email if no response.",
        },
      ],
    },
  ],
};

const EXAMPLE_GROWTH: GrowthPlanData = {
  elevatorPitch: "I'm the founder of Austin Pour Co. — we bring premium craft cocktail experiences directly to weddings, corporate events, and private parties across Austin. Think Instagram-worthy bar setups, seasonal custom menus, and professional bartenders — but mobile. What makes us different is we're not a standard beer-and-wine cart. We create fully curated cocktail programs that match your event's theme and vibe. We're booking for spring and summer now, and I'd love to chat about your upcoming events.",
  landingPageCopy: {
    headline: "Craft Cocktails That Come to You",
    subheadline: "Austin's premier mobile cocktail bar for weddings, corporate events, and private parties. Stunning setups. Custom menus. Unforgettable experiences.",
    benefits: [
      { title: "Custom Cocktail Menus", description: "We design seasonal drink menus that match your event's theme, dietary needs, and guest preferences. From classic Old Fashioneds to signature creations named after the couple." },
      { title: "Instagram-Worthy Setups", description: "Our mobile bars are designed to be the centerpiece of your event. Elegant displays, branded signage, and presentation that your guests will photograph and share." },
      { title: "Professional Service, Start to Finish", description: "Licensed, insured, and experienced. We handle setup, service, and cleanup. You focus on enjoying your event." },
    ],
    socialProofPlaceholder: '"Austin Pour Co. made our wedding unforgettable. The custom cocktails were a hit!" — Sarah & Mike',
    ctaButtonText: "Book Your Date — Free Consultation",
    aboutSection: "Austin Pour Co. was born from a love of great cocktails and great parties. We believe every event deserves more than a standard bar setup. Based in Austin, TX, we bring the craft cocktail bar experience to your venue — whether it's a backyard wedding, a corporate retreat, or a milestone birthday.",
    faq: [
      { question: "How far in advance should I book?", answer: "We recommend booking 2-3 months ahead for weddings and 3-4 weeks for corporate events. Popular dates (April-October) book up fast." },
      { question: "Do you provide the alcohol?", answer: "We can provide all alcohol, or work with client-provided alcohol depending on your budget and preferences. We'll handle all TABC-compliant service either way." },
      { question: "What's included in your packages?", answer: "Every package includes: professional bartender(s), custom cocktail menu, all bar equipment and tools, setup and cleanup, glassware, ice, and garnishes. Packages start at $1,200 for intimate gatherings." },
    ],
    setupGuide: "Copy this content directly to your Squarespace website. Use the headline as your homepage H1, benefits as feature blocks, and FAQ as an accordion section.",
  },
  socialMediaPosts: [
    {
      platform: "instagram",
      caption: "There's something magical about a perfectly crafted Old Fashioned under string lights. Now booking spring & summer events in Austin. Link in bio.",
      visualSuggestion: "Close-up of cocktail with bokeh lights background",
      bestTimeToPost: "Tuesday 11am",
      hashtags: ["AustinEvents", "MobileBar", "CraftCocktails", "AustinWedding", "ATXEvents"],
    },
    {
      platform: "tiktok",
      caption: "POV: You hired a mobile cocktail bar for your wedding [Show: setup timelapse → shaking cocktails → guests enjoying drinks → beautiful bar shot] Now booking 2026! DM us or link in bio.",
      visualSuggestion: "15-second reel with trending audio",
      bestTimeToPost: "Wednesday 7pm",
      hashtags: ["AustinWedding", "WeddingBar", "MobileBartending", "ATX"],
    },
    {
      platform: "linkedin",
      caption: "Just launched Austin Pour Co. — a premium mobile cocktail catering service for corporate events in Austin. We're bringing the craft cocktail bar experience directly to your next team event, client dinner, or product launch. If you're planning corporate events in Austin, I'd love to connect. What's the most memorable event experience you've had?",
      visualSuggestion: "Professional bar setup at corporate venue",
      bestTimeToPost: "Thursday 9am",
      hashtags: ["AustinBusiness", "EventPlanning", "Entrepreneurship"],
    },
    {
      platform: "tiktok",
      caption: "How much does it cost to start a mobile bar business? LLC: $300, TABC Permit: $1,076, Equipment: $800, Inventory: $400, Insurance: $500. Total: ~$3,000. First event pays for half of it.",
      visualSuggestion: "Text overlay with each cost appearing",
      bestTimeToPost: "Saturday 10am",
      hashtags: ["SmallBusiness", "Entrepreneur", "MobileBar", "BusinessTok", "Austin"],
    },
    {
      platform: "instagram",
      caption: "BEHIND THE SCENES Prepping for Saturday's wedding — 150 guests, 6 signature cocktails, 1 gorgeous bar setup. Swipe to see the menu → [Show cocktail menu card] → [Show ingredients laid out] → [Show finished cocktails] Book your event: link in bio",
      visualSuggestion: "BTS photo series, casual style",
      bestTimeToPost: "Friday 5pm",
      hashtags: ["AustinWedding", "BehindTheScenes", "MobileBartender", "WeddingPlanning"],
    },
  ],
  emailTemplates: [
    {
      type: "cold_outreach",
      subject: "Adding a premium mobile cocktail bar to your vendor list",
      body: "Hi [Venue Coordinator Name],\n\nI'm [Name], founder of Austin Pour Co. We're a new premium mobile cocktail bar service here in Austin, and I'd love to be considered for your preferred vendor list.\n\nWe specialize in craft cocktail experiences for weddings and events — custom menus, beautiful bar setups, and fully licensed/insured service.\n\nI'd love to stop by, introduce myself, and even do a quick tasting for your team. Would any day next week work for a brief visit?\n\nBest,\n[Name]\nAustin Pour Co.\naustinpourco.com | @austinpourco",
    },
    {
      type: "launch_announcement",
      subject: "Craft cocktails for your Austin weddings",
      body: "Hi [Planner Name],\n\nI've been following your work — the [specific recent wedding/event] was absolutely stunning.\n\nI'm launching Austin Pour Co., a premium mobile cocktail bar designed specifically for events like yours. We create custom cocktail menus that match each couple's style, with Instagram-worthy bar setups that double as a visual centerpiece.\n\nI'd love to offer you a complimentary tasting so you can experience what we do. Could I buy you a coffee this week and bring some samples?\n\nBest,\n[Name]\nAustin Pour Co.",
    },
    {
      type: "follow_up",
      subject: "Thank you — and a small ask",
      body: "Hi [Client Name],\n\nThank you so much for choosing Austin Pour Co. for your [event type]! We had an amazing time — your guests were so fun, and that [specific cocktail or moment] was a highlight.\n\nI have a small ask: would you mind leaving us a quick review on Google or The Knot? It makes a huge difference for a new business.\n\n[Google Review Link]\n\nIf you know anyone planning an event in Austin, we'd be grateful for the referral — and we offer a $100 credit for every booking that comes from you.\n\nThank you again!\n[Name]\nAustin Pour Co.",
    },
  ],
  localMarketing: [
    { tactic: "Partner with Austin wedding photographers", details: "Offer to provide cocktails for their styled shoots in exchange for professional photos of your bar setup" },
    { tactic: "Join Austin Wedding Network", details: "Monthly mixers with planners and vendors, $150/year membership at austinweddingnetwork.com" },
    { tactic: "Post in r/Austin and r/AustinWeddings", details: "When you launch — locals love supporting new Austin businesses" },
    { tactic: "Sponsor a local event", details: "Austin Food & Wine Festival has vendor opportunities starting at $500" },
    { tactic: "Reach out to local publications", details: "Austin Monthly and Austin Woman magazines regularly feature new local businesses" },
  ],
};

const EXAMPLE_FINANCIAL: FinancialModelData = {
  startupCostsSummary: [
    { item: "LLC Registration", cost: "$300", notes: "One-time" },
    { item: "TABC Caterer's Permit", cost: "$1,076", notes: "2-year term" },
    { item: "Mobile Bar Equipment", cost: "$1,200", notes: "Portable bar + tools + glassware" },
    { item: "Initial Liquor Inventory", cost: "$400", notes: "First 3-5 events" },
    { item: "Business Insurance", cost: "$900", notes: "General liability + liquor liability (annual)" },
    { item: "Website + Domain", cost: "$204", notes: "Squarespace annual + domain" },
    { item: "Marketing (initial)", cost: "$250", notes: "Business cards + first ad campaign" },
  ],
  monthlyOperatingCosts: [
    { item: "Liquor & Supplies", monthlyCost: "$600", annualCost: "$7,200", notes: "Scales with bookings (~$150/event avg)" },
    { item: "Software (HoneyBook + Later)", monthlyCost: "$37", annualCost: "$444", notes: "Booking management + social scheduling" },
    { item: "Insurance", monthlyCost: "$75", annualCost: "$900", notes: "Amortized annual cost" },
    { item: "Website", monthlyCost: "$17", annualCost: "$204", notes: "Squarespace + domain" },
    { item: "Marketing/Ads", monthlyCost: "$100", annualCost: "$1,200", notes: "Instagram ads + Thumbtack leads" },
    { item: "Gas/Transport", monthlyCost: "$80", annualCost: "$960", notes: "Driving to events/venues" },
    { item: "Misc Supplies", monthlyCost: "$50", annualCost: "$600", notes: "Ice, garnishes, napkins, disposables" },
  ],
  revenueProjections: {
    conservative: {
      monthlyCustomers: 4,
      averageOrder: 2500,
      monthlyRevenue: 10000,
      monthlyCosts: 1559,
      monthlyProfit: 8441,
      breakEvenMonth: "Month 1",
    },
    moderate: {
      monthlyCustomers: 8,
      averageOrder: 3200,
      monthlyRevenue: 25600,
      monthlyCosts: 2159,
      monthlyProfit: 23441,
      breakEvenMonth: "Month 1",
    },
    aggressive: {
      monthlyCustomers: 14,
      averageOrder: 3800,
      monthlyRevenue: 53200,
      monthlyCosts: 3059,
      monthlyProfit: 50141,
      breakEvenMonth: "Month 1",
    },
  },
  breakEvenAnalysis: {
    unitsNeeded: 1,
    description: "Your monthly fixed costs are ~$359 (software, insurance, website, marketing, gas). Variable cost per event is ~$150 (liquor, supplies, ice). At an average revenue of $3,200 per event, you profit $3,050 per booking. One event covers your monthly costs with $2,641 profit remaining. Your initial $4,330 investment is recovered after just 2 events.",
  },
  pricingStrategy: {
    recommendedPrice: "$1,200 - $8,000+ per event",
    reasoning: "Competitors in Austin range from $800 (basic) to $5,000 (premium). Your pricing positions you firmly in the premium segment without being the most expensive. The $2,800 Classic package is your bread and butter — it's competitive with what couples expect to pay for bar service at Austin wedding venues.",
    psychologyTips: [
      "Use package pricing (Intimate, Classic, Premium, Grand) rather than hourly rates",
      "End prices in $00 for premium feel ($2,800 not $2,795)",
      "Lead with your most popular package (Classic at $2,800) on your website",
      "Corporate events should have higher minimums ($3,500+) since budgets are different",
    ],
    testingApproach: "Start with your pricing, track conversion rates on inquiries. If you're booking more than 80% of inquiries, raise prices. If below 40%, consider adjusting or improving your pitch.",
  },
};

const EXAMPLE_LOCAL_RESOURCES: LocalResourcesData = {
  coworking: [
    { id: "cf-austin", name: "Capital Factory", slug: "capital-factory-austin", category: "coworking", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "Capital Factory is Austin's premier startup hub. Their events and networking could connect Austin Pour Co. with corporate clients who regularly host catered events. Their rooftop space even hosts events that need bar service.", rating: 4.7, priceRange: "$300-500/month" },
    { id: "ww-soco", name: "WeWork South Congress", slug: "wework-south-congress", category: "coworking", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "Affordable hot desk for administrative work. WeWork's community events could be a direct source of corporate event leads for your bar service.", rating: 4.3, priceRange: "$300-500/month" },
    { id: "createscape", name: "Createscape", slug: "createscape-austin", category: "coworking", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "Creative coworking space that hosts regular community events. Perfect for working on your business while networking with other Austin creatives and event professionals.", rating: 4.8, priceRange: "$200/month" },
  ],
  grants: [
    { id: "wf-open", name: "Wells Fargo Open for Business Fund", slug: "wells-fargo-open-business", category: "grant", city: null, state: null, isNationwide: true, relevanceNote: "This small business grant could fund your TABC permit, initial equipment, and first month of marketing. Food & beverage businesses are a strong fit.", amountRange: "$5K-$25K", deadline: "Various" },
    { id: "fedex-grant", name: "FedEx Small Business Grant", slug: "fedex-small-business-grant", category: "grant", city: null, state: null, isNationwide: true, relevanceNote: "The $15K-$50K grant could fund a custom mobile bar trailer — transforming your setup from a portable table to a head-turning branded experience.", amountRange: "$15K-$50K", deadline: "Annual (typically February-March)" },
    { id: "comcast-rise", name: "Comcast RISE Grant Program", slug: "comcast-rise-grant", category: "grant", city: null, state: null, isNationwide: true, relevanceNote: "Includes marketing services that could fund professional photography of your bar setups and an ad campaign targeting Austin event planners.", amountRange: "$5K-$10K", deadline: "Rolling" },
    { id: "usda-vap", name: "USDA Value-Added Producer Grant", slug: "usda-value-added-producer-grant", category: "grant", city: null, state: null, isNationwide: true, relevanceNote: "If you source local Texas spirits and ingredients, you may qualify. This grant specifically supports businesses that add value to agricultural products.", amountRange: "Up to $75K" },
    { id: "austin-sb", name: "City of Austin Small Business Grant", slug: "city-austin-small-business-grant", category: "grant", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "Austin's local grant program supports new businesses in food & beverage. Check austintexas.gov/smallbusiness for current application windows.", amountRange: "Up to $40K" },
  ],
  accelerators: [
    { id: "techstars", name: "Techstars", slug: "techstars", category: "accelerator", city: null, state: null, isNationwide: true, relevanceNote: "Techstars' Austin programs could help if you plan to build a tech-enabled booking platform or expand to a franchise model.", fundingAmount: "$120K", deadline: "Varies by program" },
    { id: "sku-austin", name: "SKU", slug: "sku-austin", category: "accelerator", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "SKU is Austin's premier CPG accelerator. If you develop a bottled cocktail line, this is the program to apply to." },
    { id: "cap-factory-accel", name: "Capital Factory Accelerator", slug: "capital-factory-accelerator", category: "accelerator", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "Austin's largest accelerator. Their network of mentors and investors could help scale Austin Pour Co. into a multi-city operation." },
  ],
  sba: [
    { id: "score-austin", name: "SCORE Austin", slug: "score-austin", category: "sba", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "SCORE's free mentoring pairs you with experienced business owners. Request a mentor with food & beverage or event industry experience. They'll help with your business plan, pricing strategy, and growth planning.", isFree: true, services: ["Free mentoring", "Business plan review", "Pricing strategy"] },
    { id: "ut-sbdc", name: "UT Austin SBDC", slug: "ut-austin-sbdc", category: "sba", city: "Austin", state: "TX", isNationwide: false, relevanceNote: "The Small Business Development Center at UT offers free consulting, workshops on bookkeeping and marketing, and can help you apply for local grants.", isFree: true, services: ["Free consulting", "Workshops", "Grant applications"] },
  ],
  citySlug: "austin-tx",
  cityName: "Austin",
  state: "TX",
  totalMatched: 13,
};

// Mock AI Advisor conversation
const MOCK_ADVISOR_MESSAGES: AdvisorMessage[] = [
  {
    id: "mock-1-user",
    role: "user",
    content: "What's the single most important thing I should do this week?",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "mock-1-assistant",
    role: "assistant",
    content: `Get your **TABC Caterer's Permit** application submitted today. Here's why: it's the longest lead-time item on your checklist — processing takes 2-4 weeks, and you legally cannot serve alcohol at events without it. Everything else (LLC, equipment, marketing) can happen in parallel, but the TABC permit is your critical path item.

Go to tabc.texas.gov, download the caterer's permit application, and submit it with your $1,076 fee. While it processes, use the next 2-4 weeks to knock out your LLC registration, equipment purchases, and venue tours. By the time your permit arrives, you'll be ready to book your first event.`,
    created_at: "2024-01-15T10:01:00Z",
  },
  {
    id: "mock-2-user",
    role: "user",
    content: "How do I convince wedding venues to add me to their vendor list?",
    created_at: "2024-01-15T10:05:00Z",
  },
  {
    id: "mock-2-assistant",
    role: "assistant",
    content: `Here's what actually works with Austin venues — I'll give you a specific approach:

**The Ask:** Don't pitch yourself. Offer something first. Say: "I'd love to do a complimentary craft cocktail tasting for your events team — no strings attached. It'll take 30 minutes and I'll bring 4-5 of our signature cocktails."

**The Script:** "Hi, I'm [Name] from Austin Pour Co. We're a new premium mobile cocktail bar service, and I've always admired [specific thing about their venue]. I'd love to stop by and do a quick tasting for your team — completely free. We specialize in custom cocktail menus for weddings, and I think our aesthetic would be a great fit for your space. Would any afternoon next week work?"

**Top 5 venues to hit first** (based on your market research): Barr Mansion, The Driskill, Vista West Ranch, The Allan House, and Prospect House. These all host 100+ weddings per year and actively maintain vendor lists.

**Pro tip:** Bring your portfolio (even if it's just your styled shoot photos), a printed one-page menu, and business cards. Follow up with the email template from your Growth Plan within 24 hours.`,
    created_at: "2024-01-15T10:06:00Z",
  },
  {
    id: "mock-3-user",
    role: "user",
    content: "Should I hire bartenders or do events myself at first?",
    created_at: "2024-01-15T10:10:00Z",
  },
  {
    id: "mock-3-assistant",
    role: "assistant",
    content: `Do the first 10-15 events yourself. Here's why:

1. **You'll learn the operation inside out** — timing, setup flow, common issues, what clients actually care about
2. **Your margins stay at 60%+** instead of dropping to 40% with hired staff
3. **You'll build direct relationships** with clients and venue coordinators — these become your referral network
4. **You'll refine your recipes and service** based on real event feedback

**When to hire your first bartender:** Once you're consistently booking 6+ events per month or getting requests for dates you're already booked. Your financial model shows this happens around month 3-4 in the moderate scenario.

**How to hire:** Post on Poached (poachedjobs.com) — it's the industry standard for hospitality hiring in Austin. Look for bartenders with event experience, not just bar experience. Pay $25-35/hour plus tips. Always have them shadow you at 2-3 events before working solo.

Your break-even per event is so low ($150 in costs vs $3,200+ revenue) that even with a bartender at $200-280 per event, you're still profiting $2,700+ per booking.`,
    created_at: "2024-01-15T10:11:00Z",
  },
];

// Tab configuration
type TabId = "foundation" | "checklist" | "growth" | "financial" | "resources" | "advisor";

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

const tabs: Tab[] = [
  { id: "foundation", label: "Business Foundation", emoji: "🏗️" },
  { id: "checklist", label: "Launch Checklist", emoji: "🚀" },
  { id: "growth", label: "Growth Plan", emoji: "📈" },
  { id: "financial", label: "Financial Model", emoji: "💰" },
  { id: "resources", label: "Local Resources", emoji: "📍" },
  { id: "advisor", label: "AI Advisor", emoji: "💬" },
];

// Mock AI Advisor Component (display-only, not a live chat)
function MockAIAdvisor({ messages }: { messages: AdvisorMessage[] }) {
  const formatMessage = (content: string) => {
    let formatted = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/^(\d+)\.\s/gm, "<span class='text-spark'>$1.</span> ");
    formatted = formatted.replace(/^[-•]\s/gm, "<span class='text-spark'>•</span> ");
    formatted = formatted.replace(/\n/g, "<br />");
    // Sanitize the final HTML to prevent XSS
    return sanitizeMarkdownHTML(formatted);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warmwhite/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark/20 to-accent/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-warmwhite font-medium text-sm">SparkLocal Advisor</h3>
            <p className="text-warmwhite-dim text-xs">Your AI business consultant for Austin Pour Co.</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-spark/10 text-spark">
          Example Conversation
        </span>
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-spark text-charcoal-dark rounded-br-md"
                  : "bg-charcoal-light text-warmwhite rounded-bl-md"
              }`}
            >
              {message.role === "assistant" ? (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Example disclaimer */}
      <div className="mx-4 mb-4 p-4 bg-charcoal-light rounded-xl border border-spark/20">
        <p className="text-warmwhite-muted text-sm text-center">
          This is an example conversation. With your own deep dive, you can chat with an AI advisor that knows your specific business plan, market research, and local resources.
        </p>
      </div>
    </div>
  );
}

// Example Banner Component
interface ExampleBannerProps {
  fromPurchase?: boolean;
  ideaName?: string;
  onCompletePurchase?: () => void;
}

function ExampleBanner({ fromPurchase, ideaName, onCompletePurchase }: ExampleBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-gradient-to-r from-spark/20 to-accent/20 border-b border-spark/30 sticky top-0 z-50 ${isCollapsed ? 'py-2' : 'py-3 md:py-4'}`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {!isCollapsed && (
              <>
                <span className="text-xl flex-shrink-0">📋</span>
                <p className="text-warmwhite text-sm md:text-base">
                  <span className="font-medium">This is an example deep dive.</span>{" "}
                  <span className="text-warmwhite-muted hidden sm:inline">
                    {fromPurchase
                      ? `See what you'll get for "${ideaName}".`
                      : "See what you'll get for your own business idea."
                    }
                  </span>
                </p>
              </>
            )}
            {isCollapsed && (
              <p className="text-warmwhite text-xs">📋 Example Deep Dive</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {fromPurchase && onCompletePurchase ? (
              <button
                onClick={onCompletePurchase}
                className="inline-flex items-center gap-2 px-4 py-2 bg-spark hover:bg-spark-light text-charcoal-dark font-semibold rounded-lg text-sm transition-all hover:scale-105"
              >
                Complete Purchase
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-4 py-2 bg-spark hover:bg-spark-light text-charcoal-dark font-semibold rounded-lg text-sm transition-all hover:scale-105"
              >
                Generate Your Deep Dive
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-warmwhite-muted hover:text-warmwhite transition-colors md:hidden"
              aria-label={isCollapsed ? "Expand banner" : "Collapse banner"}
            >
              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ExampleLoading() {
  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-spark border-t-transparent animate-spin" />
    </div>
  );
}

// Main wrapper with Suspense
export default function ExampleDeepDivePage() {
  return (
    <Suspense fallback={<ExampleLoading />}>
      <ExampleDeepDiveContent />
    </Suspense>
  );
}

// Example Page Content Component
function ExampleDeepDiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("foundation");
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({});
  const [purchaseContext, setPurchaseContext] = useState<{
    ideaName?: string;
    ideaId?: string;
  } | null>(null);

  // Check if user came from purchase modal
  const fromPurchase = searchParams.get("from") === "purchase";
  const ideaIdParam = searchParams.get("ideaId");

  // Load purchase context from sessionStorage
  useEffect(() => {
    if (fromPurchase && ideaIdParam) {
      const stored = sessionStorage.getItem(PURCHASE_CONTEXT_KEY);
      if (stored) {
        try {
          const context = JSON.parse(stored);
          setPurchaseContext({
            ideaName: context.ideaName,
            ideaId: context.ideaId,
          });
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, [fromPurchase, ideaIdParam]);

  // Handle "Complete Purchase" - navigate back to builder with params
  const handleCompletePurchase = useCallback(() => {
    // Navigate to builder with param to restore state and open purchase modal
    router.push(`/builder?restorePurchase=true&ideaId=${ideaIdParam}`);
  }, [router, ideaIdParam]);

  // Handle checklist progress (local only, no persistence)
  const handleChecklistProgressChange = useCallback((itemId: string, checked: boolean) => {
    setChecklistProgress((prev) => ({ ...prev, [itemId]: checked }));
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Example: Austin Pour Co. | SparkLocal Deep Dive";
  }, []);

  return (
    <div className="min-h-screen bg-charcoal-dark">
      {/* Persistent Example Banner */}
      <ExampleBanner
        fromPurchase={fromPurchase}
        ideaName={purchaseContext?.ideaName}
        onCompletePurchase={handleCompletePurchase}
      />

      {/* Header */}
      <div className="border-b border-warmwhite/10 bg-charcoal-dark/95 backdrop-blur-sm sticky top-[52px] md:top-[60px] z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
          {/* Top bar with logo and back */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Logo link home */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-xs md:text-sm">✦</span>
                </div>
                <span className="font-display text-warmwhite font-semibold hidden sm:inline text-sm">
                  SparkLocal
                </span>
              </Link>

              <div className="w-px h-5 bg-warmwhite/20 hidden sm:block" />

              <Link
                href="/builder"
                className="flex items-center gap-1.5 text-warmwhite-muted hover:text-warmwhite transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Start Your Own</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Example badge */}
              <span className="text-xs font-medium text-spark bg-spark/10 px-2 md:px-3 py-1 rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Example
              </span>
            </div>
          </div>

          {/* Idea title */}
          <FadeIn duration={400}>
            <div className="mb-4 md:mb-6">
              <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-warmwhite leading-tight">
                {EXAMPLE_IDEA.name}
              </h1>
              <p className="text-warmwhite-muted mt-1 text-sm md:text-base line-clamp-1 md:line-clamp-none">
                {EXAMPLE_IDEA.tagline}
              </p>
            </div>
          </FadeIn>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-t-lg font-medium text-xs md:text-sm whitespace-nowrap
                  transition-all duration-200 flex-shrink-0
                  ${activeTab === tab.id
                    ? "bg-charcoal-light text-spark border-b-2 border-spark"
                    : "text-warmwhite-muted hover:text-warmwhite hover:bg-charcoal-light/50"
                  }
                `}
              >
                <span className="text-base">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <FadeIn duration={400} key={activeTab}>
          {activeTab === "foundation" && (
            <>
              <BusinessOverview idea={EXAMPLE_IDEA} />
              <BusinessFoundation data={EXAMPLE_FOUNDATION} />
            </>
          )}
          {activeTab === "checklist" && (
            <LaunchChecklist
              data={EXAMPLE_CHECKLIST}
              progress={checklistProgress}
              onProgressChange={handleChecklistProgressChange}
            />
          )}
          {activeTab === "growth" && (
            <GrowthPlan data={EXAMPLE_GROWTH} />
          )}
          {activeTab === "financial" && (
            <FinancialModel data={EXAMPLE_FINANCIAL} />
          )}
          {activeTab === "resources" && (
            <LocalResources data={EXAMPLE_LOCAL_RESOURCES} />
          )}
          {activeTab === "advisor" && (
            <MockAIAdvisor messages={MOCK_ADVISOR_MESSAGES} />
          )}
        </FadeIn>
      </div>

      {/* Bottom CTA */}
      <div className="bg-charcoal-light border-t border-warmwhite/10 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          {fromPurchase && purchaseContext?.ideaName ? (
            <>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warmwhite mb-3">
                Ready to get this for &ldquo;{purchaseContext.ideaName}&rdquo;?
              </h2>
              <p className="text-warmwhite-muted mb-6 max-w-lg mx-auto">
                You&apos;ll get market research, a launch checklist, growth plan, financial model, local resources, and AI advisor — all personalized to your business and location.
              </p>
              <button
                onClick={handleCompletePurchase}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-spark to-accent text-charcoal-dark font-bold rounded-xl text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Complete Purchase
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-warmwhite-dim text-sm mt-4">
                One-time purchase • Instant access
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warmwhite mb-3">
                Ready to get this for your business idea?
              </h2>
              <p className="text-warmwhite-muted mb-6 max-w-lg mx-auto">
                Answer a few questions about your idea and we&apos;ll generate a complete deep dive tailored to your business and location.
              </p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-spark to-accent text-charcoal-dark font-bold rounded-xl text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Generate Your Deep Dive
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-warmwhite-dim text-sm mt-4">
                Free to start • No credit card required
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
