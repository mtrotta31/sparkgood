// Perplexity API Client
// Used for real-time market research, competitor discovery, and trend analysis

export interface PerplexitySearchResult {
  query: string;
  answer: string;
  citations: string[];
}

export interface MarketResearchData {
  marketSize: string;
  demandSignals: string;
  competitorUrls: string[];
  competitorNames: string[];
  fundingLandscape: string;
  trends: string;
  rawResponses: PerplexitySearchResult[];
}

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  citations?: string[];
}

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Send a search query to Perplexity API
 */
async function searchPerplexity(query: string): Promise<PerplexitySearchResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a market research analyst. Provide specific, factual information with data points when available. Be concise but comprehensive. Include specific organization names and URLs when mentioning competitors or similar initiatives."
    },
    {
      role: "user",
      content: query
    }
  ];

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages,
      temperature: 0.2,
      max_tokens: 1024,
      return_citations: true,
      search_recency_filter: "month"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Perplexity API error:", response.status);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data: PerplexityResponse = await response.json();

  return {
    query,
    answer: data.choices?.[0]?.message?.content || "",
    citations: data.citations || []
  };
}

/**
 * Extract URLs from Perplexity response text and citations
 */
function extractUrls(text: string, citations: string[]): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const textUrls = text.match(urlRegex) || [];
  const allUrls = Array.from(new Set([...citations, ...textUrls]));

  // Filter to likely competitor/organization URLs (not news sites, Wikipedia, etc.)
  const filteredUrls = allUrls.filter(url => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      const excludePatterns = [
        'wikipedia.org',
        'news.',
        'bbc.',
        'cnn.',
        'nytimes.',
        'washingtonpost.',
        'forbes.',
        'medium.com',
        'linkedin.com',
        'twitter.com',
        'facebook.com',
        'youtube.com',
        'gov.',
        '.gov'
      ];
      return !excludePatterns.some(pattern => domain.includes(pattern));
    } catch {
      return false;
    }
  });

  return filteredUrls.slice(0, 5);
}

/**
 * Extract key search terms from idea description
 * Makes queries simple and Google-like
 */
function extractKeyTerms(description: string, causeArea: string): string {
  // Remove common filler words and keep the essence
  const fillerWords = [
    'a', 'an', 'the', 'for', 'to', 'and', 'or', 'that', 'which', 'with',
    'personalized', 'innovative', 'revolutionary', 'unique', 'new',
    'helping', 'providing', 'offering', 'creating', 'building',
    'platform', 'service', 'solution', 'app', 'tool', 'system'
  ];

  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !fillerWords.includes(word));

  // Take the most important 3-5 words
  const keyWords = words.slice(0, 5);

  // If causeArea isn't already in the key words, add it
  if (!keyWords.some(w => causeArea.toLowerCase().includes(w))) {
    keyWords.push(causeArea.replace(/_/g, ' '));
  }

  return keyWords.join(' ');
}

/**
 * Extract organization/competitor names from text
 */
function extractCompetitorNames(text: string): string[] {
  // Look for patterns like "Organization Name (website.com)" or "Organization Name - description"
  const patterns = [
    /(?:such as|like|including|examples?:?|competitors?:?)\s*([A-Z][A-Za-z\s]+(?:,\s*[A-Z][A-Za-z\s]+)*)/gi,
    /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)\s+(?:is|are|has|offers|provides)/g
  ];

  const names: string[] = [];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1]?.split(/,\s*/).map((s: string) => s.trim()).filter((s: string) => s.length > 2);
      if (extracted) {
        names.push(...extracted);
      }
    }
  }

  return Array.from(new Set(names)).slice(0, 10);
}

/**
 * Conduct comprehensive market research for a social impact idea
 * Uses SIMPLE search queries like a user would type into Google
 */
export async function conductMarketResearch(
  ideaName: string,
  ideaDescription: string,
  causeArea: string,
  ventureType: string,
  format: string,
  _location: string = "United States"
): Promise<MarketResearchData> {
  // Extract key terms from the idea for simple searches
  const keyTerms = extractKeyTerms(ideaDescription, causeArea);
  const businessType = ventureType === 'business' ? 'companies' :
    ventureType === 'nonprofit' ? 'nonprofits' : 'organizations';

  // SIMPLE queries - like what a user would actually Google
  const queries = [
    // Query 1: Search the idea description directly
    ideaDescription,

    // Query 2: Find actual competitors/similar companies
    `${keyTerms} ${businessType}`,

    // Query 3: Simple market query
    `${keyTerms} market size trends`,
  ];

  // Execute all queries in parallel
  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        return await searchPerplexity(query);
      } catch (error) {
        console.error("Perplexity query failed:", error);
        return { query, answer: "", citations: [] };
      }
    })
  );

  // Extract data from results
  const allCitations = results.flatMap(r => r.citations);
  const allAnswers = results.map(r => r.answer).join("\n\n");

  const competitorUrls = extractUrls(allAnswers, allCitations);
  const competitorNames = extractCompetitorNames(allAnswers);

  return {
    marketSize: results[0]?.answer || "Market research unavailable",
    demandSignals: results[0]?.answer || "",
    competitorUrls,
    competitorNames,
    fundingLandscape: results[2]?.answer || "Funding research unavailable",
    trends: allAnswers,
    rawResponses: results
  };
}

/**
 * Quick research for a specific topic
 */
export async function quickResearch(query: string): Promise<string> {
  try {
    const result = await searchPerplexity(query);
    return result.answer;
  } catch (error) {
    console.error("Quick research failed:", error);
    return "";
  }
}
