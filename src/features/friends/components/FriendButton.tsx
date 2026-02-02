import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFriendshipStatus,
  sendFriendRequest,
  cancelFriendRequest,
  unfriendUser,
} from '@/features/friends/friendsService';
import './FriendButton.css';

interface Props {
  userId: string;
  onStatusChange?: () => void;
}

const FriendButton: React.FC<Props> = ({ userId, onStatusChange }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'none' | 'friends' | 'pending_sent' | 'pending_received'>('none');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id && userId !== user.id) {
      loadStatus();
    }
  }, [user?.id, userId]);

  const loadStatus = async () => {
    if (!user?.id) return;

    try {
      const friendshipStatus = await getFriendshipStatus(user.id, userId);
      setStatus(friendshipStatus);
    } catch (error) {
      console.error('Failed to load friendship status:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    try {
      await sendFriendRequest(user.id, userId);
      setStatus('pending_sent');
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    try {
      await cancelFriendRequest(user.id, userId);
      setStatus('none');
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!user?.id || isLoading) return;

    if (!confirm('Are you sure you want to unfriend this user?')) return;

    setIsLoading(true);
    try {
      await unfriendUser(userId);
      setStatus('none');
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to unfriend:', error);
      alert('Failed to unfriend user');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (!user || userId === user.id) {
    return null;
  }

  // Status-based button rendering
  if (status === 'friends') {
    return (
      <button
        onClick={handleUnfriend}
        disabled={isLoading}
        className="friend-button friends"
      >
        ✓ Friends
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={isLoading}
        className="friend-button pending-sent"
      >
        ⏳ Request Sent
      </button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="friend-button-group">
        <span className="pending-label">Wants to be friends</span>
      </div>
    );
  }

  // Default: Add Friend
  return (
    <button
      onClick={handleAddFriend}
      disabled={isLoading}
      className="friend-button add-friend"
    >
      + Add Friend
    </button>
  );
};

export default FriendButton;
