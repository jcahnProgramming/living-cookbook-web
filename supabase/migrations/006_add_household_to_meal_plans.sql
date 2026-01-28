-- Migration: Add household_id to meal_plans
-- Description: Allow meal plans to be shared with households
-- Run this in Supabase SQL Editor

-- Add household_id column (nullable for backward compatibility)
ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_id ON meal_plans(household_id);

-- Update RLS policies for meal_plans

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can create their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;

-- New policy: Users can view their personal meal plans OR household meal plans
CREATE POLICY "Users can view their meal plans"
  ON meal_plans FOR SELECT
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- New policy: Users can create personal meal plans OR household meal plans
CREATE POLICY "Users can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND household_id IS NULL) OR
    (household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    ))
  );

-- New policy: Users can update their personal meal plans OR household meal plans
CREATE POLICY "Users can update meal plans"
  ON meal_plans FOR UPDATE
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

-- New policy: Users can delete their personal meal plans OR household meal plans
CREATE POLICY "Users can delete meal plans"
  ON meal_plans FOR DELETE
  USING (
    user_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON COLUMN meal_plans.household_id IS 'If set, this meal plan is shared with the household. If null, it is a personal meal plan.';
