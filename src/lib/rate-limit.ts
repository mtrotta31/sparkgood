// Supabase-backed rate limiter
// Tracks requests per user/IP per endpoint to prevent abuse
//
// NOTE: Rows older than 24 hours should be periodically cleaned up
// via a Supabase scheduled function or cron job. Example SQL:
// DELETE FROM rate_limits WHERE requested_at < NOW() - INTERVAL '24 hours';

import { createClient } from "@supabase/supabase-js";

// Rate limits per endpoint (requests per hour)
export const RATE_LIMITS: Record<string, number> = {
  "/api/generate-ideas": 10,
  "/api/deep-dive": 20,
  "/api/deep-dive/resources": 30,
  "/api/launch-kit/v2": 20,
  "/api/build-asset": 20,
  "/api/chat-advisor": 60,
};

// Get service role client for rate limiting (no user auth context)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Extract IP from request headers
export function getClientIP(headers: Headers): string {
  // Try common headers for client IP
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for Vercel
  const vercelIP = headers.get("x-vercel-forwarded-for");
  if (vercelIP) {
    return vercelIP.split(",")[0].trim();
  }

  return "unknown";
}

/**
 * Check rate limit for a request
 *
 * @param endpoint - The API endpoint path (e.g., "/api/generate-ideas")
 * @param identifier - User ID (for authenticated routes) or IP address (for unauthenticated)
 * @returns true if request is allowed, false if rate limited
 *
 * IMPORTANT: Fails open - if rate limit check fails, allows request through
 */
export async function checkRateLimit(
  endpoint: string,
  identifier: string
): Promise<boolean> {
  const limit = RATE_LIMITS[endpoint];

  // If no limit defined for this endpoint, allow
  if (!limit) {
    return true;
  }

  const supabase = getServiceClient();

  // Fail open - if we can't connect to Supabase, allow the request
  if (!supabase) {
    console.error("[rate-limit] Could not create Supabase client, allowing request");
    return true;
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Count requests in the last hour
    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", identifier)
      .eq("endpoint", endpoint)
      .gte("requested_at", oneHourAgo);

    // Fail open on count error
    if (countError) {
      console.error("[rate-limit] Error counting requests, allowing request:", countError);
      return true;
    }

    // Check if over limit
    if ((count || 0) >= limit) {
      console.log(`[rate-limit] Rate limit exceeded for ${identifier} on ${endpoint}: ${count}/${limit}`);
      return false;
    }

    // Insert new request record
    const { error: insertError } = await supabase
      .from("rate_limits")
      .insert({
        user_id: identifier,
        endpoint: endpoint,
      });

    // Fail open on insert error - we already verified they're under the limit
    if (insertError) {
      console.error("[rate-limit] Error inserting rate limit record:", insertError);
      // Still allow the request since they passed the count check
    }

    return true;
  } catch (error) {
    // Fail open on any unexpected error
    console.error("[rate-limit] Unexpected error, allowing request:", error);
    return true;
  }
}
