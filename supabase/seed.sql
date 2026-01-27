-- Living Cookbook - Seed Data
-- Import sample recipes into database
-- Run this AFTER schema.sql has been executed

-- Insert the 5 sample recipes
-- Recipe 1: Honey Butter Salmon + Rice with Carrots
INSERT INTO public.recipes (
  id,
  title,
  subtitle,
  author_id,
  author_display_name,
  author_source,
  yield_servings,
  yield_units,
  difficulty,
  spice_level,
  dietary_flags,
  total_time_estimate_sec,
  prep_time_estimate_sec,
  cook_time_estimate_sec,
  active_time_estimate_sec,
  passive_time_estimate_sec,
  grocery_list,
  cooking_schedule,
  timers_feed,
  plating_recommendations,
  nutrition,
  tags
) VALUES (
  'recipe_honey_butter_salmon_rice_carrots_v1',
  'Honey Butter Salmon + Rice with Carrots',
  'Weeknight dinner, non-spicy, 30 minutes',
  '00000000-0000-0000-0000-000000000001',
  'Living Cookbook',
  'internal',
  3,
  'servings',
  'easy',
  'none',
  ARRAY['non-spicy'],
  1800,
  600,
  1200,
  900,
  900,
  '{"sections": [{"name": "Proteins", "items": [{"name": "Salmon fillets", "quantity": 1, "unit": "lb", "notes": "About 454 g"}]}, {"name": "Produce", "items": [{"name": "Carrots", "quantity": 3, "unit": "medium", "notes": "Slice into coins or sticks"}, {"name": "Garlic cloves", "quantity": 4, "unit": "cloves", "notes": "Use 3 for sauce; optional 1 for carrots"}, {"name": "Lemon", "quantity": 1, "unit": "whole", "notes": "Use 1/2 for sauce; rest optional"}, {"name": "Fresh parsley", "quantity": null, "unit": null, "notes": "Optional garnish"}]}, {"name": "Pantry / Condiments", "items": [{"name": "Long-grain white rice", "quantity": 1, "unit": "cup", "notes": "Dry"}, {"name": "Honey", "quantity": 3, "unit": "tbsp", "notes": null}, {"name": "Soy sauce", "quantity": 2, "unit": "tbsp", "notes": null}, {"name": "Butter", "quantity": 3, "unit": "tbsp", "notes": null}, {"name": "Olive oil", "quantity": 2, "unit": "tbsp", "notes": "1 tbsp salmon, 1 tbsp carrots"}, {"name": "Salt", "quantity": null, "unit": null, "notes": "To taste"}, {"name": "Black pepper", "quantity": null, "unit": null, "notes": "To taste"}]}]}'::jsonb,
  '{"schedule_style": "countdown", "steps": []}'::jsonb, -- Simplified for seed
  '{"items": []}'::jsonb, -- Simplified for seed
  '{"items": [{"title": "Plate and Enjoy", "text": "Place rice on plate, top with salmon, add carrots on the side. Garnish with parsley and lemon wedges."}]}'::jsonb,
  '{"per_serving": {"calories_kcal": null, "protein_g": null, "carbs_g": null}}'::jsonb,
  ARRAY['dinner', 'quick', 'non-spicy', 'weeknight', 'fish']
) ON CONFLICT (id) DO NOTHING;

-- Recipe 2: Simple Pasta with Marinara
INSERT INTO public.recipes (
  id,
  title,
  subtitle,
  author_id,
  author_display_name,
  author_source,
  yield_servings,
  yield_units,
  difficulty,
  spice_level,
  total_time_estimate_sec,
  grocery_list,
  cooking_schedule,
  timers_feed,
  tags
) VALUES (
  'recipe_simple_pasta_marinara_v1',
  'Simple Pasta with Marinara',
  'Classic comfort food, ready in 20 minutes',
  '00000000-0000-0000-0000-000000000001',
  'Living Cookbook',
  'internal',
  4,
  'servings',
  'easy',
  'none',
  1200,
  '{"sections": [{"name": "Pasta", "items": [{"name": "Pasta (any shape)", "quantity": 1, "unit": "lb", "notes": "Spaghetti, penne, or your favorite"}]}, {"name": "Sauce", "items": [{"name": "Marinara sauce", "quantity": 24, "unit": "oz", "notes": "Store-bought or homemade"}, {"name": "Garlic cloves", "quantity": 3, "unit": "cloves", "notes": "Minced"}]}, {"name": "Finishing", "items": [{"name": "Parmesan cheese", "quantity": null, "unit": null, "notes": "Grated, to taste"}, {"name": "Fresh basil", "quantity": null, "unit": null, "notes": "Optional"}]}]}'::jsonb,
  '{"schedule_style": "countdown", "steps": []}'::jsonb,
  '{"items": []}'::jsonb,
  ARRAY['dinner', 'quick', 'pasta', 'vegetarian', 'non-spicy']
) ON CONFLICT (id) DO NOTHING;

