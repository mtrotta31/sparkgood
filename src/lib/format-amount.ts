// Utility to format currency amounts
// Under $1K: show exact (e.g., "$500")
// $1K-$999K: show "$25K" format
// $1M+: show "$5M" format

/**
 * Format a currency amount for display
 * @param amount - The amount in dollars (e.g., 5000000 for $5M)
 * @param options - Formatting options
 * @returns Formatted string (e.g., "$5M", "$25K", "$500")
 */
export function formatAmount(
  amount: number | null | undefined,
  options: {
    prefix?: string; // e.g., "Up to " or "From "
    showZero?: boolean; // Whether to show $0 (default: false)
  } = {}
): string | null {
  const { prefix = "", showZero = false } = options;

  // Handle null/undefined
  if (amount === null || amount === undefined) {
    return null;
  }

  // Handle zero
  if (amount === 0) {
    return showZero ? `${prefix}$0` : null;
  }

  // Format based on magnitude
  let formatted: string;

  if (amount >= 1_000_000) {
    // $1M+
    const millions = amount / 1_000_000;
    // Use 1 decimal place only if needed (e.g., $1.5M, but $2M not $2.0M)
    formatted = millions % 1 === 0 ? `$${millions}M` : `$${millions.toFixed(1)}M`;
  } else if (amount >= 1_000) {
    // $1K-$999K
    const thousands = amount / 1_000;
    // Use 1 decimal place only if needed (e.g., $2.5K, but $25K not $25.0K)
    formatted = thousands % 1 === 0 ? `$${thousands}K` : `$${thousands.toFixed(1)}K`;
  } else {
    // Under $1K - show exact with commas
    formatted = `$${amount.toLocaleString()}`;
  }

  return `${prefix}${formatted}`;
}

/**
 * Format a range of amounts
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @returns Formatted range string (e.g., "$25K - $100K", "Up to $5M")
 */
export function formatAmountRange(
  min: number | null | undefined,
  max: number | null | undefined
): string | null {
  const formattedMin = formatAmount(min);
  const formattedMax = formatAmount(max);

  if (formattedMin && formattedMax) {
    return `${formattedMin} - ${formattedMax}`;
  } else if (formattedMax) {
    return `Up to ${formattedMax}`;
  } else if (formattedMin) {
    return `From ${formattedMin}`;
  }

  return null;
}
