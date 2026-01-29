import { supabase } from '@/lib/supabase';

export type ReactionType = 'thumbs_up' | 'thumbs_down' | 'love';

export interface RecipeReaction {
  id: string;
  recipe_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  updated_at: string;
}

export interface ReactionCounts {
  thumbs_up_count: number;
  thumbs_down_count: number;
  love_count: number;
  total_reactions: number;
}

/**
 * Get reaction counts for a recipe
 */
export async function getReactionCounts(recipeId: string): Promise<ReactionCounts> {
  try {
    const { data, error } = await supabase
      .from('recipe_reactions')
      .select('reaction_type')
      .eq('recipe_id', recipeId);

    if (error) throw error;

    const counts = {
      thumbs_up_count: 0,
      thumbs_down_count: 0,
      love_count: 0,
      total_reactions: data?.length || 0,
    };

    data?.forEach((reaction) => {
      if (reaction.reaction_type === 'thumbs_up') counts.thumbs_up_count++;
      if (reaction.reaction_type === 'thumbs_down') counts.thumbs_down_count++;
      if (reaction.reaction_type === 'love') counts.love_count++;
    });

    return counts;
  } catch (error) {
    console.error('Failed to get reaction counts:', error);
    return {
      thumbs_up_count: 0,
      thumbs_down_count: 0,
      love_count: 0,
      total_reactions: 0,
    };
  }
}

/**
 * Get user's reaction for a recipe
 */
export async function getUserReaction(
  recipeId: string,
  userId: string
): Promise<ReactionType | null> {
  try {
    const { data, error } = await supabase
      .from('recipe_reactions')
      .select('reaction_type')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.reaction_type || null;
  } catch (error) {
    console.error('Failed to get user reaction:', error);
    return null;
  }
}

/**
 * Add or update a reaction
 * If user already has a reaction, it updates it
 * If user clicks same reaction, it removes it
 */
export async function toggleReaction(
  recipeId: string,
  userId: string,
  reactionType: ReactionType
): Promise<void> {
  try {
    // Check if user already has a reaction
    const { data: existing, error: fetchError } = await supabase
      .from('recipe_reactions')
      .select('id, reaction_type')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existing) {
      // If clicking the same reaction, remove it
      if (existing.reaction_type === reactionType) {
        const { error: deleteError } = await supabase
          .from('recipe_reactions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;
      } else {
        // Update to new reaction type
        const { error: updateError } = await supabase
          .from('recipe_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      }
    } else {
      // Create new reaction
      const { error: insertError } = await supabase
        .from('recipe_reactions')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          reaction_type: reactionType,
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Failed to toggle reaction:', error);
    throw error;
  }
}

/**
 * Get all reactions with counts for a recipe
 */
export async function getRecipeReactions(recipeId: string, userId?: string) {
  try {
    const [counts, userReaction] = await Promise.all([
      getReactionCounts(recipeId),
      userId ? getUserReaction(recipeId, userId) : Promise.resolve(null),
    ]);

    return {
      counts,
      userReaction,
    };
  } catch (error) {
    console.error('Failed to get recipe reactions:', error);
    return {
      counts: {
        thumbs_up_count: 0,
        thumbs_down_count: 0,
        love_count: 0,
        total_reactions: 0,
      },
      userReaction: null,
    };
  }
}
