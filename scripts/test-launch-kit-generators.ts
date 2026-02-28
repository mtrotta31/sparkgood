// Test script for Launch Kit V2 generators
// Run with: npx tsx scripts/test-launch-kit-generators.ts

import { writeFileSync } from "fs";
import { join } from "path";
import type { DeepDiveData } from "../src/lib/launch-kit/types";
import { generatePitchDeck } from "../src/lib/launch-kit/generate-pitch-deck";
import { generateSocialGraphics } from "../src/lib/launch-kit/generate-social-graphics";
import { generateOnePager } from "../src/lib/launch-kit/generate-one-pager";

// Test data matching Austin Pour Co. example
const testData: DeepDiveData = {
  idea: {
    id: "test-austin-pour-co",
    name: "Austin Pour Co.",
    tagline: "Premium mobile cocktail catering for Austin's best events",
    problem: "Austin's booming event scene lacks premium craft cocktail experiences that match the city's sophisticated tastes",
    audience: "Wedding planners, corporate event managers, and private party hosts in Austin, TX",
    mechanism: "Clients book a package online, choose from signature cocktail menus, and we arrive with a fully-equipped mobile bar",
    revenueModel: "Per-event pricing packages ranging from $1,500 to $8,000",
    valueProposition: "Premium craft cocktails and curated experiences vs basic beer/wine competitors",
    competitiveAdvantage: "Premium craft cocktails and curated experiences",
  },
  profile: {
    id: "test-profile",
    userId: "test-user",
    businessCategory: "food_beverage",
    location: {
      city: "Austin",
      state: "TX",
    },
  },
  foundation: {
    marketViability: {
      overallScore: 82,
      scoreBreakdown: [
        { factor: "Market Demand", score: 88, assessment: "Austin's event industry is booming" },
        { factor: "Competition", score: 72, assessment: "Premium craft cocktail gap is real" },
        { factor: "Startup Feasibility", score: 85, assessment: "Can launch with $3-5K" },
        { factor: "Revenue Potential", score: 90, assessment: "$2K-8K per event at 60%+ margins" },
        { factor: "Timing", score: 78, assessment: "Peak wedding/event season starts in March" },
      ],
      marketResearch: {
        tam: "$1.2B",
        sam: "$2.8B",
        som: "$14.7M",
        growthRate: "12% annually",
        trends: [
          "Couples shifting from open bar to curated cocktail experiences",
          "73% of corporate event planners prefer unique food/drink experiences",
        ],
        demandSignals: ["15,400 weddings in Austin metro annually"],
        risks: ["Seasonality", "Economic downturn"],
        sources: ["IBISWorld", "The Knot", "Austin Business Journal"],
      },
      competitorAnalysis: [
        {
          name: "The Bar Cart ATX",
          url: "https://barcartaustin.com",
          pricing: "$800-2,500",
          positioning: "Budget-friendly, beer/wine focused",
          weakness: "They don't do craft cocktails",
        },
        {
          name: "Tipsy Trailer Co",
          url: "https://tipsytraileratx.com",
          pricing: "$1,500-4,000",
          positioning: "Vintage trailer aesthetic",
          weakness: "Limited menu customization",
        },
      ],
    },
  },
  growth: {
    landingPageCopy: {
      headline: "Premium Mobile Cocktails for Austin Events",
      subheadline: "Craft cocktail experiences for weddings, corporate events, and private parties",
      aboutSection: "Austin Pour Co. brings premium craft cocktails directly to your event.",
      benefits: [
        { title: "Craft Cocktails", description: "Premium spirits and custom recipes" },
        { title: "Full Service", description: "Professional bartenders, setup, and cleanup" },
        { title: "Custom Menus", description: "Personalized cocktail menus for your event" },
        { title: "Premium Experience", description: "Instagram-worthy bar setups" },
      ],
      ctaText: "Book Your Event",
    },
    elevatorPitch: "Austin Pour Co. provides premium mobile cocktail catering for Austin's best events.",
    socialMediaPosts: [],
    emailTemplates: [],
    localMarketing: [],
  },
  financial: {
    startupCostsSummary: [
      { item: "LLC Registration", cost: "$300", priority: "Week 1", notes: "File at sos.texas.gov" },
      { item: "TABC Permit", cost: "$1,076", priority: "Week 1", notes: "Takes 2-4 weeks" },
      { item: "Mobile Bar Setup", cost: "$1,200", priority: "Week 2", notes: "Portable bar and backdrop" },
      { item: "Bar Equipment", cost: "$300", priority: "Week 2", notes: "Shakers, jiggers, glassware" },
      { item: "Initial Inventory", cost: "$400", priority: "Week 3", notes: "Premium spirits" },
      { item: "Business Insurance", cost: "$500", priority: "Week 1", notes: "General liability" },
    ],
    monthlyOperatingCosts: [
      { item: "Website", monthlyCost: "$16", notes: "Squarespace" },
      { item: "Booking Software", monthlyCost: "$19", notes: "HoneyBook" },
      { item: "Social Media", monthlyCost: "$18", notes: "Later" },
      { item: "Insurance", monthlyCost: "$75", notes: "Monthly premium" },
    ],
    revenueProjections: {
      conservative: {
        monthlyRevenue: "$4,500",
        monthlyProfit: "$2,700",
        breakEvenMonth: "Month 4",
      },
      moderate: {
        monthlyRevenue: "$7,200",
        monthlyProfit: "$4,300",
        breakEvenMonth: "Month 3",
      },
      aggressive: {
        monthlyRevenue: "$12,000",
        monthlyProfit: "$7,200",
        breakEvenMonth: "Month 2",
      },
    },
    breakEvenAnalysis: {
      description: "3 events per month at average $2,400",
      unitsNeeded: "3 events/month",
    },
    pricingStrategy: {
      recommendedPrice: "$1,500 - $4,000 per event",
      reasoning: "Premium positioning above beer/wine competitors",
    },
  },
  checklist: null,
  matchedResources: null,
};

