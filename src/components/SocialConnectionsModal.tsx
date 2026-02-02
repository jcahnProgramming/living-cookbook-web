import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserSocialConnections,
  disconnectSocialAccount,
  initiateOAuth,
  SOCIAL_PROVIDERS,
  type SocialConnection,
  type SocialProvider,
} from '@/features/social/socialConnectionsService';
import './SocialConnectionsModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SocialConnectionsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<SocialProvider | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadConnections();
    }
  }, [isOpen, user?.id]);

  const loadConnections = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getUserSocialConnections(user.id);
      setConnections(data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: SocialProvider) => {
    setConnectingProvider(provider);
    try {
      await initiateOAuth(provider);
      // OAuth will redirect, so we don't need to do anything else here
    } catch (error) {
      console.error('Failed to connect:', error);
      alert(`Failed to connect ${SOCIAL_PROVIDERS[provider].name}. Please try again.`);
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: SocialProvider) => {
    if (!user?.id) return;

    if (!window.confirm(`Disconnect ${SOCIAL_PROVIDERS[provider].name}?`)) {
      return;
    }

    try {
      await disconnectSocialAccount(user.id, provider);
      setConnections(connections.filter(c => c.provider !== provider));
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  const isConnected = (provider: SocialProvider) => {
    return connections.some(c => c.provider === provider);
  };

  const getConnection = (provider: SocialProvider) => {
    return connections.find(c => c.provider === provider);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connected Accounts</h2>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Connect your social accounts to display them on your profile and sync your content.
          </p>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner">⚙️</div>
              <p>Loading connections...</p>
            </div>
          ) : (
            <div className="providers-list">
              {Object.entries(SOCIAL_PROVIDERS).map(([key, config]) => {
                const provider = key as SocialProvider;
                const connected = isConnected(provider);
                const connection = getConnection(provider);
                const isConnecting = connectingProvider === provider;

                if (!config.enabled) {
                  return (
                    <div key={provider} className="provider-item disabled">
                      <div className="provider-info">
                        <div className="provider-icon" style={{ color: config.color }}>
                          {config.icon}
                        </div>
                        <div className="provider-details">
                          <div className="provider-name">{config.name}</div>
                          <div className="provider-status coming-soon">Coming Soon</div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={provider} className={`provider-item ${connected ? 'connected' : ''}`}>
                    <div className="provider-info">
                      <div className="provider-icon" style={{ color: config.color }}>
                        {config.icon}
                      </div>
                      <div className="provider-details">
                        <div className="provider-name">{config.name}</div>
                        {connected && connection ? (
                          <div className="provider-status">
                            {connection.provider_username && `@${connection.provider_username}`}
                            {!connection.provider_username && connection.provider_display_name}
                            {!connection.provider_username && !connection.provider_display_name && 'Connected'}
                          </div>
                        ) : (
                          <div className="provider-status not-connected">Not connected</div>
                        )}
                      </div>
                    </div>

                    <div className="provider-actions">
                      {connected ? (
                        <button
                          onClick={() => handleDisconnect(provider)}
                          className="btn-disconnect"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider)}
                          disabled={isConnecting}
                          className="btn-connect"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p className="modal-note">
            🔒 Your tokens are securely stored and never shared publicly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialConnectionsModal;
