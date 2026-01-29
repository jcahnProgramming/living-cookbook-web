import React, { useState, useEffect } from 'react';
import { useTheme, THEME_LABELS, ThemeName } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [autoSyncGrocery, setAutoSyncGrocery] = useState(false);

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
    <div style={{ padding: '2rem' }}>
      <h1>Settings</h1>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Theme</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Choose a theme that matches your mood
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '1rem',
          maxWidth: '800px'
        }}>
          {(Object.keys(THEME_LABELS) as ThemeName[]).map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              style={{
                padding: '1rem',
                border: theme === themeName ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-base)',
                background: theme === themeName ? 'var(--color-primary-100)' : 'var(--color-surface)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: theme === themeName ? 600 : 400,
                transition: 'all 150ms ease'
              }}
            >
              {THEME_LABELS[themeName]}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Grocery Lists</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Manage how grocery lists are updated
        </p>
        
        <div style={{
          padding: '1.5rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--color-surface)',
          maxWidth: '600px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoSyncGrocery}
              onChange={(e) => handleAutoSyncChange(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }}
            />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                Auto-sync grocery lists
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)' 
              }}>
                Automatically update grocery lists when you add or remove recipes from your meal plan
              </div>
            </div>
          </label>
          
          {autoSyncGrocery && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--color-success-50)',
              border: '1px solid var(--color-success-200)',
              borderRadius: 'var(--radius-base)',
              fontSize: '0.875rem',
              color: 'var(--color-success-800)'
            }}>
              ✅ <strong>Active!</strong> Grocery lists will automatically update when you change your meal plan.
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          More settings coming soon... 🚧
        </p>
      </section>
    </div>
  );
};

export default Settings;
