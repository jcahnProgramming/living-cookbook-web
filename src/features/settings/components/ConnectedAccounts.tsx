import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import './ConnectedAccounts.css';

interface SocialConnection {
  id: string;
  provider: string;
  provider_username: string | null;
  provider_avatar_url: string | null;
  created_at: string;
}

const ConnectedAccounts: React.FC = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConnections();
    syncExistingIdentities();
    
    // Listen for auth state changes (OAuth callbacks)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('Session user:', session.user);
          console.log('User identities:', session.user.identities);
          
          // Supabase stores OAuth connections in user.identities
          const identities = session.user.identities || [];
          
          for (const identity of identities) {
            console.log('Processing identity:', identity.provider);
            
            try {
              // Check if this connection already exists
              const { data: existing } = await supabase
                .from('user_social_connections')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('provider', identity.provider)
                .maybeSingle();
              
              if (existing) {
                console.log('Connection already exists for:', identity.provider);
                continue;
              }
              
              // Create new connection
              console.log('Creating connection for:', identity.provider);
              const { error: insertError } = await supabase
                .from('user_social_connections')
                .insert({
                  user_id: session.user.id,
                  provider: identity.provider,
                  provider_username: identity.identity_data?.username || 
                                    identity.identity_data?.full_name ||
                                    identity.identity_data?.name ||
                                    session.user.email?.split('@')[0] ||
                                    null,
                  provider_avatar_url: identity.identity_data?.avatar_url || 
                                      identity.identity_data?.picture ||
                                      null,
                });
              
              if (insertError) {
                console.error('Error inserting connection:', insertError);
              } else {
                console.log('Connection created successfully!');
              }
            } catch (error) {
              console.error('Failed to process identity:', error);
            }
          }
          
          // Reload connections after processing
          setTimeout(() => {
            console.log('Reloading connections...');
            loadConnections();
          }, 500);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [user?.id]);

  const loadConnections = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('Loading connections for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_social_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Connections query result:', { data, error });

      if (error) {
        console.error('Failed to load connections:', error);
        // If table doesn't exist or has different schema, return empty
        setConnections([]);
        return;
      }
      
      console.log('Setting connections:', data?.length || 0);
      setConnections(data || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const syncExistingIdentities = async () => {
    if (!user?.id) return;

    try {
      console.log('Syncing existing OAuth identities...');
      
      // Get current session to access identities
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No active session');
        return;
      }

      console.log('User identities:', session.user.identities);
      const identities = session.user.identities || [];

      for (const identity of identities) {
        // Skip 'email' provider (that's the email/password login)
        if (identity.provider === 'email') continue;

        console.log('Checking identity:', identity.provider);

        // Check if this connection already exists
        const { data: existing } = await supabase
          .from('user_social_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('provider', identity.provider)
          .maybeSingle();

        if (existing) {
          console.log('Connection already exists for:', identity.provider);
          continue;
        }

        // Create connection
        console.log('Creating connection for:', identity.provider);
        const { error: insertError } = await supabase
          .from('user_social_connections')
          .insert({
            user_id: user.id,
            provider: identity.provider,
            provider_username: identity.identity_data?.username || 
                              identity.identity_data?.full_name ||
                              identity.identity_data?.name ||
                              null,
            provider_avatar_url: identity.identity_data?.avatar_url || 
                                identity.identity_data?.picture ||
                                null,
          });

        if (insertError) {
          console.error('Error creating connection:', insertError);
        } else {
          console.log('Connection created for:', identity.provider);
        }
      }

      // Reload connections
      loadConnections();
    } catch (error) {
      console.error('Failed to sync identities:', error);
    }
  };

  const handleDisconnect = async (connectionId: string, provider: string) => {
    if (!confirm(`Disconnect ${provider}? You can reconnect anytime.`)) return;

    try {
      const { error } = await supabase
        .from('user_social_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(connections.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect account');
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      // Map our provider names to Supabase provider names
      const providerMap: { [key: string]: string } = {
        discord: 'discord',
        google: 'google',
        facebook: 'facebook',
        instagram: 'instagram',
        twitter: 'twitter',
        apple: 'apple',
      };

      const supabaseProvider = providerMap[provider];
      
      if (!supabaseProvider) {
        alert(`${provider} connection coming soon!`);
        return;
      }

      // Use Supabase OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as any,
        options: {
          redirectTo: `${window.location.origin}/settings`,
          scopes: provider === 'discord' 
            ? 'identify email' 
            : provider === 'google'
            ? 'profile email'
            : undefined,
        },
      });

      if (error) throw error;
      
      // Supabase will redirect automatically
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to initiate connection. Please try again.');
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: { [key: string]: string } = {
      discord: '💬',
      google: '🌐',
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      threads: '🧵',
      apple: '🍎',
    };
    return icons[provider] || '🔗';
  };

  const availableProviders = [
    { id: 'discord', name: 'Discord', available: true },
    { id: 'google', name: 'Google', available: true },
    { id: 'facebook', name: 'Facebook', available: true },
    { id: 'instagram', name: 'Instagram', available: false },
    { id: 'twitter', name: 'Twitter/X', available: false },
    { id: 'threads', name: 'Threads', available: false },
  ];

  if (isLoading) {
    return (
      <div className="settings-section">
        <h2>Connected Accounts</h2>
        <div className="loading-state">Loading connections...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h2>Connected Accounts</h2>
      <p className="section-description">
        Connect your social media accounts to share meal posts and find friends
      </p>

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <div className="connections-section">
          <h3>Your Connected Accounts</h3>
          <div className="connections-list">
            {connections.map((connection) => (
              <div key={connection.id} className="connection-item">
                <div className="connection-info">
                  <span className="connection-icon">
                    {getProviderIcon(connection.provider)}
                  </span>
                  <div className="connection-details">
                    <div className="connection-name">
                      {connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1)}
                    </div>
                    {connection.provider_username && (
                      <div className="connection-username">
                        @{connection.provider_username}
                      </div>
                    )}
                    <div className="connection-date">
                      Connected {new Date(connection.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(connection.id, connection.provider)}
                  className="btn-disconnect"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available to Connect */}
      <div className="connections-section">
        <h3>Available Connections</h3>
        <div className="available-connections">
          {availableProviders.map((provider) => {
            const isConnected = connections.some(c => c.provider === provider.id);
            
            return (
              <div key={provider.id} className="available-connection-item">
                <div className="connection-info">
                  <span className="connection-icon">
                    {getProviderIcon(provider.id)}
                  </span>
                  <div className="connection-details">
                    <div className="connection-name">{provider.name}</div>
                    {!provider.available && (
                      <div className="connection-status">Coming Soon</div>
                    )}
                  </div>
                </div>
                {isConnected ? (
                  <div className="connection-badge">✓ Connected</div>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={!provider.available}
                    className="btn-connect"
                  >
                    {provider.available ? 'Connect' : 'Coming Soon'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
