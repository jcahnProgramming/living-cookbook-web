import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as householdService from '@/features/households/householdService';
import './AcceptInvitation.css';

const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load invitation details
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const invitationData = await householdService.getInvitationByToken(token!);
      
      if (!invitationData) {
        setError('This invitation is invalid or has expired');
        return;
      }

      setInvitation(invitationData);
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation. It may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to sign up/login with return URL
      navigate(`/auth/signup?redirect=/household/join/${token}`);
      return;
    }

    try {
      setIsAccepting(true);
      setError(null);
      await householdService.acceptInvitation(token!);
      setSuccess(true);
      
      // Redirect to household page after 2 seconds
      setTimeout(() => {
        navigate('/household');
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation. You may already be a member.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="accept-invitation-page">
        <div className="invitation-card">
          <div className="loading-spinner">👥</div>
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="accept-invitation-page">
        <div className="invitation-card invitation-card--success">
          <div className="invitation-icon">✅</div>
          <h1>Welcome to the Household!</h1>
          <p>You've successfully joined the household.</p>
          <p className="redirect-message">Redirecting to household page...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="accept-invitation-page">
        <div className="invitation-card invitation-card--error">
          <div className="invitation-icon">❌</div>
          <h1>Invalid Invitation</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invitation-page">
      <div className="invitation-card">
        <div className="invitation-icon">🏠</div>
        <h1>You're Invited!</h1>
        
        <div className="invitation-details">
          <p className="invitation-message">
            You've been invited to join a household on Living Cookbook
          </p>
          
          {invitation && (
            <div className="household-info">
              <div className="info-row">
                <div className="info-label">Household</div>
                <div className="info-value">{invitation.household?.name || 'Unknown Household'}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Invited by</div>
                <div className="info-value">{invitation.inviter?.display_name || invitation.email}</div>
              </div>
            </div>
          )}

          <p className="invitation-benefits">
            As a household member, you'll be able to:
          </p>
          <ul className="benefits-list">
            <li>📅 Share meal plans with your household</li>
            <li>🛒 Collaborate on grocery lists</li>
            <li>📚 Access household recipe collections</li>
            <li>👨‍🍳 Cook together, even when apart</li>
          </ul>
        </div>

        {!isAuthenticated && (
          <div className="auth-notice">
            <p>You'll need to create an account or sign in to join this household.</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="invitation-actions">
          <button
            onClick={handleAccept}
            className="btn-primary"
            disabled={isAccepting}
          >
            {isAccepting 
              ? 'Joining...' 
              : isAuthenticated 
                ? 'Accept Invitation' 
                : 'Sign Up & Join'
            }
          </button>
          <button
            onClick={handleDecline}
            className="btn-secondary"
            disabled={isAccepting}
          >
            Maybe Later
          </button>
        </div>

        {isAuthenticated && user && (
          <p className="signed-in-as">
            Signed in as {user.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
