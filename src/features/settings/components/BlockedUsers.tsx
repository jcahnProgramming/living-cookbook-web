import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBlockedUsers, unblockUser, type Block } from '@/features/privacy/privacyService';
import './BlockedUsers.css';

const BlockedUsers: React.FC = () => {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlocked();
  }, [user?.id]);

  const loadBlocked = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getBlockedUsers(user.id);
      setBlocked(data);
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user?.id) return;
    if (!confirm('Unblock this user?')) return;

    try {
      await unblockUser(user.id, blockedId);
      setBlocked(blocked.filter(b => b.blocked_id !== blockedId));
    } catch (error) {
      console.error('Failed to unblock user:', error);
      alert('Failed to unblock user');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-section">
        <h2>Blocked Users</h2>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h2>Blocked Users</h2>
      <p className="section-description">
        Users you've blocked won't be able to see your profile, send you friend requests, or interact with your content.
      </p>

      {blocked.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚫</div>
          <h3>No Blocked Users</h3>
          <p>You haven't blocked anyone yet</p>
        </div>
      ) : (
        <div className="blocked-list">
          {blocked.map((block) => (
            <div key={block.id} className="blocked-item">
              <div className="blocked-user">
                {block.blocked_user?.avatar_url ? (
                  <img
                    src={block.blocked_user.avatar_url}
                    alt={block.blocked_user.display_name}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">👤</div>
                )}
                <div className="user-info">
                  <div className="user-name">{block.blocked_user?.display_name || 'Unknown User'}</div>
                  {block.reason && (
                    <div className="block-reason">Reason: {block.reason}</div>
                  )}
                  <div className="block-date">
                    Blocked {new Date(block.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(block.blocked_id)}
                className="btn-unblock"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
