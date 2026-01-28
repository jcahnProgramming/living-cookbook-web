-- Migration: Create household_members table
-- Description: Stores which users belong to which households
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ensure a user can only be in a household once
  UNIQUE(household_id, user_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);

-- Enable Row Level Security
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view members of households they belong to
CREATE POLICY "Users can view members of their households"
  ON household_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household owners can add members
CREATE POLICY "Household owners can add members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Household owners can remove members (except themselves)
CREATE POLICY "Household owners can remove members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    ) AND user_id != auth.uid()
  );

-- Users can remove themselves from households
CREATE POLICY "Users can leave households"
  ON household_members FOR DELETE
  USING (user_id = auth.uid());

-- Add comment for documentation
COMMENT ON TABLE household_members IS 'Junction table linking users to households they belong to';
COMMENT ON COLUMN household_members.role IS 'User role in household: owner or member';
COMMENT ON COLUMN household_members.invited_by IS 'User who invited this member';
