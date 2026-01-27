-- Living Cookbook Database Schema
-- Phase 1: Core Cooking MVP
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lgzbrycabgvbvuvybxbh/editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RECIPES TABLE
-- ============================================
CREATE TABLE public.recipes (
  id TEXT PRIMARY KEY, -- e.g., "recipe_honey_butter_salmon_rice_carrots_v1"
  title TEXT NOT NULL,
  subtitle TEXT,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Author info
  author_id TEXT NOT NULL,
  author_display_name TEXT NOT NULL,
  author_source TEXT DEFAULT 'internal' CHECK (author_source IN ('internal', 'marketplace', 'user_generated')),
  
  -- Yield
  yield_servings INTEGER NOT NULL,
  yield_units TEXT DEFAULT 'servings',
  yield_notes TEXT,
  
  -- Difficulty & spice
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  spice_level TEXT DEFAULT 'none' CHECK (spice_level IN ('none', 'mild', 'medium', 'hot', 'extra_hot')),
  dietary_flags TEXT[], -- Array of flags: ['vegetarian', 'gluten-free', etc]
  
  -- Time estimates (in seconds)
  total_time_estimate_sec INTEGER NOT NULL,
  prep_time_estimate_sec INTEGER,
  cook_time_estimate_sec INTEGER,
  active_time_estimate_sec INTEGER,
  passive_time_estimate_sec INTEGER,
  
  -- Equipment (JSONB array)
  equipment JSONB, -- [{"name": "Large pot", "quantity": 1, "notes": "..."}]
  
  -- Full recipe data (JSONB for flexibility)
  grocery_list JSONB NOT NULL, -- Full grocery list structure
  cooking_schedule JSONB NOT NULL, -- Full cooking countdown schedule
  timers_feed JSONB NOT NULL, -- Flat list of timers
  plating_recommendations JSONB, -- Plating suggestions
  nutrition JSONB, -- Nutrition info
  content JSONB, -- Description, tips, variations
  constraints JSONB, -- Recipe constraints
  images JSONB, -- Hero image, gallery
  
  -- Tags for search/filtering
  tags TEXT[], -- ['dinner', 'quick', 'non-spicy']
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'generated', 'imported')),
  license TEXT DEFAULT 'internal' CHECK (license IN ('internal', 'creative_commons', 'proprietary'))
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Anyone can read published recipes
CREATE POLICY "Anyone can read published recipes"
  ON public.recipes
  FOR SELECT
  USING (status = 'published');

-- Only authenticated users can create recipes (for now, all users)
CREATE POLICY "Authenticated users can create recipes"
  ON public.recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own recipes
CREATE POLICY "Users can update own recipes"
  ON public.recipes
  FOR UPDATE
  USING (author_id = auth.uid()::TEXT);

-- Create indexes for performance
CREATE INDEX idx_recipes_author_id ON public.recipes(author_id);
CREATE INDEX idx_recipes_status ON public.recipes(status);
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX idx_recipes_spice_level ON public.recipes(spice_level);
CREATE INDEX idx_recipes_total_time ON public.recipes(total_time_estimate_sec);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Users can read own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON public.favorites(recipe_id);

-- ============================================
-- RECIPE NOTES TABLE
-- ============================================
CREATE TABLE public.recipe_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One note per user per recipe
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.recipe_notes ENABLE ROW LEVEL SECURITY;

-- Users can read their own notes
CREATE POLICY "Users can read own notes"
  ON public.recipe_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create notes
CREATE POLICY "Users can create notes"
  ON public.recipe_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their notes
CREATE POLICY "Users can update own notes"
  ON public.recipe_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their notes
CREATE POLICY "Users can delete own notes"
  ON public.recipe_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_recipe_notes_user_id ON public.recipe_notes(user_id);
CREATE INDEX idx_recipe_notes_recipe_id ON public.recipe_notes(recipe_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_notes_updated_at
  BEFORE UPDATE ON public.recipe_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Create a system user for imported recipes
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@livingcookbook.app',
  crypt('system-only-no-login', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, display_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@livingcookbook.app',
  'Living Cookbook'
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Living Cookbook database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run the seed data script to import sample recipes';
  RAISE NOTICE '2. Test authentication in your app';
  RAISE NOTICE '3. Start building the recipe library!';
END $$;
