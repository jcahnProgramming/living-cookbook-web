import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  getPostComments,
  addComment,
  deleteComment,
  type CommentWithUser,
} from '@/features/comments/commentsService';
import './Comments.css';

interface Props {
  postId: string;
}

const Comments: React.FC<Props> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCommentCount, setLastCommentCount] = useState(0);

  useEffect(() => {
    loadComments();

    // Poll for new comments every 10 seconds
    // Only update UI if comment count changed
    const interval = setInterval(async () => {
      if (!user?.id) return;
      
      try {
        // Just check count first (cheaper query)
        const { count } = await supabase
          .from('meal_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('meal_post_id', postId);

        // Only reload if count changed
        if (count !== lastCommentCount) {
          loadComments();
        }
      } catch (error) {
        console.error('Failed to check comment count:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [postId, lastCommentCount]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
      setLastCommentCount(commentsData.length); // Track count
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !newComment.trim() || isSubmitting) return;

    const commentText = newComment.trim();
    setNewComment(''); // Clear immediately
    setIsSubmitting(true);

    // Optimistic update - add comment immediately
    const optimisticComment: CommentWithUser = {
      id: `temp-${Date.now()}`, // Temporary ID
      meal_post_id: postId,
      user_id: user.id,
      comment_text: commentText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: user.id,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
        avatar_url: user.user_metadata?.avatar_url,
      },
    };

    // Add to UI immediately
    setComments([...comments, optimisticComment]);

    try {
      // Actually save to database
      await addComment(user.id, postId, commentText);
      // Reload to get real ID and ensure sync
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Revert optimistic update on error
      setComments(comments);
      setNewComment(commentText); // Restore text
      alert('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Comments ({comments.length})</h3>
      </div>

      {/* Comment List */}
      {isLoading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <Link to={`/profile/${comment.user_id}`} className="comment-avatar">
                {comment.user.avatar_url ? (
                  <img src={comment.user.avatar_url} alt={comment.user.display_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {comment.user.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </Link>
              <div className="comment-content">
                <div className="comment-header">
                  <Link to={`/profile/${comment.user_id}`} className="comment-author">
                    {comment.user.display_name}
                  </Link>
                  <span className="comment-time">{formatTime(comment.created_at)}</span>
                </div>
                <div className="comment-text">{comment.comment_text}</div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="btn-delete-comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="comments-empty">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input-wrapper">
            <div className="comment-avatar-small">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="You" />
              ) : (
                <div className="avatar-placeholder">
                  {(user.user_metadata?.display_name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
              disabled={isSubmitting}
              className="comment-input"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="btn-submit-comment"
            >
              {isSubmitting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Sign in to comment</p>
        </div>
      )}
    </div>
  );
};

export default Comments;
