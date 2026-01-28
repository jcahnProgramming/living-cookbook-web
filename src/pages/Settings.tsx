import React from 'react';
import { useTheme, THEME_LABELS, ThemeName } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

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
        <p style={{ color: 'var(--color-text-secondary)' }}>
          More settings coming soon... 🚧
        </p>
      </section>
    </div>
  );
};

export default Settings;
