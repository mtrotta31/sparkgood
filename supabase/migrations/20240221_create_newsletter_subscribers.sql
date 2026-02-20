-- Newsletter Subscribers Table
-- Stores email signups from directory pages

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  state TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Index for filtering active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;

-- Index for filtering by interests
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_interests ON newsletter_subscribers USING GIN(interests);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_location ON newsletter_subscribers(state, city);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role has full access to newsletter_subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE newsletter_subscribers IS 'Email subscribers for newsletter and resource updates';
