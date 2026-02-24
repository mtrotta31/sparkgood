// Pitch Deck Generator for Launch Kit V2
// Uses pptxgenjs to create a 7-slide professional deck

import PptxGenJS from "pptxgenjs";
import type { DeepDiveData, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview, formatCurrency, parseCurrency } from "./types";

// Helper to truncate text at sentence boundaries (never mid-thought)
function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);

  // Find the last sentence boundary (. ! ?) before maxLength
  const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
  let lastSentenceEnd = -1;

  for (const ender of sentenceEnders) {
    const idx = truncated.lastIndexOf(ender);
    if (idx > lastSentenceEnd) {
      lastSentenceEnd = idx + 1; // Include the punctuation
    }
  }

  // Also check for end-of-string punctuation
  if (truncated.endsWith('.') || truncated.endsWith('!') || truncated.endsWith('?')) {
    lastSentenceEnd = truncated.length;
  }

  // If we found a sentence boundary and it's not too far back (at least 40% of content)
  if (lastSentenceEnd > maxLength * 0.4) {
    return truncated.substring(0, lastSentenceEnd).trim();
  }

  // No good sentence boundary - try to cut at last comma
  const lastComma = truncated.lastIndexOf(', ');
  if (lastComma > maxLength * 0.4) {
    return truncated.substring(0, lastComma) + ".";
  }

  // Last resort: cut at word boundary with ellipsis
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.4) {
    return truncated.substring(0, lastSpace).trim() + "...";
  }

  return truncated.trim() + "...";
}

// Helper to format market size values (e.g., "$8.99 billion" → "$8.99B")
// Also extracts just the numeric portion if needed
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

// Helper to extract just the number from market size (e.g., "$4.2B US market" → "$4.2B")
function extractMarketNumber(value: string | undefined | null): string {
  if (!value) return "N/A";

  // First format it (billion → B, etc.)
  const formatted = formatMarketSize(value);

  // Extract the first monetary value pattern ($X.XXB, $XXM, etc.)
  const match = formatted.match(/\$[\d.,]+\s*[BMKT]?/i);
  if (match) {
    return match[0].trim();
  }

  // If no dollar sign, try to find just numbers with suffix
  const numMatch = formatted.match(/[\d.,]+\s*[BMKT]/i);
  if (numMatch) {
    return "$" + numMatch[0].trim();
  }

  return formatted;
}

// Helper to extract market description (everything after the number)
function extractMarketDescription(value: string | undefined | null): string {
  if (!value) return "";

  const formatted = formatMarketSize(value);

  // Remove the monetary value pattern to get the description
  const description = formatted
    .replace(/\$[\d.,]+\s*[BMKT]?\s*/i, '')
    .replace(/^[\d.,]+\s*[BMKT]?\s*/i, '')
    .trim();

  return description || "market";
}

