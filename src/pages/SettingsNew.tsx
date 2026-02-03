import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AccountSettings from '@/features/settings/components/AccountSettings';
import PrivacySettings from '@/features/settings/components/PrivacySettings';
import NotificationSettings from '@/features/settings/components/NotificationSettings';
import ConnectedAccounts from '@/features/settings/components/ConnectedAccounts';
import BlockedUsers from '@/features/settings/components/BlockedUsers';
import './SettingsNew.css';

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'connections' | 'blocked' | 'data';

const SettingsNew: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  if (!user) return null;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account, privacy, and preferences</p>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          <button
            onClick={() => setActiveTab('account')}
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Account</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
          >
            <span className="tab-icon">🔒</span>
            <span className="tab-label">Privacy & Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          >
            <span className="tab-icon">🔔</span>
            <span className="tab-label">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`settings-tab ${activeTab === 'connections' ? 'active' : ''}`}
          >
            <span className="tab-icon">🔗</span>
            <span className="tab-label">Connected Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`settings-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          >
            <span className="tab-icon">🚫</span>
            <span className="tab-label">Blocked Users</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Data & Privacy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'connections' && <ConnectedAccounts />}
          {activeTab === 'blocked' && <BlockedUsers />}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data & Privacy</h2>
              <p className="section-description">
                Manage your data and privacy settings
              </p>

              <div className="info-card">
                <h3>Download Your Data</h3>
                <p>Request a copy of all your data from Living Cookbook.</p>
                <button 
                  className="btn-secondary"
                  onClick={() => alert('Data export feature coming soon! You will receive an email when your data is ready to download.')}
                >
                  Request Data Export
                </button>
              </div>

              <div className="info-card">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data.</p>
                <button 
                  className="btn-danger"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
                      alert('Account deletion feature coming soon. Please contact support to delete your account.');
                    }
                  }}
                >
                  Delete Account
                </button>
              </div>

              <div className="info-card">
                <h3>Privacy Policy</h3>
                <p>Read our privacy policy and terms of service.</p>
                <a 
                  href="https://livingcookbook.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-link"
                >
                  View Privacy Policy →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsNew;
