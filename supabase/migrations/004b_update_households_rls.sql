-- Migration: Update households RLS policies
-- Description: Add member access now that household_members table exists
-- Run this AFTER 004_create_household_members_table.sql

-- Drop the simple owner-only SELECT policy
DROP POLICY IF EXISTS "Owners can view their households" ON households;

-- Create new policy that includes members
CREATE POLICY "Users can view households they belong to"
  ON households FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON POLICY "Users can view households they belong to" ON households IS 'Allows owners and members to view household information';
