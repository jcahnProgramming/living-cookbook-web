import React, { useState } from 'react';
import { useHousehold, useHouseholdDetails } from '@/features/households/hooks/useHousehold';
import CreateHouseholdModal from '@/features/households/components/CreateHouseholdModal';
import InviteMemberModal from '@/features/households/components/InviteMemberModal';
import MembersList from '@/features/households/components/MembersList';
import InvitationsList from '@/features/households/components/InvitationsList';
import TrialBanner from '@/features/households/components/TrialBanner';
import './Household.css';

const HouseholdPage: React.FC = () => {
  const { household, isLoading, hasHousehold, trialStatus, createHousehold } = useHousehold();
  const { 
    household: householdDetails, 
    inviteMember, 
    removeMember, 
    cancelInvitation 
  } = useHouseholdDetails(household?.id || null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleCreateHousehold = async (name: string) => {
    await createHousehold(name);
  };

  if (isLoading) {
    return (
      <div className="household-page">
        <div className="household-loading">
          <div className="loading-spinner">👥</div>
          <p>Loading household...</p>
        </div>
      </div>
    );
  }

  if (!hasHousehold) {
    return (
      <div className="household-page">
        <div className="household-empty">
          <div className="empty-icon">👥</div>
          <h1>Welcome to Households</h1>
          <p>Create a household to share meal plans and grocery lists with your family or roommates.</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Household
          </button>
        </div>

        {showCreateModal && (
          <CreateHouseholdModal 
            onClose={() => setShowCreateModal(false)}
            onCreateHousehold={handleCreateHousehold}
          />
        )}
      </div>
    );
  }

  const isOwner = household?.owner_id === householdDetails?.owner_id;

  return (
    <div className="household-page">
      {/* Trial Banner */}
      {trialStatus && <TrialBanner trialStatus={trialStatus} />}

      {/* Header */}
      <div className="household-header">
        <div>
          <h1>{household?.name}</h1>
          <p className="household-subtitle">
            {householdDetails?.members.length || 0} member{householdDetails?.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isOwner && (
          <button 
            className="btn-primary"
            onClick={() => setShowInviteModal(true)}
          >
            ➕ Invite Member
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="household-section">
        <h2>Members</h2>
        <MembersList 
          members={householdDetails?.members || []}
          ownerId={household?.owner_id || ''}
          onRemoveMember={isOwner ? removeMember : undefined}
        />
      </div>

      {/* Pending Invitations */}
      {isOwner && householdDetails?.pending_invitations && householdDetails.pending_invitations.length > 0 && (
        <div className="household-section">
          <h2>Pending Invitations</h2>
          <InvitationsList 
            invitations={householdDetails.pending_invitations}
            onCancelInvitation={cancelInvitation}
          />
        </div>
      )}

      {/* Subscription Info */}
      <div className="household-section">
        <h2>Subscription</h2>
        <div className="subscription-card">
          <div className="subscription-status">
            <span className={`status-badge status-${household?.subscription_status}`}>
              {household?.subscription_status === 'trial' && '🎁 Free Trial'}
              {household?.subscription_status === 'active' && '✅ Active'}
              {household?.subscription_status === 'cancelled' && '⚠️ Cancelled'}
              {household?.subscription_status === 'expired' && '❌ Expired'}
            </span>
          </div>
          {household?.subscription_status === 'trial' && trialStatus && (
            <p className="subscription-detail">
              Your free trial ends on {new Date(household.trial_ends_at).toLocaleDateString()}
              {' '}({trialStatus.days_remaining} days remaining)
            </p>
          )}
          {household?.subscription_status === 'active' && household?.subscription_ends_at && (
            <p className="subscription-detail">
              Active until {new Date(household.subscription_ends_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && household && (
        <InviteMemberModal 
          householdId={household.id}
          householdName={household.name}
          onClose={() => setShowInviteModal(false)}
          onInvite={async (email) => {
            const result = await inviteMember(email);
            if (!result) throw new Error('Failed to create invitation');
            return result;
          }}
        />
      )}
    </div>
  );
};

export default HouseholdPage;