// Helper to format currency with proper negative handling
function formatCurrencyWithSign(amount: number): string {
  if (amount < 0) {
    return `-${formatCurrency(Math.abs(amount))}`;
  }
  return formatCurrency(amount);
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
  _data: DeepDiveData,
  overview: ReturnType<typeof extractBusinessOverview>
) {
  const slide = opts.pptx.addSlide({ masterName: "DARK_MASTER" });

  // Clean horizontal accent bar at top
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

  // Clean horizontal accent bar at bottom (replaces rotated rectangle)
  slide.addShape("rect", {
    x: 0,
    y: 5.5,
    w: "100%",
    h: 0.08,
    fill: { color: opts.colors.primary.replace("#", "") },
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

  // Header with accent color
  addSlideHeader(slide, "The Opportunity", opts.colors);

  // Problem statement
  slide.addText("The Problem", {
    x: 0.5,
    y: 1.1,
    fontSize: 12,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.problem, 250), {
    x: 0.5,
    y: 1.35,
    w: 5.2,
    h: 1.2,
    fontSize: 13,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Target audience
  slide.addText("Target Audience", {
    x: 0.5,
    y: 2.65,
    fontSize: 12,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.audience, 220), {
    x: 0.5,
    y: 2.9,
    w: 5.2,
    h: 1.0,
    fontSize: 13,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Market size callout boxes (right side)
  const marketResearch = foundation?.marketViability?.marketResearch;

  // TAM callout - split number and description
  slide.addShape("roundRect", {
    x: 6.0,
    y: 1.1,
    w: 3.5,
    h: 1.4,
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

  // Large number only
  slide.addText(extractMarketNumber(marketResearch?.tam), {
    x: 6.0,
    y: 1.45,
    w: 3.5,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Description below
  const tamDescription = extractMarketDescription(marketResearch?.tam);
  if (tamDescription && tamDescription !== "market") {
    slide.addText(truncateText(tamDescription, 35), {
      x: 6.0,
      y: 2.05,
      w: 3.5,
      fontSize: 9,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
    });
  }

  // SAM box - wider
  slide.addShape("roundRect", {
    x: 6.0,
    y: 2.65,
    w: 1.7,
    h: 1.1,
    fill: { color: opts.colors.secondary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("SAM", {
    x: 6.0,
    y: 2.7,
    w: 1.7,
    fontSize: 9,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(extractMarketNumber(marketResearch?.sam), {
    x: 6.0,
    y: 2.95,
    w: 1.7,
    fontSize: 14,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // SOM box - wider
  slide.addShape("roundRect", {
    x: 7.8,
    y: 2.65,
    w: 1.7,
    h: 1.1,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("SOM", {
    x: 7.8,
    y: 2.7,
    w: 1.7,
    fontSize: 9,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(extractMarketNumber(marketResearch?.som), {
    x: 7.8,
    y: 2.95,
    w: 1.7,
    fontSize: 14,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  // Growth rate - clean formatting
  const growthText = marketResearch?.growthRate || "";
  if (growthText) {
    // Extract just the percentage if present, otherwise show clean version
    const percentMatch = growthText.match(/[\d.]+%/);
    const displayGrowth = percentMatch
      ? `${percentMatch[0]} annual growth`
      : truncateText(growthText, 30);

    slide.addText(displayGrowth, {
      x: 6.0,
      y: 3.9,
      w: 3.5,
      fontSize: 12,
      color: opts.colors.primary.replace("#", ""),
      fontFace: "Arial",
      bold: true,
      align: "center",
    });
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
    y: 1.1,
    fontSize: 11,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
  });

  const description = overview.howItWorks || overview.description || "";
  slide.addText(truncateText(description, 280), {
    x: 0.5,
    y: 1.35,
    w: 9,
    h: 0.8,
    fontSize: 12,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // What makes us different
  slide.addText("What Makes Us Different", {
    x: 0.5,
    y: 2.25,
    fontSize: 11,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
  });

  slide.addText(truncateText(overview.differentiation || data.idea.valueProposition || "", 250), {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 0.7,
    fontSize: 12,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    breakLine: true,
    valign: "top",
  });

  // Benefits grid (3 columns) - titles INSIDE cards
  const benefits = growth?.landingPageCopy?.benefits?.slice(0, 3) || [];
  benefits.forEach((benefit, i) => {
    const xPos = 0.5 + i * 3.1;
    const cardY = 3.3;
    const cardH = 1.6;

    // Benefit card with accent border
    slide.addShape("roundRect", {
      x: xPos,
      y: cardY,
      w: 2.9,
      h: cardH,
      fill: { color: "FFFFFF" },
      line: { color: opts.colors.accent.replace("#", ""), width: 2 },
      rectRadius: 0.1,
    });

    // Icon circle with number - properly centered
    const circleX = xPos + 0.15;
    const circleY = cardY + 0.15;
    const circleSize = 0.35;

    slide.addShape("ellipse", {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fill: { color: opts.colors.primary.replace("#", "") },
    });

    // Number centered in circle
    slide.addText(String(i + 1), {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fontSize: 12,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      align: "center",
      valign: "middle",
    });

    // Benefit title INSIDE the card, next to circle
    slide.addText(truncateText(benefit.title, 25), {
      x: xPos + 0.55,
      y: cardY + 0.18,
      w: 2.2,
      fontSize: 11,
      bold: true,
      color: LIGHT_COLORS.text,
      fontFace: "Arial",
    });

    // Benefit description INSIDE card with sentence-aware truncation
    slide.addText(truncateText(benefit.description, 120), {
      x: xPos + 0.15,
      y: cardY + 0.6,
      w: 2.6,
      h: 0.9,
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

  // Viability score callout (large, left side) - properly centered
  const score = viability?.overallScore || 0;
  const circleX = 0.5;
  const circleY = 1.5;
  const circleW = 2;
  const circleH = 2;

  slide.addShape("ellipse", {
    x: circleX,
    y: circleY,
    w: circleW,
    h: circleH,
    fill: { color: getScoreColor(score) },
  });

  // Score number - centered in circle using full circle dimensions
  slide.addText(String(score), {
    x: circleX,
    y: circleY + 0.3,
    w: circleW,
    h: circleH * 0.5,
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
    valign: "middle",
  });

  slide.addText("/100", {
    x: circleX,
    y: circleY + circleH * 0.6,
    w: circleW,
    fontSize: 14,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("Viability Score", {
    x: circleX,
    y: circleY + circleH + 0.1,
    w: circleW,
    fontSize: 12,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
    align: "center",
  });

  // Score breakdown table with accent-colored header
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
        { text: truncateText(item.assessment, 70) },
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

  // Key insights with accent color
  const research = viability?.marketResearch;
  if (research?.trends && research.trends.length > 0) {
    slide.addText("Key Market Trends", {
      x: 3,
      y: 3.8,
      fontSize: 12,
      bold: true,
      color: opts.colors.primary.replace("#", ""),
      fontFace: "Arial",
    });

    const trendText = research.trends.slice(0, 3).map((t) => `• ${truncateText(t, 80)}`).join("\n");
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
    // Competitor table with rebalanced columns: 25% / 20% / 30% / 25%
    const tableW = 9;
    const colWidths = [tableW * 0.25, tableW * 0.20, tableW * 0.30, tableW * 0.25];

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
        { text: truncateText(comp.name, 28), options: { fontSize: 9 } },
        { text: truncateText(comp.pricing, 22) || "N/A", options: { fontSize: 9 } },
        { text: truncateText(comp.positioning, 45), options: { fontSize: 9 } },
        { text: truncateText(comp.weakness, 38), options: { fontSize: 9 } },
      ]);
    });

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.2,
      w: tableW,
      fontSize: 9,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: colWidths,
    });

    // If only 2 or fewer competitors, add opportunity note
    if (competitors.length <= 2) {
      slide.addText("Limited direct competition represents a significant market opportunity.", {
        x: 0.5,
        y: 2.6 + competitors.length * 0.35,
        w: 9,
        fontSize: 11,
        italic: true,
        color: opts.colors.primary.replace("#", ""),
        fontFace: "Arial",
      });
    }
  }

  // Positioning statement box - show differentiation as standalone statement
  slide.addShape("roundRect", {
    x: 0.5,
    y: 3.9,
    w: 9,
    h: 1.0,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  // Clean positioning: just show the differentiation without broken template
  const differentiation = overview.differentiation || "Your trusted local choice";
  slide.addText(truncateText(differentiation, 150), {
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

  // Calculate totals
  const totalStartup = financial?.startupCostsSummary?.reduce((sum, item) => {
    return sum + parseCurrency(item.cost);
  }, 0) || 0;

  const totalMonthly = financial?.monthlyOperatingCosts?.reduce((sum, item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemAny = item as any;
    return sum + parseCurrency(itemAny.monthlyCost || itemAny.cost);
  }, 0) || 0;

  const projections = financial?.revenueProjections;
  const monthlyRev = parseCurrency(projections?.moderate?.monthlyRevenue);
  const annualRevenue = monthlyRev * 12;

  // Annual revenue callout (HERO - larger and more prominent) - LEFT side now
  slide.addShape("roundRect", {
    x: 0.5,
    y: 1.15,
    w: 3.2,
    h: 2.8,
    fill: { color: opts.colors.accent.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Projected Annual Revenue", {
    x: 0.5,
    y: 1.3,
    w: 3.2,
    fontSize: 11,
    bold: true,
    color: LIGHT_COLORS.text,
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(annualRevenue), {
    x: 0.5,
    y: 1.8,
    w: 3.2,
    fontSize: 36,
    bold: true,
    color: opts.colors.primary.replace("#", ""),
    fontFace: "Arial",
    align: "center",
  });

  slide.addText("(Moderate Scenario)", {
    x: 0.5,
    y: 2.6,
    w: 3.2,
    fontSize: 10,
    color: LIGHT_COLORS.muted,
    fontFace: "Arial",
    align: "center",
  });

  // Break-even info with proper sentence handling
  const breakEven = financial?.breakEvenAnalysis;
  if (breakEven) {
    const breakEvenText = breakEven.description || (breakEven.unitsNeeded ? `${breakEven.unitsNeeded} units needed` : "");
    if (breakEvenText) {
      slide.addText(truncateText(breakEvenText, 50), {
        x: 0.5,
        y: 3.0,
        w: 3.2,
        h: 0.8,
        fontSize: 10,
        color: LIGHT_COLORS.text,
        fontFace: "Arial",
        align: "center",
        valign: "top",
        breakLine: true,
      });
    }
  }

  // Startup costs callout - smaller, right side top
  slide.addShape("roundRect", {
    x: 4.0,
    y: 1.15,
    w: 2.7,
    h: 1.3,
    fill: { color: opts.colors.primary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Startup Cost", {
    x: 4.0,
    y: 1.2,
    w: 2.7,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalStartup), {
    x: 4.0,
    y: 1.5,
    w: 2.7,
    fontSize: 26,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Monthly costs callout - smaller, right side
  slide.addShape("roundRect", {
    x: 7.0,
    y: 1.15,
    w: 2.5,
    h: 1.3,
    fill: { color: opts.colors.secondary.replace("#", "") },
    rectRadius: 0.1,
  });

  slide.addText("Monthly Costs", {
    x: 7.0,
    y: 1.2,
    w: 2.5,
    fontSize: 10,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  slide.addText(formatCurrency(totalMonthly), {
    x: 7.0,
    y: 1.5,
    w: 2.5,
    fontSize: 24,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
    align: "center",
  });

  // Revenue projections table with proper negative formatting
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
        { text: formatCurrencyWithSign(parseCurrency(projections.conservative?.monthlyProfit)), options: { fontSize: 9 } },
        { text: truncateText(projections.conservative?.breakEvenMonth, 15) || "N/A", options: { fontSize: 9 } },
      ],
      [
        { text: "Moderate", options: { bold: true, fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.moderate?.monthlyRevenue)), options: { bold: true, fontSize: 9 } },
        { text: formatCurrencyWithSign(parseCurrency(projections.moderate?.monthlyProfit)), options: { bold: true, fontSize: 9 } },
        { text: truncateText(projections.moderate?.breakEvenMonth, 15) || "N/A", options: { bold: true, fontSize: 9 } },
      ],
      [
        { text: "Aggressive", options: { fontSize: 9 } },
        { text: formatCurrency(parseCurrency(projections.aggressive?.monthlyRevenue)), options: { fontSize: 9 } },
        { text: formatCurrencyWithSign(parseCurrency(projections.aggressive?.monthlyProfit)), options: { fontSize: 9 } },
        { text: truncateText(projections.aggressive?.breakEvenMonth, 15) || "N/A", options: { fontSize: 9 } },
      ],
    ];

    slide.addTable(tableData, {
      x: 4.0,
      y: 2.7,
      w: 5.5,
      fontSize: 9,
      fontFace: "Arial",
      color: LIGHT_COLORS.text,
      border: { type: "solid", color: "E5E7EB", pt: 0.5 },
      colW: [1.3, 1.4, 1.4, 1.4],
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

  // What we need section - dynamic based on actual data
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
    return sum + parseCurrency(item.cost);
  }, 0) || 0;

  // Build needs list from actual data (no generic filler)
  const needs: string[] = [];

  if (totalStartup > 0) {
    needs.push(`Starting capital: ${formatCurrency(totalStartup)}`);
  }

  // Add specific needs from startup costs items
  const startupItems = financial?.startupCostsSummary || [];
  const significantItems = startupItems
    .filter(item => parseCurrency(item.cost) > totalStartup * 0.15)
    .slice(0, 2);

  significantItems.forEach(item => {
    if (item.item && !item.item.toLowerCase().includes('misc')) {
      needs.push(`${item.item}: ${formatCurrency(parseCurrency(item.cost))}`);
    }
  });

  // Add partnerships/suppliers if available
  if (data.foundation?.suppliers?.platforms && data.foundation.suppliers.platforms.length > 0) {
    needs.push("Key supplier relationships");
  }

  // Ensure we have at least 2 items
  if (needs.length < 2) {
    needs.push("Strategic partnerships");
  }

  needs.slice(0, 3).forEach((need, i) => {
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

    slide.addText(truncateText(week.title, 28), {
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

// Helper: Add consistent header to light slides with accent color
function addSlideHeader(slide: PptxGenJS.Slide, title: string, colors: CategoryColors) {
  // Vertical accent bar on left
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.1,
    h: "100%",
    fill: { color: colors.primary.replace("#", "") },
  });

  // Title with accent color
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    fontSize: 28,
    bold: true,
    color: colors.primary.replace("#", ""),
    fontFace: "Arial",
  });

  // Thin horizontal accent line under title
  slide.addShape("rect", {
    x: 0.5,
    y: 0.85,
    w: 2,
    h: 0.03,
    fill: { color: colors.accent.replace("#", "") },
  });
}

// Helper: Get color based on score
function getScoreColor(score: number): string {
  if (score >= 80) return "16A34A"; // Green
  if (score >= 60) return "CA8A04"; // Yellow
  if (score >= 40) return "EA580C"; // Orange
  return "DC2626"; // Red
}
