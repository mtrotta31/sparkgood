-- Launch Kit V2: Add launch_kit_assets column for storing generated file references
-- This stores paths to Supabase Storage files for pitch deck, social graphics, landing page, one-pager

ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS launch_kit_assets JSONB;

-- The JSONB structure will be:
-- {
--   "landingPage": {
--     "slug": "austin-pour-co",
--     "url": "/sites/austin-pour-co",
--     "storagePath": "launch-kit-assets/{projectId}/landing-page.html"
--   },
--   "pitchDeck": {
--     "storagePath": "launch-kit-assets/{projectId}/pitch-deck.pptx"
--   },
--   "socialGraphics": {
--     "instagramPost": { "storagePath": "..." },
--     "instagramStory": { "storagePath": "..." },
--     "linkedinPost": { "storagePath": "..." },
--     "facebookCover": { "storagePath": "..." }
--   },
--   "onePager": {
--     "storagePath": "launch-kit-assets/{projectId}/one-pager.pdf"
--   },
--   "generatedAt": "2024-02-27T12:00:00Z"
-- }

COMMENT ON COLUMN deep_dive_results.launch_kit_assets IS 'JSONB storing Launch Kit V2 generated file paths in Supabase Storage';

-- Create storage bucket for launch kit assets (run via Supabase dashboard or storage API)
-- Bucket name: launch-kit-assets
-- Public access: true (for download URLs)

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_deep_dive_results_launch_kit_assets
ON deep_dive_results USING gin (launch_kit_assets);
