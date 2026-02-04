import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/features/users/userProfileService';
import { getUserRecipes } from '@/features/recipes/userRecipeService';
import { getUserMealPosts, deleteMealPost, type MealPost } from '@/features/meals/mealPostsService';
import { isFollowing, toggleFollow, getFollowCounts } from '@/features/users/userFollowingService';
import { getPublicSocialConnections, SOCIAL_PROVIDERS } from '@/features/social/socialConnectionsService';
import FriendButton from '@/features/friends/components/FriendButton';
import RecipeCard from '@/features/recipes/components/RecipeCard';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [mealPosts, setMealPosts] = useState<MealPost[]>([]);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // If no userId in URL, use current user
  const profileUserId = userId || user?.id;
  const isOwnProfile = profileUserId === user?.id;

  useEffect(() => {
    if (profileUserId) {
      loadProfile();
    }
  }, [profileUserId]);

  const loadProfile = async () => {
    if (!profileUserId) return;

    try {
      setIsLoading(true);
      setError('');

      const [profileData, recipesData, postsData, counts, connections] = await Promise.all([
        getUserProfile(profileUserId),
        getUserRecipes(profileUserId),
        getUserMealPosts(profileUserId),
        getFollowCounts(profileUserId),
        getPublicSocialConnections(profileUserId),
      ]);

      if (!profileData) {
        setError('Profile not found or is private');
        return;
      }

      setProfile(profileData);
      setRecipes(recipesData || []);
      setMealPosts(postsData || []);
      setFollowerCount(counts.followers);
      setFollowingCount(counts.following);
      setSocialConnections(connections || []);

      // Check if current user is following this profile
      if (user?.id && !isOwnProfile) {
        const following = await isFollowing(user.id, profileUserId);
        setIsFollowingUser(following);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return;

    if (!window.confirm('Are you sure you want to delete this meal post? This cannot be undone.')) {
      return;
    }

    try {
      await deleteMealPost(postId, user.id);
      // Remove from local state
      setMealPosts(mealPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleToggleFollow = async () => {
    if (!user?.id || !profileUserId) return;

    setIsFollowLoading(true);
    try {
      const newStatus = await toggleFollow(user.id, profileUserId);
      setIsFollowingUser(newStatus);
      setFollowerCount(prev => newStatus ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner">👤</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Profile not found'}</h2>
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} />
          ) : (
            <div className="avatar-placeholder">
              {profile.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{profile.display_name || 'Anonymous User'}</h1>
          
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          {profile.location && (
            <div className="profile-location">
              📍 {profile.location}
            </div>
          )}

          {socialConnections.length > 0 && (
            <div className="profile-social-links">
              {socialConnections.map((connection) => {
                const provider = SOCIAL_PROVIDERS[connection.provider as keyof typeof SOCIAL_PROVIDERS];
                if (!provider) return null;

                return (
                  <a 
                    key={connection.provider}
                    href={connection.provider_profile_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                    title={`${provider.name}: ${connection.provider_username || connection.provider_display_name}`}
                    style={{ color: provider.color }}
                  >
                    {provider.icon}
                  </a>
                );
              })}
            </div>
          )}

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{followerCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.recipes_created || 0}</span>
              <span className="stat-label">Recipes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{mealPosts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="btn-edit-profile">
                ✏️ Edit Profile
              </Link>
            ) : (
              <>
                <FriendButton userId={profile.id} onStatusChange={loadProfile} />
                <button
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`btn-follow ${isFollowingUser ? 'following' : ''}`}
                >
                  {isFollowLoading ? '...' : isFollowingUser ? '✓ Following' : '+ Follow'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meal Posts */}
      {mealPosts.length > 0 && (
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              {isOwnProfile ? 'My Meal Posts' : `${profile.display_name}'s Meals`}
            </h2>
            {isOwnProfile && (
              <Link to="/meals/create" className="btn-create-post">
                📸 Share a Meal
              </Link>
            )}
          </div>
          <div className="meal-posts-grid">
            {mealPosts.map((post) => (
              <div key={post.id} className="meal-post-card">
                {/* Show recipe image if available, otherwise show meal photo */}
                {(() => {
                  // Debug: log the post to see structure
                  if (post.recipe) {
                    console.log('Recipe data:', post.recipe);
                    console.log('Recipe images:', post.recipe.images);
                  }
                  
                  // Try to get recipe image from various formats
                  let recipeImageUrl = null;
                  if (post.recipe?.images) {
                    if (Array.isArray(post.recipe.images) && post.recipe.images.length > 0) {
                      // Array format: [{ url: '...' }] or ['url']
                      const firstImage = post.recipe.images[0];
                      recipeImageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
                    } else if (post.recipe.images.hero?.url) {
                      // Nested format: { hero: { url: '...' } }
                      recipeImageUrl = post.recipe.images.hero.url;
                    }
                  }

                  if (recipeImageUrl) {
                    return (
                      <img 
                        src={recipeImageUrl} 
                        alt={post.recipe?.title || 'Meal'} 
                        className="meal-post-image"
                      />
                    );
                  } else if (post.photos && post.photos.length > 0) {
                    return (
                      <img 
                        src={post.photos[0].photo_url} 
                        alt="Meal" 
                        className="meal-post-image"
                      />
                    );
                  } else {
                    return (
                      <div className="meal-post-image meal-post-placeholder">
                        🍽️
                      </div>
                    );
                  }
                })()}
                {post.photos && post.photos.length > 1 && (
                  <div className="photo-count">
                    📷 {post.photos.length}
                  </div>
                )}
                <div className="meal-post-content">
                  {post.recipe && (
                    <Link to={`/recipe/${post.recipe_id}`} className="meal-post-recipe-link">
                      <h4>{post.recipe.title}</h4>
                    </Link>
                  )}
                  {post.caption && (
                    <div className="meal-post-caption">
                      {post.caption}
                    </div>
                  )}
                  <div className="meal-post-date">
                    {new Date(post.cooked_date).toLocaleDateString()}
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="btn-delete-post"
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {mealPosts.length === 0 && isOwnProfile && (
        <div className="profile-section">
          <div className="profile-empty">
            <div className="empty-icon">📸</div>
            <h3>No meal posts yet</h3>
            <p>Share photos of what you cook!</p>
            <Link to="/meals/create" className="btn-create">
              Share a Meal
            </Link>
          </div>
        </div>
      )}

      {/* User's Recipes */}
      {recipes.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">
            {isOwnProfile ? 'My Recipes' : `${profile.display_name}'s Recipes`}
          </h2>
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {recipes.length === 0 && isOwnProfile && (
        <div className="profile-empty">
          <div className="empty-icon">📝</div>
          <h3>No recipes yet</h3>
          <p>Start creating your own recipes!</p>
          <Link to="/recipe/create" className="btn-create">
            Create Recipe
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
