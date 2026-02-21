-- Add checklist_progress column to deep_dive_results table
-- This stores the completion state of checklist items: {"register-business": true, "open-bank-account": false}

ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS checklist_progress JSONB DEFAULT '{}';

-- Add index for faster queries on checklist_progress
CREATE INDEX IF NOT EXISTS idx_deep_dive_results_checklist_progress
ON deep_dive_results USING GIN (checklist_progress);

-- Comment for documentation
COMMENT ON COLUMN deep_dive_results.checklist_progress IS 'Stores completion state of launch checklist items as {itemId: boolean}';
