// Pitch Deck Generator for Launch Kit V2
// Uses pptxgenjs to create a 7-slide professional deck

import PptxGenJS from "pptxgenjs";
import type { DeepDiveData, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview, formatCurrency, parseCurrency } from "./types";

// Helper to truncate text at word boundaries (never mid-word)
function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  // If there's a space and it's not too far back, truncate at the word boundary
  if (lastSpace > maxLength * 0.4) {
    return truncated.substring(0, lastSpace) + "...";
  }

  // Otherwise just truncate (for single long words)
  return truncated + "...";
}

// Helper to format market size values (e.g., "$8.99 billion" → "$8.99B")
function formatMarketSize(value: string | undefined | null): string {
  if (!value) return "N/A";

  // Convert "billion" to "B" and "million" to "M"
  let formatted = value
    .replace(/\s*billion/gi, "B")
    .replace(/\s*million/gi, "M")
    .replace(/\s*thousand/gi, "K")
    .replace(/\s*trillion/gi, "T");

  // Clean up any extra spaces
  formatted = formatted.replace(/\s+/g, " ").trim();

  return formatted;
}

// Color scheme for dark slides (cover, closing)
const DARK_COLORS = {
  background: "1C1412", // Charcoal dark
  text: "FFFFFF",
  accent: "F59E0B", // Spark amber
  muted: "A8A8A8",
};

// Color scheme for light slides (content)
const LIGHT_COLORS = {
  background: "FAFAF8", // Cream
  text: "1E293B", // Slate dark
  accent: "F59E0B",
  muted: "64748B",
};

interface SlideOptions {
  pptx: PptxGenJS;
  colors: CategoryColors;
}

export async function generatePitchDeck(data: DeepDiveData): Promise<Buffer> {
  // Debug: Log financial data received
  console.log("[Pitch Deck] Financial data:", {
    hasFinancial: !!data.financial,
    startupCostsSummaryLength: data.financial?.startupCostsSummary?.length,
    firstStartupItem: data.financial?.startupCostsSummary?.[0],
    monthlyOperatingCostsLength: data.financial?.monthlyOperatingCosts?.length,
    firstMonthlyItem: data.financial?.monthlyOperatingCosts?.[0],
    hasRevenueProjections: !!data.financial?.revenueProjections,
    moderateRevenue: data.financial?.revenueProjections?.moderate,
  });

  const pptx = new PptxGenJS();
  const overview = extractBusinessOverview(data);
  const colors = getCategoryColors(overview.category);

  // Set presentation properties
  pptx.author = "SparkLocal";
  pptx.title = `${overview.name} - Business Launch Plan`;
  pptx.subject = "Business Launch Presentation";
  pptx.company = overview.name;

  // Define slide master for consistency
  pptx.defineSlideMaster({
    title: "DARK_MASTER",
    background: { color: DARK_COLORS.background },
  });

  pptx.defineSlideMaster({
    title: "LIGHT_MASTER",
    background: { color: LIGHT_COLORS.background },
  });

  const opts: SlideOptions = { pptx, colors };

  // Generate all 7 slides
  createCoverSlide(opts, data, overview);
  createOpportunitySlide(opts, data, overview);
  createSolutionSlide(opts, data, overview);
  createMarketValidationSlide(opts, data, overview);
  createCompetitiveLandscapeSlide(opts, data, overview);
  createFinancialProjectionsSlide(opts, data, overview);
  createAskSlide(opts, data, overview);

  // Generate buffer
  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}

// Slide 1: Cover
function createCoverSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "DARK_MASTER" });

  // Decorative accent bar at top
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.1,
    fill: { color: DARK_COLORS.accent },
  });

  // Business name - large and bold
  slide.addText(overview.name, {
    x: 0.5,
    y: 2.0,
    w: "90%",
    fontSize: 54,
    bold: true,
    color: DARK_COLORS.text,
    fontFace: "Arial",
  });

  // Tagline
  slide.addText(overview.tagline, {
    x: 0.5,
    y: 2.9,
    w: "90%",
    fontSize: 24,
    color: DARK_COLORS.accent,
    fontFace: "Arial",
    italic: true,
  });

  // Location
  const location = overview.city && overview.state
    ? `${overview.city}, ${overview.state}`
    : "";
  if (location) {
    slide.addText(location, {
      x: 0.5,
      y: 3.5,
      w: "90%",
      fontSize: 18,
      color: DARK_COLORS.muted,
      fontFace: "Arial",
    });
  }

  // Label
  slide.addText("Business Launch Plan", {
    x: 0.5,
    y: 4.3,
    w: "90%",
    fontSize: 16,
    color: DARK_COLORS.muted,
    fontFace: "Arial",
  });

  // Date
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  slide.addText(date, {
    x: 0.5,
    y: 4.7,
    w: "90%",
    fontSize: 14,
    color: DARK_COLORS.muted,
    fontFace: "Arial",
  });

  // Decorative shape in bottom right
  slide.addShape("rect", {
    x: 8.5,
    y: 4.5,
    w: 1.3,
    h: 0.8,
    fill: { color: opts.colors.primary.replace("#", "") },
    rotate: 15,
  });
}

