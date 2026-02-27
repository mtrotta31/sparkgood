// Rate Limiting Utility
// Supabase-backed rate limiting for serverless environments

import { createClient } from "@supabase/supabase-js";

// Rate limit configuration per route
export const RATE_LIMITS: Record<string, { max: number; windowSeconds: number }> = {
  "generate-ideas": { max: 30, windowSeconds: 3600 },     // 30 per hour
  "deep-dive": { max: 10, windowSeconds: 3600 },          // 10 per hour
  "launch-kit": { max: 5, windowSeconds: 3600 },          // 5 per hour
  "chat-advisor": { max: 60, windowSeconds: 3600 },       // 60 per hour
  "research": { max: 20, windowSeconds: 3600 },           // 20 per hour
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Get service role client for rate limiting (bypasses RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("[rate-limit] Missing Supabase service configuration, allowing request");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Check and update rate limit for a user/route combination
 * Returns whether the request is allowed and remaining quota
 */
export async function checkRateLimit(
  userId: string,
  routeKey: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[routeKey];

  if (!config) {
    // No rate limit configured for this route
    return { allowed: true, remaining: Infinity, resetAt: new Date() };
  }

  const supabase = getServiceClient();

  if (!supabase) {
    // If Supabase not configured, allow request (fail open for dev)
    return { allowed: true, remaining: config.max, resetAt: new Date() };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);
  const windowKey = `${userId}:${routeKey}`;

  try {
    // Get current rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", windowKey)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[rate-limit] Error fetching rate limit:", fetchError);
      // Fail open on error
      return { allowed: true, remaining: config.max, resetAt: now };
    }

    // If no record exists or window has expired, create/reset
    if (!existing || new Date(existing.window_start) < windowStart) {
      const newWindowStart = now;
      const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);

      await supabase.from("rate_limits").upsert({
        key: windowKey,
        user_id: userId,
        route_key: routeKey,
        request_count: 1,
        window_start: newWindowStart.toISOString(),
      });

      return { allowed: true, remaining: config.max - 1, resetAt };
    }

    // Check if limit exceeded
    if (existing.request_count >= config.max) {
      const resetAt = new Date(new Date(existing.window_start).getTime() + config.windowSeconds * 1000);
      return { allowed: false, remaining: 0, resetAt };
    }

    // Increment counter
    const newCount = existing.request_count + 1;
    await supabase
      .from("rate_limits")
      .update({ request_count: newCount })
      .eq("key", windowKey);

    const resetAt = new Date(new Date(existing.window_start).getTime() + config.windowSeconds * 1000);
    return { allowed: true, remaining: config.max - newCount, resetAt };

  } catch (error) {
    console.error("[rate-limit] Unexpected error:", error);
    // Fail open on error
    return { allowed: true, remaining: config.max, resetAt: now };
  }
}

/**
 * Create a rate limit error response with appropriate headers
 */
export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": result.resetAt.toISOString(),
        "Retry-After": String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
      },
    }
  );
}
