-- Migration: Add household_id to grocery_lists
-- Description: Allow grocery lists to be shared with households
-- Run this in Supabase SQL Editor

-- Add household_id column (nullable for backward compatibility)
ALTER TABLE grocery_lists
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_grocery_lists_household_id ON grocery_lists(household_id);

-- Update RLS policies for grocery_lists

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can create their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can update their own grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can delete their own grocery lists" ON grocery_lists;

-- New policy: Users can view their personal grocery lists OR household grocery lists
CREATE POLICY "Users can view their grocery lists"
  ON grocery_lists FOR SELECT
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- New policy: Users can create personal grocery lists OR household grocery lists
CREATE POLICY "Users can create grocery lists"
  ON grocery_lists FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND household_id IS NULL) OR
    (household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ))
  );

-- New policy: Users can update their personal grocery lists OR household grocery lists
CREATE POLICY "Users can update grocery lists"
  ON grocery_lists FOR UPDATE
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- New policy: Users can delete their personal grocery lists OR household grocery lists
CREATE POLICY "Users can delete grocery lists"
  ON grocery_lists FOR DELETE
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON COLUMN grocery_lists.household_id IS 'If set, this grocery list is shared with the household. If null, it is a personal grocery list.';
