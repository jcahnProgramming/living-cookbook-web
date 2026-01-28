import React from 'react';
import type { HouseholdMember } from '@/types';
import './MembersList.css';

interface MembersListProps {
  members: HouseholdMember[];
  ownerId: string;
  onRemoveMember?: (userId: string) => Promise<void>;
}

const MembersList: React.FC<MembersListProps> = ({ members, ownerId, onRemoveMember }) => {
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleRemove = async (userId: string, displayName: string) => {
    if (!onRemoveMember) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to remove ${displayName || 'this member'} from the household?`
    );
    
    if (!confirmed) return;

    try {
      setRemovingId(userId);
      await onRemoveMember(userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="members-list-empty">
        <p>No members yet</p>
      </div>
    );
  }

  return (
    <div className="members-list">
      {members.map((member) => {
        const isOwner = member.user_id === ownerId;
        const displayName = member.user?.display_name || member.user?.email || 'Unknown User';
        const email = member.user?.email;

        return (
          <div key={member.id} className="member-card">
            <div className="member-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            <div className="member-info">
              <div className="member-name">
                {displayName}
                {isOwner && <span className="owner-badge">Owner</span>}
              </div>
              {email && email !== displayName && (
                <div className="member-email">{email}</div>
              )}
              <div className="member-meta">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </div>
            </div>

            {!isOwner && onRemoveMember && (
              <button
                className="btn-remove"
                onClick={() => handleRemove(member.user_id, displayName)}
                disabled={removingId === member.user_id}
                title="Remove member"
              >
                {removingId === member.user_id ? '...' : '✕'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MembersList;
