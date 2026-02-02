import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/features/users/userProfileService';
import { getFollowingFeed, type FeedPost } from '@/features/feed/feedService';
import { getFollowCounts } from '@/features/users/userFollowingService';
import FeedPostCard from '@/features/feed/components/FeedPostCard';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  const loadDashboard = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [profileData, feedData, counts] = await Promise.all([
        getUserProfile(user.id),
        getFollowingFeed(user.id, 5, 0), // Show 5 recent posts
        getFollowCounts(user.id),
      ]);

      setProfile(profileData);
      setFeedPosts(feedData);
      setFollowerCount(counts.followers);
      setFollowingCount(counts.following);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="spinner">⚙️</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}! 👋</h1>
        <p>Your cooking dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h2>My Profile</h2>
          </div>
          <div className="profile-summary">
            <div className="profile-avatar-large">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.display_name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{profile?.display_name || 'User'}</h3>
              {profile?.bio && <p className="profile-bio-preview">{profile.bio}</p>}
            </div>
            <div className="profile-stats-grid">
              <div className="stat-item">
                <div className="stat-value">{followerCount}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{followingCount}</div>
                <div className="stat-label">Following</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{profile?.recipes_created || 0}</div>
                <div className="stat-label">Recipes</div>
              </div>
            </div>
            <Link to="/profile" className="btn-view-profile">
              View Full Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="actions-grid">
            <Link to="/meals/create" className="action-button">
              <div className="action-icon">📸</div>
              <div className="action-label">Share a Meal</div>
            </Link>
            <Link to="/people" className="action-button">
              <div className="action-icon">🔍</div>
              <div className="action-label">Find People</div>
            </Link>
            <Link to="/plan" className="action-button">
              <div className="action-icon">📅</div>
              <div className="action-label">Plan Week</div>
            </Link>
            <Link to="/recipe/create" className="action-button">
              <div className="action-icon">✏️</div>
              <div className="action-label">Create Recipe</div>
            </Link>
            <Link to="/library" className="action-button">
              <div className="action-icon">📚</div>
              <div className="action-label">Browse Library</div>
            </Link>
            <Link to="/explore" className="action-button">
              <div className="action-icon">🌍</div>
              <div className="action-label">Explore</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="dashboard-feed">
        <div className="feed-header">
          <h2>📰 Your Feed</h2>
          <Link to="/feed" className="btn-view-all">
            View All Posts →
          </Link>
        </div>

        {feedPosts.length > 0 ? (
          <div className="feed-preview">
            {feedPosts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
            <div className="feed-footer">
              <Link to="/feed" className="btn-load-feed">
                See More Posts
              </Link>
            </div>
          </div>
        ) : (
          <div className="feed-empty">
            <div className="empty-icon">📰</div>
            <h3>Your feed is empty</h3>
            <p>Follow some cooks to see their meal posts here</p>
            <div className="empty-actions">
              <Link to="/people" className="btn-primary">
                Find People to Follow
              </Link>
              <Link to="/explore" className="btn-secondary">
                Explore Posts
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
