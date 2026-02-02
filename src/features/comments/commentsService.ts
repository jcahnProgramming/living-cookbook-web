import { supabase } from '@/lib/supabase';

export interface Comment {
  id: string;
  meal_post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<CommentWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('meal_post_comments')
      .select('*')
      .eq('meal_post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get user info
    const userIds = [...new Set(data.map(comment => comment.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    // Combine with user info
    return data.map(comment => ({
      ...comment,
      user: users?.find(u => u.id === comment.user_id) || {
        id: comment.user_id,
        display_name: 'Unknown User',
      },
    }));
  } catch (error) {
    console.error('Failed to get comments:', error);
    return [];
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(
  userId: string,
  postId: string,
  commentText: string
): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('meal_post_comments')
      .insert({
        user_id: userId,
        meal_post_id: postId,
        comment_text: commentText,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  commentText: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_post_comments')
      .update({ comment_text: commentText })
      .eq('id', commentId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('meal_post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('meal_post_id', postId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get comment count:', error);
    return 0;
  }
}