-- Recipe 3: Chocolate Chip Cookies
INSERT INTO public.recipes (
  id,
  title,
  subtitle,
  author_id,
  author_display_name,
  author_source,
  yield_servings,
  yield_units,
  difficulty,
  spice_level,
  total_time_estimate_sec,
  grocery_list,
  cooking_schedule,
  timers_feed,
  tags
) VALUES (
  'recipe_chocolate_chip_cookies_v1',
  'Classic Chocolate Chip Cookies',
  'Chewy, golden, perfect every time',
  '00000000-0000-0000-0000-000000000001',
  'Living Cookbook',
  'internal',
  24,
  'cookies',
  'easy',
  'none',
  1800,
  '{"sections": [{"name": "Wet Ingredients", "items": [{"name": "Butter", "quantity": 1, "unit": "cup", "notes": "Softened"}, {"name": "Brown sugar", "quantity": 0.75, "unit": "cup", "notes": "Packed"}, {"name": "Granulated sugar", "quantity": 0.75, "unit": "cup", "notes": null}, {"name": "Eggs", "quantity": 2, "unit": "large", "notes": "Room temperature"}, {"name": "Vanilla extract", "quantity": 2, "unit": "tsp", "notes": null}]}, {"name": "Dry Ingredients", "items": [{"name": "All-purpose flour", "quantity": 2.25, "unit": "cups", "notes": null}, {"name": "Baking soda", "quantity": 1, "unit": "tsp", "notes": null}, {"name": "Salt", "quantity": 1, "unit": "tsp", "notes": null}, {"name": "Chocolate chips", "quantity": 2, "unit": "cups", "notes": "Semi-sweet"}]}]}'::jsonb,
  '{"schedule_style": "countdown", "steps": []}'::jsonb,
  '{"items": []}'::jsonb,
  ARRAY['dessert', 'baking', 'cookies', 'non-spicy', 'kid-friendly', 'party']
) ON CONFLICT (id) DO NOTHING;

-- Recipe 4: Hot Toddy
INSERT INTO public.recipes (
  id,
  title,
  subtitle,
  author_id,
  author_display_name,
  author_source,
  yield_servings,
  yield_units,
  difficulty,
  spice_level,
  total_time_estimate_sec,
  grocery_list,
  cooking_schedule,
  timers_feed,
  tags
) VALUES (
  'recipe_hot_toddy_v1',
  'Hot Toddy',
  'Warm, soothing drink for cold nights',
  '00000000-0000-0000-0000-000000000001',
  'Living Cookbook',
  'internal',
  1,
  'drink',
  'easy',
  'none',
  300,
  '{"sections": [{"name": "Liquids", "items": [{"name": "Hot water", "quantity": 1, "unit": "cup", "notes": "Near-boiling"}, {"name": "Whiskey or bourbon", "quantity": 1.5, "unit": "oz", "notes": null}]}, {"name": "Flavor", "items": [{"name": "Honey", "quantity": 1, "unit": "tbsp", "notes": "More to taste"}, {"name": "Lemon juice", "quantity": 1, "unit": "tbsp", "notes": "Fresh preferred"}, {"name": "Cinnamon stick", "quantity": null, "unit": null, "notes": "Optional"}]}]}'::jsonb,
  '{"schedule_style": "countdown", "steps": []}'::jsonb,
  '{"items": []}'::jsonb,
  ARRAY['drink', 'warm', 'cocktail', 'non-spicy', 'winter', 'quick']
) ON CONFLICT (id) DO NOTHING;

-- Recipe 5: Breakfast Scrambled Eggs
INSERT INTO public.recipes (
  id,
  title,
  subtitle,
  author_id,
  author_display_name,
  author_source,
  yield_servings,
  yield_units,
  difficulty,
  spice_level,
  total_time_estimate_sec,
  grocery_list,
  cooking_schedule,
  timers_feed,
  tags
) VALUES (
  'recipe_breakfast_scrambled_eggs_v1',
  'Fluffy Scrambled Eggs',
  'Perfect breakfast in 10 minutes',
  '00000000-0000-0000-0000-000000000001',
  'Living Cookbook',
  'internal',
  2,
  'servings',
  'easy',
  'none',
  600,
  '{"sections": [{"name": "Main", "items": [{"name": "Eggs", "quantity": 4, "unit": "large", "notes": "Room temperature is best"}, {"name": "Butter", "quantity": 1, "unit": "tbsp", "notes": null}, {"name": "Salt", "quantity": null, "unit": null, "notes": "To taste"}, {"name": "Black pepper", "quantity": null, "unit": null, "notes": "To taste"}]}, {"name": "Optional Add-ins", "items": [{"name": "Milk or cream", "quantity": 2, "unit": "tbsp", "notes": "Optional"}, {"name": "Chives", "quantity": null, "unit": null, "notes": "Chopped, for garnish"}]}]}'::jsonb,
  '{"schedule_style": "countdown", "steps": []}'::jsonb,
  '{"items": []}'::jsonb,
  ARRAY['breakfast', 'quick', 'easy', 'non-spicy', 'vegetarian', 'protein']
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
DECLARE
  recipe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recipe_count FROM public.recipes;
  RAISE NOTICE 'Seed data imported successfully!';
  RAISE NOTICE 'Total recipes in database: %', recipe_count;
  RAISE NOTICE 'You can now browse recipes in the app!';
END $$;
