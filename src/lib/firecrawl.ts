// Firecrawl API Client
// Used for scraping competitor websites to extract messaging, pricing, and positioning

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  content: string;
  success: boolean;
  error?: string;
}

export interface CompetitorInsight {
  url: string;
  name: string;
  tagline: string;
  description: string;
  keyMessages: string[];
  targetAudience: string;
  pricingModel: string;
  differentiators: string[];
  rawContent: string;
}

interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    content?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
    };
  };
  error?: string;
}

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1";

/**
 * Scrape a single URL using Firecrawl
 */
async function scrapeUrl(url: string): Promise<ScrapedPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY not configured");
  }

  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 30000
      })
    });

    if (!response.ok) {
      const _errorText = await response.text();
      console.error(`Firecrawl error for ${url}:`, response.status);
      return {
        url,
        title: "",
        description: "",
        content: "",
        success: false,
        error: `HTTP ${response.status}`
      };
    }

    const data: FirecrawlScrapeResponse = await response.json();

    if (!data.success) {
      return {
        url,
        title: "",
        description: "",
        content: "",
        success: false,
        error: data.error || "Unknown error"
      };
    }

    return {
      url,
      title: data.data?.metadata?.title || data.data?.metadata?.ogTitle || "",
      description: data.data?.metadata?.description || data.data?.metadata?.ogDescription || "",
      content: data.data?.markdown || data.data?.content || "",
      success: true
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return {
      url,
      title: "",
      description: "",
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Extract key insights from scraped content
 */
function extractInsights(page: ScrapedPage): CompetitorInsight {
  const content = page.content.toLowerCase();
  const contentLines = page.content.split('\n').filter(line => line.trim());

  // Extract tagline (usually in first few lines or title)
  let tagline = "";
  const firstLines = contentLines.slice(0, 5);
  for (const line of firstLines) {
    if (line.length > 10 && line.length < 150 && !line.startsWith('#')) {
      tagline = line.trim();
      break;
    }
  }

  // Extract key messages (look for headers and bold text)
  const keyMessages: string[] = [];
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(page.content)) !== null) {
    if (match[1].length > 5 && match[1].length < 100) {
      keyMessages.push(match[1]);
    }
  }

  // Detect pricing model
  let pricingModel = "Not visible on homepage";
  if (content.includes("free") && content.includes("premium")) {
    pricingModel = "Freemium model";
  } else if (content.includes("subscription") || content.includes("/month") || content.includes("per month")) {
    pricingModel = "Subscription-based";
  } else if (content.includes("donate") || content.includes("donation")) {
    pricingModel = "Donation-based";
  } else if (content.includes("grant") || content.includes("funded")) {
    pricingModel = "Grant/Foundation funded";
  } else if (content.includes("free") || content.includes("no cost")) {
    pricingModel = "Free/Open access";
  }

  // Detect target audience
  let targetAudience = "General public";
  const audiencePatterns = [
    { pattern: /for (students|learners|educators)/i, audience: "Students/Educators" },
    { pattern: /for (nonprofits?|organizations?)/i, audience: "Nonprofits/Organizations" },
    { pattern: /for (businesses?|companies|enterprises)/i, audience: "Businesses" },
    { pattern: /for (communities|neighborhoods)/i, audience: "Local communities" },
    { pattern: /for (families|parents|children)/i, audience: "Families" },
    { pattern: /for (volunteers?)/i, audience: "Volunteers" },
  ];
  for (const { pattern, audience } of audiencePatterns) {
    if (pattern.test(content)) {
      targetAudience = audience;
      break;
    }
  }

  // Extract differentiators (unique value props)
  const differentiators: string[] = [];
  const diffPatterns = [
    /(?:only|first|unique|unlike|different from)[^.]+/gi,
    /(?:we believe|our mission|our approach)[^.]+/gi,
  ];
  for (const pattern of diffPatterns) {
    const matches = page.content.match(pattern);
    if (matches) {
      differentiators.push(...matches.slice(0, 2).map(m => m.trim()));
    }
  }

  // Extract name from title or first header
  let name = page.title.split(' - ')[0].split(' | ')[0].trim();
  if (!name) {
    const firstHeader = page.content.match(/^#\s+(.+)$/m);
    name = firstHeader ? firstHeader[1] : new URL(page.url).hostname;
  }

  return {
    url: page.url,
    name,
    tagline: tagline || page.description,
    description: page.description,
    keyMessages: keyMessages.slice(0, 5),
    targetAudience,
    pricingModel,
    differentiators: differentiators.slice(0, 3),
    rawContent: page.content.slice(0, 3000) // Limit content size
  };
}

/**
 * Scrape multiple competitor URLs and extract insights
 */
export async function scrapeCompetitors(urls: string[]): Promise<CompetitorInsight[]> {
  if (!urls.length) {
    return [];
  }

  // Limit to first 3 URLs to avoid rate limits and keep costs down
  const urlsToScrape = urls.slice(0, 3);

  // Scrape all URLs in parallel
  const results = await Promise.all(
    urlsToScrape.map(url => scrapeUrl(url))
  );

  // Extract insights from successful scrapes
  const insights: CompetitorInsight[] = [];
  for (const result of results) {
    if (result.success && result.content) {
      insights.push(extractInsights(result));
    }
  }

  return insights;
}

/**
 * Scrape a single competitor website
 */
export async function scrapeCompetitor(url: string): Promise<CompetitorInsight | null> {
  const result = await scrapeUrl(url);
  if (result.success && result.content) {
    return extractInsights(result);
  }
  return null;
}
