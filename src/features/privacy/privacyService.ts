import { supabase } from '@/lib/supabase';

export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  post_default_visibility: 'public' | 'friends' | 'private';
  who_can_send_friend_requests: 'everyone' | 'friends_of_friends' | 'nobody';
  who_can_comment: 'everyone' | 'friends' | 'nobody';
  show_followers: 'everyone' | 'friends' | 'nobody';
  searchable: boolean;
  show_online_status: boolean;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason?: string;
  created_at: string;
  blocked_user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  content_type: 'user' | 'meal_post' | 'comment';
  content_id: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'false_info' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  created_at: string;
}

/**
 * Block a user
 */
export async function blockUser(
  blockerId: string,
  blockedId: string,
  reason?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason,
      });

    if (error) throw error;

    // Also unfollow and remove friendship
    await Promise.all([
      supabase
        .from('user_follows')
        .delete()
        .or(`follower_id.eq.${blockerId},follower_id.eq.${blockedId}`)
        .or(`following_id.eq.${blockerId},following_id.eq.${blockedId}`),
      
      supabase
        .from('friends')
        .delete()
        .or(`user_id.eq.${blockerId},user_id.eq.${blockedId}`)
        .or(`friend_id.eq.${blockerId},friend_id.eq.${blockedId}`),
    ]);
  } catch (error) {
    console.error('Failed to block user:', error);
    throw error;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unblock user:', error);
    throw error;
  }
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check block status:', error);
    return false;
  }
}

/**
 * Get blocked users
 */
export async function getBlockedUsers(userId: string): Promise<Block[]> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        blocker_id,
        blocked_id,
        reason,
        created_at
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get user info for blocked users
    const blockedIds = data.map(b => b.blocked_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', blockedIds);

    return data.map(block => ({
      ...block,
      blocked_user: users?.find(u => u.id === block.blocked_id),
    }));
  } catch (error) {
    console.error('Failed to get blocked users:', error);
    return [];
  }
}

/**
 * Mute a user
 */
export async function muteUser(muterId: string, mutedId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_mutes')
      .insert({
        muter_id: muterId,
        muted_id: mutedId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to mute user:', error);
    throw error;
  }
}

/**
 * Unmute a user
 */
export async function unmuteUser(muterId: string, mutedId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_mutes')
      .delete()
      .eq('muter_id', muterId)
      .eq('muted_id', mutedId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unmute user:', error);
    throw error;
  }
}

/**
 * Check if user is muted
 */
export async function isUserMuted(muterId: string, mutedId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_mutes')
      .select('id')
      .eq('muter_id', muterId)
      .eq('muted_id', mutedId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check mute status:', error);
    return false;
  }
}

/**
 * Get muted users
 */
export async function getMutedUsers(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_mutes')
      .select(`
        id,
        muter_id,
        muted_id,
        created_at
      `)
      .eq('muter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get user info
    const mutedIds = data.map(m => m.muted_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', mutedIds);

    return data.map(mute => ({
      ...mute,
      muted_user: users?.find(u => u.id === mute.muted_id),
    }));
  } catch (error) {
    console.error('Failed to get muted users:', error);
    return [];
  }
}

/**
 * Report content
 */
export async function reportContent(
  reporterId: string,
  contentType: 'user' | 'meal_post' | 'comment',
  contentId: string,
  reportedUserId: string | undefined,
  reason: Report['reason'],
  description?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        content_type: contentType,
        content_id: contentId,
        reason,
        description,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to report content:', error);
    throw error;
  }
}

/**
 * Get user's reports
 */
export async function getUserReports(userId: string): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('content_reports')
      .select('*')
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user reports:', error);
    return [];
  }
}

/**
 * Hide a post
 */
export async function hidePost(userId: string, postId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hidden_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to hide post:', error);
    throw error;
  }
}

/**
 * Unhide a post
 */
export async function unhidePost(userId: string, postId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hidden_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unhide post:', error);
    throw error;
  }
}

/**
 * Get hidden posts
 */
export async function getHiddenPosts(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('hidden_posts')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(h => h.post_id) || [];
  } catch (error) {
    console.error('Failed to get hidden posts:', error);
    return [];
  }
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        profile_visibility,
        post_default_visibility,
        who_can_send_friend_requests,
        who_can_comment,
        show_followers,
        searchable,
        show_online_status
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Privacy settings error:', error);
      // Return defaults if columns don't exist
      return {
        profile_visibility: 'public',
        post_default_visibility: 'public',
        who_can_send_friend_requests: 'everyone',
        who_can_comment: 'everyone',
        show_followers: 'everyone',
        searchable: true,
        show_online_status: true,
      };
    }
    
    // Ensure we have all fields with defaults
    return {
      profile_visibility: data?.profile_visibility || 'public',
      post_default_visibility: data?.post_default_visibility || 'public',
      who_can_send_friend_requests: data?.who_can_send_friend_requests || 'everyone',
      who_can_comment: data?.who_can_comment || 'everyone',
      show_followers: data?.show_followers || 'everyone',
      searchable: data?.searchable !== undefined ? data.searchable : true,
      show_online_status: data?.show_online_status !== undefined ? data.show_online_status : true,
    };
  } catch (error) {
    console.error('Failed to get privacy settings:', error);
    // Return defaults on error
    return {
      profile_visibility: 'public',
      post_default_visibility: 'public',
      who_can_send_friend_requests: 'everyone',
      who_can_comment: 'everyone',
      show_followers: 'everyone',
      searchable: true,
      show_online_status: true,
    };
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<void> {
  try {
    console.log('Updating privacy settings:', { userId, settings });
    
    const { error } = await supabase
      .from('users')
      .update(settings)
      .eq('id', userId);

    if (error) {
      console.error('Update privacy settings error:', error);
      throw error;
    }
    
    console.log('Privacy settings updated successfully');
  } catch (error) {
    console.error('Failed to update privacy settings:', error);
    throw error;
  }
}
