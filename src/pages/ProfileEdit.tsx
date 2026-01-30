import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, updateProfile, type UpdateProfileData } from '@/features/users/userProfileService';
import './ProfileEdit.css';

const ProfileEditPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getMyProfile();
      
      if (profile) {
        setDisplayName(profile.display_name || '');
        setBio(profile.bio || '');
        setLocation(profile.location || '');
        setVisibility(profile.profile_visibility || 'public');
        setWebsiteUrl((profile as any).website_url || '');
        setTwitterHandle((profile as any).twitter_handle || '');
        setInstagramHandle((profile as any).instagram_handle || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updates: UpdateProfileData = {
        display_name: displayName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        profile_visibility: visibility,
      };

      // Add social links if provided
      if (websiteUrl.trim() || twitterHandle.trim() || instagramHandle.trim()) {
        (updates as any).website_url = websiteUrl.trim() || null;
        (updates as any).twitter_handle = twitterHandle.trim() || null;
        (updates as any).instagram_handle = instagramHandle.trim() || null;
      }

      await updateProfile(user.id, updates);
      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-edit-page">
        <div className="profile-edit-loading">
          <div className="loading-spinner">⚙️</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="displayName">Display Name *</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <div className="char-count">
              {bio.length}/500 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div className="form-group">
            <label>Profile Visibility</label>
            <div className="visibility-options">
              <label className="visibility-option">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                />
                <div className="option-content">
                  <div className="option-title">🌍 Public</div>
                  <div className="option-desc">Anyone can see your profile</div>
                </div>
              </label>

              <label className="visibility-option">
                <input
                  type="radio"
                  name="visibility"
                  value="friends"
                  checked={visibility === 'friends'}
                  onChange={() => setVisibility('friends')}
                />
                <div className="option-content">
                  <div className="option-title">👥 Friends Only</div>
                  <div className="option-desc">Only your friends can see your profile</div>
                </div>
              </label>

              <label className="visibility-option">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                />
                <div className="option-content">
                  <div className="option-title">🔒 Private</div>
                  <div className="option-desc">Only you can see your profile</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Social Links (Optional)</label>
            <p className="form-hint">Connect your social media accounts</p>
            
            <div className="social-links-inputs">
              <div className="social-input">
                <span className="social-icon">🌐</span>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="social-input">
                <span className="social-icon">🐦</span>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@username (Twitter/X)"
                />
              </div>

              <div className="social-input">
                <span className="social-icon">📸</span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@username (Instagram)"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✓ Profile updated successfully! Redirecting...
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="btn-cancel"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditPage;
