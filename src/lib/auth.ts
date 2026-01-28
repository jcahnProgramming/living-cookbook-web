/**
 * Authentication Service
 * Handles user authentication with Supabase
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ========================================
// SIGN UP
// ========================================

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<User> {
  const { email, password, displayName } = data;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  if (!authData.user) {
    throw new Error('Sign up failed - no user returned');
  }

  return authData.user;
}

// ========================================
// SIGN IN
// ========================================

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<User> {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!authData.user) {
    throw new Error('Sign in failed - no user returned');
  }

  return authData.user;
}

// ========================================
// SIGN OUT
// ========================================

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

// ========================================
// PASSWORD RESET
// ========================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

// ========================================
// USER SESSION
// ========================================

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ========================================
// AUTH STATE LISTENER
// ========================================

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

// ========================================
// ERROR HANDLING
// ========================================

/**
 * Format auth error for display
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unknown error occurred';

  // Supabase error messages
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (message.includes('email not confirmed')) {
      return 'Please check your email to confirm your account';
    }
    if (message.includes('user already registered')) {
      return 'An account with this email already exists';
    }
    if (message.includes('password should be at least')) {
      return 'Password must be at least 6 characters';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address';
    }
    
    return error.message;
  }

  return 'An error occurred. Please try again.';
}
