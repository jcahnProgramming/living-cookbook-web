import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 
  | 'warm-bookish' 
  | 'cool-night' 
  | 'winter' 
  | 'spring' 
  | 'summer' 
  | 'fall';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'living-cookbook-theme';

const THEMES: ThemeName[] = [
  'warm-bookish',
  'cool-night',
  'winter',
  'spring',
  'summer',
  'fall',
];

export const THEME_LABELS: Record<ThemeName, string> = {
  'warm-bookish': 'Warm Bookish',
  'cool-night': 'Cool Night',
  'winter': 'Winter Frost',
  'spring': 'Spring Blossom',
  'summer': 'Summer Sunshine',
  'fall': 'Autumn Harvest',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as ThemeName) || 'warm-bookish';
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  // Cycle to next theme
  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
