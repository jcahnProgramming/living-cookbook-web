import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type FeedPost } from '@/features/feed/feedService';
import LikeButton from '@/features/likes/components/LikeButton';
import Comments from '@/features/comments/components/Comments';
import './FeedPostCard.css';

interface Props {
  post: FeedPost;
}

const FeedPostCard: React.FC<Props> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <article className="feed-post-card">
      {/* User Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user.id}`} className="post-user">
          <div className="post-avatar">
            {post.user.avatar_url ? (
              <img src={post.user.avatar_url} alt={post.user.display_name} />
            ) : (
              <div className="avatar-placeholder">
                {post.user.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="post-user-info">
            <div className="post-user-name">{post.user.display_name}</div>
            <div className="post-date">{formatDate(post.created_at)}</div>
          </div>
        </Link>
      </div>

      {/* Photo Grid - Show meal photos or recipe image */}
      {post.photos && post.photos.length > 0 ? (
        <div className={`post-photos photos-${Math.min(post.photos.length, 3)}`}>
          {post.photos.slice(0, 3).map((photo, index) => (
            <div key={photo.id} className="post-photo">
              <img src={photo.photo_url} alt={`Photo ${index + 1}`} />
              {index === 2 && post.photos.length > 3 && (
                <div className="photo-overlay">
                  +{post.photos.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : post.recipe?.images ? (
        <div className="post-photos photos-1">
          <div className="post-photo">
            {(() => {
              let imageUrl = null;
              const images = post.recipe.images;
              
              if (Array.isArray(images) && images.length > 0) {
                const firstImage = images[0];
                imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
              } else if (typeof images === 'object' && images !== null && 'hero' in images) {
                imageUrl = (images as any).hero?.url;
              }
              
              return imageUrl ? (
                <img src={imageUrl} alt={post.recipe.title} />
              ) : null;
            })()}
          </div>
        </div>
      ) : null}

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <p>{post.caption}</p>
        </div>
      )}

      {/* Recipe Link */}
      {post.recipe && (
        <Link to={`/recipe/${post.recipe.id}`} className="post-recipe">
          <div className="recipe-icon">📖</div>
          <div className="recipe-info">
            <div className="recipe-label">Recipe</div>
            <div className="recipe-title">{post.recipe.title}</div>
          </div>
          <div className="recipe-arrow">→</div>
        </Link>
      )}

      {/* Interaction Bar */}
      <div className="post-interactions">
        <LikeButton postId={post.id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="btn-comments"
        >
          <span className="comment-icon">💬</span>
          <span className="comment-label">Comment</span>
        </button>
      </div>

      {/* Comments Section (Collapsible) */}
      {showComments && <Comments postId={post.id} />}

      {/* Cooked Date */}
      <div className="post-meta">
        <span className="meta-label">Cooked on:</span>
        <span className="meta-value">
          {new Date(post.cooked_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </article>
  );
};

export default FeedPostCard;
