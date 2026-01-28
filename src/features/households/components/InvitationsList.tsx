import React from 'react';
import type { HouseholdInvitation } from '@/types';
import { getInvitationUrl } from '../householdService';
import './InvitationsList.css';

interface InvitationsListProps {
  invitations: HouseholdInvitation[];
  onCancelInvitation: (invitationId: string) => Promise<void>;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ invitations, onCancelInvitation }) => {
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const handleCancel = async (invitationId: string, email: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the invitation for ${email}?`
    );
    
    if (!confirmed) return;

    try {
      setCancelingId(invitationId);
      await onCancelInvitation(invitationId);
    } catch (err) {
      console.error('Failed to cancel invitation:', err);
      alert('Failed to cancel invitation. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };

  const handleCopyUrl = async (token: string) => {
    const url = getInvitationUrl(token);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDaysUntilExpiration = (expiresAt: string): number => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (invitations.length === 0) {
    return (
      <div className="invitations-list-empty">
        <p>No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="invitations-list">
      {invitations.map((invitation) => {
        const daysLeft = getDaysUntilExpiration(invitation.expires_at);
        const isExpiringSoon = daysLeft <= 2;

        return (
          <div key={invitation.id} className="invitation-card">
            <div className="invitation-icon">✉️</div>
            
            <div className="invitation-info">
              <div className="invitation-email">{invitation.email}</div>
              <div className="invitation-meta">
                Invited {new Date(invitation.created_at).toLocaleDateString()}
                {' · '}
                <span className={isExpiringSoon ? 'expiry-warning' : ''}>
                  Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="invitation-actions">
              <button
                className="btn-copy-small"
                onClick={() => handleCopyUrl(invitation.token)}
                title="Copy invitation link"
                disabled={cancelingId === invitation.id}
              >
                {copiedToken === invitation.token ? '✓' : '📋'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => handleCancel(invitation.id, invitation.email)}
                disabled={cancelingId === invitation.id}
                title="Cancel invitation"
              >
                {cancelingId === invitation.id ? '...' : '✕'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InvitationsList;
