/**
 * Development Authentication Helper
 * Creates anonymous users for testing household features
 * 
 * TODO: Replace with real authentication in production
 */

import { supabase } from './supabase';

/**
 * Sign in anonymously for development/testing
 * In production, this will be replaced with real email/password auth
 */
export async function signInAnonymously(): Promise<void> {
  // Check if already signed in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    console.log('Already authenticated as:', user.id);
    return;
  }

  // Sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }

  console.log('Signed in anonymously as:', data.user?.id);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}
