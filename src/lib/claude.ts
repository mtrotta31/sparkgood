// Claude API Client
// Wrapper for Anthropic API calls

// Lazy-loaded Anthropic client (only initialized when needed)
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

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

const DEFAULT_OPTIONS: ClaudeOptions = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Send a message to Claude and get a response
 */
export async function sendMessage(
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const anthropic = await getAnthropicClient();

  try {
    const response = await anthropic.messages.create({
      model: opts.model!,
      max_tokens: opts.maxTokens!,
      ...(opts.systemPrompt && { system: opts.systemPrompt }),
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text from response
    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return textBlock.text;
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
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
 */
export async function sendMessageForJSON<T>(
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await sendMessage(userMessage, options);

  const jsonString = extractJSON(response);

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response. Raw response:", response);
    console.error("Extracted JSON string:", jsonString);
    throw new Error("Failed to parse Claude response as JSON");
  }
}
