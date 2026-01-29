import { supabase } from '@/lib/supabase';

export interface RecipeIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  section?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeEstimateSec?: number;
}

export interface CreateRecipeData {
  title: string;
  subtitle?: string;
  description?: string;
  servings: number;
  prepTimeSec?: number;
  cookTimeSec?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  spiceLevel?: 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot';
  dietaryFlags?: string[];
  tags?: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  photos?: string[];
  platingNotes?: string;
}

/**
 * Create a new user recipe
 */
export async function createUserRecipe(userId: string, data: CreateRecipeData) {
  try {
    // Generate a unique recipe ID
    const recipeId = `user_${userId.substring(0, 8)}_${Date.now()}`;

    // Calculate total time
    const totalTimeSec = (data.prepTimeSec || 0) + (data.cookTimeSec || 0);

    // Create the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: recipeId,
        user_id: userId,
        is_user_created: true,
        title: data.title,
        subtitle: data.subtitle || null,
        author_id: userId,
        author_display_name: 'Personal Recipe',
        author_source: 'user_generated',
        yield_servings: data.servings,
        difficulty: data.difficulty || 'medium',
        spice_level: data.spiceLevel || 'none',
        dietary_flags: data.dietaryFlags || [],
        tags: data.tags || [],
        total_time_estimate_sec: totalTimeSec,
        prep_time_estimate_sec: data.prepTimeSec,
        cook_time_estimate_sec: data.cookTimeSec,
        plating_notes: data.platingNotes || null,
        status: 'published',
        // Minimal JSONB fields for user recipes
        grocery_list: { items: [] },
        cooking_schedule: { steps: [] },
        timers_feed: [],
        content: {
          description: data.description || '',
        },
        images: {},
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert ingredients
    if (data.ingredients.length > 0) {
      const ingredients = data.ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        name: ing.name,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        notes: ing.notes || null,
        section: ing.section || 'Ingredients',
        sort_order: index,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;
    }

    // Insert steps
    if (data.steps.length > 0) {
      const steps = data.steps.map((step) => ({
        recipe_id: recipeId,
        step_number: step.stepNumber,
        instruction: step.instruction,
        time_estimate_sec: step.timeEstimateSec || null,
      }));

      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(steps);

      if (stepsError) throw stepsError;
    }

    // Insert photos
    if (data.photos && data.photos.length > 0) {
      const photos = data.photos.map((url, index) => ({
        recipe_id: recipeId,
        url,
        is_primary: index === 0,
        sort_order: index,
      }));

      const { error: photosError } = await supabase
        .from('recipe_photos')
        .insert(photos);

      if (photosError) throw photosError;
    }

    return recipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
}

/**
 * Get user's recipes
 */
export async function getUserRecipes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients:recipe_ingredients(*),
        steps:recipe_steps(*),
        photos:recipe_photos(*)
      `)
      .eq('user_id', userId)
      .eq('is_user_created', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user recipes:', error);
    throw error;
  }
}

/**
 * Get a single recipe with all details
 */
export async function getRecipeDetails(recipeId: string) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients:recipe_ingredients(*)
,
        steps:recipe_steps(*),
        photos:recipe_photos(*)
      `)
      .eq('id', recipeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get recipe details:', error);
    throw error;
  }
}

/**
 * Delete a user recipe
 */
export async function deleteUserRecipe(recipeId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId)
      .eq('is_user_created', true);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    throw error;
  }
}
