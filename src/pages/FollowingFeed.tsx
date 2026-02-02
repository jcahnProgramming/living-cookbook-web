import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFollowingFeed, type FeedPost } from '@/features/feed/feedService';
import FeedPostCard from '@/features/feed/components/FeedPostCard';
import './Feed.css';

const FollowingFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [user?.id]);

  const loadFeed = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const feedPosts = await getFollowingFeed(user.id, 20, 0);
      setPosts(feedPosts);
      setHasMore(feedPosts.length === 20);
      setOffset(20);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!user?.id || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const morePosts = await getFollowingFeed(user.id, 20, offset);
      setPosts([...posts, ...morePosts]);
      setHasMore(morePosts.length === 20);
      setOffset(offset + 20);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="feed-page">
        <div className="feed-header">
          <h1>Following</h1>
          <p>See what people you follow are cooking</p>
        </div>
        <div className="feed-loading">
          <div className="spinner">⚙️</div>
          <p>Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="feed-page">
        <div className="feed-header">
          <h1>Following</h1>
          <p>See what people you follow are cooking</p>
        </div>
        <div className="feed-empty">
          <div className="empty-icon">👥</div>
          <h2>Your feed is empty</h2>
          <p>
            Follow some cooks to see their meal posts here. Start by exploring people who share your taste!
          </p>
          <div className="empty-actions">
            <Link to="/people" className="btn-primary">
              Find People to Follow
            </Link>
            <Link to="/explore" className="btn-secondary">
              Explore Public Posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Following</h1>
        <p>See what people you follow are cooking</p>
      </div>

      <div className="feed-container">
        <div className="feed-posts">
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>

        {hasMore && (
          <div className="feed-load-more">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="btn-load-more"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingFeed;
