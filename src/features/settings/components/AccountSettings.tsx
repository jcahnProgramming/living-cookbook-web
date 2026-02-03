import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="settings-section">
      <h2>Account Settings</h2>
      <p className="section-description">
        Manage your account information and preferences
      </p>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
        />
        <p className="form-hint">
          Contact support to change your email address
        </p>
      </div>

      <div className="form-group">
        <label>Account Created</label>
        <input
          type="text"
          value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
          disabled
        />
      </div>

      <div className="info-card">
        <h3>Change Password</h3>
        <p>Update your password to keep your account secure</p>
        <button className="btn-secondary">Change Password</button>
      </div>

      <div className="info-card">
        <h3>Two-Factor Authentication</h3>
        <p>Add an extra layer of security to your account</p>
        <button className="btn-secondary">Enable 2FA</button>
      </div>
    </div>
  );
};

export default AccountSettings;
