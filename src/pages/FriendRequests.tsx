import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from '@/features/friends/friendsService';
import './FriendRequests.css';

const FriendRequests: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const loadRequests = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [pending, sent] = await Promise.all([
        getPendingRequests(user.id),
        getSentRequests(user.id),
      ]);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      loadRequests(); // Reload
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      loadRequests(); // Reload
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject friend request');
    }
  };

  const handleCancel = async (receiverId: string) => {
    if (!user?.id) return;

    try {
      await cancelFriendRequest(user.id, receiverId);
      loadRequests(); // Reload
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request');
    }
  };

  if (isLoading) {
    return (
      <div className="friend-requests-page">
        <h1>Friend Requests</h1>
        <div className="loading-state">
          <div className="spinner">⚙️</div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friend-requests-page">
      <div className="page-header">
        <h1>Friend Requests</h1>
        <Link to="/friends" className="btn-view-friends">
          View Friends List
        </Link>
      </div>

      {/* Received Requests */}
      <section className="requests-section">
        <h2>Pending Requests ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 ? (
          <div className="requests-list">
            {pendingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <Link
                  to={`/profile/${request.requester_id}`}
                  className="request-user"
                >
                  <div className="user-avatar">
                    {request.requester?.avatar_url ? (
                      <img
                        src={request.requester.avatar_url}
                        alt={request.requester.display_name}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {request.requester?.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {request.requester?.display_name || 'Unknown User'}
                    </div>
                    <div className="request-time">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
                <div className="request-actions">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="btn-accept"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="btn-reject"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No pending friend requests</p>
          </div>
        )}
      </section>

      {/* Sent Requests */}
      <section className="requests-section">
        <h2>Sent Requests ({sentRequests.length})</h2>
        {sentRequests.length > 0 ? (
          <div className="requests-list">
            {sentRequests.map((request) => (
              <div key={request.id} className="request-card sent">
                <Link
                  to={`/profile/${request.receiver_id}`}
                  className="request-user"
                >
                  <div className="user-avatar">
                    {request.receiver?.avatar_url ? (
                      <img
                        src={request.receiver.avatar_url}
                        alt={request.receiver.display_name}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {request.receiver?.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {request.receiver?.display_name || 'Unknown User'}
                    </div>
                    <div className="request-time">
                      Sent {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleCancel(request.receiver_id)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No sent requests</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendRequests;
