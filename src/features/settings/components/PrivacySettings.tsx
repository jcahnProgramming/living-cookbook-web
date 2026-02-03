import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPrivacySettings,
  updatePrivacySettings,
  type PrivacySettings as PrivacySettingsType,
} from '@/features/privacy/privacyService';
import './PrivacySettings.css';

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('Loading privacy settings for user:', user.id);
      const data = await getPrivacySettings(user.id);
      console.log('Loaded privacy settings:', data);
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<PrivacySettingsType>) => {
    if (!user?.id || !settings) return;

    console.log('handleUpdate called with:', updates);
    setIsSaving(true);
    setSuccessMessage('');

    try {
      await updatePrivacySettings(user.id, updates);
      setSettings({ ...settings, ...updates });
      setSuccessMessage('Privacy settings updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      alert('Failed to update settings. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-state">Loading privacy settings...</div>;
  }

  if (!settings) {
    return <div className="error-state">Failed to load privacy settings</div>;
  }

  return (
    <div className="privacy-settings">
      <div className="settings-section">
        <h2>Privacy & Safety</h2>
        <p className="section-description">
          Control who can see your content and interact with you
        </p>

        {successMessage && (
          <div className="success-message">✓ {successMessage}</div>
        )}

        {/* Profile Visibility */}
        <div className="setting-group">
          <h3>Profile Visibility</h3>
          <p className="setting-description">Choose who can see your profile</p>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="profile_visibility"
                value="public"
                checked={settings.profile_visibility === 'public'}
                onChange={() => handleUpdate({ profile_visibility: 'public' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Public</strong>
                <span>Anyone can see your profile</span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="profile_visibility"
                value="friends"
                checked={settings.profile_visibility === 'friends'}
                onChange={() => handleUpdate({ profile_visibility: 'friends' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Friends Only</strong>
                <span>Only your friends can see your profile</span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="profile_visibility"
                value="private"
                checked={settings.profile_visibility === 'private'}
                onChange={() => handleUpdate({ profile_visibility: 'private' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Private</strong>
                <span>Only you can see your profile</span>
              </div>
            </label>
          </div>
        </div>

        {/* Post Default Visibility */}
        <div className="setting-group">
          <h3>Default Post Visibility</h3>
          <p className="setting-description">Default privacy for new posts</p>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="post_visibility"
                value="public"
                checked={settings.post_default_visibility === 'public'}
                onChange={() => handleUpdate({ post_default_visibility: 'public' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Public</strong>
                <span>Anyone can see your posts</span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="post_visibility"
                value="friends"
                checked={settings.post_default_visibility === 'friends'}
                onChange={() => handleUpdate({ post_default_visibility: 'friends' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Friends Only</strong>
                <span>Only friends can see your posts</span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="post_visibility"
                value="private"
                checked={settings.post_default_visibility === 'private'}
                onChange={() => handleUpdate({ post_default_visibility: 'private' })}
                disabled={isSaving}
              />
              <div className="radio-content">
                <strong>Private</strong>
                <span>Only you can see your posts</span>
              </div>
            </label>
          </div>
        </div>

        {/* Who Can Send Friend Requests */}
        <div className="setting-group">
          <h3>Friend Requests</h3>
          <p className="setting-description">Who can send you friend requests</p>
          <select
            value={settings.who_can_send_friend_requests}
            onChange={(e) =>
              handleUpdate({
                who_can_send_friend_requests: e.target.value as any,
              })
            }
            disabled={isSaving}
            className="select-input"
          >
            <option value="everyone">Everyone</option>
            <option value="friends_of_friends">Friends of Friends</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Who Can Comment */}
        <div className="setting-group">
          <h3>Comments</h3>
          <p className="setting-description">Who can comment on your posts</p>
          <select
            value={settings.who_can_comment}
            onChange={(e) =>
              handleUpdate({ who_can_comment: e.target.value as any })
            }
            disabled={isSaving}
            className="select-input"
          >
            <option value="everyone">Everyone</option>
            <option value="friends">Friends Only</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Show Followers */}
        <div className="setting-group">
          <h3>Follower Visibility</h3>
          <p className="setting-description">Who can see your followers and following lists</p>
          <select
            value={settings.show_followers}
            onChange={(e) =>
              handleUpdate({ show_followers: e.target.value as any })
            }
            disabled={isSaving}
            className="select-input"
          >
            <option value="everyone">Everyone</option>
            <option value="friends">Friends Only</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Toggle Settings */}
        <div className="setting-group">
          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Appear in Search</h4>
              <p>Allow others to find you through search</p>
            </div>
            <div
              className={`toggle-switch ${settings.searchable ? 'active' : ''}`}
              onClick={() => handleUpdate({ searchable: !settings.searchable })}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Show Online Status</h4>
              <p>Let others see when you're online</p>
            </div>
            <div
              className={`toggle-switch ${settings.show_online_status ? 'active' : ''}`}
              onClick={() =>
                handleUpdate({ show_online_status: !settings.show_online_status })
              }
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
