-- Living Cookbook - Phase 2: Meal Planning & Groceries
-- Run this AFTER Phase 1 schema.sql

-- ============================================
-- MEAL PLANS TABLE
-- ============================================
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id UUID, -- Future: for shared households
  week_start_date DATE NOT NULL, -- Monday of the week
  name TEXT DEFAULT 'My Meal Plan',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One meal plan per user per week
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own meal plans
CREATE POLICY "Users can read own meal plans"
  ON public.meal_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create meal plans
CREATE POLICY "Users can create meal plans"
  ON public.meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their meal plans
CREATE POLICY "Users can update own meal plans"
  ON public.meal_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their meal plans
CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX idx_meal_plans_week_start ON public.meal_plans(week_start_date);

-- ============================================
-- MEAL PLAN ITEMS TABLE
-- ============================================
CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  meal_type TEXT DEFAULT 'dinner' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER DEFAULT 1,
  notes TEXT,
  sort_order INTEGER DEFAULT 0, -- For custom ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their meal plans
CREATE POLICY "Users can read own meal plan items"
  ON public.meal_plan_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Users can add items to their meal plans
CREATE POLICY "Users can add meal plan items"
  ON public.meal_plan_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Users can update their meal plan items
CREATE POLICY "Users can update own meal plan items"
  ON public.meal_plan_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Users can delete their meal plan items
CREATE POLICY "Users can delete own meal plan items"
  ON public.meal_plan_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_meal_plan_items_meal_plan_id ON public.meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_recipe_id ON public.meal_plan_items(recipe_id);
CREATE INDEX idx_meal_plan_items_planned_date ON public.meal_plan_items(planned_date);

-- ============================================
-- GROCERY LISTS TABLE
-- ============================================
CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Grocery List',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Users can read their grocery lists
CREATE POLICY "Users can read own grocery lists"
  ON public.grocery_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create grocery lists
CREATE POLICY "Users can create grocery lists"
  ON public.grocery_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their grocery lists
CREATE POLICY "Users can update own grocery lists"
  ON public.grocery_lists
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their grocery lists
CREATE POLICY "Users can delete own grocery lists"
  ON public.grocery_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX idx_grocery_lists_meal_plan_id ON public.grocery_lists(meal_plan_id);

-- ============================================
-- GROCERY LIST ITEMS TABLE
-- ============================================
CREATE TABLE public.grocery_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grocery_list_id UUID NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,
  category TEXT DEFAULT 'Other',
  is_checked BOOLEAN DEFAULT false,
  recipe_ids TEXT[], -- Array of recipe IDs that need this item
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their grocery lists
CREATE POLICY "Users can read own grocery list items"
  ON public.grocery_list_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_list_items.grocery_list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Users can add items
CREATE POLICY "Users can add grocery list items"
  ON public.grocery_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_list_items.grocery_list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Users can update items
CREATE POLICY "Users can update own grocery list items"
  ON public.grocery_list_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_list_items.grocery_list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Users can delete items
CREATE POLICY "Users can delete own grocery list items"
  ON public.grocery_list_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = grocery_list_items.grocery_list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_grocery_list_items_list_id ON public.grocery_list_items(grocery_list_id);
CREATE INDEX idx_grocery_list_items_category ON public.grocery_list_items(category);
CREATE INDEX idx_grocery_list_items_checked ON public.grocery_list_items(is_checked);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plan_items_updated_at
  BEFORE UPDATE ON public.meal_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_list_items_updated_at
  BEFORE UPDATE ON public.grocery_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get the start of the week (Monday) for any date
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE)
RETURNS DATE AS $$
BEGIN
  RETURN input_date - (EXTRACT(DOW FROM input_date)::INTEGER + 6) % 7;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to aggregate ingredients from meal plan
CREATE OR REPLACE FUNCTION aggregate_grocery_items(plan_id UUID)
RETURNS TABLE (
  item_name TEXT,
  total_quantity DECIMAL,
  unit TEXT,
  category TEXT,
  recipe_ids TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ingredient->>'name' AS item_name,
    SUM((ingredient->>'quantity')::DECIMAL * mpi.servings) AS total_quantity,
    ingredient->>'unit' AS unit,
    section->>'name' AS category,
    ARRAY_AGG(DISTINCT mpi.recipe_id) AS recipe_ids
  FROM public.meal_plan_items mpi
  JOIN public.recipes r ON r.id = mpi.recipe_id
  CROSS JOIN LATERAL jsonb_array_elements(r.grocery_list->'sections') AS section
  CROSS JOIN LATERAL jsonb_array_elements(section->'items') AS ingredient
  WHERE mpi.meal_plan_id = plan_id
  GROUP BY ingredient->>'name', ingredient->>'unit', section->>'name';
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Phase 2 database schema created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - meal_plans';
  RAISE NOTICE '  - meal_plan_items';
  RAISE NOTICE '  - grocery_lists';
  RAISE NOTICE '  - grocery_list_items';
  RAISE NOTICE 'Ready to build meal planning features!';
END $$;
