import { supabase } from '@/lib/supabase';

export interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

/**
 * Check if two users are friends
 */
export async function areFriends(userId: string, otherUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', otherUserId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check friendship:', error);
    return false;
  }
}

/**
 * Get friendship status between two users
 */
export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<'none' | 'friends' | 'pending_sent' | 'pending_received'> {
  try {
    // Check if already friends
    const friends = await areFriends(currentUserId, otherUserId);
    if (friends) return 'friends';

    // Check for pending request
    const { data, error } = await supabase
      .from('friend_requests')
      .select('requester_id, receiver_id, status')
      .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .or(`requester_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) throw error;

    if (data) {
      if (data.requester_id === currentUserId) return 'pending_sent';
      if (data.receiver_id === currentUserId) return 'pending_received';
    }

    return 'none';
  } catch (error) {
    console.error('Failed to get friendship status:', error);
    return 'none';
  }
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  requesterId: string,
  receiverId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send friend request:', error);
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('accept_friend_request', {
      request_id: requestId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    throw error;
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('reject_friend_request', {
      request_id: requestId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to reject friend request:', error);
    throw error;
  }
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(
  requesterId: string,
  receiverId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('requester_id', requesterId)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending');

    if (error) throw error;
  } catch (error) {
    console.error('Failed to cancel friend request:', error);
    throw error;
  }
}

/**
 * Unfriend a user
 */
export async function unfriendUser(targetUserId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('unfriend_user', {
      target_user_id: targetUserId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to unfriend user:', error);
    throw error;
  }
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingRequests(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get requester info
    const requesterIds = data.map(req => req.requester_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', requesterIds);

    // Combine with user info
    return data.map(request => ({
      ...request,
      requester: users?.find(u => u.id === request.requester_id),
    }));
  } catch (error) {
    console.error('Failed to get pending requests:', error);
    return [];
  }
}

/**
 * Get sent friend requests
 */
export async function getSentRequests(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get receiver info
    const receiverIds = data.map(req => req.receiver_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', receiverIds);

    // Combine with user info
    return data.map(request => ({
      ...request,
      receiver: users?.find(u => u.id === request.receiver_id),
    }));
  } catch (error) {
    console.error('Failed to get sent requests:', error);
    return [];
  }
}

/**
 * Get user's friends list
 */
export async function getFriendsList(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get friend user info
    const friendIds = data.map(f => f.friend_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, bio')
      .in('id', friendIds);

    // Combine with user info
    return data.map(friendship => ({
      ...friendship,
      friend: users?.find(u => u.id === friendship.friend_id),
    }));
  } catch (error) {
    console.error('Failed to get friends list:', error);
    return [];
  }
}

/**
 * Get friend count
 */
export async function getFriendCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get friend count:', error);
    return 0;
  }
}
