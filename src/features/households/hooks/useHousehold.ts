/**
 * useHousehold Hook
 * Manages household state and provides easy access to household operations
 */

import { useState, useEffect } from 'react';
import type { Household, HouseholdWithMembers, TrialStatus } from '@/types';
import * as householdService from '../householdService';

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's household on mount
  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const households = await householdService.getUserHouseholds();
      setHousehold(households.length > 0 ? households[0] : null);
    } catch (err) {
      console.error('Error loading household:', err);
      setError('Failed to load household');
    } finally {
      setIsLoading(false);
    }
  };

  const createHousehold = async (name: string) => {
    try {
      setError(null);
      const newHousehold = await householdService.createHousehold(name);
      setHousehold(newHousehold);
      return newHousehold;
    } catch (err) {
      console.error('Error creating household:', err);
      setError('Failed to create household');
      throw err;
    }
  };

  const updateName = async (name: string) => {
    if (!household) return;
    
    try {
      setError(null);
      const updated = await householdService.updateHouseholdName(household.id, name);
      setHousehold(updated);
      return updated;
    } catch (err) {
      console.error('Error updating household:', err);
      setError('Failed to update household name');
      throw err;
    }
  };

  const deleteHousehold = async () => {
    if (!household) return;
    
    try {
      setError(null);
      await householdService.deleteHousehold(household.id);
      setHousehold(null);
    } catch (err) {
      console.error('Error deleting household:', err);
      setError('Failed to delete household');
      throw err;
    }
  };

  const leaveHousehold = async () => {
    if (!household) return;
    
    try {
      setError(null);
      await householdService.leaveHousehold(household.id);
      setHousehold(null);
    } catch (err) {
      console.error('Error leaving household:', err);
      setError('Failed to leave household');
      throw err;
    }
  };

  const upgradeSubscription = async () => {
    if (!household) return;
    
    try {
      setError(null);
      const updated = await householdService.updateSubscriptionStatus(household.id, 'active');
      setHousehold(updated);
      return updated;
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      setError('Failed to upgrade subscription');
      throw err;
    }
  };

  // Calculate trial status
  const getTrialStatus = (): TrialStatus | null => {
    if (!household || household.subscription_status !== 'trial') return null;

    const now = new Date();
    const trialEnd = new Date(household.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;

    return {
      is_trial: true,
      days_remaining: Math.max(0, daysRemaining),
      ends_at: household.trial_ends_at,
      is_expired: isExpired,
      needs_upgrade: daysRemaining <= 7, // Show upgrade prompt at 7 days
    };
  };

  return {
    household,
    isLoading,
    error,
    hasHousehold: !!household,
    trialStatus: getTrialStatus(),
    refresh: loadHousehold,
    createHousehold,
    updateName,
    deleteHousehold,
    leaveHousehold,
    upgradeSubscription,
  };
}

/**
 * useHouseholdDetails Hook
 * Fetches full household details including members and invitations
 */
export function useHouseholdDetails(householdId: string | null) {
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      setIsLoading(false);
      return;
    }

    loadDetails();
  }, [householdId]);

  const loadDetails = async () => {
    if (!householdId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await householdService.getHousehold(householdId);
      setHousehold(data);
    } catch (err) {
      console.error('Error loading household details:', err);
      setError('Failed to load household details');
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async (email: string) => {
    if (!householdId) return;

    try {
      setError(null);
      const invitation = await householdService.createInvitation(householdId, email);
      await loadDetails(); // Refresh to show new invitation
      return invitation;
    } catch (err) {
      console.error('Error inviting member:', err);
      setError('Failed to send invitation');
      throw err;
    }
  };

  const removeMember = async (userId: string) => {
    if (!householdId) return;

    try {
      setError(null);
      await householdService.removeMember(householdId, userId);
      await loadDetails(); // Refresh to update member list
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
      throw err;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!householdId) return;

    try {
      setError(null);
      await householdService.deleteInvitation(invitationId);
      await loadDetails(); // Refresh to update invitations list
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setError('Failed to cancel invitation');
      throw err;
    }
  };

  return {
    household,
    isLoading,
    error,
    refresh: loadDetails,
    inviteMember,
    removeMember,
    cancelInvitation,
  };
}
