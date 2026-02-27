// Claude API Client
// Wrapper for Anthropic API calls

// Lazy-loaded Anthropic client (only initialized when needed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let anthropicClient: any = null;

async function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
    return anthropicClient;
  } catch (error) {
    console.error("Failed to load Anthropic SDK:", error);
    throw new Error("Anthropic SDK not available. Please install @anthropic-ai/sdk");
  }
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

// Model tier for simplified model selection
export type ModelTier = "sonnet" | "haiku";

// Map model tiers to actual model identifiers
const MODEL_TIER_MAP: Record<ModelTier, string> = {
  sonnet: "claude-sonnet-4-20250514",
  haiku: "claude-haiku-4-5-20251001",
};

export interface ClaudeOptions {
  model?: string;
  modelTier?: ModelTier; // Simplified model selection: "sonnet" or "haiku"
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  retryOnRateLimit?: boolean; // If true, retry once after 10s on 429
}

const DEFAULT_OPTIONS: ClaudeOptions = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
  retryOnRateLimit: false,
};

// Helper to sleep for a specified duration
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if an error is a rate limit error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRateLimitError(error: any): boolean {
  if (!error) return false;
  // Check for Anthropic SDK rate limit error
  if (error.status === 429) return true;
  if (error.error?.type === "rate_limit_error") return true;
  if (error.message?.includes("rate_limit") || error.message?.includes("429")) return true;
  return false;
}

/**
 * Resolve the model string from options.
 * Priority: modelTier > model > default (sonnet)
 */
function resolveModel(options: ClaudeOptions): string {
  if (options.modelTier) {
    return MODEL_TIER_MAP[options.modelTier];
  }
  if (options.model) {
    return options.model;
  }
  return MODEL_TIER_MAP.sonnet; // Default to sonnet
}

/**
 * Send a message to Claude and get a response
 * Supports retry on rate limit errors when retryOnRateLimit is true
 */
export async function sendMessage(
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const model = resolveModel(options);
  const anthropic = await getAnthropicClient();

  const makeRequest = async (): Promise<string> => {
    const response = await anthropic.messages.create({
      model,
      max_tokens: opts.maxTokens!,
      ...(opts.systemPrompt && { system: opts.systemPrompt }),
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text from response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return textBlock.text;
  };

  try {
    return await makeRequest();
  } catch (error) {
    // Check if we should retry on rate limit
    if (opts.retryOnRateLimit && isRateLimitError(error)) {
      console.log("[Claude] Rate limit hit, waiting 10 seconds before retry...");
      await sleep(10000); // Wait 10 seconds
      try {
        console.log("[Claude] Retrying request after rate limit...");
        return await makeRequest();
      } catch (retryError) {
        console.error("[Claude] Retry also failed:", retryError);
        throw retryError;
      }
    }
    console.error("Claude API error:", error);
    throw error;
  }
}

/**
 * Convert snake_case keys to camelCase recursively
 */
function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (obj !== null && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamelCase(key);
        newObj[camelKey] = convertKeysToCamelCase(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * Extract JSON from a potentially messy Claude response
 */
export function extractJSON(response: string): string {
  let jsonString = response.trim();

  // Remove markdown code blocks if present (handles ```json, ```, or variations)
  const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  }

  // If the response starts with explanatory text before JSON, try to find the JSON
  // Look for the first { or [ that starts a valid JSON structure
  const firstBrace = jsonString.indexOf('{');
  const firstBracket = jsonString.indexOf('[');

  let jsonStart = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    jsonStart = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    jsonStart = firstBrace;
  } else if (firstBracket !== -1) {
    jsonStart = firstBracket;
  }

  if (jsonStart > 0) {
    jsonString = jsonString.substring(jsonStart);
  }

  // Find the matching closing brace/bracket
  if (jsonString.startsWith('{')) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') depth++;
        if (char === '}') {
          depth--;
          if (depth === 0) {
            jsonString = jsonString.substring(0, i + 1);
            break;
          }
        }
      }
    }
  } else if (jsonString.startsWith('[')) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '[') depth++;
        if (char === ']') {
          depth--;
          if (depth === 0) {
            jsonString = jsonString.substring(0, i + 1);
            break;
          }
        }
      }
    }
  }

  return jsonString.trim();
}

/**
 * Send a message and parse the response as JSON
 * Automatically converts snake_case keys to camelCase
 */
export async function sendMessageForJSON<T>(
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await sendMessage(userMessage, options);

  // Log raw response for debugging (in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[Claude] Raw response length:", response.length);
    console.log("[Claude] Raw response preview:", response.substring(0, 500));
  }

  const jsonString = extractJSON(response);

  try {
    const parsed = JSON.parse(jsonString);
    // Convert snake_case keys to camelCase for TypeScript compatibility
    const converted = convertKeysToCamelCase(parsed);

    if (process.env.NODE_ENV === "development") {
      console.log("[Claude] Parsed and converted JSON keys:", Object.keys(converted));
    }

    return converted as T;
  } catch (parseError) {
    console.error("[Claude] Failed to parse JSON response:", parseError);
    console.error("[Claude] Raw response:", response);
    console.error("[Claude] Extracted JSON string:", jsonString);
    throw new Error("Failed to parse Claude response as JSON");
  }
}
