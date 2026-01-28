import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeName, THEME_LABELS } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeSelect = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const getThemeIcon = (themeName: ThemeName): string => {
    switch (themeName) {
      case 'warm-bookish':
        return '📚';
      case 'cool-night':
        return '🌙';
      case 'winter':
        return '❄️';
      case 'spring':
        return '🌸';
      case 'summer':
        return '☀️';
      case 'fall':
        return '🍂';
      default:
        return '🎨';
    }
  };

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title="Change theme"
      >
        <span className="theme-switcher__icon">{getThemeIcon(theme)}</span>
        <span className="theme-switcher__label">{THEME_LABELS[theme]}</span>
      </button>

      {isOpen && (
        <div className="theme-switcher__dropdown">
          <div className="theme-switcher__dropdown-header">
            Choose Theme
          </div>
          {(Object.keys(THEME_LABELS) as ThemeName[]).map((themeName) => (
            <button
              key={themeName}
              className={`theme-switcher__option ${
                theme === themeName ? 'theme-switcher__option--active' : ''
              }`}
              onClick={() => handleThemeSelect(themeName)}
            >
              <span className="theme-switcher__option-icon">
                {getThemeIcon(themeName)}
              </span>
              <span className="theme-switcher__option-label">
                {THEME_LABELS[themeName]}
              </span>
              {theme === themeName && (
                <span className="theme-switcher__option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
