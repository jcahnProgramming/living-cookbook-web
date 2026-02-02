import React, { useEffect, useState } from 'react';
import { getExploreFeed, type FeedPost } from '@/features/feed/feedService';
import FeedPostCard from '@/features/feed/components/FeedPostCard';
import './Feed.css';

const ExploreFeed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const feedPosts = await getExploreFeed(20, 0);
      setPosts(feedPosts);
      setHasMore(feedPosts.length === 20);
      setOffset(20);
    } catch (error) {
      console.error('Failed to load explore feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const morePosts = await getExploreFeed(20, offset);
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
          <h1>Explore</h1>
          <p>Discover what the community is cooking</p>
        </div>
        <div className="feed-loading">
          <div className="spinner">⚙️</div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="feed-page">
        <div className="feed-header">
          <h1>Explore</h1>
          <p>Discover what the community is cooking</p>
        </div>
        <div className="feed-empty">
          <div className="empty-icon">🔍</div>
          <h2>No posts yet</h2>
          <p>
            Be the first to share what you're cooking! Post a meal and inspire others.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Explore</h1>
        <p>Discover what the community is cooking</p>
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

export default ExploreFeed;
