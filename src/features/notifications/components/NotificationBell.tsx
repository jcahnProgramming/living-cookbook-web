import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  type NotificationWithActor,
} from '@/features/notifications/notificationsService';
import { acceptFriendRequest, rejectFriendRequest } from '@/features/friends/friendsService';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadUnreadCount();

      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, () => {
        loadNotifications();
        loadUnreadCount();
      });

      return unsubscribe;
    }
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getNotifications(user.id, 20);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationWithActor) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        loadUnreadCount();
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on type
    if (notification.type === 'friend_request') {
      // Stay in dropdown for inline actions
      return;
    } else if (notification.type === 'like' || notification.type === 'comment') {
      setIsOpen(false);
      navigate('/feed'); // Could navigate to specific post
    } else if (notification.type === 'follow') {
      setIsOpen(false);
      navigate(`/profile/${notification.actor_id}`);
    }
  };

  const handleAcceptFriend = async (notificationId: string, requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await markAsRead(notificationId);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleRejectFriend = async (notificationId: string, requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await markAsRead(notificationId);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      await markAllAsRead(user.id);
      loadNotifications();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bell-button"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-mark-read">
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {isLoading ? (
              <div className="notifications-loading">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Link
                    to={`/profile/${notification.actor_id}`}
                    className="notification-avatar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notification.actor.avatar_url ? (
                      <img src={notification.actor.avatar_url} alt={notification.actor.display_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {notification.actor.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.created_at)}</div>

                    {notification.type === 'friend_request' && !notification.is_read && (
                      <div className="notification-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptFriend(notification.id, notification.target_id!);
                          }}
                          className="btn-accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectFriend(notification.id, notification.target_id!);
                          }}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {!notification.is_read && <div className="unread-indicator"></div>}
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <div className="empty-icon">🔕</div>
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          <Link to="/notifications" className="notifications-footer" onClick={() => setIsOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
