import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, THEME_LABELS, ThemeName } from '../contexts/ThemeContext';
import SocialConnectionsModal from '@/components/SocialConnectionsModal';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [autoSyncGrocery, setAutoSyncGrocery] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  // Load auto-sync setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('autoSyncGrocery');
    if (saved !== null) {
      setAutoSyncGrocery(saved === 'true');
    }
  }, []);

  // Save auto-sync setting to localStorage
  const handleAutoSyncChange = (enabled: boolean) => {
    setAutoSyncGrocery(enabled);
    localStorage.setItem('autoSyncGrocery', enabled.toString());
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your Living Cookbook experience</p>
      </div>

      {/* Theme Section */}
      <section className="settings-section">
        <h2>Appearance</h2>
        <p className="section-description">
          Choose a theme that matches your mood
        </p>
        
        <div className="theme-grid">
          {(Object.keys(THEME_LABELS) as ThemeName[]).map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`theme-button ${theme === themeName ? 'active' : ''}`}
            >
              {THEME_LABELS[themeName]}
            </button>
          ))}
        </div>
      </section>

      {/* Social Connections Section */}
      <section className="settings-section">
        <h2>Connected Accounts</h2>
        <p className="section-description">
          Link your social media accounts to display them on your profile
        </p>
        
        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">Social Media Integration</div>
            <div className="setting-desc">
              Connect accounts via OAuth to show them on your profile. Supports Facebook, Instagram, Discord, Twitter/X, and more.
            </div>
          </div>
          <button 
            onClick={() => setShowSocialModal(true)}
            className="btn-manage"
          >
            Manage Accounts
          </button>
        </div>
      </section>

      {/* Grocery Lists Section */}
      <section className="settings-section">
        <h2>Grocery Lists</h2>
        <p className="section-description">
          Manage how grocery lists are updated
        </p>
        
        <div className="setting-card">
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={autoSyncGrocery}
              onChange={(e) => handleAutoSyncChange(e.target.checked)}
            />
            <div className="setting-info">
              <div className="setting-title">Auto-sync grocery lists</div>
              <div className="setting-desc">
                Automatically update grocery lists when you add or remove recipes from your meal plan
              </div>
            </div>
          </label>
          
          {autoSyncGrocery && (
            <div className="setting-status active">
              ✅ <strong>Active!</strong> Grocery lists will automatically update when you change your meal plan.
            </div>
          )}
        </div>
      </section>

      {/* Account Section */}
      <section className="settings-section">
        <h2>Account</h2>
        <p className="section-description">
          Manage your account settings
        </p>
        
        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">Email Notifications</div>
            <div className="setting-desc">
              Coming soon - Manage email preferences
            </div>
          </div>
          <span className="badge-coming-soon">Coming Soon</span>
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">Privacy Settings</div>
            <div className="setting-desc">
              Coming soon - Control who can see your content
            </div>
          </div>
          <span className="badge-coming-soon">Coming Soon</span>
        </div>
      </section>

      {/* Household Section */}
      <section className="settings-section">
        <h2>Household</h2>
        <p className="section-description">
          Manage your household and shared features
        </p>
        
        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">Household Management</div>
            <div className="setting-desc">
              Create or join a household to share meal plans, grocery lists, and recipes with family members
            </div>
          </div>
          <Link to="/household" className="btn-manage">
            Manage Household
          </Link>
        </div>
      </section>

      <SocialConnectionsModal 
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </div>
  );
};

export default Settings;
