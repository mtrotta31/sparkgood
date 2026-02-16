-- SparkGood Database Schema
-- Run this in the Supabase SQL Editor to create the necessary tables

-- Enable UUID extension (should already be enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table
-- Stores the questionnaire answers for each user
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_type TEXT CHECK (venture_type IN ('project', 'nonprofit', 'business', 'hybrid')),
  format TEXT CHECK (format IN ('online', 'in_person', 'both')),
  causes TEXT[] DEFAULT '{}',
  experience TEXT CHECK (experience IN ('beginner', 'some', 'experienced')),
  budget TEXT CHECK (budget IN ('zero', 'low', 'medium', 'high')),
  commitment TEXT CHECK (commitment IN ('weekend', 'steady', 'all_in')),
  depth TEXT CHECK (depth IN ('ideas', 'full')),
  has_idea BOOLEAN,
  own_idea TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can have multiple profiles (different sessions/ventures)
  UNIQUE(user_id, created_at)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Saved Ideas table
-- Stores generated ideas for each user
CREATE TABLE IF NOT EXISTS saved_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  idea_data JSONB NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for saved ideas
CREATE INDEX IF NOT EXISTS idx_saved_ideas_user_id ON saved_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_profile_id ON saved_ideas(profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_is_selected ON saved_ideas(user_id, is_selected) WHERE is_selected = true;

-- Deep Dive Results table
-- Stores viability reports, business plans, marketing assets, and roadmaps
CREATE TABLE IF NOT EXISTS deep_dive_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES saved_ideas(id) ON DELETE CASCADE,
  viability JSONB,
  business_plan JSONB,
  marketing JSONB,
  roadmap JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One deep dive result per idea
  UNIQUE(idea_id)
);

-- Index for deep dive lookups
CREATE INDEX IF NOT EXISTS idx_deep_dive_results_user_id ON deep_dive_results(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_dive_results_idea_id ON deep_dive_results(idea_id);

-- Row Level Security (RLS) Policies
-- These ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_dive_results ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Users can view own profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Saved Ideas policies
CREATE POLICY "Users can view own ideas" ON saved_ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON saved_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON saved_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON saved_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Deep Dive Results policies
CREATE POLICY "Users can view own deep dive results" ON deep_dive_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deep dive results" ON deep_dive_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deep dive results" ON deep_dive_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deep dive results" ON deep_dive_results
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_ideas_updated_at
  BEFORE UPDATE ON saved_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deep_dive_results_updated_at
  BEFORE UPDATE ON deep_dive_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
