-- Add V2 deep dive columns to deep_dive_results table
-- V2 tabs: checklist (launch checklist), foundation (business foundation), growth (growth plan), financial (financial model)

ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS checklist JSONB,
ADD COLUMN IF NOT EXISTS foundation JSONB,
ADD COLUMN IF NOT EXISTS growth JSONB,
ADD COLUMN IF NOT EXISTS financial JSONB;

-- Comments for documentation
COMMENT ON COLUMN deep_dive_results.checklist IS 'V2 Launch Checklist data (LaunchChecklistData type)';
COMMENT ON COLUMN deep_dive_results.foundation IS 'V2 Business Foundation data (BusinessFoundationData type)';
COMMENT ON COLUMN deep_dive_results.growth IS 'V2 Growth Plan data (GrowthPlanData type)';
COMMENT ON COLUMN deep_dive_results.financial IS 'V2 Financial Model data (FinancialModelData type)';
