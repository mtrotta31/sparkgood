-- Migration: Create user_credits table for Stripe integration
-- Run this in Supabase SQL editor

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'spark', 'ignite');

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'none');

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription info
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'none',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Credits
  deep_dive_credits_remaining INTEGER DEFAULT 0,
  launch_kit_credits_remaining INTEGER DEFAULT 0,

  -- One-time purchases (array of idea IDs)
  one_time_purchases TEXT[] DEFAULT '{}',

  -- Credit reset date (for subscriptions)
  credits_reset_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id),
  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_user_credits_stripe_customer_id ON user_credits(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credits (for initial creation)
CREATE POLICY "Users can create own credits"
  ON user_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credits (but we'll mostly do this via service role)
CREATE POLICY "Users can update own credits"
  ON user_credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has deep dive access
CREATE OR REPLACE FUNCTION has_deep_dive_access(
  p_user_id UUID,
  p_idea_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_credits user_credits%ROWTYPE;
BEGIN
  SELECT * INTO v_credits FROM user_credits WHERE user_id = p_user_id;

  -- No record = no access
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Ignite with active subscription = unlimited
  IF v_credits.subscription_tier = 'ignite' AND v_credits.subscription_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- One-time purchase check
  IF p_idea_id = ANY(v_credits.one_time_purchases) THEN
    RETURN TRUE;
  END IF;

  -- Spark with credits
  IF v_credits.subscription_tier = 'spark'
     AND v_credits.subscription_status = 'active'
     AND v_credits.deep_dive_credits_remaining > 0 THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_deep_dive_access TO authenticated;
