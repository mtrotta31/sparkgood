-- Security Improvements Migration
-- Adds rate limiting and webhook idempotency tables

-- Rate Limits Table
-- Tracks API usage per user per route with sliding window
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,         -- Composite key: "{user_id}:{route_key}"
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,          -- e.g., "generate-ideas", "deep-dive"
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_user_route ON rate_limits(user_id, route_key);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_updated_at();

-- Stripe Webhook Events Table
-- Ensures idempotent webhook processing
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,  -- Stripe's event ID
  event_type TEXT NOT NULL,               -- e.g., "checkout.session.completed"
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB                           -- Optional: store event payload for debugging
);

-- Index for fast lookup by Stripe event ID
CREATE INDEX idx_stripe_webhook_events_stripe_id ON stripe_webhook_events(stripe_event_id);

-- Cleanup old rate limit records (optional, run periodically)
-- Can be called via pg_cron or a scheduled function
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Cleanup old webhook events (keep 30 days for debugging)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM stripe_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (service role bypasses, but good practice)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (webhooks and rate limiting)
-- These tables are only accessed server-side with service role key
CREATE POLICY "Service role only" ON rate_limits
  FOR ALL USING (false);

CREATE POLICY "Service role only" ON stripe_webhook_events
  FOR ALL USING (false);