async function runTests() {
  const outputDir = join(process.cwd(), "test-output");

  console.log("Testing Launch Kit V2 Generators...\n");
  console.log("Output directory:", outputDir);
  console.log("Business Category:", testData.profile.businessCategory);
  console.log("Location:", testData.profile.location?.city, testData.profile.location?.state);
  console.log("");

  // Test 1: Pitch Deck
  console.log("1. Generating Pitch Deck...");
  try {
    const pitchDeckBuffer = await generatePitchDeck(testData);
    const pitchDeckPath = join(outputDir, "test-pitch-deck.pptx");
    writeFileSync(pitchDeckPath, pitchDeckBuffer);
    console.log("   ✓ Pitch deck saved:", pitchDeckPath);
    console.log("   Size:", (pitchDeckBuffer.length / 1024).toFixed(1), "KB");
  } catch (err) {
    console.log("   ✗ Pitch deck failed:", err);
  }

  // Test 2: Social Graphics
  console.log("\n2. Generating Social Graphics...");
  try {
    const graphics = await generateSocialGraphics(testData);
    for (const graphic of graphics) {
      const graphicPath = join(outputDir, graphic.name);
      writeFileSync(graphicPath, graphic.buffer);
      console.log(`   ✓ ${graphic.platform} saved:`, graphicPath);
      console.log(`     Size: ${(graphic.buffer.length / 1024).toFixed(1)} KB, ${graphic.width}x${graphic.height}`);
    }
  } catch (err) {
    console.log("   ✗ Social graphics failed:", err);
  }

  // Test 3: One-Pager PDF
  console.log("\n3. Generating One-Pager PDF...");
  try {
    const onePagerBuffer = await generateOnePager(testData);
    const onePagerPath = join(outputDir, "test-one-pager.pdf");
    writeFileSync(onePagerPath, onePagerBuffer);
    console.log("   ✓ One-pager saved:", onePagerPath);
    console.log("   Size:", (onePagerBuffer.length / 1024).toFixed(1), "KB");
  } catch (err) {
    console.log("   ✗ One-pager failed:", err);
  }

  console.log("\n✅ Tests complete! Check the test-output/ directory for generated files.");
}

runTests().catch(console.error);
