import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/features/users/userProfileService';
import { getUserRecipes } from '@/features/recipes/userRecipeService';
import RecipeCard from '@/features/recipes/components/RecipeCard';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

      const [profileData, recipesData] = await Promise.all([
        getUserProfile(profileUserId),
        getUserRecipes(profileUserId),
      ]);

      if (!profileData) {
        setError('Profile not found or is private');
        return;
      }

      setProfile(profileData);
      setRecipes(recipesData || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
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

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{profile.recipes_created || 0}</span>
              <span className="stat-label">Recipes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.recipes_favorited || 0}</span>
              <span className="stat-label">Favorites</span>
            </div>
          </div>

          {isOwnProfile && (
            <Link to="/profile/edit" className="btn-edit-profile">
              ✏️ Edit Profile
            </Link>
          )}
        </div>
      </div>

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
