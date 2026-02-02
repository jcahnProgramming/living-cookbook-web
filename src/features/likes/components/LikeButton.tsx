import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toggleLike, hasLikedPost, getPostLikeCount } from '@/features/likes/likesService';
import './LikeButton.css';

interface Props {
  postId: string;
  initialLikeCount?: number;
  showCount?: boolean;
}

const LikeButton: React.FC<Props> = ({ postId, initialLikeCount = 0, showCount = true }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkLikeStatus();
      loadLikeCount();
    }

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadLikeCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, postId]);

  const checkLikeStatus = async () => {
    if (!user?.id) return;
    
    try {
      const liked = await hasLikedPost(user.id, postId);
      setIsLiked(liked);
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  };

  const loadLikeCount = async () => {
    try {
      const count = await getPostLikeCount(postId);
      setLikeCount(count);
    } catch (error) {
      console.error('Failed to load like count:', error);
    }
  };

  const handleLikeClick = async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      const newLikedState = await toggleLike(user.id, postId);
      setIsLiked(newLikedState);
      
      // Update count optimistically
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      // Animation completes
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setIsLiked(!isLiked);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="like-button-wrapper">
        <button className="like-button" disabled>
          <span className="heart-icon">🤍</span>
          {showCount && likeCount > 0 && (
            <span className="like-count">{likeCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="like-button-wrapper">
      <button
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'animating' : ''}`}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
      >
        <span className="heart-icon">
          {isLiked ? '❤️' : '🤍'}
        </span>
        {showCount && likeCount > 0 && (
          <span className="like-count">{likeCount}</span>
        )}
      </button>
    </div>
  );
};

export default LikeButton;
