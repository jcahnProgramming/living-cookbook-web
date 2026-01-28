-- Migration: Create households table
-- Description: Stores household information for shared meal planning
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_households_owner_id ON households(owner_id);
CREATE INDEX idx_households_subscription_status ON households(subscription_status);

-- Enable Row Level Security
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for now, will be updated after household_members exists)
-- Owners can view their households
CREATE POLICY "Owners can view their households"
  ON households FOR SELECT
  USING (owner_id = auth.uid());

-- Only owners can update their households
CREATE POLICY "Owners can update their households"
  ON households FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Only owners can delete their households
CREATE POLICY "Owners can delete their households"
  ON households FOR DELETE
  USING (owner_id = auth.uid());

-- Anyone authenticated can create a household
CREATE POLICY "Authenticated users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE households IS 'Stores household information for shared meal planning and grocery lists';
COMMENT ON COLUMN households.subscription_status IS 'Current subscription status: trial, active, cancelled, or expired';
COMMENT ON COLUMN households.trial_ends_at IS 'When the 30-day free trial ends';
COMMENT ON COLUMN households.subscription_ends_at IS 'When the paid subscription ends (null for trial users)';
