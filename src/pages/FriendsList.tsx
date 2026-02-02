import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFriendsList, unfriendUser } from '@/features/friends/friendsService';
import './FriendsList.css';

const FriendsList: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const friendsList = await getFriendsList(user.id);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string, friendName: string) => {
    if (!confirm(`Remove ${friendName} from your friends?`)) return;

    try {
      await unfriendUser(friendId);
      loadFriends(); // Reload
    } catch (error) {
      console.error('Failed to unfriend:', error);
      alert('Failed to remove friend');
    }
  };

  if (isLoading) {
    return (
      <div className="friends-list-page">
        <h1>My Friends</h1>
        <div className="loading-state">
          <div className="spinner">⚙️</div>
          <p>Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-list-page">
      <div className="page-header">
        <div>
          <h1>My Friends</h1>
          <p>{friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/friend-requests" className="btn-view-requests">
          View Requests
        </Link>
      </div>

      {friends.length > 0 ? (
        <div className="friends-grid">
          {friends.map((friendship) => (
            <div key={friendship.id} className="friend-card">
              <Link
                to={`/profile/${friendship.friend_id}`}
                className="friend-link"
              >
                <div className="friend-avatar">
                  {friendship.friend?.avatar_url ? (
                    <img
                      src={friendship.friend.avatar_url}
                      alt={friendship.friend.display_name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {friendship.friend?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="friend-info">
                  <div className="friend-name">
                    {friendship.friend?.display_name || 'Unknown User'}
                  </div>
                  {friendship.friend?.bio && (
                    <div className="friend-bio">{friendship.friend.bio}</div>
                  )}
                </div>
              </Link>
              <button
                onClick={() =>
                  handleUnfriend(
                    friendship.friend_id,
                    friendship.friend?.display_name || 'this user'
                  )
                }
                className="btn-unfriend"
              >
                Unfriend
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h2>No friends yet</h2>
          <p>Start by adding some friends to see them here</p>
          <Link to="/people" className="btn-find-people">
            Find People
          </Link>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
