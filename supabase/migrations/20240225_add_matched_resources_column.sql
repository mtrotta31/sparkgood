-- Add matched_resources column to deep_dive_results table
-- Stores matched local resources with AI-generated relevance notes

ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS matched_resources JSONB;

-- Comment for documentation
COMMENT ON COLUMN deep_dive_results.matched_resources IS 'Matched local resources with relevance notes (LocalResourcesData type)';
