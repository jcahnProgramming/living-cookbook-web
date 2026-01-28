-- Migration: Fix households RLS policies to avoid infinite recursion
-- Description: Rewrite policy to avoid circular dependency
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies on households
DROP POLICY IF EXISTS "Users can view households they belong to" ON households;
DROP POLICY IF EXISTS "Owners can view their households" ON households;
DROP POLICY IF EXISTS "Users can view their households" ON households;

-- Create simple owner-only policy first
-- Members will be added through a function to avoid recursion
CREATE POLICY "Household owners can view"
  ON households FOR SELECT
  USING (owner_id = auth.uid());

-- Now create a FUNCTION to check membership without recursion
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION is_household_member(household_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = household_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now add policy for members using the function
CREATE POLICY "Household members can view"
  ON households FOR SELECT
  USING (is_household_member(id));

-- Verify policies
SELECT schemaname, tablename, policyname, qual
FROM pg_policies 
WHERE tablename = 'households';

