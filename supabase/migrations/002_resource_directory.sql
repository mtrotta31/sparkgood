-- SparkGood Resource Directory Schema
-- Comprehensive directory of business resources: grants, accelerators, coworking, SBA resources, etc.

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Resource Listings: Main table for all resources
CREATE TABLE IF NOT EXISTS resource_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT, -- 1-2 sentence summary for cards

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'grant', 'accelerator', 'incubator', 'coworking',
    'event_space', 'sba', 'pitch_competition', 'mentorship',
    'legal', 'accounting', 'marketing', 'investor'
  )),
  subcategories TEXT[] DEFAULT '{}', -- ['women-owned', 'tech', 'social-impact']
  cause_areas TEXT[] DEFAULT '{}', -- Maps to SparkGood's 12 cause areas

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_remote BOOLEAN DEFAULT false,
  is_nationwide BOOLEAN DEFAULT false,
  service_areas TEXT[] DEFAULT '{}', -- Cities/states served

  -- Contact
  website TEXT,
  email TEXT,
  phone TEXT,

  -- Details (category-specific data stored as JSON)
  details JSONB DEFAULT '{}',
  /*
    Grants: { amount_min, amount_max, deadline, eligibility, application_url, grant_type }
    Accelerators: { duration_weeks, equity_taken, funding_provided, batch_size, next_deadline, notable_alumni[] }
    Coworking: { price_monthly_min, price_monthly_max, day_pass_price, amenities[], hours }
    Event spaces: { capacity, price_hourly, amenities[], availability }
    SBA resources: { sba_type, services[], languages[] }
  */

  -- Enrichment tracking
  enrichment_status TEXT DEFAULT 'raw' CHECK (enrichment_status IN ('raw', 'enriched', 'verified')),
  enrichment_data JSONB DEFAULT '{}', -- Additional data from web scraping
  last_enriched_at TIMESTAMPTZ,

  -- Media
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',

  -- Source tracking
  source TEXT, -- Where we got this data (sba_api, manual, outscraper, etc.)
  source_id TEXT, -- Original ID from source for deduplication

  -- Display
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location Pages: For programmatic SEO
CREATE TABLE IF NOT EXISTS resource_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_full TEXT, -- Full state name (e.g., "Texas")
  slug TEXT UNIQUE NOT NULL, -- 'austin-tx', 'new-york-ny'
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  population INTEGER,
  listing_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(city, state)
);

-- Category + Location cross reference for programmatic SEO
CREATE TABLE IF NOT EXISTS resource_category_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  location_id UUID REFERENCES resource_locations(id) ON DELETE CASCADE,
  listing_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category, location_id)
);