// Slide 2: The Opportunity
function createOpportunitySlide(
  opts: SlideOptions,
  data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "LIGHT_MASTER" });
  const { foundation } = data;

  // Header
  addSlideHeader(slide, "The Opportunity", opts.colors);

  // Problem statement
  slide.addText("The Problem", {
    x: 0.5,
    y: 1.1,
    fontSize: 12,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.problem, 180), {
    x: 0.5,
    y: 1.35,
    w: 5.2,
    h: 1.0,
    fontSize: 13,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Target audience
  slide.addText("Target Audience", {
    x: 0.5,
    y: 2.5,
    fontSize: 12,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.audience, 150), {
    x: 0.5,
    y: 2.75,
    w: 5.2,
    h: 0.8,
    fontSize: 13,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Market size callout boxes (right side) - stacked vertically with proper spacing
  const marketResearch = foundation?.marketViability?.marketResearch;

  // TAM callout (large box at top right) - wider to fit formatted values
  slide.addShape("roundRect", {
    x: 6.0,
    y: 1.1,
    w: 3.5,
    h: 1.3,
    fill: { color: opts.colors.primary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("TAM (Total Market)", {
    x: 6.0,
    y: 1.15,
    w: 3.5,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatMarketSize(marketResearch?.tam), {
    x: 6.0,
    y: 1.5,
    w: 3.5,
    fontSize: 22,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // SAM box (left of pair) - wider boxes
  slide.addShape("roundRect", {
    x: 6.0,
    y: 2.55,
    w: 1.65,
    h: 1.0,
    fill: { color: opts.colors.secondary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("SAM", {
    x: 6.0,
    y: 2.6,
    w: 1.65,
    fontSize: 9,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatMarketSize(marketResearch?.sam), {
    x: 6.0,
    y: 2.85,
    w: 1.65,
    fontSize: 13,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // SOM box (right of pair)
  slide.addShape("roundRect", {
    x: 7.85,
    y: 2.55,
    w: 1.65,
    h: 1.0,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("SOM", {
    x: 7.85,
    y: 2.6,
    w: 1.65,
    fontSize: 9,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatMarketSize(marketResearch?.som), {
    x: 7.85,
    y: 2.85,
    w: 1.65,
    fontSize: 13,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  // Growth rate (below market boxes) - truncate at word boundary
  const growthText = marketResearch?.growthRate || "N/A";
  slide.addText(`Growth: ${truncateText(growthText, 25)}`, {
    x: 6.0,
    y: 3.7,
    w: 3.5,
    fontSize: 11,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
    bold: true,
    align: "center",
  });
}

// Slide 3: The Solution
function createSolutionSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "LIGHT_MASTER" });
  const { growth } = data;

  addSlideHeader(slide, "The Solution", opts.colors);

  // Business description
  slide.addText("What We Do", {
    x: 0.5,
    y: 1.1,
    fontSize: 11,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  const description = overview.howItWorks || overview.description || "";
  slide.addText(truncateText(description, 200), {
    x: 0.5,
    y: 1.35,
    w: 9,
    h: 0.7,
    fontSize: 12,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // What makes us different
  slide.addText("What Makes Us Different", {
    x: 0.5,
    y: 2.15,
    fontSize: 11,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.differentiation || data.idea.valueProposition || "", 180), {
    x: 0.5,
    y: 2.4,
    w: 9,
    h: 0.7,
    fontSize: 12,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Benefits grid (3 columns) - positioned lower with fixed heights
  const benefits = growth?.landingPageCopy?.benefits?.slice(0, 3) || [];
  benefits.forEach((benefit, i) => {
    const xPos = 0.5 + i * 3.1;

    // Benefit card
    slide.addShape("roundRect", {
      x: xPos,
      y: 3.25,
      w: 2.9,
      h: 1.6,
      fill: { color: "FFFFFF" },
      line: { color: opts.colors.accent.replace("#", ""), width: 2 },
      rectRadius: 0.1,
    });

    // Icon placeholder (circle with number)
    slide.addShape("ellipse", {
      x: xPos + 0.1,
      y: 3.35,
      w: 0.35,
      h: 0.35,
      fill: { color: opts.colors.primary.replace("#", "") },
    });

    slide.addText(String(i + 1), {
      x: xPos + 0.1,
      y: 3.38,
      w: 0.35,
      fontSize: 12,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
    });

    // Benefit title (truncated)
    slide.addText(truncateText(benefit.title, 30), {
      x: xPos + 0.55,
      y: 3.35,
      w: 2.2,
      fontSize: 11,
      bold: true,
      color: LIGHT_COLORS.text,
      fontFace: "Arial",
    });

    // Benefit description (truncated with fixed height)
    slide.addText(truncateText(benefit.description, 80), {
      x: xPos + 0.1,
      y: 3.8,
      w: 2.7,
      h: 0.95,
      fontSize: 9,
      color: LIGHT_COLORS.muted,
      fontFace: "Arial",
      breakLine: true,
      valign: "top",
    });
  });
}

// Slide 4: Market Validation
function createMarketValidationSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  _overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "LIGHT_MASTER" });
  const { foundation } = data;

  addSlideHeader(slide, "Market Validation", opts.colors);

  const viability = foundation?.marketViability;

  // Viability score callout (large, left side)
  const score = viability?.overallScore || 0;

  slide.addShape("ellipse", {
    x: 0.5,
    y: 1.5,
    w: 2,
    h: 2,
    fill: { color: getScoreColor(score) },
  });

  slide.addText(String(score), {
    x: 0.5,
    y: 1.8,
    w: 2,
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("/100", {
    x: 0.5,
    y: 2.6,
    w: 2,
    fontSize: 14,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("Viability Score", {
    x: 0.5,
    y: 3.6,
    w: 2,
    fontSize: 12,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  // Score breakdown table
  const breakdown = viability?.scoreBreakdown || [];
  if (breakdown.length > 0) {
    const tableData: PptxGenJS.TableRow[] = [
      [
        { text: "Factor", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Score", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Assessment", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
      ],
    ];

    breakdown.slice(0, 5).forEach((item) => {
      tableData.push([
        { text: item.factor },
        { text: `${item.score}/100`, options: { align: "center" } },
        { text: item.assessment.substring(0, 50) + (item.assessment.length > 50 ? "..." : "") },
      ]);
    });

    slide.addTable(tableData, {
      x: 3,
      y: 1.3,
      w: 6.5,
      fontSize: 10,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [1.5, 0.8, 4.2],
    });
  }

  // Key insights
  const research = viability?.marketResearch;
  if (research?.trends && research.trends.length > 0) {
    slide.addText("Key Market Trends", {
      x: 3,
      y: 3.8,
      fontSize: 12,
      bold: true,
      color: LIGHT_COLORS.muted,
      fontFace: "Arial",
    });

    const trendText = research.trends.slice(0, 3).map((t) => `• ${t}`).join("\n");
    slide.addText(trendText, {
      x: 3,
      y: 4.1,
      w: 6.5,
      fontSize: 10,
      color: LIGHT_COLORS.text,
      fontFace: "Arial",
      breakLine: true,
    });
  }
}

// Slide 5: Competitive Landscape
function createCompetitiveLandscapeSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "LIGHT_MASTER" });
  const { foundation } = data;

  addSlideHeader(slide, "Competitive Landscape", opts.colors);

  const competitors = foundation?.marketViability?.competitorAnalysis || [];

  if (competitors.length > 0) {
    // Competitor table with truncated values
    const tableData: PptxGenJS.TableRow[] = [
      [
        { text: "Competitor", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Pricing", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Positioning", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Our Advantage", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
      ],
    ];

    competitors.slice(0, 4).forEach((comp) => {
      tableData.push([
        { text: truncateText(comp.name, 20), options: { fontSize: 9 } },
        { text: truncateText(comp.pricing, 15) || "N/A", options: { fontSize: 9 } },
        { text: truncateText(comp.positioning, 35), options: { fontSize: 9 } },
        { text: truncateText(comp.weakness, 35), options: { fontSize: 9 } },
      ]);
    });

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.2,
      w: 9,
      fontSize: 9,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [1.8, 1.2, 3, 3],
    });
  }

  // Positioning statement box (with truncated text to prevent overflow)
  slide.addShape("roundRect", {
    x: 0.5,
    y: 3.9,
    w: 9,
    h: 1.0,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  const diffText = truncateText(overview.differentiation || "trusted local choice", 50);
  const audienceText = truncateText(overview.audience, 40);
  const positioning = `We're the ${diffText} for ${audienceText}`;
  slide.addText(truncateText(positioning, 100), {
    x: 0.7,
    y: 4.05,
    w: 8.6,
    h: 0.7,
    fontSize: 13,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
    valign: "middle",
  });
}

// Slide 6: Financial Projections
function createFinancialProjectionsSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  _overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "LIGHT_MASTER" });
  const { financial } = data;

  addSlideHeader(slide, "Financial Projections", opts.colors);

  // Startup costs callout - use parseCurrency for string values
  const totalStartup = financial?.startupCostsSummary?.reduce((sum, item) => {
    return sum + parseCurrency(item.cost);
  }, 0) || 0;

  slide.addShape("roundRect", {
    x: 0.5,
    y: 1.15,
    w: 2.8,
    h: 1.3,
    fill: { color: opts.colors.primary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Startup Cost", {
    x: 0.5,
    y: 1.2,
    w: 2.8,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalStartup), {
    x: 0.5,
    y: 1.5,
    w: 2.8,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Monthly costs callout - use parseCurrency
  const totalMonthly = financial?.monthlyOperatingCosts?.reduce((sum, item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemAny = item as any;
    return sum + parseCurrency(itemAny.monthlyCost || itemAny.cost);
  }, 0) || 0;

  slide.addShape("roundRect", {
    x: 3.5,
    y: 1.15,
    w: 2.8,
    h: 1.3,
    fill: { color: opts.colors.secondary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Monthly Costs", {
    x: 3.5,
    y: 1.2,
    w: 2.8,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalMonthly), {
    x: 3.5,
    y: 1.5,
    w: 2.8,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Revenue projections table - use parseCurrency for all values
  const projections = financial?.revenueProjections;
  if (projections) {
    const tableData: PptxGenJS.TableRow[] = [
      [
        { text: "Scenario", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Monthly Rev", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Monthly Profit", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
        { text: "Break-Even", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF", fontSize: 9 } },
      ],
      [
        { text: "Conservative", options: { fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.conservative?.monthlyRevenue)), options: { fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.conservative?.monthlyProfit)), options: { fontSize: 9 } },
        { text: truncateText(projections.conservative?.breakEvenMonth, 12) || "N/A", options: { fontSize: 9 } },
      ],
      [
        { text: "Moderate", options: { bold: true, fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.moderate?.monthlyRevenue)), options: { bold: true, fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.moderate?.monthlyProfit)), options: { bold: true, fontSize: 9 } },
        { text: truncateText(projections.moderate?.breakEvenMonth, 12) || "N/A", options: { bold: true, fontSize: 9 } },
      ],
      [
        { text: "Aggressive", options: { fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.aggressive?.monthlyRevenue)), options: { fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.aggressive?.monthlyProfit)), options: { fontSize: 9 } },
        { text: truncateText(projections.aggressive?.breakEvenMonth, 12) || "N/A", options: { fontSize: 9 } },
      ],
    ];

    slide.addTable(tableData, {
      x: 0.5,
      y: 2.7,
      w: 5.8,
      fontSize: 9,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [1.4, 1.5, 1.5, 1.4],
    });
  }

  // Annual revenue callout (moderate scenario) - use parseCurrency
  const monthlyRev = parseCurrency(projections?.moderate?.monthlyRevenue);
  const annualRevenue = monthlyRev * 12;

  slide.addShape("roundRect", {
    x: 6.5,
    y: 1.15,
    w: 3,
    h: 2.6,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Projected Annual Revenue", {
    x: 6.5,
    y: 1.25,
    w: 3,
    fontSize: 10,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(annualRevenue), {
    x: 6.5,
    y: 1.7,
    w: 3,
    fontSize: 32,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("(Moderate Scenario)", {
    x: 6.5,
    y: 2.4,
    w: 3,
    fontSize: 9,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
    align: "center",
  });

  // Break-even info (truncated)
  const breakEven = financial?.breakEvenAnalysis;
  if (breakEven) {
    const breakEvenText = breakEven.description || (breakEven.unitsNeeded ? `${breakEven.unitsNeeded} units` : "");
    slide.addText(`Break-even: ${truncateText(breakEvenText, 25)}`, {
      x: 6.5,
      y: 2.9,
      w: 3,
      fontSize: 9,
      color: LIGHT_COLORS.text,
      fontFace: "Arial",
      align: "center",
    });
  }
}

// Slide 7: The Ask / Next Steps
function createAskSlide(
  opts: SlideOptions,
  data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "DARK_MASTER" });
  const { checklist, financial } = data;

  // Decorative accent bar at top
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.1,
    fill: { color: DARK_COLORS.accent },
  });

  // Header
  slide.addText("Next Steps", {
    x: 0.5,
    y: 0.4,
    fontSize: 32,
    bold: true,
    color: DARK_COLORS.accent,
    fontFace: "Arial",
  });

  // What we need section
  slide.addText("What We Need to Launch", {
    x: 0.5,
    y: 1.1,
    fontSize: 14,
    bold: true,
    color: DARK_COLORS.muted,
    fontFace: "Arial",
  });

  // Calculate total startup needed - use parseCurrency
  const totalStartup = financial?.startupCostsSummary?.reduce((sum, item) => {
    return sum + parseCurrency(item.cost);
  }, 0) || 0;

  const needs = [
    `Starting capital: ${formatCurrency(totalStartup)}`,
    "Location/space (if applicable)",
    "Strategic partnerships",
  ];

  needs.forEach((need, i) => {
    slide.addText(`• ${need}`, {
      x: 0.5,
      y: 1.4 + i * 0.35,
      w: 5,
      fontSize: 14,
      color: DARK_COLORS.text,
      fontFace: "Arial",
    });
  });

  // Timeline (from checklist)
  slide.addText("4-Week Launch Timeline", {
    x: 0.5,
    y: 2.8,
    fontSize: 14,
    bold: true,
    color: DARK_COLORS.muted,
    fontFace: "Arial",
  });

  const weeks = checklist?.weeks || [];
  weeks.slice(0, 4).forEach((week, i) => {
    slide.addShape("roundRect", {
      x: 0.5 + i * 2.3,
      y: 3.1,
      w: 2.1,
      h: 1.1,
      fill: { color: i === 0 ? DARK_COLORS.accent : "3D3D3D" },
      rectRadius: 0.05,
    });

    slide.addText(`Week ${week.weekNumber}`, {
      x: 0.5 + i * 2.3,
      y: 3.2,
      w: 2.1,
      fontSize: 10,
      bold: true,
      color: i === 0 ? DARK_COLORS.background : DARK_COLORS.text,
      fontFace: "Arial",
      align: "center",
    });

    slide.addText(week.title.substring(0, 25) + (week.title.length > 25 ? "..." : ""), {
      x: 0.55 + i * 2.3,
      y: 3.5,
      w: 2,
      fontSize: 9,
      color: i === 0 ? DARK_COLORS.background : DARK_COLORS.muted,
      fontFace: "Arial",
      align: "center",
    });
  });

  // Contact/CTA
  slide.addText("Let's build this together.", {
    x: 0.5,
    y: 4.5,
    fontSize: 24,
    bold: true,
    color: DARK_COLORS.accent,
    fontFace: "Arial",
  });

  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";
  slide.addText(`${overview.name}${location ? ` • ${location}` : ""}`, {
    x: 0.5,
    y: 5.0,
    fontSize: 14,
    color: DARK_COLORS.muted,
    fontFace: "Arial",
  });

  // SparkLocal watermark
  slide.addText("Built with SparkLocal.co", {
    x: 7.5,
    y: 5.1,
    fontSize: 8,
    color: "666666",
    fontFace: "Arial",
  });
}

// Helper: Add consistent header to light slides
function addSlideHeader(slide: PptxGenJS.Slide, title: string, colors: CategoryColors) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.1,
    h: "100%",
    fill: { color: colors.primary.replace("#", "") },
  });

  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    fontSize: 28,
    bold: true,
    color: colors.primary.replace("#", ""),
    fontFace: "Arial",
  });
}

// Helper: Get color based on score
function getScoreColor(score: number): string {
  if (score >= 80) return "16A34A"; // Green
  if (score >= 60) return "CA8A04"; // Yellow
  if (score >= 40) return "EA580C"; // Orange
  return "DC2626"; // Red
}
