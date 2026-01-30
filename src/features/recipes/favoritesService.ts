import { supabase } from '@/lib/supabase';

/**
 * Check if a recipe is favorited by the user
 */
export async function isFavorited(recipeId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipe_favorites')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check favorite status:', error);
    return false;
  }
}

/**
 * Add a recipe to favorites
 */
export async function addToFavorites(recipeId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('recipe_favorites')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to add to favorites:', error);
    throw error;
  }
}

/**
 * Remove a recipe from favorites
 */
export async function removeFromFavorites(recipeId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('recipe_favorites')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
    throw error;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(recipeId: string, userId: string): Promise<boolean> {
  try {
    const favorited = await isFavorited(recipeId, userId);
    
    if (favorited) {
      await removeFromFavorites(recipeId, userId);
      return false;
    } else {
      await addToFavorites(recipeId, userId);
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw error;
  }
}

/**
 * Get all favorited recipes for a user
 */
export async function getFavoriteRecipes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('recipe_favorites')
      .select(`
        recipe_id,
        created_at,
        recipe:recipes (
          *,
          ingredients:recipe_ingredients(*),
          steps:recipe_steps(*),
          photos:recipe_photos(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Extract just the recipes
    return data?.map(item => item.recipe) || [];
  } catch (error) {
    console.error('Failed to get favorite recipes:', error);
    throw error;
  }
}

/**
 * Get favorite count for a recipe
 */
export async function getFavoriteCount(recipeId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('recipe_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get favorite count:', error);
    return 0;
  }
}
