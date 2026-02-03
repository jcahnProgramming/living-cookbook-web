import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  enableAllNotifications,
  disableAllNotifications,
  type NotificationPreferences,
} from '@/features/notifications/notificationPreferencesService';
import './NotificationSettings.css';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getNotificationPreferences(user.id);
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return;

    setIsSaving(true);
    setSuccessMessage('');

    try {
      await updateNotificationPreferences(user.id, updates);
      setPreferences({ ...preferences, ...updates });
      setSuccessMessage('Notification preferences updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableAll = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await enableAllNotifications(user.id);
      await loadPreferences();
      setSuccessMessage('All notifications enabled');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to enable all notifications:', error);
      alert('Failed to enable notifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableAll = async () => {
    if (!user?.id) return;
    if (!confirm('Disable all notifications? You will not receive any updates.')) return;

    setIsSaving(true);
    try {
      await disableAllNotifications(user.id);
      await loadPreferences();
      setSuccessMessage('All notifications disabled');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to disable all notifications:', error);
      alert('Failed to disable notifications');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    handleUpdate({ [key]: !preferences[key] });
  };

  if (isLoading) {
    return <div className="loading-state">Loading notification preferences...</div>;
  }

  if (!preferences) {
    return <div className="error-state">Failed to load notification preferences</div>;
  }

  return (
    <div className="notification-settings">
      <div className="settings-section">
        <h2>Notification Preferences</h2>
        <p className="section-description">
          Choose how and when you want to be notified
        </p>

        {successMessage && (
          <div className="success-message">✓ {successMessage}</div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={handleEnableAll} disabled={isSaving} className="btn-secondary">
            Enable All
          </button>
          <button onClick={handleDisableAll} disabled={isSaving} className="btn-secondary">
            Disable All
          </button>
        </div>

        {/* Email Settings */}
        <div className="setting-group">
          <h3>Email Notifications</h3>
          
          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Email Notifications</h4>
              <p>Receive notifications via email</p>
            </div>
            <div
              className={`toggle-switch ${preferences.email_enabled ? 'active' : ''}`}
              onClick={() => toggleNotification('email_enabled')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          {preferences.email_enabled && (
            <div className="sub-setting">
              <label htmlFor="email_frequency">Email Frequency</label>
              <select
                id="email_frequency"
                value={preferences.email_frequency}
                onChange={(e) =>
                  handleUpdate({ email_frequency: e.target.value as any })
                }
                disabled={isSaving}
                className="select-input"
              >
                <option value="instant">Instant (as they happen)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </select>
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div className="setting-group">
          <h3>Push Notifications</h3>
          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Push Notifications</h4>
              <p>Receive push notifications in your browser</p>
            </div>
            <div
              className={`toggle-switch ${preferences.push_enabled ? 'active' : ''}`}
              onClick={() => toggleNotification('push_enabled')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>

        {/* Social Notifications */}
        <div className="setting-group">
          <h3>Social Activity</h3>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Friend Requests</h4>
              <p>When someone sends you a friend request</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_friend_requests ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_friend_requests')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Friend Accepted</h4>
              <p>When someone accepts your friend request</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_friend_accepted ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_friend_accepted')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>New Followers</h4>
              <p>When someone follows you</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_new_follower ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_new_follower')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>

        {/* Post Activity */}
        <div className="setting-group">
          <h3>Post Activity</h3>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Post Likes</h4>
              <p>When someone likes your post</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_post_liked ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_post_liked')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Post Comments</h4>
              <p>When someone comments on your post</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_post_commented ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_post_commented')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Comment Replies</h4>
              <p>When someone replies to your comment</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_comment_reply ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_comment_reply')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Mentions</h4>
              <p>When someone mentions you</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_mentioned ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_mentioned')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Post Shared</h4>
              <p>When someone shares your post</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_post_shared ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_post_shared')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>

        {/* Product Updates */}
        <div className="setting-group">
          <h3>Product Updates</h3>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Weekly Recap</h4>
              <p>Weekly summary of your activity</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_weekly_recap ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_weekly_recap')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Product Updates</h4>
              <p>News about new features and improvements</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_product_updates ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_product_updates')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-label">
              <h4>Tips & Tricks</h4>
              <p>Helpful tips to get the most out of Living Cookbook</p>
            </div>
            <div
              className={`toggle-switch ${preferences.notify_tips_tricks ? 'active' : ''}`}
              onClick={() => toggleNotification('notify_tips_tricks')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
