-- Expansion Tracking Table
-- Tracks when each city+category combo was last scraped to prevent duplicate API calls

CREATE TABLE IF NOT EXISTS expansion_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  last_scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  results_count INTEGER DEFAULT 0,
  new_listings_count INTEGER DEFAULT 0,
  api_cost DECIMAL(10, 4) DEFAULT 0,
  status TEXT DEFAULT 'success', -- 'success', 'error', 'no_results'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint ensures one record per city+category
  UNIQUE(city_slug, category)
);

-- Index for efficient lookups
CREATE INDEX idx_expansion_tracking_lookup ON expansion_tracking(city_slug, category);
CREATE INDEX idx_expansion_tracking_last_scraped ON expansion_tracking(last_scraped_at);
CREATE INDEX idx_expansion_tracking_category ON expansion_tracking(category);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_expansion_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expansion_tracking_updated_at
  BEFORE UPDATE ON expansion_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_expansion_tracking_timestamp();

-- Add new categories to the resource_listings CHECK constraint
-- First, drop the existing constraint
ALTER TABLE resource_listings DROP CONSTRAINT IF EXISTS resource_listings_category_check;

-- Add the new constraint with all categories
ALTER TABLE resource_listings ADD CONSTRAINT resource_listings_category_check
  CHECK (category IN (
    -- Existing categories
    'grant', 'accelerator', 'incubator', 'coworking', 'event_space',
    'sba', 'pitch_competition', 'mentorship', 'legal', 'accounting',
    'marketing', 'investor',
    -- New categories for expansion
    'business-attorney', 'accountant', 'marketing-agency', 'print-shop',
    'commercial-real-estate', 'business-insurance', 'chamber-of-commerce',
    'virtual-office', 'business-consultant'
  ));

-- Function to check if a city+category needs scraping (not scraped in last 30 days)
CREATE OR REPLACE FUNCTION needs_scraping(p_city_slug TEXT, p_category TEXT, p_days_threshold INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
DECLARE
  last_scrape TIMESTAMPTZ;
BEGIN
  SELECT last_scraped_at INTO last_scrape
  FROM expansion_tracking
  WHERE city_slug = p_city_slug AND category = p_category;

  IF last_scrape IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN last_scrape < NOW() - (p_days_threshold || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to record a scrape attempt
CREATE OR REPLACE FUNCTION record_scrape(
  p_city_slug TEXT,
  p_category TEXT,
  p_results_count INTEGER,
  p_new_listings_count INTEGER,
  p_api_cost DECIMAL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO expansion_tracking (
    city_slug, category, last_scraped_at, results_count,
    new_listings_count, api_cost, status, error_message
  )
  VALUES (
    p_city_slug, p_category, NOW(), p_results_count,
    p_new_listings_count, p_api_cost, p_status, p_error_message
  )
  ON CONFLICT (city_slug, category)
  DO UPDATE SET
    last_scraped_at = NOW(),
    results_count = p_results_count,
    new_listings_count = p_new_listings_count,
    api_cost = p_api_cost,
    status = p_status,
    error_message = p_error_message,
    updated_at = NOW()
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- View to see coverage gaps (cities without recent scrapes)
CREATE OR REPLACE VIEW expansion_coverage_gaps AS
SELECT
  rl.slug as city_slug,
  rl.city,
  rl.state,
  rl.population,
  et.category,
  et.last_scraped_at,
  COALESCE(et.results_count, 0) as last_results_count,
  -- Calculate days since last scrape
  EXTRACT(DAY FROM (NOW() - COALESCE(et.last_scraped_at, '1970-01-01'::TIMESTAMPTZ))) as days_since_scrape,
  -- Coverage score: population / (listing_count + 1)
  -- Higher score = more people per listing = bigger gap
  COALESCE(rl.population::DECIMAL / (COALESCE(
    (SELECT COUNT(*) FROM resource_listings WHERE city = rl.city AND state = rl.state AND category = et.category),
    0
  ) + 1), rl.population) as coverage_score
FROM resource_locations rl
LEFT JOIN expansion_tracking et ON rl.slug = et.city_slug
WHERE rl.population IS NOT NULL
ORDER BY coverage_score DESC;

COMMENT ON TABLE expansion_tracking IS 'Tracks scraping history for each city+category combination to prevent duplicate API calls';
COMMENT ON VIEW expansion_coverage_gaps IS 'Shows coverage gaps ordered by population-to-listing ratio';
