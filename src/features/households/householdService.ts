/**
 * Household Service
 * Handles all household-related API calls to Supabase
 */

import { supabase } from '@/lib/supabase';
import type { 
  Household, 
  HouseholdInvitation,
  HouseholdWithMembers 
} from '@/types';

// ========================================
// GET OPERATIONS
// ========================================

/**
 * Get all households the current user belongs to
 */
export async function getUserHouseholds(): Promise<Household[]> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching households:', error);
    throw new Error('Failed to fetch households');
  }

  return data || [];
}

/**
 * Get a specific household by ID with members
 */
export async function getHousehold(householdId: string): Promise<HouseholdWithMembers | null> {
  // Fetch household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single();

  if (householdError) {
    console.error('Error fetching household:', householdError);
    throw new Error('Failed to fetch household');
  }

  if (!household) return null;

  // Fetch members with their user info
  const { data: memberRecords, error: membersError } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true });

  if (membersError) {
    console.error('Error fetching members:', membersError);
    throw new Error('Failed to fetch household members');
  }

  // Fetch user details separately from public.users
  const members = await Promise.all(
    (memberRecords || []).map(async (member) => {
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, display_name')
        .eq('id', member.user_id)
        .single();
      
      return {
        ...member,
        user: userData || { id: member.user_id, email: 'Unknown', display_name: 'Unknown User' },
      };
    })
  );

  // Fetch pending invitations with inviter info
  const { data: invitationRecords, error: invitationsError } = await supabase
    .from('household_invitations')
    .select('*')
    .eq('household_id', householdId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (invitationsError) {
    console.error('Error fetching invitations:', invitationsError);
    // Don't throw - invitations are optional
  }

  // Fetch inviter details separately
  const invitations = await Promise.all(
    (invitationRecords || []).map(async (invitation) => {
      const { data: inviterData } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', invitation.invited_by)
        .single();
      
      return {
        ...invitation,
        inviter: inviterData || { id: invitation.invited_by, display_name: 'Unknown' },
      };
    })
  );

  return {
    ...household,
    members: members || [],
    pending_invitations: invitations || [],
  };
}

/**
 * Check if user has a household
 */
export async function userHasHousehold(): Promise<boolean> {
  const households = await getUserHouseholds();
  return households.length > 0;
}

// ========================================
// CREATE OPERATIONS
// ========================================

/**
 * Create a new household
 * Automatically adds creator as owner member and starts 30-day trial
 */
export async function createHousehold(name: string): Promise<Household> {
  // Use getSession() which is more reliable than getUser()
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User must be authenticated to create a household');
  }

  const user = session.user;

  // Create household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name,
      owner_id: user.id,
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (householdError) {
    console.error('Error creating household:', householdError);
    throw new Error('Failed to create household');
  }

  // Add creator as owner member
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    console.error('Error adding owner as member:', memberError);
    // Try to clean up the household
    await supabase.from('households').delete().eq('id', household.id);
    throw new Error('Failed to set up household membership');
  }

  return household;
}

// ========================================
// UPDATE OPERATIONS
// ========================================

/**
 * Update household name
 */
export async function updateHouseholdName(
  householdId: string,
  name: string
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId)
    .select()
    .single();

  if (error) {
    console.error('Error updating household:', error);
    throw new Error('Failed to update household name');
  }

  return data;
}

/**
 * Update subscription status (for mock payment)
 */
export async function updateSubscriptionStatus(
  householdId: string,
  status: 'active' | 'cancelled' | 'expired'
): Promise<Household> {
  const updates: any = { subscription_status: status };

  // If activating, set subscription end date to 1 year from now
  if (status === 'active') {
    updates.subscription_ends_at = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  const { data, error } = await supabase
    .from('households')
    .update(updates)
    .eq('id', householdId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription status');
  }

  return data;
}

// ========================================
// DELETE OPERATIONS
// ========================================

/**
 * Delete a household (owner only)
 */
export async function deleteHousehold(householdId: string): Promise<void> {
  const { error } = await supabase
    .from('households')
    .delete()
    .eq('id', householdId);

  if (error) {
    console.error('Error deleting household:', error);
    throw new Error('Failed to delete household');
  }
}

/**
 * Leave a household (removes user from household_members)
 */
export async function leaveHousehold(householdId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error leaving household:', error);
    throw new Error('Failed to leave household');
  }
}

// ========================================
// MEMBER MANAGEMENT
// ========================================

/**
 * Remove a member from household (owner only)
 */
export async function removeMember(
  householdId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing member:', error);
    throw new Error('Failed to remove member');
  }
}

// ========================================
// INVITATION OPERATIONS
// ========================================

/**
 * Create an invitation
 */
export async function createInvitation(
  householdId: string,
  email: string
): Promise<HouseholdInvitation> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
    .from('household_invitations')
    .insert({
      household_id: householdId,
      email: email.toLowerCase().trim(),
      invited_by: session.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }

  return data;
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(
  token: string
): Promise<HouseholdInvitation | null> {
  // First, get the invitation without joins
  const { data: invitation, error } = await supabase
    .from('household_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching invitation:', error);
    throw new Error('Failed to fetch invitation');
  }

  if (!invitation) return null;

  // Fetch household details separately
  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', invitation.household_id)
    .single();

  // Fetch inviter details separately
  const { data: inviter } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('id', invitation.invited_by)
    .single();

  return {
    ...invitation,
    household: household || undefined,
    inviter: inviter || undefined,
  };
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<Household> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User must be authenticated to accept invitation');
  }

  const user = session.user;

  // Get invitation
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('household_members')
    .select('id')
    .eq('household_id', invitation.household_id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    throw new Error('You are already a member of this household');
  }

  // Add user as member
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: invitation.household_id,
      user_id: user.id,
      role: 'member',
      invited_by: invitation.invited_by,
    });

  if (memberError) {
    console.error('Error adding member:', memberError);
    throw new Error('Failed to join household');
  }

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('household_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token);

  if (updateError) {
    console.error('Error updating invitation:', updateError);
    // Don't throw - member was added successfully
  }

  // Return household
  if (!invitation.household) {
    throw new Error('Household not found');
  }

  return invitation.household as Household;
}

/**
 * Cancel/delete an invitation
 */
export async function deleteInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('household_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('Error deleting invitation:', error);
    throw new Error('Failed to delete invitation');
  }
}

/**
 * Get invitation URL for sharing
 */
export function getInvitationUrl(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/household/join/${token}`;
}
