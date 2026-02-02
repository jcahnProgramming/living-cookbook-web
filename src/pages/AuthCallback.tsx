import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { connectSocialAccount, type SocialProvider } from '@/features/social/socialConnectionsService';
import { supabase } from '@/lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting account...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const provider = searchParams.get('connect') as SocialProvider;
      
      if (!provider) {
        setStatus('error');
        setMessage('No provider specified');
        setTimeout(() => navigate('/settings'), 2000);
        return;
      }

      // Get the session from the URL hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Failed to get session');
      }

      if (!user?.id) {
        throw new Error('User not found');
      }

      // Extract provider data from session
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;
      const userMetadata = session.user.user_metadata;

      // Map provider-specific data
      const providerData = extractProviderData(provider, userMetadata);

      // Save to database
      await connectSocialAccount(user.id, provider, {
        ...providerData,
        access_token: providerToken || undefined,
        refresh_token: providerRefreshToken || undefined,
        raw_user_meta_data: userMetadata,
      });

      setStatus('success');
      setMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`);
      setTimeout(() => navigate('/settings'), 1500);
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('Failed to connect account. Please try again.');
      setTimeout(() => navigate('/settings'), 2000);
    }
  };

  const extractProviderData = (provider: SocialProvider, metadata: any) => {
    // Extract provider-specific data
    switch (provider) {
      case 'facebook':
      case 'instagram':
      case 'threads':
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.user_name || metadata.username,
          provider_display_name: metadata.name || metadata.full_name,
          provider_avatar_url: metadata.picture?.data?.url || metadata.avatar_url,
          provider_profile_url: `https://facebook.com/${metadata.user_name || metadata.id}`,
        };

      case 'discord':
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.global_name || metadata.username,
          provider_display_name: metadata.global_name || metadata.username,
          provider_avatar_url: metadata.avatar_url,
          provider_profile_url: `https://discord.com/users/${metadata.id}`,
        };

      case 'twitter':
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.user_name || metadata.screen_name,
          provider_display_name: metadata.name,
          provider_avatar_url: metadata.picture || metadata.profile_image_url,
          provider_profile_url: `https://twitter.com/${metadata.user_name || metadata.screen_name}`,
        };

      case 'google':
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.email?.split('@')[0],
          provider_display_name: metadata.name,
          provider_avatar_url: metadata.picture,
          provider_profile_url: `mailto:${metadata.email}`,
        };

      case 'apple':
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.email?.split('@')[0],
          provider_display_name: metadata.name || 'Apple User',
          provider_avatar_url: undefined,
          provider_profile_url: undefined,
        };

      default:
        return {
          provider_user_id: metadata.sub || metadata.id,
          provider_username: metadata.user_name || metadata.username,
          provider_display_name: metadata.name,
          provider_avatar_url: metadata.avatar_url || metadata.picture,
          provider_profile_url: undefined,
        };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        {status === 'loading' && '⚙️'}
        {status === 'success' && '✅'}
        {status === 'error' && '❌'}
      </div>
      <h2>{message}</h2>
      {status === 'loading' && <p>Please wait...</p>}
      {status === 'success' && <p>Redirecting...</p>}
      {status === 'error' && <p>Redirecting back...</p>}
    </div>
  );
};

export default AuthCallback;
