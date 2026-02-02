import { supabase } from '@/lib/supabase';

export type SocialProvider = 'facebook' | 'instagram' | 'discord' | 'twitter' | 'google' | 'apple' | 'threads';

export interface SocialConnection {
  id: string;
  user_id: string;
  provider: SocialProvider;
  provider_user_id: string;
  provider_username?: string;
  provider_display_name?: string;
  provider_avatar_url?: string;
  provider_profile_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderConfig {
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  comingSoon?: boolean;
}

export const SOCIAL_PROVIDERS: Record<SocialProvider, ProviderConfig> = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    enabled: true,
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    enabled: true,
  },
  threads: {
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    enabled: true,
  },
  discord: {
    name: 'Discord',
    icon: '💬',
    color: '#5865F2',
    enabled: true,
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    enabled: true,
  },
  google: {
    name: 'Google',
    icon: '🔍',
    color: '#4285F4',
    enabled: true,
  },
  apple: {
    name: 'Apple',
    icon: '',
    color: '#000000',
    enabled: false,
    comingSoon: true,
  },
};

/**
 * Get user's connected social accounts
 */
export async function getUserSocialConnections(userId: string): Promise<SocialConnection[]> {
  try {
    const { data, error } = await supabase
      .from('user_social_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get social connections:', error);
    return [];
  }
}

/**
 * Check if user has connected a specific provider
 */
export async function isProviderConnected(userId: string, provider: SocialProvider): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_social_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Failed to check provider connection:', error);
    return false;
  }
}

/**
 * Connect a social account (OAuth callback handler)
 */
export async function connectSocialAccount(
  userId: string,
  provider: SocialProvider,
  providerData: {
    provider_user_id: string;
    provider_username?: string;
    provider_display_name?: string;
    provider_avatar_url?: string;
    provider_profile_url?: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
    raw_user_meta_data?: any;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_social_connections')
      .upsert({
        user_id: userId,
        provider,
        ...providerData,
      }, {
        onConflict: 'user_id,provider',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to connect social account:', error);
    throw error;
  }
}

/**
 * Disconnect a social account
 */
export async function disconnectSocialAccount(userId: string, provider: SocialProvider): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_social_connections')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to disconnect social account:', error);
    throw error;
  }
}

/**
 * Initiate OAuth flow for a provider
 */
export async function initiateOAuth(provider: SocialProvider): Promise<void> {
  try {
    // Map our provider names to Supabase provider names
    const providerMap: Record<SocialProvider, string> = {
      facebook: 'facebook',
      instagram: 'facebook', // Instagram uses Facebook OAuth
      threads: 'facebook',   // Threads uses Facebook OAuth
      discord: 'discord',
      twitter: 'twitter',
      google: 'google',
      apple: 'apple',
    };

    const supabaseProvider = providerMap[provider];
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?connect=${provider}&returnTo=settings`,
        scopes: getProviderScopes(provider),
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    throw error;
  }
}

/**
 * Get required scopes for each provider
 */
function getProviderScopes(provider: SocialProvider): string {
  const scopes: Record<SocialProvider, string> = {
    facebook: 'public_profile,email',
    instagram: 'instagram_basic,public_profile',
    threads: 'threads_basic,public_profile',
    discord: 'identify',
    twitter: 'tweet.read,users.read',
    google: 'profile,email',
    apple: 'name,email',
  };

  return scopes[provider] || '';
}

/**
 * Get public social connections for a user (for display on profile)
 */
export async function getPublicSocialConnections(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_public_social_connections')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get public social connections:', error);
    return [];
  }
}
