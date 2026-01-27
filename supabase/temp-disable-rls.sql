-- Temporary Fix: Allow anonymous access for Phase 2 testing
-- Run this in Supabase SQL Editor
-- NOTE: This is for development only! Phase 3 will add proper authentication.

-- Allow anyone to read/write meal plans (temporary)
DROP POLICY IF EXISTS "Users can read own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

CREATE POLICY "Allow all meal plan access (temp)"
  ON public.meal_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anyone to read/write meal plan items (temporary)
DROP POLICY IF EXISTS "Users can read own meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Users can add meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Users can update own meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Users can delete own meal plan items" ON public.meal_plan_items;

CREATE POLICY "Allow all meal plan items access (temp)"
  ON public.meal_plan_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anyone to read/write grocery lists (temporary)
DROP POLICY IF EXISTS "Users can read own grocery lists" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can create grocery lists" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can update own grocery lists" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can delete own grocery lists" ON public.grocery_lists;

CREATE POLICY "Allow all grocery list access (temp)"
  ON public.grocery_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anyone to read/write grocery list items (temporary)
DROP POLICY IF EXISTS "Users can read own grocery list items" ON public.grocery_list_items;
DROP POLICY IF EXISTS "Users can add grocery list items" ON public.grocery_list_items;
DROP POLICY IF EXISTS "Users can update own grocery list items" ON public.grocery_list_items;
DROP POLICY IF EXISTS "Users can delete own grocery list items" ON public.grocery_list_items;

CREATE POLICY "Allow all grocery list items access (temp)"
  ON public.grocery_list_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Temporary RLS policies applied!';
  RAISE NOTICE 'Phase 2 features should now work without authentication.';
  RAISE NOTICE '⚠️  WARNING: This is for development only!';
  RAISE NOTICE 'Phase 3 will add proper user authentication.';
END $$;
