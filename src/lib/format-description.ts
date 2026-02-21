// Utility to clean up poor quality descriptions from data scrapers
// Handles doubled words, bad punctuation, and garbage text

/**
 * Cleans up a description string by:
 * - Removing doubled words (e.g., "meeting space space")
 * - Fixing punctuation issues
 * - Adding proper sentence ending punctuation
 * - Returns null for garbage text that provides no real value
 */
export function formatDescription(
  description: string | null | undefined,
  metadata?: { category?: string; city?: string; state?: string }
): string | null {
  if (!description) return null;

  let cleaned = description.trim();

  // Return null for empty strings
  if (!cleaned) return null;

  // Remove doubled words (case-insensitive, handles "space space", "meeting meeting")
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, "$1");

  // Remove tripled+ words
  cleaned = cleaned.replace(/\b(\w+)(\s+\1){2,}\b/gi, "$1");

  // Fix multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  // Fix multiple periods
  cleaned = cleaned.replace(/\.{2,}/g, ".");

  // Fix space before punctuation
  cleaned = cleaned.replace(/\s+([.,!?;:])/g, "$1");

  // Fix missing space after punctuation (but not for abbreviations like "U.S.")
  cleaned = cleaned.replace(/([.,!?;:])([A-Za-z])/g, "$1 $2");

  // Detect and reject garbage descriptions that are just "[category] in [location]"
  const garbagePatterns = [
    // "Coworking in Austin, TX"
    /^(coworking|cowork|workspace|office|meeting\s*room|accelerator|incubator|grant|sba)\s*(space|center|hub)?\s*(in|near|at)\s+[\w\s,]+$/i,
    // "Office space in Austin"
    /^office\s*space\s*(in|near|at)\s+[\w\s,]+$/i,
    // Just a city/state
    /^[\w\s]+,\s*[A-Z]{2}$/,
    // Very short (less than 15 chars after cleaning) likely garbage
  ];

  for (const pattern of garbagePatterns) {
    if (pattern.test(cleaned)) {
      return null;
    }
  }

  // If metadata provided, check for descriptions that are just category + location
  if (metadata?.city || metadata?.state) {
    const locationParts = [
      metadata.city?.toLowerCase(),
      metadata.state?.toLowerCase(),
    ].filter(Boolean);

    const categoryTerms = getCategoryTerms(metadata.category);

    // Build a pattern that matches just category terms + location
    const lowerCleaned = cleaned.toLowerCase();

    // Remove category terms and location from description to see what's left
    let remaining = lowerCleaned;
    for (const term of categoryTerms) {
      remaining = remaining.replace(new RegExp(term, "gi"), "").trim();
    }
    for (const part of locationParts) {
      if (part) {
        remaining = remaining.replace(new RegExp(part, "gi"), "").trim();
      }
    }

    // Remove common filler words
    remaining = remaining
      .replace(/\b(in|at|near|the|a|an|of|for|and|or|with)\b/gi, "")
      .replace(/[,.\s]+/g, " ")
      .trim();

    // If nothing substantive remains, it's garbage
    if (remaining.length < 10) {
      return null;
    }
  }

  // Too short to be useful
  if (cleaned.length < 20) {
    return null;
  }

  // Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned;
}

/**
 * Get terms associated with a category for garbage detection
 */
function getCategoryTerms(category?: string): string[] {
  switch (category?.toLowerCase()) {
    case "coworking":
      return [
        "coworking",
        "cowork",
        "co-work",
        "workspace",
        "work space",
        "office space",
        "shared office",
        "meeting room",
        "meeting space",
        "hot desk",
        "hotdesk",
        "flex space",
        "flexible workspace",
      ];
    case "grant":
      return ["grant", "grants", "funding", "award"];
    case "accelerator":
      return ["accelerator", "startup accelerator", "business accelerator"];
    case "incubator":
      return ["incubator", "business incubator", "startup incubator"];
    case "sba":
      return ["sba", "sbdc", "score", "small business"];
    default:
      return [];
  }
}

/**
 * Batch process descriptions and return cleaned versions
 */
export function formatDescriptions(
  items: Array<{
    description?: string | null;
    category?: string;
    city?: string;
    state?: string;
  }>
): Array<string | null> {
  return items.map((item) =>
    formatDescription(item.description, {
      category: item.category,
      city: item.city,
      state: item.state,
    })
  );
}
