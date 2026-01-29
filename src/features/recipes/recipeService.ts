import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types';

/**
 * Recipe Service
 * Handles all recipe-related database operations
 */

export interface RecipeFilters {
  search?: string;
  tags?: string[];
  difficulty?: string;
  maxTime?: number;
  spiceLevel?: string;
}

/**
 * Fetch all recipes with optional filters
 */
export async function getRecipes(filters?: RecipeFilters) {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.maxTime) {
      query = query.lte('total_time_estimate_sec', filters.maxTime);
    }

    if (filters?.spiceLevel) {
      query = query.eq('spice_level', filters.spiceLevel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    return data as Recipe[];
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    throw error;
  }
}

/**
 * Fetch a single recipe by ID
 */
export async function getRecipeById(id: string) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients:recipe_ingredients(*),
        steps:recipe_steps(*),
        photos:recipe_photos(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }

    return data as Recipe;
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    throw error;
  }
}

/**
 * Get featured/random recipes
 */
export async function getFeaturedRecipes(limit: number = 3) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('status', 'published')
      .limit(limit);

    if (error) {
      console.error('Error fetching featured recipes:', error);
      throw error;
    }

    return data as Recipe[];
  } catch (error) {
    console.error('Failed to fetch featured recipes:', error);
    throw error;
  }
}

/**
 * Search recipes by text
 */
export async function searchRecipes(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('status', 'published')
      .or(
        `title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
      );

    if (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }

    return data as Recipe[];
  } catch (error) {
    console.error('Failed to search recipes:', error);
    throw error;
  }
}

/**
 * Format time in seconds to readable string
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'var(--color-success-500)';
    case 'medium':
      return 'var(--color-warning-500)';
    case 'hard':
      return 'var(--color-error-500)';
    default:
      return 'var(--color-neutral-500)';
  }
}

/**
 * Get spice level emoji
 */
export function getSpiceEmoji(spiceLevel: string): string {
  switch (spiceLevel) {
    case 'none':
      return '😊';
    case 'mild':
      return '🌶️';
    case 'medium':
      return '🌶️🌶️';
    case 'hot':
      return '🌶️🌶️🌶️';
    case 'extra_hot':
      return '🔥🔥🔥';
    default:
      return '';
  }
}
