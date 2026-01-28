import React, { useState } from 'react';
import { getInvitationUrl } from '../householdService';
import type { HouseholdInvitation } from '@/types';
import './CreateHouseholdModal.css';

interface InviteMemberModalProps {
  householdId: string;
  householdName: string;
  onClose: () => void;
  onInvite: (email: string) => Promise<HouseholdInvitation>;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  householdName,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const invitation = await onInvite(email.trim());
      const url = getInvitationUrl(invitation.token);
      setInvitationUrl(url);
      setEmail(''); // Clear for next invitation
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!invitationUrl) return;
    
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    if (invitationUrl) {
      // Invitation was created, refresh the page data
      window.location.reload();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Member</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {!invitationUrl ? (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="modal-description">
                Invite someone to join <strong>{householdName}</strong>. 
                They'll be able to view and edit shared meal plans and grocery lists.
              </p>

              <div className="form-group">
                <label htmlFor="member-email">Email Address</label>
                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  autoFocus
                />
                <span className="form-hint">We'll generate an invitation link you can share</span>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? 'Creating Invitation...' : 'Create Invitation'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="modal-body">
              <div className="success-message">
                ✅ Invitation created successfully!
              </div>

              <p className="modal-description" style={{ marginTop: 'var(--spacing-4)' }}>
                Share this link with the person you want to invite. 
                The invitation will expire in 7 days.
              </p>

              <div className="invitation-url-container">
                <input
                  type="text"
                  value={invitationUrl}
                  readOnly
                  className="invitation-url-input"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={handleCopyUrl}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>

              <p className="form-hint">
                You can also invite another member or close this dialog.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setInvitationUrl(null)}
              >
                Invite Another
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMemberModal;
