import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type NotificationWithActor,
} from '@/features/notifications/notificationsService';
import { acceptFriendRequest, rejectFriendRequest } from '@/features/friends/friendsService';
import './Notifications.css';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getNotifications(user.id, 50);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationWithActor) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on type
    if (notification.type === 'friend_request') {
      return; // Stay for inline actions
    } else if (notification.type === 'like' || notification.type === 'comment') {
      navigate('/feed');
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor_id}`);
    }
  };

  const handleAcceptFriend = async (notificationId: string, requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await markAsRead(notificationId);
      loadNotifications();
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
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
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

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="notifications-page">
        <h1>Notifications</h1>
        <div className="loading-state">
          <div className="spinner">⚙️</div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-mark-all-read">
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notification-filters">
        <button
          onClick={() => setFilter('all')}
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <Link
                to={`/profile/${notification.actor_id}`}
                className="notification-avatar"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.actor.avatar_url ? (
                  <img
                    src={notification.actor.avatar_url}
                    alt={notification.actor.display_name}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {notification.actor.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="notification-body">
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
                      ✓ Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectFriend(notification.id, notification.target_id!);
                      }}
                      className="btn-reject"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
                className="btn-delete-notification"
              >
                ✕
              </button>

              {!notification.is_read && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h2>No {filter === 'unread' ? 'unread' : ''} notifications</h2>
          <p>
            {filter === 'unread'
              ? "You're all caught up!"
              : "You'll see notifications here when people interact with your posts."}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
