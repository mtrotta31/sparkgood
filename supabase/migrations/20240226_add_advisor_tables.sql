-- Add AI Advisor message tables and usage tracking
-- Sprint 3: AI Advisor feature

-- Create advisor_messages table to store conversation history
CREATE TABLE IF NOT EXISTS advisor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES saved_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_advisor_messages_project_id ON advisor_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_user_id ON advisor_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_created_at ON advisor_messages(project_id, created_at);

-- Add advisor message count column to deep_dive_results for usage tracking
ALTER TABLE deep_dive_results
ADD COLUMN IF NOT EXISTS advisor_message_count INTEGER DEFAULT 0;

-- Comments for documentation
COMMENT ON TABLE advisor_messages IS 'Stores AI Advisor chat history for each project';
COMMENT ON COLUMN advisor_messages.project_id IS 'References saved_ideas.id (the project)';
COMMENT ON COLUMN advisor_messages.role IS 'Either user or assistant';
COMMENT ON COLUMN advisor_messages.content IS 'The message content';
COMMENT ON COLUMN deep_dive_results.advisor_message_count IS 'Number of advisor messages used (max 20 for deep dive purchasers)';

-- Enable RLS on advisor_messages
ALTER TABLE advisor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_messages
CREATE POLICY "Users can view own advisor messages" ON advisor_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own advisor messages" ON advisor_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own advisor messages" ON advisor_messages
  FOR DELETE USING (auth.uid() = user_id);