-- User saves (for logged-in users)
CREATE TABLE IF NOT EXISTS resource_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES resource_listings(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Resource matches for Deep Dive integration
CREATE TABLE IF NOT EXISTS resource_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES saved_ideas(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES resource_listings(id) ON DELETE CASCADE,
  match_reason TEXT, -- Why this resource matches
  match_score DECIMAL(3, 2), -- 0.00-1.00 relevance score
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(idea_id, listing_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Resource listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_category ON resource_listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_city_state ON resource_listings(city, state);
CREATE INDEX IF NOT EXISTS idx_listings_state ON resource_listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_cause_areas ON resource_listings USING GIN(cause_areas);
CREATE INDEX IF NOT EXISTS idx_listings_subcategories ON resource_listings USING GIN(subcategories);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON resource_listings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON resource_listings(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_slug ON resource_listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_is_remote ON resource_listings(is_remote) WHERE is_remote = true;
CREATE INDEX IF NOT EXISTS idx_listings_is_nationwide ON resource_listings(is_nationwide) WHERE is_nationwide = true;
CREATE INDEX IF NOT EXISTS idx_listings_source ON resource_listings(source, source_id);

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_locations_slug ON resource_locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_state ON resource_locations(state);
CREATE INDEX IF NOT EXISTS idx_locations_population ON resource_locations(population DESC NULLS LAST);

-- Category locations indexes
CREATE INDEX IF NOT EXISTS idx_category_locations_category ON resource_category_locations(category);
CREATE INDEX IF NOT EXISTS idx_category_locations_location ON resource_category_locations(location_id);

-- User saves indexes
CREATE INDEX IF NOT EXISTS idx_saves_user_id ON resource_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_listing_id ON resource_saves(listing_id);

-- Resource matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_idea_id ON resource_matches(idea_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON resource_matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON resource_matches(match_score DESC);

-- Full-text search index for listings
CREATE INDEX IF NOT EXISTS idx_listings_search ON resource_listings
  USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(short_description, '')));

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE resource_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_category_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_matches ENABLE ROW LEVEL SECURITY;

-- Resource listings: Public read, authenticated write (for future admin)
CREATE POLICY "Anyone can view active listings" ON resource_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage listings" ON resource_listings
  FOR ALL USING (auth.role() = 'service_role');

-- Resource locations: Public read
CREATE POLICY "Anyone can view locations" ON resource_locations
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage locations" ON resource_locations
  FOR ALL USING (auth.role() = 'service_role');

-- Category locations: Public read
CREATE POLICY "Anyone can view category locations" ON resource_category_locations
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage category locations" ON resource_category_locations
  FOR ALL USING (auth.role() = 'service_role');

-- Resource saves: Users can manage their own saves
CREATE POLICY "Users can view own saves" ON resource_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves" ON resource_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves" ON resource_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Resource matches: Users can view matches for their ideas
CREATE POLICY "Users can view matches for own ideas" ON resource_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_ideas
      WHERE saved_ideas.id = resource_matches.idea_id
      AND saved_ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage matches" ON resource_matches
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger for resource_listings
CREATE TRIGGER update_resource_listings_updated_at
  BEFORE UPDATE ON resource_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for resource_locations
CREATE TRIGGER update_resource_locations_updated_at
  BEFORE UPDATE ON resource_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for resource_category_locations
CREATE TRIGGER update_resource_category_locations_updated_at
  BEFORE UPDATE ON resource_category_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to recalculate all listing counts (call manually after bulk operations)
-- Usage: SELECT recalculate_listing_counts();
CREATE OR REPLACE FUNCTION recalculate_listing_counts()
RETURNS void AS $$
DECLARE
  loc RECORD;
  cat_loc RECORD;
  cnt INTEGER;
BEGIN
  -- Update resource_locations counts one by one
  FOR loc IN SELECT id, city, state FROM resource_locations LOOP
    SELECT COUNT(*) INTO cnt
    FROM resource_listings l
    WHERE l.city = loc.city AND l.state = loc.state AND l.is_active = true;

    UPDATE resource_locations SET listing_count = cnt WHERE id = loc.id;
  END LOOP;

  -- Update resource_category_locations counts one by one
  FOR cat_loc IN
    SELECT rcl.id, rcl.category, rl.city, rl.state
    FROM resource_category_locations rcl
    JOIN resource_locations rl ON rcl.location_id = rl.id
  LOOP
    SELECT COUNT(*) INTO cnt
    FROM resource_listings l
    WHERE l.city = cat_loc.city
      AND l.state = cat_loc.state
      AND l.category = cat_loc.category
      AND l.is_active = true;

    UPDATE resource_category_locations SET listing_count = cnt WHERE id = cat_loc.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for listing search results with location info
CREATE OR REPLACE VIEW resource_listing_cards AS
SELECT
  l.id,
  l.name,
  l.slug,
  l.short_description,
  l.category,
  l.subcategories,
  l.city,
  l.state,
  l.is_remote,
  l.is_nationwide,
  l.website,
  l.logo_url,
  l.details,
  l.is_featured,
  l.created_at
FROM resource_listings l
WHERE l.is_active = true;

-- View for category stats
CREATE OR REPLACE VIEW resource_category_stats AS
SELECT
  category,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_nationwide OR is_remote) as nationwide_count,
  COUNT(DISTINCT state) as states_covered
FROM resource_listings
WHERE is_active = true
GROUP BY category;
