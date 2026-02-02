import { supabase } from '@/lib/supabase';

export interface PostLike {
  id: string;
  meal_post_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Check if user has liked a post
 */
export async function hasLikedPost(userId: string, postId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('meal_post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('meal_post_id', postId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check like status:', error);
    return false;
  }
}

/**
 * Like a post
 */
export async function likePost(userId: string, postId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_post_likes')
      .insert({
        user_id: userId,
        meal_post_id: postId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to like post:', error);
    throw error;
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(userId: string, postId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('meal_post_id', postId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unlike post:', error);
    throw error;
  }
}

/**
 * Toggle like status
 */
export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  try {
    const liked = await hasLikedPost(userId, postId);
    
    if (liked) {
      await unlikePost(userId, postId);
      return false;
    } else {
      await likePost(userId, postId);
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
    throw error;
  }
}

/**
 * Get like count for a post
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('meal_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('meal_post_id', postId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get like count:', error);
    return 0;
  }
}

/**
 * Get users who liked a post
 */
export async function getPostLikes(postId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('meal_post_likes')
      .select(`
        id,
        created_at,
        user_id
      `)
      .eq('meal_post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Get user info separately
    const userIds = data.map(like => like.user_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    // Combine likes with user info
    return data.map(like => ({
      ...like,
      user: users?.find(u => u.id === like.user_id),
    }));
  } catch (error) {
    console.error('Failed to get post likes:', error);
    return [];
  }
}

/**
 * Get posts liked by a user
 */
export async function getUserLikedPosts(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('meal_post_likes')
      .select('meal_post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(like => like.meal_post_id) || [];
  } catch (error) {
    console.error('Failed to get user liked posts:', error);
    return [];
  }
}
