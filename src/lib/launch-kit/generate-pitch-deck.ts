// Pitch Deck Generator for Launch Kit V2
// Uses pptxgenjs to create a 7-slide professional deck

import PptxGenJS from "pptxgenjs";
import type { DeepDiveData, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview, formatCurrency } from "./types";

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
    y: 1.2,
    fontSize: 14,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(overview.problem, {
    x: 0.5,
    y: 1.5,
    w: 5.5,
    fontSize: 16,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
  });

  // Target audience
  slide.addText("Target Audience", {
    x: 0.5,
    y: 2.8,
    fontSize: 14,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(overview.audience, {
    x: 0.5,
    y: 3.1,
    w: 5.5,
    fontSize: 16,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
  });

  // Market size callout box (right side)
  const marketResearch = foundation?.marketViability?.marketResearch;
  if (marketResearch) {
    // TAM callout
    slide.addShape("roundRect", {
      x: 6.5,
      y: 1.2,
      w: 3,
      h: 1.5,
      fill: { color: opts.colors.primary.replace("#", "") },
      rectRadius: 0.1,
    });

    slide.addText("TAM", {
      x: 6.5,
      y: 1.3,
      w: 3,
      fontSize: 12,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
    });

    slide.addText(marketResearch.tam || "N/A", {
      x: 6.5,
      y: 1.7,
      w: 3,
      fontSize: 28,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
    });

    // SAM and SOM boxes
    slide.addShape("roundRect", {
      x: 6.5,
      y: 2.9,
      w: 1.4,
      h: 1.2,
      fill: { color: opts.colors.secondary.replace("#", "") },
      rectRadius: 0.1,
    });

    slide.addText([
      { text: "SAM\n", options: { fontSize: 10, color: "FFFFFF" } },
      { text: marketResearch.sam || "N/A", options: { fontSize: 16, bold: true, color: "FFFFFF" } },
    ], {
      x: 6.5,
      y: 3.0,
      w: 1.4,
      align: "center",
      fontFace: "Arial",
    });

    slide.addShape("roundRect", {
      x: 8.1,
      y: 2.9,
      w: 1.4,
      h: 1.2,
      fill: { color: opts.colors.accent.replace("#", "") },
      rectRadius: 0.1,
    });

    slide.addText([
      { text: "SOM\n", options: { fontSize: 10, color: LIGHT_COLORS.text } },
      { text: marketResearch.som || "N/A", options: { fontSize: 16, bold: true, color: LIGHT_COLORS.text } },
    ], {
      x: 8.1,
      y: 3.0,
      w: 1.4,
      align: "center",
      fontFace: "Arial",
    });

    // Growth rate
    if (marketResearch.growthRate) {
      slide.addText(`Industry Growth: ${marketResearch.growthRate}`, {
        x: 6.5,
        y: 4.3,
        w: 3,
        fontSize: 14,
        color: opts.colors.primary.replace("#", ""),
        fontFace: "Arial",
        bold: true,
      });
    }
  }
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
    y: 1.2,
    fontSize: 14,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  const description = overview.howItWorks || overview.description;
  slide.addText(description.substring(0, 300) + (description.length > 300 ? "..." : ""), {
    x: 0.5,
    y: 1.5,
    w: 9,
    fontSize: 14,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
  });

  // What makes us different
  slide.addText("What Makes Us Different", {
    x: 0.5,
    y: 2.5,
    fontSize: 14,
    bold: true,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
  });

  slide.addText(overview.differentiation || data.idea.valueProposition || "", {
    x: 0.5,
    y: 2.8,
    w: 9,
    fontSize: 14,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
  });

  // Benefits grid (3 columns)
  const benefits = growth?.landingPageCopy?.benefits?.slice(0, 3) || [];
  benefits.forEach((benefit, i) => {
    const xPos = 0.5 + i * 3.2;

    // Benefit card
    slide.addShape("roundRect", {
      x: xPos,
      y: 3.5,
      w: 3,
      h: 1.5,
      fill: { color: "FFFFFF" },
      line: { color: opts.colors.accent.replace("#", ""), width: 2 },
      rectRadius: 0.1,
    });

    // Icon placeholder (circle with number)
    slide.addShape("ellipse", {
      x: xPos + 0.1,
      y: 3.6,
      w: 0.4,
      h: 0.4,
      fill: { color: opts.colors.primary.replace("#", "") },
    });

    slide.addText(String(i + 1), {
      x: xPos + 0.1,
      y: 3.65,
      w: 0.4,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
    });

    // Benefit title
    slide.addText(benefit.title, {
      x: xPos + 0.6,
      y: 3.6,
      w: 2.3,
      fontSize: 12,
      bold: true,
      color: LIGHT_COLORS.text,
      fontFace: "Arial",
    });

    // Benefit description
    slide.addText(benefit.description.substring(0, 100) + (benefit.description.length > 100 ? "..." : ""), {
      x: xPos + 0.1,
      y: 4.1,
      w: 2.8,
      fontSize: 10,
      color: LIGHT_COLORS.muted,
      fontFace: "Arial",
      breakLine: true,
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
    // Competitor table
    const tableData: PptxGenJS.TableRow[] = [
      [
        { text: "Competitor", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Pricing", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Positioning", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Our Advantage", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
      ],
    ];

    competitors.slice(0, 5).forEach((comp) => {
      tableData.push([
        { text: comp.name },
        { text: comp.pricing || "N/A" },
        { text: comp.positioning?.substring(0, 40) + (comp.positioning?.length > 40 ? "..." : "") || "" },
        { text: comp.weakness?.substring(0, 40) + (comp.weakness?.length > 40 ? "..." : "") || "" },
      ]);
    });

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.3,
      w: 9,
      fontSize: 10,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [2, 1.5, 2.75, 2.75],
    });
  }

  // Positioning statement
  slide.addShape("roundRect", {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 1.2,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  const positioning = `We're the ${overview.differentiation || "trusted local choice"} for ${overview.audience}`;
  slide.addText(positioning, {
    x: 0.8,
    y: 4.1,
    w: 8.4,
    fontSize: 16,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
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

  // Startup costs callout
  const totalStartup = financial?.startupCostsSummary?.reduce((sum, item) => {
    const cost = parseFloat(String(item.cost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0) || 0;

  slide.addShape("roundRect", {
    x: 0.5,
    y: 1.3,
    w: 2.5,
    h: 1.4,
    fill: { color: opts.colors.primary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Startup Cost", {
    x: 0.5,
    y: 1.4,
    w: 2.5,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalStartup), {
    x: 0.5,
    y: 1.7,
    w: 2.5,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Monthly costs callout
  const totalMonthly = financial?.monthlyOperatingCosts?.reduce((sum, item) => {
    const cost = parseFloat(String(item.monthlyCost || item.cost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0) || 0;

  slide.addShape("roundRect", {
    x: 3.2,
    y: 1.3,
    w: 2.5,
    h: 1.4,
    fill: { color: opts.colors.secondary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Monthly Costs", {
    x: 3.2,
    y: 1.4,
    w: 2.5,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalMonthly), {
    x: 3.2,
    y: 1.7,
    w: 2.5,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Revenue projections table
  const projections = financial?.revenueProjections;
  if (projections) {
    const tableData: PptxGenJS.TableRow[] = [
      [
        { text: "Scenario", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Monthly Revenue", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Monthly Profit", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
        { text: "Break-Even", options: { bold: true, fill: { color: opts.colors.primary.replace("#", "") }, color: "FFFFFF" } },
      ],
      [
        { text: "Conservative" },
        { text: formatCurrency(projections.conservative?.monthlyRevenue || 0) },
        { text: formatCurrency(projections.conservative?.monthlyProfit || 0) },
        { text: projections.conservative?.breakEvenMonth || "N/A" },
      ],
      [
        { text: "Moderate", options: { bold: true } },
        { text: formatCurrency(projections.moderate?.monthlyRevenue || 0), options: { bold: true } },
        { text: formatCurrency(projections.moderate?.monthlyProfit || 0), options: { bold: true } },
        { text: projections.moderate?.breakEvenMonth || "N/A", options: { bold: true } },
      ],
      [
        { text: "Aggressive" },
        { text: formatCurrency(projections.aggressive?.monthlyRevenue || 0) },
        { text: formatCurrency(projections.aggressive?.monthlyProfit || 0) },
        { text: projections.aggressive?.breakEvenMonth || "N/A" },
      ],
    ];

    slide.addTable(tableData, {
      x: 0.5,
      y: 3.0,
      w: 5.5,
      fontSize: 11,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [1.5, 1.5, 1.3, 1.2],
    });
  }

  // Annual revenue callout (moderate scenario)
  const annualRevenue = (projections?.moderate?.monthlyRevenue || 0) * 12;

  slide.addShape("roundRect", {
    x: 6.5,
    y: 1.3,
    w: 3,
    h: 2.8,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Projected Annual Revenue", {
    x: 6.5,
    y: 1.5,
    w: 3,
    fontSize: 11,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(annualRevenue), {
    x: 6.5,
    y: 2.0,
    w: 3,
    fontSize: 36,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("(Moderate Scenario)", {
    x: 6.5,
    y: 2.8,
    w: 3,
    fontSize: 10,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
    align: "center",
  });

  // Break-even info
  const breakEven = financial?.breakEvenAnalysis;
  if (breakEven) {
    slide.addText(`Break-even: ${breakEven.description || `${breakEven.unitsNeeded} units`}`, {
      x: 6.5,
      y: 3.3,
      w: 3,
      fontSize: 10,
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

  // Calculate total startup needed
  const totalStartup = financial?.startupCostsSummary?.reduce((sum, item) => {
    const cost = parseFloat(String(item.cost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
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
