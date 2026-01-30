import { supabase } from '@/lib/supabase';

export interface UserSocialStats {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

/**
 * Check if current user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check following status:', error);
    return false;
  }
}

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to follow user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unfollow user:', error);
    throw error;
  }
}

/**
 * Toggle follow status
 */
export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  try {
    const following = await isFollowing(followerId, followingId);
    
    if (following) {
      await unfollowUser(followerId, followingId);
      return false;
    } else {
      await followUser(followerId, followingId);
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error);
    throw error;
  }
}

/**
 * Get user's social stats
 */
export async function getUserSocialStats(userId: string): Promise<UserSocialStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_social_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user social stats:', error);
    return null;
  }
}

/**
 * Get followers list
 */
export async function getFollowers(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        follower_id,
        created_at,
        follower:users!user_follows_follower_id_fkey(id, display_name, avatar_url)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.follower) || [];
  } catch (error) {
    console.error('Failed to get followers:', error);
    return [];
  }
}

/**
 * Get following list
 */
export async function getFollowing(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        following_id,
        created_at,
        following:users!user_follows_following_id_fkey(id, display_name, avatar_url)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.following) || [];
  } catch (error) {
    console.error('Failed to get following:', error);
    return [];
  }
}

/**
 * Get follower/following counts
 */
export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  try {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ]);

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
    };
  } catch (error) {
    console.error('Failed to get follow counts:', error);
    return { followers: 0, following: 0 };
  }
}
