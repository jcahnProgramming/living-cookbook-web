import React from 'react';
import './ContextSwitcher.css';

interface ContextSwitcherProps {
  mode: 'personal' | 'household';
  householdName?: string;
  onModeChange: (mode: 'personal' | 'household') => void;
  disabled?: boolean;
}

const ContextSwitcher: React.FC<ContextSwitcherProps> = ({
  mode,
  householdName,
  onModeChange,
  disabled = false,
}) => {
  if (!householdName) {
    // No household - only personal mode available
    return (
      <div className="context-switcher context-switcher--personal-only">
        <div className="context-badge">
          <span className="context-icon">👤</span>
          <span className="context-label">Personal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="context-switcher">
      <button
        className={`context-option ${mode === 'personal' ? 'context-option--active' : ''}`}
        onClick={() => onModeChange('personal')}
        disabled={disabled}
        aria-label="Switch to personal mode"
      >
        <span className="context-icon">👤</span>
        <span className="context-label">Personal</span>
      </button>

      <button
        className={`context-option ${mode === 'household' ? 'context-option--active' : ''}`}
        onClick={() => onModeChange('household')}
        disabled={disabled}
        aria-label={`Switch to household mode: ${householdName}`}
      >
        <span className="context-icon">🏠</span>
        <span className="context-label">{householdName}</span>
      </button>
    </div>
  );
};

export default ContextSwitcher;
